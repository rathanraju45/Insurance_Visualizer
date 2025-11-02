import React, { useEffect, useState } from 'react';
import api from '../api';
import { ToastContainer } from './Toast';
import { useToast } from '../hooks/useToast';
import ConfirmDialog from './ConfirmDialog';
import { useConfirm } from '../hooks/useConfirm';
import { useAuth } from '../contexts/AuthContext';

const WIDGET_TYPES = [
  { id: 'kpi', label: 'KPI Card', icon: '📊', description: 'Single numeric value' },
  { id: 'bar', label: 'Bar Chart', icon: '📊', description: 'Vertical bars' },
  { id: 'pie', label: 'Pie Chart', icon: '🥧', description: 'Circular chart' },
  { id: 'line', label: 'Line Chart', icon: '📈', description: 'Trend over time' },
  { id: 'table', label: 'Summary Table', icon: '📋', description: 'Data grid' }
];

const AGGREGATIONS = [
  { id: 'count', label: 'Count (*)', requiresColumn: false },
  { id: 'sum', label: 'Sum', requiresColumn: true },
  { id: 'avg', label: 'Average', requiresColumn: true },
  { id: 'min', label: 'Minimum', requiresColumn: true },
  { id: 'max', label: 'Maximum', requiresColumn: true }
];

