import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Code, Copy, CheckCircle, Edit3, Save, X, Play } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import './ChartDetail.css';

const MySwal = withReactContent(Swal);
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ChartDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State Data
  const [chart, setChart] = useState(null);
  const [allRoles, setAllRoles] = useState([]);
  
  // State UI
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingQuery, setIsTestingQuery] = useState(false);

  // State Editor
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    raw_query: '',
    chart_type: '',
    x_axis: '',
    y_axis: '',
    selectedRoles: []
  });

  useEffect(() => {
    fetchChartDetail();
    fetchAllRoles();
  }, [id]);

  const fetchChartDetail = async () => {
    try {
      const response = await axios.get(`/api/charts/${id}`);
      if (response.data.success) {
        const c = response.data.data;
        setChart(c);
        // Initialize Edit Data
        setEditData({
          title: c.title,
          description: c.description || '',
          raw_query: c.raw_query,
          chart_type: c.chart_type,
          x_axis: c.config.x_axis,
          y_axis: c.config.y_axis,
          selectedRoles: c.roles.map(r => r.id)
        });
      }
    } catch (err) {
      MySwal.fire('Error', 'Gagal memuat detail grafik atau Anda tidak memiliki akses.', 'error');
      navigate('/charts');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRoles = async () => {
    try {
      const res = await axios.get('/api/roles');
      if (res.data.success) {
        setAllRoles(res.data.data);
      }
    } catch (err) {
      console.error("Gagal mengambil roles", err);
    }
  };

  const generateToken = async () => {
    setGenerating(true);
    try {
      const response = await axios.post(`/api/charts/${id}/token`);
      if (response.data.success) {
        setChart({ ...chart, embed_token: response.data.embed_token });
        MySwal.fire({ icon: 'success', title: 'Token Dibuat!', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
      }
    } catch (err) {
      MySwal.fire('Error', 'Gagal membuat token.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    const embedUrl = `${window.location.origin}/embed/${chart.embed_token}`;
    const iframeCode = `<iframe src="${embedUrl}" width="100%" height="500" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(iframeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Bersihkan data untuk recharts berdasarkan sumbu Y dari form (jika edit) atau dari chart (jika view)
  const getCleanData = () => {
    if (!chart || !chart.data) return [];
    const yAxisKey = isEditing ? editData.y_axis : chart.config.y_axis;
    return chart.data.map(item => {
      const cleanItem = { ...item };
      if (yAxisKey && cleanItem[yAxisKey] !== null) {
         cleanItem[yAxisKey] = Number(cleanItem[yAxisKey]);
      }
      return cleanItem;
    });
  };

  // Daftar kolom hasil kueri
  const getColumns = () => {
    if (!chart || !chart.data || chart.data.length === 0) return [];
    return Object.keys(chart.data[0]);
  };

  const toggleRole = (roleId) => {
    if (editData.selectedRoles.includes(roleId)) {
      setEditData({ ...editData, selectedRoles: editData.selectedRoles.filter(id => id !== roleId) });
    } else {
      setEditData({ ...editData, selectedRoles: [...editData.selectedRoles, roleId] });
    }
  };

  const handleTestQuery = async () => {
    if (!editData.raw_query) return;
    setIsTestingQuery(true);
    try {
      const res = await axios.post('/api/charts/run-query', { query: editData.raw_query });
      if (res.data.success) {
        setChart({ ...chart, data: res.data.data, query_error: null });
        MySwal.fire({ icon: 'success', title: 'Berhasil', text: `Berhasil menarik ${res.data.count} baris data. Silakan pilih kembali Sumbu X dan Y Anda.`, toast: true, position: 'top-end', timer: 4000, showConfirmButton: false });
      }
    } catch (err) {
      setChart({ ...chart, query_error: err.response?.data?.message || 'Error executing query' });
      MySwal.fire('Error Kueri', err.response?.data?.message || 'Terjadi kesalahan.', 'error');
    } finally {
      setIsTestingQuery(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!editData.title || editData.selectedRoles.length === 0) {
      MySwal.fire('Error', 'Judul dan minimal satu Role harus diisi!', 'error');
      return;
    }

    setIsSaving(true);
    const payload = {
      title: editData.title,
      description: editData.description,
      raw_query: editData.raw_query,
      chart_type: editData.chart_type,
      config: { x_axis: editData.x_axis, y_axis: editData.y_axis },
      role_ids: editData.selectedRoles
    };

    try {
      const response = await axios.put(`/api/charts/${id}`, payload);
      if (response.data.success) {
        MySwal.fire({ icon: 'success', title: 'Berhasil', text: 'Grafik diperbarui!', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
        setIsEditing(false);
        fetchChartDetail(); // Reload latest data
      }
    } catch (err) {
      MySwal.fire('Gagal', err.response?.data?.message || 'Terjadi kesalahan.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="chart-detail-container"><p>Memuat data...</p></div>;
  if (!chart) return null;

  const currentChartType = isEditing ? editData.chart_type : chart.chart_type;
  const currentXAxis = isEditing ? editData.x_axis : chart.config.x_axis;
  const currentYAxis = isEditing ? editData.y_axis : chart.config.y_axis;

  return (
    <div className="chart-detail-container">
      <div className="detail-header">
        <div className="detail-title">
          <button className="back-btn" onClick={() => navigate('/charts')} title="Kembali">
            <ArrowLeft size={24} />
          </button>
          
          {isEditing ? (
             <div className="edit-title-group">
               <input 
                 type="text" 
                 value={editData.title} 
                 onChange={(e) => setEditData({...editData, title: e.target.value})} 
                 className="edit-input-title"
                 placeholder="Judul Grafik"
               />
               <input 
                 type="text" 
                 value={editData.description} 
                 onChange={(e) => setEditData({...editData, description: e.target.value})} 
                 className="edit-input-desc"
                 placeholder="Deskripsi Singkat"
               />
             </div>
          ) : (
            <div>
              <h1>{chart.title}</h1>
              <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>{chart.description}</p>
            </div>
          )}
        </div>
        
        <div className="header-actions">
          {isEditing ? (
            <>
              <button className="cancel-edit-btn" onClick={() => setIsEditing(false)} disabled={isSaving}>
                <X size={18} /> Batal
              </button>
              <button className="save-edit-btn" onClick={handleSaveChanges} disabled={isSaving}>
                <Save size={18} /> {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </>
          ) : (
            <>
              <button className="edit-mode-btn" onClick={() => setIsEditing(true)}>
                <Edit3 size={18} /> Edit Grafik
              </button>
              <button className="generate-token-btn" onClick={generateToken} disabled={generating}>
                <Code size={18} />
                {generating ? 'Memproses...' : (chart.embed_token ? 'Regenerate Iframe Token' : 'Generate Iframe Token')}
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="edit-config-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* SQL Editor Area */}
          <div className="config-group" style={{ width: '100%' }}>
            <label>Kueri SQL</label>
            <textarea 
              value={editData.raw_query} 
              onChange={(e) => setEditData({...editData, raw_query: e.target.value})}
              className="sql-editor"
              style={{ width: '100%', minHeight: '100px', fontFamily: 'monospace', padding: '1rem', borderRadius: '8px', border: '1px solid #d1d5db', resize: 'vertical' }}
            />
            <button 
              onClick={handleTestQuery} 
              disabled={isTestingQuery}
              style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
            >
              <Play size={14} /> {isTestingQuery ? 'Menjalankan...' : 'Run Query & Update Opsi Sumbu'}
            </button>
          </div>

          <div className="config-row">
            <div className="config-group">
              <label>Tipe Grafik</label>
              <select className="config-select" value={editData.chart_type} onChange={(e) => setEditData({...editData, chart_type: e.target.value})}>
                <option value="bar">Bar Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="line">Line Chart</option>
                <option value="table">Table (Log Data)</option>
              </select>
            </div>
            {editData.chart_type !== 'table' && (
              <>
                <div className="config-group">
                  <label>Sumbu X (Label)</label>
                  <select className="config-select" value={editData.x_axis} onChange={(e) => setEditData({...editData, x_axis: e.target.value})}>
                    {getColumns().map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>
                <div className="config-group">
                  <label>Sumbu Y (Nilai)</label>
                  <select className="config-select" value={editData.y_axis} onChange={(e) => setEditData({...editData, y_axis: e.target.value})}>
                    {getColumns().map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>
          
          <div className="config-group" style={{ marginTop: '1rem' }}>
            <label>Akses Jabatan (Role)</label>
            <div className="role-checkboxes-inline">
              {allRoles.map(role => (
                <label key={role.id} className="role-label-inline">
                  <input 
                    type="checkbox" 
                    checked={editData.selectedRoles.includes(role.id)} 
                    onChange={() => toggleRole(role.id)}
                  />
                  {role.name}
                </label>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: '1.5rem' }}>
          <strong>Akses Role:</strong>{' '}
          {chart.roles && chart.roles.length > 0 ? chart.roles.map(r => <span key={r.id} className="badge-role">{r.name}</span>) : '-'}
        </div>
      )}

      {!isEditing && chart.embed_token && (
        <div className="embed-code-box">
          <button className="copy-btn" onClick={copyToClipboard}>
            {copied ? <CheckCircle size={14} color="#10b981" /> : <Copy size={14} />}
            {copied ? 'Tersalin!' : 'Copy Code'}
          </button>
          <p>Salin kode HTML di bawah ini dan tempel ke website Anda:</p>
          <div className="code-snippet">
            {`<iframe src="${window.location.origin}/embed/${chart.embed_token}" width="100%" height="500" frameborder="0"></iframe>`}
          </div>
        </div>
      )}

      <div className="visualization-card">
        {chart.query_error ? (
          <div style={{ color: 'red' }}>Error Kueri: {chart.query_error}</div>
        ) : currentChartType === 'table' ? (
          <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '500px' }}>
            <table className="results-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  {getColumns().map((col) => <th key={col}>{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {chart.data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {getColumns().map((col) => (
                      <td key={`${rowIndex}-${col}`}>{row[col] !== null ? String(row[col]) : <em>null</em>}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={500}>
            {currentChartType === 'bar' && (
              <BarChart data={getCleanData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={currentXAxis} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey={currentYAxis} fill="#6366f1" />
              </BarChart>
            )}
            {currentChartType === 'line' && (
              <LineChart data={getCleanData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={currentXAxis} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey={currentYAxis} stroke="#6366f1" strokeWidth={3} />
              </LineChart>
            )}
            {currentChartType === 'pie' && (
              <PieChart>
                <Tooltip />
                <Legend />
                <Pie data={getCleanData()} dataKey={currentYAxis} nameKey={currentXAxis} cx="50%" cy="50%" outerRadius={180} label>
                  {getCleanData().map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
              </PieChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ChartDetail;
