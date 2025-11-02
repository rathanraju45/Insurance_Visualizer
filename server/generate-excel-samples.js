const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Sample data directory
const sampleDir = path.join(__dirname, '../sample-data');

// Customers data
const customersData = [
  ['customer_id', 'full_name', 'email', 'date_of_birth', 'phone_number', 'address'],
  ['', 'Arjun Sharma', 'arjun.sharma@email.com', '1985-06-12', '+91-9876543210', '123 MG Road Koramangala Bangalore'],
  ['', 'Priya Patel', 'priya.patel@email.com', '1990-11-02', '+91-9876543211', '456 Linking Road Bandra Mumbai'],
  ['', 'Vikram Reddy', 'vikram.reddy@email.com', '1988-03-15', '+91-9876543212', '789 Jubilee Hills Hyderabad'],
  ['', 'Sneha Iyer', 'sneha.iyer@email.com', '1992-07-20', '+91-9876543213', '101 Anna Salai T Nagar Chennai'],
  ['', 'Rahul Singh', 'rahul.singh@email.com', '1987-12-05', '+91-9876543214', '202 Park Street Salt Lake Kolkata'],
  ['', 'Anjali Gupta', 'anjali.gupta@email.com', '1995-04-18', '+91-9876543215', '303 Connaught Place Delhi'],
  ['', 'Rohan Desai', 'rohan.desai@email.com', '1991-09-25', '+91-9876543216', '404 FC Road Shivaji Nagar Pune'],
  ['', 'Kavya Nair', 'kavya.nair@email.com', '1989-01-30', '+91-9876543217', '505 Marine Drive Ernakulam Kochi'],
  ['', 'Aditya Verma', 'aditya.verma@email.com', '1993-08-14', '+91-9876543218', '606 Hazratganj Lucknow'],
  ['', 'Meera Joshi', 'meera.joshi@email.com', '1986-05-22', '+91-9876543219', '707 MI Road C Scheme Jaipur']
];

// Agents data
const agentsData = [
  ['agent_id', 'full_name', 'email', 'phone_number'],
  ['', 'Rajesh Kumar', 'rajesh.kumar@insurance.com', '+91-9123456780'],
  ['', 'Pooja Sharma', 'pooja.sharma@insurance.com', '+91-9123456781'],
  ['', 'Sanjay Patel', 'sanjay.patel@insurance.com', '+91-9123456782'],
  ['', 'Divya Singh', 'divya.singh@insurance.com', '+91-9123456783'],
  ['', 'Amit Verma', 'amit.verma@insurance.com', '+91-9123456784']
];

// Policies data
const policiesData = [
  ['policy_id', 'policy_type', 'premium_amount', 'coverage_amount', 'start_date', 'end_date', 'customer_id'],
  ['', 'Term Life Insurance', 15000, 1500000, '2024-01-01', '2044-01-01', 1],
  ['', 'Health Insurance', 25000, 500000, '2024-02-01', '2025-02-01', 2],
  ['', 'Motor Insurance', 12000, 800000, '2024-03-01', '2025-03-01', 3],
  ['', 'Home Insurance', 18000, 2000000, '2024-04-01', '2025-04-01', 4],
  ['', 'Travel Insurance', 5000, 200000, '2024-05-01', '2024-11-01', 5],
  ['', 'Personal Accident', 8000, 1000000, '2024-06-01', '2025-06-01', 6],
  ['', 'Critical Illness', 35000, 2500000, '2024-07-01', '2025-07-01', 7],
  ['', 'Unit Linked Insurance Plan (ULIP)', 50000, 3000000, '2024-08-01', '2034-08-01', 8]
];

// Claims data
const claimsData = [
  ['claim_id', 'policy_id', 'claim_date', 'claim_amount'],
  ['', 1, '2024-06-15', 45000],
  ['', 2, '2024-07-20', 125000],
  ['', 3, '2024-08-10', 280000],
  ['', 4, '2024-09-05', 450000],
  ['', 5, '2024-10-12', 35000]
];

// Create workbook and add worksheets
function createExcelFile(data, filename) {
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  
  // Write to file
  const filepath = path.join(sampleDir, filename);
  XLSX.writeFile(wb, filepath);
  console.log(`✓ Created ${filename}`);
}

console.log('📊 Generating Excel sample files...\n');

createExcelFile(customersData, 'customers_sample.xlsx');
createExcelFile(agentsData, 'agents_sample.xlsx');
createExcelFile(policiesData, 'policies_sample.xlsx');
createExcelFile(claimsData, 'claims_sample.xlsx');

console.log('\n✅ All Excel files created successfully!');
console.log('📁 Location: sample-data/');
console.log('\nFiles created:');
console.log('  - customers_sample.xlsx (10 customers)');
console.log('  - agents_sample.xlsx (5 agents)');
console.log('  - policies_sample.xlsx (8 policies)');
console.log('  - claims_sample.xlsx (5 claims)');