export default function DashboardEngine() {
  // Auth and permissions
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('dashboards', 'create');
  const canEdit = hasPermission('dashboards', 'edit');
  const canDelete = hasPermission('dashboards', 'delete');
  
  // Toast notifications and confirmation dialogs
  const toast = useToast();
  const { dialogState, confirm, handleConfirm, handleCancel } = useConfirm();
  
  // Dashboard state
  const [dashboards, setDashboards] = useState([]);
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  // Widgets and filters
  const [widgets, setWidgets] = useState([]);
  const [filters, setFilters] = useState([]);
  
  // UI state
  const [tables, setTables] = useState([]);
  const [tableSchemas, setTableSchemas] = useState({});
  const [showWidgetModal, setShowWidgetModal] = useState(false);
  const [editingWidget, setEditingWidget] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Widget form state
  const [widgetForm, setWidgetForm] = useState({
    type: 'kpi',
    title: '',
    table: '',
    aggregation: 'count',
    column: '',
    groupBy: '',
    limit: 10,
    columns: [] // For table widget multi-column selection
  });

  useEffect(() => {
    loadDashboards();
    loadTables();
  }, []);

  async function loadDashboards() {
    try {
      const r = await api.dashboards.list(1, 100);
      setDashboards(r.data || []);
    } catch (e) {
      toast.error(`Failed to load dashboards: ${e.message}`);
    }
  }

  async function loadTables() {
    try {
      const r = await api.db.listTables();
      setTables(r.data || []);
      // Load schemas for all tables
      for (const table of r.data || []) {
        const schema = await api.db.getSchema(table);
        setTableSchemas(prev => ({ ...prev, [table]: schema }));
      }
    } catch (e) {
      console.error('Failed to load tables', e);
    }
  }

  function startNew() {
    setSelected(null);
    setName('');
    setDescription('');
    setWidgets([]);
    setFilters([]);
  }

  function editDashboard(d) {
    setSelected(d);
    setName(d.name || '');
    setDescription(d.description || '');
    const config = typeof d.config === 'string' ? JSON.parse(d.config) : d.config;
    setWidgets(config?.widgets || []);
    setFilters(config?.filters || []);
    toast.info(`Loaded dashboard: ${d.name}`);
  }

  async function saveDashboard() {
    try {
      if (!name.trim()) {
        toast.warning('Dashboard name is required');
        return;
      }

      const config = {
        widgets,
        filters
      };

      const payload = {
        name,
        description,
        config
      };

      if (selected) {
        await api.dashboards.update(selected.dashboard_id, payload);
        toast.success(`Dashboard "${name}" updated successfully`);
      } else {
        await api.dashboards.create(payload);
        toast.success(`Dashboard "${name}" created successfully`);
      }

      startNew();
      loadDashboards();
    } catch (e) {
      console.error('Save error:', e);
      toast.error(`Save failed: ${e.message}`);
    }
  }

  async function deleteDashboard(d) {
    const confirmed = await confirm({
      title: 'Delete Dashboard',
      message: `Are you sure you want to delete "${d.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      danger: true
    });
    
    if (!confirmed) return;
    
    try {
      await api.dashboards.remove(d.dashboard_id);
      toast.success(`Dashboard "${d.name}" deleted`);
      loadDashboards();
      if (selected && selected.dashboard_id === d.dashboard_id) {
        startNew();
      }
    } catch (e) {
      toast.error(`Delete failed: ${e.message}`);
    }
  }

  function openWidgetModal(widget = null, index = null) {
    if (widget) {
      setEditingWidget(index);
      // Handle columns - convert string to array if needed
      const columns = Array.isArray(widget.columns) 
        ? widget.columns 
        : (widget.columns ? widget.columns.split(',') : []);
      setWidgetForm({ ...widget, columns });
    } else {
      setEditingWidget(null);
      setWidgetForm({
        type: 'kpi',
        title: '',
        table: tables[0] || '',
        aggregation: 'count',
        column: '',
        groupBy: '',
        limit: 10,
        columns: []
      });
    }
    setShowWidgetModal(true);
  }

  function saveWidget() {
    if (!widgetForm.title.trim()) {
      toast.warning('Widget title is required');
      return;
    }
    if (!widgetForm.table) {
      toast.warning('Table is required');
      return;
    }
    
    // For table widgets, validate columns
    if (widgetForm.type === 'table' && (!widgetForm.columns || widgetForm.columns.length === 0)) {
      toast.warning('Please select at least one column for table widget');
      return;
    }

    const widget = { ...widgetForm };

    if (editingWidget !== null) {
      setWidgets(prev => prev.map((w, i) => i === editingWidget ? widget : w));
      toast.success(`Widget "${widget.title}" updated`);
    } else {
      setWidgets(prev => [...prev, widget]);
      toast.success(`Widget "${widget.title}" added`);
    }

    setShowWidgetModal(false);
    setEditingWidget(null);
  }

  async function removeWidget(index) {
    const widget = widgets[index];
    const confirmed = await confirm({
      title: 'Remove Widget',
      message: `Remove "${widget.title}" from dashboard?`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      danger: true
    });
    
    if (!confirmed) return;
    
    setWidgets(prev => prev.filter((_, i) => i !== index));
    toast.success('Widget removed');
  }

  function addFilter() {
    setFilters(prev => [...prev, {
      column: '',
      table: tables[0] || '',
      operator: 'equals',
      defaultValue: ''
    }]);
  }

  function updateFilter(index, patch) {
    setFilters(prev => prev.map((f, i) => i === index ? { ...f, ...patch } : f));
  }

  function removeFilter(index) {
    setFilters(prev => prev.filter((_, i) => i !== index));
  }

  const selectedSchema = widgetForm.table ? tableSchemas[widgetForm.table] : null;
  const availableColumns = selectedSchema?.columns || [];

  return (
    <div className="db-engine">
      {/* Toast Notifications */}
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
      
      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        danger={dialogState.danger}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      
      {/* Sidebar */}
      <div className="db-sidebar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h4 style={{ margin: 0 }}>📊 Dashboards</h4>
          <button className="btn small primary" onClick={startNew}>➕ New</button>
        </div>

        <div className="db-table-list">
          {dashboards.map(d => (
            <div key={d.dashboard_id} style={{ marginBottom: 8, position: 'relative' }}>
              <button
                className={selected && selected.dashboard_id === d.dashboard_id ? 'active' : ''}
                onClick={() => editDashboard(d)}
                style={{ width: '100%', paddingRight: canDelete ? '36px' : '8px', textAlign: 'left' }}
              >
                📊 {d.name}
              </button>
              {canDelete && (
                <button
                  className="btn small danger"
                  onClick={(e) => { e.stopPropagation(); deleteDashboard(d); }}
                  style={{ 
                    position: 'absolute',
                    right: '4px',
                    top: '4px',
                    width: '28px',
                    height: '28px',
                    padding: '0',
                    fontSize: '14px',
                    lineHeight: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Delete dashboard"
                >
                  🗑️
                </button>
              )}
            </div>
          ))}
          {dashboards.length === 0 && (
            <div className="db-empty" style={{ fontSize: 12, padding: 20 }}>
              No dashboards yet
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="db-main">
        {/* Dashboard Info */}
        <div className="db-card">
          <h4>📊 Dashboard Configuration</h4>
          
          <div className="db-form-grid" style={{ gridTemplateColumns: '1fr', gap: 16, maxHeight: 'none', padding: 0, border: 'none', background: 'transparent' }}>
            <div className="db-form-field">
              <label>Dashboard Name <span style={{ color: '#dc3545' }}>*</span></label>
              <input
                type="text"
                placeholder="e.g., Sales Overview, Claims Analysis"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className="db-form-field">
              <label>Description</label>
              <textarea
                placeholder="Brief description of this dashboard..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          <div className="db-actions">
            {(canCreate || canEdit) && (
              <>
                <button className="btn" onClick={startNew}>Clear</button>
                <button className="btn primary" onClick={saveDashboard}>💾 Save Dashboard</button>
              </>
            )}
          </div>
        </div>

        {/* Widgets */}
        <div className="db-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h5 style={{ margin: 0 }}>📊 Widgets ({widgets.length})</h5>
            {(canCreate || canEdit) && (
              <button className="btn primary" onClick={() => openWidgetModal()}>➕ Add Widget</button>
            )}
          </div>

          {widgets.length === 0 ? (
            <div className="db-empty">
              No widgets added yet. Click "Add Widget" to create visualizations.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
              {widgets.map((w, idx) => (
                <div key={idx} className="db-card" style={{ padding: 16, background: '#f8f9fa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 20, marginBottom: 4 }}>
                        {WIDGET_TYPES.find(t => t.id === w.type)?.icon || '📊'}
                      </div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{w.title}</div>
                      <div style={{ fontSize: 11, color: '#6c757d' }}>
                        {WIDGET_TYPES.find(t => t.id === w.type)?.label}
                      </div>
                    </div>
                    {(canEdit || canDelete) && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        {canEdit && <button className="btn small" onClick={() => openWidgetModal(w, idx)}>✏️</button>}
                        {canDelete && <button className="btn small danger" onClick={() => removeWidget(idx)}>🗑️</button>}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#495057', marginTop: 8, borderTop: '1px solid #dee2e6', paddingTop: 8 }}>
                    <div><strong>Table:</strong> {w.table}</div>
                    {w.type === 'table' ? (
                      <>
                        <div><strong>Columns:</strong> {Array.isArray(w.columns) ? w.columns.join(', ') : w.columns}</div>
                        {w.limit && <div><strong>Limit:</strong> {w.limit} rows</div>}
                      </>
                    ) : (
                      <>
                        <div><strong>Aggregation:</strong> {AGGREGATIONS.find(a => a.id === w.aggregation)?.label}</div>
                        {w.column && <div><strong>Column:</strong> {w.column}</div>}
                        {w.groupBy && <div><strong>Group By:</strong> {w.groupBy}</div>}
                        {w.limit && <div><strong>Limit:</strong> {w.limit}</div>}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="db-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h5 style={{ margin: 0 }}>🔍 Filters ({filters.length})</h5>
            <button className="btn" onClick={addFilter}>➕ Add Filter</button>
          </div>

          {filters.length === 0 ? (
            <div className="db-empty" style={{ padding: 20 }}>
              No filters configured. Filters allow users to dynamically filter dashboard data.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filters.map((f, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 12, alignItems: 'end', padding: 12, background: '#f8f9fa', borderRadius: 6 }}>
                  <div className="db-form-field">
                    <label style={{ fontSize: 11 }}>Table</label>
                    <select value={f.table} onChange={e => updateFilter(idx, { table: e.target.value, column: '' })}>
                      {tables.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="db-form-field">
                    <label style={{ fontSize: 11 }}>Column</label>
                    <select value={f.column} onChange={e => updateFilter(idx, { column: e.target.value })}>
                      <option value="">Select column...</option>
                      {(tableSchemas[f.table]?.columns || []).map(c => (
                        <option key={c.COLUMN_NAME} value={c.COLUMN_NAME}>{c.COLUMN_NAME}</option>
                      ))}
                    </select>
                  </div>
                  <div className="db-form-field">
                    <label style={{ fontSize: 11 }}>Operator</label>
                    <select value={f.operator} onChange={e => updateFilter(idx, { operator: e.target.value })}>
                      <option value="equals">=  Equals</option>
                      <option value="not_equals">≠  Not Equals</option>
                      <option value="greater">&gt;  Greater Than</option>
                      <option value="less">&lt;  Less Than</option>
                      <option value="contains">Contains</option>
                    </select>
                  </div>
                  <div className="db-form-field">
                    <label style={{ fontSize: 11 }}>Default Value</label>
                    <input
                      type="text"
                      placeholder="default..."
                      value={f.defaultValue}
                      onChange={e => updateFilter(idx, { defaultValue: e.target.value })}
                    />
                  </div>
                  <button className="btn small danger" onClick={() => removeFilter(idx)}>🗑️</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Widget Modal */}
      {showWidgetModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="db-card" style={{ width: 600, maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h4 style={{ margin: 0 }}>{editingWidget !== null ? 'Edit Widget' : 'Add Widget'}</h4>
              <button className="btn small" onClick={() => setShowWidgetModal(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="db-form-field">
                <label>Widget Type <span style={{ color: '#dc3545' }}>*</span></label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8 }}>
                  {WIDGET_TYPES.map(type => (
                    <button
                      key={type.id}
                      className={`btn ${widgetForm.type === type.id ? 'primary' : ''}`}
                      onClick={() => setWidgetForm({ ...widgetForm, type: type.id })}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 12, height: 'auto' }}
                    >
                      <div style={{ fontSize: 24, marginBottom: 4 }}>{type.icon}</div>
                      <div style={{ fontSize: 11 }}>{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="db-form-field">
                <label>Widget Title <span style={{ color: '#dc3545' }}>*</span></label>
                <input
                  type="text"
                  placeholder="e.g., Total Revenue, Claims by Status"
                  value={widgetForm.title}
                  onChange={e => setWidgetForm({ ...widgetForm, title: e.target.value })}
                />
              </div>

              <div className="db-form-field">
                <label>Table <span style={{ color: '#dc3545' }}>*</span></label>
                <select value={widgetForm.table} onChange={e => setWidgetForm({ ...widgetForm, table: e.target.value, column: '', groupBy: '' })}>
                  <option value="">Select table...</option>
                  {tables.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="db-form-field">
                <label>Aggregation <span style={{ color: '#dc3545' }}>*</span></label>
                <select value={widgetForm.aggregation} onChange={e => setWidgetForm({ ...widgetForm, aggregation: e.target.value })}>
                  {AGGREGATIONS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                </select>
                {widgetForm.aggregation === 'count' && (
                  <div style={{ fontSize: 12, color: '#6c757d', marginTop: 4, fontStyle: 'italic' }}>
                    ℹ️ COUNT(*) counts all rows - no column needed
                  </div>
                )}
              </div>

              {widgetForm.aggregation !== 'count' && (
                <div className="db-form-field">
                  <label>Column {widgetForm.aggregation !== 'count' && <span style={{ color: '#dc3545' }}>*</span>}</label>
                  <select value={widgetForm.column} onChange={e => setWidgetForm({ ...widgetForm, column: e.target.value })}>
                    <option value="">Select column...</option>
                    {availableColumns.map(c => (
                      <option key={c.COLUMN_NAME} value={c.COLUMN_NAME}>{c.COLUMN_NAME} ({c.COLUMN_TYPE})</option>
                    ))}
                  </select>
                </div>
              )}

              {widgetForm.type === 'table' ? (
                <>
                  <div className="db-form-field">
                    <label>Columns to Display <span style={{ color: '#dc3545' }}>*</span></label>
                    <div style={{ 
                      border: '1px solid #ced4da', 
                      borderRadius: 4, 
                      padding: 12, 
                      maxHeight: 200, 
                      overflowY: 'auto',
                      background: 'white'
                    }}>
                      {availableColumns.length === 0 ? (
                        <div style={{ color: '#6c757d', fontSize: 12, textAlign: 'center', padding: 8 }}>
                          Select a table first
                        </div>
                      ) : (
                        availableColumns.map(c => (
                          <label 
                            key={c.COLUMN_NAME} 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              padding: '6px 8px',
                              cursor: 'pointer',
                              borderRadius: 4,
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f8f9fa'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <input
                              type="checkbox"
                              checked={widgetForm.columns?.includes(c.COLUMN_NAME)}
                              onChange={e => {
                                const cols = widgetForm.columns || [];
                                if (e.target.checked) {
                                  setWidgetForm({ ...widgetForm, columns: [...cols, c.COLUMN_NAME] });
                                } else {
                                  setWidgetForm({ ...widgetForm, columns: cols.filter(col => col !== c.COLUMN_NAME) });
                                }
                              }}
                              style={{ marginRight: 8 }}
                            />
                            <span style={{ flex: 1 }}>{c.COLUMN_NAME}</span>
                            <span style={{ fontSize: 11, color: '#6c757d' }}>({c.COLUMN_TYPE})</span>
                          </label>
                        ))
                      )}
                    </div>
                    {widgetForm.columns && widgetForm.columns.length > 0 && (
                      <div style={{ marginTop: 8, fontSize: 12, color: '#28a745' }}>
                        ✓ {widgetForm.columns.length} column(s) selected
                      </div>
                    )}
                  </div>
                  
                  <div className="db-form-field">
                    <label>Limit Rows</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={widgetForm.limit}
                      onChange={e => setWidgetForm({ ...widgetForm, limit: parseInt(e.target.value) || 10 })}
                    />
                    <div style={{ fontSize: 12, color: '#6c757d', marginTop: 4 }}>
                      Maximum number of rows to display
                    </div>
                  </div>
                </>
              ) : widgetForm.type !== 'kpi' && (
                <>
                  <div className="db-form-field">
                    <label>Group By (for charts)</label>
                    <select value={widgetForm.groupBy} onChange={e => setWidgetForm({ ...widgetForm, groupBy: e.target.value })}>
                      <option value="">No grouping</option>
                      {availableColumns.map(c => (
                        <option key={c.COLUMN_NAME} value={c.COLUMN_NAME}>{c.COLUMN_NAME}</option>
                      ))}
                    </select>
                    <div style={{ fontSize: 12, color: '#6c757d', marginTop: 4 }}>
                      ℹ️ Or enter custom SQL: DATE_FORMAT(start_date, "%Y-%m")
                    </div>
                  </div>
                  
                  <div className="db-form-field">
                    <label>Custom Group By (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., DATE_FORMAT(start_date, &quot;%Y-%m&quot;)"
                      value={widgetForm.groupBy}
                      onChange={e => setWidgetForm({ ...widgetForm, groupBy: e.target.value })}
                    />
                    <div style={{ fontSize: 12, color: '#6c757d', marginTop: 4 }}>
                      Use for date functions like YEAR(), MONTH(), DATE(), WEEK()
                    </div>
                  </div>
                  
                  <div className="db-form-field">
                    <label>Limit Results</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={widgetForm.limit}
                      onChange={e => setWidgetForm({ ...widgetForm, limit: parseInt(e.target.value) || 10 })}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="db-actions" style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #dee2e6' }}>
              <button className="btn" onClick={() => setShowWidgetModal(false)}>Cancel</button>
              <button className="btn primary" onClick={saveWidget}>
                {editingWidget !== null ? '💾 Update Widget' : '➕ Add Widget'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
