const db = require('../../DB/db');

const TABLE = 'Users';

async function findAll(opts = {}) {
  const page = Math.max(1, Number(opts.page) || 1);
  const limit = Math.max(1, Number(opts.limit) || 25);
  const offset = (page - 1) * limit;

  const totalRows = await db.query(`SELECT COUNT(*) AS total FROM ${TABLE}`);
  const total = totalRows[0] ? Number(totalRows[0].total) : 0;
  
  // Don't return password hashes
  const rows = await db.query(
    `SELECT user_id, username, email, full_name, role, is_active, created_at, last_login 
     FROM ${TABLE} ORDER BY user_id DESC LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  
  return { data: rows, page, limit, total };
}

async function findById(id) {
  const rows = await db.query(
    `SELECT user_id, username, email, full_name, role, is_active, created_at, last_login 
     FROM ${TABLE} WHERE user_id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function findByUsername(username) {
  const rows = await db.query(
    `SELECT * FROM ${TABLE} WHERE username = ?`,
    [username]
  );
  return rows[0] || null;
}

async function findByEmail(email) {
  const rows = await db.query(
    `SELECT * FROM ${TABLE} WHERE email = ?`,
    [email]
  );
  return rows[0] || null;
}

async function create(data) {
  const { username, email, password_hash, full_name, role = 'viewer' } = data;
  const res = await db.query(
    `INSERT INTO ${TABLE} (username, email, password_hash, full_name, role) 
     VALUES (?, ?, ?, ?, ?)`,
    [username, email, password_hash, full_name, role]
  );
  return res.insertId;
}

async function update(id, data) {
  const fields = [];
  const values = [];
  
  for (const k of ['username', 'email', 'password_hash', 'full_name', 'role', 'is_active']) {
    if (k in data) {
      fields.push(`${k} = ?`);
      values.push(data[k]);
    }
  }
  
  if (!fields.length) return null;
  
  values.push(id);
  await db.query(`UPDATE ${TABLE} SET ${fields.join(', ')} WHERE user_id = ?`, values);
  return id;
}

async function updateLastLogin(id) {
  await db.query(
    `UPDATE ${TABLE} SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?`,
    [id]
  );
}

async function remove(id) {
  await db.query(`DELETE FROM ${TABLE} WHERE user_id = ?`, [id]);
  return id;
}

module.exports = {
  findAll,
  findById,
  findByUsername,
  findByEmail,
  create,
  update,
  updateLastLogin,
  remove
};
