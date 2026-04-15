import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  MdEmail, MdLock, MdPerson, MdVisibility, MdVisibilityOff, MdShield
} from 'react-icons/md';

const LoginPage = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  // 'signin' | 'signup'
  const [tab, setTab] = useState('signin');

  // ── Sign In state ─────────────────────────────────────────
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginShowPass, setLoginShowPass] = useState(false);

  // ── Sign Up state ─────────────────────────────────────────
  const [signupData, setSignupData] = useState({
    name: '', email: '', password: '', confirmPassword: ''
  });
  const [signupShowPass, setSignupShowPass] = useState(false);
  const [signupShowConfirm, setSignupShowConfirm] = useState(false);
  const [signupErrors, setSignupErrors] = useState({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Handlers ──────────────────────────────────────────────
  const switchTab = (t) => {
    setTab(t);
    setError('');
    setSignupErrors({});
  };

  const handleLoginChange = (e) => {
    setError('');
    setLoginData(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSignupChange = (e) => {
    setError('');
    setSignupErrors(p => ({ ...p, [e.target.name]: '' }));
    setSignupData(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  // ── Sign In submit ────────────────────────────────────────
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(loginData.email, loginData.password);
      toast.success('Welcome back! 👋');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Sign Up validation ────────────────────────────────────
  const validateSignup = () => {
    const e = {};
    if (!signupData.name.trim() || signupData.name.trim().length < 2)
      e.name = 'Name must be at least 2 characters.';
    if (!signupData.email)
      e.email = 'Email is required.';
    if (!signupData.password || signupData.password.length < 6)
      e.password = 'Password must be at least 6 characters.';
    if (signupData.password !== signupData.confirmPassword)
      e.confirmPassword = 'Passwords do not match.';
    setSignupErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Sign Up submit ────────────────────────────────────────
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!validateSignup()) return;
    setLoading(true);
    try {
      await register(signupData.name.trim(), signupData.email, signupData.password);
      toast.success('Account created! Welcome 🎉');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────
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

        {/* Tabs */}
        <div style={{
          display: 'flex',
          background: 'var(--color-surface-2)',
          borderRadius: 10,
          padding: 4,
          marginBottom: 'var(--space-6)',
          gap: 4,
        }}>
          {[
            { key: 'signin', label: 'Sign In' },
            { key: 'signup', label: 'Sign Up' },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              id={`tab-${key}`}
              onClick={() => switchTab(key)}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 'var(--text-sm)',
                transition: 'all 0.2s',
                background: tab === key ? 'var(--color-primary)' : 'transparent',
                color: tab === key ? '#fff' : 'var(--text-muted)',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Global error */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
            <MdLock size={16} />
            {error}
          </div>
        )}

        {/* ── SIGN IN FORM ── */}
        {tab === 'signin' && (
          <>
            <h1 className="login-title" style={{ marginBottom: 4 }}>Welcome back</h1>
            <p className="login-subtitle">Sign in to your account to continue</p>

            <form onSubmit={handleLoginSubmit} noValidate>
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
                    value={loginData.email}
                    onChange={handleLoginChange}
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
                    type={loginShowPass ? 'text' : 'password'}
                    name="password"
                    className="form-control"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    autoComplete="current-password"
                    style={{ paddingLeft: 40 }}
                    disabled={loading}
                  />
                  <span className="input-toggle" onClick={() => setLoginShowPass(s => !s)} role="button" tabIndex={0}>
                    {loginShowPass ? <MdVisibilityOff /> : <MdVisibility />}
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
                {loading
                  ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Signing in...</>
                  : 'Sign In'
                }
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => switchTab('signup')}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600, padding: 0 }}
              >
                Create one
              </button>
            </p>
          </>
        )}

        {/* ── SIGN UP FORM ── */}
        {tab === 'signup' && (
          <>
            <h1 className="login-title" style={{ marginBottom: 4 }}>Create an account</h1>
            <p className="login-subtitle">Join UserMS — it only takes a moment</p>

            <form onSubmit={handleSignupSubmit} noValidate>
              {/* Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="signup-name">
                  Full Name <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                    <MdPerson size={18} />
                  </span>
                  <input
                    id="signup-name"
                    type="text"
                    name="name"
                    className={`form-control ${signupErrors.name ? 'error' : ''}`}
                    placeholder="John Doe"
                    value={signupData.name}
                    onChange={handleSignupChange}
                    autoComplete="name"
                    style={{ paddingLeft: 40 }}
                    disabled={loading}
                  />
                </div>
                {signupErrors.name && <div className="form-error">{signupErrors.name}</div>}
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label" htmlFor="signup-email">
                  Email Address <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                    <MdEmail size={18} />
                  </span>
                  <input
                    id="signup-email"
                    type="email"
                    name="email"
                    className={`form-control ${signupErrors.email ? 'error' : ''}`}
                    placeholder="you@example.com"
                    value={signupData.email}
                    onChange={handleSignupChange}
                    autoComplete="email"
                    style={{ paddingLeft: 40 }}
                    disabled={loading}
                  />
                </div>
                {signupErrors.email && <div className="form-error">{signupErrors.email}</div>}
              </div>

              {/* Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="signup-password">
                  Password <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                    <MdLock size={18} />
                  </span>
                  <input
                    id="signup-password"
                    type={signupShowPass ? 'text' : 'password'}
                    name="password"
                    className={`form-control ${signupErrors.password ? 'error' : ''}`}
                    placeholder="Min 6 characters"
                    value={signupData.password}
                    onChange={handleSignupChange}
                    autoComplete="new-password"
                    style={{ paddingLeft: 40 }}
                    disabled={loading}
                  />
                  <span className="input-toggle" onClick={() => setSignupShowPass(s => !s)} role="button" tabIndex={0}>
                    {signupShowPass ? <MdVisibilityOff /> : <MdVisibility />}
                  </span>
                </div>
                {signupErrors.password && <div className="form-error">{signupErrors.password}</div>}
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="signup-confirm">
                  Confirm Password <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                    <MdLock size={18} />
                  </span>
                  <input
                    id="signup-confirm"
                    type={signupShowConfirm ? 'text' : 'password'}
                    name="confirmPassword"
                    className={`form-control ${signupErrors.confirmPassword ? 'error' : ''}`}
                    placeholder="Re-enter password"
                    value={signupData.confirmPassword}
                    onChange={handleSignupChange}
                    autoComplete="new-password"
                    style={{ paddingLeft: 40 }}
                    disabled={loading}
                  />
                  <span className="input-toggle" onClick={() => setSignupShowConfirm(s => !s)} role="button" tabIndex={0}>
                    {signupShowConfirm ? <MdVisibilityOff /> : <MdVisibility />}
                  </span>
                </div>
                {signupErrors.confirmPassword && <div className="form-error">{signupErrors.confirmPassword}</div>}
              </div>

              <button
                id="signup-submit"
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: 8 }}
                disabled={loading}
              >
                {loading
                  ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Creating account...</>
                  : 'Create Account'
                }
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => switchTab('signin')}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600, padding: 0 }}
              >
                Sign in
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
