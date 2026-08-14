import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import './BaseLayout.css';

const BaseLayout = ({ children }) => {
  return (
    <div className="layout-container">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default BaseLayout;
