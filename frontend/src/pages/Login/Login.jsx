import React, { useState, useContext, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
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
    if (token) navigate('/dashboard', { replace: true });
  }, [token, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);

    if (success) {
      MySwal.fire({ icon: 'success', title: 'Login Berhasil!', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
      navigate('/dashboard');
    } else {
      MySwal.fire({ title: 'Login Gagal!', text: 'Email atau password salah.', icon: 'error', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
    }
  };

  return (
    <div className="login-page">

      {/* Brand */}
      <div className="login-brand-top">
        <div className="brand-icon-small" />
        <span className="brand-name">DSS Analytics</span>
      </div>

      {/* Card */}
      <div className="login-card">
        <div className="card-header">
          <h2>Selamat datang kembali</h2>
          <p>Masuk untuk mengakses dashboard Anda</p>
        </div>

        <form onSubmit={handleLogin} noValidate>
          <div className="field-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="nama@perusahaan.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="field-group">
            <div className="field-label-row">
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password" className="link-forgot">Lupa password?</Link>
            </div>
            <div className="field-password">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="btn-toggle-pw"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Sembunyikan' : 'Tampilkan'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="card-divider" />

          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? (
              <span className="btn-loading">
                <span className="spinner" />
                Memproses...
              </span>
            ) : (
              'Masuk ke Dashboard'
            )}
          </button>
        </form>

        <p className="form-footer">
          Belum punya akses?{' '}
          <a href="#">Hubungi administrator</a>
        </p>
      </div>

      <p className="login-tagline">
        &copy; {new Date().getFullYear()} DSS Analytics &mdash; Phicos Cipta Media
      </p>

    </div>
  );
};

export default Login;
