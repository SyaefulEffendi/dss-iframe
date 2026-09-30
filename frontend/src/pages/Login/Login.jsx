import React, { useState, useContext, useEffect } from 'react';
import { Eye, EyeOff, ShieldCheck, BarChart2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { AuthContext } from '../../context/AuthContext';
import './Login.css';

const MySwal = withReactContent(Swal);

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, token } = useContext(AuthContext);

  useEffect(() => {
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [token, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(email, password);
    setIsLoading(false);

    if (success) {
      MySwal.fire({
        icon: "success",
        title: "Login Berhasil!",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
      navigate('/dashboard');
    } else {
      MySwal.fire({
        title: 'Login Gagal!',
        text: 'Email atau Password salah.',
        icon: 'error',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    }
  };

  return (
    <div className="login-container">
      {/* Left Panel - Branding & Info */}
      <div className="login-left-panel">
        <div className="login-brand">
          <div className="logo-icon">
            <BarChart2 size={24} color="var(--primary-purple)" />
          </div>
          <span className="logo-text">DSS Analytics</span>
        </div>

        <div className="login-hero-content">
          <h1 className="hero-title">Sistem Pendukung Keputusan</h1>
          <p className="hero-subtitle">
            Kelola dan analisis data dengan lebih mudah. Dirancang untuk membantu analis dan manajemen dalam mengambil keputusan strategis berbasis data.
          </p>
        </div>

        <div className="login-security-badge">
          <ShieldCheck size={20} />
          <span>Keamanan sistem terjamin dengan akses berbasis peran</span>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="login-right-panel">
        <div className="login-card">
          <div className="login-card-header">
            <h2>Masuk</h2>
            <p>Silakan masuk untuk mengakses dashboard</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Alamat Email</label>
              <input 
                type="email" 
                id="email" 
                placeholder="admin@perusahaan.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <div className="form-group">
              <div className="password-header">
                <label htmlFor="password">Kata Sandi</label>
                <Link to="/forgot-password" className="forgot-password">Lupa Kata Sandi?</Link>
              </div>
              <div className="password-input-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  placeholder="••••••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
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

            <div className="form-checkbox">
              <input type="checkbox" id="keep-signed-in" />
              <label htmlFor="keep-signed-in">Ingat saya</label>
            </div>

            <button type="submit" className="login-submit-btn">
              Masuk ke Dashboard
            </button>
          </form>

          <div className="login-card-footer">
            <p>Belum memiliki akses? <a href="#">Hubungi Admin</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
