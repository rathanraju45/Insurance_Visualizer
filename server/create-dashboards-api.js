const API_BASE = 'http://localhost:3000/api';

const dashboards = [
  {
    name: 'Claims Analysis',
    description: 'Comprehensive claims tracking, patterns, and loss ratio analysis',
    config: {
      widgets: [
        { type: 'kpi', title: 'Total Claims Processed', config: { table: 'Claims', aggregation: 'COUNT(*)', column: '*' } },
        { type: 'kpi', title: 'Average Claim Amount', config: { table: 'Claims', aggregation: 'AVG', column: 'claim_amount' } },
        { type: 'kpi', title: 'Highest Claim Value', config: { table: 'Claims', aggregation: 'MAX', column: 'claim_amount' } },
        { type: 'kpi', title: 'Lowest Claim Value', config: { table: 'Claims', aggregation: 'MIN', column: 'claim_amount' } },
        { type: 'line', title: 'Monthly Claims Trend', config: { table: 'Claims', aggregation: 'COUNT(*)', column: '*', groupBy: 'DATE_FORMAT(claim_date, "%Y-%m")', limit: 12 } },
        { type: 'line', title: 'Claim Amount Trend', config: { table: 'Claims', aggregation: 'SUM', column: 'claim_amount', groupBy: 'DATE_FORMAT(claim_date, "%Y-%m")', limit: 12 } },
        { type: 'bar', title: 'Claims by Month', config: { table: 'Claims', aggregation: 'COUNT(*)', column: '*', groupBy: 'MONTH(claim_date)', limit: 12 } },
        { type: 'table', title: 'Recent Claims', config: { table: 'Claims', columns: ['claim_amount', 'claim_date', 'policy_id'], limit: 20 } }
      ],
      filters: []
    }
  },
  {
    name: 'Policy Performance',
    description: 'Policy lifecycle analysis, retention, and renewal tracking',
    config: {
      widgets: [
        { type: 'kpi', title: 'Active Policies', config: { table: 'Policies', aggregation: 'COUNT(*)', column: '*' } },
        { type: 'pie', title: 'Policy Type Distribution', config: { table: 'Policies', aggregation: 'COUNT(*)', column: '*', groupBy: 'policy_type', limit: 10 } },
        { type: 'bar', title: 'Policies by Start Month', config: { table: 'Policies', aggregation: 'COUNT(*)', column: '*', groupBy: 'DATE_FORMAT(start_date, "%Y-%m")', limit: 12 } },
        { type: 'bar', title: 'Policies by End Month', config: { table: 'Policies', aggregation: 'COUNT(*)', column: '*', groupBy: 'DATE_FORMAT(end_date, "%Y-%m")', limit: 12 } },
        { type: 'line', title: 'Policy Growth Trend', config: { table: 'Policies', aggregation: 'COUNT(*)', column: '*', groupBy: 'YEAR(start_date)', limit: 10 } },
        { type: 'table', title: 'Policy Details', config: { table: 'Policies', columns: ['policy_type', 'premium_amount', 'coverage_amount', 'start_date', 'end_date'], limit: 15 } }
      ],
      filters: []
    }
  },
  {
    name: 'Customer Insights',
    description: 'Customer demographics, behavior patterns, and engagement metrics',
    config: {
      widgets: [
        { type: 'kpi', title: 'Total Customers', config: { table: 'Customers', aggregation: 'COUNT(*)', column: '*' } },
        { type: 'bar', title: 'Customer Registration by Year', config: { table: 'Customers', aggregation: 'COUNT(*)', column: '*', groupBy: 'YEAR(date_of_birth)', limit: 20 } },
        { type: 'table', title: 'Customer Directory', config: { table: 'Customers', columns: ['full_name', 'email', 'phone_number', 'address'], limit: 20 } }
      ],
      filters: []
    }
  },
  {
    name: 'Agent Performance',
    description: 'Agent productivity, commission tracking, and performance metrics',
    config: {
      widgets: [
        { type: 'kpi', title: 'Total Agents', config: { table: 'Agents', aggregation: 'COUNT(*)', column: '*' } },
        { type: 'kpi', title: 'Total Policies Written', config: { table: 'Policies', aggregation: 'COUNT(*)', column: '*' } },
        { type: 'kpi', title: 'Total Premium Volume', config: { table: 'Policies', aggregation: 'SUM', column: 'premium_amount' } },
        { type: 'table', title: 'Agent Directory', config: { table: 'Agents', columns: ['agent_id', 'full_name', 'email', 'phone_number'], limit: 20 } }
      ],
      filters: []
    }
  },
  {
    name: 'Risk Assessment',
    description: 'Risk exposure, loss ratios, and underwriting performance analysis',
    config: {
      widgets: [
        { type: 'kpi', title: 'Total Exposure (Coverage)', config: { table: 'Policies', aggregation: 'SUM', column: 'coverage_amount' } },
        { type: 'kpi', title: 'Total Premiums Collected', config: { table: 'Policies', aggregation: 'SUM', column: 'premium_amount' } },
        { type: 'kpi', title: 'Total Claims Paid', config: { table: 'Claims', aggregation: 'SUM', column: 'claim_amount' } },
        { type: 'pie', title: 'Risk Distribution by Policy Type', config: { table: 'Policies', aggregation: 'SUM', column: 'coverage_amount', groupBy: 'policy_type', limit: 10 } },
        { type: 'bar', title: 'Claims vs Premium by Policy Type', config: { table: 'Policies', aggregation: 'SUM', column: 'premium_amount', groupBy: 'policy_type', limit: 10 } },
        { type: 'line', title: 'Risk Exposure Trend', config: { table: 'Policies', aggregation: 'SUM', column: 'coverage_amount', groupBy: 'DATE_FORMAT(start_date, "%Y-%m")', limit: 12 } }
      ],
      filters: []
    }
  },
  {
    name: 'Operational Dashboard',
    description: 'Day-to-day operations, processing times, and workflow efficiency',
    config: {
      widgets: [
        { type: 'kpi', title: 'Pending Claims', config: { table: 'Claims', aggregation: 'COUNT(*)', column: '*' } },
        { type: 'kpi', title: 'Active Policies Today', config: { table: 'Policies', aggregation: 'COUNT(*)', column: '*' } },
        { type: 'kpi', title: 'New Customers This Month', config: { table: 'Customers', aggregation: 'COUNT(*)', column: '*' } },
        { type: 'bar', title: 'Daily Policy Creation', config: { table: 'Policies', aggregation: 'COUNT(*)', column: '*', groupBy: 'DATE(start_date)', limit: 30 } },
        { type: 'bar', title: 'Daily Claim Submission', config: { table: 'Claims', aggregation: 'COUNT(*)', column: '*', groupBy: 'DATE(claim_date)', limit: 30 } },
        { type: 'line', title: 'Weekly Operations Trend', config: { table: 'Policies', aggregation: 'COUNT(*)', column: '*', groupBy: 'WEEK(start_date)', limit: 12 } },
        { type: 'table', title: 'Recent Activity', config: { table: 'Policies', columns: ['policy_type', 'premium_amount', 'start_date'], limit: 15 } }
      ],
      filters: []
    }
  }
];

async function createDashboards() {
  console.log('🚀 Creating remaining 6 dashboards via API...\n');

  let successCount = 0;
  let failCount = 0;

  for (const dashboard of dashboards) {
    try {
      console.log(`📊 Creating: ${dashboard.name}`);
      
      const response = await fetch(`${API_BASE}/dashboards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dashboard)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log(`   ✅ Created successfully (ID: ${data.id})`);
      console.log(`   ✓ Widgets: ${dashboard.config.widgets.length}`);
      successCount++;
      
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
      failCount++;
    }
    console.log('');
  }

  console.log('═══════════════════════════════════════');
  console.log(`✅ Successfully created: ${successCount} dashboards`);
  if (failCount > 0) {
    console.log(`❌ Failed: ${failCount} dashboards`);
  }
  console.log('═══════════════════════════════════════\n');
  
  console.log('📋 Dashboards created:');
  dashboards.forEach((d, i) => {
    console.log(`   ${i + 3}. ${d.name} (${d.config.widgets.length} widgets)`);
  });
}

createDashboards().catch(err => {
  console.error('\n💥 Fatal error:', err.message);
  process.exit(1);
});
