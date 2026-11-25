import mongoose, { Schema, Document } from 'mongoose';

export interface ITestimonial extends Document {
  author: string;
  role: string;
  company: string;
  location: string;
  quote: string;
  rating: number;
  category: 'client' | 'student' | 'partner';
  verified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    author: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    quote: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    category: { type: String, enum: ['client', 'student', 'partner'], default: 'client' },
    verified: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Testimonial = mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);

