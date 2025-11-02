import React, { useEffect, useState } from 'react';
import api from '../api';
import './DatabaseEngine.css';
import { ToastContainer } from './Toast';
import { useToast } from '../hooks/useToast';
import ConfirmDialog from './ConfirmDialog';
import { useConfirm } from '../hooks/useConfirm';
import Pagination from './Pagination';
import { useAuth } from '../contexts/AuthContext';

export default function DatabaseEngine({ initialTable }){
  const { hasPermission } = useAuth();
  const toast = useToast();
  const { dialogState, confirm, handleConfirm, handleCancel } = useConfirm();
  
  const canCreate = hasPermission('databaseEngine', 'create');
  const canEdit = hasPermission('databaseEngine', 'edit');
  const canDelete = hasPermission('databaseEngine', 'delete');
  const [tables, setTables] = useState([]);
  const [selected, setSelected] = useState(null);
  const [schema, setSchema] = useState(null);
  const [rows, setRows] = useState([]);
  const [pageInfo, setPageInfo] = useState({page:1,limit:25,total:0});
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingRow, setEditingRow] = useState(null);
  const [showCreateTable, setShowCreateTable] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createColumns, setCreateColumns] = useState([
    { name: '', type: 'INT', nullable: false, pk: true, autoIncrement: true }
  ]);
  const [importResult, setImportResult] = useState(null);
  const [showImportReport, setShowImportReport] = useState(false);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [importPreviewData, setImportPreviewData] = useState(null);
  const [activeView, setActiveView] = useState('data'); // 'schema', 'insert', 'data'

  // Helper function to format dates for display
  const formatDateForDisplay = (value, columnType) => {
    if (!value) return '';
    const type = (columnType || '').toLowerCase();
    
    // Check if it's a date/datetime/timestamp column
    if (type.includes('date') || type.includes('timestamp')) {
      try {
        const date = new Date(value);
        if (isNaN(date.getTime())) return String(value);
        
        // For DATE type, show only the date
        if (type === 'date') {
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        }
        
        // For DATETIME/TIMESTAMP, show date and time
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      } catch (e) {
        return String(value);
      }
    }
    
    return String(value);
  };

  // Helper to get column type by name
  const getColumnType = (columnName) => {
    if (!schema || !schema.columns) return '';
    const col = schema.columns.find(c => c.COLUMN_NAME === columnName);
    return col ? col.COLUMN_TYPE : '';
  };

  useEffect(()=>{ fetchTables(); }, []);

  // respond to initialTable prop changes coming from App (open in DB Engine)
  useEffect(()=>{
    if (initialTable) {
      // if tables are already loaded, select immediately, otherwise ensure fetchTables will auto-select
      if (tables && tables.length) selectTable(initialTable);
      else setTimeout(()=> selectTable(initialTable), 100);
    }
  }, [initialTable]);

  async function fetchTables(){
    setLoading(true);
    try{
      const res = await api.db.listTables();
      const list = res.data || res;
      setTables(list);
      // auto-select first table when none selected
      if ((!selected || selected === null) && Array.isArray(list) && list.length > 0) {
        // delay slightly to avoid React state conflicts
        setTimeout(()=> selectTable(list[0]), 0);
      }
    }catch(e){ toast.error(String(e)); }
    setLoading(false);
  }

  async function selectTable(t){
    setSelected(t);
    setSchema(null);
    setRows([]);
    setPageInfo({page:1,limit:25,total:0});
    setEditingRow(null);
    setShowCreateTable(false);
    setLoading(true);
    try{
      const s = await api.db.getSchema(t);
      setSchema(s);
      const r = await api.db.listRows(t, 1, 25);
      setRows(r.data || []);
      setPageInfo({ page: r.page || 1, limit: r.limit || 25, total: r.total || 0 });
      if (s && s.columns) {
        const obj = {};
        s.columns.forEach(c => { obj[c.COLUMN_NAME] = ''; });
        setFormData(obj);
      }
    }catch(e){ toast.error(String(e)); }
    setLoading(false);
  }

  async function dropTable(){
    if (!selected) return;
    
    const confirmed = await confirm({
      title: 'Drop Table',
      message: `Are you sure you want to drop table "${selected}"? This action cannot be undone and will permanently delete all data in this table.`,
      confirmText: 'Drop Table',
      cancelText: 'Cancel',
      danger: true
    });
    
    if (!confirmed) return;
    
    try{
      await api.db.dropTable(selected);
      toast.success(`Dropped table ${selected}`);
      setSelected(null);
      setSchema(null);
      setRows([]);
      fetchTables();
    }catch(e){ toast.error(String(e)); }
  }

  async function createTable(){
    try{
      if(!createName.trim()) return toast.warning('Table name is required');
      if(!/^[A-Za-z0-9_]+$/.test(createName)) return toast.warning('Table name may only contain letters, numbers, and underscore');
      if(!createColumns.length) return toast.warning('At least one column is required');
      
      // Validate column names
      for(let i = 0; i < createColumns.length; i++){
        if(!createColumns[i].name.trim()) return toast.warning(`Column ${i+1} name is required`);
        if(!/^[A-Za-z0-9_]+$/.test(createColumns[i].name)) return toast.warning(`Column "${createColumns[i].name}" may only contain letters, numbers, and underscore`);
      }
      
      const payload = { name: createName, columns: createColumns.map(c=>({ name: c.name, type: c.type, nullable: !!c.nullable, pk: !!c.pk, autoIncrement: !!c.autoIncrement })) };
      await api.db.createTable(payload);
      toast.success(`Table "${createName}" created successfully`);
      setCreateName('');
      setCreateColumns([{ name: '', type: 'INT', nullable:false, pk:true, autoIncrement:true }]);
      setShowCreateTable(false);
      fetchTables();
    }catch(err){ toast.error(String(err)); }
  }

  async function insertRow(){
    if (!selected) return toast.warning('Select a table first');
    try{
      await api.db.insertRow(selected, formData);
      toast.success('Row inserted successfully');
      setFormData(prev => {
        const next = { ...prev };
        if (schema && schema.columns) {
          schema.columns.forEach(c => {
            const isAI = (c.EXTRA || '').toLowerCase().includes('auto_increment');
            if (!isAI && !(c.COLUMN_KEY === 'PRI' && isAI)) next[c.COLUMN_NAME] = '';
          });
        }
        return next;
      });
      selectTable(selected);
    }catch(e){ toast.error(String(e)); }
  }

  async function updateRow(){
    if (!selected || !editingRow) return toast.warning('No row selected for edit');
    try{
      const pk = schema && schema.primaryKey ? schema.primaryKey : Object.keys(editingRow)[0];
      const id = editingRow[pk];
      await api.db.updateRow(selected, pk, id, formData);
      toast.success('Row updated successfully');
      setEditingRow(null);
      selectTable(selected);
    }catch(e){ toast.error(String(e)); }
  }

  async function removeRow(pk, id){
    if (!selected) return;
    
    const confirmed = await confirm({
      title: 'Delete Row',
      message: `Delete row with ${pk} = ${id}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      danger: true
    });
    
    if (!confirmed) return;
    
    try{
      await api.db.deleteRow(selected, pk, id);
      toast.success('Row deleted');
      selectTable(selected);
    }catch(e){ toast.error(String(e)); }
  }

  function startEdit(row){
    setEditingRow(row);
    if (schema && schema.columns){
      const obj={};
      schema.columns.forEach(c=>{ obj[c.COLUMN_NAME] = row[c.COLUMN_NAME] ?? ''; });
      setFormData(obj);
    } else {
      setFormData(row);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit(){
    setEditingRow(null);
    if (schema && schema.columns){
      const obj={};
      schema.columns.forEach(c=>obj[c.COLUMN_NAME]='');
      setFormData(obj);
    }
  }

  async function loadPage(p){
    if (!selected) return;
    setLoading(true);
    try{
      const r = await api.db.listRows(selected, p, pageInfo.limit);
      setRows(r.data || []);
      setPageInfo({ page: r.page || p, limit: r.limit || pageInfo.limit, total: r.total || 0 });
    }catch(e){ toast.error(String(e)); }
    setLoading(false);
  }

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
        <div style={{marginBottom:20}}>
          <h4 style={{margin:0,marginBottom:12,fontSize:16,color:'#212529'}}>📊 Database Tables</h4>
          <button className="btn primary" style={{width:'100%'}} onClick={()=>{setShowCreateTable(!showCreateTable); setSelected(null); setSchema(null); setRows([]);}}>
            ➕ Create New Table
          </button>
        </div>
        
        <button className="btn small" onClick={fetchTables} style={{width:'100%',marginBottom:12}}>🔄 Refresh</button>
        
        {loading && <div style={{textAlign:'center',color:'#6c757d',fontSize:13}}>Loading...</div>}
        
        <ul className="db-table-list">
          {tables.map(t=> (
            <li key={t}>
              <button className={selected === t ? 'active' : ''} onClick={()=>selectTable(t)}>
                🗂️ {t}
              </button>
            </li>
          ))}
        </ul>
        
        {tables.length === 0 && !loading && (
          <div className="db-empty" style={{fontSize:13}}>No tables found</div>
        )}
      </div>

      {/* Main Content */}
      <div className="db-main">
        {/* Create Table Form */}
        {showCreateTable && canCreate && (
          <div className="db-card">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <h4 style={{margin:0}}>➕ Create New Table</h4>
              <button className="btn small" onClick={()=>{setShowCreateTable(false); setCreateName(''); setCreateColumns([{ name: '', type: 'INT', nullable: false, pk: true, autoIncrement: true }]); if(tables.length) selectTable(tables[0]);}}>✕ Close</button>
            </div>
            
            <div className="db-form-field" style={{marginBottom:24}}>
              <label>Table Name <span style={{color:'#dc3545'}}>*</span></label>
              <input
                type="text"
                placeholder="e.g., users, products, orders"
                value={createName}
                onChange={e=>setCreateName(e.target.value)}
                style={{fontSize:14,padding:'10px 12px'}}
              />
              <small style={{fontSize:11,color:'#6c757d',marginTop:4}}>Only letters, numbers, and underscores allowed</small>
            </div>

            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <h5 style={{margin:0}}>Table Columns <span style={{color:'#dc3545'}}>*</span></h5>
              <button className="btn small primary" onClick={()=> setCreateColumns([...createColumns, { name: '', type: 'VARCHAR(255)', nullable: true, pk:false, autoIncrement:false }])}>
                ➕ Add Column
              </button>
            </div>
            
            <div className="db-column-editor-modern">
              <div className="db-column-header">
                <span>Column Name</span>
                <span>Data Type</span>
                <span>Nullable</span>
                <span>Primary Key</span>
                <span>Auto Increment</span>
                <span></span>
              </div>
              {createColumns.map((col, idx)=> (
                <div key={idx} className="db-column-row-modern">
                  <input
                    type="text"
                    placeholder="e.g., id, name, email"
                    value={col.name}
                    onChange={e=>{ const next=[...createColumns]; next[idx].name = e.target.value; setCreateColumns(next); }}
                    className="db-col-input"
                  />
                  <select
                    value={col.type}
                    onChange={e=>{ const next=[...createColumns]; next[idx].type = e.target.value; setCreateColumns(next); }}
                    className="db-col-select"
                  >
                    <option value="INT">INT</option>
                    <option value="BIGINT">BIGINT</option>
                    <option value="VARCHAR(255)">VARCHAR(255)</option>
                    <option value="VARCHAR(100)">VARCHAR(100)</option>
                    <option value="VARCHAR(50)">VARCHAR(50)</option>
                    <option value="TEXT">TEXT</option>
                    <option value="DATE">DATE</option>
                    <option value="DATETIME">DATETIME</option>
                    <option value="TIMESTAMP">TIMESTAMP</option>
                    <option value="DECIMAL(10,2)">DECIMAL(10,2)</option>
                    <option value="FLOAT">FLOAT</option>
                    <option value="DOUBLE">DOUBLE</option>
                    <option value="BOOLEAN">BOOLEAN</option>
                    <option value="TINYINT(1)">TINYINT(1)</option>
                    <option value="JSON">JSON</option>
                  </select>
                  <div className="db-col-checkbox">
                    <input 
                      type="checkbox" 
                      id={`nullable-${idx}`}
                      checked={col.nullable} 
                      onChange={e=>{ const next=[...createColumns]; next[idx].nullable = e.target.checked; setCreateColumns(next); }} 
                    />
                    <label htmlFor={`nullable-${idx}`}></label>
                  </div>
                  <div className="db-col-checkbox">
                    <input 
                      type="checkbox" 
                      id={`pk-${idx}`}
                      checked={col.pk} 
                      onChange={e=>{ const next=[...createColumns]; next[idx].pk = e.target.checked; setCreateColumns(next); }} 
                    />
                    <label htmlFor={`pk-${idx}`}></label>
                  </div>
                  <div className="db-col-checkbox">
                    <input 
                      type="checkbox" 
                      id={`ai-${idx}`}
                      checked={col.autoIncrement} 
                      onChange={e=>{ const next=[...createColumns]; next[idx].autoIncrement = e.target.checked; setCreateColumns(next); }} 
                    />
                    <label htmlFor={`ai-${idx}`}></label>
                  </div>
                  <button 
                    className="btn small danger" 
                    onClick={()=>{ const next = createColumns.filter((_,i)=>i!==idx); setCreateColumns(next); }}
                    disabled={createColumns.length === 1}
                    title="Remove column"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            <div className="db-actions" style={{marginTop:24,paddingTop:20,borderTop:'1px solid #dee2e6'}}>
              <button className="btn" onClick={()=>{setShowCreateTable(false); setCreateName(''); setCreateColumns([{ name: '', type: 'INT', nullable: false, pk: true, autoIncrement: true }]); if(tables.length) selectTable(tables[0]);}}>Cancel</button>
              <button className="btn primary" onClick={createTable} style={{padding:'10px 24px'}}>✓ Create Table</button>
            </div>
          </div>
        )}

        {/* Table View */}
        {selected && schema && !showCreateTable && (
          <>
            {/* Table Header */}
            <div className="db-card">
              <div className="db-header-actions">
                <div>
                  <h4 style={{margin:0,display:'inline-block'}}>🗂️ {selected}</h4>
                  {schema.primaryKey && <span className="db-badge primary">PK: {schema.primaryKey}</span>}
                  <span className="db-badge">{pageInfo.total} rows</span>
                </div>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  {canCreate && (
                    <label className="btn" style={{margin:0,cursor:'pointer'}}>
                      📤 Import CSV/Excel
                      <input 
                        type="file" 
                        accept=".csv,.xls,.xlsx" 
                        onChange={async (e)=>{
                          const file = e.target.files[0];
                          if(!file) return;
                          try{
                            setLoading(true);
                            const preview = await api.db.previewUpload(selected, file);
                            setImportPreviewData({ ...preview, file, table: selected });
                            setShowImportPreview(true);
                            e.target.value = '';
                          }catch(err){
                            toast.error(`Preview failed: ${err.message}`);
                            e.target.value = '';
                          }finally{
                            setLoading(false);
                          }
                        }}
                        style={{display:'none'}}
                      />
                    </label>
                  )}
                  {canDelete && (
                    <button className="btn danger" onClick={dropTable}>🗑️ Drop Table</button>
                  )}
                </div>
              </div>
              
              {/* View Selector */}
              <div style={{display:'flex',gap:8,marginTop:16,borderTop:'1px solid #dee2e6',paddingTop:16}}>
                <button 
                  className={`btn ${activeView === 'schema' ? 'primary' : ''}`}
                  onClick={()=>setActiveView('schema')}
                >
                  📋 Schema
                </button>
                {canCreate && (
                  <button 
                    className={`btn ${activeView === 'insert' ? 'primary' : ''}`}
                    onClick={()=>setActiveView('insert')}
                  >
                    ➕ Insert Row
                  </button>
                )}
                <button 
                  className={`btn ${activeView === 'data' ? 'primary' : ''}`}
                  onClick={()=>setActiveView('data')}
                >
                  📊 Table Data
                </button>
              </div>
            </div>

            {/* Schema Info */}
            {activeView === 'schema' && (
              <div className="db-card">
                <h5>📋 Table Schema</h5>
                <div className="db-table-wrapper">
                  <table className="db-table">
                    <thead>
                      <tr>
                        <th>Column</th>
                        <th>Type</th>
                        <th>Nullable</th>
                        <th>Key</th>
                        <th>Extra</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schema.columns.map(c=> (
                        <tr key={c.COLUMN_NAME}>
                          <td style={{fontWeight:600}}>{c.COLUMN_NAME}</td>
                          <td><code style={{background:'#f8f9fa',padding:'2px 6px',borderRadius:4,fontSize:12}}>{c.COLUMN_TYPE}</code></td>
                          <td>{c.IS_NULLABLE === 'YES' ? '✓' : '✗'}</td>
                          <td>{c.COLUMN_KEY && <span className="db-badge">{c.COLUMN_KEY}</span>}</td>
                          <td style={{fontSize:12,color:'#6c757d'}}>{c.EXTRA}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Insert/Edit Form */}
            {activeView === 'insert' && (
              <div className="db-card">
              <h5>{editingRow ? '✏️ Edit Row' : '➕ Insert New Row'}</h5>
              
              {schema && schema.columns ? (
                <>
                  <div className="db-form-grid">
                    {schema.columns.map(c=>{
                      const name = c.COLUMN_NAME;
                      const type = (c.COLUMN_TYPE || '').toLowerCase();
                      const isAI = (c.EXTRA || '').toLowerCase().includes('auto_increment');
                      const readOnly = isAI || (schema.primaryKey === name);
                      return (
                        <div key={name} className="db-form-field">
                          <label>
                            {name}
                            {c.IS_NULLABLE === 'NO' && !isAI && <span style={{color:'#dc3545'}}> *</span>}
                            {isAI && <span className="db-badge success">AUTO</span>}
                            {schema.primaryKey === name && <span className="db-badge primary">PK</span>}
                          </label>
                          <input
                            value={formData[name] ?? ''}
                            readOnly={readOnly}
                            onChange={e=>setFormData({...formData, [name]: e.target.value})}
                            placeholder={readOnly ? 'Auto-generated' : `Enter ${name}`}
                          />
                          <small style={{fontSize:11,color:'#6c757d',marginTop:4}}>{type}</small>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="db-actions">
                    {editingRow ? (
                      <>
                        <button className="btn" onClick={cancelEdit}>Cancel</button>
                        <button className="btn primary" onClick={updateRow}>💾 Save Changes</button>
                      </>
                    ) : (
                      <button className="btn primary" onClick={insertRow}>➕ Insert Row</button>
                    )}
                  </div>
                </>
              ) : (
                <div className="db-empty">No schema available</div>
              )}
              </div>
            )}

            {/* Data Table */}
            {activeView === 'data' && (
              <div className="db-card">
              <h5>📊 Table Data</h5>
              
              {loading ? (
                <div className="db-empty">Loading...</div>
              ) : rows.length === 0 ? (
                <div className="db-empty">No rows found. Insert data using the form above.</div>
              ) : (
                <>
                  <div className="db-table-wrapper">
                    <table className="db-table">
                      <thead>
                        <tr>
                          {rows[0] && Object.keys(rows[0]).map(k=> <th key={k}>{k}</th>)}
                          {(canEdit || canDelete) && <th style={{width:120}}>Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r,idx)=> (
                          <tr key={idx}>
                            {Object.keys(r).map(k=> {
                              const columnType = getColumnType(k);
                              const displayValue = formatDateForDisplay(r[k], columnType);
                              return <td key={k}>{displayValue}</td>;
                            })}
                            {(canEdit || canDelete) && (
                              <td>
                                <div style={{display:'flex',gap:6}}>
                                  {canEdit && <button className="btn small" onClick={()=>startEdit(r)}>✏️ Edit</button>}
                                  {canDelete && <button className="btn small danger" onClick={()=>{ const pk = schema && schema.primaryKey ? schema.primaryKey : Object.keys(r)[0]; removeRow(pk, r[pk]); }}>🗑️</button>}
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <Pagination 
                    currentPage={pageInfo.page}
                    totalPages={Math.ceil(pageInfo.total/pageInfo.limit) || 1}
                    onPageChange={loadPage}
                    totalItems={pageInfo.total}
                  />
                </>
              )}
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!selected && !showCreateTable && (
          <div className="db-card">
            <div className="db-empty" style={{padding:60}}>
              <div style={{fontSize:48,marginBottom:20}}>🗄️</div>
              <h3 style={{color:'#495057',marginBottom:12}}>Welcome to Database Engine</h3>
              <p style={{color:'#6c757d',marginBottom:20}}>Select a table from the sidebar to view and manage data{canCreate ? ', or create a new table to get started' : ''}.</p>
              {canCreate && (
                <button className="btn primary" onClick={()=>setShowCreateTable(true)}>➕ Create Your First Table</button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Import Preview Modal */}
      {showImportPreview && importPreviewData && (
        <div className="modal-overlay" onClick={() => setShowImportPreview(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{maxWidth: 900, maxHeight: '90vh'}}>
            <div className="modal-header">
              <h3>📋 Import Preview</h3>
              <button className="close-btn" onClick={() => setShowImportPreview(false)}>×</button>
            </div>
            <div className="modal-body">
              {/* File Info */}
              <div style={{marginBottom: 24, padding: 16, background: '#f8f9fa', borderRadius: 8}}>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16}}>
                  <div>
                    <div style={{fontSize: 12, color: '#6c757d', marginBottom: 4}}>File Name</div>
                    <div style={{fontWeight: 'bold', fontSize: 14}}>{importPreviewData.filename}</div>
                  </div>
                  <div>
                    <div style={{fontSize: 12, color: '#6c757d', marginBottom: 4}}>Total Rows</div>
                    <div style={{fontWeight: 'bold', fontSize: 14, color: '#0066cc'}}>{importPreviewData.totalRows}</div>
                  </div>
                  <div>
                    <div style={{fontSize: 12, color: '#6c757d', marginBottom: 4}}>File Size</div>
                    <div style={{fontWeight: 'bold', fontSize: 14}}>{(importPreviewData.fileSize / 1024).toFixed(2)} KB</div>
                  </div>
                </div>
              </div>

              {/* Column Mapping */}
              <div style={{marginBottom: 24}}>
                <h4 style={{marginBottom: 12}}>Column Mapping</h4>
                <div style={{display: 'grid', gap: 12}}>
                  {importPreviewData.matchingColumns.length > 0 && (
                    <div style={{padding: 12, background: '#d3f9d8', borderRadius: 6}}>
                      <div style={{fontWeight: 'bold', fontSize: 13, color: '#2b8a3e', marginBottom: 6}}>
                        ✓ Matching Columns ({importPreviewData.matchingColumns.length})
                      </div>
                      <div style={{fontSize: 12, color: '#495057'}}>
                        {importPreviewData.matchingColumns.join(', ')}
                      </div>
                    </div>
                  )}
                  {importPreviewData.extraColumns.length > 0 && (
                    <div style={{padding: 12, background: '#fff3bf', borderRadius: 6}}>
                      <div style={{fontWeight: 'bold', fontSize: 13, color: '#e67700', marginBottom: 6}}>
                        ⚠ Extra Columns (will be ignored)
                      </div>
                      <div style={{fontSize: 12, color: '#495057'}}>
                        {importPreviewData.extraColumns.join(', ')}
                      </div>
                    </div>
                  )}
                  {importPreviewData.missingColumns.length > 0 && (
                    <div style={{padding: 12, background: '#ffe3e3', borderRadius: 6}}>
                      <div style={{fontWeight: 'bold', fontSize: 13, color: '#c92a2a', marginBottom: 6}}>
                        ⚠ Missing Required Columns
                      </div>
                      <div style={{fontSize: 12, color: '#495057'}}>
                        {importPreviewData.missingColumns.join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Data Preview */}
              <div>
                <h4 style={{marginBottom: 12}}>Data Preview (First 10 Rows)</h4>
                <div style={{maxHeight: 300, overflow: 'auto', border: '1px solid #dee2e6', borderRadius: 4}}>
                  <table className="db-table" style={{margin: 0, fontSize: 12}}>
                    <thead>
                      <tr>
                        <th style={{width: 50}}>#</th>
                        {importPreviewData.csvColumns.map(col => (
                          <th key={col} style={{
                            background: importPreviewData.matchingColumns.includes(col) ? '#d3f9d8' : 
                                       importPreviewData.extraColumns.includes(col) ? '#fff3bf' : '#f8f9fa'
                          }}>
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {importPreviewData.preview.map((row, idx) => (
                        <tr key={idx}>
                          <td style={{fontWeight: 'bold', color: '#6c757d'}}>{idx + 1}</td>
                          {importPreviewData.csvColumns.map(col => (
                            <td key={col}>{row[col] || <span style={{color: '#adb5bd'}}>empty</span>}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowImportPreview(false)}>Cancel</button>
              <button 
                className="btn primary" 
                onClick={async () => {
                  try {
                    setLoading(true);
                    setShowImportPreview(false);
                    const result = await api.db.upload(importPreviewData.table, importPreviewData.file);
                    setImportResult(result);
                    setShowImportReport(true);
                    toast.success(`✅ Import complete! ${result.inserted} inserted, ${result.updated} updated, ${result.skipped} skipped`);
                    loadPage(pageInfo.page);
                  } catch (err) {
                    toast.error(`Import failed: ${err.message}`);
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                ✓ Confirm & Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Report Modal */}
      {showImportReport && importResult && (
        <div className="modal-overlay" onClick={() => setShowImportReport(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{maxWidth: 800}}>
            <div className="modal-header">
              <h3>📊 Import Report</h3>
              <button className="close-btn" onClick={() => setShowImportReport(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24}}>
                <div style={{textAlign: 'center', padding: 16, background: '#e7f5ff', borderRadius: 8}}>
                  <div style={{fontSize: 32, fontWeight: 'bold', color: '#1864ab'}}>{importResult.total}</div>
                  <div style={{fontSize: 14, color: '#495057'}}>Total Rows</div>
                </div>
                <div style={{textAlign: 'center', padding: 16, background: '#d3f9d8', borderRadius: 8}}>
                  <div style={{fontSize: 32, fontWeight: 'bold', color: '#2b8a3e'}}>✓ {importResult.inserted}</div>
                  <div style={{fontSize: 14, color: '#495057'}}>Inserted</div>
                </div>
                <div style={{textAlign: 'center', padding: 16, background: '#fff3bf', borderRadius: 8}}>
                  <div style={{fontSize: 32, fontWeight: 'bold', color: '#e67700'}}>↻ {importResult.updated}</div>
                  <div style={{fontSize: 14, color: '#495057'}}>Updated</div>
                </div>
                <div style={{textAlign: 'center', padding: 16, background: '#ffe3e3', borderRadius: 8}}>
                  <div style={{fontSize: 32, fontWeight: 'bold', color: '#c92a2a'}}>✗ {importResult.skipped}</div>
                  <div style={{fontSize: 14, color: '#495057'}}>Skipped</div>
                </div>
              </div>

              <h4 style={{marginBottom: 12}}>Detailed Report</h4>
              <div style={{maxHeight: 400, overflow: 'auto', border: '1px solid #dee2e6', borderRadius: 4}}>
                <table className="db-table" style={{margin: 0}}>
                  <thead>
                    <tr>
                      <th style={{width: 80}}>Row #</th>
                      <th style={{width: 100}}>Status</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importResult.report && importResult.report.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.row}</td>
                        <td>
                          {item.status === 'inserted' && <span style={{color: '#2b8a3e', fontWeight: 'bold'}}>✓ Inserted</span>}
                          {item.status === 'updated' && <span style={{color: '#e67700', fontWeight: 'bold'}}>↻ Updated</span>}
                          {item.status === 'skipped' && <span style={{color: '#868e96'}}>⊘ Skipped</span>}
                          {item.status === 'error' && <span style={{color: '#c92a2a', fontWeight: 'bold'}}>✗ Error</span>}
                        </td>
                        <td style={{fontSize: 12}}>
                          {item.status === 'inserted' && item.data && (
                            <code style={{background: '#f8f9fa', padding: 4, borderRadius: 3}}>
                              {Object.entries(item.data).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(', ')}
                              {Object.keys(item.data).length > 3 && '...'}
                            </code>
                          )}
                          {item.status === 'updated' && item.pk && (
                            <span>PK: <code style={{background: '#fff3bf', padding: 2, borderRadius: 3}}>{item.pk}</code></span>
                          )}
                          {item.reason && <span style={{color: '#868e96'}}>{item.reason}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn primary" onClick={() => setShowImportReport(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
