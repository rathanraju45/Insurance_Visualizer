const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

// JWT Secret - In production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'insurance-visualiser-secret-key-change-in-production';
const JWT_EXPIRY = '24h'; // Token expires in 24 hours

/**
 * Register a new user
 */
async function register(req, res) {
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

    // Get created user (without password)
    const user = await userModel.findById(userId);

    res.status(201).json({ 
      message: 'User registered successfully',
      user 
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      error: 'Failed to register user' 
    });
  }
}

/**
 * Login user
 */
async function login(req, res) {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required' 
      });
    }

    // Find user by username
    const user = await userModel.findByUsername(username);
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid username or password' 
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ 
        error: 'Account is deactivated. Please contact administrator.' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid username or password' 
      });
    }

    // Update last login
    await userModel.updateLastLogin(user.user_id);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.user_id, 
        username: user.username,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    // Return user info and token (exclude password)
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Failed to login' 
    });
  }
}

/**
 * Verify token and return user info
 */
async function verify(req, res) {
  try {
    // User is already attached by authMiddleware
    const user = await userModel.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    res.json({ 
      user,
      valid: true 
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ 
      error: 'Failed to verify token' 
    });
  }
}

/**
 * Logout (client-side token deletion, this is just for logging)
 */
function logout(req, res) {
  // JWT is stateless, so logout is handled client-side by removing the token
  // This endpoint is mainly for logging purposes
  res.json({ 
    message: 'Logout successful. Please remove token from client.' 
  });
}

module.exports = {
  register,
  login,
  verify,
  logout,
  JWT_SECRET
};
