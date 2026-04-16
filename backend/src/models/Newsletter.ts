import mongoose, { Schema, Document } from "mongoose";

export interface INewsletter extends Document {
  name: string;
  email: string;
  interest: string;
  subscribed: boolean;
  createdAt: Date;
}

const NewsletterSchema = new Schema<INewsletter>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    interest: { type: String, required: true, default: "General News" },
    subscribed: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<INewsletter>("Newsletter", NewsletterSchema);
