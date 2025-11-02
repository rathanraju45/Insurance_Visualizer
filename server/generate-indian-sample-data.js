require('dotenv').config();
const db = require('./DB/db');
const bcrypt = require('bcrypt');

// Indian names database
const firstNames = [
  'Raj', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Arjun', 'Divya', 'Rohan', 'Kavya',
  'Aditya', 'Pooja', 'Karan', 'Meera', 'Rahul', 'Ananya', 'Sanjay', 'Riya', 'Nikhil', 'Shreya',
  'Abhishek', 'Ishita', 'Manish', 'Tanvi', 'Suresh', 'Nisha', 'Deepak', 'Preeti', 'Vishal', 'Swati',
  'Akash', 'Simran', 'Rajesh', 'Kritika', 'Mohit', 'Aarti', 'Ashok', 'Sonali', 'Gaurav', 'Neha',
  'Prakash', 'Pallavi', 'Siddharth', 'Megha', 'Naveen', 'Richa', 'Sandeep', 'Aditi', 'Ajay', 'Sakshi',
  'Manoj', 'Shweta', 'Praveen', 'Vaishali', 'Vinod', 'Jyoti', 'Ramesh', 'Rashmi', 'Sunil', 'Madhuri',
  'Pankaj', 'Sarika', 'Harsh', 'Komal', 'Dinesh', 'Geeta', 'Ankit', 'Vandana', 'Tarun', 'Seema',
  'Krishna', 'Radha', 'Shyam', 'Sita', 'Gopal', 'Lakshmi', 'Ravi', 'Uma', 'Mahesh', 'Parvati'
];

const lastNames = [
  'Kumar', 'Singh', 'Sharma', 'Patel', 'Gupta', 'Reddy', 'Verma', 'Joshi', 'Desai', 'Nair',
  'Iyer', 'Menon', 'Rao', 'Chopra', 'Kapoor', 'Malhotra', 'Agarwal', 'Bansal', 'Jain', 'Shah',
  'Mehta', 'Kulkarni', 'Pandey', 'Mishra', 'Sinha', 'Chauhan', 'Thakur', 'Bhatt', 'Saxena', 'Yadav',
  'Pillai', 'Kaur', 'Das', 'Bose', 'Ghosh', 'Chatterjee', 'Mukherjee', 'Dutta', 'Roy', 'Sengupta',
  'Naidu', 'Krishna', 'Raman', 'Krishnan', 'Sundaram', 'Venkatesh', 'Subramaniam', 'Natarajan', 'Gopal', 'Mohan'
];

const indianCities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
  'Surat', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad',
  'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad',
  'Amritsar', 'Allahabad', 'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur', 'Madurai'
];

const states = [
  'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Madhya Pradesh',
  'Andhra Pradesh', 'Telangana', 'Kerala', 'Punjab', 'Haryana', 'Bihar', 'Odisha', 'Jharkhand'
];

const policyTypes = [
  'Term Life Insurance', 'Health Insurance', 'Motor Insurance', 'Home Insurance', 'Travel Insurance',
  'Personal Accident', 'Critical Illness', 'Endowment Plan', 'Unit Linked Insurance Plan (ULIP)', 'Money Back Policy'
];

