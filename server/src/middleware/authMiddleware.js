const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../controllers/authController');

/**
 * Middleware to verify JWT token
 */
function verifyToken(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'No token provided. Access denied.' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attach user info to request
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired. Please login again.' 
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token. Access denied.' 
      });
    }
    return res.status(500).json({ 
      error: 'Failed to authenticate token.' 
    });
  }
}

/**
 * Middleware to check if user has required role
 * Role hierarchy: admin > manager > analyst > viewer
 */
function checkRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ 
        error: 'Access denied. User role not found.' 
      });
    }

    const userRole = req.user.role;
    
    // Check if user role is in allowed roles
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${userRole}` 
      });
    }

    next();
  };
}

/**
 * Role hierarchy helper - check if user role has sufficient permissions
 */
function hasPermission(userRole, requiredRole) {
  const hierarchy = {
    admin: 4,
    manager: 3,
    analyst: 2,
    viewer: 1
  };
  
  return hierarchy[userRole] >= hierarchy[requiredRole];
}

/**
 * Middleware to check minimum role level (hierarchical)
 */
function requireMinRole(minRole) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ 
        error: 'Access denied. User role not found.' 
      });
    }

    if (!hasPermission(req.user.role, minRole)) {
      return res.status(403).json({ 
        error: `Access denied. Minimum required role: ${minRole}. Your role: ${req.user.role}` 
      });
    }

    next();
  };
}

module.exports = {
  verifyToken,
  checkRole,
  requireMinRole,
  hasPermission
};
