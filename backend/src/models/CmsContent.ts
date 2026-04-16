import mongoose, { Schema, Document } from "mongoose";

// Generic CMS content — stores hero, announcement, company info, SEO, etc.
export interface ICmsContent extends Document {
  key: string;         // e.g. "hero", "announcement", "company", "seo_home"
  data: Record<string, unknown>;
  updatedAt: Date;
}

const CmsContentSchema = new Schema<ICmsContent>(
  {
    key: { type: String, required: true, unique: true, trim: true },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model<ICmsContent>("CmsContent", CmsContentSchema);