// Helper functions
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function generateEmail(firstName, lastName) {
  const domains = ['gmail.com', 'yahoo.co.in', 'hotmail.com', 'outlook.com', 'rediffmail.com'];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${randomElement(domains)}`;
}

function generatePhone() {
  const prefixes = ['98', '99', '97', '96', '95', '94', '93', '92', '91', '90', '89', '88', '87', '86', '85', '84', '83', '82', '81', '80'];
  return `+91 ${randomElement(prefixes)}${randomInt(10000000, 99999999)}`;
}

function generateAddress(city, state) {
  const areas = ['Sector', 'Phase', 'Block', 'Colony', 'Nagar', 'Road', 'Street', 'Avenue', 'Park'];
  const houseNo = randomInt(1, 999);
  const area = randomElement(areas);
  const areaNo = randomInt(1, 50);
  return `${houseNo}, ${area} ${areaNo}, ${city}, ${state}`;
}

async function generateData() {
  console.log('🚀 Starting Indian sample data generation...\n');

  try {
    // Disable foreign key checks
    await db.query('SET FOREIGN_KEY_CHECKS = 0');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await db.query('TRUNCATE TABLE Claims');
    await db.query('TRUNCATE TABLE Policies');
    await db.query('TRUNCATE TABLE Customers');
    await db.query('TRUNCATE TABLE Agents');
    await db.query('TRUNCATE TABLE Dashboards');
    console.log('✓ Cleared all tables\n');

    // Generate 150 Customers
    console.log('👥 Generating 150 customers...');
    const customers = [];
    for (let i = 0; i < 150; i++) {
      const firstName = randomElement(firstNames);
      const lastName = randomElement(lastNames);
      const city = randomElement(indianCities);
      const state = randomElement(states);
      const dob = formatDate(randomDate(new Date(1960, 0, 1), new Date(2003, 11, 31)));
      
      const result = await db.query(
        'INSERT INTO Customers (full_name, date_of_birth, email, phone_number, address) VALUES (?, ?, ?, ?, ?)',
        [
          `${firstName} ${lastName}`,
          dob,
          generateEmail(firstName, lastName),
          generatePhone(),
          generateAddress(city, state)
        ]
      );
      customers.push(result.insertId);
    }
    console.log(`✓ Created ${customers.length} customers\n`);

    // Generate 30 Agents
    console.log('👔 Generating 30 agents...');
    const agents = [];
    for (let i = 0; i < 30; i++) {
      const firstName = randomElement(firstNames);
      const lastName = randomElement(lastNames);
      
      const result = await db.query(
        'INSERT INTO Agents (full_name, email, phone_number) VALUES (?, ?, ?)',
        [
          `${firstName} ${lastName}`,
          generateEmail(firstName, lastName),
          generatePhone()
        ]
      );
      agents.push(result.insertId);
    }
    console.log(`✓ Created ${agents.length} agents\n`);

    // Generate 250 Policies
    console.log('📋 Generating 250 policies...');
    const policies = [];
    for (let i = 0; i < 250; i++) {
      const customerId = randomElement(customers);
      const agentId = randomElement(agents);
      const policyType = randomElement(policyTypes);
      const startDate = randomDate(new Date(2020, 0, 1), new Date(2024, 11, 31));
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + randomInt(1, 5)); // 1-5 year policies
      
      // Premium amounts in INR (Indian Rupees)
      const premiums = {
        'Term Life Insurance': randomInt(5000, 50000),
        'Health Insurance': randomInt(8000, 60000),
        'Motor Insurance': randomInt(4000, 35000),
        'Home Insurance': randomInt(10000, 80000),
        'Travel Insurance': randomInt(2000, 15000),
        'Personal Accident': randomInt(3000, 20000),
        'Critical Illness': randomInt(15000, 100000),
        'Endowment Plan': randomInt(20000, 150000),
        'Unit Linked Insurance Plan (ULIP)': randomInt(25000, 200000),
        'Money Back Policy': randomInt(15000, 120000)
      };
      
      const premium = premiums[policyType];
      const coverage = premium * randomInt(20, 100); // Coverage is 20-100x of premium
      
      const result = await db.query(
        'INSERT INTO Policies (policy_type, premium_amount, coverage_amount, start_date, end_date, customer_id) VALUES (?, ?, ?, ?, ?, ?)',
        [
          policyType,
          premium,
          coverage,
          formatDate(startDate),
          formatDate(endDate),
          customerId
        ]
      );
      policies.push({ id: result.insertId, premium, coverage });
    }
    console.log(`✓ Created ${policies.length} policies\n`);

    // Generate 180 Claims
    console.log('💰 Generating 180 claims...');
    let claimsCreated = 0;
    for (let i = 0; i < 180; i++) {
      const policy = randomElement(policies);
      const claimDate = randomDate(new Date(2021, 0, 1), new Date(2024, 11, 31));
      const claimAmount = randomInt(Math.floor(policy.premium * 0.5), Math.floor(policy.coverage * 0.3)); // Claim is 50%-30% of coverage
      
      await db.query(
        'INSERT INTO Claims (policy_id, claim_date, claim_amount) VALUES (?, ?, ?)',
        [
          policy.id,
          formatDate(claimDate),
          claimAmount
        ]
      );
      claimsCreated++;
    }
    console.log(`✓ Created ${claimsCreated} claims\n`);

    // Re-enable foreign key checks
    await db.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('✅ Indian sample data generation completed!\n');
    console.log('📊 Summary:');
    console.log(`   - Customers: ${customers.length}`);
    console.log(`   - Agents: ${agents.length}`);
    console.log(`   - Policies: ${policies.length}`);
    console.log(`   - Claims: ${claimsCreated}`);
    console.log('\n💰 Currency: INR (Indian Rupees)');
    console.log('🇮🇳 Context: Indian names, cities, and phone numbers\n');

  } catch (error) {
    console.error('❌ Error generating data:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

generateData();
