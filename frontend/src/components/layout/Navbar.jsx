import React from 'react';
import './BaseLayout.css';

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <span className="breadcrumb-path">Dashboard</span>
        <span className="breadcrumb-separator">&gt;</span>
        <span className="breadcrumb-current">Overview</span>
      </div>
      
      <div className="navbar-right">
        <div className="role-badge">Data Analyst</div>
        <div className="user-profile">
          <span className="user-name">Sarah Jenkins</span>
          <div className="avatar-placeholder">
            {/* Menggunakan placeholder gambar sementara untuk Avatar */}
            <img src="https://ui-avatars.com/api/?name=Sarah+Jenkins&background=6E38F7&color=fff" alt="User Avatar" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
