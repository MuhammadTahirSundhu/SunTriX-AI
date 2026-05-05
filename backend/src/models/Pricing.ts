import mongoose, { Schema, Document } from "mongoose";

export interface IPricing extends Document {
  name: string;
  price: number;
  currency: string;
  billingPeriod: string;
  description: string;
  features: string[];
  isPopular: boolean;
  isVisible: boolean;
  ctaLabel: string;
  ctaLink: string;
  order: number;
}

const PricingSchema = new Schema<IPricing>(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    billingPeriod: { type: String, default: "monthly" },
    description: { type: String, default: "" },
    features: [{ type: String }],
    isPopular: { type: Boolean, default: false },
    isVisible: { type: Boolean, default: true },
    ctaLabel: { type: String, default: "Get Started" },
    ctaLink: { type: String, default: "/contact" },
    order: { type: Number, default: 1 },
  },
  { timestamps: true }
);

PricingSchema.index({ order: 1 });

export default mongoose.model<IPricing>("Pricing", PricingSchema);
