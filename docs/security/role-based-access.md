# Role-Based Access Control (RBAC)

## Overview

Role-Based Access Control (RBAC) provides fine-grained authorization for the e-commerce platform. This guide covers implementing and managing user roles and permissions.

---

## Roles

### Customer Role
- **Permissions**:
  - Browse products
  - Search and filter
  - View own cart
  - Create and manage orders
  - View order history
  - Manage wishlist
  - Submit reviews

### Seller Role
- **Permissions**:
  - List products
  - Edit products
  - View product analytics
  - Manage inventory
  - View seller orders
  - Manage seller profile

### Admin Role
- **Permissions**:
  - Manage all products
  - Manage all users
  - Manage all orders
  - View analytics
  - Configure settings
  - Manage system

### Super Admin Role
- **Permissions**:
  - All admin permissions
  - User and role management
  - System configuration
  - Security settings

---

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String,
  name: String,
  role: String, // 'customer', 'seller', 'admin', 'super_admin'
  roles: [String], // Support multiple roles
  permissions: [String], // Direct permission assignment
  is_active: Boolean,
  created_at: Date
}
```

### Roles Collection
```javascript
{
  _id: ObjectId,
  name: String, // 'customer', 'seller', 'admin'
  description: String,
  permissions: [String], // Array of permission codes
  is_active: Boolean,
  created_at: Date,
  updated_at: Date
}
```

### Permissions Collection
```javascript
{
  _id: ObjectId,
  code: String, // 'read:products', 'write:products', 'delete:products'
  name: String,
  description: String,
  category: String, // 'products', 'orders', 'users', 'settings'
  created_at: Date
}
```

---

## Permission Matrix

### Products
| Permission | Customer | Seller | Admin | Super Admin |
|-----------|----------|--------|-------|------------|
| read:products | ✓ | ✓ | ✓ | ✓ |
| create:products | | ✓ | ✓ | ✓ |
| update:products | | ✓* | ✓ | ✓ |
| delete:products | | ✓* | ✓ | ✓ |
| read:analytics | | ✓* | ✓ | ✓ |

*Sellers can only manage their own products

### Orders
| Permission | Customer | Seller | Admin | Super Admin |
|-----------|----------|--------|-------|------------|
| read:own_orders | ✓ | ✓ | | |
| read:all_orders | | | ✓ | ✓ |
| update:order_status | | ✓* | ✓ | ✓ |
| cancel:orders | ✓ | | ✓ | ✓ |
| refund:orders | | | ✓ | ✓ |

### Users
| Permission | Admin | Super Admin |
|-----------|-------|------------|
| read:users | ✓ | ✓ |
| create:users | | ✓ |
| update:users | ✓ | ✓ |
| delete:users | | ✓ |
| manage:roles | | ✓ |

---

## Implementation

### Express Middleware

```javascript
// Permission check middleware
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      // Fetch user with populated roles and permissions
      const userWithPermissions = await User.findById(user.user_id)
        .populate('roles');

      // Get all permissions for user
      let permissions = userWithPermissions.permissions || [];

      // Add permissions from roles
      for (const role of userWithPermissions.roles) {
        permissions = [...permissions, ...role.permissions];
      }

      // Check if user has required permission
      if (!permissions.includes(requiredPermission)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions'
          }
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Authorization check failed' }
      });
    }
  };
};

// Usage
app.delete('/api/products/:id', 
  authenticateToken, 
  checkPermission('delete:products'), 
  deleteProduct
);
```

### Role Check Middleware

```javascript
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Only ${allowedRoles.join(', ')} can access this resource`
        }
      });
    }

    next();
  };
};

// Usage
app.get('/api/admin/dashboard',
  authenticateToken,
  checkRole(['admin', 'super_admin']),
  getAdminDashboard
);
```

### Resource Ownership Check

