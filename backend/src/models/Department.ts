import mongoose, { Schema, Document } from "mongoose";

export interface IDepartment extends Document {
  name: string;
  subtitle: string;
  description: string;
  image: string;
  href: string;
  capabilities: string[];
  icon: string;
  useCases: { title: string; desc: string }[];
  process: { step: string; title: string; desc: string }[];
  techStack: string[];
  caseStudy: { title: string; metric: string; desc: string };
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
    capabilities: [{ type: String }],
    icon: { type: String, default: "Layers" },
    useCases: [{
      title: { type: String, default: "" },
      desc: { type: String, default: "" }
    }],
    process: [{
      step: { type: String, default: "" },
      title: { type: String, default: "" },
      desc: { type: String, default: "" }
    }],
    techStack: [{ type: String }],
    caseStudy: {
      title: { type: String, default: "" },
      metric: { type: String, default: "" },
      desc: { type: String, default: "" }
    },
    order: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

DepartmentSchema.index({ enabled: 1, order: 1 });

export default mongoose.model<IDepartment>("Department", DepartmentSchema);
