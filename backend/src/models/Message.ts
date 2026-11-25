import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  projectId?: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  clientId?: mongoose.Types.ObjectId;
  channelType: 'support' | 'project' | 'order';
  senderId: mongoose.Types.ObjectId;
  content: string;
  attachments: mongoose.Types.ObjectId[];
  readBy: Array<{
    userId: mongoose.Types.ObjectId;
    readAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: false,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'ProjectOrder',
      required: false,
      index: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    channelType: {
      type: String,
      enum: ['support', 'project', 'order'],
      default: 'support',
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    attachments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'FileRecord',
      },
    ],
    readBy: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        readAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
