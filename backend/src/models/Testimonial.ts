import mongoose, { Schema, Document } from "mongoose";

export interface ITestimonial extends Document {
  quote: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  featured: boolean;
  status: "published" | "draft";
  createdAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    quote: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, default: "" },
    company: { type: String, default: "" },
    avatar: { type: String, default: "" },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ["published", "draft"], default: "draft" },
  },
  { timestamps: true }
);

TestimonialSchema.index({ status: 1, featured: 1 });

export default mongoose.model<ITestimonial>("Testimonial", TestimonialSchema);
