import { useMemo } from 'react';
import { useAuth } from './Auth';
import { RoleModel, PermissionCheckOptions, ActionType } from './_rbacModels';
import * as RoleUtils from './RoleUtils';

/**
 * Custom hook for Role-Based Access Control (RBAC)
 * Provides easy access to user role and permission checking functions
 */
export const useRBAC = () => {
  const { currentUser } = useAuth();

  const rbac = useMemo(() => ({
    // Basic role checks
    hasRole: (roleId: number) => RoleUtils.hasRole(currentUser, roleId),
    hasRoleByName: (roleName: string) => RoleUtils.hasRoleByName(currentUser, roleName),
    hasAnyRole: () => RoleUtils.hasAnyRole(currentUser),
    
    // Action/Permission checks
    hasAction: (actionId: string) => RoleUtils.hasAction(currentUser, actionId),
    hasActionInRole: (roleId: number, actionId: string) => RoleUtils.hasActionInRole(currentUser, roleId, actionId),
    canPerformAction: (action: ActionType) => RoleUtils.canPerformAction(currentUser, action),
    
    // Unit access checks
    hasUnitAccess: (unitId: number) => RoleUtils.hasUnitAccess(currentUser, unitId),
    
    // Advanced permission checking
    hasPermission: (options: PermissionCheckOptions) => RoleUtils.hasPermission(currentUser, options),
    
    // Admin checks
    isAdmin: () => RoleUtils.isAdmin(currentUser),
    
    // Data getters
    getUserActions: () => RoleUtils.getUserActions(currentUser),
    getUserRoleIds: () => RoleUtils.getUserRoleIds(currentUser),
    getUserUnitIds: () => RoleUtils.getUserUnitIds(currentUser),
    getPrimaryRole: () => RoleUtils.getPrimaryRole(currentUser),
    getRoleById: (roleId: number) => RoleUtils.getRoleById(currentUser, roleId),
    getRoleDisplayNames: (language: 'en' | 'ar' = 'en') => RoleUtils.getRoleDisplayNames(currentUser, language),
    getRolesByUnit: (unitId: number) => RoleUtils.getRolesByUnit(currentUser, unitId),
    
    // User data
    currentUser,
    roles: currentUser?.roles || [],
  }), [currentUser]);

  return rbac;
};

/**
 * Hook for checking specific permissions with easy boolean return
 */
export const usePermission = (options: PermissionCheckOptions) => {
  const { hasPermission } = useRBAC();
  return hasPermission(options);
};

/**
 * Hook for checking if user has specific role
 */
export const useRole = (roleId: number) => {
  const { hasRole } = useRBAC();
  return hasRole(roleId);
};

/**
 * Hook for checking if user can perform specific action
 */
export const useAction = (actionId: string) => {
  const { hasAction } = useRBAC();
  return hasAction(actionId);
};

/**
 * Hook for admin check
 */
export const useIsAdmin = () => {
  const { isAdmin } = useRBAC();
  return isAdmin();
};