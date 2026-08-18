import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Code, Copy, CheckCircle } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import './ChartDetail.css';

const MySwal = withReactContent(Swal);
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ChartDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchChartDetail();
  }, [id]);

  const fetchChartDetail = async () => {
    try {
      const response = await axios.get(`/api/charts/${id}`);
      if (response.data.success) {
        setChart(response.data.data);
      }
    } catch (err) {
      MySwal.fire('Error', 'Gagal memuat detail grafik atau Anda tidak memiliki akses.', 'error');
      navigate('/charts');
    } finally {
      setLoading(false);
    }
  };

  const generateToken = async () => {
    setGenerating(true);
    try {
      const response = await axios.post(`/api/charts/${id}/token`);
      if (response.data.success) {
        // Refresh detail chart for the new token
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

  // Bersihkan data untuk recharts
  const getCleanData = () => {
    if (!chart || !chart.data) return [];
    const { y_axis } = chart.config;
    return chart.data.map(item => {
      const cleanItem = { ...item };
      if (y_axis && cleanItem[y_axis] !== null) {
         cleanItem[y_axis] = Number(cleanItem[y_axis]);
      }
      return cleanItem;
    });
  };

  if (loading) return <div className="chart-detail-container"><p>Memuat data...</p></div>;
  if (!chart) return null;

  const { chart_type, config, title, description, roles, creator, embed_token } = chart;
  const { x_axis, y_axis } = config;

  return (
    <div className="chart-detail-container">
      <div className="detail-header">
        <div className="detail-title">
          <button className="back-btn" onClick={() => navigate('/charts')} title="Kembali">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1>{title}</h1>
            <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>{description}</p>
          </div>
        </div>
        <button className="generate-token-btn" onClick={generateToken} disabled={generating}>
          <Code size={18} />
          {generating ? 'Memproses...' : (embed_token ? 'Regenerate Iframe Token' : 'Generate Iframe Token')}
        </button>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <strong>Akses Role:</strong>{' '}
        {roles && roles.length > 0 ? roles.map(r => <span key={r.id} className="badge-role">{r.name}</span>) : '-'}
      </div>

      {embed_token && (
        <div className="embed-code-box">
          <button className="copy-btn" onClick={copyToClipboard}>
            {copied ? <CheckCircle size={14} color="#10b981" /> : <Copy size={14} />}
            {copied ? 'Tersalin!' : 'Copy Code'}
          </button>
          <p>Salin kode HTML di bawah ini dan tempel ke website Anda:</p>
          <div className="code-snippet">
            {`<iframe src="${window.location.origin}/embed/${embed_token}" width="100%" height="500" frameborder="0"></iframe>`}
          </div>
        </div>
      )}

      <div className="visualization-card">
        {chart.query_error ? (
          <div style={{ color: 'red' }}>Error Kueri: {chart.query_error}</div>
        ) : (
          <ResponsiveContainer width="100%" height={500}>
            {chart_type === 'bar' && (
              <BarChart data={getCleanData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={x_axis} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey={y_axis} fill="#6366f1" />
              </BarChart>
            )}
            {chart_type === 'line' && (
              <LineChart data={getCleanData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={x_axis} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey={y_axis} stroke="#6366f1" strokeWidth={3} />
              </LineChart>
            )}
            {chart_type === 'pie' && (
              <PieChart>
                <Tooltip />
                <Legend />
                <Pie data={getCleanData()} dataKey={y_axis} nameKey={x_axis} cx="50%" cy="50%" outerRadius={180} label>
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