```javascript
const checkOwnership = (resourceIdParam) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      const userId = req.user.user_id;
      const userRole = req.user.role;

      // Admins can access anything
      if (['admin', 'super_admin'].includes(userRole)) {
        return next();
      }

      // Get resource and check ownership
      const resource = await Product.findById(resourceId);

      if (resource.seller_id.toString() !== userId) {
        return res.status(403).json({
          success: false,
          error: { message: 'You do not own this resource' }
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Ownership check failed' }
      });
    }
  };
};

// Usage
app.put('/api/products/:id',
  authenticateToken,
  checkPermission('update:products'),
  checkOwnership('id'),
  updateProduct
);
```

---

## Permission Assignment

### Assign Role to User

```javascript
// Assign single role
async function assignRole(userId, roleName) {
  const role = await Role.findOne({ name: roleName });

  const user = await User.findByIdAndUpdate(
    userId,
    { role: role._id },
    { new: true }
  );

  return user;
}

// Assign multiple roles
async function assignRoles(userId, roleNames) {
  const roles = await Role.find({ name: { $in: roleNames } });

  const user = await User.findByIdAndUpdate(
    userId,
    { roles: roles.map(r => r._id) },
    { new: true }
  );

  return user;
}
```

### Assign Direct Permission

```javascript
// Assign direct permission (overrides role permissions)
async function assignPermission(userId, permissionCode) {
  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { permissions: permissionCode } },
    { new: true }
  );

  return user;
}

// Revoke direct permission
async function revokePermission(userId, permissionCode) {
  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { permissions: permissionCode } },
    { new: true }
  );

  return user;
}
```

---

## Role Management APIs

### Create Role

```javascript
app.post('/api/admin/roles', authenticateToken, checkRole(['super_admin']), async (req, res) => {
  const { name, description, permissions } = req.body;

  try {
    const role = new Role({
      name,
      description,
      permissions
    });

    await role.save();

    res.status(201).json({
      success: true,
      message: 'Role created',
      data: role
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: { message: error.message }
    });
  }
});
```

### List Roles

```javascript
app.get('/api/admin/roles', authenticateToken, checkRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const roles = await Role.find().populate('permissions');

    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
});
```

### Update Role

```javascript
app.put('/api/admin/roles/:id', authenticateToken, checkRole(['super_admin']), async (req, res) => {
  const { name, description, permissions } = req.body;

  try {
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { name, description, permissions },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Role updated',
      data: role
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: { message: error.message }
    });
  }
});
```

---

## Audit Logging

### Log Permission Changes

```javascript
async function logPermissionChange(userId, action, details) {
  const log = new AuditLog({
    user_id: userId,
    action, // 'role_assigned', 'permission_granted', 'permission_revoked'
    resource_type: 'user_permissions',
    details,
    timestamp: new Date(),
    ip_address: getClientIP(),
    user_agent: getUserAgent()
  });

  await log.save();
}

// Usage
await logPermissionChange(
  userId,
  'role_assigned',
  { role: 'seller', assigned_by: adminId }
);
```

---

## Testing

### Permission Tests

```javascript
describe('RBAC', () => {
  it('should allow customer to read products', async () => {
    const token = generateToken({ role: 'customer' });

    const response = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
  });

  it('should prevent customer from deleting products', async () => {
    const token = generateToken({ role: 'customer' });

    const response = await request(app)
      .delete('/api/products/123')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  it('should allow seller to update own products', async () => {
    const userId = '123';
    const token = generateToken({ user_id: userId, role: 'seller' });

    const product = await Product.create({
      name: 'Test Product',
      seller_id: userId
    });

    const response = await request(app)
      .put(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Product' });

    expect(response.status).toBe(200);
  });

  it('should prevent seller from updating others\' products', async () => {
    const token = generateToken({ user_id: '123', role: 'seller' });

    const product = await Product.create({
      name: 'Test Product',
      seller_id: '456'
    });

    const response = await request(app)
      .put(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Product' });

    expect(response.status).toBe(403);
  });
});
```

---

## References

- [OWASP Authorization](https://owasp.org/www-project-top-ten/)
- [RBAC Design](https://en.wikipedia.org/wiki/Role-based_access_control)
- [Access Control Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
