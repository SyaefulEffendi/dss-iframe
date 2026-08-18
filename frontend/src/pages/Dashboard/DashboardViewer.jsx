import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import './DashboardViewer.css'; // Opsional, kita bisa gunakan seperlunya

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const DashboardViewer = () => {
  const [charts, setCharts] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchViewerDashboard = async () => {
      try {
        const response = await axios.get('/api/dashboard/viewer');
        if (response.data.success) {
          if (Array.isArray(response.data.data)) {
            setCharts(response.data.data);
          } else {
            setCharts(response.data.data.charts);
            setRecentUsers(response.data.data.recent_users || []);
          }
        }
      } catch (error) {
        console.error("Gagal memuat dashboard viewer", error);
      } finally {
        setLoading(false);
      }
    };

    fetchViewerDashboard();
  }, []);

  const getCleanData = (chartData, yAxis) => {
    if (!chartData) return [];
    return chartData.map(item => {
      const cleanItem = { ...item };
      if (yAxis && cleanItem[yAxis] !== null) {
         cleanItem[yAxis] = Number(cleanItem[yAxis]);
      }
      return cleanItem;
    });
  };

  if (loading) {
    return <div className="viewer-loading">Memuat Dashboard...</div>;
  }

  return (
    <div className="viewer-dashboard">
      <div className="viewer-header">
        <h1>Dashboard Utama</h1>
        <p>Berikut adalah visualisasi data yang diizinkan untuk jabatan Anda.</p>
      </div>

      {charts.length === 0 ? (
        <div className="empty-state">
          <p>Belum ada grafik yang dibagikan untuk jabatan Anda.</p>
        </div>
      ) : (
        <div className="charts-grid">
          {charts.map((chart) => {
            const { chart_type, config, title, description } = chart;
            const { x_axis, y_axis } = config;
            const data = getCleanData(chart.data, y_axis);

            return (
              <div key={chart.id} className="chart-card">
                <div className="chart-card-header">
                  <h3>{title}</h3>
                  {description && <p>{description}</p>}
                </div>
                
                <div className="chart-card-body">
                  {chart.query_error ? (
                    <div className="chart-error">Error Kueri: {chart.query_error}</div>
                  ) : chart.data && chart.data.length === 0 ? (
                    <div className="chart-empty">Tidak ada data.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      {chart_type === 'bar' && (
                        <BarChart data={data}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey={x_axis} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey={y_axis} fill="#6366f1" />
                        </BarChart>
                      )}
                      {chart_type === 'line' && (
                        <LineChart data={data}>
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
                          <Pie data={data} dataKey={y_axis} nameKey={x_axis} cx="50%" cy="50%" outerRadius={100} label>
                            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                          </Pie>
                        </PieChart>
                      )}
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Log Pendaftaran User */}
      <div className="viewer-log-section" style={{ marginTop: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#1f2937', marginBottom: '1rem' }}>Log Aktivitas: Pendaftaran User Terbaru</h2>
        <div className="viewer-table-wrapper">
          <table className="viewer-table">
            <thead>
              <tr>
                <th>Nama User</th>
                <th>Hak Akses (Role)</th>
                <th>Waktu Dibuat</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td><span style={{ backgroundColor: '#e0e7ff', color: '#4f46e5', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>{u.role}</span></td>
                  <td style={{ color: '#6b7280' }}>{u.joined_at}</td>
                </tr>
              ))}
              {recentUsers.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', color: '#9ca3af' }}>Belum ada log aktivitas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardViewer;
