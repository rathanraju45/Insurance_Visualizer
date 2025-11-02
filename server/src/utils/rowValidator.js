// Simple per-row validator & sanitizer for CSV/XLSX import rows

function isEmpty(v){ return v === null || v === undefined || String(v).trim() === ''; }

function validateCustomer(row){
  const errors = [];
  const data = {};
  data.full_name = row.full_name || row.name || row.fullName || null;
  if (isEmpty(data.full_name)) errors.push('full_name required');
  data.email = row.email || null;
  if (data.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(data.email))) errors.push('invalid email');
  data.date_of_birth = row.date_of_birth || row.dob || null;
  data.phone_number = row.phone_number || row.phone || null;
  data.address = row.address || null;
  return { valid: errors.length===0, errors, data };
}

function validateAgent(row){
  const errors = [];
  const data = {};
  data.full_name = row.full_name || row.name || null;
  if (isEmpty(data.full_name)) errors.push('full_name required');
  data.email = row.email || null;
  if (data.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(data.email))) errors.push('invalid email');
  data.phone_number = row.phone_number || row.phone || null;
  return { valid: errors.length===0, errors, data };
}

function validatePolicy(row){
  const errors = [];
  const data = {};
  data.policy_type = row.policy_type || row.type || null;
  data.premium_amount = row.premium_amount || row.premium || null;
  if (!isEmpty(data.premium_amount) && isNaN(Number(data.premium_amount))) errors.push('premium_amount must be numeric');
  data.coverage_amount = row.coverage_amount || row.coverage || null;
  if (!isEmpty(data.coverage_amount) && isNaN(Number(data.coverage_amount))) errors.push('coverage_amount must be numeric');
  data.start_date = row.start_date || null;
  data.end_date = row.end_date || null;
  data.customer_name = row.customer_name || null;
  data.customer_id = row.customer_id || null;
  if (data.customer_id && isNaN(Number(data.customer_id))) errors.push('customer_id must be numeric');
  data.status = row.status || null;
  return { valid: errors.length===0, errors, data };
}

function validateClaim(row){
  const errors = [];
  const data = {};
  data.policy_id = row.policy_id || null;
  if (isEmpty(data.policy_id) || isNaN(Number(data.policy_id))) errors.push('policy_id required and must be numeric');
  data.claim_date = row.claim_date || null;
  data.claim_amount = row.claim_amount || row.amount || null;
  if (!isEmpty(data.claim_amount) && isNaN(Number(data.claim_amount))) errors.push('claim_amount must be numeric');
  data.status = row.status || null;
  data.reason = row.reason || null;
  return { valid: errors.length===0, errors, data };
}

function validateDashboard(row){
  const errors = [];
  const data = {};
  data.name = row.name || null;
  if (isEmpty(data.name)) errors.push('name required');
  data.config = row.config || null;
  return { valid: errors.length===0, errors, data };
}

function validateRow(entity, row){
  switch(entity){
    case 'customer': return validateCustomer(row);
    case 'agent': return validateAgent(row);
    case 'policy': return validatePolicy(row);
    case 'claim': return validateClaim(row);
    case 'dashboard': return validateDashboard(row);
    default: return { valid:true, errors:[], data: row };
  }
}

module.exports = { validateRow };
