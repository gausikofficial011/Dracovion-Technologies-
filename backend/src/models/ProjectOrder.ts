import mongoose, { Schema, Document, CallbackError } from 'mongoose';
import { ServiceCategory } from '../types';

/** All valid statuses a ProjectOrder can transition through */
export type ProjectOrderStatus =
  | 'submitted'
  | 'reviewing'
  | 'quoted'
  | 'approved'
  | 'in_progress'
  | 'review_pending'
  | 'delivered'
  | 'completed'
  | 'revision_requested'
  | 'cancelled';

/** Priority levels that staff can assign to an order */
export type ProjectOrderPriority = 'normal' | 'high' | 'urgent';

export interface IProjectOrderUpdate {
  title: string;
  description: string;
  progressPercent: number;
  postedByName: string;
  createdAt: Date;
}

export interface IEmployeePaymentShare {
  upiId?: string;
  bankAccount?: string;
  ifsc?: string;
  holderName?: string;
  phone?: string;
  notes?: string;
  sharedAt?: Date;
}

export interface IClientPersonalDetails {
  fullName: string;
  phone: string;
  city: string;
  state?: string;
  address?: string;
  organization?: string;
  completedAt: Date;
}

export interface IHandoverPaymentProof {
  transactionRef: string;
  amountMinor: number;
  paidAt: Date;
  status: 'pending' | 'verified' | 'rejected';
  verifiedAt?: Date;
  verifiedBy?: string;
}

export interface IOrderDeliverable {
  title: string;
  fileKey: string;
  originalName: string;
  sizeBytes: number;
  downloadUrl?: string;
  uploadedAt: Date;
}

/**
 * ProjectOrder document interface.
 * Represents a service order placed by a client on the Dracovion platform.
 */
export interface IProjectOrder extends Document {
  /** Reference to the client (User) who placed this order */
  clientId: mongoose.Types.ObjectId;
  /** Human-readable unique order identifier, e.g. DRV-2026-0001 */
  orderNumber: string;
  /** The top-level service category this order falls under */
  serviceCategory: ServiceCategory;
  /** Short, descriptive title for the project */
  projectTitle: string;
  /** Full detailed description of the client's requirements */
  description: string;
  /** Client-provided budget range string, e.g. "₹50,000 - ₹1,00,000" */
  estimatedBudget?: string;
  /** Client's preferred deadline (free-form string, e.g. "within 2 months") */
  preferredDeadline?: string;
  /** Cloudinary / S3 URLs of any files the client attached to the order */
  attachmentUrls: string[];
  /** Current lifecycle status of the order */
  status: ProjectOrderStatus;
  /** Staff-assigned priority level */
  priority: ProjectOrderPriority;
  /** Employee (User) assigned to handle this order */
  assignedEmployeeId?: mongoose.Types.ObjectId;
  /** Internal staff-only notes (not visible to the client) */
  internalNotes: string;
  /** Note that the client can see (e.g. a status explanation from staff) */
  clientVisibleNote: string;
  /** Reference to the Quotation document generated for this order */
  quotationId?: mongoose.Types.ObjectId;
  /** Direct Employee Payment & Handover Governance */
  handoverStatus: 'in_development' | 'ready_for_handover' | 'payment_submitted' | 'handover_completed';
  clientPersonalDetails?: IClientPersonalDetails;
  employeePaymentShare?: IEmployeePaymentShare;
  handoverPaymentProof?: IHandoverPaymentProof;
  projectUpdates: IProjectOrderUpdate[];
  deliverables: IOrderDeliverable[];
  progressPercent: number;
  /** Timestamp when the deliverable was handed over to the client */
  deliveredAt?: Date;
  /** Timestamp when the client accepted the delivery and closed the order */
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectOrderSchema = new Schema<IProjectOrder>(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderNumber: {
      type: String,
      unique: true,
      trim: true,
      // Value is populated by the pre-save hook below; not required at schema level
      // so that the hook has a chance to generate it before validation.
    },
    serviceCategory: {
      type: String,
      enum: [
        'website_development',
        'portfolio_and_landing',
        'ecommerce',
        'fullstack_web_app',
        'backend_and_database',
        'ai_and_ml_solutions',
        'workflow_automation',
        'ui_ux_design',
        'technical_consulting',
        'maintenance_and_support',
        'allhunter_student_project',
        'allhunter_mentoring',
      ] as ServiceCategory[],
      required: true,
    },
    projectTitle: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    estimatedBudget: {
      type: String,
    },
    preferredDeadline: {
      type: String,
    },
    attachmentUrls: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: [
        'submitted',
        'reviewing',
        'quoted',
        'approved',
        'in_progress',
        'review_pending',
        'delivered',
        'completed',
        'revision_requested',
        'cancelled',
      ],
      default: 'submitted',
      index: true,
    },
    priority: {
      type: String,
      enum: ['normal', 'high', 'urgent'],
      default: 'normal',
    },
    assignedEmployeeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    internalNotes: {
      type: String,
      default: '',
    },
    clientVisibleNote: {
      type: String,
      default: '',
    },
    quotationId: {
      type: Schema.Types.ObjectId,
      ref: 'Quotation',
    },
    handoverStatus: {
      type: String,
      enum: ['in_development', 'ready_for_handover', 'payment_submitted', 'handover_completed'],
      default: 'in_development',
      index: true,
    },
    clientPersonalDetails: {
      fullName: { type: String, trim: true },
      phone: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      address: { type: String, trim: true },
      organization: { type: String, trim: true },
      completedAt: { type: Date },
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
    projectUpdates: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        progressPercent: { type: Number, default: 0 },
        postedByName: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    deliverables: [
      {
        title: { type: String, required: true },
        fileKey: { type: String, required: true },
        originalName: { type: String, required: true },
        sizeBytes: { type: Number, required: true },
        downloadUrl: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    progressPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    deliveredAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save hook: auto-generate the human-readable orderNumber if it has not
 * already been assigned (i.e. only on the very first save of a new document).
 *
 * Format: DRV-YYYY-NNNN
 *   YYYY = four-digit calendar year of creation
 *   NNNN = zero-padded 4-digit sequential count of orders created this year
 *
 * The count is derived by counting existing documents whose orderNumber starts
 * with "DRV-YYYY-", making it resilient to gaps caused by deleted documents
 * while still providing a monotonically increasing sequence within the year.
 */
ProjectOrderSchema.pre('save', async function (next: (err?: CallbackError) => void) {
  // Only generate on the very first save (new document with no orderNumber yet)
  if (!this.isNew || this.orderNumber) {
    return next();
  }

  try {
    const year = new Date().getFullYear();
    const prefix = `DRV-${year}-`;

    // Count how many orders already exist for this calendar year
    const existingCount = await mongoose.model('ProjectOrder').countDocuments({
      orderNumber: { $regex: `^${prefix}` },
    });

    // Pad the sequential number to 4 digits (e.g. 0001, 0012, 0123, 1234)
    const sequentialNumber = String(existingCount + 1).padStart(4, '0');
    this.orderNumber = `${prefix}${sequentialNumber}`;

    return next();
  } catch (err) {
    return next(err as CallbackError);
  }
});

export const ProjectOrder = mongoose.model<IProjectOrder>('ProjectOrder', ProjectOrderSchema);
