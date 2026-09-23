import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BarChart2, Users, ShieldCheck, Settings, LogOut, Database, X } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import './BaseLayout.css';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const isAnalyst = user?.role?.name === 'Data Analyst';

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
    navigate('/login');
  };

  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      setIsOpen(false);
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-icon">
          <BarChart2 size={24} color="white" />
        </div>
        <h2>DSS Analytics</h2>
        <button className="mobile-close-btn" onClick={() => setIsOpen(false)}>
          <X size={24} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/dashboard" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'} onClick={handleLinkClick}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>
          </li>
          {isAnalyst && (
            <>
              <li>
                <NavLink to="/charts" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'} onClick={handleLinkClick}>
                  <BarChart2 size={20} />
                  <span>Charts</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/data-explorer" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'} onClick={handleLinkClick}>
                  <Database size={20} />
                  <span>Data Explorer</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/users" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'} onClick={handleLinkClick}>
                  <Users size={20} />
                  <span>Users</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/roles" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'} onClick={handleLinkClick}>
                  <ShieldCheck size={20} />
                  <span>Roles</span>
                </NavLink>
              </li>
            </>
          )}
          {!isAnalyst && user?.pinned_dashboards && user.pinned_dashboards.length > 0 && (
            <li className="pinned-dashboards-section" style={{ marginTop: '1rem' }}>
              <div style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 'bold' }}>
                Pinned Dashboards
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {user.pinned_dashboards.map(pd => (
                  <li key={pd.id}>
                    <NavLink to={`/dashboard/${pd.id}`} className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'} onClick={handleLinkClick}>
                      <LayoutDashboard size={16} />
                      <span style={{ fontSize: '0.875rem' }}>{pd.title}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
