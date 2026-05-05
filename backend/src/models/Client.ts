import mongoose, { Schema, Document } from "mongoose";

export interface IClient extends Document {
  name: string;
  logoUrl: string;
  websiteUrl: string;
  isVisible: boolean;
  order: number;
}

const ClientSchema = new Schema<IClient>(
  {
    name: { type: String, required: true, trim: true },
    logoUrl: { type: String, default: "" },
    websiteUrl: { type: String, default: "" },
    isVisible: { type: Boolean, default: true },
    order: { type: Number, default: 1 },
  },
  { timestamps: true }
);

ClientSchema.index({ order: 1 });

export default mongoose.model<IClient>("Client", ClientSchema);
