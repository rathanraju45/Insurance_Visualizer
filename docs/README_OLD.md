# Insurance Data Visualization Application

A comprehensive full-stack ReactJS application for Insurance Data Visualization with advanced authentication, role-based access control, and interactive dashboards using Node.js, Express, and MySQL (Aiven).

## 📋 Project Overview

This enterprise-grade application provides a complete insurance data management and visualization platform with four main components:

1. **Database Engine** - Dynamic database management with Excel/CSV imports
2. **Dashboard Engine** - Advanced dashboard configuration and creation
3. **Dashboard View** - Interactive dashboard viewing with filters and exports
4. **User Management** - Role-based access control with authentication

## ✨ Features

### 🔐 Authentication & Authorization (NEW!)
- ✅ **Secure Login/Registration** with JWT tokens
- ✅ **Password Hashing** with bcrypt
- ✅ **Role-Based Access Control** (RBAC)
  - **Admin** - Full system access, user management
  - **Manager** - Data & dashboard management
  - **Analyst** - Dashboard creation & data viewing
  - **Viewer** - Read-only dashboard access
- ✅ **Protected Routes** and API endpoints
- ✅ **Token Verification** and refresh
- ✅ **User Management Tab** (admin only)
- ✅ **Permission-Based UI** - tabs and actions based on role

### 1. Database Engine
- ✅ Create/Delete tables dynamically
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Upload data via Excel (.xlsx) or CSV (.csv) files
- ✅ View and manage data with pagination
- ✅ Schema visualization
- ✅ Import/Update existing records based on Primary Key
- ✅ Professional UI with modern styling
- ✅ Date formatting for human-readable display
- ✅ Auto-increment and constraint handling
- ✅ Role-based permissions (create/edit/delete)

### 2. Dashboard Engine (Enhanced!)
- ✅ Create dashboard views with multiple widget types:
  - 📊 **KPI Cards** - Gradient backgrounds, compact formatting
  - 📊 **Bar Charts** - Vertical/horizontal, dynamic orientation for >12 items
  - 🥧 **Pie Charts** - Letter codes, split-view for >8 items, interactive highlighting
  - 📈 **Line Charts** - Time-series with angled labels, dots for ≤15 points
  - 📋 **Summary Tables** - Sticky headers, zebra striping, multi-column selection
- ✅ **Multi-Column Selector** with checkboxes for table widgets
- ✅ **Custom SQL Group By** support (DATE_FORMAT, YEAR, MONTH, etc.)
- ✅ Setup filters (dynamic table/column selection)
- ✅ Save/manage dashboard configurations
- ✅ Visual widget configuration with modal editors
- ✅ Dynamic data source selection
- ✅ Aggregation functions (COUNT, SUM, AVG, MIN, MAX)
- ✅ Limit controls for all widget types
- ✅ **8 Pre-built Insurance Dashboards** with 54 widgets

### 3. Dashboard View (Redesigned!)
- ✅ Select and run dashboards from sidebar
- ✅ Apply filters dynamically with reset option
- ✅ **Enhanced Visualizations**:
  - **Pie Charts**: Letter codes (A, B, C), percentage labels, scaling on hover, custom tooltips with arrows, donut + table split-view for >8 items
  - **Bar Charts**: Auto-switch to horizontal for >12 items, angled labels, axis labels below
  - **Line Charts**: Dynamic height, angled labels for >15 points, dots for smaller datasets
  - **Tables**: 2-column span, alternating rows, sticky headers, INR formatting
- ✅ **Automatic INR Currency Formatting** for financial data
- ✅ **Axis Labels** (X/Y) displayed below charts to save space
- ✅ Export dashboard to **PDF**
- ✅ Export dashboard to **PNG image**
- ✅ **2-column grid layout** with smart widget spanning
- ✅ Professional chart rendering with Recharts
- ✅ Custom tooltips with formatted values

