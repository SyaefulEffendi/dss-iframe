import React, { useState, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, BarChart2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { AuthContext } from '../../context/AuthContext';
import '../Login/Login.css';

const MySwal = withReactContent(Swal);

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const emailQuery = searchParams.get('email') || '';
  const navigate = useNavigate();
  const { user } = useContext(AuthContext) || {};

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(emailQuery);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleResendOtp = async () => {
    if (!email) {
      setError('Masukkan email Anda terlebih dahulu.');
      return;
    }
    
    setIsResending(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post('/api/forgot-password', { email });
      if (response.data.success) {
        setMessage('OTP baru telah dikirim ke email Anda.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim ulang OTP.');
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('OTP harus terdiri dari 6 digit angka.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post('/api/verify-otp', { email, otp });
      if (response.data.success) {
        setStep(2);
        setError('');
        setMessage('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'OTP tidak valid atau sudah kadaluarsa.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post('/api/reset-password', {
        otp,
        email,
        password,
        password_confirmation: passwordConfirmation
      });
      
      if (response.data.success) {
        MySwal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Kata sandi Anda berhasil diperbarui.',
          confirmButtonColor: '#6366f1'
        }).then(() => {
          if (user) {
            navigate('/settings');
          } else {
            navigate('/login');
          }
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
          {step === 1 ? (
            <>
              <div className="login-card-header">
                <h2>Verifikasi OTP</h2>
                <p>Masukkan 6 digit OTP yang dikirimkan ke email Anda.</p>
              </div>

              {message && <div style={{ backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{message}</div>}
              {error && <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{error}</div>}

              <form className="login-form" onSubmit={handleVerifyOtp}>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label htmlFor="otp" style={{ margin: 0 }}>Kode OTP (6 Digit)</label>
                    <button 
                      type="button" 
                      onClick={handleResendOtp}
                      disabled={isResending}
                      style={{ background: 'none', border: 'none', color: 'var(--primary-purple)', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 500, padding: 0 }}
                    >
                      {isResending ? 'Mengirim...' : 'Kirim Ulang OTP'}
                    </button>
                  </div>
                  <input 
                    type="text" 
                    id="otp" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    required 
                    placeholder="123456"
                    maxLength={6}
                    style={{ letterSpacing: '0.5rem', textAlign: 'center', fontSize: '1.25rem', fontWeight: 600 }}
                  />
                </div>

                <button type="submit" className="login-submit-btn" disabled={isLoading}>
                  {isLoading ? 'Memverifikasi...' : 'Lanjutkan'}
                </button>
              </form>
            </>
          ) : (
            <>
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', border: 'none', background: 'none', cursor: 'pointer', padding: 0, marginBottom: '2rem', fontSize: '0.875rem' }}
              >
                <ArrowLeft size={16} /> Kembali ke OTP
              </button>
              
              <div className="login-card-header">
                <h2>Buat Kata Sandi Baru</h2>
                <p>Silakan masukkan kata sandi baru Anda yang kuat.</p>
              </div>

              {error && <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{error}</div>}

              <form className="login-form" onSubmit={handleResetPassword}>
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
                  {isLoading ? 'Menyimpan...' : 'Simpan Kata Sandi'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
