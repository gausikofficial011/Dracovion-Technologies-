import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  message: string;
  badge: string;
  type: 'presidential' | 'critical' | 'release' | 'general';
  linkUrl?: string;
  linkLabel?: string;
  isActive: boolean;
  authorName: string;
  authorRole: string;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    badge: {
      type: String,
      default: 'OFFICIAL ANNOUNCEMENT',
      trim: true,
    },
    type: {
      type: String,
      enum: ['presidential', 'critical', 'release', 'general'],
      default: 'general',
    },
    linkUrl: {
      type: String,
      trim: true,
    },
    linkLabel: {
      type: String,
      trim: true,
      default: 'Explore Details →',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    authorName: {
      type: String,
      default: 'Dracovion Leadership',
      trim: true,
    },
    authorRole: {
      type: String,
      default: 'Executive Leadership',
      trim: true,
    },
  },
  { timestamps: true }
);

export const Announcement = mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);

