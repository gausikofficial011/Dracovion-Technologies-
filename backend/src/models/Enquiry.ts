import mongoose, { Schema, Document } from 'mongoose';
import { ServiceCategory } from '../types';

export interface IEnquiry extends Document {
  customerName: string;
  email: string;
  phone?: string;
  serviceCategory: ServiceCategory;
  projectTitle: string;
  requirementsDescription: string;
  preferredDeadline?: string;
  budgetRange: string;
  pricingPreference: 'fixed' | 'negotiable';
  attachments: string[];
  status: 'new' | 'under_review' | 'contacted' | 'quoted' | 'converted' | 'archived' | 'rejected';
  assignedTo?: mongoose.Types.ObjectId;
  internalNotes?: string;
  privacyConsent: boolean;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EnquirySchema = new Schema<IEnquiry>(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    serviceCategory: {
      type: String,
      required: true,
      index: true,
    },
    projectTitle: {
      type: String,
      required: true,
      trim: true,
    },
    requirementsDescription: {
      type: String,
      required: true,
    },
    preferredDeadline: {
      type: String,
    },
    budgetRange: {
      type: String,
      required: true,
    },
    pricingPreference: {
      type: String,
      enum: ['fixed', 'negotiable'],
      default: 'negotiable',
    },
    attachments: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ['new', 'under_review', 'contacted', 'quoted', 'converted', 'archived', 'rejected'],
      default: 'new',
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    internalNotes: {
      type: String,
    },
    privacyConsent: {
      type: Boolean,
      required: true,
      default: true,
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Enquiry = mongoose.model<IEnquiry>('Enquiry', EnquirySchema);
