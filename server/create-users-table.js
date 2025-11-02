require('dotenv').config();
const db = require('./DB/db');
const bcrypt = require('bcrypt');

async function createUsersTable() {
  console.log('🔐 Creating Users table with authentication...\n');
  
  try {
    // Create Users table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS Users (
        user_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role ENUM('admin', 'manager', 'analyst', 'viewer') DEFAULT 'viewer',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        INDEX idx_username (username),
        INDEX idx_email (email),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await db.query(createTableSQL);
    console.log('✓ Users table created successfully\n');
    
    // Create a default admin user
    const defaultPassword = 'admin123'; // Should be changed on first login
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    const insertAdminSQL = `
      INSERT INTO Users (username, email, password_hash, full_name, role)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE user_id = user_id;
    `;
    
    await db.query(insertAdminSQL, [
      'admin',
      'admin@insurance.com',
      hashedPassword,
      'System Administrator',
      'admin'
    ]);
    
    console.log('✓ Default admin user created');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('  Email: admin@insurance.com');
    console.log('  Role: admin\n');
    
    console.log('📋 User Roles:');
    console.log('  • admin    - Full access to everything');
    console.log('  • manager  - Manage data, dashboards, and users');
    console.log('  • analyst  - Create/view dashboards, manage data');
    console.log('  • viewer   - View dashboards only\n');
    
    console.log('✅ Authentication system ready!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    process.exit(0);
  }
}

createUsersTable();
