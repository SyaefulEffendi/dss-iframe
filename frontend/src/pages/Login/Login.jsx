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
          <h1 className="hero-title">Powering decisions for executive leadership.</h1>
          <p className="hero-subtitle">
            Experience role-based intelligence built specifically for data analysts and key executive decision makers. Turn raw datasets into structural strategy.
          </p>
        </div>

        <div className="login-security-badge">
          <ShieldCheck size={20} />
          <span>Enterprise Grade Role-Based Access Control Active</span>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="login-right-panel">
        <div className="login-card">
          <div className="login-card-header">
            <h2>Sign In</h2>
            <p>Access the Decision Support dashboard</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                placeholder="ceo@dssanalytics.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <div className="form-group">
              <div className="password-header">
                <label htmlFor="password">Password</label>
                <Link to="/forgot-password" className="forgot-password">Forgot Password?</Link>
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
              <label htmlFor="keep-signed-in">Keep me signed in</label>
            </div>

            <button type="submit" className="login-submit-btn">
              Sign In to Dashboard
            </button>
          </form>

          <div className="login-card-footer">
            <p>Need analytical dashboard access? <a href="#">Request Role</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
