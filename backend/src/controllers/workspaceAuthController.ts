import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../types';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { recordAuditLog } from '../services/auditService';
import { assertUserIsActive, saveSession } from '../utils/session';

const workspaceLoginSchema = z.object({
  email: z.string().email('Please enter your work email').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

/**
 * POST /api/v1/auth/workspace/login
 * Staff login for Super Admin, CEO, Owner, and Employees.
 * Strictly disallows client logins.
 */
export async function workspaceLogin(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawEmail = String(req.body?.email || '').trim().replace('#', '@');
    req.body.email = rawEmail;
    const { email, password } = workspaceLoginSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      throw new UnauthorizedError('Invalid credentials. Workspace accounts are issued exclusively by Super Admin.');
    }

    // Verify this is an internal workspace user
    if (user.portalType !== 'workspace') {
      throw new ForbiddenError('This account is registered for Client Portal access, not Internal Workspace.');
    }

    assertUserIsActive(user, 'Your workspace account is pending administrative authorization.');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials.');
    }

    user.lastLoginAt = new Date();
    await user.save();

    (req.session as any).user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      portalType: user.portalType,
      department: user.department,
      designation: user.designation,
      employeeCode: user.employeeCode,
    };
    await saveSession(req);

    await recordAuditLog({
      userId: user._id,
      action: 'WORKSPACE_LOGIN',
      entityType: 'User',
      entityId: user._id.toString(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { role: user.role, employeeCode: user.employeeCode },
    });

    res.json({
      success: true,
      message: 'Workspace authenticated successfully.',
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        portalType: user.portalType,
        designation: user.designation,
        department: user.department,
        employeeCode: user.employeeCode,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/auth/workspace/me
 * Returns current staff profile & workspace permissions
 */
export async function getWorkspaceProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = (req.session as any)?.user;
    if (!sessionUser || sessionUser.portalType !== 'workspace') {
      res.json({ success: true, user: null });
      return;
    }

    const user = await User.findById(sessionUser.userId).select('-passwordHash');
    if (!user || user.status !== 'active') {
      res.json({ success: true, user: null });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        portalType: user.portalType,
        designation: user.designation,
        department: user.department,
        employeeCode: user.employeeCode,
        phone: user.phone,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

