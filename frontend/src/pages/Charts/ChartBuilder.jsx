import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ArrowLeft, Database, AlertCircle, Save, X, BarChart2, MousePointer2, Terminal } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import './ChartBuilder.css';

const MySwal = withReactContent(Swal);
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ChartBuilder = () => {
  const navigate = useNavigate();
  
  // Modes: 'gui' or 'sql'
  const [builderMode, setBuilderMode] = useState('gui');
  
  // SQL State
  const [query, setQuery] = useState('');
  
  // GUI State
  const [dbTables, setDbTables] = useState([]);
  const [dbColumns, setDbColumns] = useState([]);
  const [guiTable, setGuiTable] = useState('');
  const [guiXAxis, setGuiXAxis] = useState('');
  const [guiYAxis, setGuiYAxis] = useState('');
  const [guiAgg, setGuiAgg] = useState('COUNT');

  // General State
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Configurator State
  const [chartType, setChartType] = useState('bar');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [roles, setRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Roles and Tables on Mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [rolesRes, tablesRes] = await Promise.all([
          axios.get('/api/roles'),
          axios.get('/api/schema/tables')
        ]);
        
        if (rolesRes.data.success) setRoles(rolesRes.data.data);
        if (tablesRes.data.success) {
          setDbTables(tablesRes.data.data);
          if (tablesRes.data.data.length > 0) {
             setGuiTable(tablesRes.data.data[0]); // Select first table automatically
          }
        }
      } catch (err) {
        console.error("Gagal mengambil data awal", err);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch Columns when guiTable changes
  useEffect(() => {
    if (!guiTable) return;
    const fetchColumns = async () => {
      try {
        const response = await axios.get(`/api/schema/columns/${guiTable}`);
        if (response.data.success) {
          setDbColumns(response.data.data);
          setGuiXAxis('');
          setGuiYAxis('');
        }
      } catch (err) {
        console.error("Gagal mengambil kolom", err);
      }
    };
    fetchColumns();
  }, [guiTable]);

  // Auto-generate SQL when GUI inputs change
  useEffect(() => {
    if (builderMode === 'gui' && guiTable && guiXAxis && guiYAxis) {
      let generatedSql = '';
      if (guiAgg === 'COUNT' && guiYAxis === '*') {
          generatedSql = `SELECT ${guiXAxis}, COUNT(*) AS aggregate_value FROM ${guiTable} GROUP BY ${guiXAxis}`;
      } else {
          generatedSql = `SELECT ${guiXAxis}, ${guiAgg}(${guiYAxis}) AS aggregate_value FROM ${guiTable} GROUP BY ${guiXAxis}`;
      }
      setQuery(generatedSql);
    }
  }, [guiTable, guiXAxis, guiYAxis, guiAgg, builderMode]);

  const handleRunQuery = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/charts/run-query', { query });
      if (response.data.success) {
        setResults(response.data);
        // Reset Configurator based on Results
        const columns = Object.keys(response.data.data[0] || {});
        setXAxis(columns[0] || '');
        setYAxis(columns[1] || '');
      }
    } catch (err) {
      setResults(null);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Terjadi kesalahan saat mengeksekusi kueri.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getColumns = () => {
    if (!results || !results.data || results.data.length === 0) return [];
    return Object.keys(results.data[0]);
  };

  const getCleanData = () => {
    if (!results || !results.data) return [];
    return results.data.map(item => {
      const cleanItem = { ...item };
      if (yAxis && cleanItem[yAxis] !== null) {
         cleanItem[yAxis] = Number(cleanItem[yAxis]);
      }
      return cleanItem;
    });
  };

  const handleSaveChart = async () => {
    if (!title || selectedRoles.length === 0) {
      MySwal.fire('Error', 'Judul dan minimal satu Role harus diisi!', 'error');
      return;
    }

    setIsSaving(true);
    const payload = {
      title,
      description,
      raw_query: query,
      chart_type: chartType,
      config: { x_axis: xAxis, y_axis: yAxis },
      role_ids: selectedRoles
    };

    try {
      const response = await axios.post('/api/charts', payload);
      if (response.data.success) {
        MySwal.fire('Sukses!', 'Grafik berhasil disimpan ke database.', 'success');
        navigate('/charts');
      }
    } catch (err) {
      MySwal.fire('Gagal', err.response?.data?.message || 'Terjadi kesalahan.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleRole = (roleId) => {
    if (selectedRoles.includes(roleId)) {
      setSelectedRoles(selectedRoles.filter(id => id !== roleId));
    } else {
      setSelectedRoles([...selectedRoles, roleId]);
    }
  };

  return (
    <div className="builder-container">
      <div className="builder-header">
        <div className="builder-title">
          <button className="back-btn" onClick={() => navigate('/charts')} title="Kembali">
            <ArrowLeft size={20} />
          </button>
          <h1>Chart Builder</h1>
        </div>
      </div>

      <div className="builder-layout">
        
        {/* Editor Section */}
        <div className="editor-section">
          
          <div className="editor-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="mode-toggle" style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setBuilderMode('gui')}
                style={{
                  padding: '8px 16px', borderRadius: '6px', border: 'none', 
                  display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                  backgroundColor: builderMode === 'gui' ? '#6366f1' : '#f1f5f9',
                  color: builderMode === 'gui' ? '#fff' : '#475569',
                  fontWeight: builderMode === 'gui' ? 'bold' : 'normal',
                  transition: 'all 0.2s'
                }}
              >
                <MousePointer2 size={16} /> GUI Builder
              </button>
              <button 
                onClick={() => setBuilderMode('sql')}
                style={{
                  padding: '8px 16px', borderRadius: '6px', border: 'none',
                  display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                  backgroundColor: builderMode === 'sql' ? '#6366f1' : '#f1f5f9',
                  color: builderMode === 'sql' ? '#fff' : '#475569',
                  fontWeight: builderMode === 'sql' ? 'bold' : 'normal',
                  transition: 'all 0.2s'
                }}
              >
                <Terminal size={16} /> SQL Editor
              </button>
            </div>

            <button 
              className="run-btn" 
              onClick={handleRunQuery}
              disabled={isLoading || (builderMode === 'gui' && (!guiTable || !guiXAxis || !guiYAxis))}
            >
              <Play size={16} />
              <span>{isLoading ? 'Running...' : 'Preview Data'}</span>
            </button>
          </div>

          {builderMode === 'gui' ? (
            <div className="gui-builder-panel" style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="config-group">
                  <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#334155' }}>1. Pilih Sumber Data (Tabel)</label>
                  <select className="config-select" value={guiTable} onChange={(e) => setGuiTable(e.target.value)}>
                    <option value="">-- Pilih Tabel --</option>
                    {dbTables.map(tbl => (
                      <option key={tbl} value={tbl}>{tbl}</option>
                    ))}
                  </select>
                </div>

                <div className="config-group">
                  <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#334155' }}>2. Kelompokkan Berdasarkan (Sumbu X)</label>
                  <select className="config-select" value={guiXAxis} onChange={(e) => setGuiXAxis(e.target.value)} disabled={!guiTable}>
                    <option value="">-- Pilih Kolom Kategori --</option>
                    {dbColumns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>

                <div className="config-group">
                  <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#334155' }}>3. Metode Hitung (Agregasi)</label>
                  <select className="config-select" value={guiAgg} onChange={(e) => setGuiAgg(e.target.value)}>
                    <option value="COUNT">Hitung Jumlah (COUNT)</option>
                    <option value="SUM">Total Nilai (SUM)</option>
                    <option value="AVG">Rata-Rata (AVG)</option>
                    <option value="MAX">Nilai Tertinggi (MAX)</option>
                    <option value="MIN">Nilai Terendah (MIN)</option>
                  </select>
                </div>

                <div className="config-group">
                  <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#334155' }}>4. Kolom yang Dihitung (Sumbu Y)</label>
                  <select className="config-select" value={guiYAxis} onChange={(e) => setGuiYAxis(e.target.value)} disabled={!guiTable}>
                    <option value="">-- Pilih Kolom --</option>
                    {guiAgg === 'COUNT' && <option value="*">Semua Kolom (*)</option>}
                    {dbColumns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e0e7ff', borderRadius: '6px', fontSize: '0.9rem', color: '#3730a3', fontFamily: 'monospace', lineHeight: '1.4' }}>
                <strong style={{ display: 'block', marginBottom: '4px' }}>Auto-Generated SQL:</strong> 
                {query || "Lengkapi pilihan di atas untuk merakit kueri SQL."}
              </div>
            </div>
          ) : (
            <textarea
              className="sql-textarea"
              style={{ marginTop: '16px' }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ketik kueri SELECT Anda di sini..."
              spellCheck="false"
            />
          )}
        </div>

        {error && (
          <div className="alert-box">
            <AlertCircle size={18} style={{ marginBottom: '-3px', marginRight: '8px' }} />
            {error}
          </div>
        )}

        {/* Tabel Hasil */}
        <div className="results-section">
          <div className="results-header">
            <h3>Data Preview</h3>
            {results && <span className="results-meta">{results.count} Baris</span>}
          </div>
          
          <div className="results-table-container">
            {!results && !isLoading && !error && (
              <div className="empty-results">
                <Database size={48} style={{ opacity: 0.2 }} />
                <p>Klik "Preview Data" untuk melihat hasil tabel.</p>
              </div>
            )}

            {isLoading && <div className="empty-results"><p>Mengeksekusi kueri...</p></div>}

            {results && results.data.length === 0 && (
              <div className="empty-results"><p>Kueri dieksekusi dengan sukses, namun tidak mengembalikan data (0 baris).</p></div>
            )}

            {results && results.data.length > 0 && (
              <table className="results-table">
                <thead>
                  <tr>
                    {getColumns().map((col) => <th key={col}>{col}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {results.data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {getColumns().map((col) => (
                        <td key={`${rowIndex}-${col}`}>{row[col] !== null ? String(row[col]) : <em>null</em>}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* VISUAL CONFIGURATOR */}
        {results && results.data.length > 0 && (
          <div className="configurator-section">
            <div className="config-sidebar">
              <h3>Chart Configurator</h3>
              
              <div className="config-group">
                <label>Chart Type</label>
                <select className="config-select" value={chartType} onChange={(e) => setChartType(e.target.value)}>
                  <option value="bar">Bar Chart</option>
                  <option value="pie">Pie Chart</option>
                  <option value="line">Line Chart</option>
                </select>
              </div>

              <div className="config-group">
                <label>X-Axis (Label/Kategori)</label>
                <select className="config-select" value={xAxis} onChange={(e) => setXAxis(e.target.value)}>
                  <option value="">Pilih Kolom...</option>
                  {getColumns().map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              <div className="config-group">
                <label>Y-Axis (Nilai Numerik)</label>
                <select className="config-select" value={yAxis} onChange={(e) => setYAxis(e.target.value)}>
                  <option value="">Pilih Kolom...</option>
                  {getColumns().map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              <button 
                className="save-chart-btn" 
                disabled={!xAxis || !yAxis}
                onClick={() => setShowModal(true)}
              >
                <Save size={18} />
                Save Chart
              </button>
            </div>

            <div className="preview-container">
              <h3 className="preview-title">Live Preview</h3>
              {xAxis && yAxis ? (
                <ResponsiveContainer width="100%" height={350}>
                  {chartType === 'bar' && (
                    <BarChart data={getCleanData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={xAxis} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey={yAxis} fill="#6366f1" />
                    </BarChart>
                  )}
                  {chartType === 'line' && (
                    <LineChart data={getCleanData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={xAxis} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey={yAxis} stroke="#6366f1" strokeWidth={3} />
                    </LineChart>
                  )}
                  {chartType === 'pie' && (
                    <PieChart>
                      <Tooltip />
                      <Legend />
                      <Pie
                        data={getCleanData()}
                        dataKey={yAxis}
                        nameKey={xAxis}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        fill="#8884d8"
                        label
                      >
                        {getCleanData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <div className="empty-results">
                  <BarChart2 size={48} style={{ opacity: 0.2 }} />
                  <p>Silakan pilih X-Axis dan Y-Axis di sebelah kiri untuk melihat pratinjau grafik.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* SAVE MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Save Chart</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                <X size={24} />
              </button>
            </div>
            
            <div className="config-group" style={{ marginBottom: '1rem' }}>
              <label>Judul Grafik *</label>
              <input type="text" className="config-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Misal: Grafik Jumlah User per Role" />
            </div>

            <div className="config-group" style={{ marginBottom: '1rem' }}>
              <label>Deskripsi (Opsional)</label>
              <textarea className="config-input" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" placeholder="Deskripsi singkat grafik..."></textarea>
            </div>

            <div className="config-group">
              <label>Akses Jabatan (Role) *</label>
              <span style={{ fontSize: '0.8rem', color: '#666' }}>Pilih role mana saja yang bisa melihat grafik ini di Dashboard mereka.</span>
              <div className="role-checkboxes">
                {roles.map(role => (
                  <label key={role.id} className="role-label">
                    <input 
                      type="checkbox" 
                      checked={selectedRoles.includes(role.id)} 
                      onChange={() => toggleRole(role.id)}
                    />
                    {role.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowModal(false)} disabled={isSaving}>Batal</button>
              <button className="submit-btn" onClick={handleSaveChart} disabled={isSaving}>
                {isSaving ? 'Menyimpan...' : 'Simpan Data'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ChartBuilder;
