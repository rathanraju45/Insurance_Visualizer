const express = require('express');
const cors = require('cors');
const customerRoutes = require('./routes/customerRoutes');
const agentRoutes = require('./routes/agentRoutes');
const policyRoutes = require('./routes/policyRoutes');
const claimRoutes = require('./routes/claimRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const dbRoutes = require('./routes/dbRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

function createApp() {
  const app = express();
  // enable CORS for frontend dev server (adjust origin if needed)
  app.use(cors());
  app.use(express.json());

  // Public routes (no authentication required)
  app.use('/api/auth', authRoutes);
  
  // Protected routes (authentication will be added to specific routes)
  app.use('/api/users', userRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/agents', agentRoutes);
  app.use('/api/policies', policyRoutes);
  app.use('/api/claims', claimRoutes);
  app.use('/api/dashboards', dashboardRoutes);
  app.use('/api/db', dbRoutes);

  app.get('/health', (req,res)=>res.json({ok:true}));

  // generic error handler
  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

module.exports = createApp;
