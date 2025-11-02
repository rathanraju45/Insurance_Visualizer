import React, { useEffect, useState, useRef } from 'react';
import api from '../api';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ToastContainer } from './Toast';
import { useToast } from '../hooks/useToast';
import { formatINR, formatCompactINR } from '../utils/currency';

const COLORS = ['#0066cc', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6610f2', '#fd7e14', '#20c997'];

export default function DashboardView() {
  const toast = useToast();
  const [dashboards, setDashboards] = useState([]);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState(null);
  const [filterValues, setFilterValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [activePieIndexes, setActivePieIndexes] = useState({});
  const dashboardRef = useRef(null);

  useEffect(() => {
    loadDashboards();
  }, []);

  async function loadDashboards() {
    try {
      const r = await api.dashboards.list(1, 100);
      setDashboards(r.data || []);
    } catch (e) {
      toast.error(`Failed to load dashboards: ${e.message}`);
    }
  }

  async function runDashboard(d) {
    try {
      setLoading(true);
      setSelected(d);
      
      // Parse config
      const config = typeof d.config === 'string' ? JSON.parse(d.config) : d.config;
      
      // Initialize filter values with defaults
      const initialFilters = {};
      (config?.filters || []).forEach(f => {
        const key = `${f.table}.${f.column}`;
        initialFilters[key] = f.defaultValue || '';
      });
      setFilterValues(initialFilters);
      
      // Prepare filters for backend
      const filters = (config?.filters || []).map(f => ({
        table: f.table,
        column: f.column,
        operator: f.operator,
        value: initialFilters[`${f.table}.${f.column}`]
      }));
      
      // Run dashboard with filters
      const res = await api.dashboards.run(d.dashboard_id);
      setResults(res.widgets);
      toast.success(`Dashboard "${d.name}" loaded successfully`);
    } catch (e) {
      toast.error(`Failed to run dashboard: ${e.message}`);
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  async function applyFilters() {
    if (!selected) return;
    
    try {
      setLoading(true);
      
      const config = typeof selected.config === 'string' ? JSON.parse(selected.config) : selected.config;
      
      // Prepare filters for backend
      const filters = (config?.filters || []).map(f => ({
        table: f.table,
        column: f.column,
        operator: f.operator,
        value: filterValues[`${f.table}.${f.column}`] || ''
      }));
      
      // Run dashboard with new filter values
      const res = await api.dashboards.run(selected.dashboard_id);
      setResults(res.widgets);
      toast.success('Filters applied successfully');
    } catch (e) {
      toast.error(`Failed to apply filters: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  function resetFilters() {
    const config = typeof selected.config === 'string' ? JSON.parse(selected.config) : selected.config;
    const initialFilters = {};
    (config?.filters || []).forEach(f => {
      const key = `${f.table}.${f.column}`;
      initialFilters[key] = f.defaultValue || '';
    });
    setFilterValues(initialFilters);
    applyFilters();
  }

  async function exportToPDF() {
    if (!dashboardRef.current || !results) return;
    
    try {
      setExporting(true);
      toast.info('Generating PDF...');
      
      // Capture the dashboard as canvas
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${selected?.name || 'dashboard'}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success('Dashboard exported to PDF successfully');
    } catch (e) {
      toast.error(`Export failed: ${e.message}`);
    } finally {
      setExporting(false);
    }
  }

  async function exportToImage() {
    if (!dashboardRef.current || !results) return;
    
    try {
      setExporting(true);
      toast.info('Generating image...');
      
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${selected?.name || 'dashboard'}_${new Date().toISOString().split('T')[0]}.png`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('Dashboard exported to image successfully');
      });
    } catch (e) {
      toast.error(`Export failed: ${e.message}`);
    } finally {
      setExporting(false);
    }
  }

  // Check if widget is currency-related
  function isCurrencyWidget(widget) {
    return widget.title && (
      widget.title.toLowerCase().includes('premium') ||
      widget.title.toLowerCase().includes('revenue') ||
      widget.title.toLowerCase().includes('amount') ||
      widget.title.toLowerCase().includes('coverage') ||
      widget.title.toLowerCase().includes('claim') ||
      widget.title.toLowerCase().includes('value') ||
      widget.title.toLowerCase().includes('exposure') ||
      widget.title.toLowerCase().includes('paid') ||
      widget.title.toLowerCase().includes('collected')
    );
  }

  // Custom tooltip formatter for currency
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const isCurrency = payload[0].payload.isCurrency;
      const value = payload[0].value;
      const formattedValue = isCurrency ? formatINR(value) : value.toLocaleString();
      
      return (
        <div style={{ 
          background: 'white', 
          padding: '10px', 
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
          <p style={{ margin: '4px 0 0 0', color: '#0066cc' }}>
            {payload[0].name}: {formattedValue}
          </p>
        </div>
      );
    }
    return null;
  };

  function renderWidget(widget, index) {
    if (widget.error) {
      return (
        <div className="db-card" style={{ background: '#fff3cd', border: '1px solid #ffc107' }}>
          <h5 style={{ color: '#856404' }}>⚠️ {widget.title}</h5>
          <p style={{ color: '#856404', margin: 0 }}>Error: {widget.error}</p>
        </div>
      );
    }

    if (widget.type === 'kpi') {
      // Check if the widget is related to money/currency
      const isCurrency = widget.title && (
        widget.title.toLowerCase().includes('premium') ||
        widget.title.toLowerCase().includes('revenue') ||
        widget.title.toLowerCase().includes('amount') ||
        widget.title.toLowerCase().includes('coverage') ||
        widget.title.toLowerCase().includes('claim') ||
        widget.title.toLowerCase().includes('value') ||
        widget.title.toLowerCase().includes('exposure')
      );
      
      const formattedValue = typeof widget.value === 'number' 
        ? (isCurrency ? formatCompactINR(widget.value) : widget.value.toLocaleString())
        : widget.value;
      
      return (
        <div className="db-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', textAlign: 'center' }}>
          <h5 style={{ margin: 0, fontSize: 14, opacity: 0.9 }}>{widget.title}</h5>
          <div style={{ fontSize: 48, fontWeight: 700, margin: '16px 0' }}>
            {formattedValue}
          </div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>KPI Metric</div>
        </div>
      );
    }

    if (widget.type === 'bar' && widget.data && widget.data.length > 0) {
      const isCurrency = isCurrencyWidget(widget);
      const chartData = widget.data.map(d => ({ ...d, isCurrency }));
      
      // For many items (>12), use horizontal bar chart which is more readable
      const useHorizontal = chartData.length > 12;
      
      if (useHorizontal) {
        const height = Math.max(400, chartData.length * 30);
        return (
          <div className="db-card" style={{ gridColumn: 'span 2' }}>
            <h5>{widget.title}</h5>
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              <ResponsiveContainer width="100%" height={height}>
                <BarChart 
                  data={chartData} 
                  layout="horizontal"
                  margin={{ left: 20, right: 30, top: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number"
                    tickFormatter={(value) => isCurrency ? formatCompactINR(value) : value.toLocaleString()}
                  />
                  <YAxis 
                    type="category"
                    dataKey="label"
                    width={150}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#0066cc" name={isCurrency ? "Amount (INR)" : "Count"} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ 
                fontSize: '11px', 
                color: '#6c757d', 
                marginTop: '8px',
                textAlign: 'center'
              }}>
                <strong>X:</strong> {isCurrency ? 'Amount (INR)' : 'Count'} • <strong>Y:</strong> Category
              </div>
            </div>
          </div>
        );
      }
      
      // Traditional vertical bar chart for fewer items
      const height = chartData.length > 8 ? 350 : 300;
      const xAxisAngle = chartData.length > 6 ? -45 : 0;
      
      return (
        <div className="db-card">
          <h5>{widget.title}</h5>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={chartData} margin={{ bottom: xAxisAngle !== 0 ? 70 : 30, top: 20, left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="label" 
                angle={xAxisAngle} 
                textAnchor={xAxisAngle !== 0 ? 'end' : 'middle'}
                height={xAxisAngle !== 0 ? 90 : 40}
                interval={0}
                tick={{ fontSize: 11 }}
              />
              <YAxis tickFormatter={(value) => isCurrency ? formatCompactINR(value) : value.toLocaleString()} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#0066cc" name={isCurrency ? "Amount (INR)" : "Count"} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ 
            fontSize: '11px', 
            color: '#6c757d', 
            marginTop: '8px',
            textAlign: 'center'
          }}>
            <strong>X:</strong> Category • <strong>Y:</strong> {isCurrency ? 'Amount (INR)' : 'Count'}
          </div>
        </div>
      );
    }

    if (widget.type === 'pie' && widget.data && widget.data.length > 0) {
      const isCurrency = isCurrencyWidget(widget);
      const chartData = widget.data.map((d, idx) => ({ 
        ...d, 
        isCurrency,
        code: String.fromCharCode(65 + idx) // A, B, C, etc.
      }));
      const total = chartData.reduce((sum, d) => sum + d.value, 0);
      
      // Custom tooltip with arrow
      const PieTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
          const data = payload[0].payload;
          const percent = ((data.value / total) * 100).toFixed(1);
          return (
            <div style={{
              background: '#ffffff',
              padding: '12px 16px',
              border: '2px solid #0066cc',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              position: 'relative',
              minWidth: '180px'
            }}>
              {/* Arrow pointing to slice */}
              <div style={{
                position: 'absolute',
                left: '-8px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: 0,
                height: 0,
                borderTop: '8px solid transparent',
                borderBottom: '8px solid transparent',
                borderRight: '8px solid #0066cc'
              }}></div>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                marginBottom: '6px'
              }}>
                <span style={{
                  background: data.fill,
                  color: '#fff',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '12px'
                }}>
                  {data.code}
                </span>
                <strong style={{ fontSize: '14px', color: '#212529' }}>{data.label}</strong>
              </div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#0066cc', marginBottom: '4px' }}>
                {data.isCurrency ? formatINR(data.value) : data.value.toLocaleString()}
              </div>
              <div style={{ fontSize: '13px', color: '#6c757d' }}>
                {percent}% of total
              </div>
            </div>
          );
        }
        return null;
      };
      
      // For many items (>8), use donut chart with table. For fewer, use traditional pie
      const useSplitView = chartData.length > 8;
      const widgetKey = `pie-${index}`;
      const activeIndex = activePieIndexes[widgetKey] ?? null;
      
      const handleMouseEnter = (_, idx) => {
        setActivePieIndexes(prev => ({ ...prev, [widgetKey]: idx }));
      };
      
      const handleMouseLeave = () => {
        setActivePieIndexes(prev => ({ ...prev, [widgetKey]: null }));
      };
      
      if (useSplitView) {
        // Split view: Donut chart + Data table
        return (
          <div className="db-card" style={{ gridColumn: 'span 2' }}>
            <h5>{widget.title}</h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '10px' }}>
              {/* Donut Chart Side */}
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    activeIndex={activeIndex}
                    activeShape={{
                      outerRadius: 110,
                      stroke: '#0066cc',
                      strokeWidth: 3
                    }}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    label={(entry) => {
                      const percent = ((entry.value / total) * 100).toFixed(0);
                      return `${entry.code}\n${percent}%`;
                    }}
                    labelLine={false}
                  >
                    {chartData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Data Table Side */}
              <div style={{ maxHeight: '350px', overflowY: 'auto', fontSize: '13px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#f8f9fa', zIndex: 1 }}>
                    <tr>
                      <th style={{ padding: '8px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Code</th>
                      <th style={{ padding: '8px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Category</th>
                      <th style={{ padding: '8px', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>Value</th>
                      <th style={{ padding: '8px', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.map((item, idx) => {
                      const percent = ((item.value / total) * 100).toFixed(1);
                      return (
                        <tr 
                          key={idx} 
                          style={{ 
                            borderBottom: '1px solid #dee2e6',
                            background: activeIndex === idx ? '#e7f3ff' : 'transparent',
                            transition: 'background 0.2s'
                          }}
                        >
                          <td style={{ padding: '8px' }}>
                            <span style={{ 
                              width: '24px', 
                              height: '24px', 
                              background: COLORS[idx % COLORS.length],
                              color: '#fff',
                              borderRadius: '50%',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              fontSize: '11px'
                            }}>
                              {item.code}
                            </span>
                          </td>
                          <td style={{ padding: '8px', wordBreak: 'break-word' }}>
                            {item.label}
                          </td>
                          <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>
                            {isCurrency ? formatINR(item.value) : item.value.toLocaleString()}
                          </td>
                          <td style={{ padding: '8px', textAlign: 'right', color: '#6c757d' }}>
                            {percent}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      }
      
      // Traditional pie chart for fewer items
      return (
        <div className="db-card">
          <h5>{widget.title}</h5>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={90}
                activeIndex={activeIndex}
                activeShape={{
                  outerRadius: 105,
                  stroke: '#0066cc',
                  strokeWidth: 3
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                label={(entry) => {
                  const percent = ((entry.value / total) * 100).toFixed(0);
                  return `${entry.code}\n${percent}%`;
                }}
                labelLine={false}
              >
                {chartData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                formatter={(value, entry) => `${entry.payload.code} - ${value}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (widget.type === 'line' && widget.data && widget.data.length > 0) {
      const isCurrency = isCurrencyWidget(widget);
      const chartData = widget.data.map(d => ({ ...d, isCurrency }));
      
      // Use wider layout for time-series with many data points
      const useWideLayout = chartData.length > 20;
      const hasAngle = chartData.length > 15;
      
      return (
        <div className="db-card" style={useWideLayout ? { gridColumn: 'span 2' } : {}}>
          <h5>{widget.title}</h5>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: hasAngle ? 60 : 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 11 }}
                angle={hasAngle ? -45 : 0}
                textAnchor={hasAngle ? 'end' : 'middle'}
                height={hasAngle ? 80 : 40}
              />
              <YAxis tickFormatter={(value) => isCurrency ? formatCompactINR(value) : value.toLocaleString()} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#0066cc" 
                strokeWidth={2.5}
                dot={chartData.length <= 15}
                name={isCurrency ? "Amount (INR)" : "Count"} 
              />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ 
            fontSize: '11px', 
            color: '#6c757d', 
            marginTop: '8px',
            textAlign: 'center'
          }}>
            <strong>X:</strong> Time Period • <strong>Y:</strong> {isCurrency ? 'Amount (INR)' : 'Count'}
          </div>
        </div>
      );
    }

    if (widget.type === 'table' && widget.data && widget.data.length > 0) {
      // Get columns from widget or from first data row
      const columns = widget.columns || Object.keys(widget.data[0]);
      const isCurrency = isCurrencyWidget(widget);
      
      // Table widgets span 2 columns for better visibility
      return (
        <div className="db-card" style={{ gridColumn: 'span 2' }}>
          <h5>{widget.title}</h5>
          <div style={{ maxHeight: '450px', overflowY: 'auto', overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: '13px'
            }}>
              <thead style={{ 
                position: 'sticky', 
                top: 0, 
                background: 'linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%)',
                zIndex: 1,
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <tr>
                  {columns.map((col, idx) => {
                    const isMoneyColumn = col.includes('amount') || col.includes('premium') || col.includes('coverage') || col.includes('claim') || col.includes('value');
                    return (
                      <th key={idx} style={{ 
                        textAlign: isMoneyColumn ? 'right' : 'left',
                        padding: '12px 16px',
                        borderBottom: '2px solid #dee2e6',
                        fontWeight: 600,
                        color: '#495057',
                        whiteSpace: 'nowrap'
                      }}>
                        {col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {widget.data.map((row, idx) => (
                  <tr key={idx} style={{ 
                    borderBottom: '1px solid #dee2e6',
                    background: idx % 2 === 0 ? '#ffffff' : '#f8f9fa'
                  }}>
                    {columns.map((col, colIdx) => {
                      const value = row[col];
                      const isMoneyColumn = col.includes('amount') || col.includes('premium') || col.includes('coverage') || col.includes('claim') || col.includes('value');
                      const formattedValue = isMoneyColumn && typeof value === 'number' 
                        ? formatINR(value) 
                        : (typeof value === 'number' ? value.toLocaleString() : value);
                      
                      return (
                        <td key={colIdx} style={{ 
                          textAlign: isMoneyColumn ? 'right' : 'left',
                          padding: '10px 16px',
                          color: '#212529'
                        }}>
                          {formattedValue}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return (
      <div className="db-card">
        <h5>{widget.title}</h5>
        <div className="db-empty">No data available</div>
      </div>
    );
  }

  const config = selected && typeof selected.config === 'string' ? JSON.parse(selected.config) : selected?.config;
  const filters = config?.filters || [];

  return (
    <div className="db-engine">
      {/* Sidebar */}
      <div className="db-sidebar">
        <h4 style={{ margin: 0, marginBottom: 16 }}>📊 Select Dashboard</h4>
        
        <div className="db-table-list">
          {dashboards.map(d => (
            <div key={d.dashboard_id} style={{ marginBottom: 8 }}>
              <button
                className={selected && selected.dashboard_id === d.dashboard_id ? 'active' : ''}
                onClick={() => runDashboard(d)}
                style={{ width: '100%' }}
              >
                📊 {d.name}
              </button>
            </div>
          ))}
          {dashboards.length === 0 && (
            <div className="db-empty" style={{ fontSize: 12, padding: 20 }}>
              No dashboards available
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="db-main">
        {!selected ? (
          <div className="db-card">
            <div className="db-empty" style={{ padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 20 }}>📊</div>
              <h3 style={{ color: '#495057', marginBottom: 12 }}>Welcome to Dashboard View</h3>
              <p style={{ color: '#6c757d', marginBottom: 0 }}>Select a dashboard from the sidebar to view visualizations and apply filters.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Dashboard Header with Export */}
            <div className="db-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, marginBottom: 4 }}>{selected.name}</h4>
                  {selected.description && (
                    <p style={{ margin: 0, color: '#6c757d', fontSize: 14 }}>{selected.description}</p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    className="btn" 
                    onClick={exportToImage}
                    disabled={!results || exporting}
                  >
                    🖼️ Export as Image
                  </button>
                  <button 
                    className="btn primary" 
                    onClick={exportToPDF}
                    disabled={!results || exporting}
                  >
                    📄 Export to PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Filters */}
            {filters.length > 0 && (
              <div className="db-card">
                <h5>🔍 Filters</h5>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12, marginBottom: 16 }}>
                  {filters.map((f, idx) => {
                    const key = `${f.table}.${f.column}`;
                    return (
                      <div key={idx} className="db-form-field">
                        <label style={{ fontSize: 12 }}>
                          {f.column} ({f.table})
                        </label>
                        <input
                          type="text"
                          placeholder={`Filter by ${f.column}...`}
                          value={filterValues[key] || ''}
                          onChange={e => setFilterValues({ ...filterValues, [key]: e.target.value })}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="db-actions" style={{ marginTop: 0 }}>
                  <button className="btn" onClick={resetFilters}>Reset</button>
                  <button className="btn primary" onClick={applyFilters} disabled={loading}>
                    {loading ? '⏳ Applying...' : '🔍 Apply Filters'}
                  </button>
                </div>
              </div>
            )}

            {/* Dashboard Content */}
            {loading ? (
              <div className="db-card">
                <div className="db-empty" style={{ padding: 60 }}>
                  <div style={{ fontSize: 48, marginBottom: 20 }}>⏳</div>
                  <h3 style={{ color: '#495057' }}>Loading dashboard...</h3>
                </div>
              </div>
            ) : results ? (
              <div ref={dashboardRef} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* KPI Row */}
                {results.filter(w => w.type === 'kpi').length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                    {results.filter(w => w.type === 'kpi').map((w, idx) => (
                      <div key={idx}>{renderWidget(w, idx)}</div>
                    ))}
                  </div>
                )}

                {/* Charts and Tables */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                  {results.filter(w => w.type !== 'kpi').map((w, idx) => (
                    <React.Fragment key={idx}>{renderWidget(w, idx)}</React.Fragment>
                  ))}
                </div>

                {results.length === 0 && (
                  <div className="db-card">
                    <div className="db-empty">No widgets configured for this dashboard</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="db-card">
                <div className="db-empty">Failed to load dashboard data</div>
              </div>
            )}
          </>
        )}
      </div>
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </div>
  );
}
