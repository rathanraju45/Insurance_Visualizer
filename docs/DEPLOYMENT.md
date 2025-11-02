# Production Deployment Guide

## Table of Contents
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Post-Deployment Checklist](#post-deployment-checklist)

## Backend Deployment

### 1. Environment Configuration

Create a production `.env` file:

```bash
# Set production environment
NODE_ENV=production

# Generate strong JWT secret (32+ characters)
# Example: openssl rand -base64 32
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

# Server configuration
PORT=3000
```

### 2. Process Manager (PM2)

PM2 is recommended for production process management:

```bash
# Install PM2 globally
npm install -g pm2

# Start backend with PM2
cd server
pm2 start src/app.js --name insurance-viz-backend

# Auto-restart on server reboot
pm2 startup
pm2 save

# Monitor logs
pm2 logs insurance-viz-backend

# View status
pm2 status

# Restart after code changes
pm2 restart insurance-viz-backend
```

#### PM2 Ecosystem File (Optional)

Create `ecosystem.config.js` in server directory:

```javascript
module.exports = {
  apps: [{
    name: 'insurance-viz-backend',
    script: './src/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

Then start with: `pm2 start ecosystem.config.js`

### 3. Database Setup

```bash
# Create production database tables
node DB/createTables.js

# Create users table and default admin
node server/create-users-table.js

# Import production data (if needed)
# Use Database Engine UI or run import scripts

# Create pre-built dashboards
node server/create-dashboards-api.js
```

**Important**: Update default admin password immediately after first login!

### 4. HTTPS Configuration

#### Option A: Nginx Reverse Proxy

Install Nginx:
```bash
sudo apt update
sudo apt install nginx
```

Create Nginx configuration (`/etc/nginx/sites-available/insurance-viz`):

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
    
    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Proxy to Node.js backend
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/insurance-viz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Let's Encrypt SSL Certificate

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal (runs twice daily)
sudo certbot renew --dry-run
```

### 5. CORS Configuration

Update `server/src/app.js`:

```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://yourdomain.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## Frontend Deployment

### 1. Build for Production

```bash
cd client

# Set production API URL
echo "VITE_API_BASE=https://api.yourdomain.com" > .env

# Install dependencies
npm install

# Build optimized production bundle
npm run build
```

This creates an optimized build in the `client/dist` directory.

### 2. Static File Hosting

#### Option A: Nginx (Same Server)

Add to Nginx configuration:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Root directory (frontend build)
    root /path/to/Insurance-Visualiser/client/dist;
    index index.html;
    
    # React Router support (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Option B: Vercel

1. Install Vercel CLI: `npm install -g vercel`
2. Navigate to client directory: `cd client`
3. Run: `vercel`
4. Follow prompts to deploy
5. Set environment variable: `VITE_API_BASE=https://your-backend-url.com`

#### Option C: Netlify

1. Connect GitHub repository to Netlify
2. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Base directory: `client`
3. Add environment variable: `VITE_API_BASE=https://your-backend-url.com`
4. Deploy

#### Option D: AWS S3 + CloudFront

```bash
# Install AWS CLI
pip install awscli

# Configure AWS credentials
aws configure

# Sync build to S3
aws s3 sync ./dist s3://your-bucket-name --delete

# Invalidate CloudFront cache (if using CDN)
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### 3. Environment Variables

Ensure `VITE_API_BASE` points to your production backend:

```bash
# client/.env
VITE_API_BASE=https://api.yourdomain.com
```

Or set in your hosting platform's environment settings.

---

## Post-Deployment Checklist

### Security
- [ ] Change default admin password (admin/admin123)
- [ ] Verify HTTPS is working on both frontend and backend
- [ ] Test SSL certificate validity
- [ ] Verify CORS settings allow only your frontend domain
- [ ] Check JWT_SECRET is strong and unique (32+ characters)
- [ ] Review user roles and permissions

### Functionality Testing
- [ ] Test login/logout flow
- [ ] Verify token expiration (24 hours)
- [ ] Test all RBAC permissions for each role:
  - [ ] Admin: All features
  - [ ] Manager: Data & dashboards
  - [ ] Analyst: Dashboard creation
  - [ ] Viewer: Read-only
- [ ] Test data import (CSV/Excel)
- [ ] Verify all 8 dashboards load correctly
- [ ] Test dashboard filters
- [ ] Test export functionality (PDF/PNG)
- [ ] Check all API endpoints respond correctly

### Performance & Monitoring
- [ ] Check browser console for errors
- [ ] Monitor server logs for issues
- [ ] Test page load times
- [ ] Verify database connection pooling
- [ ] Check PM2 process is running
- [ ] Set up automated backups
- [ ] Configure monitoring/alerting (e.g., New Relic, DataDog)

### Documentation
- [ ] Document production URLs
- [ ] Document admin procedures
- [ ] Update deployment runbook
- [ ] Share credentials securely with team

### Backup & Recovery
- [ ] Set up automated database backups
- [ ] Test backup restoration process
- [ ] Document backup retention policy
- [ ] Store backups in separate location

## Monitoring & Maintenance

### PM2 Monitoring
```bash
# View real-time logs
pm2 logs insurance-viz-backend

# Monitor CPU/Memory
pm2 monit

# View detailed info
pm2 show insurance-viz-backend
```

### Database Backups

Create a backup script (`backup-db.sh`):
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/path/to/backups"
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME > "$BACKUP_DIR/backup_$DATE.sql"
```

Schedule with cron:
```bash
# Daily backup at 2 AM
0 2 * * * /path/to/backup-db.sh
```

### Log Rotation

PM2 handles log rotation automatically. To configure:
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## Troubleshooting Production Issues

### Service Not Starting
```bash
# Check PM2 logs
pm2 logs insurance-viz-backend --err

# Check system logs
journalctl -u nginx
```

### High Memory Usage
```bash
# Check PM2 memory
pm2 monit

# Restart if needed
pm2 restart insurance-viz-backend
```

### Database Connection Issues
- Verify `.env` credentials
- Check MySQL service is running
- Test connection manually
- Check firewall rules

### CORS Errors
- Verify CORS_ORIGIN in backend `.env`
- Check Nginx proxy headers
- Verify frontend VITE_API_BASE URL

## Scaling Considerations

### Horizontal Scaling
- Use PM2 cluster mode: `instances: 'max'`
- Load balancer (Nginx, HAProxy, AWS ALB)
- Database read replicas
- Redis for session storage

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Optimize database queries
- Enable database query caching
- Use CDN for static assets

## Support

For production issues:
1. Check PM2 logs: `pm2 logs`
2. Check Nginx logs: `/var/log/nginx/error.log`
3. Check database logs
4. Review application logs
5. Contact DevOps team
