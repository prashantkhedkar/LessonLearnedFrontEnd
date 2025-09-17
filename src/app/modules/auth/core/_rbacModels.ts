export interface ActionModel {
  actionId: string;
  actionName: string;
}

export interface RoleModel {
  roleNameAr: string;
  roleNameEn: string;
  roleId: number;
  unitId: number;
  unitName: string | null;
  actions: ActionModel[];
  weight: number;
}

export interface UserRolesModel {
  roles: RoleModel[];
}

export interface PermissionCheckOptions {
  roleId?: number;
  actionId?: string;
  unitId?: number;
  requireAll?: boolean; // If true, user must have ALL specified criteria
}

export enum ActionType {
  VIEW = 'view',
  CREATE = 'create',
  EDIT = 'edit',
  DELETE = 'delete',
  APPROVE = 'approve',
  REJECT = 'reject',
  SUBMIT = 'submit',
  EXPORT = 'export',
  ADMIN = 'admin',
  ADD = 'add',
}