import { Resend } from "resend";
import { getSetting } from "../lib/configLoader";

// ─── Lazy factory — always reads current config ────────────────────────────
function getResend(): Resend {
  const key = getSetting("RESEND_API_KEY");
  if (!key) throw new Error("RESEND_API_KEY not configured. Set it in Admin → Settings → Email.");
  return new Resend(key);
}

function getAdminEmail()   { return getSetting("ADMIN_EMAIL",         "admin@suntrix.com"); }
function getFrontendUrl()  { return getSetting("FRONTEND_URL",        "http://localhost:5173"); }
function getPaymentSla()   { return getSetting("EMAIL_PAYMENT_SLA",   "2 business hours"); }
function getKickoffSla()   { return getSetting("EMAIL_KICKOFF_SLA",   "24 hours"); }
function getBrandName()    { return getSetting("BRAND_NAME",           "SunTriX AI Solutions"); }
function getBrandWebsite() { return getSetting("BRAND_WEBSITE",        "suntrix.ai"); }
function getBatchSize()    { return parseInt(getSetting("NEWSLETTER_BATCH_SIZE", "100")); }

function getFromAddress(): string {
  const name    = getSetting("FROM_EMAIL_NAME",    "SunTriX");
  const address = getSetting("FROM_EMAIL_ADDRESS", "onboarding@resend.dev");
  return `${name} <${address}>`;
}

// ─── Contact notification ──────────────────────────────────────────────────
export async function sendContactNotification(data: {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
}): Promise<void> {
  if (getSetting("EMAIL_CONTACT_NOTIFICATIONS", "true") !== "true") return;

  try {
    const { error } = await getResend().emails.send({
      from: getFromAddress(),
      to: [getAdminEmail()],
      subject: `[${getBrandName()}] New Contact: ${data.subject}`,
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
          <p style="margin-top: 16px; color: #6b7280; font-size: 12px;">View all messages in the <a href="${getFrontendUrl()}/admin/messages">Admin Dashboard</a>.</p>
        </div>
      `,
    });
    if (error) console.error("Resend Notification Error (Contact):", error.message);
  } catch (err: any) {
    console.error("Failed to send contact notification email:", err.message || err);
  }
}

// ─── Task request notification ─────────────────────────────────────────────
export async function sendTaskNotification(data: {
  name: string;
  email: string;
  company?: string;
  service: string;
  budget: string;
  priority: string;
  projectTitle: string;
  description: string;
  selectedPlan?: string;   // dynamic — from whatever plan admin configured
}): Promise<void> {
  if (getSetting("EMAIL_TASK_NOTIFICATIONS", "true") !== "true") return;

  try {
    const { error } = await getResend().emails.send({
      from: getFromAddress(),
      to: [getAdminEmail()],
      subject: `[${getBrandName()}] New Task Request: ${data.projectTitle || data.service}`,
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
            ${data.selectedPlan ? `<tr style="background:#fff7ed;"><td style="padding: 8px; font-weight: bold; color:#f97316;">Selected Plan</td><td style="padding: 8px; font-weight:bold;">${data.selectedPlan}</td></tr>` : ""}
          </table>
          <div style="margin-top: 16px; padding: 16px; background: #f3f4f6; border-radius: 8px;">
            <p style="font-weight: bold; margin: 0 0 8px;">Description:</p>
            <p style="margin: 0; white-space: pre-wrap;">${data.description}</p>
          </div>
          <p style="margin-top: 16px; color: #6b7280; font-size: 12px;">Manage this request in the <a href="${getFrontendUrl()}/admin/tasks">Admin Dashboard</a>.</p>
        </div>
      `,
    });
    if (error) console.error("Resend Notification Error (Task):", error.message);
  } catch (err: any) {
    console.error("Failed to send task notification email:", err.message || err);
  }
}

// ─── Project Tracker Notifications ──────────────────────────────────────────

