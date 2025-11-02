const db = require('../../DB/db');

const TABLE = 'Customers';

async function findAll(opts = {}) {
  const page = Math.max(1, Number(opts.page) || 1);
  const limit = Math.max(1, Number(opts.limit) || 25);
  const offset = (page - 1) * limit;

  const totalRows = await db.query(`SELECT COUNT(*) AS total FROM ${TABLE}`);
  const total = totalRows[0] ? Number(totalRows[0].total) : 0;
  const rows = await db.query(`SELECT * FROM ${TABLE} ORDER BY customer_id DESC LIMIT ? OFFSET ?`, [limit, offset]);
  return { data: rows, page, limit, total };
}

async function findById(id) {
  const rows = await db.query(`SELECT * FROM ${TABLE} WHERE customer_id = ?`, [id]);
  return rows[0] || null;
}

async function create(data) {
  const { full_name, date_of_birth, email, phone_number, address } = data;
  const res = await db.query(
    `INSERT INTO ${TABLE} (full_name,date_of_birth,email,phone_number,address) VALUES (?,?,?,?,?)`,
    [full_name, date_of_birth, email, phone_number, address]
  );
  return res.insertId;
}

async function update(id, data) {
  const fields = [];
  const values = [];
  for (const k of ['full_name','date_of_birth','email','phone_number','address']) {
    if (k in data) { fields.push(`${k} = ?`); values.push(data[k]); }
  }
  if (!fields.length) return null;
  values.push(id);
  await db.query(`UPDATE ${TABLE} SET ${fields.join(', ')} WHERE customer_id = ?`, values);
  return id;
}

async function remove(id) {
  await db.query(`DELETE FROM ${TABLE} WHERE customer_id = ?`, [id]);
  return id;
}

module.exports = { findAll, findById, create, update, remove };