### 4. User Management (NEW!)
- ✅ **Create/Edit/Delete Users** (admin only)
- ✅ **Role Assignment** with permission preview
- ✅ **Account Status Management** (active/inactive)
- ✅ **User Directory** with pagination
- ✅ **Password Management** with secure hashing
- ✅ **Confirmation Dialogs** for destructive actions

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework with hooks
- **Vite** - Lightning-fast build tool and dev server
- **Recharts 2.x** - Powerful chart library for data visualization
- **html2canvas** - Canvas rendering for image exports
- **jsPDF** - PDF generation and download
- **React Context API** - State management for authentication
- **CSS3** - Modern styling with flexbox/grid, animations, gradients

### Backend
- **Node.js (v16+)** - Runtime environment
- **Express 4.x** - Fast web framework
- **MySQL 8.x** - Relational database (Aiven managed)
- **mysql2** - MySQL client with Promise support
- **bcrypt** - Password hashing and verification
- **jsonwebtoken (JWT)** - Token-based authentication
- **dotenv** - Environment configuration management
- **multer** - Multipart form-data file upload handling
- **csv-parse** - Streaming CSV parser
- **xlsx** - Excel file parsing (.xlsx/.xls)
- **express-validator** - Request validation middleware
- **cors** - Cross-Origin Resource Sharing

### Database
- **Aiven MySQL** - Managed MySQL cloud database
- **SSL/TLS** - Secure encrypted connections
- **Connection Pooling** - Optimized database connections

## 📦 Project Structure

```
Insurance-Visualiser/
├── client/                              # Frontend React application
│   ├── assets/
│   │   └── chola-ms2559.jpg            # Application logo
│   ├── src/
│   │   ├── components/
│   │   │   ├── DatabaseEngine.jsx       # Database management UI with CRUD
│   │   │   ├── DashboardEngine.jsx      # Dashboard configuration UI
│   │   │   ├── DashboardView.jsx        # Enhanced dashboard viewing with charts
│   │   │   ├── UserManagement.jsx       # User CRUD (admin only) - NEW!
│   │   │   ├── Login.jsx                # Login/Register form - NEW!
│   │   │   ├── Pagination.jsx           # Reusable pagination component
│   │   │   ├── ConfirmDialog.jsx        # Confirmation modal
│   │   │   ├── Toast.jsx                # Toast notifications
│   │   │   ├── Customers.jsx            # Legacy customer UI
│   │   │   ├── Agents.jsx               # Legacy agent UI
│   │   │   ├── Policies.jsx             # Legacy policy UI
│   │   │   └── Claims.jsx               # Legacy claim UI
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx          # Authentication context & RBAC - NEW!
│   │   ├── hooks/
│   │   │   └── useToast.js              # Toast notification hook
│   │   ├── utils/
│   │   │   └── currency.js              # INR formatting utilities - NEW!
│   │   ├── api.js                       # API helper functions
│   │   ├── App.jsx                      # Main app with auth routing
│   │   ├── main.jsx                     # Entry point
│   │   ├── styles.css                   # Global styles with modern UI
│   │   └── Login.css                    # Login page styles - NEW!
│   ├── package.json
│   └── vite.config.js
│
├── server/                              # Backend Node.js application
│   ├── DB/
│   │   ├── db.js                        # MySQL connection pool with SSL
│   │   ├── createTables.js              # Table creation script
│   │   └── seed.js                      # Data seeding script
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js        # Login/register/verify - NEW!
│   │   │   ├── userController.js        # User CRUD operations - NEW!
│   │   │   ├── dbController.js          # Database management
│   │   │   ├── dashboardController.js   # Enhanced dashboard execution
│   │   │   ├── customerController.js    # Customer operations
│   │   │   ├── agentController.js       # Agent operations
│   │   │   ├── policyController.js      # Policy operations
│   │   │   └── claimController.js       # Claim operations
│   │   ├── models/
│   │   │   ├── userModel.js             # User data access - NEW!
│   │   │   ├── dashboardModel.js        # Dashboard data access
│   │   │   ├── customerModel.js
│   │   │   ├── agentModel.js
│   │   │   ├── policyModel.js
│   │   │   └── claimModel.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js            # Authentication routes - NEW!
│   │   │   ├── userRoutes.js            # User management routes - NEW!
│   │   │   ├── dbRoutes.js              # Database routes
│   │   │   ├── dashboardRoutes.js       # Dashboard routes
│   │   │   ├── customerRoutes.js
│   │   │   ├── agentRoutes.js
│   │   │   ├── policyRoutes.js
│   │   │   └── claimRoutes.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js        # JWT verification & RBAC - NEW!
│   │   │   └── validationMiddleware.js  # Request validation
│   │   ├── utils/
│   │   │   ├── importer.js              # CSV/Excel file parsing
│   │   │   ├── dashboardMetrics.js      # Dashboard metrics
│   │   │   └── rowValidator.js          # Row validation
│   │   ├── app.js                       # Express app setup with auth
│   │   └── index.js                     # Server entry point
│   ├── create-users-table.js            # User table creation script - NEW!
│   ├── create-insurance-dashboards.js   # Dashboard generation script
│   ├── create-dashboards-api.js         # API-based dashboard creation
│   ├── .env                             # Environment variables (create this)
│   ├── ca.pem                           # Aiven SSL certificate
│   └── package.json
│
├── sample-data/                         # Sample CSV/Excel files
│   ├── README.md                        # Import instructions
│   ├── customers_sample.csv
│   ├── agents_sample.csv
│   ├── policies_sample.csv
│   ├── claims_sample.csv
│   ├── customers_sample.xlsx
│   ├── agents_sample.xlsx
│   ├── policies_sample.xlsx
│   └── claims_sample.xlsx
│
├── DB.md                                # Database schema documentation
├── TASK.md                              # Project requirements (updated)
├── DASHBOARD_CREATION_GUIDE.md          # Step-by-step dashboard guide - NEW!
└── README.md                            # This file (comprehensive)
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MySQL database (Aiven account recommended)
- Aiven MySQL CA certificate file

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Insurance-Visualiser
```

