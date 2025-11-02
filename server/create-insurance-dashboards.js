const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: { rejectUnauthorized: false }
};

const dashboards = [
  {
    name: 'Executive Summary',
    description: 'High-level overview of key insurance metrics and performance indicators',
    widgets: [
      {
        type: 'kpi',
        title: 'Total Active Policies',
        config: {
          table: 'Policies',
          aggregation: 'count',
          column: '*'
        }
      },
      {
        type: 'kpi',
        title: 'Total Premium Revenue',
        config: {
          table: 'Policies',
          aggregation: 'sum',
          column: 'premium_amount'
        }
      },
      {
        type: 'kpi',
        title: 'Total Claims Amount',
        config: {
          table: 'Claims',
          aggregation: 'sum',
          column: 'claim_amount'
        }
      },
      {
        type: 'kpi',
        title: 'Total Customers',
        config: {
          table: 'Customers',
          aggregation: 'count',
          column: '*'
        }
      },
      {
        type: 'pie',
        title: 'Policy Distribution by Type',
        config: {
          table: 'Policies',
          aggregation: 'count',
          column: '*',
          groupBy: 'policy_type'
        }
      },
      {
        type: 'bar',
        title: 'Premium Revenue by Policy Type',
        config: {
          table: 'Policies',
          aggregation: 'sum',
          column: 'premium_amount',
          groupBy: 'policy_type'
        }
      },
      {
        type: 'line',
        title: 'Monthly Policy Growth',
        config: {
          table: 'Policies',
          aggregation: 'count',
          column: '*',
          groupBy: 'DATE_FORMAT(start_date, "%Y-%m")',
          limit: 12
        }
      },
      {
        type: 'table',
        title: 'Top Performing Agents',
        config: {
          table: 'Agents',
          columns: ['full_name', 'email'],
          limit: 10
        }
      }
    ]
  },
  {
    name: 'Revenue Analytics',
    description: 'Detailed analysis of premium revenue, coverage, and financial performance',
    widgets: [
      {
        type: 'kpi',
        title: 'Average Premium Amount',
        config: {
          table: 'Policies',
          aggregation: 'avg',
          column: 'premium_amount'
        }
      },
      {
        type: 'kpi',
        title: 'Average Coverage Amount',
        config: {
          table: 'Policies',
          aggregation: 'avg',
          column: 'coverage_amount'
        }
      },
      {
        type: 'kpi',
        title: 'Highest Premium',
        config: {
          table: 'Policies',
          aggregation: 'max',
          column: 'premium_amount'
        }
      },
      {
        type: 'kpi',
        title: 'Total Coverage Value',
        config: {
          table: 'Policies',
          aggregation: 'sum',
          column: 'coverage_amount'
        }
      },
      {
        type: 'bar',
        title: 'Premium Revenue Trends',
        config: {
          table: 'Policies',
          aggregation: 'sum',
          column: 'premium_amount',
          groupBy: 'DATE_FORMAT(start_date, "%Y-%m")',
          limit: 12
        }
      },
      {
        type: 'bar',
        title: 'Coverage by Policy Type',
        config: {
          table: 'Policies',
          aggregation: 'sum',
          column: 'coverage_amount',
          groupBy: 'policy_type'
        }
      },
      {
        type: 'pie',
        title: 'Premium Distribution by Policy Type',
        config: {
          table: 'Policies',
          aggregation: 'sum',
          column: 'premium_amount',
          groupBy: 'policy_type'
        }
      },
      {
        type: 'table',
        title: 'High-Value Policies',
        config: {
          table: 'Policies',
          columns: ['policy_type', 'premium_amount', 'coverage_amount', 'start_date'],
          limit: 15
        }
      }
    ]
  },
  {
    name: 'Claims Analysis',
    description: 'Comprehensive claims tracking, patterns, and loss ratio analysis',
    widgets: [
      {
        type: 'kpi',
        title: 'Total Claims Processed',
        config: {
          table: 'Claims',
          aggregation: 'count',
          column: '*'
        }
      },
      {
        type: 'kpi',
        title: 'Average Claim Amount',
        config: {
          table: 'Claims',
          aggregation: 'avg',
          column: 'claim_amount'
        }
      },
      {
        type: 'kpi',
        title: 'Highest Claim Value',
        config: {
          table: 'Claims',
          aggregation: 'max',
          column: 'claim_amount'
        }
      },
      {
        type: 'kpi',
        title: 'Lowest Claim Value',
        config: {
          table: 'Claims',
          aggregation: 'min',
          column: 'claim_amount'
        }
      },
      {
        type: 'line',
        title: 'Monthly Claims Trend',
        config: {
          table: 'Claims',
          aggregation: 'count',
          column: '*',
          groupBy: 'DATE_FORMAT(claim_date, "%Y-%m")',
          limit: 12
        }
      },
      {
        type: 'line',
        title: 'Claim Amount Trend',
        config: {
          table: 'Claims',
          aggregation: 'sum',
          column: 'claim_amount',
          groupBy: 'DATE_FORMAT(claim_date, "%Y-%m")',
          limit: 12
        }
      },
      {
        type: 'bar',
        title: 'Claims by Month',
        config: {
          table: 'Claims',
          aggregation: 'count',
          column: '*',
          groupBy: 'MONTH(claim_date)'
        }
      },
      {
        type: 'table',
        title: 'Recent Claims',
        config: {
          table: 'Claims',
          columns: ['claim_amount', 'claim_date', 'policy_id'],
          limit: 20
        }
      }
    ]
  },
  {
    name: 'Policy Performance',
    description: 'Policy lifecycle analysis, retention, and renewal tracking',
    widgets: [
      {
        type: 'kpi',
        title: 'Active Policies',
        config: {
          table: 'Policies',
          aggregation: 'count',
          column: '*'
        }
      },
      {
        type: 'kpi',
        title: 'Total Policy Types',
        config: {
          table: 'Policies',
          aggregation: 'count',
          column: 'DISTINCT policy_type'
        }
      },
      {
        type: 'pie',
        title: 'Policy Type Distribution',
        config: {
          table: 'Policies',
          aggregation: 'count',
          column: '*',
          groupBy: 'policy_type'
        }
      },
      {
        type: 'bar',
        title: 'Policies by Start Month',
        config: {
          table: 'Policies',
          aggregation: 'count',
          column: '*',
          groupBy: 'DATE_FORMAT(start_date, "%Y-%m")',
          limit: 12
        }
      },
      {
        type: 'bar',
        title: 'Policies by End Month',
        config: {
          table: 'Policies',
          aggregation: 'count',
          column: '*',
          groupBy: 'DATE_FORMAT(end_date, "%Y-%m")',
          limit: 12
        }
      },
      {
        type: 'line',
        title: 'Policy Growth Trend',
        config: {
          table: 'Policies',
          aggregation: 'count',
          column: '*',
          groupBy: 'YEAR(start_date)'
        }
      },
      {
        type: 'table',
        title: 'Policy Details',
        config: {
          table: 'Policies',
          columns: ['policy_type', 'premium_amount', 'coverage_amount', 'start_date', 'end_date'],
          limit: 15
        }
      }
    ]
  },
  {
    name: 'Customer Insights',
    description: 'Customer demographics, behavior patterns, and engagement metrics',
    widgets: [
      {
        type: 'kpi',
        title: 'Total Customers',
        config: {
          table: 'Customers',
          aggregation: 'count',
          column: '*'
        }
      },
      {
        type: 'kpi',
        title: 'Customers with Policies',
        config: {
          table: 'Policies',
          aggregation: 'count',
          column: 'DISTINCT customer_id'
        }
      },
      {
        type: 'kpi',
        title: 'Average Policies per Customer',
        config: {
          table: 'Policies',
          aggregation: 'avg',
          column: 'customer_id'
        }
      },
      {
        type: 'bar',
        title: 'Customer Registration by Year',
        config: {
          table: 'Customers',
          aggregation: 'count',
          column: '*',
          groupBy: 'YEAR(date_of_birth)'
        }
      },
      {
        type: 'line',
        title: 'Customer Growth',
        config: {
          table: 'Customers',
          aggregation: 'count',
          column: '*',
          groupBy: 'customer_id',
          limit: 50
        }
      },
      {
        type: 'table',
        title: 'Customer Directory',
        config: {
          table: 'Customers',
          columns: ['full_name', 'email', 'phone_number', 'address'],
          limit: 20
        }
      }
    ]
  },
  {
    name: 'Agent Performance',
    description: 'Agent productivity, commission tracking, and performance metrics',
    widgets: [
      {
        type: 'kpi',
        title: 'Total Agents',
        config: {
          table: 'Agents',
          aggregation: 'count',
          column: '*'
        }
      },
      {
        type: 'kpi',
        title: 'Active Agents',
        config: {
          table: 'Agents',
          aggregation: 'count',
          column: '*'
        }
      },
      {
        type: 'table',
        title: 'Agent Directory',
        config: {
          table: 'Agents',
          columns: ['full_name', 'email', 'phone_number'],
          limit: 20
        }
      },
      {
        type: 'bar',
        title: 'Agent Distribution',
        config: {
          table: 'Agents',
          aggregation: 'count',
          column: '*',
          groupBy: 'agent_id'
        }
      }
    ]
  },
  {
    name: 'Risk Assessment',
    description: 'Risk exposure, loss ratios, and underwriting performance analysis',
    widgets: [
      {
        type: 'kpi',
        title: 'Total Exposure (Coverage)',
        config: {
          table: 'Policies',
          aggregation: 'sum',
          column: 'coverage_amount'
        }
      },
      {
        type: 'kpi',
        title: 'Total Premiums Collected',
        config: {
          table: 'Policies',
          aggregation: 'sum',
          column: 'premium_amount'
        }
      },
      {
        type: 'kpi',
        title: 'Total Claims Paid',
        config: {
          table: 'Claims',
          aggregation: 'sum',
          column: 'claim_amount'
        }
      },
      {
        type: 'pie',
        title: 'Risk Distribution by Policy Type',
        config: {
          table: 'Policies',
          aggregation: 'sum',
          column: 'coverage_amount',
          groupBy: 'policy_type'
        }
      },
      {
        type: 'bar',
        title: 'Claims vs Premium by Policy Type',
        config: {
          table: 'Policies',
          aggregation: 'sum',
          column: 'premium_amount',
          groupBy: 'policy_type'
        }
      },
      {
        type: 'line',
        title: 'Risk Exposure Trend',
        config: {
          table: 'Policies',
          aggregation: 'sum',
          column: 'coverage_amount',
          groupBy: 'DATE_FORMAT(start_date, "%Y-%m")',
          limit: 12
        }
      }
    ]
  },
  {
    name: 'Operational Dashboard',
    description: 'Day-to-day operations, processing times, and workflow efficiency',
    widgets: [
      {
        type: 'kpi',
        title: 'Pending Claims',
        config: {
          table: 'Claims',
          aggregation: 'count',
          column: '*'
        }
      },
      {
        type: 'kpi',
        title: 'Active Policies Today',
        config: {
          table: 'Policies',
          aggregation: 'count',
          column: '*'
        }
      },
      {
        type: 'kpi',
        title: 'New Customers This Month',
        config: {
          table: 'Customers',
          aggregation: 'count',
          column: '*'
        }
      },
      {
        type: 'bar',
        title: 'Daily Policy Creation',
        config: {
          table: 'Policies',
          aggregation: 'count',
          column: '*',
          groupBy: 'DATE(start_date)',
          limit: 30
        }
      },
      {
        type: 'bar',
        title: 'Daily Claim Submission',
        config: {
          table: 'Claims',
          aggregation: 'count',
          column: '*',
          groupBy: 'DATE(claim_date)',
          limit: 30
        }
      },
      {
        type: 'line',
        title: 'Weekly Operations Trend',
        config: {
          table: 'Policies',
          aggregation: 'count',
          column: '*',
          groupBy: 'WEEK(start_date)',
          limit: 12
        }
      },
      {
        type: 'table',
        title: 'Recent Activity',
        config: {
          table: 'Policies',
          columns: ['policy_type', 'premium_amount', 'start_date'],
          limit: 15
        }
      }
    ]
  }
];

async function createDashboards() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected successfully!\n');

    // Clear existing dashboards
    console.log('Clearing existing dashboards...');
    await connection.execute('DELETE FROM Dashboards');
    console.log('Existing dashboards cleared.\n');

    // Create each dashboard
    for (const dashboard of dashboards) {
      console.log(`Creating dashboard: ${dashboard.name}`);
      
      const [result] = await connection.execute(
        'INSERT INTO Dashboards (name, description, config) VALUES (?, ?, ?)',
        [
          dashboard.name,
          dashboard.description,
          JSON.stringify({
            widgets: dashboard.widgets,
            filters: []
          })
        ]
      );
      
      console.log(`  ✓ Created with ${dashboard.widgets.length} widgets`);
    }

    console.log('\n✅ All dashboards created successfully!');
    console.log(`\nTotal dashboards created: ${dashboards.length}`);
    console.log('\nDashboard Summary:');
    dashboards.forEach((d, i) => {
      console.log(`${i + 1}. ${d.name} - ${d.widgets.length} widgets`);
      console.log(`   ${d.description}`);
    });

  } catch (error) {
    console.error('Error creating dashboards:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed.');
    }
  }
}

createDashboards();
