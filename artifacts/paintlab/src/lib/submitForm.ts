export interface FormPayload {
  form_name: string;
  form_source: string;
  facility_type?: string;
  [key: string]: unknown;
}

export type SubmitResult = { ok: true } | { ok: false; error: string };

export async function submitForm(payload: FormPayload): Promise<SubmitResult> {
  const { form_name, facility_type } = payload;

  const subject = facility_type
    ? `PAINTLAB | ${form_name} | ${facility_type}`
    : `PAINTLAB | ${form_name}`;

  try {
    const res = await fetch("/api/contact/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        subject,
        page_url: window.location.href,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
      }),
    });
    const data = await res.json() as { ok: boolean; error?: string };
    return data.ok ? { ok: true } : { ok: false, error: data.error ?? "Submission failed" };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}
