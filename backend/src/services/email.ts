import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@suntrix.com";
const FROM_EMAIL = "SunTriX <onboarding@resend.dev>"; // use this until domain is verified

export async function sendContactNotification(data: {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
}): Promise<void> {
  try {
    const { data: resData, error } = await resend.emails.send({
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
          <p style="margin-top: 16px; color: #6b7280; font-size: 12px;">View all messages in the <a href="${process.env.FRONTEND_URL}/admin/messages">Admin Dashboard</a>.</p>
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
    const { data: resData, error } = await resend.emails.send({
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
          <p style="margin-top: 16px; color: #6b7280; font-size: 12px;">Manage this request in the <a href="${process.env.FRONTEND_URL}/admin/tasks">Admin Dashboard</a>.</p>
        </div>
      `,
    });
    if (error) console.error("Resend Notification Error (Task):", error.message);
  } catch (err: any) {
    console.error("Failed to send task notification email:", err.message || err);
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
      const { data, error } = await resend.batch.send(batch);
      if (error) {
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
    const { data, error } = await resend.emails.send({
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
