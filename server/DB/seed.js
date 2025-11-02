/**
 * seed.js
 * Populate the database with sample data: agents, customers, policies, claims.
 * Usage: node DB/seed.js
 */
const db = require('./db');

const FIRST = ['Alex','Sam','Chris','Pat','Taylor','Jordan','Casey','Jamie','Morgan','Riley','Avery','Drew','Lee','Devon','Shawn','Skyler','Robin','Cameron','Quinn','Hayden'];
const LAST = ['Sharma','Patel','Singh','Kumar','Reddy','Nair','Iyer','Gupta','Mehta','Das','Khan','Jones','Smith','Brown','Taylor','Wilson','Lee','Martin','Garcia','Rodriguez'];
const STREETS = ['Main St','Market St','High St','Park Ave','1st Ave','Oak St','Pine St','Maple Ave','Cedar Rd','Elm St'];
const POLICY_TYPES = ['Auto','Health','Home','Life','Travel','Commercial'];

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[randInt(0, arr.length-1)]; }
function rndName() { return `${pick(FIRST)} ${pick(LAST)}`; }
function rndEmail(name, i) { return `${name.toLowerCase().replace(/\s+/g,'')}${i}@example.com`; }
function rndPhone() { return `+91${randInt(600000000, 999999999)}`; }
function rndAddress(i) { return `${randInt(1,999)} ${pick(STREETS)}, City ${i}`; }
function rndDOB() { const y = randInt(1950,2000); const m = randInt(1,12); const d = randInt(1,28); return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`; }
function rndDateBetween(startYear, endYear) { const y = randInt(startYear, endYear); const m = randInt(1,12); const d = randInt(1,28); return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`; }

async function seed() {
  await db.initDB();
  try {
    const agentsCount = 20;
    const customersCount = 100;

    // ensure we don't duplicate if run multiple times
    const aRows = await db.query('SELECT COUNT(*) AS c FROM Agents');
    const existingAgents = aRows[0] && aRows[0].c ? Number(aRows[0].c) : 0;
    const agentsToCreate = Math.max(0, agentsCount - existingAgents);
    console.log(`Seeding agents... (create ${agentsToCreate}, existing ${existingAgents})`);
    const agentIds = [];
    if (existingAgents > 0) {
      const rows = await db.query('SELECT agent_id FROM Agents');
      for (const r of rows) agentIds.push(r.agent_id);
    }
    for (let i=1;i<=agentsToCreate;i++){
      const name = rndName();
      const email = `agent${existingAgents + i}@example.com`;
      const phone = rndPhone();
      const res = await db.query('INSERT INTO Agents (full_name,email,phone_number) VALUES (?,?,?)',[name,email,phone]);
      agentIds.push(res.insertId);
    }

    const cRows = await db.query('SELECT COUNT(*) AS c FROM Customers');
    const existingCustomers = cRows[0] && cRows[0].c ? Number(cRows[0].c) : 0;
    const customersToCreate = Math.max(0, customersCount - existingCustomers);
    console.log(`Seeding customers... (create ${customersToCreate}, existing ${existingCustomers})`);
    const customerIds = [];
    if (existingCustomers > 0) {
      const rows = await db.query('SELECT customer_id FROM Customers');
      for (const r of rows) customerIds.push(r.customer_id);
    }
    for (let i=1;i<=customersToCreate;i++){
      const idx = existingCustomers + i;
      const name = rndName();
      const email = rndEmail(name.replace(/\s+/g,''), idx);
      const phone = rndPhone();
      const dob = rndDOB();
      const addr = rndAddress(idx);
      const res = await db.query('INSERT INTO Customers (full_name,date_of_birth,email,phone_number,address) VALUES (?,?,?,?,?)',[name,dob,email,phone,addr]);
      customerIds.push(res.insertId);
    }

    console.log('Seeding policies...');
    const policyIds = [];
    // we'll create policies for customers who currently have none
    const custsNoPolicy = await db.query(`SELECT c.customer_id FROM Customers c LEFT JOIN Policies p ON p.customer_id = c.customer_id WHERE p.customer_id IS NULL`);
    for (const r of custsNoPolicy) {
      const custId = r.customer_id;
      const num = randInt(1,3);
      for (let j=0;j<num;j++){
        const pType = pick(POLICY_TYPES);
        const premium = (randInt(1000,100000) / 100).toFixed(2);
        const coverage = (randInt(50000,10000000) / 100).toFixed(2);
        const start = rndDateBetween(2018,2024);
        const end = rndDateBetween(2025,2028);
        const customerName = null; // keep null; relationship via customer_id
        const res = await db.query('INSERT INTO Policies (policy_type,premium_amount,coverage_amount,start_date,end_date,customer_name,customer_id) VALUES (?,?,?,?,?,?,?)',[pType,premium,coverage,start,end,customerName,custId]);
        policyIds.push(res.insertId);
      }
    }

    // if there are still too few policies overall, create some random extra policies
    const policyCountRows = await db.query('SELECT COUNT(*) AS c FROM Policies');
    let totalPolicies = policyCountRows[0] && policyCountRows[0].c ? Number(policyCountRows[0].c) : 0;
    const desiredPolicies = Math.max(Math.floor(customersCount * 1.5), 150);
    while (totalPolicies < desiredPolicies) {
      const custId = pick(customerIds);
      const pType = pick(POLICY_TYPES);
      const premium = (randInt(1000,100000) / 100).toFixed(2);
      const coverage = (randInt(50000,10000000) / 100).toFixed(2);
      const start = rndDateBetween(2018,2024);
      const end = rndDateBetween(2025,2028);
      const res = await db.query('INSERT INTO Policies (policy_type,premium_amount,coverage_amount,start_date,end_date,customer_name,customer_id) VALUES (?,?,?,?,?,?,?)',[pType,premium,coverage,start,end,null,custId]);
      policyIds.push(res.insertId);
      totalPolicies++;
    }

    console.log('Seeding claims...');
    // create 0-2 claims per policy where none exist yet
    const policiesNoClaims = await db.query(`SELECT p.policy_id FROM Policies p LEFT JOIN Claims c ON c.policy_id = p.policy_id WHERE c.policy_id IS NULL`);
    for (const r of policiesNoClaims) {
      const pid = r.policy_id;
      const num = randInt(0,2);
      for (let k=0;k<num;k++){
        const cDate = rndDateBetween(2019,2025);
        const amount = (randInt(500,500000) / 100).toFixed(2);
        await db.query('INSERT INTO Claims (policy_id,claim_date,claim_amount) VALUES (?,?,?)',[pid,cDate,amount]);
      }
    }

    console.log(`Seed complete: agents target=${agentsCount}, customers target=${customersCount}, policies >= ${desiredPolicies}`);
  } catch (err) {
    console.error('Seeding error:', err.message || err);
  } finally {
    await db.closePool();
  }
}

if (require.main === module) seed().then(()=>process.exit(0)).catch(()=>process.exit(1));

module.exports = { seed };
