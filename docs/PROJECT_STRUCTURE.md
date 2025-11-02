# Project Structure

Complete overview of the Insurance Visualiser application structure.

## Directory Overview

```
Insurance-Visualiser/
├── client/                              # React frontend application
├── server/                              # Node.js backend application
├── docs/                                # Documentation (this folder)
├── sample-data/                         # Sample CSV/Excel files
├── DB.md                                # Database schema documentation
├── TASK.md                              # Project requirements
├── DASHBOARD_CREATION_GUIDE.md          # Dashboard creation guide
└── README.md                            # Main documentation
```

## Frontend Structure (`client/`)

### Application Entry
```
client/
├── index.html                           # HTML template
├── src/
│   ├── main.jsx                         # Vite entry point
│   ├── App.jsx                          # Main app with routing & auth
│   ├── styles.css                       # Global styles
│   └── Login.css                        # Login page styles
```

### Components
```
client/src/components/
├── Login.jsx                            # Login/Register form
├── DatabaseEngine.jsx                   # Database management UI
├── DashboardEngine.jsx                  # Dashboard configuration UI
├── DashboardView.jsx                    # Dashboard viewing with enhanced charts
├── UserManagement.jsx                   # User CRUD (admin only)
├── Pagination.jsx                       # Reusable pagination
├── ConfirmDialog.jsx                    # Confirmation modal
├── Toast.jsx                            # Toast notifications
├── Customers.jsx                        # Legacy customer UI
├── Agents.jsx                           # Legacy agent UI
├── Policies.jsx                         # Legacy policy UI
└── Claims.jsx                           # Legacy claim UI
```

**Key Components:**

- **Login.jsx** - Handles authentication, registration, JWT token management
- **DatabaseEngine.jsx** - Dynamic table management, CRUD operations, CSV/Excel import
- **DashboardEngine.jsx** - Dashboard builder with widget configuration
- **DashboardView.jsx** - Dashboard renderer with Recharts visualizations
- **UserManagement.jsx** - User administration panel (admin only)

### State Management
```
client/src/contexts/
└── AuthContext.jsx                      # Authentication context
    - User state
    - Role-based permissions
    - Login/logout functions
    - Permission checking
```

### Utilities
```
client/src/utils/
└── currency.js                          # INR formatting utilities
    - formatINR() - Full formatting
    - formatCompactINR() - Compact (1.2M)
```

### Hooks
```
client/src/hooks/
└── useToast.js                          # Toast notification hook
```

### Assets
```
client/assets/
└── chola-ms2559.jpg                     # Application logo
```

### Configuration
```
client/
├── vite.config.js                       # Vite configuration
├── package.json                         # Dependencies & scripts
└── .env                                 # Environment variables
    VITE_API_BASE=http://localhost:3000
```

---

## Backend Structure (`server/`)

### Application Entry
```
server/
├── src/
│   ├── index.js                         # Server entry point
│   └── app.js                           # Express app setup
```

### Controllers (Business Logic)
```
server/src/controllers/
├── authController.js                    # Login, register, verify, logout
├── userController.js                    # User CRUD operations
├── dbController.js                      # Database management
├── dashboardController.js               # Dashboard execution & management
├── customerController.js                # Customer operations
├── agentController.js                   # Agent operations
├── policyController.js                  # Policy operations
└── claimController.js                   # Claim operations
```

**Key Controllers:**

- **authController.js** - JWT generation, password hashing, token verification
- **userController.js** - User management with RBAC enforcement
- **dbController.js** - Dynamic table creation, schema introspection, data import
- **dashboardController.js** - Widget execution, filter application, SQL generation

### Models (Data Access)
```
server/src/models/
├── userModel.js                         # User database queries
├── dashboardModel.js                    # Dashboard database queries
├── customerModel.js                     # Customer database queries
├── agentModel.js                        # Agent database queries
├── policyModel.js                       # Policy database queries
└── claimModel.js                        # Claim database queries
```

