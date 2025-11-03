# Insurance Data Visualization Application

A comprehensive full-stack application for Insurance Data Visualization with advanced authentication, role-based access control, and interactive dashboards using React, Node.js, and MySQL.

## 🌐 Live Demo

**🚀 [View Live Application](https://insurance-visualizer-frontend.onrender.com)**

**Default Login Credentials:**
- Username: `admin`
- Password: `admin123`

> ⚠️ **Note**: Free tier services may take 30-60 seconds to wake up on first access.

![Insurance Dashboard](client/assets/chola-ms2559.jpg)

## ✨ Key Features

- 🔐 **Authentication & RBAC** - Secure JWT-based login with 4 role types (Admin, Manager, Analyst, Viewer)
- 📊 **Dynamic Database Engine** - Create/manage tables with Excel/CSV import
- 🎨 **Interactive Dashboards** - 5 widget types with enhanced visualizations (Pie, Bar, Line, KPI, Tables)
- 👥 **User Management** - Complete user CRUD with role-based permissions
- 📈 **8 Pre-built Dashboards** - 54 ready-to-use insurance analytics widgets
- 📄 **Export** - PDF and PNG export functionality
- 💰 **Auto Currency Formatting** - Automatic INR formatting for financial data

## 🛠️ Technology Stack

**Frontend:** React 18 • Vite • Recharts 2.x • React Context API  
**Backend:** Node.js (v16+) • Express 4.x • JWT • bcrypt  
**Database:** MySQL 8.x (Aiven) • SSL/TLS • Connection Pooling  
**File Processing:** multer • csv-parse • xlsx

## 🚀 Quick Start

### Prerequisites

- Node.js v16 or higher
- MySQL database (Aiven recommended)
- npm or yarn

### 1. Clone & Install

```bash
git clone <repository-url>
cd Insurance-Visualiser

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
```

### 2. Configure Backend

Create `server/.env`:

```env
# Database (Aiven MySQL)
DB_HOST=your-mysql-host.aivencloud.com
DB_PORT=12345
DB_USER=avnadmin
DB_PASSWORD=your-password
DB_NAME=defaultdb
DB_CA_PATH=./ca.pem

# Authentication
JWT_SECRET=your-strong-secret-key

# Server
PORT=3000
NODE_ENV=development
```

### 3. Setup Database

```bash
cd server

# Create tables
node DB/createTables.js

# Create users table
node create-users-table.js

# (Optional) Seed sample data
node DB/seed.js

# (Optional) Create pre-built dashboards
node create-dashboards-api.js
```

### 4. Run Application

**Backend:**
```bash
cd server
npm run dev
# Running on http://localhost:3000
```

**Frontend:**
```bash
cd client
npm run dev
# Running on http://localhost:5173
```

### 5. Login

Open `http://localhost:5173` and login with:

```
Username: admin
Password: admin123
```

⚠️ **Change default password immediately!**

## 📖 Documentation

Comprehensive documentation available in the `docs/` folder:

- **[Authentication Guide](docs/AUTHENTICATION.md)** - Login, RBAC, user management
- **[API Documentation](docs/API.md)** - Complete API reference with examples
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions

Additional guides:

- **[Dashboard Creation Guide](DASHBOARD_CREATION_GUIDE.md)** - Step-by-step dashboard creation
- **[Database Schema](DB.md)** - Complete schema documentation
- **[Task List](TASK.md)** - Project requirements and progress

## 📁 Project Structure

```
Insurance-Visualiser/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── contexts/         # Auth context (NEW)
│   │   ├── hooks/            # Custom hooks
│   │   └── utils/            # Utilities (INR formatting)
│   └── assets/               # Images, logo
│
├── server/                    # Node.js backend
│   ├── src/
│   │   ├── controllers/      # Business logic
│   │   ├── models/           # Data access layer
│   │   ├── routes/           # API endpoints
│   │   └── middleware/       # Auth middleware (NEW)
│   ├── DB/                   # Database scripts
│   └── create-users-table.js # User setup (NEW)
│
├── docs/                      # Documentation (NEW)
│   ├── AUTHENTICATION.md
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── TROUBLESHOOTING.md
│
└── sample-data/              # Sample CSV/Excel files
```

## 👥 User Roles

| Role | Permissions |
|------|------------|
| **Admin** | Full access - manage everything including users |
| **Manager** | Manage data & dashboards, view users |
| **Analyst** | Create dashboards, view data |
| **Viewer** | Read-only access to dashboards |

## 🎨 Dashboard Features

### Widget Types

1. **KPI Cards** - Single metrics with gradient backgrounds
2. **Pie Charts** - Letter-coded slices, split-view for >8 items, interactive hover
3. **Bar Charts** - Auto-switch to horizontal for many items, angled labels
4. **Line Charts** - Time-series with dots, adaptive layouts
5. **Tables** - Sticky headers, zebra striping, INR formatting

### Chart Enhancements

- ✨ Letter codes (A, B, C) in pie slices
- 🎯 Custom tooltips with arrows
- 📏 Axis labels below charts (space-saving)
- 🔄 Dynamic layouts based on data volume
- 💱 Automatic currency detection and formatting

## 🔐 Security

- **Password Hashing** - bcrypt with 10 salt rounds
- **JWT Tokens** - 24-hour expiry, signed tokens
- **RBAC** - Server-side permission enforcement
- **SQL Injection Prevention** - Parameterized queries
- **SSL/TLS** - Encrypted database connections
- **Input Validation** - Sanitized user inputs

See [Security Best Practices](docs/DEPLOYMENT.md#security) for production recommendations.

## 📊 Sample Data

Sample insurance data included in `sample-data/`:

- **Customers** - 100 sample customers
- **Agents** - 20 insurance agents
- **Policies** - 200 policies (Health, Auto, Life, Home)
- **Claims** - 50 insurance claims

Import via Database Engine UI or run: `node DB/seed.js`

## 🧪 Testing

```bash
# Test API with cURL
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Or use Postman collection (import from docs/API.md)
```

## 🚀 Deployment

Quick deployment to production:

```bash
# Backend (with PM2)
npm install -g pm2
cd server
pm2 start src/app.js --name insurance-viz

# Frontend (build)
cd client
npm run build
# Deploy dist/ folder to hosting (Nginx, Vercel, Netlify)
```

See [Deployment Guide](docs/DEPLOYMENT.md) for detailed instructions.

## 🐛 Troubleshooting

**Common Issues:**

- **401 Unauthorized** - Token expired, log in again
- **CORS Error** - Ensure backend running on port 3000
- **Import Fails** - Check CSV format (UTF-8, YYYY-MM-DD dates)
- **Charts Not Showing** - Verify data exists in tables

See [Troubleshooting Guide](docs/TROUBLESHOOTING.md) for complete solutions.

## 🎯 Future Enhancements

### Completed ✅
- [x] Authentication & Authorization
- [x] Role-Based Access Control
- [x] User Management
- [x] Advanced Chart Library
- [x] Pre-built Dashboards

### Planned 🚀
- [ ] Mobile Responsive Design
- [ ] Dashboard Filters (date ranges, dropdowns)
- [ ] Real-time Updates (WebSockets)
- [ ] Scheduled Exports
- [ ] Audit Logs
- [ ] Dark Mode

## 📄 License

This project is for educational/demonstration purposes.

## 💬 Support

- 📖 [Documentation](docs/)
- 🐛 [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
- 📧 Check console logs and browser DevTools

---

**Built with ❤️ using React, Node.js, and MySQL**
