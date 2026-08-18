import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const IframeEmbed = () => {
  const { token } = useParams();
  const [chart, setChart] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChart = async () => {
      try {
        // Menggunakan rute publik yang tidak perlu autentikasi
        const response = await axios.get(`/api/public/charts/${token}`);
        if (response.data.success) {
          setChart(response.data.data);
        }
      } catch (err) {
        setError('Grafik tidak ditemukan atau token tidak valid.');
      } finally {
        setLoading(false);
      }
    };
    fetchChart();
  }, [token]);

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

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>Memuat grafik...</div>;
  }

  if (error || !chart) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'red', fontFamily: 'sans-serif' }}>{error}</div>;
  }

  const { chart_type, config, title } = chart;
  const { x_axis, y_axis } = config;

  return (
    <div style={{ width: '100vw', height: '100vh', padding: '10px', boxSizing: 'border-box', backgroundColor: 'transparent', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ textAlign: 'center', fontFamily: 'sans-serif', color: '#333', margin: '0 0 10px 0' }}>{title}</h3>
      
      <div style={{ flex: 1, minHeight: 0 }}>
        {chart.data.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Tidak ada data.</div>
        ) : chart_type === 'table' ? (
          <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', fontFamily: 'sans-serif' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left' }}>
                  {Object.keys(chart.data[0]).map(col => <th key={col} style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {chart.data.map((row, idx) => (
                  <tr key={idx}>
                    {Object.keys(chart.data[0]).map(col => (
                      <td key={`${idx}-${col}`} style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>
                        {row[col] !== null ? String(row[col]) : <em>null</em>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
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
                <Pie data={getCleanData()} dataKey={y_axis} nameKey={x_axis} cx="50%" cy="50%" outerRadius="80%" label>
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

export default IframeEmbed;
