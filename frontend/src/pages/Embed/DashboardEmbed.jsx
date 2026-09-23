import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import ChartRenderer from '../../components/ChartRenderer';

const DashboardEmbed = () => {
  const { token } = useParams();
  const [dashboard, setDashboard] = useState(null);
  const [charts, setCharts] = useState([]);
  const [layout, setLayout] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get(`/api/public/dashboards/${token}`);
        if (response.data.success) {
          setDashboard(response.data.data);
          const dashCharts = response.data.data.charts || [];
          setCharts(dashCharts);
          
          const initialLayout = dashCharts.map((c, i) => {
            let conf = c.pivot?.layout_config;
            if (typeof conf === 'string') {
              try { conf = JSON.parse(conf); } catch(e) {}
            }
            return { ...(conf || { x: (i * 6) % 12, y: Infinity, w: 6, h: 4 }), i: `chart_${c.id}`, static: true };
          });
          setLayout(initialLayout);
        }
      } catch (err) {
        setError('Dashboard tidak ditemukan atau token tidak valid.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [token]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>Memuat dashboard...</div>;
  }

  if (error || !dashboard) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'red', fontFamily: 'sans-serif' }}>{error}</div>;
  }

  return (
    <div style={{ width: '100vw', minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '20px', boxSizing: 'border-box', overflowX: 'hidden' }}>
      <h2 style={{ textAlign: 'center', fontFamily: 'sans-serif', color: '#111827', margin: '0 0 20px 0' }}>{dashboard.title}</h2>
      
      {charts.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#6b7280' }}>Dashboard ini masih kosong.</div>
      ) : (
        <GridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={100}
          width={1200}
          isDraggable={false}
          isResizable={false}
          margin={[20, 20]}
        >
          {charts.map(chart => (
            <div key={`chart_${chart.id}`} style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '10px 15px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold', fontSize: '14px', color: '#374151' }}>
                {chart.title}
              </div>
              <div style={{ flex: 1, padding: '15px', minHeight: 0 }}>
                {chart.query_error ? (
                  <div style={{ color: 'red', fontSize: '12px' }}>Error: {chart.query_error}</div>
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
          ))}
        </GridLayout>
      )}
    </div>
  );
};

export default DashboardEmbed;
