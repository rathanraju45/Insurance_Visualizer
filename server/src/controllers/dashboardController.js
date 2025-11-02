const model = require('../models/dashboardModel');
const metrics = require('../utils/dashboardMetrics');

async function list(req, res) {
  try { const page = req.query.page || 1; const limit = req.query.limit || 25; const r = await model.findAll({ page, limit }); res.json(r); } catch (e) { res.status(500).json({ error: e.message }); }
}

async function get(req, res) {
  try { const r = await model.findById(req.params.id); if (!r) return res.status(404).json({ error: 'Not found' }); res.json(r); } catch (e) { res.status(500).json({ error: e.message }); }
}

async function create(req, res) {
  try { 
    console.log('Dashboard create request body:', JSON.stringify(req.body, null, 2));
    const id = await model.create(req.body); 
    const created = await model.findById(id); 
    res.status(201).json(created); 
  } catch (e) { 
    console.error('Dashboard create error:', e);
    res.status(500).json({ error: e.message }); 
  }
}

async function update(req, res) {
  try { 
    console.log('Dashboard update request body:', JSON.stringify(req.body, null, 2));
    const id = await model.update(req.params.id, req.body); 
    if (!id) return res.status(400).json({ error: 'No fields to update' }); 
    const u = await model.findById(id); 
    res.json(u); 
  } catch (e) { 
    console.error('Dashboard update error:', e);
    res.status(500).json({ error: e.message }); 
  }
}

async function remove(req, res) {
  try { await model.remove(req.params.id); res.json({ deleted: true }); } catch (e) { res.status(500).json({ error: e.message }); }
}

// run dashboard: execute widgets and return results
async function run(req, res) {
  try {
    const id = req.params.id;
    const dash = await model.findById(id);
    if (!dash) return res.status(404).json({ error: 'Not found' });
    
    // Parse config if it's a string
    const cfg = typeof dash.config === 'string' ? JSON.parse(dash.config) : (dash.config || { widgets: [] });
    const filters = req.body.filters || cfg.filters || [];
    
    const results = [];
    
    for (const w of cfg.widgets || []) {
      try {
        const result = await executeWidget(w, filters);
        results.push(result);
      } catch (err) {
        console.error(`Widget execution error:`, err);
        results.push({
          title: w.title || 'Unknown',
          type: w.type,
          error: err.message
        });
      }
    }
    
    res.json({ dashboard: dash, widgets: results });
  } catch (e) { 
    console.error('Dashboard run error:', e);
    res.status(500).json({ error: e.message }); 
  }
}

// Execute individual widget based on configuration
async function executeWidget(widget, filters = []) {
  const db = require('../../DB/db');
  
  // Extract config - handle both flat and nested structures
  const config = widget.config || widget;
  const { type, title } = widget;
  const { table, aggregation, column, groupBy, limit, columns } = config;
  
  if (!table) {
    return { title, type, error: 'No table specified' };
  }
  
  // Build WHERE clause from filters
  let whereClauses = [];
  filters.forEach(f => {
    if (f.table === table && f.column && f.value !== undefined && f.value !== '') {
      if (f.operator === 'equals') whereClauses.push({ sql: `\`${f.column}\` = ?`, param: f.value });
      else if (f.operator === 'not_equals') whereClauses.push({ sql: `\`${f.column}\` != ?`, param: f.value });
      else if (f.operator === 'greater') whereClauses.push({ sql: `\`${f.column}\` > ?`, param: f.value });
      else if (f.operator === 'less') whereClauses.push({ sql: `\`${f.column}\` < ?`, param: f.value });
      else if (f.operator === 'contains') whereClauses.push({ sql: `\`${f.column}\` LIKE ?`, param: `%${f.value}%` });
    }
  });
  
  const whereClause = whereClauses.length > 0 
    ? ` WHERE ${whereClauses.map(w => w.sql).join(' AND ')}` 
    : '';
  const whereParams = whereClauses.map(w => w.param);
  
  // Build SQL query based on widget configuration
  let sql = '';
  let params = [];
  
  // Handle table widget type first (no aggregation needed)
  if (type === 'table' && columns && columns.length > 0) {
    const columnList = columns.map(c => `\`${c}\``).join(', ');
    sql = `SELECT ${columnList} FROM \`${table}\`${whereClause}`;
    if (limit) sql += ` LIMIT ${parseInt(limit)}`;
    params = whereParams;
    
    const rows = await db.query(sql, params);
    
    return {
      type: 'table',
      title,
      data: rows,
      columns
    };
  }
  
  // Build aggregation part for KPI and chart widgets
  let aggPart = '';
  if (aggregation === 'count') {
    aggPart = 'COUNT(*) as value';
  } else if (aggregation && column) {
    // Handle special columns like DISTINCT
    if (column.toUpperCase().startsWith('DISTINCT ')) {
      aggPart = `${aggregation.toUpperCase()}(${column}) as value`;
    } else {
      aggPart = `${aggregation.toUpperCase()}(\`${column}\`) as value`;
    }
  } else if (aggregation) {
    return { title, type, error: 'Column required for this aggregation' };
  }
  
  // Handle different widget types
  if (type === 'kpi') {
    // KPI: single value
    sql = `SELECT ${aggPart} FROM \`${table}\`${whereClause}`;
    params = whereParams;
    
    const rows = await db.query(sql, params);
    const value = rows[0] ? (rows[0].value || 0) : 0;
    
    return {
      type: 'kpi',
      title,
      value: Number(value)
    };
    
  } else if (groupBy) {
    // Chart/Table with grouping
    // The groupBy is already properly formatted (e.g., DATE_FORMAT(start_date, "%Y-%m") or just column name)
    // We need to use it as-is without adding backticks
    const groupByClause = groupBy;
    
    // For ORDER BY, use the label alias for date functions, otherwise order by value
    const orderByClause = groupBy.includes('(') ? 'label' : 'value DESC';
    
    sql = `SELECT ${groupByClause} as label, ${aggPart} FROM \`${table}\`${whereClause} GROUP BY ${groupByClause} ORDER BY ${orderByClause}`;
    if (limit) sql += ` LIMIT ${parseInt(limit)}`;
    params = whereParams;
    
    console.log('Executing SQL:', sql);
    const rows = await db.query(sql, params);
    const data = rows.map(r => ({
      label: r.label !== null ? String(r.label) : '(null)',
      value: Number(r.value || 0)
    }));
    
    return {
      type,
      title,
      data
    };
    
  } else {
    // Single value without grouping
    sql = `SELECT ${aggPart} FROM \`${table}\`${whereClause}`;
    params = whereParams;
    
    const rows = await db.query(sql, params);
    const value = rows[0] ? (rows[0].value || 0) : 0;
    
    return {
      type,
      title,
      value: Number(value),
      data: []
    };
  }
}

module.exports = { list, get, create, update, remove, run };