export async function sendTrackerPhaseAdvancedEmail(data: { clientEmail: string; projectTitle: string; newPhase: string; portalUrl: string; }): Promise<void> {
  try {
    await getResend().emails.send({
      from: getFromAddress(),
      to: [data.clientEmail],
      subject: `Project Update: Now in ${data.newPhase} — ${data.projectTitle}`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;padding:24px;">
        <h2 style="color:#4f46e5;margin-top:0;">🚀 Phase Advanced</h2>
        <p style="color:#374151;font-size:16px;">Great news! <strong>${data.projectTitle}</strong> has officially advanced to the <strong>${data.newPhase}</strong> phase.</p>
        <p style="color:#6b7280;margin-bottom:24px;">You can view the updated timeline and current focus areas in your Project Hub.</p>
        <a href="${data.portalUrl}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">View Project Hub</a>
      </div>`,
    });
  } catch (err) { console.error("Email Error:", err); }
}

export async function sendTrackerDeliverableReviewEmail(data: { clientEmail: string; projectTitle: string; deliverableTitle: string; portalUrl: string; }): Promise<void> {
  try {
    await getResend().emails.send({
      from: getFromAddress(),
      to: [data.clientEmail],
      subject: `Action Required: Review Deliverable for ${data.projectTitle}`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;padding:24px;">
        <h2 style="color:#f59e0b;margin-top:0;">👀 Deliverable Ready for Review</h2>
        <p style="color:#374151;font-size:16px;">We have submitted a deliverable for your approval: <strong>${data.deliverableTitle}</strong>.</p>
        <p style="color:#6b7280;margin-bottom:24px;">Please review the attached materials in your Project Hub and let us know if you approve or require changes.</p>
        <a href="${data.portalUrl}" style="display:inline-block;background:#f59e0b;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">Review Deliverable</a>
      </div>`,
    });
  } catch (err) { console.error("Email Error:", err); }
}

export async function sendTrackerUpdateEmail(data: { clientEmail: string; projectTitle: string; updateType: string; portalUrl: string; isActionRequired: boolean; }): Promise<void> {
  try {
    const color = data.isActionRequired ? "#ef4444" : "#10b981";
    await getResend().emails.send({
      from: getFromAddress(),
      to: [data.clientEmail],
      subject: `${data.isActionRequired ? 'Action Required: ' : ''}New Update on ${data.projectTitle}`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;padding:24px;">
        <h2 style="color:${color};margin-top:0;">📝 Project Update Posted</h2>
        <p style="color:#374151;font-size:16px;">We've posted a new <strong>${data.updateType}</strong> regarding your project.</p>
        <a href="${data.portalUrl}" style="display:inline-block;background:${color};color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">Read Update</a>
      </div>`,
    });
  } catch (err) { console.error("Email Error:", err); }
}

export async function sendTrackerFileEmail(data: { clientEmail: string; projectTitle: string; filename: string; portalUrl: string; }): Promise<void> {
  try {
    await getResend().emails.send({
      from: getFromAddress(),
      to: [data.clientEmail],
      subject: `New File Shared: ${data.filename} — ${data.projectTitle}`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;padding:24px;">
        <h2 style="color:#3b82f6;margin-top:0;">📁 File Ready for Review</h2>
        <p style="color:#374151;font-size:16px;">A new file has been shared with you: <strong>${data.filename}</strong>.</p>
        <a href="${data.portalUrl}" style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">View File</a>
      </div>`,
    });
  } catch (err) { console.error("Email Error:", err); }
}

