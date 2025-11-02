import React, { useEffect, useState } from 'react'
import api from '../api'
import { ToastContainer } from './Toast';
import { useToast } from '../hooks/useToast';
import ConfirmDialog from './ConfirmDialog';
import { useConfirm } from '../hooks/useConfirm';
import Pagination from './Pagination';
import { useAuth } from '../contexts/AuthContext';
import { formatINR } from '../utils/currency';

export default function Claims(){
  const { hasPermission } = useAuth();
  const toast = useToast();
  const { dialogState, confirm, handleConfirm, handleCancel } = useConfirm();
  
  const canCreate = hasPermission('claims', 'create');
  const canDelete = hasPermission('claims', 'delete');
  const [rows,setRows] = useState([]);
  const [form,setForm] = useState({ policy_id:'', claim_date:'', claim_amount:''});
  const [loading,setLoading] = useState(false);
  const [page,setPage] = useState(1);
  const [limit] = useState(10);
  const [total,setTotal] = useState(0);

  async function load(p = page){
    setLoading(true);
    try{
      const r = await api.claims.list(p, limit);
      setRows(r.data || []);
      setPage(r.page || p);
      setTotal(r.total || 0);
    }catch(e){ toast.error(e.message); }
    finally{ setLoading(false); }
  }
  useEffect(()=>{ load(1) },[]);
  async function submit(e){ e.preventDefault(); try{ await api.claims.create(form); toast.success('Claim created successfully'); setForm({ policy_id:'', claim_date:'', claim_amount:''}); load(1); }catch(e){ toast.error(e.message) } }
  async function onFileChange(e){ const f = e.target.files[0]; if(!f) return; try{ const res = await api.claims.upload(f); toast.success(`Inserted ${res.inserted}, updated ${res.updated}, skipped ${res.skipped}`); load(1); }catch(err){ toast.error(err.message || err); } }
  async function remove(id){ 
    const confirmed = await confirm({
      title: 'Delete Claim',
      message: 'Are you sure you want to delete this claim? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      danger: true
    });
    if(!confirmed) return; 
    try{ await api.claims.remove(id); toast.success('Claim deleted'); load(page); }catch(e){ toast.error(e.message) } 
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
      <h3>Claims</h3>
      
      {canCreate && (
        <>
          <form onSubmit={submit}>
            <div className="form-row">
              <input placeholder="Policy ID" value={form.policy_id} onChange={e=>setForm({...form, policy_id:e.target.value})} />
              <input placeholder="Claim date" value={form.claim_date} onChange={e=>setForm({...form, claim_date:e.target.value})} />
            </div>
            <div className="form-row">
              <input placeholder="Amount" value={form.claim_amount} onChange={e=>setForm({...form, claim_amount:e.target.value})} />
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
                <th>Policy</th>
                <th>Date</th>
                <th>Amount</th>
                {canDelete && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map(r=> (
                <tr key={r.claim_id}>
                  <td>{r.claim_id}</td>
                  <td>{r.policy_id}</td>
                  <td>{r.claim_date}</td>
                  <td>{formatINR(r.claim_amount, false)}</td>
                  {canDelete && (
                    <td><button onClick={()=>remove(r.claim_id)}>Delete</button></td>
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
