# Role-Based Access Control (RBAC) System

This directory contains a comprehensive Role-Based Access Control system for managing user permissions and UI access control.

## Overview

The RBAC system provides:
- ✅ TypeScript interfaces for roles and permissions
- ✅ Utility functions for permission checking
- ✅ React hooks for easy component integration
- ✅ Component guards for conditional rendering
- ✅ Integration with existing auth system

## Files Structure

```
core/
├── _rbacModels.ts       # TypeScript interfaces for roles and permissions
├── _models.ts           # Updated auth models with roles
├── RoleUtils.ts         # Utility functions for permission checking
├── useRBAC.ts          # React hooks for RBAC
├── RoleGuard.tsx       # React components for conditional rendering
├── rbac.ts             # Main export file
└── Auth.tsx            # Updated auth context (existing file)

components/
├── Login.tsx           # Updated login component (existing file)
└── RBACExample.tsx     # Example usage component
```

## Role Data Structure

Your user roles follow this structure:
```typescript
{
  "roles": [
    {
      "roleNameAr": "Requesting Unit",
      "roleNameEn": "Requesting Unit", 
      "roleId": 0,
      "unitId": 0,
      "unitName": null,
      "actions": [
        {
          "actionId": "view",
          "actionName": "view"
        }
      ],
      "weight": 0
    }
  ]
}
```

## Quick Start

### 1. Import the RBAC functions/components

```typescript
import { useRBAC, RoleGuard, AdminOnly, ActionGuard } from '../auth/core/rbac';
```

### 2. Use the hook in your components

```typescript
const MyComponent = () => {
  const rbac = useRBAC();
  
  return (
    <div>
      {rbac.hasAction('view') && <ViewButton />}
      {rbac.hasAction('edit') && <EditButton />}
      {rbac.isAdmin() && <AdminPanel />}
    </div>
  );
};
```

### 3. Use conditional rendering components

```typescript
const MyComponent = () => {
  return (
    <div>
      <ActionGuard action="view">
        <ViewComponent />
      </ActionGuard>
      
      <RoleGuard roleId={0}>
        <RequestingUnitContent />
      </RoleGuard>
      
      <AdminOnly>
        <AdminDashboard />
      </AdminOnly>
    </div>
  );
};
```

## Available Functions

### Core Hook: `useRBAC()`

```typescript
const rbac = useRBAC();

// Role checks
rbac.hasRole(roleId: number)                    // Check if user has specific role
rbac.hasRoleByName(roleName: string)            // Check role by name
rbac.hasAnyRole()                               // Check if user has any role

// Action/Permission checks  
rbac.hasAction(actionId: string)                // Check if user can perform action
rbac.canPerformAction(action: ActionType)       // Typed action check
rbac.hasActionInRole(roleId, actionId)          // Check action within specific role

// Unit access
rbac.hasUnitAccess(unitId: number)              // Check unit access

// Admin checks
rbac.isAdmin()                                  // Check if user is admin

// Data getters
rbac.getUserActions()                           // Get all user actions
rbac.getUserRoleIds()                           // Get all role IDs
rbac.getPrimaryRole()                           // Get highest weight role
rbac.getRoleDisplayNames(language)              // Get role names for display
```

### Specialized Hooks

```typescript
// Check specific permission
const canEdit = usePermission({ actionId: 'edit' });

// Check specific role
const isRequestingUnit = useRole(0);

// Check specific action  
const canView = useAction('view');

// Check if admin
const isAdmin = useIsAdmin();
```

### Component Guards

```typescript
// Role-based rendering
<RoleGuard roleId={0}>Content for role 0</RoleGuard>
<RoleGuard roleName="Requesting Unit">Content</RoleGuard>

// Action-based rendering
<ActionGuard action="edit">Edit button</ActionGuard>

// Admin-only content
<AdminOnly>Admin panel</AdminOnly>

// Multiple conditions
<RoleGuard roleId={0} action="view" requireAll>
  Must have BOTH role 0 AND view permission
</RoleGuard>

// With fallback
<RoleGuard 
  action="admin" 
  fallback={<div>Access denied</div>}
>
  Admin content
</RoleGuard>

// Complex permission object
<RoleGuard 
  permissions={{
    roleId: 0,
    actionId: 'view',
    unitId: 0,
    requireAll: true
  }}
>
  Complex permission check
</RoleGuard>
```

