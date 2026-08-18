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
          <li>
            <NavLink to="/settings" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'} onClick={handleLinkClick}>
              <Settings size={20} />
              <span>Settings</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="nav-link logout-link" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
