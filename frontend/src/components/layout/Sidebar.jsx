import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BarChart2, Users, ShieldCheck, Database, X, LogOut } from 'lucide-react';
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
    if (window.innerWidth <= 768) setIsOpen(false);
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>

      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <BarChart2 size={16} color="white" />
        </div>
        <h2>DSS Analytics</h2>
        <button className="mobile-close-btn" onClick={() => setIsOpen(false)} aria-label="Tutup menu">
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <ul>
          {/* Main */}
          <li className="nav-section-label">Menu</li>
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              onClick={handleLinkClick}
            >
              <LayoutDashboard size={17} />
              <span>Dashboard</span>
            </NavLink>
          </li>

          {/* Analyst-only */}
          {isAnalyst && (
            <>
              <li className="nav-section-label" style={{ marginTop: '0.75rem' }}>Analitik</li>
              <li>
                <NavLink to="/charts" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={handleLinkClick}>
                  <BarChart2 size={17} />
                  <span>Charts</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/data-explorer" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={handleLinkClick}>
                  <Database size={17} />
                  <span>Data Explorer</span>
                </NavLink>
              </li>
              <li className="nav-section-label" style={{ marginTop: '0.75rem' }}>Manajemen</li>
              <li>
                <NavLink to="/users" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={handleLinkClick}>
                  <Users size={17} />
                  <span>Users</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/roles" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={handleLinkClick}>
                  <ShieldCheck size={17} />
                  <span>Roles</span>
                </NavLink>
              </li>
            </>
          )}

          {/* Pinned dashboards (non-analyst) */}
          {!isAnalyst && user?.pinned_dashboards && user.pinned_dashboards.length > 0 && (
            <>
              <li className="pinned-section-header">Pinned</li>
              {user.pinned_dashboards.map(pd => (
                <li key={pd.id}>
                  <NavLink
                    to={`/dashboard/${pd.id}`}
                    className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                    onClick={handleLinkClick}
                  >
                    <LayoutDashboard size={15} />
                    <span>{pd.title}</span>
                  </NavLink>
                </li>
              ))}
            </>
          )}
        </ul>
      </nav>

      {/* Logout */}
      <div className="sidebar-footer">
        <button className="logout-link" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;
