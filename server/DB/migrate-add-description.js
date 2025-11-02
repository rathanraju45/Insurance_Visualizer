// Migration: Add description column to Dashboards table
require('dotenv').config();
const db = require('./db');

async function migrate() {
  try {
    await db.initDB();
    console.log('Connected to database');

    // Check if description column exists
    const cols = await db.query(`SHOW COLUMNS FROM Dashboards LIKE 'description'`);
    
    if (cols.length === 0) {
      console.log('Adding description column to Dashboards table...');
      await db.query(`ALTER TABLE Dashboards ADD COLUMN description TEXT AFTER name`);
      console.log('✓ Description column added successfully');
    } else {
      console.log('✓ Description column already exists');
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
