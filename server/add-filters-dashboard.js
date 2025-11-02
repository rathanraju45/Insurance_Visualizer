const API_BASE = 'http://localhost:3000/api';

async function addFilters() {
  console.log('🔍 Adding filters to Executive Summary dashboard...\n');

  try {
    // First, get all dashboards to find Executive Summary
    const listResponse = await fetch(`${API_BASE}/dashboards?page=1&limit=100`);
    const dashboards = await listResponse.json();
    
    const executiveSummary = dashboards.data.find(d => d.name === 'Executive Summary');
    
    if (!executiveSummary) {
      console.error('❌ Executive Summary dashboard not found!');
      return;
    }

    console.log(`✓ Found Executive Summary (ID: ${executiveSummary.id})`);

    // Parse current config
    const currentConfig = typeof executiveSummary.config === 'string' 
      ? JSON.parse(executiveSummary.config) 
      : executiveSummary.config;

    // Add filters to the config
    const updatedConfig = {
      ...currentConfig,
      filters: [
        {
          table: 'Policies',
          column: 'policy_type',
          label: 'Policy Type',
          type: 'text',
          defaultValue: ''
        },
        {
          table: 'Policies',
          column: 'start_date',
          label: 'Policy Start Date (From)',
          type: 'date',
          defaultValue: ''
        },
        {
          table: 'Policies',
          column: 'start_date',
          label: 'Policy Start Date (To)',
          type: 'date',
          operator: '<=',
          defaultValue: ''
        },
        {
          table: 'Customers',
          column: 'full_name',
          label: 'Customer Name',
          type: 'text',
          defaultValue: ''
        }
      ]
    };

    // Update the dashboard
    const updateResponse = await fetch(`${API_BASE}/dashboards/${executiveSummary.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: executiveSummary.name,
        description: executiveSummary.description,
        config: updatedConfig
      })
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.json();
      throw new Error(error.error || `HTTP ${updateResponse.status}`);
    }

    const result = await updateResponse.json();
    console.log('\n✅ Successfully added filters to Executive Summary!');
    console.log('\n📋 Filters added:');
    console.log('   1. Policy Type (text filter)');
    console.log('   2. Policy Start Date - From (date filter)');
    console.log('   3. Policy Start Date - To (date filter)');
    console.log('   4. Customer Name (text filter)');
    console.log('\n💡 Go to "View Dashboards" → Select "Executive Summary" to see the filters!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  }
}

addFilters().catch(err => {
  console.error('\n💥 Fatal error:', err.message);
  process.exit(1);
});
