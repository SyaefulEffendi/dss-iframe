import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BarChart2, Users, ShieldCheck, Settings, LogOut } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import './BaseLayout.css';

const Sidebar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <BarChart2 size={24} color="white" />
        </div>
        <h2>DSS Analytics</h2>
      </div>

      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/dashboard" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/charts" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
              <BarChart2 size={20} />
              <span>Charts</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/users" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
              <Users size={20} />
              <span>Users</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/roles" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
              <ShieldCheck size={20} />
              <span>Roles</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
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
