const { parse } = require('csv-parse/sync');
const fs = require('fs');

const csvPath = '../sample-data/customers_sample.csv';
const csvContent = fs.readFileSync(csvPath, 'utf8');

console.log('CSV Content:');
console.log(csvContent);
console.log('\n=================\n');

const records = parse(csvContent, { 
  columns: true, 
  skip_empty_lines: true, 
  trim: true,
  relax_quotes: true,
  relax_column_count: true,
  skip_records_with_error: true
});

console.log('Parsed Records:', records.length);
console.log('\nFirst record:');
console.log(JSON.stringify(records[0], null, 2));
console.log('\nAll column names in first record:');
console.log(Object.keys(records[0]));