### 2. Backend Setup

#### Step 1: Install Dependencies

```bash
cd server
npm install
```

#### Step 2: Configure Environment Variables

Create a `.env` file in the `server` directory:

```bash
cd server
touch .env
```

Add the following configuration to `.env`:

```env
# Database Configuration (Aiven MySQL)
DB_HOST=your-aiven-mysql-host.aivencloud.com
DB_PORT=12345
DB_USER=avnadmin
DB_PASS=your-password
DB_NAME=defaultdb

# SSL/TLS Configuration (Aiven CA Certificate)
DB_CA_PATH=./path/to/ca.pem

# Server Configuration
PORT=3000
NODE_ENV=development
```

**Important:** Replace with your actual Aiven MySQL credentials and path to CA certificate.

#### Step 3: Download Aiven CA Certificate

1. Log in to your Aiven console
2. Navigate to your MySQL service
3. Download the CA Certificate
4. Save it in the `server` directory or specified path
5. Update `DB_CA_PATH` in `.env` to point to this file

#### Step 4: Create Database Tables

```bash
cd server
node DB/createTables.js
```

You should see:
```
✓ MySQL connection pool initialized and tested
✓ Table 'Customers' created or already exists.
✓ Table 'Agents' created or already exists.
✓ Table 'Policies' created or already exists.
✓ Table 'Claims' created or already exists.
✓ Table 'Dashboards' created or already exists.
All tables created successfully.
```

#### Step 5: Create Users Table & Authentication System (NEW!)

```bash
node create-users-table.js
```

This creates the Users table and a default admin account:
```
✓ Users table created successfully
✓ Default admin user created
  Username: admin
  Password: admin123
  Email: admin@insurance.com
  Role: admin

📋 User Roles:
  • admin    - Full access to everything
  • manager  - Manage data, dashboards, and users
  • analyst  - Create/view dashboards, manage data
  • viewer   - View dashboards only
```

**⚠️ Important**: Change the default admin password after first login!

#### Step 6: (Optional) Seed Sample Data

```bash
node DB/seed.js
```

This will populate the database with sample customers, agents, policies, and claims.

#### Step 7: (Optional) Create Pre-built Dashboards

```bash
node create-dashboards-api.js
```

