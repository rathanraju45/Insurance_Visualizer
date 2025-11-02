require('dotenv').config();
const mysql = require('mysql2/promise');

const dashboards = [
  {
    name: 'Claims Analysis',
    description: 'Comprehensive claims tracking, patterns, and loss ratio analysis',
    widgets: [
      { type: 'kpi', title: 'Total Claims Processed', config: { table: 'Claims', aggregation: 'COUNT(*)', column: '*' } },
      { type: 'kpi', title: 'Average Claim Amount', config: { table: 'Claims', aggregation: 'AVG', column: 'claim_amount' } },
      { type: 'kpi', title: 'Highest Claim Value', config: { table: 'Claims', aggregation: 'MAX', column: 'claim_amount' } },
      { type: 'kpi', title: 'Lowest Claim Value', config: { table: 'Claims', aggregation: 'MIN', column: 'claim_amount' } },
      { type: 'line', title: 'Monthly Claims Trend', config: { table: 'Claims', aggregation: 'COUNT(*)', column: '*', groupBy: 'DATE_FORMAT(claim_date, "%Y-%m")', limit: 12 } },
      { type: 'line', title: 'Claim Amount Trend', config: { table: 'Claims', aggregation: 'SUM', column: 'claim_amount', groupBy: 'DATE_FORMAT(claim_date, "%Y-%m")', limit: 12 } },
      { type: 'bar', title: 'Claims by Month', config: { table: 'Claims', aggregation: 'COUNT(*)', column: '*', groupBy: 'MONTH(claim_date)', limit: 12 } },
      { type: 'table', title: 'Recent Claims', config: { table: 'Claims', columns: ['claim_amount', 'claim_date', 'policy_id'], limit: 20 } }
    ]
  },
  {
    name: 'Policy Performance',
    description: 'Policy lifecycle analysis, retention, and renewal tracking',
    widgets: [
      { type: 'kpi', title: 'Active Policies', config: { table: 'Policies', aggregation: 'COUNT(*)', column: '*' } },
      { type: 'pie', title: 'Policy Type Distribution', config: { table: 'Policies', aggregation: 'COUNT(*)', column: '*', groupBy: 'policy_type', limit: 10 } },
      { type: 'bar', title: 'Policies by Start Month', config: { table: 'Policies', aggregation: 'COUNT(*)', column: '*', groupBy: 'DATE_FORMAT(start_date, "%Y-%m")', limit: 12 } },
      { type: 'bar', title: 'Policies by End Month', config: { table: 'Policies', aggregation: 'COUNT(*)', column: '*', groupBy: 'DATE_FORMAT(end_date, "%Y-%m")', limit: 12 } },
      { type: 'line', title: 'Policy Growth Trend', config: { table: 'Policies', aggregation: 'COUNT(*)', column: '*', groupBy: 'YEAR(start_date)', limit: 10 } },
      { type: 'table', title: 'Policy Details', config: { table: 'Policies', columns: ['policy_type', 'premium_amount', 'coverage_amount', 'start_date', 'end_date'], limit: 15 } }
    ]
  },
  {
    name: 'Customer Insights',
    description: 'Customer demographics, behavior patterns, and engagement metrics',
    widgets: [
      { type: 'kpi', title: 'Total Customers', config: { table: 'Customers', aggregation: 'COUNT(*)', column: '*' } },
      { type: 'bar', title: 'Customer Registration by Year', config: { table: 'Customers', aggregation: 'COUNT(*)', column: '*', groupBy: 'YEAR(date_of_birth)', limit: 20 } },
      { type: 'table', title: 'Customer Directory', config: { table: 'Customers', columns: ['full_name', 'email', 'phone_number', 'address'], limit: 20 } }
    ]
  },
  {
    name: 'Agent Performance',
    description: 'Agent productivity, commission tracking, and performance metrics',
    widgets: [
      { type: 'kpi', title: 'Total Agents', config: { table: 'Agents', aggregation: 'COUNT(*)', column: '*' } },
      { type: 'kpi', title: 'Total Policies Written', config: { table: 'Policies', aggregation: 'COUNT(*)', column: '*' } },
      { type: 'kpi', title: 'Total Premium Volume', config: { table: 'Policies', aggregation: 'SUM', column: 'premium_amount' } },
      { type: 'table', title: 'Agent Directory', config: { table: 'Agents', columns: ['agent_id', 'full_name', 'email', 'phone_number'], limit: 20 } }
    ]
  },
  {
    name: 'Risk Assessment',
    description: 'Risk exposure, loss ratios, and underwriting performance analysis',
    widgets: [
      { type: 'kpi', title: 'Total Exposure (Coverage)', config: { table: 'Policies', aggregation: 'SUM', column: 'coverage_amount' } },
      { type: 'kpi', title: 'Total Premiums Collected', config: { table: 'Policies', aggregation: 'SUM', column: 'premium_amount' } },
      { type: 'kpi', title: 'Total Claims Paid', config: { table: 'Claims', aggregation: 'SUM', column: 'claim_amount' } },
      { type: 'pie', title: 'Risk Distribution by Policy Type', config: { table: 'Policies', aggregation: 'SUM', column: 'coverage_amount', groupBy: 'policy_type', limit: 10 } },
      { type: 'bar', title: 'Claims vs Premium by Policy Type', config: { table: 'Policies', aggregation: 'SUM', column: 'premium_amount', groupBy: 'policy_type', limit: 10 } },
      { type: 'line', title: 'Risk Exposure Trend', config: { table: 'Policies', aggregation: 'SUM', column: 'coverage_amount', groupBy: 'DATE_FORMAT(start_date, "%Y-%m")', limit: 12 } }
    ]
  },
  {
    name: 'Operational Dashboard',
    description: 'Day-to-day operations, processing times, and workflow efficiency',
    widgets: [
      { type: 'kpi', title: 'Pending Claims', config: { table: 'Claims', aggregation: 'COUNT(*)', column: '*' } },
      { type: 'kpi', title: 'Active Policies Today', config: { table: 'Policies', aggregation: 'COUNT(*)', column: '*' } },
      { type: 'kpi', title: 'New Customers This Month', config: { table: 'Customers', aggregation: 'COUNT(*)', column: '*' } },
      { type: 'bar', title: 'Daily Policy Creation', config: { table: 'Policies', aggregation: 'COUNT(*)', column: '*', groupBy: 'DATE(start_date)', limit: 30 } },
      { type: 'bar', title: 'Daily Claim Submission', config: { table: 'Claims', aggregation: 'COUNT(*)', column: '*', groupBy: 'DATE(claim_date)', limit: 30 } },
      { type: 'line', title: 'Weekly Operations Trend', config: { table: 'Policies', aggregation: 'COUNT(*)', column: '*', groupBy: 'WEEK(start_date)', limit: 12 } },
      { type: 'table', title: 'Recent Activity', config: { table: 'Policies', columns: ['policy_type', 'premium_amount', 'start_date'], limit: 15 } }
    ]
  }
];

async function createDashboards() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'insurance_db'
    });

    console.log('✅ Connected to database');

    for (const dashboard of dashboards) {
      console.log(`\n📊 Creating dashboard: ${dashboard.name}`);
      
      const config = {
        widgets: dashboard.widgets,
        filters: []
      };

      const [result] = await connection.execute(
        'INSERT INTO Dashboards (name, description, config) VALUES (?, ?, ?)',
        [dashboard.name, dashboard.description, JSON.stringify(config)]
      );

      console.log(`   ✓ Created with ID: ${result.insertId}`);
      console.log(`   ✓ Widgets: ${dashboard.widgets.length}`);
    }

    console.log('\n🎉 Successfully created all 6 dashboards!');
    console.log('\nDashboards created:');
    dashboards.forEach((d, i) => {
      console.log(`${i + 1}. ${d.name} (${d.widgets.length} widgets)`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

createDashboards();
