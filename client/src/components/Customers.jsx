import React, { useEffect, useState } from 'react'
import api from '../api'
import { ToastContainer } from './Toast';
import { useToast } from '../hooks/useToast';
import ConfirmDialog from './ConfirmDialog';
import { useConfirm } from '../hooks/useConfirm';
import Pagination from './Pagination';
import { useAuth } from '../contexts/AuthContext';

export default function Customers(){
  const { hasPermission } = useAuth();
  const toast = useToast();
  const { dialogState, confirm, handleConfirm, handleCancel } = useConfirm();
  
  const canCreate = hasPermission('customers', 'create');
  const canDelete = hasPermission('customers', 'delete');
  const [rows,setRows] = useState([]);
  const [form,setForm] = useState({ full_name:'', date_of_birth:'', email:'', phone_number:'', address:''});
  const [loading,setLoading] = useState(false);
  const [page,setPage] = useState(1);
  const [limit] = useState(10);
  const [total,setTotal] = useState(0);

  async function load(p = page){ setLoading(true); try{ const r = await api.customers.list(p, limit); setRows(r.data); setPage(r.page); setTotal(r.total); }catch(e){ toast.error(e.message); } finally{ setLoading(false); } }
  useEffect(()=>{ load(1) },[]);

  async function submit(e){ e.preventDefault(); try{ await api.customers.create(form); toast.success('Customer created successfully'); setForm({ full_name:'', date_of_birth:'', email:'', phone_number:'', address:'' }); load(); }catch(e){ toast.error(e.message); } }
  async function onFileChange(e){ const f = e.target.files[0]; if(!f) return; try{ const res = await api.customers.upload(f); toast.success(`Inserted ${res.inserted}, updated ${res.updated}, skipped ${res.skipped}`); load(1); }catch(err){ toast.error(err.message || err); } }

  async function remove(id){ 
    const confirmed = await confirm({
      title: 'Delete Customer',
      message: 'Are you sure you want to delete this customer? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      danger: true
    });
    if(!confirmed) return; 
    try{ await api.customers.remove(id); toast.success('Customer deleted'); load(page); }catch(e){ toast.error(e.message); } 
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
      <h3>Customers</h3>
      
      {canCreate && (
        <>
          <form onSubmit={submit}>
            <div className="form-row">
              <input placeholder="Full name" value={form.full_name} onChange={e=>setForm({...form, full_name:e.target.value})} />
              <input placeholder="DOB (YYYY-MM-DD)" value={form.date_of_birth} onChange={e=>setForm({...form, date_of_birth:e.target.value})} />
            </div>
            <div className="form-row">
              <input placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
              <input placeholder="Phone" value={form.phone_number} onChange={e=>setForm({...form, phone_number:e.target.value})} />
            </div>
            <div className="form-row">
              <input placeholder="Address" value={form.address} onChange={e=>setForm({...form, address:e.target.value})} />
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
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                {canDelete && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map(r=> (
                <tr key={r.customer_id}>
                  <td>{r.customer_id}</td>
                  <td>{r.full_name}</td>
                  <td>{r.email}</td>
                  <td>{r.phone_number}</td>
                  {canDelete && (
                    <td><button onClick={()=>remove(r.customer_id)}>Delete</button></td>
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