This creates 6 comprehensive insurance dashboards with 34 widgets:
- Claims Analysis (8 widgets)
- Policy Performance (6 widgets)
- Customer Insights (3 widgets)
- Agent Performance (4 widgets)
- Risk Assessment (6 widgets)
- Operational Dashboard (7 widgets)

#### Step 8: Start the Backend Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

You should see:
```
Server running on http://localhost:3000
✓ MySQL connection pool initialized
```

### 3. Frontend Setup

#### Step 1: Install Dependencies

```bash
cd client
npm install
```

#### Step 2: Start the Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:5173` (or next available port)

#### Step 3: Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## � First Time Login

### Default Admin Credentials
```
Username: admin
Password: admin123
```

**⚠️ Security Note**: Change this password immediately after first login!

### User Roles & Permissions

| Role | Database Engine | Dashboard Engine | Dashboard View | User Management |
|------|----------------|------------------|----------------|-----------------|
| **Admin** | Full Access | Full Access | Full Access | Full Access ✓ |
| **Manager** | Full Access | Full Access | Full Access | View Only |
| **Analyst** | View Only | Create/Edit | Full Access | No Access |
| **Viewer** | View Only | View Only | View Only | No Access |

## �📖 Usage Guide

### Login & Registration

1. **Login**:
   - Enter username and password
   - Click "Sign In"
   - JWT token stored in localStorage
2. **First-time Users**:
   - Contact admin for account creation
   - Admin creates account via User Management tab
3. **Logout**:
   - Click "🚪 Logout" button in top-right
   - Token is cleared from browser

### Database Engine

1. **View Tables**: Tables appear in the left sidebar
2. **Create Table**: 
   - Click "➕ Create New Table"
   - Enter table name
   - Add columns with data types
   - Set nullable, primary key, and auto-increment options
3. **View Data**: Click any table to see its data
4. **Insert Row**: Select "Insert Row" tab, fill form, click "Insert"
5. **Edit Row**: Click "✏️ Edit" on any row
6. **Delete Row**: Click "🗑️" on any row
7. **Import Data**: Click "📤 Import CSV/Excel", select file
8. **View Schema**: Select "Schema" tab to see table structure

### Dashboard Engine

1. **Create Dashboard**:
   - Click "➕ New" in sidebar
   - Enter dashboard name and description
   - Click "➕ Add Widget"
2. **Configure Widget**:
   - Select widget type (KPI, Bar, Pie, Line, Table)
   - Enter widget title
   - Select table and aggregation
   - Choose column (if needed)
   - Set GROUP BY for charts
3. **Add Filters**:
   - Click "➕ Add Filter"
   - Select table and column
   - Choose operator (=, ≠, >, <, contains)
   - Set default value
4. **Save**: Click "💾 Save Dashboard"

### Dashboard View

1. **Select Dashboard**: Click any dashboard in sidebar
2. **Apply Filters**: 
   - Update filter values in the filters panel
   - Click "🔍 Apply Filters"
   - Click "Reset" to clear filters
3. **View Visualizations**: 
   - **KPI Cards**: Display with gradient backgrounds
   - **Pie Charts**: Hover to scale slices, see letter codes (A, B, C)
   - **Bar Charts**: Auto-switch to horizontal for many items
   - **Line Charts**: Time-series with trend visualization
   - **Tables**: Multi-column with INR formatting
4. **Interactive Features**:
   - Hover over charts for detailed tooltips
   - Pie slices scale and highlight on hover
   - Tooltips show formatted values with arrows
5. **Export**:
   - Click "📄 Export to PDF" for PDF download
   - Click "🖼️ Export as Image" for PNG download

### User Management (Admin Only)

1. **Create User**:
   - Click "➕ Create New User"
   - Fill in username, email, password, full name
   - Select role (admin/manager/analyst/viewer)
   - Set account status (active/inactive)
   - Click "Create User"
2. **Edit User**:
   - Click "✏️ Edit" on any user row
   - Update fields as needed
   - Click "Update User"
3. **Delete User**:
   - Click "🗑️" on any user row
   - Confirm deletion in dialog
