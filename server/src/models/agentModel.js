const db = require('../../DB/db');
const TABLE = 'Agents';

async function findAll(opts = {}) {
  const page = Math.max(1, Number(opts.page) || 1);
  const limit = Math.max(1, Number(opts.limit) || 25);
  const offset = (page - 1) * limit;
  const totalRows = await db.query(`SELECT COUNT(*) AS total FROM ${TABLE}`);
  const total = totalRows[0] ? Number(totalRows[0].total) : 0;
  const rows = await db.query(`SELECT * FROM ${TABLE} ORDER BY agent_id DESC LIMIT ? OFFSET ?`, [limit, offset]);
  return { data: rows, page, limit, total };
}
async function findById(id) { const rows = await db.query(`SELECT * FROM ${TABLE} WHERE agent_id = ?`, [id]); return rows[0] || null; }
async function create(data) {
  const { full_name, email, phone_number } = data;
  const r = await db.query(`INSERT INTO ${TABLE} (full_name,email,phone_number) VALUES (?,?,?)`, [full_name, email, phone_number]);
  return r.insertId;
}
async function update(id, data) {
  const fields = []; const values = [];
  for (const k of ['full_name','email','phone_number']) if (k in data) { fields.push(`${k} = ?`); values.push(data[k]); }
  if (!fields.length) return null; values.push(id);
  await db.query(`UPDATE ${TABLE} SET ${fields.join(', ')} WHERE agent_id = ?`, values);
  return id;
}
async function remove(id) { await db.query(`DELETE FROM ${TABLE} WHERE agent_id = ?`, [id]); return id; }

module.exports = { findAll, findById, create, update, remove };
