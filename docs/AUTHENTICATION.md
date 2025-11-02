# Authentication & Authorization Guide

## Overview

The application uses JWT (JSON Web Tokens) for authentication and implements Role-Based Access Control (RBAC) with four distinct user roles.

## Default Credentials

### First Time Login
```
Username: admin
Password: admin123
Email: admin@insurance.com
```

**⚠️ Security Warning**: Change the default admin password immediately after first login!

## User Roles & Permissions

| Role | Database Engine | Dashboard Engine | Dashboard View | User Management |
|------|----------------|------------------|----------------|-----------------|
| **Admin** | Full Access | Full Access | Full Access | Full Access ✓ |
| **Manager** | Full Access | Full Access | Full Access | View Only |
| **Analyst** | View Only | Create/Edit | Full Access | No Access |
| **Viewer** | View Only | View Only | View Only | No Access |

### Role Descriptions

#### Admin
- **Full system access**
- Create, edit, and delete users
- Manage all data and dashboards
- Access all features without restrictions

#### Manager
- **Data and dashboard management**
- Create, edit, and delete tables and data
- Create and manage dashboards
- View user list (cannot edit users)

#### Analyst
- **Dashboard creation and data viewing**
- Create and edit dashboards
- View data in Database Engine (cannot modify)
- No access to user management

#### Viewer
- **Read-only access**
- View dashboards only
- Cannot create or modify anything
- Suitable for stakeholders and executives

## Authentication Flow

### Login Process
1. Navigate to login page
2. Enter username and password
3. System validates credentials against Users table
4. Password verified using bcrypt
5. JWT token generated with 24-hour expiry
6. Token stored in localStorage
7. User redirected to main application

### Token Management
- **Token Expiry**: 24 hours from login
- **Storage**: localStorage (browser)
- **Transmission**: Authorization header (`Bearer <token>`)
- **Refresh**: Automatic on page reload if valid
- **Logout**: Token removed from localStorage

### Protected Routes
All API endpoints (except login/register) require authentication:
```javascript
Authorization: Bearer <your-jwt-token>
```

## User Management (Admin Only)

### Create User
1. Navigate to "User Management" tab
2. Click "➕ Create New User"
3. Fill in required fields:
   - Username (unique)
   - Email (unique)
   - Password (min 6 characters)
   - Full Name
   - Role
   - Account Status (active/inactive)
4. Click "Create User"

### Edit User
1. Find user in the list
2. Click "✏️ Edit" button
3. Modify fields as needed
4. Click "Update User"

### Delete User
1. Find user in the list
2. Click "🗑️" delete button
3. Confirm deletion in dialog
4. User is permanently removed

### Password Management
- Passwords hashed with bcrypt (10 salt rounds)
- Never stored as plaintext
- Admin can reset user passwords
- Users should change default passwords

## Security Best Practices

### Authentication Security
- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Tokens**: Signed with strong secret key
- **Token Expiry**: 24-hour automatic timeout
- **Secure Transmission**: HTTPS recommended for production

### Authorization Security
- **Server-Side Enforcement**: All permissions checked on backend
- **Principle of Least Privilege**: Users get minimum required access
- **Role-Based UI**: Buttons/tabs hidden based on permissions
- **Middleware Protection**: Every protected route validates token and role

## API Endpoints

### Public Endpoints
```
POST /api/auth/register    - Register new user
POST /api/auth/login       - Login and get JWT token
```

### Protected Endpoints (All Roles)
```
GET  /api/auth/verify      - Verify current token
POST /api/auth/logout      - Logout (clear session)
```

### User Management Endpoints (Admin Only)
```
GET    /api/users          - List all users
GET    /api/users/:id      - Get user by ID
POST   /api/users          - Create new user
PUT    /api/users/:id      - Update user
DELETE /api/users/:id      - Delete user
```

## Troubleshooting

### Common Issues

**Problem**: `401 Unauthorized` error
**Solution**:
- Check if token is expired (24-hour limit)
- Verify token is in Authorization header
- Try logging out and logging in again

**Problem**: `403 Forbidden` error
**Solution**:
- Check user role has required permissions
- Verify action is allowed for your role
- Contact admin to update your role if needed

**Problem**: `Invalid credentials` on login
**Solution**:
- Verify username and password (case-sensitive)
- Check default admin credentials: admin/admin123
- Ensure user account is active

**Problem**: Token expired error
**Solution**:
- JWT tokens expire after 24 hours
- Log out and log in again to get fresh token
- Check system clock is correct

**Problem**: Can't see User Management tab
**Solution**:
- Only Admin role can access User Management
- Check your role in the application
- Contact admin if role change is needed

## Production Recommendations

1. **Change Default Credentials**: Update admin password immediately
2. **Use Strong JWT_SECRET**: Generate random 32+ character secret
3. **Enable HTTPS**: All authentication should use SSL/TLS
4. **HttpOnly Cookies**: Consider using instead of localStorage (prevents XSS)
5. **Rate Limiting**: Implement on login endpoint to prevent brute force
6. **Audit Logging**: Log all authentication attempts and user actions
7. **Regular Audits**: Review user accounts and permissions quarterly
8. **Two-Factor Authentication**: Consider adding 2FA for production
9. **Session Timeout**: Current 24-hour expiry is reasonable
10. **Password Policy**: Enforce strong passwords (length, complexity)
