const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

/**
 * Get all users (paginated)
 */
async function getAllUsers(req, res) {
  try {
    const result = await userModel.findAll({
      page: req.query.page,
      limit: req.query.limit
    });
    
    res.json(result);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch users' 
    });
  }
}

/**
 * Get user by ID
 */
async function getUserById(req, res) {
  try {
    const user = await userModel.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user' 
    });
  }
}

/**
 * Create new user (admin only)
 */
async function createUser(req, res) {
  try {
    const { username, email, password, full_name, role = 'viewer' } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Username, email, and password are required' 
      });
    }

    // Check if username already exists
    const existingUsername = await userModel.findByUsername(username);
    if (existingUsername) {
      return res.status(409).json({ 
        error: 'Username already exists' 
      });
    }

    // Check if email already exists
    const existingEmail = await userModel.findByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ 
        error: 'Email already exists' 
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const userId = await userModel.create({
      username,
      email,
      password_hash,
      full_name: full_name || username,
      role
    });

    // Get created user
    const user = await userModel.findById(userId);

    res.status(201).json({ 
      message: 'User created successfully',
      user 
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ 
      error: 'Failed to create user' 
    });
  }
}

/**
 * Update user
 */
async function updateUser(req, res) {
  try {
    const userId = req.params.id;
    const { username, email, password, full_name, role, is_active } = req.body;

    // Check if user exists
    const existingUser = await userModel.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Prepare update data
    const updateData = {};
    
    if (username !== undefined) {
      // Check if new username is taken by another user
      const usernameCheck = await userModel.findByUsername(username);
      if (usernameCheck && usernameCheck.user_id !== parseInt(userId)) {
        return res.status(409).json({ 
          error: 'Username already exists' 
        });
      }
      updateData.username = username;
    }
    
    if (email !== undefined) {
      // Check if new email is taken by another user
      const emailCheck = await userModel.findByEmail(email);
      if (emailCheck && emailCheck.user_id !== parseInt(userId)) {
        return res.status(409).json({ 
          error: 'Email already exists' 
        });
      }
      updateData.email = email;
    }
    
    if (password) {
      // Hash new password
      updateData.password_hash = await bcrypt.hash(password, 10);
    }
    
    if (full_name !== undefined) updateData.full_name = full_name;
    if (role !== undefined) updateData.role = role;
    if (is_active !== undefined) updateData.is_active = is_active;

    // Prevent users from modifying their own role or active status
    const requestingUserId = req.user.userId;
    if (requestingUserId === parseInt(userId)) {
      if (role !== undefined && role !== existingUser.role) {
        return res.status(403).json({ 
          error: 'You cannot change your own role' 
        });
      }
      if (is_active !== undefined && is_active !== existingUser.is_active) {
        return res.status(403).json({ 
          error: 'You cannot deactivate your own account' 
        });
      }
    }

    // Update user
    await userModel.update(userId, updateData);

    // Get updated user
    const user = await userModel.findById(userId);

    res.json({ 
      message: 'User updated successfully',
      user 
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      error: 'Failed to update user' 
    });
  }
}

/**
 * Delete user
 */
async function deleteUser(req, res) {
  try {
    const userId = req.params.id;
    
    // Check if user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Prevent users from deleting themselves
    if (req.user.userId === parseInt(userId)) {
      return res.status(403).json({ 
        error: 'You cannot delete your own account' 
      });
    }

    // Delete user
    await userModel.remove(userId);

    res.json({ 
      message: 'User deleted successfully',
      userId 
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      error: 'Failed to delete user' 
    });
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
