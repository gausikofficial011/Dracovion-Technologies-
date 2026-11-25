import mongoose, { Schema, Document } from 'mongoose';
import { InvoiceStatus } from '../types';

export interface IInvoiceLineItem {
  description: string;
  quantity: number;
  unitPriceMinor: number;
  amountMinor: number;
}

export interface IInvoice extends Document {
  invoiceNumber: string; // e.g. INV-2026-0001
  projectId: mongoose.Types.ObjectId;
  quotationId?: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  clientBillingDetails: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    address?: string;
    state?: string;
    gstin?: string;
  };
  businessDetails: {
    name: string;
    address: string;
    state: string;
    gstin?: string;
    pan?: string;
    email: string;
    phone: string;
  };
  issueDate: Date;
  dueDate: Date;
  lineItems: IInvoiceLineItem[];
  subtotalMinor: number;
  isGstApplicable: boolean;
  gstRatePercent: number;
  cgstMinor: number;
  sgstMinor: number;
  igstMinor: number;
  totalMinor: number;
  amountPaidMinor: number;
  balanceDueMinor: number;
  currency: string;
  status: InvoiceStatus;
  notes?: string;
  paymentInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    quotationId: {
      type: Schema.Types.ObjectId,
      ref: 'Quotation',
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    clientBillingDetails: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
      company: { type: String },
      address: { type: String },
      state: { type: String, default: 'Tamil Nadu' },
      gstin: { type: String },
    },
    businessDetails: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      state: { type: String, default: 'Tamil Nadu' },
      gstin: { type: String },
      pan: { type: String },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
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
    isGstApplicable: {
      type: Boolean,
      default: false,
    },
    gstRatePercent: {
      type: Number,
      default: 0,
    },
    cgstMinor: {
      type: Number,
      default: 0,
    },
    sgstMinor: {
      type: Number,
      default: 0,
    },
    igstMinor: {
      type: Number,
      default: 0,
    },
    totalMinor: {
      type: Number,
      required: true,
    },
    amountPaidMinor: {
      type: Number,
      default: 0,
    },
    balanceDueMinor: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['draft', 'issued', 'paid', 'partially_paid', 'void', 'cancelled'],
      default: 'issued',
      index: true,
    },
    notes: {
      type: String,
    },
    paymentInstructions: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema);
