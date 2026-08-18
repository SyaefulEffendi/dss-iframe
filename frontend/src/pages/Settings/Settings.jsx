import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import './Settings.css';

const Settings = () => {
  const { user, setUser } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    current_password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailLinkMessage, setEmailLinkMessage] = useState('');

  const emailChanged = formData.email !== user?.email;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await axios.post('/api/settings/profile', formData);
      if (response.data.success) {
        setMessage(response.data.message);
        setUser(response.data.user);
        setFormData({ ...formData, current_password: '' }); // Reset password field
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat memperbarui profil.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setLoading(true);
    setEmailLinkMessage('');
    setError('');
    
    try {
      const response = await axios.post('/api/forgot-password', { email: user.email });
      if (response.data.success) {
        setEmailLinkMessage(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim tautan reset kata sandi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Pengaturan Akun</h1>
        <p>Kelola informasi profil dan keamanan akun Anda.</p>
      </div>

      <div className="settings-content">
        <div className="settings-card">
          <h2>Profil Pengguna</h2>
          
          {message && <div className="alert success">{message}</div>}
          {error && <div className="alert error">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nama Lengkap</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Alamat Email</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
            </div>

            {emailChanged && (
              <div className="form-group highlight-password">
                <label>Kata Sandi Saat Ini <span className="text-red">*</span></label>
                <p className="help-text">Anda mengubah email. Silakan masukkan kata sandi Anda untuk verifikasi keamanan.</p>
                <input 
                  type="password" 
                  name="current_password" 
                  value={formData.current_password} 
                  onChange={handleChange} 
                  required 
                  placeholder="Masukkan kata sandi saat ini"
                />
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>
        </div>

        <div className="settings-card">
          <h2>Keamanan</h2>
          <p className="help-text">
            Untuk mengubah kata sandi, sistem akan mengirimkan tautan aman ke email Anda (<strong>{user?.email}</strong>).
          </p>
          
          {emailLinkMessage && <div className="alert success">{emailLinkMessage}</div>}
          
          <button 
            onClick={handleForgotPassword} 
            className="btn-secondary" 
            disabled={loading}
            style={{ marginTop: '1rem' }}
          >
            Kirim Tautan Ganti Kata Sandi
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
