import mongoose, { Schema, Document } from "mongoose";

export type TaskStatus =
  | "new"
  | "in_review"
  | "proposal_sent"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface ITaskRequest extends Document {
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  projectTitle: string;
  service: string;
  budget: string;
  timeline: string;
  description: string;
  priority: string;
  techStack: string;
  existingCode: string;
  codeDetails: string;
  integrations: string;
  notes: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

const TaskRequestSchema = new Schema<ITaskRequest>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    company: { type: String, default: "" },
    role: { type: String, default: "" },
    projectTitle: { type: String, default: "" },
    service: { type: String, required: true },
    budget: { type: String, default: "" },
    timeline: { type: String, default: "" },
    description: { type: String, required: true },
    priority: { type: String, default: "Medium" },
    techStack: { type: String, default: "" },
    existingCode: { type: String, default: "No" },
    codeDetails: { type: String, default: "" },
    integrations: { type: String, default: "" },
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["new", "in_review", "proposal_sent", "in_progress", "completed", "cancelled"],
      default: "new",
    },
  },
  { timestamps: true }
);

TaskRequestSchema.index({ status: 1, createdAt: -1 });
TaskRequestSchema.index({ email: 1 });

export default mongoose.model<ITaskRequest>("TaskRequest", TaskRequestSchema);
