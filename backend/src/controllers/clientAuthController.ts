import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../types';
import { BadRequestError, ForbiddenError, UnauthorizedError } from '../utils/errors';
import { generateAndSendOTP, verifyOTP } from '../services/otpService';
import {
  getGoogleAuthURL,
  exchangeGoogleCode,
  verifyGoogleIdToken,
  getGitHubAuthURL,
  exchangeGitHubCode,
} from '../services/oauthService';
import { sendWelcomeEmail } from '../services/emailService';
import { recordAuditLog } from '../services/auditService';
import { env } from '../config/env';
import { getAllowedOrigins, normalizeOrigin } from '../config/cors';
import { logger } from '../utils/logger';

const sendOtpSchema = z.object({
  email: z.string().email('Please provide a valid email address').trim().toLowerCase(),
  purpose: z.enum(['email_verification', 'login', 'password_reset']).default('email_verification'),
});

const verifyOtpSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  otp: z.string().length(6, 'Verification code must be 6 digits'),
  fullName: z.string().min(2).optional(),
  password: z.string().min(8).optional(),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  collegeOrUniversity: z.string().optional(),
  department: z.string().optional(),
  accountType: z.enum(['student', 'company', 'individual']).optional(),
});

const clientLoginSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

/**
 * POST /api/v1/auth/client/send-otp
 * Dispatches a 6-digit OTP to the client's email via Gmail.
 */
