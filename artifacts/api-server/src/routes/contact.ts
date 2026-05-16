import { Router, type Request, type Response } from "express";
import { logger } from "../lib/logger";

const router = Router();

router.post("/submit", async (req: Request, res: Response) => {
  const accessKey = process.env["WEB3FORMS_ACCESS_KEY"];

  if (!accessKey) {
    logger.warn("WEB3FORMS_ACCESS_KEY not configured");
    return res.status(500).json({ ok: false, error: "Form service not configured" });
  }

  const { subject, form_name, form_source, facility_type, page_url, timestamp, user_agent, ...fields } = req.body as Record<string, unknown>;

  const payload = {
    access_key: accessKey,
    subject: subject ?? `PAINTLAB | Form Submission`,
    form_name,
    form_source,
    facility_type,
    page_url,
    timestamp,
    user_agent,
    botcheck: "",
    ...fields,
  };

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json() as { success: boolean; message?: string };

    if (data.success) {
      logger.info({ subject, form_name }, "Form submitted via Web3Forms");
      return res.json({ ok: true });
    }

    logger.warn({ data }, "Web3Forms returned failure");
    return res.status(400).json({ ok: false, error: data.message ?? "Submission failed" });
  } catch (err) {
    logger.error({ err }, "Web3Forms request failed");
    return res.status(500).json({ ok: false, error: "Submission failed. Please try again." });
  }
});

export default router;
