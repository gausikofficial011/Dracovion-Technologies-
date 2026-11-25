import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { AuthenticatedRequest, UserRole } from '../types';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

/**
 * Verifies the authenticated session against the live database record so
 * suspended/fraud-disabled accounts are blocked immediately across all endpoints.
 */
async function resolveActiveSessionUser(req: AuthenticatedRequest) {
  const sessionUser = (req.session as any)?.user;

  if (!sessionUser || !sessionUser.userId) {
    throw new UnauthorizedError('Please log in to access this resource.');
  }

  const dbUser = await User.findById(sessionUser.userId)
    .select('status role portalType moderationReason')
    .lean();

  if (!dbUser) {
    req.session?.destroy(() => {});
    throw new UnauthorizedError('Authentication required.');
  }

  if (dbUser.status !== 'active') {
    req.session?.destroy(() => {});
    const message =
      dbUser.status === 'suspended'
        ? dbUser.moderationReason
          ? `Account disabled: ${dbUser.moderationReason}`
          : 'Your account has been disabled due to a security or fraud review.'
        : 'Your account is pending administrative verification.';
    throw new ForbiddenError(message);
  }

  req.user = {
    ...sessionUser,
    role: dbUser.role,
    portalType: dbUser.portalType || sessionUser.portalType,
  };

  return req.user!;
}

export async function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> {
  try {
    await resolveActiveSessionUser(req);
    next();
  } catch (err) {
    next(err);
  }
}

export function requireRoles(...allowedRoles: UserRole[]) {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    try {
      const activeUser = await resolveActiveSessionUser(req);

      // super_admin has universal privileges
      if (activeUser.role === 'super_admin') {
        return next();
      }

      // owner and ceo have broad management access
      if (
        (activeUser.role === 'owner' || activeUser.role === 'ceo') &&
        (allowedRoles.includes('owner') || allowedRoles.includes('ceo') || allowedRoles.includes('employee'))
      ) {
        return next();
      }

      if (!allowedRoles.includes(activeUser.role)) {
        return next(
          new ForbiddenError(
            `Access forbidden: Role '${activeUser.role}' is not authorized to perform this operation.`
          )
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

/** Workspace staff: super_admin, ceo, owner, employee */
export function requireWorkspaceStaff(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  return requireRoles('super_admin', 'ceo', 'owner', 'employee')(req, res, next);
}

/** Management-level: super_admin, ceo, owner */
export function requireManagement(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  return requireRoles('super_admin', 'ceo', 'owner')(req, res, next);
}

/** Super admin only */
export function requireSuperAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  return requireRoles('super_admin')(req, res, next);
}

/** Authenticated client */
export function requireClient(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  return requireRoles('client')(req, res, next);
}

/** Legacy alias - admin now means management-level workspace */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  return requireManagement(req, res, next);
}

export function requireClientOrAdmin(clientIdField = 'clientId') {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const activeUser = await resolveActiveSessionUser(req);

      const workspaceRoles: UserRole[] = ['super_admin', 'ceo', 'owner', 'employee'];
      if (workspaceRoles.includes(activeUser.role)) {
        return next();
      }

      const targetClientId = req.params[clientIdField] || req.body[clientIdField] || req.query[clientIdField];

      if (targetClientId && targetClientId.toString() !== activeUser.userId.toString()) {
        return next(new ForbiddenError('You are not authorized to view or modify another client\'s data.'));
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

