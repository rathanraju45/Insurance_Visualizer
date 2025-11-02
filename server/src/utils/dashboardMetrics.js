const db = require('../../DB/db');

// basic metric helpers used by Dashboard Engine

async function totalCustomers() {
  const r = await db.query('SELECT COUNT(*) AS total FROM Customers');
  return { key: 'total_customers', label: 'Total Customers', value: r[0] ? Number(r[0].total) : 0 };
}

async function activePolicies() {
  // consider status='active' if column exists
  try {
    const r = await db.query("SELECT COUNT(*) AS total FROM Policies WHERE status = 'active'");
    return { key: 'active_policies', label: 'Active Policies', value: r[0] ? Number(r[0].total) : 0 };
  } catch (e) {
    // fallback: count all policies
    const r = await db.query('SELECT COUNT(*) AS total FROM Policies');
    return { key: 'active_policies', label: 'Active Policies (total)', value: r[0] ? Number(r[0].total) : 0 };
  }
}

async function totalPremiums() {
  try {
    const r = await db.query('SELECT IFNULL(SUM(premium_amount),0) AS total FROM Policies');
    return { key: 'total_premiums', label: 'Total Premiums', value: r[0] ? Number(r[0].total) : 0 };
  } catch (e) { return { key: 'total_premiums', label: 'Total Premiums', value: 0 } }
}

async function totalClaims() {
  const r = await db.query('SELECT COUNT(*) AS total FROM Claims');
  return { key: 'total_claims', label: 'Total Claims', value: r[0] ? Number(r[0].total) : 0 };
}

async function policiesByType() {
  const rows = await db.query('SELECT policy_type, COUNT(*) AS cnt FROM Policies GROUP BY policy_type');
  return { key: 'policies_by_type', label: 'Policies by Type', data: rows.map(r => ({ type: r.policy_type || 'Unknown', count: Number(r.cnt) })) };
}

module.exports = { totalCustomers, activePolicies, totalPremiums, totalClaims, policiesByType };
