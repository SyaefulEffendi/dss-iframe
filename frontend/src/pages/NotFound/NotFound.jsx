import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <div className="notfound-icon">
          <AlertTriangle size={64} color="#EF4444" />
        </div>
        <h1 className="notfound-title">404</h1>
        <h2 className="notfound-subtitle">Halaman Tidak Ditemukan</h2>
        <p className="notfound-text">
          Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan. 
          Pastikan URL yang Anda masukkan sudah benar.
        </p>
        <button className="notfound-btn" onClick={() => navigate('/dashboard')}>
          <Home size={18} />
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
};

export default NotFound;
