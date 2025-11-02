require('dotenv').config();
const db = require('./DB/db');

async function clearAllData() {
  console.log('🗑️  Clearing all data from database...\n');
  
  try {
    // List of tables to clear (including Dashboards)
    const tables = ['Claims', 'Policies', 'Customers', 'Agents', 'Dashboards'];
    
    // Disable foreign key checks temporarily
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('✓ Disabled foreign key checks\n');
    
    for (const table of tables) {
      const countResult = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
      const count = countResult[0].count;
      
      await db.query(`TRUNCATE TABLE ${table}`);
      console.log(`✓ Cleared ${table}: ${count} records deleted`);
    }
    
    // Re-enable foreign key checks
    await db.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('\n✓ Re-enabled foreign key checks');
    
    console.log('\n✅ Successfully cleared all data!');
    console.log('📊 Tables structure preserved');
    console.log('🎯 All data including dashboards cleared\n');
    
  } catch (error) {
    console.error('❌ Error clearing data:', error.message);
    throw error;
  } finally {
    process.exit(0);
  }
}

clearAllData();
