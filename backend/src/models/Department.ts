import mongoose, { Schema, Document } from "mongoose";

export interface IDepartment extends Document {
  name: string;
  subtitle: string;
  description: string;
  image: string;
  href: string;
  order: number;
  enabled: boolean;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, trim: true },
    subtitle: { type: String, default: "" },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    href: { type: String, default: "" },
    order: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

DepartmentSchema.index({ enabled: 1, order: 1 });

export default mongoose.model<IDepartment>("Department", DepartmentSchema);
