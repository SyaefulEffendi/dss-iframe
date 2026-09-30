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
        text: 'Email atau password salah.',
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
    <div className="login-page">
      {/* Left — Editorial panel */}
      <div className="login-editorial">
        <div className="editorial-inner">
          <div className="login-wordmark">
            <span className="wordmark-dot"></span>
            DSS Analytics
          </div>

          <div className="editorial-headline">
            <p className="editorial-eyebrow">Platform Analitik</p>
            <h1 className="editorial-title">
              Data jadi<br />
              <em>keputusan.</em>
            </h1>
          </div>

          <div className="editorial-meta">
            <div className="meta-line">Role-based access</div>
            <div className="meta-line">Dashboard interaktif</div>
            <div className="meta-line">Embed & ekspor</div>
          </div>
        </div>

        {/* Decorative grid */}
        <div className="editorial-grid" aria-hidden="true">
          {Array.from({ length: 80 }).map((_, i) => (
            <div key={i} className="grid-dot" />
          ))}
        </div>
      </div>

      {/* Right — Form panel */}
      <div className="login-form-panel">
        <div className="login-form-inner">
          <div className="form-header">
            <h2>Masuk</h2>
            <p>Akses dashboard Anda</p>
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
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-submit"
              disabled={isLoading}
            >
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
      </div>
    </div>
  );
};

export default Login;
