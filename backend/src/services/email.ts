import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@suntrix.com";
const FROM_EMAIL = "SunTriX <onboarding@resend.dev>"; // use this until domain is verified
const APP_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export async function sendContactNotification(data: {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
}): Promise<void> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      subject: `[SunTriX] New Contact: ${data.subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">New Contact Message</h2>
          <table style="width:100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; font-weight: bold;">Name</td><td style="padding: 8px;">${data.name}</td></tr>
            <tr style="background:#f9f9f9;"><td style="padding: 8px; font-weight: bold;">Email</td><td style="padding: 8px;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
            ${data.company ? `<tr><td style="padding: 8px; font-weight: bold;">Company</td><td style="padding: 8px;">${data.company}</td></tr>` : ""}
            <tr style="background:#f9f9f9;"><td style="padding: 8px; font-weight: bold;">Subject</td><td style="padding: 8px;">${data.subject}</td></tr>
          </table>
          <div style="margin-top: 16px; padding: 16px; background: #f3f4f6; border-radius: 8px;">
            <p style="font-weight: bold; margin: 0 0 8px;">Message:</p>
            <p style="margin: 0; white-space: pre-wrap;">${data.message}</p>
          </div>
          <p style="margin-top: 16px; color: #6b7280; font-size: 12px;">View all messages in the <a href="${APP_URL}/admin/messages">Admin Dashboard</a>.</p>
        </div>
      `,
    });
    if (error) console.error("Resend Notification Error (Contact):", error.message);
  } catch (err: any) {
    console.error("Failed to send contact notification email:", err.message || err);
    // Non-fatal — don't throw
  }
}

export async function sendTaskNotification(data: {
  name: string;
  email: string;
  company?: string;
  service: string;
  budget: string;
  priority: string;
  projectTitle: string;
  description: string;
}): Promise<void> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      subject: `[SunTriX] New Task Request: ${data.projectTitle || data.service}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">🚀 New Task Request</h2>
          <table style="width:100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; font-weight: bold;">Name</td><td style="padding: 8px;">${data.name}</td></tr>
            <tr style="background:#f9f9f9;"><td style="padding: 8px; font-weight: bold;">Email</td><td style="padding: 8px;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
            ${data.company ? `<tr><td style="padding: 8px; font-weight: bold;">Company</td><td style="padding: 8px;">${data.company}</td></tr>` : ""}
            <tr style="background:#f9f9f9;"><td style="padding: 8px; font-weight: bold;">Project</td><td style="padding: 8px;">${data.projectTitle}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Service</td><td style="padding: 8px;">${data.service}</td></tr>
            <tr style="background:#f9f9f9;"><td style="padding: 8px; font-weight: bold;">Budget</td><td style="padding: 8px;">${data.budget || "Not specified"}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Priority</td><td style="padding: 8px;">${data.priority}</td></tr>
          </table>
          <div style="margin-top: 16px; padding: 16px; background: #f3f4f6; border-radius: 8px;">
            <p style="font-weight: bold; margin: 0 0 8px;">Description:</p>
            <p style="margin: 0; white-space: pre-wrap;">${data.description}</p>
          </div>
          <p style="margin-top: 16px; color: #6b7280; font-size: 12px;">Manage this request in the <a href="${APP_URL}/admin/tasks">Admin Dashboard</a>.</p>
        </div>
      `,
    });
    if (error) console.error("Resend Notification Error (Task):", error.message);
  } catch (err: any) {
    console.error("Failed to send task notification email:", err.message || err);
  }
}

