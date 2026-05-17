import mongoose, { Schema, Document } from "mongoose";

export interface ITeamMember extends Document {
  name: string;
  role: string;
  department: string;
  bio: string;
  imageUrl: string;
  linkedin: string;
  twitter: string;
  github: string;
  website: string;
  order: number;
  isVisible: boolean;
}

const TeamSchema = new Schema<ITeamMember>(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    department: { type: String, default: "" },
    bio: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    twitter: { type: String, default: "" },
    github: { type: String, default: "" },
    website: { type: String, default: "" },
    order: { type: Number, default: 1 },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

TeamSchema.index({ order: 1 });

export default mongoose.model<ITeamMember>("Team", TeamSchema);