export async function sendTrackerPaymentDueEmail(data: { clientEmail: string; projectTitle: string; milestoneTitle: string; amountFormatted: string; portalUrl: string; }): Promise<void> {
  try {
    await getResend().emails.send({
      from: getFromAddress(),
      to: [data.clientEmail],
      subject: `Invoice Ready: ${data.milestoneTitle} — ${data.projectTitle}`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;padding:24px;">
        <h2 style="color:#ef4444;margin-top:0;">💳 Payment Due</h2>
        <p style="color:#374151;font-size:16px;">An invoice of <strong>${data.amountFormatted}</strong> is now due for the milestone: <strong>${data.milestoneTitle}</strong>.</p>
        <p style="color:#6b7280;margin-bottom:24px;">You can pay this securely via your Project Hub.</p>
        <a href="${data.portalUrl}" style="display:inline-block;background:#ef4444;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">Pay Invoice Now</a>
      </div>`,
    });
  } catch (err) { console.error("Email Error:", err); }
}

export async function sendTrackerPaymentConfirmedEmail(data: { clientEmail: string; projectTitle: string; milestoneTitle: string; amountFormatted: string; portalUrl: string; }): Promise<void> {
  try {
    await getResend().emails.send({
      from: getFromAddress(),
      to: [data.clientEmail],
      subject: `Payment Received: ${data.milestoneTitle} — ${data.projectTitle}`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;padding:24px;">
        <h2 style="color:#10b981;margin-top:0;">✅ Payment Confirmed</h2>
        <p style="color:#374151;font-size:16px;">We have successfully received your payment of <strong>${data.amountFormatted}</strong> for <strong>${data.milestoneTitle}</strong>.</p>
        <p style="color:#6b7280;margin-bottom:24px;">Thank you for your prompt payment!</p>
        <a href="${data.portalUrl}" style="display:inline-block;background:#10b981;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">Go to Project Hub</a>
      </div>`,
    });
  } catch (err) { console.error("Email Error:", err); }
}

