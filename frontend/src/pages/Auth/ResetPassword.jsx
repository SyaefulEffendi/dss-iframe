import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, BarChart2, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import '../Login/Login.css';

const MySwal = withReactContent(Swal);

const ResetPassword = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const emailQuery = searchParams.get('email') || '';
  const navigate = useNavigate();

  const [email, setEmail] = useState(emailQuery);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/reset-password', {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation
      });
      
      if (response.data.success) {
        MySwal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: response.data.message,
          confirmButtonColor: '#6366f1'
        }).then(() => {
          navigate('/login');
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengubah kata sandi. Token mungkin kadaluarsa.');
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
          <h1 className="hero-title">Atur Ulang Kata Sandi</h1>
          <p className="hero-subtitle">
            Buat kata sandi baru yang kuat untuk melindungi akun dan hak akses Anda.
          </p>
        </div>

        <div className="login-security-badge">
          <ShieldCheck size={20} />
          <span>Enterprise Grade Role-Based Access Control Active</span>
        </div>
      </div>

      <div className="login-right-panel">
        <div className="login-card">
          <div className="login-card-header">
            <h2>Buat Kata Sandi Baru</h2>
            <p>Silakan masukkan alamat email dan kata sandi baru Anda.</p>
          </div>

          {error && <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{error}</div>}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                readOnly={!!emailQuery}
                style={{ backgroundColor: emailQuery ? '#f3f4f6' : 'white', cursor: emailQuery ? 'not-allowed' : 'text' }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Kata Sandi Baru (Min. 8 karakter)</label>
              <div className="password-input-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  minLength={8}
                />
                <button 
                  type="button" 
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="passwordConfirmation">Konfirmasi Kata Sandi Baru</label>
              <div className="password-input-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="passwordConfirmation" 
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required 
                  minLength={8}
                />
              </div>
            </div>

            <button type="submit" className="login-submit-btn" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : 'Atur Ulang Kata Sandi'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
