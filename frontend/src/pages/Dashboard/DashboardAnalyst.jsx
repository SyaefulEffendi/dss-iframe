import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid
} from 'recharts';
import { ArrowUpRight, Users } from 'lucide-react';
import './DashboardAnalyst.css';

// Data simulasi untuk Line Chart karena kita belum punya tabel log aktivitas kueri
const simulatedLineData = [
  { name: 'Day 1', value: 10 },
  { name: 'Day 5', value: 65 },
  { name: 'Day 10', value: 40 },
  { name: 'Day 15', value: 85 },
  { name: 'Day 20', value: 50 },
  { name: 'Day 25', value: 90 },
  { name: 'Day 30', value: 30 },
];

const DashboardAnalyst = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_charts: 0,
    active_embeds: 0,
    total_users: 0,
    charts_by_type: [],
    recent_charts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/dashboard/stats');
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (err) {
        console.error("Gagal memuat statistik dashboard", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="dashboard-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>Memuat data...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* --- TOP ROW: STATS --- */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Grafik Aksesibilitas Anda</span>
            <div className="stat-badge green">
              <ArrowUpRight size={14} />
            </div>
          </div>
          <div className="stat-value">{stats.total_charts}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Iframe Token Aktif</span>
            <div className="stat-badge green">
              <ArrowUpRight size={14} />
            </div>
          </div>
          <div className="stat-value">{stats.active_embeds}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Pengguna Sistem</span>
            <div className="stat-badge purple">
              <Users size={14} />
            </div>
          </div>
          <div className="stat-value">{stats.total_users}</div>
        </div>
      </div>

      {/* --- MIDDLE ROW: CHARTS --- */}
      <div className="charts-grid">
        {/* Bar Chart */}
        <div className="chart-card">
          <h3>Distribusi Tipe Grafik</h3>
          <div className="chart-wrapper bar-chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.charts_by_type} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-gray)'}} />
                <Tooltip cursor={{fill: 'var(--bg-light)'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                <Bar dataKey="value" fill="var(--primary-purple)" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart */}
        <div className="chart-card line-chart-card">
          <div className="chart-card-header">
            <h3>Tren Eksekusi Kueri (Simulasi)</h3>
            <div className="legend-badge">
              <span className="legend-dot"></span> Eksekusi Sukses
            </div>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={simulatedLineData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                <Line type="monotone" dataKey="value" stroke="var(--primary-purple)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- BOTTOM ROW: TABLE --- */}
      <div className="table-card">
        <h3>Grafik yang Baru Dibuat</h3>
        <div className="table-responsive">
          <table className="dss-table">
            <thead>
              <tr>
                <th>Judul Grafik</th>
                <th>Tipe</th>
                <th>Hak Akses (Role)</th>
                <th>Status Iframe</th>
                <th>Dibuat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_charts.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Belum ada grafik.</td>
                </tr>
              ) : (
                stats.recent_charts.map(chart => (
                  <tr key={chart.id}>
                    <td className="fw-600">{chart.title}</td>
                    <td className="text-gray">{chart.type}</td>
                    <td>{chart.roles}</td>
                    <td>
                      <span className={`status-badge ${chart.status.toLowerCase()}`}>
                        {chart.status}
                      </span>
                    </td>
                    <td className="text-gray">{chart.created}</td>
                    <td className="actions-cell">
                      <button className="action-link" style={{ background:'none', border:'none', cursor:'pointer' }} onClick={() => navigate(`/charts/${chart.id}`)}>View & Edit</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardAnalyst;
