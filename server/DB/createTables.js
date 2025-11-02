/**
 * createTables.js
 * Creates the database tables (Customers, Policies, Claims, Agents)
 * according to the structure provided in the project files.
 *
 * Usage:
 *   node DB/createTables.js
 *
 * This script uses the existing `DB/db.js` pool and .env configuration.
 */
const db = require('./db');

async function createTables() {
  // Ensure DB initialized (validates env and tests connection)
  await db.initDB();

  // Use SQL that strictly follows the fields listed in your TASK/DB.md
  const stmts = [
    `CREATE TABLE IF NOT EXISTS Customers (
      customer_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      full_name VARCHAR(255) NOT NULL,
      date_of_birth DATE DEFAULT NULL,
      email VARCHAR(255) DEFAULT NULL,
      phone_number VARCHAR(50) DEFAULT NULL,
      address TEXT DEFAULT NULL,
      PRIMARY KEY (customer_id),
      INDEX idx_customers_email (email)
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS Agents (
      agent_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) DEFAULT NULL,
      phone_number VARCHAR(50) DEFAULT NULL,
      PRIMARY KEY (agent_id),
      INDEX idx_agents_email (email)
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS Policies (
      policy_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      policy_type VARCHAR(100) DEFAULT NULL,
      premium_amount DECIMAL(13,2) DEFAULT 0.00,
      coverage_amount DECIMAL(15,2) DEFAULT NULL,
      start_date DATE DEFAULT NULL,
      end_date DATE DEFAULT NULL,
      customer_name VARCHAR(255) DEFAULT NULL,
      customer_id BIGINT UNSIGNED DEFAULT NULL,
      PRIMARY KEY (policy_id),
      INDEX idx_policies_customer_id (customer_id),
      CONSTRAINT fk_policies_customer FOREIGN KEY (customer_id) REFERENCES Customers(customer_id) ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS Claims (
      claim_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      policy_id BIGINT UNSIGNED NOT NULL,
      claim_date DATE DEFAULT NULL,
      claim_amount DECIMAL(15,2) DEFAULT 0.00,
      PRIMARY KEY (claim_id),
      INDEX idx_claims_policy_id (policy_id),
      CONSTRAINT fk_claims_policy FOREIGN KEY (policy_id) REFERENCES Policies(policy_id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB;`
,
    `CREATE TABLE IF NOT EXISTS Dashboards (
      dashboard_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      config JSON DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (dashboard_id)
    ) ENGINE=InnoDB;`
  ];

  try {
    for (const s of stmts) {
      console.log('Executing statement...');
      await db.query(s);
    }
    console.log('All tables created (or verified existing).');
  } catch (err) {
    console.error('Error creating tables:', err.message || err);
    throw err;
  } finally {
    await db.closePool();
  }
}

if (require.main === module) {
  createTables()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { createTables };
