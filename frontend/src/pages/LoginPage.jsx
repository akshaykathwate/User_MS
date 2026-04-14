import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdShield } from 'react-icons/md';

const DEMO_CREDS = [
  { role: 'Admin', email: 'admin@userms.com', password: 'Admin@123456' },
  { role: 'Manager', email: 'manager@userms.com', password: 'Manager@123456' },
  { role: 'User', email: 'user@userms.com', password: 'User@123456' },
];

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setError('');
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const quickLogin = (cred) => {
    setFormData({ email: cred.email, password: cred.password });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back! 👋');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-orb login-bg-orb-1" />
      <div className="login-bg-orb login-bg-orb-2" />

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon"><MdShield /></div>
          <span className="login-logo-text">UserMS</span>
        </div>

        <h1 className="login-title">Welcome back</h1>
        <p className="login-subtitle">Sign in to your account to continue</p>

        {/* Demo credentials */}
        <div className="login-demo-creds">
          <strong>🚀 Quick Login (click to fill)</strong>
          {DEMO_CREDS.map(c => (
            <div
              key={c.role}
              className="login-demo-cred"
              style={{ cursor: 'pointer', padding: '4px 0', borderRadius: 4, transition: 'all 0.15s' }}
              onClick={() => quickLogin(c)}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = ''}
            >
              <span className="role">{c.role}</span>
              <span>{c.email}</span>
            </div>
          ))}
        </div>

        {error && (
          <div className="alert alert-error">
            <MdLock size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Email Address <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <MdEmail size={18} />
              </span>
              <input
                id="login-email"
                type="email"
                name="email"
                className="form-control"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                style={{ paddingLeft: 40 }}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <MdLock size={18} />
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-control"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                style={{ paddingLeft: 40 }}
                disabled={loading}
              />
              <span
                className="input-toggle"
                onClick={() => setShowPassword(s => !s)}
                role="button"
                tabIndex={0}
              >
                {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </span>
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: 8 }}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Signing in...
              </>
            ) : ('Sign In')}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          User Management System — Purple Merit Technologies Assessment
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
