# Documentation Index

Welcome to the Insurance Visualiser documentation! This folder contains comprehensive guides for setting up, using, and deploying the application.

## 📚 Documentation Structure

### Getting Started
- **[Main README](../README.md)** - Quick start guide and project overview
- **[Project Structure](PROJECT_STRUCTURE.md)** - Complete codebase structure and architecture

### Setup & Configuration
- **[Authentication Guide](AUTHENTICATION.md)** - Login system, RBAC, user management
- **[Dashboard Creation Guide](../DASHBOARD_CREATION_GUIDE.md)** - Step-by-step dashboard creation
- **[Database Schema](../DB.md)** - Complete database schema documentation
- **[Sample Data Guide](../sample-data/README.md)** - Data import instructions

### Development
- **[API Documentation](API.md)** - Complete API reference with examples
- **[Troubleshooting Guide](TROUBLESHOOTING.md)** - Common issues and solutions

### Deployment
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment instructions
- **[Security Best Practices](DEPLOYMENT.md#security)** - Production security recommendations

## 🔍 Quick Navigation

### I want to...

**Get started quickly**
→ Read [Main README](../README.md) Quick Start section

**Understand authentication**
→ Read [Authentication Guide](AUTHENTICATION.md)

**Create custom dashboards**
→ Read [Dashboard Creation Guide](../DASHBOARD_CREATION_GUIDE.md)

**Integrate with the API**
→ Read [API Documentation](API.md)

**Deploy to production**
→ Read [Deployment Guide](DEPLOYMENT.md)

**Fix an issue**
→ Read [Troubleshooting Guide](TROUBLESHOOTING.md)

**Understand the codebase**
→ Read [Project Structure](PROJECT_STRUCTURE.md)

## 📖 Documentation Summaries

### [AUTHENTICATION.md](AUTHENTICATION.md)
Covers the complete authentication system including:
- JWT token management
- Role-Based Access Control (RBAC)
- User management workflows
- Security best practices
- API endpoints for auth
- Common authentication issues

**When to read:** Setting up users, understanding permissions, integrating login

---

### [API.md](API.md)
Complete API reference including:
- All endpoints with request/response examples
- Authentication requirements
- Permission requirements per endpoint
- Error response formats
- cURL examples for testing
- Rate limiting recommendations

**When to read:** Building integrations, testing APIs, understanding backend

---

### [DEPLOYMENT.md](DEPLOYMENT.md)
Production deployment instructions including:
- Backend deployment (PM2, environment config)
- Frontend deployment (Nginx, cloud hosting)
- HTTPS/SSL configuration
- Database setup for production
- Post-deployment checklist
- Monitoring and maintenance

**When to read:** Deploying to production, setting up CI/CD

---

### [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
Common issues and solutions for:
- Authentication errors (401, 403, token expiry)
- Backend issues (database, ports, modules)
- Frontend issues (CORS, charts, white screen)
- Data import problems
- Dashboard rendering issues
- Performance problems

**When to read:** Debugging issues, something not working

---

### [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
Complete codebase overview including:
- Directory structure with explanations
- Component descriptions
- Data flow diagrams
- Key files explained
- Dependencies list
- Build output structure

**When to read:** Onboarding, understanding architecture, contributing

---

## 🎯 Learning Paths

### For End Users
1. [Main README](../README.md) - Overview
2. [Authentication Guide](AUTHENTICATION.md) - Login & roles
3. [Dashboard Creation Guide](../DASHBOARD_CREATION_GUIDE.md) - Create dashboards
4. [Troubleshooting](TROUBLESHOOTING.md) - Fix issues

### For Developers
1. [Main README](../README.md) - Setup
2. [Project Structure](PROJECT_STRUCTURE.md) - Architecture
3. [API Documentation](API.md) - Backend APIs
4. [Database Schema](../DB.md) - Data model
5. [Troubleshooting](TROUBLESHOOTING.md) - Debug

### For DevOps/Admins
1. [Main README](../README.md) - Setup
2. [Authentication Guide](AUTHENTICATION.md) - User management
3. [Deployment Guide](DEPLOYMENT.md) - Production setup
4. [Troubleshooting](TROUBLESHOOTING.md) - Fix issues

### For Integrators
1. [API Documentation](API.md) - Endpoints
2. [Authentication Guide](AUTHENTICATION.md) - Auth flow
3. [Database Schema](../DB.md) - Data structure
4. [Troubleshooting](TROUBLESHOOTING.md) - Debug APIs

---

## 📝 Additional Resources

### Root Directory Documentation
- **[TASK.md](../TASK.md)** - Project requirements and completion status
- **[DB.md](../DB.md)** - Database schema with all tables
- **[DASHBOARD_CREATION_GUIDE.md](../DASHBOARD_CREATION_GUIDE.md)** - Manual dashboard creation
- **[.gitignore](../.gitignore)** - Git ignore patterns

### Sample Data
- **[sample-data/README.md](../sample-data/README.md)** - Data import guide
- CSV files for Customers, Agents, Policies, Claims
- Excel files with same data

### Original Documentation (Archive)
- **[README_OLD.md](README_OLD.md)** - Original comprehensive README (backup)

---

## 🔄 Documentation Updates

This documentation is maintained alongside the codebase. When making changes:

1. **Update relevant docs** when changing features
2. **Keep examples current** with actual code
3. **Test all commands** in documentation
4. **Update version numbers** when dependencies change
5. **Add new sections** for new features

---

## 💡 Tips for Reading Documentation

- **Start with README** - Get overview and setup instructions
- **Use search** - Ctrl/Cmd+F to find specific topics
- **Follow links** - Documents are interconnected
- **Try examples** - Test API calls and commands
- **Check troubleshooting** - If something doesn't work

---

## 📧 Support

If documentation doesn't answer your question:

1. Check [Troubleshooting Guide](TROUBLESHOOTING.md)
2. Review console logs (browser and server)
3. Test in isolation (API with Postman, component alone)
4. Check GitHub issues (if using repo)
5. Contact development team

---

## 📊 Documentation Statistics

- **Total Documents:** 7 main docs + 4 supporting files
- **Lines of Documentation:** ~5,000+
- **Topics Covered:** 50+
- **Code Examples:** 100+
- **API Endpoints Documented:** 30+

---

**Last Updated:** November 2, 2025  
**Documentation Version:** 1.0  
**Application Version:** 1.0
