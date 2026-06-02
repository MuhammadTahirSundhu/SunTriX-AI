import mongoose, { Document, Schema } from "mongoose";

export type SettingSection =
  | "ai"
  | "email"
  | "payment"
  | "storage"
  | "brand"
  | "chatbot"
  | "newsletter"
  | "security";

export type SettingType =
  | "text"
  | "password"
  | "toggle"
  | "number"
  | "textarea"
  | "url"
  | "select";

export interface ISystemSetting extends Document {
  key: string;
  value: string;
  section: SettingSection;
  label: string;
  description?: string;
  type: SettingType;
  options?: string[];
  isSecret: boolean;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SystemSettingSchema = new Schema<ISystemSetting>(
  {
    key: { type: String, required: true, unique: true, index: true, trim: true },
    value: { type: String, default: "" },
    section: {
      type: String,
      required: true,
      enum: ["ai", "email", "payment", "storage", "brand", "chatbot", "newsletter", "security"],
    },
    label: { type: String, required: true },
    description: { type: String, default: "" },
    type: {
      type: String,
      required: true,
      enum: ["text", "password", "toggle", "number", "textarea", "url", "select"],
    },
    options: [{ type: String }],
    isSecret: { type: Boolean, default: false },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ISystemSetting>("SystemSetting", SystemSettingSchema);
