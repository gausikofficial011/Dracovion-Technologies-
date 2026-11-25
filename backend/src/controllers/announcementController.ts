import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { Announcement } from '../models/Announcement';
import { AuthenticatedRequest } from '../types';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';
import { recordAuditLog } from '../services/auditService';

/**
 * GET /api/v1/announcements/active
 * PUBLIC ENDPOINT: Accessible to ANY visitor (logged in or anonymous).
 * Returns sanitized public announcement metadata without exposing internal staff or leadership identities.
 */
export async function getActiveAnnouncement(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const doc = await Announcement.findOne({ isActive: true })
      .sort({ createdAt: -1 })
      .select('-authorName -authorRole')
      .lean();

    const sanitizedAnnouncement = doc
      ? {
          ...doc,
          badge: doc.badge && !/president/i.test(doc.badge) ? doc.badge : 'OFFICIAL ANNOUNCEMENT',
        }
      : null;

    res.json({
      success: true,
      announcement: sanitizedAnnouncement,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/announcements/admin/all
 * Lists all historical and active announcements for President & Admin governance.
 */
export async function getAllAnnouncements(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: announcements.length,
      announcements,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/announcements/admin
 * President / Owner / Super Admin issues a platform-wide public announcement.
 */
export async function createAnnouncement(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const schema = z.object({
      title: z.string().min(3, 'Announcement title is required').trim(),
      message: z.string().min(5, 'Announcement message is required').trim(),
      badge: z.string().trim().default('OFFICIAL ANNOUNCEMENT'),
      type: z.enum(['presidential', 'critical', 'release', 'general']).default('general'),
      linkUrl: z.string().trim().optional(),
      linkLabel: z.string().trim().default('Explore Details →'),
      isActive: z.boolean().default(true),
    });

    const data = schema.parse(req.body);

    const announcement = await Announcement.create({
      ...data,
      authorName: (req.user as any)?.fullName || 'Dracovion Leadership',
      authorRole: (req.user as any)?.role || 'owner',
    });

    await recordAuditLog({
      userId: req.user?.userId,
      action: 'PRESIDENTIAL_ANNOUNCEMENT_CREATED',
      entityType: 'Announcement',
      entityId: announcement._id.toString(),
      details: { title: data.title },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Presidential announcement published live to frontpage!',
      announcement,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/announcements/admin/:id/toggle
 * Toggle active broadcasting status on or off.
 */
export async function toggleAnnouncement(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      throw new NotFoundError('Announcement not found.');
    }

    announcement.isActive = !announcement.isActive;
    await announcement.save();

    await recordAuditLog({
      userId: req.user?.userId,
      action: 'PRESIDENTIAL_ANNOUNCEMENT_TOGGLED',
      entityType: 'Announcement',
      entityId: announcement._id.toString(),
      details: { isActive: announcement.isActive },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Announcement broadcast is now ${announcement.isActive ? 'ACTIVE' : 'INACTIVE'}.`,
      announcement,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/v1/announcements/admin/:id
 * Edit existing announcement.
 */
export async function updateAnnouncement(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      throw new NotFoundError('Announcement not found.');
    }

    const schema = z.object({
      title: z.string().min(3).trim().optional(),
      message: z.string().min(5).trim().optional(),
      badge: z.string().trim().optional(),
      type: z.enum(['presidential', 'critical', 'release', 'general']).optional(),
      linkUrl: z.string().trim().optional(),
      linkLabel: z.string().trim().optional(),
      isActive: z.boolean().optional(),
    });

    const data = schema.parse(req.body);
    if (data.title !== undefined) announcement.title = data.title;
    if (data.message !== undefined) announcement.message = data.message;
    if (data.badge !== undefined) announcement.badge = data.badge;
    if (data.type !== undefined) announcement.type = data.type;
    if (data.linkUrl !== undefined) announcement.linkUrl = data.linkUrl;
    if (data.linkLabel !== undefined) announcement.linkLabel = data.linkLabel;
    if (data.isActive !== undefined) announcement.isActive = data.isActive;

    await announcement.save();

    res.json({
      success: true,
      message: 'Announcement updated successfully.',
      announcement,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/announcements/admin/:id
 * Permanently remove announcement record.
 */
export async function deleteAnnouncement(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findByIdAndDelete(id);
    if (!announcement) {
      throw new NotFoundError('Announcement not found.');
    }

    res.json({
      success: true,
      message: 'Announcement record deleted.',
    });
  } catch (err) {
    next(err);
  }
}

