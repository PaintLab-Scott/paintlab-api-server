import { Router, type Request, type Response } from "express";
import nodemailer from "nodemailer";
import { logger } from "../lib/logger";

const router = Router();

router.post("/send-quote", async (req: Request, res: Response) => {
  const { form, breakdown, facilityType, selectedTier } = req.body;

  const smtpUser = process.env["SMTP_USER"];
  const smtpPass = process.env["SMTP_PASS"];
  const smtpHost = process.env["SMTP_HOST"] ?? "smtp.gmail.com";
  const smtpPort = Number(process.env["SMTP_PORT"] ?? "587");

  if (!smtpUser || !smtpPass) {
    logger.warn("SMTP credentials not configured — skipping email send");
    return res.json({ ok: true, note: "Email not sent: SMTP_USER/SMTP_PASS not configured" });
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  const html = `
    <div style="font-family: monospace; max-width: 700px; color: #111;">
      <h2 style="background:#FF6600;color:#fff;padding:16px 20px;margin:0;">
        NEW PAINTLAB SUBSCRIPTION INQUIRY
      </h2>
      <div style="padding:20px;background:#f8f8f8;border:1px solid #ddd;">
        <h3 style="margin-top:0;">Contact Details</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:6px 0;font-weight:bold;width:180px;">Name</td><td>${form.name}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">Property Name</td><td>${form.propertyName}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">Property Address</td><td>${form.address}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">Phone</td><td>${form.phone}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">Email</td><td>${form.email}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">Facility Type</td><td>${facilityType}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">Selected Tier</td><td style="color:#FF6600;font-weight:bold;">${selectedTier}</td></tr>
        </table>
      </div>
      <div style="padding:20px;margin-top:8px;background:#fff;border:1px solid #ddd;">
        <h3 style="margin-top:0;">Full Breakdown</h3>
        <pre style="white-space:pre-wrap;font-size:13px;line-height:1.6;">${breakdown}</pre>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: smtpUser,
      to: "hello@paintlabpro.com",
      replyTo: form.email,
      subject: `[PaintLab Sub Inquiry] ${form.propertyName} — ${selectedTier} — ${facilityType}`,
      html,
    });
    logger.info({ to: "hello@paintlabpro.com", property: form.propertyName }, "Quote email sent");
    return res.json({ ok: true });
  } catch (err) {
    logger.error({ err }, "Failed to send quote email");
    return res.status(500).json({ ok: false, error: "Email send failed" });
  }
});

export default router;
