const { parse } = require('csv-parse/sync');
const xlsx = require('xlsx');

function parseFile(buffer, originalname) {
  const name = originalname || '';
  const ext = name.split('.').pop().toLowerCase();
  if (ext === 'csv') {
    const str = buffer.toString('utf8');
    const records = parse(str, { 
      columns: true, 
      skip_empty_lines: true, 
      trim: true,
      relax_quotes: true,        // Allow quotes to appear in unquoted fields
      relax_column_count: true,  // Allow inconsistent column counts
      skip_records_with_error: true  // Skip rows with parsing errors instead of failing
    });
    return records;
  }
  if (ext === 'xls' || ext === 'xlsx') {
    const wb = xlsx.read(buffer, { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const records = xlsx.utils.sheet_to_json(sheet, { defval: null });
    return records;
  }
  // Fallback: try CSV parse
  try {
    const str = buffer.toString('utf8');
    return parse(str, { 
      columns: true, 
      skip_empty_lines: true, 
      trim: true,
      relax_quotes: true,
      relax_column_count: true,
      skip_records_with_error: true
    });
  } catch (err) {
    throw new Error('Unsupported file type or parse error');
  }
}

module.exports = { parseFile };
