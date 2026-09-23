import React, { useContext } from 'react';
import { Menu, Sun, Moon, Settings, LogOut } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import './BaseLayout.css';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="mobile-menu-btn" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <span className="breadcrumb-path">Dashboard</span>
        <span className="breadcrumb-separator">&gt;</span>
        <span className="breadcrumb-current">Overview</span>
      </div>
      
      <div className="navbar-right">
        <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <div className="role-badge">{user?.role?.name || 'User'}</div>
        <div className="user-profile-container">
          <div className="user-profile">
            <span className="user-name">{user?.name || 'Loading...'}</span>
            <div className="avatar-placeholder">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6E38F7&color=fff`} alt="User Avatar" />
            </div>
          </div>
          <div className="user-dropdown">
            <button className="dropdown-item" onClick={() => navigate('/settings')}>
              <Settings size={16} />
              <span>Settings</span>
            </button>
            <button className="dropdown-item logout-btn" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
