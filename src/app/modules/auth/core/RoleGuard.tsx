import React from 'react';
import { useRBAC } from './useRBAC';
import { PermissionCheckOptions, ActionType } from './_rbacModels';

interface RoleGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  // Role-based props
  roleId?: number;
  roleName?: string;
  // Action-based props
  action?: string | ActionType;
  // Unit-based props
  unitId?: number;
  // Admin check
  adminOnly?: boolean;
  // Complex permission check
  permissions?: PermissionCheckOptions;
  // Multiple conditions
  requireAll?: boolean; // If true, all conditions must be met
}

/**
 * RoleGuard component for conditional rendering based on user permissions
 * 
 * Usage examples:
 * <RoleGuard roleId={1}>Content for role 1</RoleGuard>
 * <RoleGuard action="edit">Edit button</RoleGuard>
 * <RoleGuard adminOnly>Admin panel</RoleGuard>
 * <RoleGuard roleId={1} action="view" requireAll>Must have role 1 AND view action</RoleGuard>
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  fallback = null,
  roleId,
  roleName,
  action,
  unitId,
  adminOnly,
  permissions,
  requireAll = false,
}) => {
  const rbac = useRBAC();

  const checkPermissions = (): boolean => {
    // If specific permissions object is provided, use it
    if (permissions) {
      return rbac.hasPermission(permissions);
    }

    const checks: boolean[] = [];

    // Check admin access
    if (adminOnly) {
      checks.push(rbac.isAdmin());
    }

    // Check role by ID
    if (roleId !== undefined) {
      checks.push(rbac.hasRole(roleId));
    }

    // Check role by name
    if (roleName) {
      checks.push(rbac.hasRoleByName(roleName));
    }

    // Check action permission
    if (action) {
      checks.push(rbac.hasAction(action));
    }

    // Check unit access
    if (unitId !== undefined) {
      checks.push(rbac.hasUnitAccess(unitId));
    }

    // If no checks were specified, allow access
    if (checks.length === 0) {
      return true;
    }

    // Return based on requireAll flag
    return requireAll ? checks.every(check => check) : checks.some(check => check);
  };

  const hasAccess = checkPermissions();

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

/**
 * Higher-order component for wrapping components with role-based access control
 */
export const withRoleGuard = <P extends object>(
  Component: React.ComponentType<P>,
  guardProps: Omit<RoleGuardProps, 'children' | 'fallback'>
) => {
  return React.forwardRef<any, P & { fallback?: React.ReactNode }>((props, ref) => {
    const { fallback, ...componentProps } = props;
    
    return (
      <RoleGuard {...guardProps} fallback={fallback}>
        <Component {...(componentProps as P)} ref={ref} />
      </RoleGuard>
    );
  });
};

/**
 * Component for showing content only to admins
 */
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => (
  <RoleGuard adminOnly fallback={fallback}>
    {children}
  </RoleGuard>
);

/**
 * Component for showing content based on specific action
 */
export const ActionGuard: React.FC<{ 
  action: string | ActionType; 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}> = ({ action, children, fallback = null }) => (
  <RoleGuard action={action} fallback={fallback}>
    {children}
  </RoleGuard>
);