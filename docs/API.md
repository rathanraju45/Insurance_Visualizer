# API Documentation

## Base URL
```
Development: http://localhost:3000/api
Production: https://api.yourdomain.com/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

Token expires after 24 hours. Obtain token by logging in.

---

## Authentication Endpoints (Public)

### Register New User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123",
  "fullName": "John Doe",
  "role": "viewer"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "userId": 5
}
```

**Errors:**
- 400: Username or email already exists
- 400: Validation error (password too short, invalid email, etc.)

---

### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@insurance.com",
    "fullName": "System Administrator",
    "role": "admin"
  }
}
```

**Errors:**
- 401: Invalid credentials
- 403: Account is inactive

---

### Verify Token
```http
GET /api/auth/verify
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "valid": true,
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

**Errors:**
- 401: Token invalid or expired

---

### Logout
```http
POST /api/auth/logout
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

## User Management (Protected)

**Required Role:** Admin (create/update/delete), Manager (view only)

### List All Users
```http
GET /api/users?page=1&limit=10
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (200):**
```json
{
  "users": [
    {
      "user_id": 1,
      "username": "admin",
      "email": "admin@insurance.com",
      "full_name": "System Administrator",
      "role": "admin",
      "is_active": 1,
      "created_at": "2025-11-01T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "itemsPerPage": 10
  }
}
```

---

### Get User by ID
```http
GET /api/users/:id
```

**Response (200):**
```json
{
  "user_id": 1,
  "username": "admin",
  "email": "admin@insurance.com",
  "full_name": "System Administrator",
  "role": "admin",
  "is_active": 1,
  "created_at": "2025-11-01T10:30:00.000Z"
}
```

**Errors:**
- 404: User not found

---

### Create User
```http
POST /api/users
```

**Required Role:** Admin only

**Request Body:**
```json
{
  "username": "analyst1",
  "email": "analyst@company.com",
  "password": "securepass123",
  "fullName": "Jane Analyst",
  "role": "analyst",
  "isActive": true
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "userId": 6
}
```

**Errors:**
- 400: Username or email already exists
- 403: Insufficient permissions

---

### Update User
```http
PUT /api/users/:id
```

**Required Role:** Admin only

**Request Body (all fields optional):**
```json
{
  "email": "newemail@company.com",
  "fullName": "Jane Senior Analyst",
  "role": "manager",
  "isActive": false
}
```

**Response (200):**
```json
{
  "message": "User updated successfully"
}
```

**Errors:**
- 404: User not found
- 403: Insufficient permissions

---

### Delete User
```http
DELETE /api/users/:id
```

**Required Role:** Admin only

**Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

**Errors:**
- 404: User not found
- 403: Insufficient permissions
- 400: Cannot delete yourself

---

## Database Management (Protected)

**Permissions:**
- View: All roles
- Create: Admin, Manager
- Edit: Admin, Manager
- Delete: Admin, Manager

### List All Tables
```http
GET /api/db/tables
```

**Response (200):**
```json
{
  "tables": [
    "Customers",
    "Agents",
    "Policies",
    "Claims",
    "Dashboards",
    "Users"
  ]
}
```

---

### Get Table Schema
```http
GET /api/db/tables/:tableName/schema
```

**Response (200):**
```json
{
  "schema": [
    {
      "Field": "customer_id",
      "Type": "int",
      "Null": "NO",
      "Key": "PRI",
      "Default": null,
      "Extra": "auto_increment"
    },
    {
      "Field": "name",
      "Type": "varchar(255)",
      "Null": "NO",
      "Key": "",
      "Default": null,
      "Extra": ""
    }
  ]
}
```

---

### Create Table
```http
POST /api/db/tables
```

**Required Permission:** Create

**Request Body:**
```json
{
  "tableName": "Products",
  "columns": [
    {
      "name": "product_id",
      "type": "INT",
      "nullable": false,
      "primaryKey": true,
      "autoIncrement": true
    },
    {
      "name": "product_name",
      "type": "VARCHAR(255)",
      "nullable": false
    },
    {
      "name": "price",
      "type": "DECIMAL(10,2)",
      "nullable": true
    }
  ]
}
```

**Response (201):**
```json
{
  "message": "Table 'Products' created successfully"
}
```

---

### Delete Table
```http
DELETE /api/db/tables/:tableName
```

**Required Permission:** Delete

**Response (200):**
```json
{
  "message": "Table 'Products' deleted successfully"
}
```

---

