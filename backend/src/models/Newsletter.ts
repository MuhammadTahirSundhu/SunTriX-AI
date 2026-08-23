import mongoose, { Schema, Document } from "mongoose";

export interface INewsletter extends Document {
  name: string;
  email: string;
  interest: string;
  subscribed: boolean;
  // Double opt-in fields — only populated when NEWSLETTER_DOUBLE_OPTIN=true
  confirmToken?: string;        // random hex token sent in confirmation email
  confirmTokenExpiry?: Date;    // 24 hours from subscription time
  createdAt: Date;
}

const NewsletterSchema = new Schema<INewsletter>(
  {
    name:      { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    interest:  { type: String, required: true, default: "General News" },
    subscribed: { type: Boolean, default: true },
    // Double opt-in support
    confirmToken:       { type: String, default: null, index: true, sparse: true },
    confirmTokenExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model<INewsletter>("Newsletter", NewsletterSchema);