## Common Usage Patterns

### 1. Navigation Menu with Role Protection

```typescript
const Navigation = () => {
  const rbac = useRBAC();
  
  return (
    <nav>
      <ActionGuard action="view">
        <NavLink to="/dashboard">Dashboard</NavLink>
      </ActionGuard>
      
      <ActionGuard action="edit">
        <NavLink to="/edit">Edit</NavLink>
      </ActionGuard>
      
      <AdminOnly>
        <NavLink to="/admin">Admin</NavLink>
      </AdminOnly>
    </nav>
  );
};
```

### 2. Form Buttons with Permissions

```typescript
const FormActions = () => {
  return (
    <div className="form-actions">
      <ActionGuard action="create">
        <button className="btn btn-primary">Create</button>
      </ActionGuard>
      
      <ActionGuard action="edit">
        <button className="btn btn-warning">Edit</button>
      </ActionGuard>
      
      <ActionGuard action="delete">
        <button className="btn btn-danger">Delete</button>
      </ActionGuard>
    </div>
  );
};
```

### 3. Conditional Table Columns

```typescript
const DataTable = () => {
  const rbac = useRBAC();
  
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Status</th>
          {rbac.hasAction('edit') && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {data.map(item => (
          <tr key={item.id}>
            <td>{item.name}</td>
            <td>{item.status}</td>
            {rbac.hasAction('edit') && (
              <td>
                <button onClick={() => edit(item.id)}>Edit</button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

### 4. Protected Routes

```typescript
const ProtectedRoute = ({ children, requiredAction, requiredRole }) => {
  const rbac = useRBAC();
  
  const hasAccess = () => {
    if (requiredAction && !rbac.hasAction(requiredAction)) return false;
    if (requiredRole && !rbac.hasRole(requiredRole)) return false;
    return true;
  };
  
  return hasAccess() ? children : <Navigate to="/unauthorized" />;
};

// Usage
<Route path="/admin" element={
  <ProtectedRoute requiredAction="admin">
    <AdminDashboard />
  </ProtectedRoute>
} />
```

## ActionTypes

The system supports these predefined action types:
- `view` - View/read permissions
- `create` - Create new items
- `edit` - Edit existing items  
- `delete` - Delete items
- `approve` - Approve items
- `reject` - Reject items
- `submit` - Submit items
- `export` - Export data
- `admin` - Administrative access

## Integration with Existing Code

The RBAC system is integrated with your existing auth system:

1. **Login Component**: Updated to extract and save roles from `userDetails.data.roles`
2. **Auth Model**: Extended to include `roles?: RoleModel[]` 
3. **Auth Context**: No changes needed - works with existing structure

## Best Practices

1. **Use Guards for UI Elements**: Prefer `RoleGuard` components over manual `if` statements
2. **Server-Side Validation**: Always validate permissions on the server - client-side is for UX only
3. **Granular Permissions**: Use action-based permissions rather than just role-based
4. **Fallback Content**: Provide meaningful fallback content for denied access
5. **Performance**: The hooks use `useMemo` for performance optimization

## Testing

```typescript
// Mock user for testing
const mockUser = {
  // ... other auth properties
  roles: [
    {
      roleId: 0,
      roleNameEn: "Requesting Unit",
      roleNameAr: "Requesting Unit",
      unitId: 0,
      unitName: null,
      actions: [{ actionId: "view", actionName: "view" }],
      weight: 0
    }
  ]
};

// Test utility functions
import { hasAction, hasRole } from '../auth/core/rbac';

expect(hasAction(mockUser, 'view')).toBe(true);
expect(hasRole(mockUser, 0)).toBe(true);
```

## Troubleshooting

1. **Roles not showing**: Check that `userDetails.data.roles` contains the role data
2. **Guards not working**: Ensure the user is logged in and `currentUser` has roles
3. **TypeScript errors**: Import types from the rbac module: `import { RoleModel, ActionType } from '../auth/core/rbac'`

## Extension

To add new action types:
1. Update `ActionType` in `_rbacModels.ts`
2. Add corresponding permission checks in your API
3. Use the new action type in your components

The system is designed to be extensible and maintainable for your lessons learned application.