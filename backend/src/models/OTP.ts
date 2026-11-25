import mongoose, { Schema, Document } from 'mongoose';

export type OTPPurpose = 'email_verification' | 'login' | 'password_reset';

/**
 * OTP document interface.
 * Stores hashed one-time passwords for email verification, login, and password reset flows.
 */
export interface IOTP extends Document {
  /** Recipient email address (normalized to lowercase) */
  email: string;
  /** bcrypt hash of the 6-digit plaintext OTP */
  otpHash: string;
  /** The flow this OTP was issued for */
  purpose: OTPPurpose;
  /** Absolute timestamp at which this document and its OTP expire (TTL index) */
  expiresAt: Date;
  /** Number of failed verification attempts made against this OTP */
  attempts: number;
  /** Whether the OTP has already been consumed (successfully verified) */
  isUsed: boolean;
  /** IP address of the requester at issuance time (optional, for audit purposes) */
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OTPSchema = new Schema<IOTP>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ['email_verification', 'login', 'password_reset'],
      required: true,
    },
    /**
     * MongoDB TTL index: documents are automatically deleted by MongoDB
     * after the wall-clock time stored in `expiresAt` has passed.
     * expireAfterSeconds: 0 means "delete exactly at expiresAt".
     */
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
    attempts: {
      type: Number,
      default: 0,
      max: 5,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to efficiently query the latest active OTP for a given email + purpose
OTPSchema.index({ email: 1, purpose: 1, isUsed: 1, expiresAt: 1 });

export const OTP = mongoose.model<IOTP>('OTP', OTPSchema);
