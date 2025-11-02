const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function req(path, opts = {}){
  const headers = { 'Content-Type':'application/json', ...getAuthHeaders(), ...(opts.headers || {}) };
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  if (!res.ok) {
    const text = await res.text();
    console.error('API Error Response:', text);
    // Try to parse as JSON to get the actual error message
    try {
      const errorJson = JSON.parse(text);
      throw new Error(errorJson.error || text || res.statusText);
    } catch (parseError) {
      throw new Error(text || res.statusText);
    }
  }
  if (res.status === 204) return null;
  return res.json();
}

export const customers = {
  list: (page = 1, limit = 25) => req(`/customers?page=${page}&limit=${limit}`),
  get: (id) => req(`/customers/${id}`),
  create: (data) => req('/customers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => req(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => req(`/customers/${id}`, { method: 'DELETE' })
};

customers.upload = async (file) => {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${API_BASE}/customers/import`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const agents = {
  list: (page = 1, limit = 25) => req(`/agents?page=${page}&limit=${limit}`),
  get: (id) => req(`/agents/${id}`),
  create: (data) => req('/agents', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => req(`/agents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => req(`/agents/${id}`, { method: 'DELETE' })
};

agents.upload = async (file) => {
  const fd = new FormData(); fd.append('file', file);
  const res = await fetch(`${API_BASE}/agents/import`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const policies = {
  list: (page = 1, limit = 25) => req(`/policies?page=${page}&limit=${limit}`),
  get: (id) => req(`/policies/${id}`),
  create: (data) => req('/policies', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => req(`/policies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => req(`/policies/${id}`, { method: 'DELETE' })
};

policies.upload = async (file) => {
  const fd = new FormData(); fd.append('file', file);
  const res = await fetch(`${API_BASE}/policies/import`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const claims = {
  list: (page = 1, limit = 25) => req(`/claims?page=${page}&limit=${limit}`),
  get: (id) => req(`/claims/${id}`),
  create: (data) => req('/claims', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => req(`/claims/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => req(`/claims/${id}`, { method: 'DELETE' })
};

claims.upload = async (file) => {
  const fd = new FormData(); fd.append('file', file);
  const res = await fetch(`${API_BASE}/claims/import`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const dashboards = {
  list: (page = 1, limit = 25) => req(`/dashboards?page=${page}&limit=${limit}`),
  get: (id) => req(`/dashboards/${id}`),
  create: (data) => req('/dashboards', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => req(`/dashboards/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => req(`/dashboards/${id}`, { method: 'DELETE' }),
  run: (id) => req(`/dashboards/${id}/run`, { method: 'POST' })
};

export const db = {
  listTables: () => req('/db/tables'),
  getSchema: (table) => req(`/db/tables/${encodeURIComponent(table)}/schema`),
  createTable: (payload) => req('/db/tables', { method: 'POST', body: JSON.stringify(payload) }),
  dropTable: (table) => req(`/db/tables/${encodeURIComponent(table)}`, { method: 'DELETE' }),
  listRows: (table, page=1, limit=25) => req(`/db/tables/${encodeURIComponent(table)}/rows?page=${page}&limit=${limit}`),
  insertRow: (table, data) => req(`/db/tables/${encodeURIComponent(table)}/rows`, { method: 'POST', body: JSON.stringify(data) }),
  updateRow: (table, pk, id, data) => req(`/db/tables/${encodeURIComponent(table)}/rows/${encodeURIComponent(pk)}/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRow: (table, pk, id) => req(`/db/tables/${encodeURIComponent(table)}/rows/${encodeURIComponent(pk)}/${encodeURIComponent(id)}`, { method: 'DELETE' })
};

db.previewUpload = async (table, file) => {
  const fd = new FormData();
  fd.append('file', file);
  const headers = getAuthHeaders();
  const res = await fetch(`${API_BASE}/db/tables/${encodeURIComponent(table)}/import/preview`, { 
    method: 'POST', 
    headers,
    body: fd 
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

db.upload = async (table, file) => {
  const fd = new FormData();
  fd.append('file', file);
  const headers = getAuthHeaders(); // Add auth headers but not Content-Type (FormData sets it automatically)
  const res = await fetch(`${API_BASE}/db/tables/${encodeURIComponent(table)}/import`, { 
    method: 'POST', 
    headers,
    body: fd 
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export default { customers, agents, policies, claims, dashboards, db };
