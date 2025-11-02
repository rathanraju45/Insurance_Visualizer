const db = require('../../DB/db');
const multer = require('multer');
const { parseFile } = require('../utils/importer');

// multer middleware for file uploads
const upload = multer({ storage: multer.memoryStorage() });

function sanitizeName(name){
  if (!name || typeof name !== 'string') throw new Error('Invalid name');
  if (!/^[A-Za-z0-9_]+$/.test(name)) throw new Error('Name contains invalid characters');
  return name;
}

async function listTables(req, res){
  try{
    const rows = await db.query("SELECT TABLE_NAME as table_name FROM information_schema.tables WHERE table_schema = DATABASE()");
    res.json({ data: rows.map(r=>r.table_name) });
  }catch(e){ console.error('listTables error', e); res.status(500).json({ error: e.message }); }
}

async function getSchema(req, res){
  try{
    const table = sanitizeName(req.params.table);
    const cols = await db.query("SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? ORDER BY ORDINAL_POSITION", [table]);
    // detect primary key
    const pkRow = await db.query("SELECT COLUMN_NAME FROM information_schema.key_column_usage WHERE table_schema = DATABASE() AND table_name = ? AND constraint_name = 'PRIMARY'", [table]);
    const pk = pkRow[0] ? pkRow[0].COLUMN_NAME : null;
    res.json({ table, columns: cols, primaryKey: pk });
  }catch(e){ console.error('getSchema error', e); res.status(500).json({ error: e.message }); }
}

async function createTable(req, res){
  try{
    const { name, columns } = req.body;
    const table = sanitizeName(name);
    if (!Array.isArray(columns) || !columns.length) return res.status(400).json({ error: 'columns required' });
    // columns: [{name,type,nullable,pk,autoIncrement}]
    const parts = columns.map(c=>{
      const colName = sanitizeName(c.name);
      const type = String(c.type || 'VARCHAR(255)');
      const nullable = c.nullable ? '' : 'NOT NULL';
      const ai = c.autoIncrement ? 'AUTO_INCREMENT' : '';
      return `\`${colName}\` ${type} ${nullable} ${ai}`.trim();
    });
    const pkCols = columns.filter(c=>c.pk).map(c=>`\`${sanitizeName(c.name)}\``);
    if (pkCols.length) parts.push(`PRIMARY KEY (${pkCols.join(',')})`);
    const sql = `CREATE TABLE IF NOT EXISTS \`${table}\` (${parts.join(',')}) ENGINE=InnoDB;`;
    await db.query(sql);
    res.json({ ok:true, table });
  }catch(e){ console.error('createTable error', e); res.status(500).json({ error: e.message }); }
}

async function dropTable(req, res){
  try{
    const table = sanitizeName(req.params.table);
    await db.query(`DROP TABLE IF EXISTS \`${table}\``);
    res.json({ ok:true });
  }catch(e){ console.error('dropTable error', e); res.status(500).json({ error: e.message }); }
}

async function listRows(req,res){
  try{
    const table = sanitizeName(req.params.table);
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 25);
    const offset = (page-1)*limit;
    const totalRows = await db.query(`SELECT COUNT(*) AS total FROM \`${table}\``);
    const total = totalRows[0] ? Number(totalRows[0].total) : 0;
    const rows = await db.query(`SELECT * FROM \`${table}\` LIMIT ? OFFSET ?`, [limit, offset]);
    res.json({ data: rows, page, limit, total });
  }catch(e){ console.error('listRows error', e); res.status(500).json({ error: e.message }); }
}

