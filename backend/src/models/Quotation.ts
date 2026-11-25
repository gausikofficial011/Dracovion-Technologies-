import mongoose, { Schema, Document } from 'mongoose';
import { QuotationStatus } from '../types';

export interface IQuotationLineItem {
  description: string;
  quantity: number;
  unitPriceMinor: number; // in paise (e.g. 100000 = ₹1,000.00)
  amountMinor: number;
}

export interface INegotiationRequest {
  requestedAt: Date;
  notes: string;
  requestedAmountMinor?: number;
  status: 'pending' | 'accepted' | 'declined' | 'countered';
}

export interface IQuotation extends Document {
  quotationNumber: string; // e.g. QTN-2026-0001
  version: number;
  previousVersionId?: mongoose.Types.ObjectId;
  enquiryId?: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  title: string;
  scopeDescription: string;
  lineItems: IQuotationLineItem[];
  subtotalMinor: number;
  taxRatePercent: number; // e.g. 0% or 18%
  taxAmountMinor: number;
  totalMinor: number;
  currency: string; // 'INR'
  estimatedDeliveryDays: number;
  revisionLimit: number;
  supportTerms: string;
  validityDays: number;
  expiresAt: Date;
  status: QuotationStatus;
  customerNotes?: string;
  negotiationRequests: INegotiationRequest[];
  acceptedAt?: Date;
  acceptedBy?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const QuotationSchema = new Schema<IQuotation>(
  {
    quotationNumber: {
      type: String,
      required: true,
      index: true,
    },
    version: {
      type: Number,
      required: true,
      default: 1,
    },
    previousVersionId: {
      type: Schema.Types.ObjectId,
      ref: 'Quotation',
    },
    enquiryId: {
      type: Schema.Types.ObjectId,
      ref: 'Enquiry',
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    scopeDescription: {
      type: String,
      required: true,
    },
    lineItems: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 },
        unitPriceMinor: { type: Number, required: true },
        amountMinor: { type: Number, required: true },
      },
    ],
    subtotalMinor: {
      type: Number,
      required: true,
    },
    taxRatePercent: {
      type: Number,
      default: 0,
    },
    taxAmountMinor: {
      type: Number,
      default: 0,
    },
    totalMinor: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    estimatedDeliveryDays: {
      type: Number,
      required: true,
      default: 14,
    },
    revisionLimit: {
      type: Number,
      default: 3,
    },
    supportTerms: {
      type: String,
      default: '30 days complimentary post-launch support and bug fixes.',
    },
    validityDays: {
      type: Number,
      default: 14,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'negotiating', 'accepted', 'rejected', 'expired', 'superseded'],
      default: 'draft',
      index: true,
    },
    customerNotes: {
      type: String,
    },
    negotiationRequests: [
      {
        requestedAt: { type: Date, default: Date.now },
        notes: { type: String, required: true },
        requestedAmountMinor: { type: Number },
        status: { type: String, enum: ['pending', 'accepted', 'declined', 'countered'], default: 'pending' },
      },
    ],
    acceptedAt: {
      type: Date,
    },
    acceptedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

QuotationSchema.index({ quotationNumber: 1, version: 1 }, { unique: true });

export const Quotation = mongoose.model<IQuotation>('Quotation', QuotationSchema);