4. **View Permissions**:
   - Each role shows its permissions in the form

## 🔧 API Endpoints

### Authentication (Public)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/verify` - Verify token (protected)
- `POST /api/auth/logout` - Logout (protected)

### User Management (Protected - Admin/Manager)
- `GET /api/users` - List all users (paginated)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Database Management (Protected)
- `GET /api/db/tables` - List all tables
- `GET /api/db/tables/:table/schema` - Get table schema
- `POST /api/db/tables` - Create table (requires create permission)
- `DELETE /api/db/tables/:table` - Drop table (requires delete permission)
- `GET /api/db/tables/:table/rows` - List rows (paginated)
- `POST /api/db/tables/:table/rows` - Insert row (requires create permission)
- `PUT /api/db/tables/:table/rows/:pk/:id` - Update row (requires edit permission)
- `DELETE /api/db/tables/:table/rows/:pk/:id` - Delete row (requires delete permission)
- `POST /api/db/tables/:table/import` - Import CSV/Excel (requires create permission)

### Dashboards (Protected)
- `GET /api/dashboards` - List dashboards (paginated)
- `GET /api/dashboards/:id` - Get dashboard by ID
- `POST /api/dashboards` - Create dashboard (requires create permission)
- `PUT /api/dashboards/:id` - Update dashboard (requires edit permission)
- `DELETE /api/dashboards/:id` - Delete dashboard (requires delete permission)
- `POST /api/dashboards/:id/run` - Execute dashboard with filters

### Legacy Entity Endpoints (Protected)
- `/api/customers` - Customer CRUD + import
- `/api/agents` - Agent CRUD + import
- `/api/policies` - Policy CRUD + import
- `/api/claims` - Claim CRUD + import

**Note**: All protected endpoints require `Authorization: Bearer <token>` header

## 🎨 Design Highlights

