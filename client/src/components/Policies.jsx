import React, { useEffect, useState } from 'react'
import api from '../api'
import { ToastContainer } from './Toast';
import { useToast } from '../hooks/useToast';
import ConfirmDialog from './ConfirmDialog';
import { useConfirm } from '../hooks/useConfirm';
import Pagination from './Pagination';
import { useAuth } from '../contexts/AuthContext';
import { formatINR } from '../utils/currency';

export default function Policies(){
  const { hasPermission } = useAuth();
  const toast = useToast();
  const { dialogState, confirm, handleConfirm, handleCancel } = useConfirm();
  
  const canCreate = hasPermission('policies', 'create');
  const canDelete = hasPermission('policies', 'delete');
  const [rows,setRows] = useState([]);
  const [form,setForm] = useState({ policy_type:'', premium_amount:'', coverage_amount:'', start_date:'', end_date:'', customer_id:''});
  const [loading,setLoading] = useState(false);
  const [page,setPage] = useState(1);
  const [limit] = useState(10);
  const [total,setTotal] = useState(0);

  async function load(p = page){
    setLoading(true);
    try{
      const r = await api.policies.list(p, limit);
      setRows(r.data || []);
      setPage(r.page || p);
      setTotal(r.total || 0);
    }catch(e){ toast.error(e.message); }
    finally{ setLoading(false); }
  }

  useEffect(()=>{ load(1) },[]);

  async function submit(e){
    e.preventDefault();
    try{ await api.policies.create(form); toast.success('Policy created successfully'); setForm({ policy_type:'', premium_amount:'', coverage_amount:'', start_date:'', end_date:'', customer_id:''}); load(1); }catch(e){ toast.error(e.message) }
  }
  async function onFileChange(e){ const f = e.target.files[0]; if(!f) return; try{ const res = await api.policies.upload(f); toast.success(`Inserted ${res.inserted}, updated ${res.updated}, skipped ${res.skipped}`); load(1); }catch(err){ toast.error(err.message || err); } }
  async function remove(id){ 
    const confirmed = await confirm({
      title: 'Delete Policy',
      message: 'Are you sure you want to delete this policy? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      danger: true
    });
    if(!confirmed) return; 
    try{ await api.policies.remove(id); toast.success('Policy deleted'); load(page); }catch(e){ toast.error(e.message) } 
  }

  return (
    <div>
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
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
      <h3>Policies</h3>
      
      {canCreate && (
        <>
          <form onSubmit={submit}>
            <div className="form-row">
              <input placeholder="Type" value={form.policy_type} onChange={e=>setForm({...form, policy_type:e.target.value})} />
              <input placeholder="Premium" value={form.premium_amount} onChange={e=>setForm({...form, premium_amount:e.target.value})} />
            </div>
            <div className="form-row">
              <input placeholder="Coverage" value={form.coverage_amount} onChange={e=>setForm({...form, coverage_amount:e.target.value})} />
              <input placeholder="Start (YYYY-MM-DD)" value={form.start_date} onChange={e=>setForm({...form, start_date:e.target.value})} />
            </div>
            <div className="form-row">
              <input placeholder="End (YYYY-MM-DD)" value={form.end_date} onChange={e=>setForm({...form, end_date:e.target.value})} />
              <input placeholder="Customer ID" value={form.customer_id} onChange={e=>setForm({...form, customer_id:e.target.value})} />
              <button className="btn">Add</button>
            </div>
          </form>

          <div style={{marginTop:8}}>
            <label>Import CSV/XLSX: <input type="file" accept=".csv,.xls,.xlsx" onChange={onFileChange} /></label>
          </div>
        </>
      )}

      <div className="list">
        {loading? <div>Loading...</div> : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Premium</th>
                <th>Coverage</th>
                <th>Customer</th>
                {canDelete && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map(r=> (
                <tr key={r.policy_id}>
                  <td>{r.policy_id}</td>
                  <td>{r.policy_type}</td>
                  <td>{formatINR(r.premium_amount, false)}</td>
                  <td>{formatINR(r.coverage_amount, false)}</td>
                  <td>{r.customer_id}</td>
                  {canDelete && (
                    <td><button onClick={()=>remove(r.policy_id)}>Delete</button></td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination 
          currentPage={page}
          totalPages={Math.ceil(total/limit)||1}
          onPageChange={load}
          totalItems={total}
        />
      </div>
    </div>
  )
}
