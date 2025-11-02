const db = require('../../DB/db');
const TABLE = 'Dashboards';

async function findAll(opts = {}) {
  const page = Math.max(1, Number(opts.page) || 1);
  const limit = Math.max(1, Number(opts.limit) || 25);
  const offset = (page - 1) * limit;
  const totalRows = await db.query(`SELECT COUNT(*) AS total FROM ${TABLE}`);
  const total = totalRows[0] ? Number(totalRows[0].total) : 0;
  const rows = await db.query(`SELECT * FROM ${TABLE} ORDER BY dashboard_id DESC LIMIT ? OFFSET ?`, [limit, offset]);
  // parse config JSON - check if it's already an object (MySQL JSON type auto-parses)
  const parsed = rows.map(r => ({ 
    ...r, 
    config: r.config ? (typeof r.config === 'string' ? JSON.parse(r.config) : r.config) : null 
  }));
  return { data: parsed, page, limit, total };
}

async function findById(id) {
  const rows = await db.query(`SELECT * FROM ${TABLE} WHERE dashboard_id = ?`, [id]);
  if (!rows[0]) return null;
  const row = rows[0];
  // Check if config is already an object (MySQL JSON type auto-parses) or needs parsing
  const config = row.config ? (typeof row.config === 'string' ? JSON.parse(row.config) : row.config) : null;
  return { ...row, config };
}

async function create(data) {
  const { name, description, config } = data;
  console.log('Model create - name:', name);
  console.log('Model create - description:', description);
  console.log('Model create - config type:', typeof config);
  console.log('Model create - config:', config);
  
  // Ensure config is properly stringified
  let cfg = null;
  try {
    if (config) {
      cfg = typeof config === 'string' ? config : JSON.stringify(config);
      console.log('Model create - stringified config:', cfg);
    }
  } catch (err) {
    console.error('Error stringifying config:', err);
    throw new Error(`Invalid config format: ${err.message}`);
  }
  
  const r = await db.query(`INSERT INTO ${TABLE} (name, description, config) VALUES (?, ?, ?)`, [name, description || null, cfg]);
  return r.insertId;
}

async function update(id, data) {
  const fields = [];
  const values = [];
  if ('name' in data) { fields.push('name = ?'); values.push(data.name); }
  if ('description' in data) { fields.push('description = ?'); values.push(data.description || null); }
  if ('config' in data) { 
    // Ensure config is properly stringified
    const cfg = data.config ? (typeof data.config === 'string' ? data.config : JSON.stringify(data.config)) : null;
    fields.push('config = ?'); 
    values.push(cfg); 
  }
  if (!fields.length) return null;
  values.push(id);
  await db.query(`UPDATE ${TABLE} SET ${fields.join(', ')} WHERE dashboard_id = ?`, values);
  return id;
}

async function remove(id) {
  await db.query(`DELETE FROM ${TABLE} WHERE dashboard_id = ?`, [id]);
  return id;
}

module.exports = { findAll, findById, create, update, remove };
