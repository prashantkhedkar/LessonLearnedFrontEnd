import { AuthModel } from './_models';
import { RoleModel, ActionModel, PermissionCheckOptions, ActionType } from './_rbacModels';

/**
 * Utility functions for Role-Based Access Control (RBAC)
 */

/**
 * Check if user has a specific role by role ID
 */
export const hasRole = (user: AuthModel | undefined, roleId: number): boolean => {
  if (!user?.roles || !Array.isArray(user.roles)) {
    return false;
  }
  return user.roles.some(role => role.roleId === roleId);
};

/**
 * Check if user has a specific role by role name (English or Arabic)
 */
export const hasRoleByName = (user: AuthModel | undefined, roleName: string): boolean => {
  if (!user?.roles || !Array.isArray(user.roles)) {
    return false;
  }
  return user.roles.some(role => 
    role.roleNameEn.toLowerCase() === roleName.toLowerCase() || 
    role.roleNameAr === roleName
  );
};

/**
 * Check if user has a specific action permission
 */
export const hasAction = (user: AuthModel | undefined, actionId: string): boolean => {
    debugger
  if (!user?.roles || !Array.isArray(user.roles)) {
    return false;
  }
  
  return user.roles.some(role => 
    role.actions && role.actions.some(action => action.actionId === actionId)
  );
};

/**
 * Check if user has action permission within a specific role
 */
export const hasActionInRole = (user: AuthModel | undefined, roleId: number, actionId: string): boolean => {
  if (!user?.roles || !Array.isArray(user.roles)) {
    return false;
  }
  
  const role = user.roles.find(r => r.roleId === roleId);
  if (!role) {
    return false;
  }
  
  return role.actions && role.actions.some(action => action.actionId === actionId);
};

/**
 * Check if user belongs to a specific unit
 */
export const hasUnitAccess = (user: AuthModel | undefined, unitId: number): boolean => {
  if (!user?.roles || !Array.isArray(user.roles)) {
    return false;
  }
  return user.roles.some(role => role.unitId === unitId);
};

/**
 * Get all actions available to the user
 */
export const getUserActions = (user: AuthModel | undefined): string[] => {
  if (!user?.roles || !Array.isArray(user.roles)) {
    return [];
  }
  
  const actions = new Set<string>();
  user.roles.forEach(role => {
    if (role.actions) {
      role.actions.forEach(action => actions.add(action.actionId));
    }
  });
  
  return Array.from(actions);
};

/**
 * Get all role IDs for the user
 */
export const getUserRoleIds = (user: AuthModel | undefined): number[] => {
  if (!user?.roles || !Array.isArray(user.roles)) {
    return [];
  }
  return user.roles.map(role => role.roleId);
};

/**
 * Get all unit IDs the user has access to
 */
export const getUserUnitIds = (user: AuthModel | undefined): number[] => {
  if (!user?.roles || !Array.isArray(user.roles)) {
    return [];
  }
  return user.roles.map(role => role.unitId);
};

/**
 * Get user's role with highest weight (priority)
 */
export const getPrimaryRole = (user: AuthModel | undefined): RoleModel | null => {
  if (!user?.roles || !Array.isArray(user.roles) || user.roles.length === 0) {
    return null;
  }
  
  return user.roles.reduce((primary, current) => 
    current.weight > primary.weight ? current : primary
  );
};

/**
 * Check if user has admin privileges (weight >= 100 or specific admin role)
 */
export const isAdmin = (user: AuthModel | undefined): boolean => {
  if (!user?.roles || !Array.isArray(user.roles)) {
    return false;
  }
  
  // Check if user has admin action or high weight role
  return user.roles.some(role => 
    role.weight >= 100 || 
    (role.actions && role.actions.some(action => action.actionId === 'admin'))
  );
};

/**
 * Comprehensive permission checker with multiple criteria
 */
export const hasPermission = (user: AuthModel | undefined, options: PermissionCheckOptions): boolean => {
  if (!user?.roles || !Array.isArray(user.roles)) {
    return false;
  }
  
  const { roleId, actionId, unitId, requireAll = false } = options;
  
  const checks: boolean[] = [];
  
  if (roleId !== undefined) {
    checks.push(hasRole(user, roleId));
  }
  
  if (actionId !== undefined) {
    checks.push(hasAction(user, actionId));
  }
  
  if (unitId !== undefined) {
    checks.push(hasUnitAccess(user, unitId));
  }
  
  if (checks.length === 0) {
    return true; // No criteria specified
  }
  
  return requireAll ? checks.every(check => check) : checks.some(check => check);
};

/**
 * Check if user can perform a specific action type
 */
export const canPerformAction = (user: AuthModel | undefined, action: ActionType): boolean => {
  return hasAction(user, action);
};

/**
 * Get role by ID
 */
export const getRoleById = (user: AuthModel | undefined, roleId: number): RoleModel | null => {
  if (!user?.roles || !Array.isArray(user.roles)) {
    return null;
  }
  return user.roles.find(role => role.roleId === roleId) || null;
};

/**
 * Get user's roles formatted for display
 */
export const getRoleDisplayNames = (user: AuthModel | undefined, language: 'en' | 'ar' = 'en'): string[] => {
  if (!user?.roles || !Array.isArray(user.roles)) {
    return [];
  }
  
  return user.roles.map(role => 
    language === 'ar' ? role.roleNameAr : role.roleNameEn
  );
};

/**
 * Check if user has any role
 */
export const hasAnyRole = (user: AuthModel | undefined): boolean => {
  return !!(user?.roles && Array.isArray(user.roles) && user.roles.length > 0);
};

/**
 * Filter roles by unit ID
 */
export const getRolesByUnit = (user: AuthModel | undefined, unitId: number): RoleModel[] => {
  if (!user?.roles || !Array.isArray(user.roles)) {
    return [];
  }
  return user.roles.filter(role => role.unitId === unitId);
};