import mongoose, { Schema, Document } from 'mongoose';
import { PaymentMethod, PaymentStatus } from '../types';

export interface IPayment extends Document {
  paymentReference: string; // e.g. PAY-2026-0001
  projectId: mongoose.Types.ObjectId;
  invoiceId?: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  amountMinor: number; // in paise
  currency: string; // INR
  paymentMethod: PaymentMethod;
  transactionReference: string; // UTR or UPI Transaction ID
  submissionDate: Date;
  status: PaymentStatus;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  verificationNotes?: string;
  idempotencyKey?: string;
  receiptFileKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    paymentReference: {
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
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amountMinor: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    paymentMethod: {
      type: String,
      enum: ['bank_transfer_neft_rtgs', 'upi', 'cash', 'cheque', 'other'],
      required: true,
    },
    transactionReference: {
      type: String,
      required: true,
      trim: true,
    },
    submissionDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'submitted', 'verified', 'rejected', 'refunded'],
      default: 'submitted',
      index: true,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
    verificationNotes: {
      type: String,
    },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    receiptFileKey: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
