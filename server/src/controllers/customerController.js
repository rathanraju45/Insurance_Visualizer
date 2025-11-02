const model = require('../models/customerModel');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10_000_000 } });
const importer = require('../utils/importer');
const { validateRow } = require('../utils/rowValidator');

async function list(req, res) {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 25;
    const result = await model.findAll({ page, limit });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function get(req, res) {
  try { const r = await model.findById(req.params.id); if (!r) return res.status(404).json({ error: 'Not found' }); res.json(r); } catch (err) { res.status(500).json({ error: err.message }); }
}

async function create(req, res) {
  try { const id = await model.create(req.body); const created = await model.findById(id); res.status(201).json(created); } catch (err) { res.status(500).json({ error: err.message }); }
}

async function update(req, res) {
  try { const id = await model.update(req.params.id, req.body); if (!id) return res.status(400).json({ error: 'No fields to update' }); const updated = await model.findById(id); res.json(updated); } catch (err) { res.status(500).json({ error: err.message }); }
}

async function remove(req, res) {
  try { await model.remove(req.params.id); res.json({ deleted: true }); } catch (err) { res.status(500).json({ error: err.message }); }
}

async function importFile(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const rows = importer.parseFile(req.file.buffer, req.file.originalname || req.file.filename);

    const existingAll = await model.findAll({ page: 1, limit: 1000000 });
    const existing = existingAll.data || [];
    const byId = new Map(existing.map(r => [String(r.customer_id), r]));
    const byEmail = new Map(existing.filter(r => r.email).map(r => [r.email.toLowerCase(), r]));

    const report = [];
    let inserted = 0, updated = 0, skipped = 0;
    for (const [idx, row] of rows.entries()) {
      const id = row.customer_id || row.id || null;
      const validation = validateRow('customer', row);
      if (!validation.valid) { report.push({ row: idx+1, status: 'invalid', errors: validation.errors }); continue; }
      const payload = validation.data;
      const email = payload.email ? String(payload.email).toLowerCase() : null;
      let found = null;
      if (id && byId.has(String(id))) found = byId.get(String(id));
      else if (email && byEmail.has(email)) found = byEmail.get(email);

      if (!found) {
        const newId = await model.create(payload);
        inserted++; report.push({ row: idx+1, status: 'inserted', id: newId });
      } else {
        const same = (String(found.full_name || '') === String(payload.full_name || ''))
          && (String(found.date_of_birth || '') === String(payload.date_of_birth || ''))
          && (String(found.email || '') === String(payload.email || ''))
          && (String(found.phone_number || '') === String(payload.phone_number || ''))
          && (String(found.address || '') === String(payload.address || ''));
        if (same) { skipped++; report.push({ row: idx+1, status: 'skipped' }); }
        else { await model.update(found.customer_id, payload); updated++; report.push({ row: idx+1, status: 'updated', id: found.customer_id }); }
      }
    }
    res.json({ inserted, updated, skipped, total: rows.length, report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { list, get, create, update, remove, importFile, upload };
