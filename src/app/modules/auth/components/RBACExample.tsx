import React from 'react';
import { useRBAC, RoleGuard, AdminOnly, ActionGuard, ActionType } from '../core/rbac';

/**
 * Example component demonstrating various RBAC usage patterns
 * This shows how to use the role-based access control system in your components
 */
export const RBACExample: React.FC = () => {
  const rbac = useRBAC();

  return (
    <div className="rbac-example">
      <h2>Role-Based Access Control Examples</h2>
      
      {/* Display user's current roles */}
      <div className="user-info">
        <h3>Current User Info:</h3>
        <p>Roles: {rbac.getRoleDisplayNames('en').join(', ')}</p>
        <p>Actions: {rbac.getUserActions().join(', ')}</p>
        <p>Is Admin: {rbac.isAdmin() ? 'Yes' : 'No'}</p>
      </div>

      {/* Example 1: Role-based conditional rendering */}
      <RoleGuard roleId={0}>
        <div className="alert alert-info">
          You have access as "Requesting Unit" (Role ID: 0)
        </div>
      </RoleGuard>

      {/* Example 2: Action-based conditional rendering */}
      <ActionGuard action="view">
        <button className="btn btn-primary">View Data</button>
      </ActionGuard>

      <ActionGuard action="edit">
        <button className="btn btn-warning">Edit Data</button>
      </ActionGuard>

      <ActionGuard action="delete">
        <button className="btn btn-danger">Delete Data</button>
      </ActionGuard>

      {/* Example 3: Admin-only content */}
      <AdminOnly>
        <div className="alert alert-warning">
          <h4>Admin Panel</h4>
          <p>This content is only visible to administrators.</p>
        </div>
      </AdminOnly>

      {/* Example 4: Multiple conditions with requireAll */}
      <RoleGuard roleId={0} action="view" requireAll>
        <div className="alert alert-success">
          You have both "Requesting Unit" role AND "view" permission
        </div>
      </RoleGuard>

      {/* Example 5: Using the hook directly for complex logic */}
      <div className="conditional-content">
        {rbac.hasAction('view') && (
          <div>
            <h4>Data View</h4>
            <p>You can view data</p>
            
            {rbac.hasAction('edit') && (
              <button className="btn btn-sm btn-warning">Quick Edit</button>
            )}
            
            {rbac.isAdmin() && (
              <button className="btn btn-sm btn-danger">Admin Actions</button>
            )}
          </div>
        )}
      </div>

      {/* Example 6: Unit-based access */}
      <RoleGuard unitId={0}>
        <div className="alert alert-info">
          You have access to Unit ID: 0
        </div>
      </RoleGuard>

      {/* Example 7: Complex permission checking */}
      <RoleGuard 
        permissions={{
          roleId: 0,
          actionId: 'view',
          requireAll: true
        }}
      >
        <div className="card">
          <div className="card-body">
            <h5>Complex Permission Check</h5>
            <p>This requires both role ID 0 and view action</p>
          </div>
        </div>
      </RoleGuard>

      {/* Example 8: Fallback content */}
      <RoleGuard 
        action="admin" 
        fallback={
          <div className="alert alert-danger">
            You don't have admin permissions to see this content
          </div>
        }
      >
        <div className="alert alert-success">
          Welcome to the admin area!
        </div>
      </RoleGuard>

      {/* Example 9: Role by name */}
      <RoleGuard roleName="Requesting Unit">
        <div className="badge badge-primary">
          Requesting Unit Member
        </div>
      </RoleGuard>

      {/* Example 10: Using programmatic checks */}
      <div className="programmatic-checks">
        <h4>Programmatic Checks:</h4>
        <ul>
          <li>Can view: {rbac.canPerformAction(ActionType.VIEW) ? '✅' : '❌'}</li>
          <li>Can edit: {rbac.canPerformAction(ActionType.EDIT) ? '✅' : '❌'}</li>
          <li>Can delete: {rbac.canPerformAction(ActionType.DELETE) ? '✅' : '❌'}</li>
          <li>Is Admin: {rbac.isAdmin() ? '✅' : '❌'}</li>
          <li>Has Requesting Unit role: {rbac.hasRoleByName('Requesting Unit') ? '✅' : '❌'}</li>
        </ul>
      </div>
    </div>
  );
};

/**
 * Example of a button component with built-in role checking
 */
interface ProtectedButtonProps {
  requiredAction: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const ProtectedButton: React.FC<ProtectedButtonProps> = ({ 
  requiredAction, 
  onClick, 
  children, 
  className = 'btn btn-primary',
  disabled = false 
}) => {
  const rbac = useRBAC();
  
  const hasPermission = rbac.hasAction(requiredAction);
  
  if (!hasPermission) {
    return null; // Don't render if no permission
  }
  
  return (
    <button 
      className={className} 
      onClick={onClick} 
      disabled={disabled}
      title={`Requires ${requiredAction} permission`}
    >
      {children}
    </button>
  );
};

/**
 * Example of a navigation item with role protection
 */
interface ProtectedNavItemProps {
  requiredRole?: number;
  requiredAction?: string;
  href: string;
  children: React.ReactNode;
}

export const ProtectedNavItem: React.FC<ProtectedNavItemProps> = ({ 
  requiredRole, 
  requiredAction, 
  href, 
  children 
}) => {
  const rbac = useRBAC();
  
  const hasAccess = () => {
    if (requiredRole !== undefined && !rbac.hasRole(requiredRole)) {
      return false;
    }
    if (requiredAction && !rbac.hasAction(requiredAction)) {
      return false;
    }
    return true;
  };
  
  if (!hasAccess()) {
    return null;
  }
  
  return (
    <li className="nav-item">
      <a className="nav-link" href={href}>
        {children}
      </a>
    </li>
  );
};