### Routes (API Endpoints)
```
server/src/routes/
├── authRoutes.js                        # /api/auth/*
├── userRoutes.js                        # /api/users/*
├── dbRoutes.js                          # /api/db/*
├── dashboardRoutes.js                   # /api/dashboards/*
├── customerRoutes.js                    # /api/customers/*
├── agentRoutes.js                       # /api/agents/*
├── policyRoutes.js                      # /api/policies/*
└── claimRoutes.js                       # /api/claims/*
```

### Middleware
```
server/src/middleware/
├── authMiddleware.js                    # JWT verification & RBAC
│   - verifyToken()
│   - checkPermission()
│   - hasPermission()
└── validationMiddleware.js              # Request validation
```

### Utilities
```
server/src/utils/
├── importer.js                          # CSV/Excel file parsing
├── dashboardMetrics.js                  # Dashboard metrics calculation
└── rowValidator.js                      # Row validation for imports
```

### Database
```
server/DB/
├── db.js                                # MySQL connection pool with SSL
├── createTables.js                      # Table creation script
└── seed.js                              # Sample data seeding
```

### Scripts
```
server/
├── create-users-table.js                # User table & default admin creation
├── create-insurance-dashboards.js       # Dashboard generation (deprecated)
└── create-dashboards-api.js             # API-based dashboard creation
```

### Configuration
```
server/
├── ca.pem                               # Aiven SSL certificate
├── package.json                         # Dependencies & scripts
└── .env                                 # Environment variables (create this)
    DB_HOST=
    DB_PORT=
    DB_USER=
    DB_PASSWORD=
    DB_NAME=
    DB_CA_PATH=./ca.pem
    JWT_SECRET=
    PORT=3000
    NODE_ENV=development
```

---

## Documentation (`docs/`)

```
docs/
├── AUTHENTICATION.md                    # Auth & RBAC guide
├── API.md                               # Complete API reference
├── DEPLOYMENT.md                        # Production deployment guide
├── TROUBLESHOOTING.md                   # Common issues & solutions
└── README_OLD.md                        # Original detailed README (backup)
```

---

## Sample Data (`sample-data/`)

```
sample-data/
├── README.md                            # Import instructions
├── customers_sample.csv                 # 100 sample customers
├── agents_sample.csv                    # 20 sample agents
├── policies_sample.csv                  # 200 sample policies
├── claims_sample.csv                    # 50 sample claims
├── customers_sample.xlsx                # Excel version
├── agents_sample.xlsx
├── policies_sample.xlsx
└── claims_sample.xlsx
```

---

## Database Schema

See `DB.md` for complete schema documentation.

### Tables

1. **Users** - Authentication & user management
2. **Customers** - Customer information
3. **Agents** - Insurance agents
4. **Policies** - Insurance policies
5. **Claims** - Insurance claims
6. **Dashboards** - Dashboard configurations

---

## Key Files Explained

### `client/src/App.jsx`
- Main application component
- Authentication routing
- Context providers
- Tab navigation

### `server/src/app.js`
- Express app configuration
- Middleware setup (CORS, JSON parsing, file upload)
- Route registration
- Error handling

### `server/DB/db.js`
- MySQL connection pool
- SSL/TLS configuration
- Connection testing
- Aiven MySQL integration

### `server/src/middleware/authMiddleware.js`
- JWT token verification
- Role extraction from token
- Permission checking
- RBAC enforcement

### `client/src/contexts/AuthContext.jsx`
- Global authentication state
- User information
- Role-based permission checking
- Login/logout functions

### `client/src/components/DashboardView.jsx`
- Widget rendering
- Chart type detection
- Recharts integration
- Custom tooltips
- Export functionality (PDF/PNG)

---

## Data Flow

### Authentication Flow
```
1. User enters credentials → Login.jsx
2. POST /api/auth/login → authController.js
3. Verify password → bcrypt.compare()
4. Generate JWT → jsonwebtoken.sign()
5. Return token → Store in localStorage
6. Include in all requests → Authorization header
```

