import mongoose, { Schema, Document } from "mongoose";

export interface IPricing extends Document {
  planName: string;
  price: string;
  billingCycle: string;
  description: string;
  features: string[];
  highlighted: boolean;
  ctaText: string;
  ctaLink: string;
  order: number;
  enabled: boolean;
}

const PricingSchema = new Schema<IPricing>(
  {
    planName: { type: String, required: true, trim: true },
    price: { type: String, required: true },
    billingCycle: { type: String, default: "per project" },
    description: { type: String, default: "" },
    features: [{ type: String }],
    highlighted: { type: Boolean, default: false },
    ctaText: { type: String, default: "Get Started" },
    ctaLink: { type: String, default: "/request-task" },
    order: { type: Number, default: 1 },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

PricingSchema.index({ order: 1 });

export default mongoose.model<IPricing>("Pricing", PricingSchema);
