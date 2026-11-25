import mongoose, { Schema, Document } from 'mongoose';
import { ProjectStatus, ServiceCategory } from '../types';

export interface IMilestone {
  title: string;
  description?: string;
  dueDate?: Date;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: Date;
}

export interface IDeliverable {
  title: string;
  fileKey: string;
  originalName: string;
  sizeBytes: number;
  uploadedAt: Date;
  isApproved: boolean;
}

export interface IStatusHistoryItem {
  fromStatus: ProjectStatus;
  toStatus: ProjectStatus;
  changedBy: mongoose.Types.ObjectId;
  note?: string;
  timestamp: Date;
}

export interface IProject extends Document {
  projectCode: string;
  title: string;
  description: string;
  category: ServiceCategory;
  clientId: mongoose.Types.ObjectId;
  quotationId?: mongoose.Types.ObjectId;
  status: ProjectStatus;
  progressPercent: number;
  budgetMinor: number;
  currency: string;
  startDate?: Date;
  targetDeliveryDate?: Date;
  actualDeliveredDate?: Date;
  assignedTeam: Array<{
    userId: mongoose.Types.ObjectId;
    roleInProject: string;
  }>;
  milestones: IMilestone[];
  deliverables: IDeliverable[];
  statusHistory: IStatusHistoryItem[];
  handoverStatus: 'in_development' | 'ready_for_handover' | 'payment_submitted' | 'handover_cleared';
  employeePaymentShare?: {
    upiId?: string;
    bankAccount?: string;
    ifsc?: string;
    holderName?: string;
    phone?: string;
    notes?: string;
    sharedAt?: Date;
  };
  handoverPaymentProof?: {
    transactionRef: string;
    amountMinor: number;
    paidAt: Date;
    status: 'pending' | 'verified' | 'rejected';
    verifiedAt?: Date;
    verifiedBy?: string;
  };
  isStudentProject: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    projectCode: {
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
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    quotationId: {
      type: Schema.Types.ObjectId,
      ref: 'Quotation',
    },
    status: {
      type: String,
      enum: [
        'requested',
        'reviewing',
        'quoted',
        'approved',
        'in_progress',
        'review',
        'delivered',
        'completed',
        'revision_required',
        'blocked',
        'rejected',
        'cancelled',
      ],
      default: 'approved',
      index: true,
    },
    progressPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    budgetMinor: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    startDate: {
      type: Date,
    },
    targetDeliveryDate: {
      type: Date,
    },
    actualDeliveredDate: {
      type: Date,
    },
    assignedTeam: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        roleInProject: { type: String, default: 'Lead Developer' },
      },
    ],
    milestones: [
      {
        title: { type: String, required: true },
        description: { type: String },
        dueDate: { type: Date },
        status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
        completedAt: { type: Date },
      },
    ],
    deliverables: [
      {
        title: { type: String, required: true },
        fileKey: { type: String, required: true },
        originalName: { type: String, required: true },
        sizeBytes: { type: Number, required: true },
        uploadedAt: { type: Date, default: Date.now },
        isApproved: { type: Boolean, default: false },
      },
    ],
    statusHistory: [
      {
        fromStatus: { type: String, required: true },
        toStatus: { type: String, required: true },
        changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        note: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    handoverStatus: {
      type: String,
      enum: ['in_development', 'ready_for_handover', 'payment_submitted', 'handover_cleared'],
      default: 'in_development',
      index: true,
    },
    employeePaymentShare: {
      upiId: { type: String, trim: true },
      bankAccount: { type: String, trim: true },
      ifsc: { type: String, trim: true },
      holderName: { type: String, trim: true },
      phone: { type: String, trim: true },
      notes: { type: String, trim: true },
      sharedAt: { type: Date },
    },
    handoverPaymentProof: {
      transactionRef: { type: String, trim: true },
      amountMinor: { type: Number },
      paidAt: { type: Date },
      status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
      verifiedAt: { type: Date },
      verifiedBy: { type: String },
    },
    isStudentProject: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
