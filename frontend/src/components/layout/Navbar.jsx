import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import './BaseLayout.css';

const Navbar = () => {
  const { user } = useContext(AuthContext);
  return (
    <header className="navbar">
      <div className="navbar-left">
        <span className="breadcrumb-path">Dashboard</span>
        <span className="breadcrumb-separator">&gt;</span>
        <span className="breadcrumb-current">Overview</span>
      </div>
      
      <div className="navbar-right">
        <div className="role-badge">{user?.role?.name || 'User'}</div>
        <div className="user-profile">
          <span className="user-name">{user?.name || 'Loading...'}</span>
          <div className="avatar-placeholder">
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6E38F7&color=fff`} alt="User Avatar" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
