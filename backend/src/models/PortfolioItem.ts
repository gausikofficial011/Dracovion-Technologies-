import mongoose, { Schema, Document } from 'mongoose';
import { ServiceCategory } from '../types';

export interface IPortfolioItem extends Document {
  slug: string;
  title: string;
  clientType: string;
  industry: string;
  summary: string;
  problemStatement: string;
  solutionOverview: string;
  techStack: string[];
  outcomeMetrics: string[];
  isSampleProject: boolean;
  category: ServiceCategory;
  liveUrl?: string;
  imageUrl?: string;
  isFeatured: boolean;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PortfolioItemSchema = new Schema<IPortfolioItem>(
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
    clientType: {
      type: String,
      required: true,
    },
    industry: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    problemStatement: {
      type: String,
      required: true,
    },
    solutionOverview: {
      type: String,
      required: true,
    },
    techStack: [
      {
        type: String,
      },
    ],
    outcomeMetrics: [
      {
        type: String,
      },
    ],
    isSampleProject: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    liveUrl: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const PortfolioItem = mongoose.model<IPortfolioItem>('PortfolioItem', PortfolioItemSchema);
