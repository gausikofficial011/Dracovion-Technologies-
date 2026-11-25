import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User';
import { AuthenticatedRequest, UserRole } from '../types';
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError, ForbiddenError } from '../utils/errors';
import { recordAuditLog } from '../services/auditService';
import { generateAndSendOTP, verifyOTP } from '../services/otpService';
import { env } from '../config/env';
import { encryptEmployeePassword } from '../utils/credentialCrypto';

const VALID_TEAM_CODES = new Set([
  'DRACOVION-TEAM-2026',
  'DRACOVION-INNOVATE',
  'DRACOVION-STAFF',
  process.env.TEAM_INVITE_CODE?.trim().toUpperCase(),
].filter(Boolean));

const registerSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  fullName: z.string().min(2, 'Full name is required').trim(),
  phone: z.string().optional(),
  role: z.enum(['client', 'student', 'team', 'team_member', 'partner']).default('client'), // Strictly disallow visitor/admin/owner escalation
  companyName: z.string().optional(),
  collegeOrUniversity: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  academicYear: z.string().optional(),
  degree: z.string().optional(),
  studentIdNumber: z.string().optional(),
  organizationType: z.string().optional(),
  websiteUrl: z.string().optional(),
  referralSource: z.string().optional(),
  invitationCode: z.string().optional(),
  partnershipInterest: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export async function register(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new ConflictError('An account with this email address already exists.');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    let dbRole: UserRole = 'client';
    let userStatus: 'active' | 'pending' = 'active';
    let welcomeMessage = 'Registration successful';

    if (data.role === 'student') {
      dbRole = 'student';
    } else if (data.role === 'partner') {
      dbRole = 'partner';
    } else if (data.role === 'team' || data.role === 'team_member') {
      dbRole = 'team_member';
      const providedCode = data.invitationCode?.trim().toUpperCase();
      if (providedCode && VALID_TEAM_CODES.has(providedCode)) {
        userStatus = 'active';
        welcomeMessage = 'Team member registration verified and activated.';
      } else {
        userStatus = 'pending';
        welcomeMessage =
          'Team registration submitted. Your account is pending administrative verification by Dracovion leadership.';
      }
    } else {
      dbRole = 'client';
    }

    const user = await User.create({
      email: data.email,
      passwordHash,
      fullName: data.fullName,
      phone: data.phone,
      role: dbRole,
      status: userStatus,
      companyName: data.companyName,
      collegeOrUniversity: data.collegeOrUniversity,
      department: data.department,
      designation: data.designation,
      academicYear: data.academicYear,
      degree: data.degree,
      studentIdNumber: data.studentIdNumber,
      organizationType: data.organizationType,
      websiteUrl: data.websiteUrl,
      referralSource: data.referralSource,
      invitationCode: data.invitationCode,
      partnershipInterest: data.partnershipInterest,
      isEmailVerified: true,
      lastLoginAt: userStatus === 'active' ? new Date() : undefined,
    });

    // Only establish active session if account is active
    if (userStatus === 'active') {
      (req.session as any).user = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      };
    }

    await recordAuditLog({
      userId: user._id,
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: user._id.toString(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { role: user.role, email: user.email, status: userStatus },
    });

    res.status(201).json({
      success: true,
      message: welcomeMessage,
      status: userStatus,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        companyName: user.companyName,
        collegeOrUniversity: user.collegeOrUniversity,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawEmail = String(req.body?.email || '').trim().replace('#', '@');
    req.body.email = rawEmail;
    const data = loginSchema.parse(req.body);

    const user = await User.findOne({ email: data.email.toLowerCase() });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status !== 'active') {
      if (user.status === 'pending') {
        throw new ForbiddenError(
          'Your account registration has been submitted and is currently pending administrative verification by Dracovion leadership. Please check back shortly.'
        );
      }
      throw new ForbiddenError(
        user.moderationReason
          ? `Your account has been disabled: ${user.moderationReason}`
          : 'Your account has been suspended or deactivated.'
      );
    }

    const isMatch = await user.comparePassword(data.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    user.lastLoginAt = new Date();
    await user.save();

    const portalType = user.portalType || (['super_admin', 'owner', 'ceo', 'employee'].includes(user.role) ? 'workspace' : 'client');
    const redirectTo = portalType === 'workspace'
      ? (user.role === 'super_admin' ? '/workspace/super-admin' : '/workspace/orders')
      : '/portal/dashboard';

    // Establish secure session
    (req.session as any).user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      portalType,
      department: user.department,
      designation: user.designation,
      employeeCode: user.employeeCode,
    };

    await recordAuditLog({
      userId: user._id,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user._id.toString(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'Login successful',
      portalType,
      redirectTo,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        portalType,
        companyName: user.companyName,
        collegeOrUniversity: user.collegeOrUniversity,
        department: user.department,
        designation: user.designation,
        employeeCode: user.employeeCode,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = (req.session as any)?.user;
    if (sessionUser) {
      await recordAuditLog({
        userId: sessionUser.userId,
        action: 'USER_LOGOUT',
        entityType: 'User',
        entityId: sessionUser.userId,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
    }

    req.session.destroy(err => {
      if (err) {
        return next(err);
      }
      res.clearCookie(env.SESSION_NAME);
      res.json({ success: true, message: 'Logged out successfully' });
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = (req.session as any)?.user;
    if (!sessionUser) {
      res.json({ success: true, user: null });
      return;
    }

    const user = await User.findById(sessionUser.userId).select('-passwordHash');
    if (!user || user.status !== 'active') {
      if (user && user.status !== 'active') {
        req.session?.destroy(() => {});
      }
      res.json({ success: true, user: null });
      return;
    }

    const portalType = user.portalType || (['super_admin', 'owner', 'ceo', 'employee'].includes(user.role) ? 'workspace' : 'client');

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role,
        portalType,
        accountType: user.accountType || (user.collegeOrUniversity ? 'student' : 'company'),
        companyName: user.companyName,
        collegeOrUniversity: user.collegeOrUniversity,
        department: user.department,
        degree: user.degree,
        academicYear: user.academicYear,
        registerNumber: user.registerNumber,
        githubProfile: user.githubProfile,
        linkedinProfile: user.linkedinProfile,
        projectDomain: user.projectDomain,
        industry: user.industry,
        designation: user.designation,
        companyWebsite: user.companyWebsite,
        companySize: user.companySize,
        gstin: user.gstin,
        city: user.city,
        state: user.state,
        workAddress: user.workAddress,
        bio: user.bio,
        employeeCode: user.employeeCode,
        isEmailVerified: user.isEmailVerified,
        status: user.status,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = (req.session as any)?.user;
    if (!sessionUser) {
      throw new UnauthorizedError('Authentication session required.');
    }

    const schema = z.object({
      fullName: z.string().min(2, 'Full name must be at least 2 characters').trim().optional(),
      avatarUrl: z.string().optional(),
      phone: z.string().trim().optional(),
      accountType: z.enum(['student', 'company', 'individual']).optional(),
      // Student specific
      collegeOrUniversity: z.string().trim().optional(),
      department: z.string().trim().optional(),
      degree: z.string().trim().optional(),
      academicYear: z.string().trim().optional(),
      registerNumber: z.string().trim().optional(),
      githubProfile: z.string().trim().optional(),
      linkedinProfile: z.string().trim().optional(),
      projectDomain: z.string().trim().optional(),
      // Company specific
      companyName: z.string().trim().optional(),
      industry: z.string().trim().optional(),
      designation: z.string().trim().optional(),
      companyWebsite: z.string().trim().optional(),
      companySize: z.string().trim().optional(),
      gstin: z.string().trim().optional(),
      // Location & Bio
      city: z.string().trim().optional(),
      state: z.string().trim().optional(),
      workAddress: z.string().trim().optional(),
      bio: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);

    const user = await User.findById(sessionUser.userId);
    if (!user) {
      throw new NotFoundError('User account not found.');
    }

    if (data.fullName !== undefined) user.fullName = data.fullName;
    if (data.avatarUrl !== undefined) user.avatarUrl = data.avatarUrl;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.accountType !== undefined) user.accountType = data.accountType;
    if (data.collegeOrUniversity !== undefined) user.collegeOrUniversity = data.collegeOrUniversity;
    if (data.department !== undefined) user.department = data.department;
    if (data.degree !== undefined) user.degree = data.degree;
    if (data.academicYear !== undefined) user.academicYear = data.academicYear;
    if (data.registerNumber !== undefined) user.registerNumber = data.registerNumber;
    if (data.githubProfile !== undefined) user.githubProfile = data.githubProfile;
    if (data.linkedinProfile !== undefined) user.linkedinProfile = data.linkedinProfile;
    if (data.projectDomain !== undefined) user.projectDomain = data.projectDomain;
    if (data.companyName !== undefined) user.companyName = data.companyName;
    if (data.industry !== undefined) user.industry = data.industry;
    if (data.designation !== undefined) user.designation = data.designation;
    if (data.companyWebsite !== undefined) user.companyWebsite = data.companyWebsite;
    if (data.companySize !== undefined) user.companySize = data.companySize;
    if (data.gstin !== undefined) user.gstin = data.gstin;
    if (data.city !== undefined) user.city = data.city;
    if (data.state !== undefined) user.state = data.state;
    if (data.workAddress !== undefined) user.workAddress = data.workAddress;
    if (data.bio !== undefined) user.bio = data.bio;

    await user.save();

    // Update session user snapshot
    if (req.session && (req.session as any).user) {
      (req.session as any).user.fullName = user.fullName;
      (req.session as any).user.companyName = user.companyName;
    }

    const portalType = user.portalType || (['super_admin', 'owner', 'ceo', 'employee'].includes(user.role) ? 'workspace' : 'client');

    res.json({
      success: true,
      message: 'Profile details saved successfully.',
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role,
        portalType,
        accountType: user.accountType || (user.collegeOrUniversity ? 'student' : 'company'),
        companyName: user.companyName,
        collegeOrUniversity: user.collegeOrUniversity,
        department: user.department,
        degree: user.degree,
        academicYear: user.academicYear,
        registerNumber: user.registerNumber,
        githubProfile: user.githubProfile,
        linkedinProfile: user.linkedinProfile,
        projectDomain: user.projectDomain,
        industry: user.industry,
        designation: user.designation,
        companyWebsite: user.companyWebsite,
        companySize: user.companySize,
        gstin: user.gstin,
        city: user.city,
        state: user.state,
        workAddress: user.workAddress,
        bio: user.bio,
        employeeCode: user.employeeCode,
        isEmailVerified: user.isEmailVerified,
        status: user.status,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = z.object({ email: z.string().email('Please provide a valid email address').trim().toLowerCase() }).parse(req.body);
    const user = await User.findOne({ email });

    if (user && user.status === 'active') {
      try {
        await generateAndSendOTP(user.email, 'password_reset', req.ip);
      } catch (otpErr: any) {
        // Only surface rate-limit cooldown if requested too rapidly; avoid account enumeration otherwise
        if (otpErr?.statusCode === 400) {
          throw otpErr;
        }
      }

      await recordAuditLog({
        userId: user._id,
        action: 'PASSWORD_RESET_REQUESTED',
        entityType: 'User',
        entityId: user._id.toString(),
        ipAddress: req.ip,
      });
    }

    // Always respond consistently to avoid account enumeration
    res.json({
      success: true,
      message: 'If an active account exists with this email, a 6-digit verification code has been dispatched.',
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, otp, newPassword } = z
      .object({
        email: z.string().email().trim().toLowerCase(),
        otp: z.string().trim().length(6, 'Verification code must be 6 digits'),
        newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
      })
      .parse(req.body);

    await verifyOTP(email, otp, 'password_reset');

    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFoundError('Invalid reset request');
    }

    if (user.status !== 'active') {
      throw new ForbiddenError(
        user.moderationReason
          ? `Account disabled: ${user.moderationReason}`
          : 'This account is currently suspended or pending verification.'
      );
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    // If the account belongs to an employee, update the encrypted recovery vault
    if (user.role === 'employee') {
      user.employeeManagedPassword = encryptEmployeePassword(newPassword);
    }
    await user.save();

    await recordAuditLog({
      userId: user._id,
      action: 'PASSWORD_RESET_COMPLETED',
      entityType: 'User',
      entityId: user._id.toString(),
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Password has been successfully updated. You may now log in.',
    });
  } catch (err) {
    next(err);
  }
}
