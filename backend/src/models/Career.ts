import mongoose, { Schema, Document } from 'mongoose';

export interface ICareer extends Document {
  slug: string;
  title: string;
  department: string;
  type: string;
  location: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CareerSchema = new Schema<ICareer>(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    title: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    location: { type: String, required: true, default: 'Tamil Nadu, India / Remote' },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    responsibilities: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Career = mongoose.model<ICareer>('Career', CareerSchema);

export interface IJobApplication extends Document {
  careerId?: mongoose.Types.ObjectId;
  jobTitle: string;
  applicantName: string;
  email: string;
  phone?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  coverNote?: string;
  resumeFileName?: string;
  status: 'new' | 'reviewed' | 'shortlisted' | 'interview' | 'rejected' | 'hired';
  createdAt: Date;
  updatedAt: Date;
}

const JobApplicationSchema = new Schema<IJobApplication>(
  {
    careerId: { type: Schema.Types.ObjectId, ref: 'Career' },
    jobTitle: { type: String, required: true },
    applicantName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String },
    portfolioUrl: { type: String },
    githubUrl: { type: String },
    linkedinUrl: { type: String },
    coverNote: { type: String },
    resumeFileName: { type: String },
    status: {
      type: String,
      enum: ['new', 'reviewed', 'shortlisted', 'interview', 'rejected', 'hired'],
      default: 'new',
    },
  },
  { timestamps: true }
);

export const JobApplication = mongoose.model<IJobApplication>('JobApplication', JobApplicationSchema);

