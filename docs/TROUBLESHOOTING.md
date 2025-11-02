# Troubleshooting Guide

## Table of Contents
- [Authentication Issues](#authentication-issues)
- [Backend Issues](#backend-issues)
- [Frontend Issues](#frontend-issues)
- [Data Import Issues](#data-import-issues)
- [Dashboard Issues](#dashboard-issues)
- [Performance Issues](#performance-issues)

---

## Authentication Issues

### Problem: 401 Unauthorized Error
**Symptoms:** API returns 401 status code

**Solutions:**
1. **Check token expiration:**
   - JWT tokens expire after 24 hours
   - Log out and log in again to get a fresh token
   
2. **Verify Authorization header:**
   ```javascript
   // Correct format
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Check token validity:**
   - Open browser DevTools > Application > Local Storage
   - Look for `token` key
   - Verify it exists and is not empty

4. **System time issue:**
   - Ensure your system clock is correct
   - JWT validation can fail if time is off

---

### Problem: 403 Forbidden Error
**Symptoms:** API returns 403 status code

**Solutions:**
1. **Check user role permissions:**
   - Admin: Full access
   - Manager: Data + dashboards + view users
   - Analyst: Dashboards + view data
   - Viewer: View only

2. **Verify required permission:**
   - Creating data requires `create` permission
   - Editing requires `edit` permission
   - Deleting requires `delete` permission

3. **Contact administrator:**
   - If you need higher permissions, ask admin to update your role

---

### Problem: Invalid Credentials
**Symptoms:** Login fails with "Invalid credentials" message

**Solutions:**
1. **Verify username and password:**
   - Both are case-sensitive
   - Check for extra spaces
   - Default admin: username=`admin`, password=`admin123`

2. **Check account status:**
   - Account may be set to inactive
   - Admin can reactivate in User Management tab

3. **Verify user exists:**
   - Admin can check in User Management tab
   - User may need to be created first

4. **Password requirements:**
   - Minimum 6 characters
   - No maximum length

---

### Problem: Token Expired
**Symptoms:** "Token expired" error message

**Solutions:**
1. **Log out and log in again:**
   - Click logout button
   - Enter credentials again
   - New token valid for 24 hours

2. **Implement auto-refresh** (developers):
   ```javascript
   // Check token expiry before requests
   const isTokenExpired = () => {
     const token = localStorage.getItem('token');
     if (!token) return true;
     const payload = JSON.parse(atob(token.split('.')[1]));
     return payload.exp * 1000 < Date.now();
   };
   ```

---

### Problem: Buttons/Tabs Not Appearing
**Symptoms:** Missing UI elements based on role

**Solutions:**
1. **Check your user role:**
   - Look at top-right corner for role indicator
   - Different roles see different UI elements

2. **Permission-based visibility:**
   - User Management tab: Admin only
   - Create/Edit buttons: Admin, Manager, Analyst
   - Delete buttons: Admin, Manager

3. **Browser cache issue:**
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
   - Clear browser cache
   - Try incognito/private mode

---

## Backend Issues

### Problem: Connection Refused to MySQL
**Symptoms:** `Error: connect ECONNREFUSED`

**Solutions:**
1. **Check MySQL service:**
   ```bash
   # For Aiven, check dashboard
   # For local MySQL:
   sudo systemctl status mysql
   ```

2. **Verify `.env` credentials:**
   ```bash
   DB_HOST=your-mysql-host.aivencloud.com
   DB_PORT=12345
   DB_USER=avnadmin
   DB_PASSWORD=your-password
   DB_NAME=defaultdb
   ```

3. **Test connection manually:**
   ```bash
   mysql -h <host> -P <port> -u <user> -p
   ```

4. **Check firewall/security groups:**
   - Aiven: Check allowed IP addresses
   - AWS RDS: Check security group inbound rules
   - Local: Check firewall settings

5. **Verify SSL certificate:**
   ```bash
   DB_CA_PATH=./ca.pem
   ```
   - Ensure file exists at specified path
   - Download from Aiven dashboard if missing

---

### Problem: Tables Not Created
**Symptoms:** Application can't find tables

**Solutions:**
1. **Run table creation scripts:**
   ```bash
   cd server
   node DB/createTables.js
   node create-users-table.js
   ```

2. **Check MySQL user permissions:**
   ```sql
   SHOW GRANTS FOR 'your_user'@'%';
   ```
   - Needs CREATE, INSERT, UPDATE, DELETE, SELECT privileges

3. **Verify database name:**
   - Check `.env` DB_NAME matches actual database
   - Create database if it doesn't exist:
     ```sql
     CREATE DATABASE defaultdb;
     ```

---

### Problem: Port Already in Use
**Symptoms:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions:**
1. **Find process using port:**
   ```bash
   # macOS/Linux
   lsof -ti:3000
   
   # Windows
   netstat -ano | findstr :3000
   ```

2. **Kill the process:**
   ```bash
   # macOS/Linux
   kill -9 <PID>
   
   # Windows
   taskkill /PID <PID> /F
   ```

3. **Use different port:**
   - Edit `server/.env`: `PORT=3001`
   - Update frontend API base URL

---

### Problem: Module Not Found
**Symptoms:** `Error: Cannot find module 'express'`

**Solutions:**
1. **Install dependencies:**
   ```bash
   cd server
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check Node.js version:**
   ```bash
   node --version  # Should be v16 or higher
   ```

3. **Clear npm cache:**
   ```bash
   npm cache clean --force
   npm install
   ```

---

## Frontend Issues

### Problem: API Calls Fail (CORS Error)
**Symptoms:** Console shows CORS policy error

**Solutions:**
1. **Ensure backend is running:**
   ```bash
   cd server
   npm run dev
   # Should see: Server running on http://localhost:3000
   ```

2. **Check API base URL:**
   - File: `client/.env`
   - Content: `VITE_API_BASE=http://localhost:3000`

3. **Verify CORS configuration:**
   - File: `server/src/app.js`
   - Should have: `app.use(cors())`

4. **Browser cache:**
   - Hard refresh: Cmd+Shift+R or Ctrl+Shift+R
   - Clear all browser data
   - Try different browser

---

### Problem: Charts Not Rendering
**Symptoms:** Blank space where charts should appear

**Solutions:**
1. **Check browser console:**
   - Press F12 to open DevTools
   - Look for red error messages
   - Check if data is being returned

2. **Verify Recharts installation:**
   ```bash
   cd client
   npm list recharts
   # Should show: recharts@2.x.x
   ```

3. **Check data format:**
   - Pie charts need: `[{name: 'A', value: 10}]`
   - Bar charts need: `[{name: 'Jan', value: 100}]`
   - Line charts need: `[{name: 'Day 1', value: 50}]`

4. **Verify widget configuration:**
   - Check dashboard JSON in database
   - Ensure widget type matches data structure

---

### Problem: White Screen or Blank Page
**Symptoms:** Application shows empty white page

**Solutions:**
1. **Check browser console:**
   - Look for JavaScript errors
   - Note the error message and line number

2. **Clear cache and reinstall:**
   ```bash
   cd client
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Verify build process:**
   ```bash
   npm run build
   # Check for errors during build
   ```

4. **Check for syntax errors:**
   - Recent code changes may have introduced errors
   - Review git diff: `git diff`

---

### Problem: Vite Build Errors
**Symptoms:** Build fails with errors

**Solutions:**
1. **Update dependencies:**
   ```bash
   cd client
   npm update
   ```

2. **Check Node.js version:**
   ```bash
   node --version  # Should be v16 or higher
   ```

3. **Clear Vite cache:**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

---

## Data Import Issues

### Problem: CSV Import Fails
**Symptoms:** Error message when uploading CSV

**Solutions:**
1. **Verify CSV format:**
   ```csv
   column1,column2,column3
   value1,value2,value3
   ```
   - First row must be headers
   - Comma-separated values
   - No spaces after commas (unless in quotes)

2. **Check encoding:**
   - File must be UTF-8 encoded
   - Open in text editor and "Save As" with UTF-8 encoding

3. **Date format:**
   - Must be: YYYY-MM-DD
   - Example: 2025-11-02
   - Not: 11/02/2025 or 02-11-2025

4. **File size:**
   - Default limit: 10MB
   - Split large files into smaller chunks

5. **Check permissions:**
   - Only Admin and Manager roles can import
   - Viewer and Analyst have read-only access

---

### Problem: Excel Import Errors
**Symptoms:** Error when uploading Excel file

**Solutions:**
1. **Save as .xlsx format:**
   - Not .xls (old format)
   - Not .xlsm (macro-enabled)

2. **Remove formatting:**
   - No merged cells
   - No formulas (values only)
   - No conditional formatting
   - Simple table structure

3. **Check first row:**
   - Must contain column headers
   - Headers must match table columns

4. **Data validation:**
   - Ensure data types match (numbers, dates, text)
   - Remove special characters

---

### Problem: Import Succeeds but No Data
**Symptoms:** Import completes but table still empty

**Solutions:**
1. **Check primary key conflicts:**
   - If using auto-increment, don't include ID column in CSV
   - If including ID, ensure no duplicates

2. **Review error messages:**
   - Import may skip rows with validation errors
   - Check console output for details

3. **Verify table structure:**
   - Column names in CSV must match table columns exactly
   - Case-sensitive

---

## Dashboard Issues

### Problem: Dashboard Not Showing Widgets
**Symptoms:** Dashboard loads but widgets are blank

**Solutions:**
1. **Check if data exists:**
   - Go to Database Engine tab
   - Verify tables have data
   - Run sample query manually

2. **Verify widget configuration:**
   - Edit dashboard in Dashboard Engine
   - Check each widget's table and column selections
   - Ensure aggregation type is valid

3. **Check browser console:**
   - Look for API errors
   - Note error messages

4. **Test with simple widget:**
   - Create KPI widget with COUNT(*)
   - If this works, issue is with specific widget config

---

### Problem: Pie Chart Colors/Letters Missing
**Symptoms:** Pie chart shows but no letter codes (A, B, C)

**Solutions:**
1. **Verify data returned:**
   - Check browser console Network tab
   - Look at API response
   - Ensure data has name and value fields

2. **Check activePieIndexes state:**
   - This is internal state in DashboardView component
   - Try refreshing the page

3. **Clear browser cache:**
   - Hard refresh: Cmd+Shift+R or Ctrl+Shift+R

---

### Problem: Create Dashboards Script Fails
**Symptoms:** `create-dashboards-api.js` errors

**Solutions:**
1. **Ensure server is running:**
   ```bash
   # In separate terminal
   cd server
   npm run dev
   ```

2. **Verify sample data loaded:**
   ```bash
   node DB/seed.js
   ```

3. **Check server port:**
   - Script expects: `http://localhost:3000`
   - If using different port, edit script

4. **Review error message:**
   - Check console output
   - Note which dashboard failed
   - Verify table names in widget configs

---

### Problem: Export to PDF/PNG Fails
**Symptoms:** Export button doesn't work

**Solutions:**
1. **Check browser console:**
   - Look for html2canvas or jsPDF errors

2. **Verify libraries installed:**
   ```bash
   cd client
   npm list html2canvas jspdf
   ```

3. **Pop-up blocker:**
   - Allow pop-ups for the site
   - PDF opens in new tab/window

4. **Large dashboards:**
   - May take time to render
   - Wait 10-15 seconds for complex dashboards

---

## Performance Issues

### Problem: Slow Page Load
**Symptoms:** Application takes long time to load

**Solutions:**
1. **Check network speed:**
   - Use browser DevTools > Network tab
   - Look for slow requests

2. **Database query optimization:**
   - Add indexes to frequently queried columns
   - Limit number of rows returned
   - Use pagination

3. **Reduce widget complexity:**
   - Limit number of widgets per dashboard
   - Use data aggregation
   - Add date filters to reduce data

4. **Frontend optimization:**
   ```bash
   cd client
   npm run build  # Production build is optimized
   ```

---

### Problem: High Memory Usage
**Symptoms:** Application becomes slow or crashes

**Solutions:**
1. **Restart backend:**
   ```bash
   cd server
   # If using PM2
   pm2 restart insurance-viz-backend
   
   # If using npm
   # Ctrl+C then npm run dev
   ```

2. **Database connection pooling:**
   - Check `server/DB/db.js`
   - Adjust pool size if needed:
     ```javascript
     connectionLimit: 10  // Reduce if needed
     ```

3. **Clear browser cache:**
   - DevTools > Application > Clear storage

---

## Getting Help

If none of these solutions work:

1. **Check documentation:**
   - Read all docs in `docs/` folder
   - Review `DASHBOARD_CREATION_GUIDE.md`

2. **Review logs:**
   - Backend: Console output or PM2 logs
   - Frontend: Browser console (F12)
   - Database: MySQL error logs

3. **Test in isolation:**
   - Test API endpoint with Postman or cURL
   - Test component in isolation
   - Verify database query manually

4. **Create minimal reproduction:**
   - Isolate the issue
   - Test with fresh data
   - Try in different browser

5. **Contact support:**
   - Provide error messages
   - Include steps to reproduce
   - Share relevant code snippets
