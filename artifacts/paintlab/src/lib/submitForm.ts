export interface FormPayload {
  form_name: string;
  form_source: string;
  facility_type?: string;
  [key: string]: unknown;
}

export type SubmitResult = { ok: true } | { ok: false; error: string };

export async function submitForm(payload: FormPayload): Promise<SubmitResult> {
  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as string | undefined;

  if (!accessKey) {
    return { ok: false, error: "Form service not configured." };
  }

  const { form_name, facility_type } = payload;

  const subject = facility_type
    ? `PAINTLAB | ${form_name} | ${facility_type}`
    : `PAINTLAB | ${form_name}`;

  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        subject,
        botcheck: "",
        ...payload,
        page_url: window.location.href,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
      }),
    });

    const data = await res.json() as { success: boolean; message?: string };

    if (data.success) {
      return { ok: true };
    }

    return { ok: false, error: data.message ?? "Submission failed. Please try again." };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}
