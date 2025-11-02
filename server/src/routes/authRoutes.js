const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', authController.register);

/**
 * POST /api/auth/login
 * Login user and get JWT token
 */
router.post('/login', authController.login);

/**
 * GET /api/auth/verify
 * Verify JWT token and get user info
 */
router.get('/verify', verifyToken, authController.verify);

/**
 * POST /api/auth/logout
 * Logout (client-side token removal)
 */
router.post('/logout', verifyToken, authController.logout);

module.exports = router;
