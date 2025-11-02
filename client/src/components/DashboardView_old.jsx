import React, { useEffect, useState } from 'react'
import api from '../api'

export default function DashboardView(){
  const [dashboards, setDashboards] = useState([]);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState(null);

  async function load(){ try{ const r = await api.dashboards.list(1,50); setDashboards(r.data || []); }catch(e){ alert(e.message) } }
  useEffect(()=>{ load() },[]);

  async function run(d){ try{ const res = await api.dashboards.run(d.dashboard_id); setSelected(d); setResults(res.widgets); }catch(e){ alert(e.message) } }

  return (
    <div>
      <h3>Dashboard View</h3>
      <div style={{display:'flex', gap:20}}>
        <div style={{width:300}}>
          <h4>Dashboards</h4>
          {dashboards.map(d=> (
            <div key={d.dashboard_id} style={{border:'1px solid #eee', padding:8, marginBottom:8}}>
              <div><strong>{d.name}</strong></div>
              <div style={{marginTop:6}}>
                <button onClick={()=>run(d)}>Run</button>
              </div>
            </div>
          ))}
        </div>
        <div style={{flex:1}}>
          <h4>Results {selected?`for ${selected.name}`:''}</h4>
          {results? (
            <div>
              {results.map((w,i)=> (
                <div key={i} style={{border:'1px solid #ddd', padding:8, marginBottom:8}}>
                  <h5>{w.label || w.key}</h5>
                  {w.hasOwnProperty('value') ? (
                    <div style={{fontSize:24}}>{w.value}</div>
                  ) : w.hasOwnProperty('data') ? (
                    <table>
                      <thead><tr><th>Key</th><th>Value</th></tr></thead>
                      <tbody>
                        {w.data.map((r,idx)=> (
                          <tr key={idx}><td>{r.type||r.key}</td><td>{r.count||r.value||JSON.stringify(r)}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <pre>{JSON.stringify(w, null, 2)}</pre>}
                </div>
              ))}
            </div>
          ) : <div>No results. Run a dashboard to see KPIs and charts.</div>}
        </div>
      </div>
    </div>
  )
}
