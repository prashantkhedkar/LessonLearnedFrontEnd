// Role-Based Access Control (RBAC) exports
export * from './_rbacModels';
export * from './RoleUtils';
export * from './useRBAC';
export * from './RoleGuard';

// Re-export commonly used functions with shorter names
export {
  hasRole,
  hasAction,
  hasPermission,
  isAdmin,
  canPerformAction,
  hasUnitAccess,
  getUserActions,
  getPrimaryRole
} from './RoleUtils';

export {
  useRBAC,
  usePermission,
  useRole,
  useAction,
  useIsAdmin
} from './useRBAC';

export {
  RoleGuard,
  AdminOnly,
  ActionGuard,
  withRoleGuard
} from './RoleGuard';