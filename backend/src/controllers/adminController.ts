import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { Enquiry } from '../models/Enquiry';
import { Project } from '../models/Project';
import { Quotation } from '../models/Quotation';
import { Payment } from '../models/Payment';
import { Invoice } from '../models/Invoice';
import { AuditLog } from '../models/AuditLog';
import { AuthenticatedRequest, UserRole } from '../types';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import { recordAuditLog } from '../services/auditService';
import { env } from '../config/env';

export async function getDashboardMetrics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const [
      totalEnquiries,
      newEnquiries,
      activeProjects,
      completedProjects,
      pendingQuotations,
      verifiedPaymentsAgg,
      pendingPaymentsCount,
      totalClients,
      recentEnquiries,
      recentProjects,
    ] = await Promise.all([
      Enquiry.countDocuments(),
      Enquiry.countDocuments({ status: 'new' }),
      Project.countDocuments({ status: { $in: ['approved', 'in_progress', 'review'] } }),
      Project.countDocuments({ status: 'completed' }),
      Quotation.countDocuments({ status: { $in: ['sent', 'negotiating'] } }),
      Payment.aggregate([
        { $match: { status: 'verified' } },
        { $group: { _id: null, totalMinor: { $sum: '$amountMinor' } } },
      ]),
      Payment.countDocuments({ status: 'submitted' }),
      User.countDocuments({ role: { $in: ['client', 'student'] } }),
      Enquiry.find().sort({ createdAt: -1 }).limit(5),
      Project.find().sort({ updatedAt: -1 }).limit(5).populate('clientId', 'fullName email companyName'),
    ]);

    const totalRevenueVerifiedMinor = verifiedPaymentsAgg.length > 0 ? verifiedPaymentsAgg[0].totalMinor : 0;

    res.json({
      success: true,
      metrics: {
        totalEnquiries,
        newEnquiries,
        activeProjects,
        completedProjects,
        pendingQuotations,
        totalRevenueVerifiedMinor,
        pendingPaymentsCount,
        totalClients,
      },
      recentEnquiries,
      recentProjects,
    });
  } catch (err) {
    next(err);
  }
}

export async function getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const role = req.query.role as string;
    const status = req.query.status as string;
    const search = (req.query.search as string)?.trim();

    const filter: any = {};
    if (role && role !== 'all') filter.role = role;
    if (status && status !== 'all') filter.status = status;
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { fullName: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
        { companyName: { $regex: escaped, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('-passwordHash -employeeManagedPassword')
      .sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
}

const EXECUTIVE_STATUS_MANAGERS: UserRole[] = ['owner', 'super_admin', 'ceo'];

/**
 * PATCH /api/v1/admin/users/:id/status
 * Allows President (owner), Super Admin (super_admin), and CEO (ceo) to activate
 * or disable/suspend user accounts when fraud or security policy violations are detected.
 */
export async function updateUserStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = req.user || (req.session as any)?.user;
    if (!sessionUser || !EXECUTIVE_STATUS_MANAGERS.includes(sessionUser.role)) {
      throw new ForbiddenError('Only the President, Super Admin, or CEO may activate or disable accounts.');
    }

    const { status, isFraud, reason } = z
      .object({
        status: z.enum(['active', 'suspended']),
        isFraud: z.boolean().optional().default(false),
        reason: z.string().trim().max(300).optional(),
      })
      .parse(req.body);

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      throw new NotFoundError('User account not found.');
    }

    if (targetUser._id.toString() === sessionUser.userId?.toString() && status === 'suspended') {
      throw new BadRequestError('You cannot disable your own active executive account.');
    }

    if (['owner', 'super_admin'].includes(targetUser.role) && sessionUser.role === 'ceo') {
      throw new ForbiddenError('CEO cannot disable President or Super Admin executive accounts.');
    }

    const oldStatus = targetUser.status;
    const resolvedReason =
      reason ||
      (status === 'suspended'
        ? isFraud
          ? 'Account disabled due to suspected fraudulent activity.'
          : 'Account disabled by executive governance.'
        : 'Account verified and reactivated by executive governance.');

    targetUser.status = status;
    targetUser.fraudFlag = status === 'suspended' ? Boolean(isFraud) : false;
    targetUser.moderationReason = resolvedReason;
    targetUser.moderatedBy = `${sessionUser.role.toUpperCase()} (${sessionUser.email})`;
    targetUser.moderatedAt = new Date();
    await targetUser.save();

    const auditAction =
      status === 'suspended'
        ? isFraud
          ? 'USER_ACCOUNT_DISABLED_FRAUD'
          : 'USER_ACCOUNT_DISABLED'
        : 'USER_ACCOUNT_ACTIVATED';

    await recordAuditLog({
      userId: sessionUser.userId,
      action: auditAction,
      entityType: 'User',
      entityId: targetUser._id.toString(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: {
        targetEmail: targetUser.email,
        targetRole: targetUser.role,
        oldStatus,
        newStatus: status,
        isFraud: targetUser.fraudFlag,
        reason: resolvedReason,
        actorRole: sessionUser.role,
      },
    });

    const sanitizedUser = targetUser.toObject();
    delete (sanitizedUser as any).passwordHash;
    delete (sanitizedUser as any).employeeManagedPassword;

    res.json({
      success: true,
      message:
        status === 'suspended'
          ? `Account ${targetUser.email} disabled${isFraud ? ' (fraud flag applied)' : ''}.`
          : `Account ${targetUser.email} activated and restored.`,
      user: sanitizedUser,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateUserRole(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = (req.session as any)?.user;

    // Only owner can assign administrative roles
    if (sessionUser.role !== 'owner') {
      throw new ForbiddenError('Only the primary platform Owner can modify user roles.');
    }

    const { role } = z
      .object({
        role: z.enum([
          'client',
          'student',
          'team_member',
          'project_manager',
          'finance_operator',
          'admin',
          'owner',
          'partner',
        ]),
      })
      .parse(req.body);

    const user = await User.findById(req.params.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const oldRole = user.role;
    user.role = role as UserRole;
    await user.save();

    await recordAuditLog({
      userId: sessionUser.userId,
      action: 'USER_ROLE_ELEVATED',
      entityType: 'User',
      entityId: user._id.toString(),
      ipAddress: req.ip,
      details: { oldRole, newRole: role, targetEmail: user.email },
    });

    res.json({ success: true, message: `Role updated to '${role}' for ${user.email}`, user });
  } catch (err) {
    next(err);
  }
}

export async function getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const action = req.query.action as string;

    const filter: any = {};
    if (action && action !== 'all') filter.action = action;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('userId', 'fullName email role'),
      AuditLog.countDocuments(filter),
    ]);

    res.json({
      success: true,
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json({
      success: true,
      settings: {
        businessName: env.BUSINESS_NAME,
        tagline: env.BUSINESS_TAGLINE,
        email: env.BUSINESS_EMAIL,
        phone: env.BUSINESS_PHONE,
        state: env.BUSINESS_ADDRESS_STATE,
        country: env.BUSINESS_ADDRESS_COUNTRY,
        isGstRegistered: env.BUSINESS_GST_REGISTERED,
        gstin: env.BUSINESS_GSTIN,
        pan: env.BUSINESS_PAN,
        currency: env.DEFAULT_CURRENCY,
        storageDriver: env.STORAGE_DRIVER,
      },
    });
  } catch (err) {
    next(err);
  }
}
