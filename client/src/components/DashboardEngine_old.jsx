import React, { useEffect, useState } from 'react'
import api from '../api'

const WIDGET_TYPES = [
  { id: 'kpi', label: 'KPI Card', icon: '📊' },
  { id: 'bar', label: 'Bar Chart', icon: '📊' },
  { id: 'pie', label: 'Pie Chart', icon: '🥧' },
  { id: 'line', label: 'Line Chart', icon: '📈' },
  { id: 'table', label: 'Summary Table', icon: '📋' }
];

const AGGREGATIONS = [
  { id: 'count', label: 'Count' },
  { id: 'sum', label: 'Sum' },
  { id: 'avg', label: 'Average' },
  { id: 'min', label: 'Minimum' },
  { id: 'max', label: 'Maximum' }
];

export default function DashboardEngine(){
  const [dashboards, setDashboards] = useState([]);
  const [name, setName] = useState('New Dashboard');
  const [description, setDescription] = useState('');
  const [widgets, setWidgets] = useState([]);
  const [filters, setFilters] = useState([]);
  const [selected, setSelected] = useState(null);
  const [tables, setTables] = useState([]);
  const [editingWidget, setEditingWidget] = useState(null);
  const [showWidgetForm, setShowWidgetForm] = useState(false);

  async function load(){
    try{ 
      const r = await api.dashboards.list(1,50); 
      setDashboards(r.data || []); 
    }catch(e){ 
      alert(e.message) 
    }
  }
  
  async function loadTables(){
    try{
      const r = await api.db.listTables();
      setTables(r.data || []);
    }catch(e){
      console.error('Failed to load tables', e);
    }
  }
  
  useEffect(()=>{ 
    load();
    loadTables();
  },[]);

  function addWidget(type){
    const w = type === 'kpi' ? { type:'kpi', metric: KPI_METRICS[0].id } : { type:'chart', metric: CHART_METRICS[0].id };
    setWidgets(prev=>[...prev, w]);
  }

  function updateWidget(idx, patch){
    setWidgets(prev=> prev.map((w,i)=> i===idx ? {...w, ...patch} : w));
  }

  async function save(){
    try{
      const cfg = { widgets };
      if (selected) {
        await api.dashboards.update(selected.dashboard_id, { name, config: cfg });
        alert('Updated');
      } else {
        await api.dashboards.create({ name, config: cfg });
        alert('Created');
      }
      setName('New dashboard'); setWidgets([]); setSelected(null); load();
    }catch(e){ alert(e.message) }
  }

  function edit(d){ setSelected(d); setName(d.name); setWidgets(d.config?.widgets || []); }
  async function run(d){ try{ const res = await api.dashboards.run(d.dashboard_id); alert('Ran dashboard, see console'); console.log(res); }catch(e){ alert(e.message) } }
  async function remove(d){ if(!confirm('Delete dashboard?')) return; try{ await api.dashboards.remove(d.dashboard_id); load(); }catch(e){ alert(e.message) } }

  return (
    <div>
      <h3>Dashboard Engine</h3>
      <div style={{display:'flex',gap:20}}>
        <div style={{flex:1}}>
          <h4>Create / Edit</h4>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Dashboard name" />
          <div style={{marginTop:8}}>
            <button onClick={()=>addWidget('kpi')}>Add KPI</button>
            <button onClick={()=>addWidget('chart')}>Add Chart</button>
          </div>
          <div style={{marginTop:8}}>
            {widgets.map((w,idx)=> (
              <div key={idx} style={{border:'1px solid #ddd', padding:8, marginTop:8}}>
                <div>Type: {w.type}</div>
                <div>
                  {w.type === 'kpi' ? (
                    <select value={w.metric} onChange={e=>updateWidget(idx,{metric:e.target.value})}>
                      {KPI_METRICS.map(m=> <option key={m.id} value={m.id}>{m.label}</option>)}
                    </select>
                  ) : (
                    <select value={w.metric} onChange={e=>updateWidget(idx,{metric:e.target.value})}>
                      {CHART_METRICS.map(m=> <option key={m.id} value={m.id}>{m.label}</option>)}
                    </select>
                  )}
                  <button onClick={()=> setWidgets(prev=> prev.filter((_,i)=> i!==idx))}>Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div style={{marginTop:8}}>
            <button onClick={save}>Save Dashboard</button>
            <button onClick={()=>{ setName('New dashboard'); setWidgets([]); setSelected(null); }}>Reset</button>
          </div>
        </div>
        <div style={{flex:1}}>
          <h4>Saved Dashboards</h4>
          <div>
            {dashboards.map(d=> (
              <div key={d.dashboard_id} style={{border:'1px solid #eee', padding:8, marginBottom:8}}>
                <strong>{d.name}</strong>
                <div style={{marginTop:6}}>
                  <button onClick={()=>edit(d)}>Edit</button>
                  <button onClick={()=>run(d)}>Run</button>
                  <button onClick={()=>remove(d)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
