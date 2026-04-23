import mongoose, { Schema, Document } from "mongoose";

export interface IClient extends Document {
  name: string;
  logo: string;
  url: string;
  order: number;
  enabled: boolean;
}

const ClientSchema = new Schema<IClient>(
  {
    name: { type: String, required: true, trim: true },
    logo: { type: String, default: "" },
    url: { type: String, default: "" },
    order: { type: Number, default: 1 },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ClientSchema.index({ order: 1 });

export default mongoose.model<IClient>("Client", ClientSchema);