async function insertRow(req,res){
  try{
    const table = sanitizeName(req.params.table);
    const data = req.body || {};
    const cols = Object.keys(data);
    if (!cols.length) return res.status(400).json({ error: 'no data' });
    // sanitize column names
    let safeCols;
    try{
      safeCols = cols.map(c => sanitizeName(c));
    }catch(err){ console.error('insertRow bad column name', err); return res.status(400).json({ error: 'Invalid column name in payload' }); }
    // convert values according to column types (dates, datetimes, booleans)
    let values = safeCols.map(c=>data[c]);
    try{
      if (safeCols.length) {
        const ph = safeCols.map(_=>'?').join(',');
        const colInfoSql = `SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND COLUMN_NAME IN (${ph})`;
        const colInfo = await db.query(colInfoSql, [table, ...safeCols]);
        const infoMap = {};
        colInfo.forEach(r=>{ infoMap[r.COLUMN_NAME] = { dataType: r.DATA_TYPE, columnType: r.COLUMN_TYPE }; });
        values = safeCols.map(colName => {
          const v = data[colName];
          const info = infoMap[colName];
          if (v == null || info == null) return v;
          const dt = info.dataType && info.dataType.toLowerCase();
          // DATE -> YYYY-MM-DD
          if (dt === 'date') {
            const d = new Date(v);
            if (isNaN(d)) throw new Error(`Invalid date value for column '${colName}': ${v}`);
            return d.toISOString().slice(0,10);
          }
          // DATETIME/TIMESTAMP -> YYYY-MM-DD HH:MM:SS
          if (dt === 'datetime' || dt === 'timestamp') {
            const d = new Date(v);
            if (isNaN(d)) throw new Error(`Invalid datetime value for column '${colName}': ${v}`);
            return d.toISOString().replace('T',' ').split('.')[0];
          }
          // boolean-like tinyint(1)
          if (dt === 'tinyint' && /\(1\)/.test((info.columnType || '').toLowerCase())) {
            if (typeof v === 'boolean') return v ? 1 : 0;
            if (v === 'true' || v === '1' || v === 1) return 1;
            if (v === 'false' || v === '0' || v === 0) return 0;
            // fallthrough to attempt cast
          }
          return v;
        });
      }
    }catch(err){ console.error('insertRow conversion error', err); return res.status(400).json({ error: err.message }); }

    const placeholders = safeCols.map(_=>'?').join(',');
    const sql = `INSERT INTO \`${table}\` (${safeCols.map(c=>`\`${c}\``).join(',')}) VALUES (${placeholders})`;
    const r = await db.query(sql, values);
    const created = await db.query(`SELECT * FROM \`${table}\` WHERE ${r.insertId ? `id = ?` : `1=1 LIMIT 1`}`, r.insertId ? [r.insertId] : []);
    res.status(201).json({ insertId: r.insertId, created: created[0] || null });
  }catch(e){ console.error('insertRow error', e); res.status(500).json({ error: e.message }); }
}

async function updateRow(req,res){
  try{
    const table = sanitizeName(req.params.table);
    let pk;
    try{ pk = sanitizeName(req.params.pk); }catch(err){ console.error('updateRow bad pk', err); return res.status(400).json({ error: 'Invalid pk column name' }); }
    const id = req.params.id;
    if (!pk || !id) return res.status(400).json({ error: 'pk and id required' });
    const data = req.body || {};
    const cols = Object.keys(data);
    if (!cols.length) return res.status(400).json({ error: 'no data' });
    // sanitize columns
    let safeCols;
    try{ safeCols = cols.map(c => sanitizeName(c)); }catch(err){ console.error('updateRow bad column name', err); return res.status(400).json({ error: 'Invalid column name in payload' }); }
    // do not allow updating the primary key column in SET; remove it if present
    safeCols = safeCols.filter(c => c !== pk);
    if (!safeCols.length) return res.status(400).json({ error: 'No updatable columns (payload only contained primary key)' });

    // convert values according to column types (dates, datetimes, booleans)
    let values = safeCols.map(c=>data[c]);
    try{
      const ph = safeCols.map(_=>'?').join(',');
      const colInfoSql = `SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND COLUMN_NAME IN (${ph})`;
      const colInfo = await db.query(colInfoSql, [table, ...safeCols]);
      const infoMap = {};
      colInfo.forEach(r=>{ infoMap[r.COLUMN_NAME] = { dataType: r.DATA_TYPE, columnType: r.COLUMN_TYPE }; });
      values = safeCols.map(colName => {
        const v = data[colName];
        const info = infoMap[colName];
        if (v == null || info == null) return v;
        const dt = info.dataType && info.dataType.toLowerCase();
        if (dt === 'date') {
          const d = new Date(v);
          if (isNaN(d)) throw new Error(`Invalid date value for column '${colName}': ${v}`);
          return d.toISOString().slice(0,10);
        }
        if (dt === 'datetime' || dt === 'timestamp') {
          const d = new Date(v);
          if (isNaN(d)) throw new Error(`Invalid datetime value for column '${colName}': ${v}`);
          return d.toISOString().replace('T',' ').split('.')[0];
        }
        if (dt === 'tinyint' && /\(1\)/.test((info.columnType || '').toLowerCase())) {
          if (typeof v === 'boolean') return v ? 1 : 0;
          if (v === 'true' || v === '1' || v === 1) return 1;
          if (v === 'false' || v === '0' || v === 0) return 0;
        }
        return v;
      });
    }catch(err){ console.error('updateRow conversion error', err); return res.status(400).json({ error: err.message }); }

    const sets = safeCols.map(c=>`\`${c}\` = ?`).join(',');
    const sql = `UPDATE \`${table}\` SET ${sets} WHERE \`${pk}\` = ?`;
    await db.query(sql, [...values, id]);
    const updated = await db.query(`SELECT * FROM \`${table}\` WHERE \`${pk}\` = ? LIMIT 1`, [id]);
    res.json(updated[0] || null);
  }catch(e){ console.error('updateRow error', e); res.status(500).json({ error: e.message }); }
}