export async function sendClientOTP(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, purpose } = sendOtpSchema.parse(req.body);
    const result = await generateAndSendOTP(email, purpose, req.ip);

    res.json({
      success: true,
      message: result.message,
      cooldownSeconds: result.cooldownSeconds,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/client/verify-otp
 * Verifies the 6-digit OTP and either creates a new verified client or logs in existing client.
 */
export async function verifyClientOTP(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = verifyOtpSchema.parse(req.body);

    // 1. Verify OTP code
    await verifyOTP(data.email, data.otp, 'email_verification');

    // 2. Check if user already exists
    let user = await User.findOne({ email: data.email });

    if (user) {
      const inactiveMsg = getInactiveAccountMessage(user);
      if (inactiveMsg) {
        throw new ForbiddenError(inactiveMsg);
      }
      // Existing client logging in or confirming email
      if (user.portalType !== 'client') {
        throw new BadRequestError('This email is registered for internal workspace access. Please use the Workspace Portal.');
      }
      user.isEmailVerified = true;
      user.lastLoginAt = new Date();
      if (data.phone) user.phone = data.phone;
      if (data.companyName) user.companyName = data.companyName;
      if (data.collegeOrUniversity) user.collegeOrUniversity = data.collegeOrUniversity;
      if (data.department) user.department = data.department;
      if (data.accountType) user.accountType = data.accountType;
      await user.save();
    } else {
      // New client registration
      let passwordHash = '';
      if (data.password) {
        passwordHash = await bcrypt.hash(data.password, 12);
      }

      user = await User.create({
        email: data.email,
        passwordHash,
        fullName: data.fullName || data.email.split('@')[0],
        phone: data.phone,
        companyName: data.companyName,
        collegeOrUniversity: data.collegeOrUniversity,
        department: data.department,
        accountType: data.accountType || (data.collegeOrUniversity ? 'student' : 'company'),
        role: 'client',
        portalType: 'client',
        authProvider: 'local',
        isEmailVerified: true,
        status: 'active',
        lastLoginAt: new Date(),
      });

      // Send welcome email asynchronously
      sendWelcomeEmail(user.email, user.fullName).catch(() => {});
    }

    // 3. Establish session
    (req.session as any).user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      portalType: user.portalType,
    };

    await recordAuditLog({
      userId: user._id,
      action: 'CLIENT_VERIFIED_OTP',
      entityType: 'User',
      entityId: user._id.toString(),
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Email successfully verified! Logged into Dracovion Client Portal.',
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        portalType: user.portalType,
        accountType: user.accountType || (user.collegeOrUniversity ? 'student' : 'company'),
        companyName: user.companyName,
        collegeOrUniversity: user.collegeOrUniversity,
        department: user.department,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/client/login
 * Standard email + password login for verified clients
 */
export async function clientPasswordLogin(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = clientLoginSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    if (user.portalType !== 'client') {
      throw new BadRequestError('This account is registered for internal workspace access. Please log in at the Workspace Portal.');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedError('Your client account has been suspended. Please contact Dracovion support.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    user.lastLoginAt = new Date();
    await user.save();

    (req.session as any).user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      portalType: user.portalType,
    };

    await recordAuditLog({
      userId: user._id,
      action: 'CLIENT_LOGIN',
      entityType: 'User',
      entityId: user._id.toString(),
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        portalType: user.portalType,
        accountType: user.accountType || (user.collegeOrUniversity ? 'student' : 'company'),
        companyName: user.companyName,
        collegeOrUniversity: user.collegeOrUniversity,
        department: user.department,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/auth/client/google
 * Initiates Google OAuth2. Seamlessly redirects browser requests to Google accounts
 * or returns JSON if requested programmatically.
 */
const ALLOWED_CLIENT_ORIGINS = new Set(getAllowedOrigins());

function rememberClientOrigin(req: AuthenticatedRequest): void {
  const rawSource = req.get('origin') || req.get('referer');
  if (!rawSource) return;
  try {
    const parsedOrigin = new URL(rawSource).origin;
    if (ALLOWED_CLIENT_ORIGINS.has(parsedOrigin) && req.session) {
      (req.session as any).oauthClientOrigin = parsedOrigin;
    }
  } catch {
    // ignore malformed origin header
  }
}

function getClientRedirectBase(req: AuthenticatedRequest): string {
  const savedOrigin = (req.session as any)?.oauthClientOrigin;
  if (savedOrigin && ALLOWED_CLIENT_ORIGINS.has(savedOrigin)) {
    return savedOrigin;
  }
  return normalizeOrigin(env.CLIENT_URL);
}

export function getGoogleAuthUrlHandler(req: AuthenticatedRequest, res: Response): void {
  rememberClientOrigin(req);
  const customRedirect = (req.query.redirect_uri as string) || undefined;
  const url = getGoogleAuthURL('client_portal', customRedirect);

  if (req.query.format === 'json' || (req.headers.accept === 'application/json' && !req.headers.accept?.includes('text/html'))) {
    res.json({ success: true, url });
  } else {
    res.redirect(url);
  }
}

/**
 * GET /api/v1/auth/client/google/callback
 * Handles Google OAuth redirect callback, provisions/updates user account, and sets session.
 */
export async function handleGoogleCallback(req: AuthenticatedRequest, res: Response): Promise<void> {
  const code = req.query.code as string;
  const redirectUri = (req.query.redirect_uri as string) || undefined;
  const clientBase = getClientRedirectBase(req);

  if (!code) {
    res.redirect(`${clientBase}/signin?error=no_code`);
    return;
  }

  try {
    const googleUser = await exchangeGoogleCode(code, redirectUri);
    let user = await User.findOne({ email: googleUser.email.toLowerCase() });

    if (user) {
      const inactiveMsg = getInactiveAccountMessage(user);
      if (inactiveMsg) {
        res.redirect(`${clientBase}/signin?error=${encodeURIComponent(inactiveMsg)}`);
        return;
      }
      user.googleId = googleUser.id;
      user.avatarUrl = user.avatarUrl || googleUser.picture;
      user.isEmailVerified = true;
      user.lastLoginAt = new Date();
      await user.save();
    } else {
      user = await User.create({
        email: googleUser.email.toLowerCase(),
        fullName: googleUser.name || googleUser.email.split('@')[0],
        googleId: googleUser.id,
        avatarUrl: googleUser.picture,
        role: 'client',
        portalType: 'client',
        authProvider: 'google',
        isEmailVerified: true,
        status: 'active',
        lastLoginAt: new Date(),
      });

      sendWelcomeEmail(user.email, user.fullName).catch(() => {});
    }

    const portalType = user.portalType || (['super_admin', 'owner', 'ceo', 'employee'].includes(user.role) ? 'workspace' : 'client');
    const targetDashboard = portalType === 'workspace'
      ? (user.role === 'super_admin' ? '/workspace/super-admin' : '/workspace/orders')
      : '/portal/dashboard';

    (req.session as any).user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      portalType,
    };

    await recordAuditLog({
      userId: user._id,
      action: 'GOOGLE_OAUTH_LOGIN',
      entityType: 'User',
      entityId: user._id.toString(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { email: user.email, portalType, role: user.role },
    });

    req.session.save((saveErr) => {
      if (saveErr) {
        logger.error('Error saving session in Google callback:', saveErr);
      }
      res.redirect(`${clientBase}${targetDashboard}?auth=google_success`);
    });
  } catch (err: any) {
    logger.error('Google OAuth callback handler error:', err);
    res.redirect(`${clientBase}/signin?error=${encodeURIComponent(err.message || 'google_auth_failed')}`);
  }
}

/**
 * POST /api/v1/auth/client/google/verify-credential
 * Verifies Google ID Token directly (Google Identity Services / One-Tap / Button SDK)
 */
function getInactiveAccountMessage(user: { status: string; moderationReason?: string }): string | null {
  if (user.status === 'active') return null;
  if (user.status === 'suspended') {
    return user.moderationReason || 'Your account has been suspended or disabled due to a security/fraud review.';
  }
  return 'Your account is pending administrative verification.';
}

export async function verifyGoogleCredentialHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { credential } = req.body;
    if (!credential) {
      throw new BadRequestError('Missing Google credential token');
    }

    const googleUser = await verifyGoogleIdToken(credential);
    let user = await User.findOne({ email: googleUser.email.toLowerCase() });

    if (user) {
      const inactiveMsg = getInactiveAccountMessage(user);
      if (inactiveMsg) {
        throw new ForbiddenError(inactiveMsg);
      }
      user.googleId = googleUser.id;
      user.avatarUrl = user.avatarUrl || googleUser.picture;
      user.isEmailVerified = true;
      user.lastLoginAt = new Date();
      await user.save();
    } else {
      user = await User.create({
        email: googleUser.email.toLowerCase(),
        fullName: googleUser.name || googleUser.email.split('@')[0],
        googleId: googleUser.id,
        avatarUrl: googleUser.picture,
        role: 'client',
        portalType: 'client',
        authProvider: 'google',
        isEmailVerified: true,
        status: 'active',
        lastLoginAt: new Date(),
      });

      sendWelcomeEmail(user.email, user.fullName).catch(() => {});
    }

    const portalType = user.portalType || (['super_admin', 'owner', 'ceo', 'employee'].includes(user.role) ? 'workspace' : 'client');
    const targetDashboard = portalType === 'workspace'
      ? (user.role === 'super_admin' ? '/workspace/super-admin' : '/workspace/orders')
      : '/portal/dashboard';

    (req.session as any).user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      portalType,
    };

    await recordAuditLog({
      userId: user._id,
      action: 'GOOGLE_CREDENTIAL_LOGIN',
      entityType: 'User',
      entityId: user._id.toString(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { email: user.email, portalType, role: user.role },
    });

    res.json({
      success: true,
      message: 'Google authentication successful',
      portalType,
      redirectTo: targetDashboard,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        portalType,
        companyName: user.companyName,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/auth/client/github
 */
export function getGitHubAuthUrlHandler(req: AuthenticatedRequest, res: Response): void {
  rememberClientOrigin(req);
  const url = getGitHubAuthURL('client_portal');
  if (req.query.format === 'json' || (req.headers.accept === 'application/json' && !req.headers.accept?.includes('text/html'))) {
    res.json({ success: true, url });
  } else {
    res.redirect(url);
  }
}

/**
 * GET /api/v1/auth/client/github/callback
 */
export async function handleGitHubCallback(req: AuthenticatedRequest, res: Response): Promise<void> {
  const code = req.query.code as string;
  const clientBase = getClientRedirectBase(req);
  if (!code) {
    res.redirect(`${clientBase}/signin?error=no_code`);
    return;
  }

  try {
    const gitHubUser = await exchangeGitHubCode(code);
    let user = await User.findOne({ email: gitHubUser.email.toLowerCase() });

    if (user) {
      const inactiveMsg = getInactiveAccountMessage(user);
      if (inactiveMsg) {
        res.redirect(`${clientBase}/signin?error=${encodeURIComponent(inactiveMsg)}`);
        return;
      }
      user.githubId = gitHubUser.id.toString();
      user.avatarUrl = user.avatarUrl || gitHubUser.avatar_url;
      user.isEmailVerified = true;
      user.lastLoginAt = new Date();
      await user.save();
    } else {
      user = await User.create({
        email: gitHubUser.email.toLowerCase(),
        fullName: gitHubUser.name || gitHubUser.login,
        githubId: gitHubUser.id.toString(),
        avatarUrl: gitHubUser.avatar_url,
        role: 'client',
        portalType: 'client',
        authProvider: 'github',
        isEmailVerified: true,
        status: 'active',
        lastLoginAt: new Date(),
      });

      sendWelcomeEmail(user.email, user.fullName).catch(() => {});
    }

    const portalType = user.portalType || (['super_admin', 'owner', 'ceo', 'employee'].includes(user.role) ? 'workspace' : 'client');
    const targetDashboard = portalType === 'workspace'
      ? (user.role === 'super_admin' ? '/workspace/super-admin' : '/workspace/orders')
      : '/portal/dashboard';

    (req.session as any).user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      portalType,
    };

    await recordAuditLog({
      userId: user._id,
      action: 'GITHUB_OAUTH_LOGIN',
      entityType: 'User',
      entityId: user._id.toString(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { email: user.email, portalType, role: user.role, githubId: gitHubUser.id },
    });

    req.session.save((saveErr) => {
      if (saveErr) {
        logger.error('Error saving session in GitHub callback:', saveErr);
      }
      res.redirect(`${clientBase}${targetDashboard}?auth=github_success`);
    });
  } catch (err: any) {
    logger.error('GitHub OAuth callback handler error:', err);
    res.redirect(`${clientBase}/signin?error=${encodeURIComponent(err.message || 'github_auth_failed')}`);
  }
}