### Dashboard Rendering Flow
```
1. Select dashboard → DashboardView.jsx
2. POST /api/dashboards/:id/run → dashboardController.js
3. Execute each widget query → MySQL
4. Apply filters → SQL WHERE clause
5. Return data → JSON response
6. Render widgets → Recharts components
7. Display in 2-column grid
```

### Data Import Flow
```
1. Upload file → DatabaseEngine.jsx
2. POST /api/db/tables/:table/import → dbController.js
3. Parse file → importer.js (csv-parse or xlsx)
4. Validate rows → rowValidator.js
5. Insert/Update → MySQL (batch operations)
6. Return results → Success/error counts
```

---

## Build Output

### Development
```bash
# Backend
cd server && npm run dev
# Uses nodemon for auto-restart

# Frontend
cd client && npm run dev
# Vite dev server with HMR
```

### Production
```bash
# Frontend build
cd client && npm run build
# Output: client/dist/
#   ├── index.html
#   ├── assets/
#   │   ├── index-[hash].js
#   │   ├── index-[hash].css
#   │   └── [images]

# Backend
cd server && node src/app.js
# Or with PM2: pm2 start src/app.js
```

---

## Dependencies

### Frontend Key Dependencies
```json
{
  "react": "^18.2.0",
  "recharts": "^2.x.x",
  "html2canvas": "^1.x.x",
  "jspdf": "^2.x.x"
}
```

### Backend Key Dependencies
```json
{
  "express": "^4.x.x",
  "mysql2": "^3.x.x",
  "bcrypt": "^5.x.x",
  "jsonwebtoken": "^9.x.x",
  "multer": "^1.x.x",
  "csv-parse": "^5.x.x",
  "xlsx": "^0.18.x",
  "cors": "^2.x.x",
  "dotenv": "^16.x.x"
}
```

---

## Environment Variables

### Backend (`.env`)
```env
# Database
DB_HOST=              # MySQL host
DB_PORT=              # MySQL port (default: 3306)
DB_USER=              # MySQL username
DB_PASSWORD=          # MySQL password
DB_NAME=              # Database name
DB_CA_PATH=           # Path to SSL certificate

# Authentication
JWT_SECRET=           # Secret key for JWT signing (32+ chars)

# Server
PORT=                 # Server port (default: 3000)
NODE_ENV=             # development | production
```

### Frontend (`.env`)
```env
VITE_API_BASE=        # Backend API URL (e.g., http://localhost:3000)
```

---

## Scripts

### Backend Scripts
```bash
npm run dev           # Start with nodemon (dev)
npm start             # Start with node (production)
```

### Frontend Scripts
```bash
npm run dev           # Start Vite dev server
npm run build         # Build for production
npm run preview       # Preview production build
```

### Database Scripts
```bash
node DB/createTables.js              # Create database tables
node create-users-table.js           # Create Users table + default admin
node DB/seed.js                      # Seed sample data
node create-dashboards-api.js        # Create pre-built dashboards
```

---

## Port Usage

- **Backend:** 3000 (configurable via PORT env var)
- **Frontend Dev:** 5173 (Vite default)
- **MySQL:** 3306 (default) or Aiven custom port

---

## Git Ignore

Important files NOT tracked in git:

```
client/node_modules/
client/dist/
server/node_modules/
server/.env           # Sensitive credentials
server/ca.pem         # SSL certificate
*.log
.DS_Store
```

---

## Code Style

- **Naming:** camelCase for variables/functions, PascalCase for components
- **Indentation:** 2 spaces
- **Quotes:** Single quotes for JS, double for JSX attributes
- **Semicolons:** Consistent usage
- **Comments:** JSDoc for functions, inline for complex logic

---

This structure provides clear separation of concerns, making the application maintainable, scalable, and easy to understand.