async function deleteRow(req,res){
  try{
    const table = sanitizeName(req.params.table);
    const pk = req.params.pk; const id = req.params.id;
    if (!pk || !id) return res.status(400).json({ error: 'pk and id required' });
    let safePk;
    try{ safePk = sanitizeName(pk); }catch(err){ console.error('deleteRow bad pk', err); return res.status(400).json({ error: 'Invalid pk column name' }); }
    await db.query(`DELETE FROM \`${table}\` WHERE \`${safePk}\` = ?`, [id]);
    res.json({ deleted: true });
  }catch(e){ console.error('deleteRow error', e); res.status(500).json({ error: e.message }); }
}

async function previewImport(req, res){
  try{
    const table = sanitizeName(req.params.table);
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    // Parse the file
    const parsed = parseFile(req.file.buffer, req.file.originalname);
    if (!parsed || !Array.isArray(parsed)) return res.status(400).json({ error: 'Failed to parse file' });
    
    // Get table schema
    const cols = await db.query("SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? ORDER BY ORDINAL_POSITION", [table]);
    if (!cols || cols.length === 0) return res.status(400).json({ error: 'Table not found' });
    
    const tableColumns = cols.map(c => c.COLUMN_NAME);
    const csvColumns = parsed.length > 0 ? Object.keys(parsed[0]) : [];
    
    // Find matching and non-matching columns
    const matchingColumns = csvColumns.filter(c => tableColumns.includes(c));
    const extraColumns = csvColumns.filter(c => !tableColumns.includes(c));
    const missingColumns = tableColumns.filter(c => !csvColumns.includes(c) && !cols.find(col => col.COLUMN_NAME === c && col.EXTRA.includes('auto_increment')));
    
    res.json({
      filename: req.file.originalname,
      fileSize: req.file.size,
      totalRows: parsed.length,
      preview: parsed.slice(0, 10), // First 10 rows
      tableColumns,
      csvColumns,
      matchingColumns,
      extraColumns,
      missingColumns
    });
  }catch(e){
    console.error('previewImport error', e);
    res.status(500).json({ error: e.message });
  }
}

