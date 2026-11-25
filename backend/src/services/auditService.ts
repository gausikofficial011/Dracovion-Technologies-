import { AuditLog } from '../models/AuditLog';
import { logger } from '../utils/logger';

export interface AuditLogOptions {
  userId?: any;
  action: string;
  entityType: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}

export async function recordAuditLog(options: AuditLogOptions): Promise<void> {
  try {
    await AuditLog.create({
      userId: options.userId,
      action: options.action,
      entityType: options.entityType,
      entityId: options.entityId,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      details: options.details,
      timestamp: new Date(),
    });
  } catch (err) {
    logger.error('Failed to write audit log record', err, { action: options.action });
  }
}
