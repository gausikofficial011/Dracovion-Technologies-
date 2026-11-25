import mongoose, { Schema, Document } from 'mongoose';

export interface IFileRecord extends Document {
  fileKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storageDriver: 'local' | 's3';
  storagePath: string;
  uploadedBy: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  isDeliverable: boolean;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const FileRecordSchema = new Schema<IFileRecord>(
  {
    fileKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    sizeBytes: {
      type: Number,
      required: true,
    },
    storageDriver: {
      type: String,
      enum: ['local', 's3'],
      default: 'local',
    },
    storagePath: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      index: true,
    },
    isDeliverable: {
      type: Boolean,
      default: false,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const FileRecord = mongoose.model<IFileRecord>('FileRecord', FileRecordSchema);
