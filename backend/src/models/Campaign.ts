import mongoose, { Schema, Document } from "mongoose";

export interface ICampaign extends Document {
  subject: string;
  htmlBody: string;
  targetAudience: string;
  recipientCount: number;
  adminId: string;
  adminName: string;
  sentAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    subject: { type: String, required: true },
    htmlBody: { type: String, required: true },
    targetAudience: { type: String, default: "All" },
    recipientCount: { type: Number, default: 0 },
    adminId: { type: String, required: true },
    adminName: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<ICampaign>("Campaign", CampaignSchema);
