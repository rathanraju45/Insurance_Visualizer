const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

/**
 * All user routes require authentication
 * Only admin can manage users
 */

/**
 * GET /api/users
 * Get all users (paginated)
 */
router.get('/', verifyToken, checkRole('admin', 'manager'), userController.getAllUsers);

/**
 * GET /api/users/:id
 * Get user by ID
 */
router.get('/:id', verifyToken, checkRole('admin', 'manager'), userController.getUserById);

/**
 * POST /api/users
 * Create new user (admin only)
 */
router.post('/', verifyToken, checkRole('admin'), userController.createUser);

/**
 * PUT /api/users/:id
 * Update user (admin only)
 */
router.put('/:id', verifyToken, checkRole('admin'), userController.updateUser);

/**
 * DELETE /api/users/:id
 * Delete user (admin only)
 */
router.delete('/:id', verifyToken, checkRole('admin'), userController.deleteUser);

module.exports = router;
