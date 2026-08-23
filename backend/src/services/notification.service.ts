import { resendAdapter, ResendAdapter } from "../integrations/resend/resend.adapter";

export class NotificationService {
  constructor(private emailAdapter: ResendAdapter = resendAdapter) {}

  async sendTaskSubmissionNotification(data: {
    name: string;
    email: string;
    company?: string;
    service: string;
    budget?: string;
    priority?: string;
    projectTitle?: string;
    description: string;
    selectedPlan?: string;
  }): Promise<boolean> {
    const html = `
      <h2>New Task Request Submitted</h2>
      <p><strong>Client:</strong> ${data.name} (${data.email})</p>
      <p><strong>Company:</strong> ${data.company || "N/A"}</p>
      <p><strong>Service:</strong> ${data.service}</p>
      <p><strong>Budget:</strong> ${data.budget || "N/A"}</p>
      <p><strong>Priority:</strong> ${data.priority || "Medium"}</p>
      <p><strong>Title:</strong> ${data.projectTitle || "N/A"}</p>
      <p><strong>Description:</strong> ${data.description}</p>
    `;

    const res = await this.emailAdapter.sendEmail({
      to: "admin@suntrix.com",
      subject: `New Task Request: ${data.projectTitle || data.service}`,
      html,
    });
    return res.success;
  }
}

export const notificationService = new NotificationService();
