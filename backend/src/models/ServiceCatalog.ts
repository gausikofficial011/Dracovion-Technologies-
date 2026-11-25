import mongoose, { Schema, Document } from 'mongoose';
import { ServiceCategory } from '../types';

export interface IServiceCatalogItem extends Document {
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: ServiceCategory;
  indicativeStartingPriceMinor: number;
  typicalDeliveryDays: number;
  features: string[];
  deliverablesSummary: string[];
  isPopular: boolean;
  isActive: boolean;
  forStudents: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceCatalogSchema = new Schema<IServiceCatalogItem>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      required: true,
    },
    fullDescription: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    indicativeStartingPriceMinor: {
      type: Number,
      required: true,
      default: 0,
    },
    typicalDeliveryDays: {
      type: Number,
      required: true,
      default: 7,
    },
    features: [
      {
        type: String,
      },
    ],
    deliverablesSummary: [
      {
        type: String,
      },
    ],
    isPopular: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    forStudents: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ServiceCatalog = mongoose.model<IServiceCatalogItem>('ServiceCatalog', ServiceCatalogSchema);
