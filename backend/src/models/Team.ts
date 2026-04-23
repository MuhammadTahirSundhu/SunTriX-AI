import mongoose, { Schema, Document } from "mongoose";

export interface ITeamMember extends Document {
  name: string;
  role: string;
  bio: string;
  photo: string;
  linkedIn: string;
  twitter: string;
  github: string;
  order: number;
  visible: boolean;
}

const TeamSchema = new Schema<ITeamMember>(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    bio: { type: String, default: "" },
    photo: { type: String, default: "" },
    linkedIn: { type: String, default: "" },
    twitter: { type: String, default: "" },
    github: { type: String, default: "" },
    order: { type: Number, default: 1 },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

TeamSchema.index({ order: 1 });

export default mongoose.model<ITeamMember>("Team", TeamSchema);
