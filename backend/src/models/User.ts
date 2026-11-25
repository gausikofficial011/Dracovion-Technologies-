import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { UserRole, AuthProvider, PortalType } from '../types';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  portalType: PortalType;
  authProvider: AuthProvider;
  googleId?: string;
  githubId?: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  status: 'active' | 'suspended' | 'pending';
  fraudFlag?: boolean;
  moderationReason?: string;
  moderatedBy?: string;
  moderatedAt?: Date;
  // Client & Student profile classifications
  accountType?: 'student' | 'company' | 'individual';
  companyName?: string;
  collegeOrUniversity?: string;
  department?: string;
  degree?: string;
  academicYear?: string;
  registerNumber?: string;
  githubProfile?: string;
  linkedinProfile?: string;
  projectDomain?: string;
  industry?: string;
  companyWebsite?: string;
  companySize?: string;
  gstin?: string;
  city?: string;
  state?: string;
  workAddress?: string;
  bio?: string;
  organizationType?: string;
  websiteUrl?: string;
  referralSource?: string;
  invitationCode?: string;
  partnershipInterest?: string;
  // Workspace-specific extended fields
  designation?: string;
  employeeCode?: string;
  employeeManagedPassword?: string; // Encrypted recovery password (ONLY for role === 'employee')
  employeePaymentUpi?: string; // Direct employee UPI ID
  employeePaymentBankAccount?: string; // Direct employee bank account
  employeePaymentIfsc?: string; // Direct employee IFSC code
  employeePaymentNotes?: string; // Payment instructions shared by employee
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: false,
      default: '',
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ['client', 'employee', 'owner', 'ceo', 'super_admin', 'admin', 'student', 'partner', 'team_member'],
      default: 'client',
      index: true,
    },
    portalType: {
      type: String,
      enum: ['client', 'workspace'],
      default: 'client',
      index: true,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google', 'github'],
      default: 'local',
    },
    googleId: { type: String, sparse: true, index: true },
    githubId: { type: String, sparse: true, index: true },
    avatarUrl: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['active', 'suspended', 'pending'],
      default: 'active',
    },
    fraudFlag: { type: Boolean, default: false },
    moderationReason: { type: String, trim: true },
    moderatedBy: { type: String, trim: true },
    moderatedAt: { type: Date },
    accountType: {
      type: String,
      enum: ['student', 'company', 'individual'],
      default: 'company',
      trim: true,
    },
    companyName: { type: String, trim: true },
    collegeOrUniversity: { type: String, trim: true },
    department: { type: String, trim: true },
    degree: { type: String, trim: true },
    academicYear: { type: String, trim: true },
    registerNumber: { type: String, trim: true },
    githubProfile: { type: String, trim: true },
    linkedinProfile: { type: String, trim: true },
    projectDomain: { type: String, trim: true },
    industry: { type: String, trim: true },
    companyWebsite: { type: String, trim: true },
    companySize: { type: String, trim: true },
    gstin: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    workAddress: { type: String, trim: true },
    bio: { type: String, trim: true },
    organizationType: { type: String, trim: true },
    websiteUrl: { type: String, trim: true },
    referralSource: { type: String, trim: true },
    invitationCode: { type: String, trim: true },
    partnershipInterest: { type: String, trim: true },
    designation: { type: String, trim: true },
    employeeCode: { type: String, trim: true },
    employeeManagedPassword: { type: String }, // Stored encrypted for employees only
    employeePaymentUpi: { type: String, trim: true },
    employeePaymentBankAccount: { type: String, trim: true },
    employeePaymentIfsc: { type: String, trim: true },
    employeePaymentNotes: { type: String, trim: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', UserSchema);