export async function sendTrackerClientActionToAdminEmail(data: { actionStr: string; projectTitle: string; targetName: string; adminUrl: string; }): Promise<void> {
  try {
    await getResend().emails.send({
      from: getFromAddress(),
      to: [getAdminEmail()],
      subject: `Client ${data.actionStr} — ${data.projectTitle}`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;padding:24px;">
        <h2 style="color:#4f46e5;margin-top:0;">Client Action Logged</h2>
        <p style="color:#374151;font-size:16px;">The client has <strong>${data.actionStr}</strong> for: <strong>${data.targetName}</strong>.</p>
        <a href="${data.adminUrl}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">Open Admin Dashboard</a>
      </div>`,
    });
  } catch (err) { console.error("Email Error:", err); }
}
// ─── Invoice / proposal email ──────────────────────────────────────────────
export async function sendInvoiceEmail(data: {
  clientName: string;
  clientEmail: string;
  description: string;
  amountUSD: string;
  invoiceUrl: string;
  expiresAt: string;
  projectTitle?: string;
}): Promise<void> {
  const brand   = getBrandName();
  const website = getBrandWebsite();
  const appUrl  = getFrontendUrl();

  try {
    const { error } = await getResend().emails.send({
      from: getFromAddress(),
      to: [data.clientEmail],
      subject: `Invoice from ${brand} — ${data.description}`,
      html: `
        <div style="font-family:'Segoe UI',sans-serif;background:#0f0f0f;padding:40px 20px;min-height:100vh;">
          <div style="max-width:560px;margin:0 auto;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:16px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#f97316,#fb923c);padding:32px;text-align:center;">
              <p style="color:rgba(255,255,255,0.8);font-size:12px;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px;">${brand}</p>
              <h1 style="color:#fff;font-size:28px;font-weight:800;margin:0;">Invoice / Proposal</h1>
            </div>
            <div style="padding:32px;">
              <p style="color:#d4d4d4;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Hi ${data.clientName || "there"},<br><br>
                Thank you for your interest in working with ${brand}. We've prepared a proposal for your project.
                Please review the details below and click the button to proceed with payment.
              </p>
              <div style="background:#111;border:1px solid #2a2a2a;border-radius:12px;padding:20px;margin-bottom:24px;">
                ${data.projectTitle ? `<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #2a2a2a;"><span style="color:#888;font-size:13px;">Project</span><span style="color:#fff;font-size:13px;font-weight:600;">${data.projectTitle}</span></div>` : ""}
                <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #2a2a2a;"><span style="color:#888;font-size:13px;">Service</span><span style="color:#fff;font-size:13px;font-weight:600;">${data.description}</span></div>
                <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #2a2a2a;"><span style="color:#888;font-size:13px;">Invoice Expires</span><span style="color:#f59e0b;font-size:13px;font-weight:600;">${data.expiresAt}</span></div>
                <div style="display:flex;justify-content:space-between;padding:16px 0 0;"><span style="color:#888;font-size:15px;font-weight:700;">Total Due</span><span style="color:#f97316;font-size:24px;font-weight:800;">${data.amountUSD}</span></div>
              </div>
              <div style="text-align:center;margin-bottom:24px;">
                <a href="${data.invoiceUrl}" style="display:inline-block;background:linear-gradient(135deg,#f97316,#fb923c);color:#fff;font-weight:800;font-size:16px;padding:16px 40px;border-radius:12px;text-decoration:none;letter-spacing:0.5px;">
                  View &amp; Pay Invoice →
                </a>
              </div>
              <p style="color:#666;font-size:12px;text-align:center;line-height:1.6;">
                🔒 Secured by Stripe. We never store your card details.<br>
                Questions? Reply to this email or <a href="${appUrl}/contact" style="color:#f97316;">contact us here</a>.
              </p>
            </div>
            <div style="border-top:1px solid #2a2a2a;padding:16px 32px;text-align:center;">
              <p style="color:#555;font-size:11px;margin:0;">© ${new Date().getFullYear()} ${brand} · ${website}</p>
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

// ─── Payment confirmation ──────────────────────────────────────────────────
export async function sendPaymentConfirmation(data: {
  clientName: string;
  clientEmail: string;
  description: string;
  amountUSD: string;
  receiptUrl?: string;
  trackingUrl?: string;
  paidAt: string;
}): Promise<void> {
  const brand   = getBrandName();
  const website = getBrandWebsite();
  const appUrl  = getFrontendUrl();
  const sla     = getPaymentSla();
  const kickoff = getKickoffSla();

  try {
    const { error } = await getResend().emails.send({
      from: getFromAddress(),
      to: [data.clientEmail],
      subject: `✅ Payment Confirmed — ${brand}`,
      html: `
        <div style="font-family:'Segoe UI',sans-serif;background:#0f0f0f;padding:40px 20px;min-height:100vh;">
          <div style="max-width:560px;margin:0 auto;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:16px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#10b981,#059669);padding:32px;text-align:center;">
              <div style="width:64px;height:64px;background:rgba(255,255,255,0.15);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
                <span style="font-size:32px;">✅</span>
              </div>
              <h1 style="color:#fff;font-size:26px;font-weight:800;margin:0;">Payment Confirmed!</h1>
              <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:8px 0 0;">Your project is now active</p>
            </div>
            <div style="padding:32px;">
              <p style="color:#d4d4d4;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Hi ${data.clientName || "there"},<br><br>
                Thank you for your payment! We've received it and your project is now active.
                Our team will reach out within <strong style="color:#fff;">${sla}</strong> to discuss next steps.
              </p>
              <div style="background:#111;border:1px solid #2a2a2a;border-radius:12px;padding:20px;margin-bottom:24px;">
                <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #2a2a2a;"><span style="color:#888;font-size:13px;">Service</span><span style="color:#fff;font-size:13px;font-weight:600;">${data.description}</span></div>
                <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #2a2a2a;"><span style="color:#888;font-size:13px;">Date</span><span style="color:#fff;font-size:13px;font-weight:600;">${data.paidAt}</span></div>
                <div style="display:flex;justify-content:space-between;padding:16px 0 0;"><span style="color:#888;font-size:15px;font-weight:700;">Amount Paid</span><span style="color:#10b981;font-size:24px;font-weight:800;">${data.amountUSD}</span></div>
              </div>
              <div style="background:#0d1f17;border:1px solid #065f46;border-radius:12px;padding:20px;margin-bottom:24px;">
                <p style="color:#10b981;font-weight:700;font-size:13px;letter-spacing:1px;text-transform:uppercase;margin:0 0 16px;">What happens next</p>
                <p style="color:#d4d4d4;font-size:13px;margin:0 0 10px;">✅ &nbsp;Email confirmation sent (you're reading it!)</p>
                <p style="color:#d4d4d4;font-size:13px;margin:0 0 10px;">⏳ &nbsp;Your project manager contacts you within ${sla}</p>
                <p style="color:#d4d4d4;font-size:13px;margin:0 0 10px;">📅 &nbsp;Kickoff call scheduled within ${kickoff}</p>
                <p style="color:#d4d4d4;font-size:13px;margin:0;">🚀 &nbsp;Development begins after kickoff</p>
              </div>
              <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-bottom:24px;">
                ${data.trackingUrl ? `<a href="${data.trackingUrl}" style="display:inline-block;background:linear-gradient(135deg,#f97316,#fb923c);color:#fff;font-weight:700;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none;">Track My Project →</a>` : ""}
                ${data.receiptUrl ? `<a href="${data.receiptUrl}" style="display:inline-block;background:#1a1a1a;border:1px solid #2a2a2a;color:#d4d4d4;font-weight:600;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none;">Download Receipt</a>` : ""}
              </div>
              <p style="color:#666;font-size:12px;text-align:center;line-height:1.6;">
                Questions? Reply to this email or <a href="${appUrl}/contact" style="color:#f97316;">contact us here</a>.
              </p>
            </div>
            <div style="border-top:1px solid #2a2a2a;padding:16px 32px;text-align:center;">
              <p style="color:#555;font-size:11px;margin:0;">© ${new Date().getFullYear()} ${brand} · ${website}</p>
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

// ─── Newsletter broadcast ──────────────────────────────────────────────────
export async function sendNewsletterBroadcast(
  subject: string,
  htmlBody: string,
  recipients: string[]
): Promise<void> {
  if (!recipients.length) return;

  const BATCH_SIZE = getBatchSize();
  const emails = recipients.map((email) => ({
    from: getFromAddress(),
    to: [email],
    subject,
    html: htmlBody,
  }));

  try {
    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE);
      const { error } = await getResend().batch.send(batch);
      if (error) {
        if (
          error.name === "validation_error" &&
          error.message.includes("testing email address")
        ) {
          console.warn("Resend test mode — skipping batch to unverified emails");
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

// ─── Direct reply ──────────────────────────────────────────────────────────
export async function sendDirectReply(
  toEmail: string,
  subject: string,
  htmlBody: string
): Promise<void> {
  try {
    const { error } = await getResend().emails.send({
      from: getFromAddress(),
      to: [toEmail],
      subject,
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

// ─── Proposal email (sent to client when admin creates a proposal) ─────────
export async function sendProposalEmail(data: {
  clientName:    string;
  clientEmail:   string;
  proposalTitle: string;
  introduction:  string;
  totalAmount:   string;
  milestones:    { title: string; amount: string }[];
  proposalUrl:   string;
  expiresAt:     string;
}): Promise<void> {
  const brand   = getBrandName();
  const website = getBrandWebsite();
  const appUrl  = getFrontendUrl();

  const milestonesHtml = data.milestones.map((m, i) => `
    <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #2a2a2a;">
      <span style="color:#d4d4d4;font-size:13px;">Milestone ${i + 1}: ${m.title}</span>
      <span style="color:#f97316;font-size:13px;font-weight:700;">${m.amount}</span>
    </div>`).join("");

  try {
    const { error } = await getResend().emails.send({
      from: getFromAddress(),
      to: [data.clientEmail],
      subject: `📋 Proposal from ${brand} — ${data.proposalTitle}`,
      html: `
        <div style="font-family:'Segoe UI',sans-serif;background:#0f0f0f;padding:40px 20px;min-height:100vh;">
          <div style="max-width:580px;margin:0 auto;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:16px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#f97316,#fb923c);padding:32px;text-align:center;">
              <p style="color:rgba(255,255,255,0.8);font-size:12px;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px;">${brand}</p>
              <h1 style="color:#fff;font-size:26px;font-weight:800;margin:0;">Project Proposal</h1>
              <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:8px 0 0;">${data.proposalTitle}</p>
            </div>
            <div style="padding:32px;">
              <p style="color:#d4d4d4;font-size:15px;line-height:1.7;margin:0 0 24px;">
                Hi ${data.clientName || "there"},<br><br>
                ${data.introduction || `Thank you for submitting your project request. We've reviewed your requirements and prepared a detailed proposal tailored to your needs. Please take a moment to review and let us know how you'd like to proceed.`}
              </p>
              <div style="background:#111;border:1px solid #2a2a2a;border-radius:12px;padding:20px;margin-bottom:24px;">
                <p style="color:#888;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;">Payment Milestones</p>
                ${milestonesHtml}
                <div style="display:flex;justify-content:space-between;padding:14px 0 2px;">
                  <span style="color:#888;font-size:14px;font-weight:700;">Total Investment</span>
                  <span style="color:#f97316;font-size:22px;font-weight:800;">${data.totalAmount}</span>
                </div>
              </div>
              <div style="background:#1a1a1a;border:1px solid #f97316/30;border-radius:10px;padding:14px 18px;margin-bottom:24px;">
                <p style="color:#f59e0b;font-size:12px;margin:0;">⏰ This proposal expires on <strong>${data.expiresAt}</strong></p>
              </div>
              <div style="text-align:center;margin-bottom:24px;">
                <a href="${data.proposalUrl}" style="display:inline-block;background:linear-gradient(135deg,#f97316,#fb923c);color:#fff;font-weight:800;font-size:16px;padding:16px 44px;border-radius:12px;text-decoration:none;">
                  Review Proposal →
                </a>
              </div>
              <p style="color:#555;font-size:12px;text-align:center;line-height:1.6;">
                You can accept the proposal, request changes, or <a href="${appUrl}/contact" style="color:#f97316;">contact us directly</a>.
              </p>
            </div>
            <div style="border-top:1px solid #2a2a2a;padding:16px 32px;text-align:center;">
              <p style="color:#555;font-size:11px;margin:0;">© ${new Date().getFullYear()} ${brand} · ${website}</p>
            </div>
          </div>
        </div>`,
    });
    if (error) console.error("Resend Proposal Email Error:", error.message);
  } catch (err: any) {
    console.error("Failed to send proposal email:", err.message || err);
  }
}

// ─── Changes requested notification (admin) ────────────────────────────────
export async function sendChangesRequestedNotification(data: {
  clientName:   string;
  clientEmail:  string;
  projectTitle: string;
  clientNote:   string;
  adminUrl:     string;
}): Promise<void> {
  try {
    const { error } = await getResend().emails.send({
      from: getFromAddress(),
      to: [getAdminEmail()],
      subject: `[${getBrandName()}] Proposal Changes Requested — ${data.projectTitle}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#f97316;">📝 Client Requested Changes</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px;font-weight:bold;">Client</td><td style="padding:8px;">${data.clientName}</td></tr>
            <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;">Email</td><td style="padding:8px;"><a href="mailto:${data.clientEmail}">${data.clientEmail}</a></td></tr>
            <tr><td style="padding:8px;font-weight:bold;">Project</td><td style="padding:8px;">${data.projectTitle}</td></tr>
          </table>
          <div style="margin-top:16px;padding:16px;background:#fef3c7;border-radius:8px;border-left:4px solid #f59e0b;">
            <p style="font-weight:bold;margin:0 0 8px;">Client's requested changes:</p>
            <p style="margin:0;white-space:pre-wrap;">${data.clientNote}</p>
          </div>
          <p style="margin-top:16px;color:#6b7280;font-size:12px;">Review in <a href="${data.adminUrl}">Admin Dashboard</a> and revise the proposal.</p>
        </div>`,
    });
    if (error) console.error("Resend Changes Notification Error:", error.message);
  } catch (err: any) {
    console.error("Failed to send changes notification:", err.message || err);
  }
}

// ─── Contract email (sent to client after accepting proposal) ──────────────
export async function sendContractEmail(data: {
  clientName:   string;
  clientEmail:  string;
  projectTitle: string;
  totalAmount:  string;
  contractUrl:  string;
  expiresAt:    string;
}): Promise<void> {
  const brand   = getBrandName();
  const website = getBrandWebsite();
  const appUrl  = getFrontendUrl();

  try {
    const { error } = await getResend().emails.send({
      from: getFromAddress(),
      to: [data.clientEmail],
      subject: `📄 Service Agreement Ready — ${data.projectTitle} | ${brand}`,
      html: `
        <div style="font-family:'Segoe UI',sans-serif;background:#0f0f0f;padding:40px 20px;min-height:100vh;">
          <div style="max-width:580px;margin:0 auto;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:16px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;text-align:center;">
              <p style="color:rgba(255,255,255,0.8);font-size:12px;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px;">${brand}</p>
              <h1 style="color:#fff;font-size:26px;font-weight:800;margin:0;">Service Agreement</h1>
              <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:8px 0 0;">Ready for your digital signature</p>
            </div>
            <div style="padding:32px;">
              <p style="color:#d4d4d4;font-size:15px;line-height:1.7;margin:0 0 24px;">
                Hi ${data.clientName || "there"},<br><br>
                You've accepted our proposal for <strong style="color:#fff;">${data.projectTitle}</strong>. 
                We've prepared your service agreement outlining all project commitments, milestones, and deliverables.
                Please review and sign to officially kick off your project.
              </p>
              <div style="background:#111;border:1px solid #2a2a2a;border-radius:12px;padding:20px;margin-bottom:24px;">
                <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #2a2a2a;">
                  <span style="color:#888;font-size:13px;">Project</span>
                  <span style="color:#fff;font-size:13px;font-weight:600;">${data.projectTitle}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #2a2a2a;">
                  <span style="color:#888;font-size:13px;">Contract Expires</span>
                  <span style="color:#f59e0b;font-size:13px;font-weight:600;">${data.expiresAt}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:14px 0 2px;">
                  <span style="color:#888;font-size:14px;font-weight:700;">Total Project Value</span>
                  <span style="color:#a78bfa;font-size:22px;font-weight:800;">${data.totalAmount}</span>
                </div>
              </div>
              <div style="background:#1e1b4b;border:1px solid #6366f1;border-radius:10px;padding:14px 18px;margin-bottom:24px;">
                <p style="color:#a5b4fc;font-size:13px;margin:0;">✍️ Simply type your full name in the signature field and click "Sign" — no download needed.</p>
              </div>
              <div style="text-align:center;margin-bottom:24px;">
                <a href="${data.contractUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-weight:800;font-size:16px;padding:16px 44px;border-radius:12px;text-decoration:none;">
                  Review &amp; Sign Contract →
                </a>
              </div>
              <p style="color:#555;font-size:12px;text-align:center;line-height:1.6;">
                Questions? <a href="${appUrl}/contact" style="color:#f97316;">Contact us</a> before signing.
              </p>
            </div>
            <div style="border-top:1px solid #2a2a2a;padding:16px 32px;text-align:center;">
              <p style="color:#555;font-size:11px;margin:0;">© ${new Date().getFullYear()} ${brand} · ${website}</p>
            </div>
          </div>
        </div>`,
    });
    if (error) console.error("Resend Contract Email Error:", error.message);
  } catch (err: any) {
    console.error("Failed to send contract email:", err.message || err);
  }
}

// ─── Contract signed notification (admin) ──────────────────────────────────
export async function sendContractSignedNotification(data: {
  clientName:   string;
  clientEmail:  string;
  projectTitle: string;
  signedAt:     string;
  adminUrl:     string;
}): Promise<void> {
  try {
    const { error } = await getResend().emails.send({
      from: getFromAddress(),
      to: [getAdminEmail()],
      subject: `✅ Contract Signed — ${data.projectTitle} | ${getBrandName()}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#10b981;">✅ Contract Signed — Invoice Can Now Be Created</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px;font-weight:bold;">Client</td><td style="padding:8px;">${data.clientName}</td></tr>
            <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;">Email</td><td style="padding:8px;"><a href="mailto:${data.clientEmail}">${data.clientEmail}</a></td></tr>
            <tr><td style="padding:8px;font-weight:bold;">Project</td><td style="padding:8px;">${data.projectTitle}</td></tr>
            <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;">Signed On</td><td style="padding:8px;">${data.signedAt}</td></tr>
          </table>
          <div style="margin-top:16px;padding:16px;background:#d1fae5;border-radius:8px;border-left:4px solid #10b981;">
            <p style="font-weight:bold;margin:0;color:#065f46;">🚀 Next step: Create the first milestone invoice in the Admin Dashboard.</p>
          </div>
          <p style="margin-top:16px;color:#6b7280;font-size:12px;"><a href="${data.adminUrl}">Go to Admin Dashboard →</a></p>
        </div>`,
    });
    if (error) console.error("Resend Contract Signed Error:", error.message);
  } catch (err: any) {
    console.error("Failed to send contract signed notification:", err.message || err);
  }
}

