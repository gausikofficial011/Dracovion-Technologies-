import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  status: 'Live Platform' | 'Active Production' | 'Private Beta';
  features: string[];
  metrics: string[];
  liveUrl?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    tagline: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['Live Platform', 'Active Production', 'Private Beta'],
      default: 'Active Production',
    },
    features: [{ type: String }],
    metrics: [{ type: String }],
    liveUrl: { type: String },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>('Product', ProductSchema);

