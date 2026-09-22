import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { AuthContext } from '../../context/AuthContext';
import ChartRenderer from '../../components/ChartRenderer';
import './DashboardEditor.css';

const MySwal = withReactContent(Swal);

const DashboardEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext) || {};
  const isAnalyst = user?.role?.name === 'Data Analyst';

  const [dashboard, setDashboard] = useState(null);
  const [charts, setCharts] = useState([]);
  const [layout, setLayout] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Available charts for "Add Chart" modal
  const [availableCharts, setAvailableCharts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    if (isAnalyst) {
      fetchAvailableCharts();
    }
  }, [id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/dashboards/${id}`);
      if (response.data.success) {
        setDashboard(response.data.data);
        const dashCharts = response.data.data.charts || [];
        setCharts(dashCharts);
        
        // Parse layout from pivot
        const initialLayout = dashCharts.map((c, i) => {
          let conf = c.pivot?.layout_config;
          if (typeof conf === 'string') {
            try { conf = JSON.parse(conf); } catch(e) {}
          }
          return conf || { i: `chart_${c.id}`, x: (i * 6) % 12, y: Infinity, w: 6, h: 4 };
        });
        setLayout(initialLayout);
      }
    } catch (error) {
      console.error("Gagal mengambil data dashboard:", error);
      MySwal.fire('Error', 'Dashboard tidak ditemukan atau akses ditolak', 'error');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCharts = async () => {
    try {
      const response = await axios.get('/api/charts');
      if (response.data.success) {
        setAvailableCharts(response.data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil daftar chart:", error);
    }
  };

  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
  };

  const saveLayout = async () => {
    setIsSaving(true);
    try {
      const payload = {
        layouts: layout
      };
      const response = await axios.post(`/api/dashboards/${id}/sync`, payload);
      if (response.data.success) {
        MySwal.fire({
          icon: 'success',
          title: 'Tersimpan',
          text: 'Layout dashboard berhasil disimpan',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      }
    } catch (error) {
      MySwal.fire('Error', 'Gagal menyimpan layout', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const generateToken = async () => {
    setGenerating(true);
    try {
      const response = await axios.post(`/api/dashboards/${id}/token`);
      if (response.data.success) {
        setDashboard({ ...dashboard, embed_token: response.data.embed_token });
        MySwal.fire({ icon: 'success', title: 'Token Dibuat!', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
      }
    } catch (err) {
      MySwal.fire('Error', 'Gagal membuat token.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    const embedUrl = `${window.location.origin}/embed/dashboard/${dashboard.embed_token}`;
    const iframeCode = `<iframe src="${embedUrl}" width="100%" height="800" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(iframeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addChartToDashboard = async (chartToAdd) => {
    if (charts.find(c => c.id === chartToAdd.id)) {
      MySwal.fire('Info', 'Grafik sudah ada di dashboard ini', 'info');
      return;
    }
    
    // Default position at bottom
    const newLayoutItem = {
      i: `chart_${chartToAdd.id}`,
      x: 0,
      y: Infinity,
      w: 6,
      h: 4
    };

    // Close modal first for better UX
    setShowAddModal(false);

    // Fetch data for this specific chart so it renders immediately
    let newChart = { ...chartToAdd };
    try {
      const res = await axios.post('/api/charts/run-query', { query: newChart.raw_query });
      newChart.data = res.data.data;
    } catch (err) {
      newChart.data = [];
      newChart.query_error = err.response?.data?.message || 'Error executing query';
    }

    setCharts(prev => [...prev, newChart]);
    setLayout(prev => [...prev, newLayoutItem]);
  };

  const removeChart = (chartId) => {
    setCharts(charts.filter(c => c.id !== chartId));
    setLayout(layout.filter(l => l.i !== `chart_${chartId}`));
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Memuat dashboard...</div>;
  if (!dashboard) return null;

  return (
    <div className="dashboard-editor-container">
      <div className="editor-header">
        <div className="editor-title">
          <button className="back-btn" onClick={() => navigate('/dashboard')} title="Kembali">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1>{dashboard.title}</h1>
            <p>Dibuat oleh: {dashboard.creator?.name || 'Unknown'}</p>
          </div>
        </div>
        
        {isAnalyst && (
          <div className="editor-actions">
            <button className="btn-add" onClick={generateToken} disabled={generating} style={{ backgroundColor: '#8b5cf6', color: '#ffffff' }}>
              {generating ? 'Memproses...' : (dashboard.embed_token ? 'Regenerate Token' : 'Generate Token')}
            </button>
            <button className="btn-add" onClick={() => setShowAddModal(true)}>
              <Plus size={18} /> Tambah Grafik
            </button>
            <button className="btn-save" onClick={saveLayout} disabled={isSaving}>
              <Save size={18} /> {isSaving ? 'Menyimpan...' : 'Simpan Layout'}
            </button>
          </div>
        )}
      </div>

      {dashboard.embed_token && (
        <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontWeight: '600', color: '#374151' }}>Kode Embed (Iframe)</span>
            <button 
              onClick={copyToClipboard}
              style={{ padding: '6px 12px', fontSize: '12px', cursor: 'pointer', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '4px' }}
            >
              {copied ? 'Tersalin!' : 'Copy Code'}
            </button>
          </div>
          <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#6b7280' }}>Salin kode HTML di bawah ini dan tempel ke website Anda:</p>
          <div style={{ backgroundColor: '#f3f4f6', padding: '10px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '13px', color: '#1f2937', overflowX: 'auto' }}>
            {`<iframe src="${window.location.origin}/embed/dashboard/${dashboard.embed_token}" width="100%" height="800" frameborder="0"></iframe>`}
          </div>
        </div>
      )}

      <div className="editor-canvas">
        {charts.length === 0 ? (
          <div className="empty-canvas">
            <p>Dashboard ini masih kosong.</p>
            {isAnalyst && <button className="btn-add-large" onClick={() => setShowAddModal(true)}>Mulai Tambah Grafik</button>}
          </div>
        ) : (
          <GridLayout
            className="layout"
            layout={layout}
            cols={12}
            rowHeight={100}
            width={1200}
            onLayoutChange={handleLayoutChange}
            isDraggable={isAnalyst}
            isResizable={isAnalyst}
            draggableHandle=".chart-card-drag-handle"
          >
            {charts.map(chart => (
              <div key={`chart_${chart.id}`} className="chart-grid-item">
                <div className="chart-card-inner">
                  <div className={`chart-card-header ${isAnalyst ? 'chart-card-drag-handle' : ''}`}>
                    <h3 title={chart.title}>{chart.title}</h3>
                    {isAnalyst && (
                      <button className="btn-remove-chart" onClick={() => removeChart(chart.id)} title="Hapus dari Dashboard">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  <div className="chart-card-body">
                    {chart.query_error ? (
                      <div className="error-msg">Error kueri: {chart.query_error}</div>
                    ) : (
                      <ChartRenderer 
                        chartType={chart.chart_type}
                        xAxis={chart.config?.x_axis}
                        yAxis={chart.config?.y_axis}
                        data={chart.data || []}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </GridLayout>
        )}
      </div>

      {/* Modal Tambah Grafik */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Pilih Grafik</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              {availableCharts.length === 0 ? (
                <p>Tidak ada grafik tersedia. Buat grafik di menu Charts terlebih dahulu.</p>
              ) : (
                <div className="available-charts-list">
                  {availableCharts.map(c => (
                    <div key={c.id} className="available-chart-item">
                      <div>
                        <strong>{c.title}</strong>
                        <span className={`badge-type type-${c.chart_type}`}>{c.chart_type}</span>
                      </div>
                      <button onClick={() => addChartToDashboard(c)}>Tambahkan</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardEditor;
