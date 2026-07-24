import { Request, Response, NextFunction } from 'express';
import { UserRole, Permission, RolePermissions } from '@shared/types';
import { UnauthorizedError, ForbiddenError } from '../errors';

// Extend Express Request to include decoded JWT payload
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        schoolId: string;
      };
    }
  }
}

/**
 * Require authentication
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }
  next();
};

/**
 * Check if user has specific role
 */
export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(
        `Access denied. Required roles: ${roles.join(', ')}`
      );
    }

    next();
  };
};

/**
 * Check if user has specific permission
 */
export const requirePermission = (...permissions: Permission[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const userPermissions = RolePermissions[req.user.role] || [];
    const hasPermission = permissions.some((p) =>
      userPermissions.includes(p)
    );

    if (!hasPermission) {
      throw new ForbiddenError(
        `Access denied. Required permissions: ${permissions.join(', ')}`
      );
    }

    next();
  };
};

/**
 * Check multiple permissions (all must be present)
 */
export const requireAllPermissions = (...permissions: Permission[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const userPermissions = RolePermissions[req.user.role] || [];
    const hasAllPermissions = permissions.every((p) =>
      userPermissions.includes(p)
    );

    if (!hasAllPermissions) {
      throw new ForbiddenError(
        `Access denied. Required all of: ${permissions.join(', ')}`
      );
    }

    next();
  };
};

/**
 * Verify user has permission function (use in business logic)
 */
export const userHasPermission = (role: UserRole, permission: Permission): boolean => {
  const permissions = RolePermissions[role] || [];
  return permissions.includes(permission);
};

/**
 * Verify user has any of the permissions
 */
export const userHasAnyPermission = (role: UserRole, permissions: Permission[]): boolean => {
  const userPermissions = RolePermissions[role] || [];
  return permissions.some((p) => userPermissions.includes(p));
};

/**
 * Verify user has all permissions
 */
export const userHasAllPermissions = (role: UserRole, permissions: Permission[]): boolean => {
  const userPermissions = RolePermissions[role] || [];
  return permissions.every((p) => userPermissions.includes(p));
};

/**
 * Get all permissions for a role
 */
export const getPermissionsForRole = (role: UserRole): Permission[] => {
  return RolePermissions[role] || [];
};

/**
 * Check if a role can perform an action on a resource
 */
export const canUserPerformAction = (
  role: UserRole,
  resource: string,
  action: string
): boolean => {
  const permissionKey = `${action}_${resource}`.toLowerCase();
  return userHasPermission(
    role,
    permissionKey as Permission
  );
};