### List Table Rows
```http
GET /api/db/tables/:tableName/rows?page=1&limit=20
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response (200):**
```json
{
  "rows": [
    {
      "customer_id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "555-1234"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20
  }
}
```

---

### Insert Row
```http
POST /api/db/tables/:tableName/rows
```

**Required Permission:** Create

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "555-5678"
}
```

**Response (201):**
```json
{
  "message": "Row inserted successfully",
  "insertId": 101
}
```

---

### Update Row
```http
PUT /api/db/tables/:tableName/rows/:primaryKey/:id
```

**Required Permission:** Edit

**Request Body:**
```json
{
  "email": "newemail@example.com",
  "phone": "555-9999"
}
```

**Response (200):**
```json
{
  "message": "Row updated successfully"
}
```

---

### Delete Row
```http
DELETE /api/db/tables/:tableName/rows/:primaryKey/:id
```

**Required Permission:** Delete

**Response (200):**
```json
{
  "message": "Row deleted successfully"
}
```

---

### Import Data (CSV/Excel)
```http
POST /api/db/tables/:tableName/import
```

**Required Permission:** Create

**Request:**
- Content-Type: `multipart/form-data`
- Body: File field named `file` with CSV or Excel file

**Response (200):**
```json
{
  "message": "Data imported successfully",
  "inserted": 50,
  "updated": 10,
  "errors": []
}
```

---

## Dashboard Management (Protected)

**Permissions:**
- View: All roles
- Create: Admin, Manager, Analyst
- Edit: Admin, Manager, Analyst
- Delete: Admin, Manager

### List All Dashboards
```http
GET /api/dashboards?page=1&limit=10
```

**Response (200):**
```json
{
  "dashboards": [
    {
      "dashboard_id": 1,
      "name": "Executive Summary",
      "description": "High-level business metrics",
      "config": {...},
      "created_at": "2025-11-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 15
  }
}
```

---

### Get Dashboard by ID
```http
GET /api/dashboards/:id
```

**Response (200):**
```json
{
  "dashboard_id": 1,
  "name": "Executive Summary",
  "description": "High-level business metrics",
  "config": {
    "widgets": [...],
    "filters": [...]
  },
  "created_at": "2025-11-01T10:00:00.000Z"
}
```

---

### Create Dashboard
```http
POST /api/dashboards
```

**Required Permission:** Create

**Request Body:**
```json
{
  "name": "Sales Dashboard",
  "description": "Track sales performance",
  "config": {
    "widgets": [
      {
        "type": "kpi",
        "title": "Total Sales",
        "table": "Policies",
        "aggregation": "SUM",
        "column": "premium_amount"
      }
    ],
    "filters": []
  }
}
```

**Response (201):**
```json
{
  "message": "Dashboard created successfully",
  "dashboardId": 9
}
```

---

### Update Dashboard
```http
PUT /api/dashboards/:id
```

**Required Permission:** Edit

**Request Body:** Same as Create Dashboard

**Response (200):**
```json
{
  "message": "Dashboard updated successfully"
}
```

---

### Delete Dashboard
```http
DELETE /api/dashboards/:id
```

**Required Permission:** Delete

**Response (200):**
```json
{
  "message": "Dashboard deleted successfully"
}
```

---

### Execute Dashboard (Run with Filters)
```http
POST /api/dashboards/:id/run
```

**Request Body:**
```json
{
  "filters": {
    "start_date": "2025-01-01",
    "end_date": "2025-12-31"
  }
}
```

**Response (200):**
```json
{
  "widgetResults": [
    {
      "title": "Total Premium",
      "type": "kpi",
      "data": {
        "value": 1250000
      }
    },
    {
      "title": "Policies by Type",
      "type": "pie",
      "data": [
        { "name": "Health", "value": 450 },
        { "name": "Auto", "value": 320 }
      ]
    }
  ]
}
```

---

## Error Responses

All endpoints return consistent error formats:

### 400 Bad Request
```json
{
  "error": "Validation error",
  "details": "Password must be at least 6 characters"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required",
  "message": "No token provided"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions",
  "message": "Admin role required for this action"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found",
  "message": "User with ID 999 not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Database connection failed"
}
```

---

## Rate Limiting

**Recommended for Production:**
- Login endpoint: 5 requests per minute per IP
- Other endpoints: 100 requests per minute per user

Implement using `express-rate-limit`:
```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: 'Too many login attempts, please try again later'
});

app.use('/api/auth/login', loginLimiter);
```

---

## Testing API with cURL

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Get Users (with token)
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Dashboard
```bash
curl -X POST http://localhost:3000/api/dashboards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Test Dashboard",
    "description": "Testing",
    "config": {"widgets":[],"filters":[]}
  }'
```

---

## Best Practices

1. **Always use HTTPS in production**
2. **Store tokens securely** (localStorage or httpOnly cookies)
3. **Handle token expiration** gracefully in frontend
4. **Validate all inputs** on both client and server
5. **Use proper error handling** and display user-friendly messages
6. **Implement rate limiting** on authentication endpoints
7. **Log API requests** for debugging and auditing
8. **Version your API** (e.g., `/api/v1/`) for future changes