async function importFile(req, res){
  try{
    const table = sanitizeName(req.params.table);
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    // Get table schema to know the columns
    const cols = await db.query("SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? ORDER BY ORDINAL_POSITION", [table]);
    if (!cols || cols.length === 0) return res.status(400).json({ error: 'Table not found or has no columns' });
    
    // Parse the file
    const parsed = parseFile(req.file.buffer, req.file.originalname);
    if (!parsed || !Array.isArray(parsed)) return res.status(400).json({ error: 'Failed to parse file' });
    
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    const report = [];
    
    console.log(`📊 Importing ${parsed.length} rows into table: ${table}`);
    
    // Get primary key
    const pkRow = await db.query("SELECT COLUMN_NAME FROM information_schema.key_column_usage WHERE table_schema = DATABASE() AND table_name = ? AND constraint_name = 'PRIMARY'", [table]);
    const pkColumn = pkRow[0] ? pkRow[0].COLUMN_NAME : null;
    console.log(`🔑 Primary key column: ${pkColumn || 'None'}`);
    
    // Identify auto-increment columns
    const autoIncrementCols = cols.filter(c => c.EXTRA && c.EXTRA.includes('auto_increment')).map(c => c.COLUMN_NAME);
    console.log(`🔢 Auto-increment columns: ${autoIncrementCols.join(', ') || 'None'}`);
    
    for (let i = 0; i < parsed.length; i++) {
      const row = parsed[i];
      try {
        console.log(`\n🔍 Processing row ${i + 1}:`, row);
        
        // Filter row to only include columns that exist in the table and have non-empty values
        const validData = {};
        for (const col of cols) {
          const colName = col.COLUMN_NAME;
          if (row.hasOwnProperty(colName)) {
            const value = row[colName];
            
            // Skip empty/null values for auto-increment columns
            if (autoIncrementCols.includes(colName) && (value === '' || value === null || value === undefined)) {
              console.log(`  ⏭️  Skipping auto-increment column: ${colName} (empty)`);
              continue; // Don't include empty auto-increment values
            }
            
            // Skip empty/null values - only include if there's actual data
            if (value === '' || value === null || value === undefined) {
              console.log(`  ⏭️  Skipping empty column: ${colName}`);
              continue; // Skip empty values, let DB use defaults or NULL
            }
            
            console.log(`  ✓ Including column: ${colName} = ${value}`);
            validData[colName] = value;
          }
        }
        
        console.log(`� Final validData for row ${i + 1}:`, validData);
        
        if (Object.keys(validData).length === 0) {
          skipped++;
          report.push({ row: i + 1, status: 'skipped', reason: 'No valid columns' });
          continue;
        }
        
        // Check if row exists (if PK is present)
        let exists = false;
        if (pkColumn && validData[pkColumn]) {
          const existingRows = await db.query(`SELECT 1 FROM \`${table}\` WHERE \`${pkColumn}\` = ? LIMIT 1`, [validData[pkColumn]]);
          exists = existingRows.length > 0;
        }
        
        if (exists && pkColumn) {
          // Update existing row
          const setClauses = [];
          const values = [];
          for (const [key, value] of Object.entries(validData)) {
            if (key !== pkColumn) { // Don't update PK
              setClauses.push(`\`${key}\` = ?`);
              values.push(value);
            }
          }
          if (setClauses.length > 0) {
            values.push(validData[pkColumn]);
            await db.query(`UPDATE \`${table}\` SET ${setClauses.join(', ')} WHERE \`${pkColumn}\` = ?`, values);
            updated++;
            report.push({ row: i + 1, status: 'updated', pk: validData[pkColumn], data: validData });
          } else {
            skipped++;
            report.push({ row: i + 1, status: 'skipped', reason: 'No columns to update' });
          }
        } else {
          // Insert new row
          const columns = Object.keys(validData);
          const placeholders = columns.map(() => '?').join(',');
          const values = Object.values(validData);
          await db.query(`INSERT INTO \`${table}\` (${columns.map(c => `\`${c}\``).join(',')}) VALUES (${placeholders})`, values);
          inserted++;
          report.push({ row: i + 1, status: 'inserted', data: validData });
        }
      } catch (err) {
        skipped++;
        report.push({ row: i + 1, status: 'error', reason: err.message });
      }
    }
    
    console.log(`✅ Import complete: ${inserted} inserted, ${updated} updated, ${skipped} skipped`);
    console.log(`📋 Detailed report:`, JSON.stringify(report.slice(0, 5), null, 2)); // Log first 5 rows
    
    res.json({ inserted, updated, skipped, total: parsed.length, report });
  }catch(e){ 
    console.error('❌ importFile error', e); 
    res.status(500).json({ error: e.message }); 
  }
}

module.exports = { upload, listTables, getSchema, createTable, dropTable, listRows, insertRow, updateRow, deleteRow, previewImport, importFile };
