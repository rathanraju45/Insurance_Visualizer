require('dotenv').config();
const db = require('./DB/db');

const dashboards = [
  {
    name: 'Executive Overview',
    description: 'High-level business metrics and KPIs for executive decision making',
    config: {
      widgets: [
        {
          id: 'w1',
          title: 'Total Customers',
          type: 'kpi',
          table: 'Customers',
          aggregation: 'count'
        },
        {
          id: 'w2',
          title: 'Active Policies',
          type: 'kpi',
          table: 'Policies',
          aggregation: 'count'
        },
        {
          id: 'w3',
          title: 'Total Premium Revenue',
          type: 'kpi',
          table: 'Policies',
          aggregation: 'sum',
          column: 'premium_amount'
        },
        {
          id: 'w4',
          title: 'Total Claims Amount',
          type: 'kpi',
          table: 'Claims',
          aggregation: 'sum',
          column: 'claim_amount'
        },
        {
          id: 'w5',
          title: 'Policies by Type',
          type: 'pie',
          table: 'Policies',
          aggregation: 'count',
          groupBy: 'policy_type'
        },
        {
          id: 'w6',
          title: 'Premium Revenue by Policy Type',
          type: 'bar',
          table: 'Policies',
          aggregation: 'sum',
          column: 'premium_amount',
          groupBy: 'policy_type',
          limit: 10
        },
        {
          id: 'w7',
          title: 'Monthly Claims Trend',
          type: 'line',
          table: 'Claims',
          aggregation: 'count',
          groupBy: "DATE_FORMAT(claim_date, '%Y-%m')",
          limit: 12
        },
        {
          id: 'w8',
          title: 'Top Customers by Coverage',
          type: 'table',
          table: 'Policies',
          aggregation: 'sum',
          column: 'coverage_amount',
          groupBy: 'customer_name',
          limit: 10
        }
      ],
      filters: []
    }
  },
  {
    name: 'Claims Analysis',
    description: 'Detailed analysis of insurance claims and settlement patterns',
    config: {
      widgets: [
        {
          id: 'w1',
          title: 'Total Claims Filed',
          type: 'kpi',
          table: 'Claims',
          aggregation: 'count'
        },
        {
          id: 'w2',
          title: 'Total Claims Amount',
          type: 'kpi',
          table: 'Claims',
          aggregation: 'sum',
          column: 'claim_amount'
        },
        {
          id: 'w3',
          title: 'Average Claim Amount',
          type: 'kpi',
          table: 'Claims',
          aggregation: 'avg',
          column: 'claim_amount'
        },
        {
          id: 'w4',
          title: 'Claims by Month',
          type: 'line',
          table: 'Claims',
          aggregation: 'count',
          groupBy: "DATE_FORMAT(claim_date, '%Y-%m')",
          limit: 12
        },
        {
          id: 'w5',
          title: 'Claims Amount by Month',
          type: 'bar',
          table: 'Claims',
          aggregation: 'sum',
          column: 'claim_amount',
          groupBy: "DATE_FORMAT(claim_date, '%Y-%m')",
          limit: 12
        },
        {
          id: 'w6',
          title: 'Top Claims by Amount',
          type: 'table',
          table: 'Claims',
          aggregation: 'max',
          column: 'claim_amount',
          groupBy: 'claim_id',
          limit: 15
        }
      ],
      filters: []
    }
  },
  {
    name: 'Policy Performance',
    description: 'Comprehensive view of policy distribution, premiums, and coverage',
    config: {
      widgets: [
        {
          id: 'w1',
          title: 'Total Policies',
          type: 'kpi',
          table: 'Policies',
          aggregation: 'count'
        },
        {
          id: 'w2',
          title: 'Total Premium Revenue',
          type: 'kpi',
          table: 'Policies',
          aggregation: 'sum',
          column: 'premium_amount'
        },
        {
          id: 'w3',
          title: 'Average Premium',
          type: 'kpi',
          table: 'Policies',
          aggregation: 'avg',
          column: 'premium_amount'
        },
        {
          id: 'w4',
          title: 'Total Coverage',
          type: 'kpi',
          table: 'Policies',
          aggregation: 'sum',
          column: 'coverage_amount'
        },
        {
          id: 'w5',
          title: 'Policy Distribution',
          type: 'pie',
          table: 'Policies',
          aggregation: 'count',
          groupBy: 'policy_type'
        },
        {
          id: 'w6',
          title: 'Premium by Policy Type',
          type: 'bar',
          table: 'Policies',
          aggregation: 'sum',
          column: 'premium_amount',
          groupBy: 'policy_type',
          limit: 10
        },
        {
          id: 'w7',
          title: 'Coverage by Policy Type',
          type: 'bar',
          table: 'Policies',
          aggregation: 'sum',
          column: 'coverage_amount',
          groupBy: 'policy_type',
          limit: 10
        },
        {
          id: 'w8',
          title: 'Top Policies by Premium',
          type: 'table',
          table: 'Policies',
          aggregation: 'max',
          column: 'premium_amount',
          groupBy: 'customer_name',
          limit: 10
        }
      ],
      filters: []
    }
  },
  {
    name: 'Customer Insights',
    description: 'Customer demographics and engagement metrics',
    config: {
      widgets: [
        {
          id: 'w1',
          title: 'Total Customers',
          type: 'kpi',
          table: 'Customers',
          aggregation: 'count'
        },
        {
          id: 'w2',
          title: 'Customers with Policies',
          type: 'kpi',
          table: 'Policies',
          aggregation: 'count',
          column: 'customer_id'
        },
        {
          id: 'w3',
          title: 'Total Agents',
          type: 'kpi',
          table: 'Agents',
          aggregation: 'count'
        },
        {
          id: 'w4',
          title: 'Customers by Policy Count',
          type: 'bar',
          table: 'Policies',
          aggregation: 'count',
          groupBy: 'customer_name',
          limit: 15
        },
        {
          id: 'w5',
          title: 'Top Customers by Premium Paid',
          type: 'table',
          table: 'Policies',
          aggregation: 'sum',
          column: 'premium_amount',
          groupBy: 'customer_name',
          limit: 20
        },
        {
          id: 'w6',
          title: 'Customer Coverage Distribution',
          type: 'bar',
          table: 'Policies',
          aggregation: 'sum',
          column: 'coverage_amount',
          groupBy: 'customer_name',
          limit: 10
        }
      ],
      filters: []
    }
  },
  {
    name: 'Revenue & Risk Analysis',
    description: 'Financial performance and risk exposure metrics',
    config: {
      widgets: [
        {
          id: 'w1',
          title: 'Total Premium Income',
          type: 'kpi',
          table: 'Policies',
          aggregation: 'sum',
          column: 'premium_amount'
        },
        {
          id: 'w2',
          title: 'Total Claims Paid',
          type: 'kpi',
          table: 'Claims',
          aggregation: 'sum',
          column: 'claim_amount'
        },
        {
          id: 'w3',
          title: 'Total Coverage Exposure',
          type: 'kpi',
          table: 'Policies',
          aggregation: 'sum',
          column: 'coverage_amount'
        },
        {
          id: 'w4',
          title: 'Average Claim Size',
          type: 'kpi',
          table: 'Claims',
          aggregation: 'avg',
          column: 'claim_amount'
        },
        {
          id: 'w5',
          title: 'Premium by Policy Type',
          type: 'bar',
          table: 'Policies',
          aggregation: 'sum',
          column: 'premium_amount',
          groupBy: 'policy_type',
          limit: 10
        },
        {
          id: 'w6',
          title: 'Risk Exposure by Policy Type',
          type: 'pie',
          table: 'Policies',
          aggregation: 'sum',
          column: 'coverage_amount',
          groupBy: 'policy_type'
        },
        {
          id: 'w7',
          title: 'Claims Trend Over Time',
          type: 'line',
          table: 'Claims',
          aggregation: 'sum',
          column: 'claim_amount',
          groupBy: "DATE_FORMAT(claim_date, '%Y-%m')",
          limit: 12
        },
        {
          id: 'w8',
          title: 'High-Value Policies',
          type: 'table',
          table: 'Policies',
          aggregation: 'max',
          column: 'coverage_amount',
          groupBy: 'customer_name',
          limit: 15
        }
      ],
      filters: []
    }
  }
];

async function createDashboards() {
  console.log('🚀 Creating demo dashboards...\n');
  
  try {
    // Clear existing dashboards to avoid duplicates
    await db.query('DELETE FROM Dashboards');
    console.log('✓ Cleared existing dashboards\n');
    
    for (const dashboard of dashboards) {
      const configJson = JSON.stringify(dashboard.config);
      
      await db.query(
        'INSERT INTO Dashboards (name, description, config) VALUES (?, ?, ?)',
        [dashboard.name, dashboard.description, configJson]
      );
      
      console.log(`✓ Created: ${dashboard.name}`);
      console.log(`  Description: ${dashboard.description}`);
      console.log(`  Widgets: ${dashboard.config.widgets.length}`);
      console.log('');
    }
    
    console.log('✅ Successfully created all dashboards!\n');
    console.log('📊 Dashboard Summary:');
    dashboards.forEach((d, i) => {
      console.log(`${i + 1}. ${d.name} - ${d.config.widgets.length} widgets`);
    });
    
  } catch (error) {
    console.error('❌ Error creating dashboards:', error.message);
    throw error;
  } finally {
    process.exit(0);
  }
}

createDashboards();
