import { Notification } from '../models/Notification';
import { logger } from '../utils/logger';

export interface CreateNotificationParams {
  userId: any;
  title: string;
  message: string;
  link?: string;
  type?: 'system' | 'project' | 'quotation' | 'payment';
}

export async function createNotification(params: CreateNotificationParams): Promise<void> {
  try {
    await Notification.create({
      userId: params.userId,
      title: params.title,
      message: params.message,
      link: params.link,
      type: params.type || 'system',
      isRead: false,
    });
  } catch (err) {
    logger.error('Failed to create notification', err, { userId: params.userId, title: params.title });
  }
}
