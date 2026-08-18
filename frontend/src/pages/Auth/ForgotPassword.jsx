import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, BarChart2, ArrowLeft } from 'lucide-react';
import '../Login/Login.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await axios.post('/api/forgot-password', { email });
      if (response.data.success) {
        setMessage(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim tautan reset. Pastikan email terdaftar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left-panel">
        <div className="login-brand">
          <div className="logo-icon">
            <BarChart2 size={24} color="var(--primary-purple)" />
          </div>
          <span className="logo-text">DSS Analytics</span>
        </div>

        <div className="login-hero-content">
          <h1 className="hero-title">Keamanan adalah prioritas utama kami.</h1>
          <p className="hero-subtitle">
            Sistem reset kata sandi menggunakan tautan aman yang hanya bisa diakses oleh pemilik email yang sah.
          </p>
        </div>

        <div className="login-security-badge">
          <ShieldCheck size={20} />
          <span>Enterprise Grade Role-Based Access Control Active</span>
        </div>
      </div>

      <div className="login-right-panel">
        <div className="login-card">
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', textDecoration: 'none', marginBottom: '2rem', fontSize: '0.875rem' }}>
            <ArrowLeft size={16} /> Kembali ke Login
          </Link>
          
          <div className="login-card-header">
            <h2>Lupa Kata Sandi?</h2>
            <p>Masukkan alamat email Anda untuk menerima tautan reset kata sandi.</p>
          </div>

          {message && <div style={{ backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{message}</div>}
          {error && <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{error}</div>}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                placeholder="email@perusahaan.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <button type="submit" className="login-submit-btn" disabled={isLoading}>
              {isLoading ? 'Mengirim...' : 'Kirim Tautan Reset'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