### Visual Design
- **Modern UI**: Card-based layouts with smooth transitions and shadows
- **Color Scheme**: 
  - Primary Blue (#0066cc) for actions
  - Gradient backgrounds for KPI cards
  - Role-based color coding (admin=red, manager=green, analyst=cyan, viewer=gray)
- **Typography**: System fonts with proper hierarchy and spacing
- **Animations**: Smooth hover effects, transitions, and loading states

### Chart Enhancements
- **Pie Charts**:
  - Letter codes (A, B, C) inside slices
  - Percentage labels
  - Scale animation on hover with blue border
  - Custom tooltips with arrows pointing to slices
  - Split-view (donut + table) for >8 items
  - Colored badges in legend
- **Bar Charts**:
  - Auto-switch to horizontal layout for >12 items
  - Angled labels for readability
  - Dynamic height based on data points
  - Axis labels below charts (X/Y format)
- **Line Charts**:
  - Dots on data points for ≤15 items
  - Thicker lines (2.5px)
  - Angled labels for crowded data
- **Tables**:
  - Sticky headers with gradient background
  - Zebra striping for readability
  - Automatic INR currency formatting
  - 2-column spanning for better visibility
  - Row highlighting on pie chart hover (split-view)

### User Experience
- **Intuitive UX**: Modal editors, toast notifications, confirmation dialogs
- **Loading States**: Spinners and skeleton screens
- **Error Handling**: Clear error messages with toast notifications
- **Accessibility**: Clear labels, readable fonts, logical tab navigation
- **Responsive Grid**: 2-column layout with smart widget spanning
- **Permission-Based UI**: Buttons and tabs appear based on user role

## 🐛 Troubleshooting

### Authentication & Authorization Issues

**Problem**: `401 Unauthorized` or `403 Forbidden` errors
**Solution**:
1. Check if JWT token is valid and not expired (24-hour expiry)
2. Verify token is included in Authorization header: `Bearer <token>`
3. Check user role has required permissions for the action
4. Try logging out and logging in again to get fresh token

**Problem**: `Invalid credentials` on login
**Solution**:
1. Verify username and password are correct (case-sensitive)
2. Default admin credentials: username=`admin`, password=`admin123`
3. Check if user exists in Users table
4. Password must be at least 6 characters

**Problem**: `Token expired` error
**Solution**:
- JWT tokens expire after 24 hours
- Log out and log in again to get new token
- Check system time is correct

**Problem**: Buttons/tabs not appearing
**Solution**:
1. Verify user role in User Management tab (admin only can view)
2. Check permissions table in README for role capabilities
3. Viewer role has most restrictions (view-only access)
4. Admin can update user role if needed

### Backend Issues

**Problem**: Connection refused to MySQL
**Solution**:
- Check `.env` credentials (host, user, password, database)
- Verify Aiven service is running and accessible
- Confirm CA certificate path is correct
- Check firewall/security group settings
- Test connection: `mysql -h <host> -u <user> -p`

**Problem**: Tables not created
**Solution**:
- Run `node DB/createTables.js` manually
- Run `node server/create-users-table.js` for Users table
- Check MySQL user permissions (CREATE, INSERT, etc.)
- Verify database name in `.env` matches existing database

**Problem**: Port already in use (EADDRINUSE)
**Solution**:
```bash
# Find process using port 3000
lsof -ti:3000
# Kill the process
kill -9 <PID>
```

### Frontend Issues

**Problem**: API calls fail (CORS error)
**Solution**:
- Ensure backend is running on port 3000
- Check `VITE_API_BASE` environment variable in `client/.env`
- Verify CORS is enabled in `server/src/app.js`
- Clear browser cache and reload

**Problem**: Charts not rendering
**Solution**:
- Check browser console for errors
- Verify Recharts is installed: `npm list recharts`
- Ensure data format matches expected structure
- Try refreshing the page
- Check if activePieIndexes state is initialized

**Problem**: White screen or blank page
**Solution**:
```bash
# Clear cache and reinstall
rm -rf client/node_modules
rm client/package-lock.json
cd client && npm install
```

### Data Import Issues

**Problem**: CSV import fails
**Solution**:
1. Verify CSV format matches expected structure (see below)
2. Check for special characters (use UTF-8 encoding)
3. Ensure date formats are YYYY-MM-DD
4. Check file size limit (default 10MB)
5. Ensure user has permission (admin/manager role)

**Problem**: Excel import errors
**Solution**:
- Save Excel file as `.xlsx` format (not `.xls`)
- Ensure first row contains column headers
- Remove merged cells and formatting

### Dashboard Issues

**Problem**: `create-dashboards-api.js` script fails
**Solution**:
1. Ensure backend server is running on localhost:3000
2. Verify sample data is loaded first (`node sample-data/seed-data.js`)
3. Check console for specific error messages
4. Run script with: `node server/create-dashboards-api.js`

**Problem**: Dashboard not showing widgets
**Solution**:
1. Verify widget configuration JSON is valid
2. Check if data exists in database tables
3. Review browser console for errors
4. Ensure user has permission to view dashboards (all roles can view)

**Problem**: Pie chart colors/letters missing
**Solution**:
- Verify widget has valid data returned from query
- Check if activePieIndexes state is initialized in DashboardView
- Clear browser cache and reload page

## 📝 Data Import Format

### CSV Format Example
```csv
customer_id,name,email,phone,date_of_birth
1,John Doe,john@example.com,555-1234,1990-05-15
2,Jane Smith,jane@example.com,555-5678,1985-08-22
```

### Import Behavior
- **Insert**: New rows with unique primary keys
- **Update**: Existing rows matched by primary key
- **Skip**: Rows with validation errors

See `sample-data/README.md` for detailed import instructions.

## 🔐 Security Notes

### Authentication Security
- **Password Hashing**: Passwords hashed using bcrypt with 10 salt rounds (never stored as plaintext)
- **JWT Tokens**: 
  - 24-hour expiry for automatic session timeout
  - Signed with `JWT_SECRET` from environment variables
  - Stored in localStorage (consider httpOnly cookies for production)
  - Verified on every protected API request
- **Token Transmission**: Bearer token in Authorization header

### Authorization Security
- **Role-Based Access Control (RBAC)**: 4 roles with granular permissions
  - Admin: Full system access
  - Manager: Data management + user viewing
  - Analyst: Dashboard creation + data viewing
  - Viewer: Read-only access
- **Permission Enforcement**: Server-side middleware checks on all protected routes
- **Principle of Least Privilege**: Users granted minimum required permissions

### Database Security
- **SQL Injection Prevention**: Parameterized queries with `mysql2` placeholders
- **Column/Table Name Sanitization**: Alphanumeric + underscore only, validated before queries
- **Connection Encryption**: SSL/TLS enabled for Aiven MySQL connections
- **Connection Pooling**: Secure connection reuse with automatic cleanup
- **Environment Variables**: Sensitive credentials never hardcoded

### File Upload Security
- **File Type Restrictions**: Only CSV and Excel (.xlsx) files accepted
- **File Size Limits**: Default 10MB maximum (configurable in multer)
- **Extension Validation**: MIME type checking on upload
- **Temporary Storage**: Files processed and removed after import

### Production Security Recommendations
1. **Change Default Credentials**: Update default admin password immediately
2. **Use HTTPS**: Enable SSL/TLS certificates for all traffic
3. **Secure JWT_SECRET**: Use strong, randomly generated secret (32+ characters)
4. **HttpOnly Cookies**: Consider storing JWT in httpOnly cookies instead of localStorage to prevent XSS
5. **CORS Restrictions**: Set specific allowed origins (not `*`)
6. **Rate Limiting**: Implement rate limiting on authentication endpoints
7. **Audit Logging**: Log all authentication attempts and critical actions
8. **Regular Updates**: Keep dependencies updated for security patches
9. **Database Backups**: Regular automated backups with encryption
10. **Environment Isolation**: Separate dev/staging/production environments

## 🚀 Production Deployment

### Backend Deployment

1. **Environment Configuration**
   ```bash
   # Set production environment
   NODE_ENV=production
   
   # Generate strong JWT secret (32+ characters)
   JWT_SECRET=your-strong-random-secret-key-here
   
   # Production database credentials
   DB_HOST=your-production-mysql-host
   DB_USER=your-production-user
   DB_PASSWORD=your-strong-password
   DB_NAME=insurance_viz_prod
   DB_PORT=3306
   DB_CA_CERT=/path/to/production/ca-certificate.crt
   
   # CORS settings
   CORS_ORIGIN=https://yourdomain.com
   ```

2. **Process Manager** (PM2 recommended)
   ```bash
   # Install PM2 globally
   npm install -g pm2
   
   # Start backend with PM2
   cd server
   pm2 start src/app.js --name insurance-viz-backend
   
   # Auto-restart on reboot
   pm2 startup
   pm2 save
   
   # Monitor logs
   pm2 logs insurance-viz-backend
   ```

3. **Database Setup**
   - Create production database on Aiven or your MySQL provider
   - Run table creation scripts:
     ```bash
     node DB/createTables.js
     node server/create-users-table.js
     ```
   - Update default admin password immediately
   - Import production data
   - Create dashboards: `node server/create-dashboards-api.js`

4. **HTTPS Configuration**
   - Use reverse proxy (Nginx/Apache) with SSL certificates
   - Enable HTTPS redirect
   - Configure SSL/TLS certificates (Let's Encrypt recommended)

5. **CORS Configuration**
   - Update `server/src/app.js` CORS settings:
     ```javascript
     app.use(cors({
       origin: process.env.CORS_ORIGIN || 'https://yourdomain.com',
       credentials: true
     }));
     ```

### Frontend Deployment

1. **Build for Production**
   ```bash
   cd client
   
   # Set production API URL
   echo "VITE_API_BASE=https://api.yourdomain.com" > .env
   
   # Build optimized production bundle
   npm run build
   ```

2. **Static File Hosting**
   
   **Option A: Nginx**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       # Redirect to HTTPS
       return 301 https://$server_name$request_uri;
   }
   
   server {
       listen 443 ssl http2;
       server_name yourdomain.com;
       
       ssl_certificate /path/to/certificate.crt;
       ssl_certificate_key /path/to/private.key;
       
       root /path/to/Insurance-Visualiser/client/dist;
       index index.html;
       
       # React Router support
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # API proxy (optional if backend on same server)
       location /api/ {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   **Option B: Cloud Hosting**
   - **Vercel/Netlify**: Connect GitHub repo, auto-deploy on push
   - **AWS S3 + CloudFront**: Static hosting with CDN
   - **Azure Static Web Apps**: Integrated deployment
   
3. **Environment Variables**
   - Set `VITE_API_BASE` to production backend URL
   - Example: `https://api.yourdomain.com`
   - Ensure API supports CORS from frontend domain

### Post-Deployment Checklist

- [ ] Change default admin password
- [ ] Verify HTTPS is working on both frontend and backend
- [ ] Test all authentication flows (login, logout, token refresh)
- [ ] Verify RBAC permissions for all roles
- [ ] Test data import with production data
- [ ] Verify all 8 dashboards load correctly
- [ ] Test export functionality (PDF/PNG)
- [ ] Check browser console for errors
- [ ] Monitor server logs for issues
- [ ] Set up automated backups
- [ ] Configure monitoring/alerting
- [ ] Document admin procedures

## 📄 License

This project is for educational/demonstration purposes.

## 👥 Support

For issues or questions, please check:
1. This README
2. `sample-data/README.md` for import help
3. Console logs for error messages
4. Database connection in `.env`

## 🎯 Future Enhancements

### Completed Features ✅
- [x] **Authentication & Authorization** - JWT-based login with secure password hashing
- [x] **Role-Based Access Control** - 4 roles with granular permissions (admin, manager, analyst, viewer)
- [x] **Advanced Chart Library** - Recharts with custom tooltips, dynamic layouts, interactive features
- [x] **User Management** - Full CRUD operations for admin to manage users
- [x] **Pre-built Dashboards** - 8 comprehensive insurance dashboards with 54 widgets

### Planned Enhancements 🚀

**High Priority**
- [ ] **Mobile Responsive Design** - Adapt layouts for tablets and mobile devices
- [ ] **Dashboard Filters** - Date ranges, dropdowns, multi-select filters
- [ ] **Advanced Filter Logic** - AND/OR combinations, nested conditions
- [ ] **Real-time Data Updates** - WebSocket support for live dashboard updates
- [ ] **Audit Logs** - Track all user actions and data changes

**Medium Priority**
- [ ] **Scheduled Exports** - Automated PDF/Excel reports via email
- [ ] **Email Notifications** - Alerts for anomalies, thresholds, system events
- [ ] **Dashboard Cloning** - Duplicate existing dashboards for quick creation
- [ ] **Widget Templates** - Reusable widget configurations
- [ ] **Data Validation Rules** - Custom validation for data imports
- [ ] **Bulk Operations** - Batch user management, bulk data imports

**Nice to Have**
- [ ] **Dark Mode** - Theme toggle for better user experience
- [ ] **Multi-language Support** - i18n for international users
- [ ] **Custom Themes** - White-label branding options
- [ ] **Advanced Analytics** - Predictive models, trend analysis
- [ ] **API Documentation** - Interactive Swagger/OpenAPI docs
- [ ] **Two-Factor Authentication** - Enhanced security with 2FA
- [ ] **Social Login** - OAuth integration (Google, Microsoft)
- [ ] **Dashboard Sharing** - Public/private sharing links
- [ ] **Collaborative Editing** - Real-time multi-user dashboard editing
- [ ] **Version Control** - Dashboard versioning and rollback

### Technical Improvements
- [ ] **TypeScript Migration** - Type safety across frontend and backend
- [ ] **Unit Tests** - Jest/Vitest for component and API testing
- [ ] **E2E Tests** - Playwright/Cypress for integration testing
- [ ] **Performance Optimization** - Code splitting, lazy loading, caching
- [ ] **Database Optimization** - Indexes, query optimization, read replicas
- [ ] **CI/CD Pipeline** - Automated testing and deployment
- [ ] **Docker Support** - Containerization for easy deployment
- [ ] **Kubernetes** - Scalable orchestration for production

---

**Built with ❤️ using React, Node.js, and MySQL**
