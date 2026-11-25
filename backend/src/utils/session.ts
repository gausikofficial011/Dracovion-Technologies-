import crypto from 'crypto';
import { env } from '../config/env';
import type { IUser } from '../models/User';
import type { AuthenticatedRequest } from '../types';
import { ForbiddenError } from './errors';

/**
 * Awaits express-session persistence so MongoStore writes complete before returning auth responses or redirects.
 */
export async function saveSession(req: AuthenticatedRequest): Promise<void> {
  if (!req.session || typeof req.session.save !== 'function') return;
  await new Promise<void>((resolve) => {
    req.session.save((err) => {
      if (err) {
        // Non-fatal fallback; response still proceeds cleanly
      }
      resolve();
    });
  });
}

/**
 * Uniform check verifying an account is active (not suspended or pending approval).
 */
export function assertUserIsActive(
  user: { status: string; moderationReason?: string },
  pendingMessage = 'Your account registration has been submitted and is currently pending administrative verification by Dracovion leadership.'
): void {
  if (user.status === 'active') return;
  if (user.status === 'pending') {
    throw new ForbiddenError(pendingMessage);
  }
  throw new ForbiddenError(
    user.moderationReason
      ? `Your account has been disabled: ${user.moderationReason}`
      : 'Your account has been suspended or deactivated. Please contact Dracovion support.'
  );
}

/**
 * Resolves the post-login landing path based on user role and portal type.
 */
export function resolvePortalRedirect(user: { role: string; portalType?: string }): {
  portalType: 'workspace' | 'client';
  redirectTo: string;
} {
  const isWorkspace =
    user.portalType === 'workspace' ||
    ['super_admin', 'owner', 'ceo', 'employee', 'admin'].includes(user.role);

  if (isWorkspace) {
    return {
      portalType: 'workspace',
      redirectTo: user.role === 'super_admin' ? '/workspace/super-admin' : '/workspace/orders',
    };
  }

  let redirectTo = '/portal/dashboard';
  if (user.role === 'student') redirectTo = '/student/dashboard';
  else if (user.role === 'partner') redirectTo = '/partner/dashboard';
  else if (user.role === 'team_member') redirectTo = '/team/dashboard';

  return { portalType: 'client', redirectTo };
}

/**
 * Formats sanitized user profile payload returned by auth endpoints.
 */
export function formatAuthUserResponse(user: IUser) {
  const { portalType } = resolvePortalRedirect(user);
  return {
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
  };
}

/**
 * Encodes an HMAC-signed OAuth state containing an allow-listed client origin so cross-domain redirects
 * survive strict third-party cookie browsers.
 */
export function encodeOAuthState(payload: { portal: string; clientOrigin?: string }): string {
  const data = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', env.SESSION_SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function decodeOAuthState(state?: string): { portal?: string; clientOrigin?: string } | null {
  if (!state || !state.includes('.')) return null;
  const parts = state.split('.');
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', env.SESSION_SECRET).update(data).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}