// ─────────────────────────────────────────────────────────────────
// Send invoice/proposal email to client
// Called when admin creates an invoice for a task request
// ─────────────────────────────────────────────────────────────────
export async function sendInvoiceEmail(data: {
  clientName: string;
  clientEmail: string;
  description: string;
  amountUSD: string;
  invoiceUrl: string;
  expiresAt: string;
  projectTitle?: string;
}): Promise<void> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [data.clientEmail],
      subject: `Invoice from SunTriX AI Solutions — ${data.description}`,
      html: `
        <div style="font-family:'Segoe UI',sans-serif;background:#0f0f0f;padding:40px 20px;min-height:100vh;">
          <div style="max-width:560px;margin:0 auto;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:16px;overflow:hidden;">
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#f97316,#fb923c);padding:32px;text-align:center;">
              <p style="color:rgba(255,255,255,0.8);font-size:12px;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px;">SunTriX AI Solutions</p>
              <h1 style="color:#fff;font-size:28px;font-weight:800;margin:0;">Invoice / Proposal</h1>
            </div>
            <!-- Body -->
            <div style="padding:32px;">
              <p style="color:#d4d4d4;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Hi ${data.clientName || "there"},<br><br>
                Thank you for your interest in working with SunTriX. We've prepared a proposal for your project.
                Please review the details below and click the button to proceed with payment.
              </p>

              <!-- Invoice Details -->
              <div style="background:#111;border:1px solid #2a2a2a;border-radius:12px;padding:20px;margin-bottom:24px;">
                ${data.projectTitle ? `<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #2a2a2a;"><span style="color:#888;font-size:13px;">Project</span><span style="color:#fff;font-size:13px;font-weight:600;">${data.projectTitle}</span></div>` : ""}
                <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #2a2a2a;"><span style="color:#888;font-size:13px;">Service</span><span style="color:#fff;font-size:13px;font-weight:600;">${data.description}</span></div>
                <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #2a2a2a;"><span style="color:#888;font-size:13px;">Invoice Expires</span><span style="color:#f59e0b;font-size:13px;font-weight:600;">${data.expiresAt}</span></div>
                <div style="display:flex;justify-content:space-between;padding:16px 0 0;"><span style="color:#888;font-size:15px;font-weight:700;">Total Due</span><span style="color:#f97316;font-size:24px;font-weight:800;">${data.amountUSD}</span></div>
              </div>

              <!-- CTA Button -->
              <div style="text-align:center;margin-bottom:24px;">
                <a href="${data.invoiceUrl}" style="display:inline-block;background:linear-gradient(135deg,#f97316,#fb923c);color:#fff;font-weight:800;font-size:16px;padding:16px 40px;border-radius:12px;text-decoration:none;letter-spacing:0.5px;">
                  View & Pay Invoice →
                </a>
              </div>

              <p style="color:#666;font-size:12px;text-align:center;line-height:1.6;">
                🔒 Secured by Stripe. We never store your card details.<br>
                Questions? Reply to this email or <a href="${APP_URL}/contact" style="color:#f97316;">contact us here</a>.
              </p>
            </div>
            <!-- Footer -->
            <div style="border-top:1px solid #2a2a2a;padding:16px 32px;text-align:center;">
              <p style="color:#555;font-size:11px;margin:0;">© ${new Date().getFullYear()} SunTriX AI Solutions · suntrix.ai</p>
            </div>
          </div>
        </div>
      `,
    });
    if (error) console.error("Resend Invoice Email Error:", error.message);
  } catch (err: any) {
    console.error("Failed to send invoice email:", err.message || err);
  }
}

// ─────────────────────────────────────────────────────────────────
// Send payment confirmation (receipt) to client after successful payment
// ─────────────────────────────────────────────────────────────────
export async function sendPaymentConfirmation(data: {
  clientName: string;
  clientEmail: string;
  description: string;
  amountUSD: string;
  receiptUrl?: string;
  trackingUrl?: string;
  paidAt: string;
}): Promise<void> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [data.clientEmail],
      subject: `✅ Payment Confirmed — SunTriX AI Solutions`,
      html: `
        <div style="font-family:'Segoe UI',sans-serif;background:#0f0f0f;padding:40px 20px;min-height:100vh;">
          <div style="max-width:560px;margin:0 auto;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:16px;overflow:hidden;">
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#10b981,#059669);padding:32px;text-align:center;">
              <div style="width:64px;height:64px;background:rgba(255,255,255,0.15);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
                <span style="font-size:32px;">✅</span>
              </div>
              <h1 style="color:#fff;font-size:26px;font-weight:800;margin:0;">Payment Confirmed!</h1>
              <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:8px 0 0;">Your project is now active</p>
            </div>
            <!-- Body -->
            <div style="padding:32px;">
              <p style="color:#d4d4d4;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Hi ${data.clientName || "there"},<br><br>
                Thank you for your payment! We've received it and your project is now active.
                Our team will reach out within <strong style="color:#fff;">2 business hours</strong> to discuss next steps.
              </p>

              <!-- Receipt Details -->
              <div style="background:#111;border:1px solid #2a2a2a;border-radius:12px;padding:20px;margin-bottom:24px;">
                <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #2a2a2a;"><span style="color:#888;font-size:13px;">Service</span><span style="color:#fff;font-size:13px;font-weight:600;">${data.description}</span></div>
                <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #2a2a2a;"><span style="color:#888;font-size:13px;">Date</span><span style="color:#fff;font-size:13px;font-weight:600;">${data.paidAt}</span></div>
                <div style="display:flex;justify-content:space-between;padding:16px 0 0;"><span style="color:#888;font-size:15px;font-weight:700;">Amount Paid</span><span style="color:#10b981;font-size:24px;font-weight:800;">${data.amountUSD}</span></div>
              </div>

              <!-- What Happens Next -->
              <div style="background:#0d1f17;border:1px solid #065f46;border-radius:12px;padding:20px;margin-bottom:24px;">
                <p style="color:#10b981;font-weight:700;font-size:13px;letter-spacing:1px;text-transform:uppercase;margin:0 0 16px;">What happens next</p>
                <div style="space-y:12px;">
                  <p style="color:#d4d4d4;font-size:13px;margin:0 0 10px;">✅ &nbsp;Email confirmation sent (you're reading it!)</p>
                  <p style="color:#d4d4d4;font-size:13px;margin:0 0 10px;">⏳ &nbsp;Your project manager contacts you within 2 business hours</p>
                  <p style="color:#d4d4d4;font-size:13px;margin:0 0 10px;">📅 &nbsp;Kickoff call scheduled within 24 hours</p>
                  <p style="color:#d4d4d4;font-size:13px;margin:0;">🚀 &nbsp;Development begins after kickoff</p>
                </div>
              </div>

              <!-- Action Buttons -->
              <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-bottom:24px;">
                ${data.trackingUrl ? `<a href="${data.trackingUrl}" style="display:inline-block;background:linear-gradient(135deg,#f97316,#fb923c);color:#fff;font-weight:700;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none;">Track My Project →</a>` : ""}
                ${data.receiptUrl ? `<a href="${data.receiptUrl}" style="display:inline-block;background:#1a1a1a;border:1px solid #2a2a2a;color:#d4d4d4;font-weight:600;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none;">Download Receipt</a>` : ""}
              </div>

              <p style="color:#666;font-size:12px;text-align:center;line-height:1.6;">
                Questions? Reply to this email or <a href="${APP_URL}/contact" style="color:#f97316;">contact us here</a>.
              </p>
            </div>
            <!-- Footer -->
            <div style="border-top:1px solid #2a2a2a;padding:16px 32px;text-align:center;">
              <p style="color:#555;font-size:11px;margin:0;">© ${new Date().getFullYear()} SunTriX AI Solutions · suntrix.ai</p>
            </div>
          </div>
        </div>
      `,
    });
    if (error) console.error("Resend Payment Confirmation Error:", error.message);
  } catch (err: any) {
    console.error("Failed to send payment confirmation email:", err.message || err);
  }
}

export async function sendNewsletterBroadcast(subject: string, htmlBody: string, recipients: string[]): Promise<void> {
  if (!recipients.length) return;
  const emails = recipients.map(email => ({
    from: FROM_EMAIL,
    to: [email],
    subject: subject,
    html: htmlBody,
  }));
  
  try {
    const BATCH_SIZE = 100;
    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE);
      const { error } = await resend.batch.send(batch);
      if (error) {
        if (error.name === 'validation_error' && error.message.includes('testing email address')) {
          console.warn("Resend test mode detected. Skipping batch to unverified emails but simulating success.");
          continue;
        }
        console.error("Resend Batch Error:", error);
        throw new Error(error.message);
      }
    }
  } catch (err: any) {
    console.error("Broadcast failed:", err);
    throw new Error(err.message || "Failed to broadcast");
  }
}

export async function sendDirectReply(toEmail: string, subject: string, htmlBody: string): Promise<void> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [toEmail],
      subject: subject,
      html: htmlBody,
    });
    
    if (error) {
      console.error("Resend Direct Reply Error:", error);
      throw new Error(error.message);
    }
  } catch (err: any) {
    console.error("Failed to send direct reply:", err);
    throw new Error(err.message || "Failed to send reply");
  }
}
