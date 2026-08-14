import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid
} from 'recharts';
import { ArrowUpRight } from 'lucide-react';
import './DashboardAnalyst.css';

// --- MOCK DATA ---
const barData = [
  { name: 'Bar', value: 12 },
  { name: 'Pie', value: 8 },
  { name: 'Line', value: 4 },
];

const lineData = [
  { name: 'Day 1', value: 10 },
  { name: 'Day 5', value: 65 },
  { name: 'Day 10', value: 40 },
  { name: 'Day 15', value: 85 },
  { name: 'Day 20', value: 50 },
  { name: 'Day 25', value: 90 },
  { name: 'Day 30', value: 30 },
];

const recentCharts = [
  { id: 1, title: 'Monthly Revenue Breakdown', type: 'Bar Chart', roles: 'CEO, Risk Officer', status: 'Active', created: 'Today, 10:15 AM' },
  { id: 2, title: 'Department Headcount', type: 'Pie Chart', roles: 'Manager HR', status: 'Inactive', created: 'Yesterday, 4:32 PM' },
  { id: 3, title: 'Query Processing Load', type: 'Line Chart', roles: 'Manager IT', status: 'Active', created: 'Jan 12, 11:10 AM' },
];

const DashboardAnalyst = () => {
  return (
    <div className="dashboard-container">
      {/* --- TOP ROW: STATS --- */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Charts Created</span>
            <div className="stat-badge green">
              <ArrowUpRight size={14} />
              <span>+4</span>
            </div>
          </div>
          <div className="stat-value">24</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Active Embeds</span>
            <div className="stat-badge green">
              <ArrowUpRight size={14} />
              <span>+2</span>
            </div>
          </div>
          <div className="stat-value">8</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Queries Run</span>
            <div className="stat-badge green">
              <ArrowUpRight size={14} />
              <span>+156</span>
            </div>
          </div>
          <div className="stat-value">1,847</div>
        </div>
      </div>

      {/* --- MIDDLE ROW: CHARTS --- */}
      <div className="charts-grid">
        {/* Bar Chart */}
        <div className="chart-card">
          <h3>Charts by Type</h3>
          <div className="chart-wrapper bar-chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
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
            <h3>Query Execution Trend (30 Days)</h3>
            <div className="legend-badge">
              <span className="legend-dot"></span> Successful Queries
            </div>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
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
        <h3>Recently Created Charts</h3>
        <div className="table-responsive">
          <table className="dss-table">
            <thead>
              <tr>
                <th>Chart Title</th>
                <th>Type</th>
                <th>Assigned Roles</th>
                <th>Embed Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentCharts.map(chart => (
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
                    <a href="#" className="action-link">View</a>
                    <a href="#" className="action-link text-dark">Edit</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardAnalyst;
