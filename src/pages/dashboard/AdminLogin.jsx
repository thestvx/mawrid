import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import './AdminLogin.css';

export default function AdminLogin() {
  const { dir } = useLanguage();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const result = await login(username.trim(), password);
      if (!(result && result.role === 'admin')) {
        setError(dir === 'rtl'
          ? 'صلاحية الوصول غير متوفرة لهذا الحساب'
          : 'This account does not have admin access');
        return;
      }
    } catch (err) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setError(dir === 'rtl' ? 'اسم المستخدم أو كلمة المرور غير صحيحة' : 'Invalid username or password');
      } else if (code === 'auth/invalid-email') {
        setError(dir === 'rtl' ? 'اسم المستخدم غير موجود' : 'Username not found');
      } else if (code === 'auth/too-many-requests') {
        setError(dir === 'rtl' ? 'محاولات كثيرة، حاول لاحقاً' : 'Too many attempts, try again later');
      } else {
        setError(err?.message || (dir === 'rtl' ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login__glow admin-login__glow--1" />
      <div className="admin-login__glow admin-login__glow--2" />

      <div className="admin-login__card">
        <div className="admin-login__badge">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 9.9-1" />
          </svg>
          {dir === 'rtl' ? 'لوحة تحكم المدير' : 'Admin Dashboard'}
        </div>

        <div className="admin-login__logo">
          <img src="/logos/Black-logo.png" alt="Mawrid — مَورد" width="170" height="50" />
        </div>

        <h1 className="admin-login__title">
          {dir === 'rtl' ? 'تسجيل دخول الإدارة' : 'Admin Sign In'}
        </h1>
        <p className="admin-login__subtitle">
          {dir === 'rtl'
            ? 'هذه المنطقة مخصصة لمديري المنصة فقط'
            : 'This area is restricted to platform administrators'}
        </p>

        <form onSubmit={handleSubmit} className="admin-login__form">
          <label className="admin-login__label">
            {dir === 'rtl' ? 'اسم المستخدم' : 'Username'}
            <div className="admin-login__field">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={dir === 'rtl' ? 'أدخل اسم المستخدم' : 'Enter your username'}
                autoComplete="username"
                autoFocus
                required
              />
            </div>
          </label>

          <label className="admin-login__label">
            {dir === 'rtl' ? 'كلمة المرور' : 'Password'}
            <div className="admin-login__field">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 9.9-1" />
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={dir === 'rtl' ? 'أدخل كلمة المرور' : 'Enter your password'}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="admin-login__eye"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
            </div>
          </label>

          {error && <div className="admin-login__error">{error}</div>}

          <button type="submit" className="admin-login__submit" disabled={submitting}>
            {submitting ? (
              <>
                <span className="admin-login__spinner" />
                {dir === 'rtl' ? 'جاري التحقق...' : 'Verifying...'}
              </>
            ) : (
              dir === 'rtl' ? 'دخول' : 'Sign In'
            )}
          </button>
        </form>

        <Link className="admin-login__back" to="/">
          {dir === 'rtl' ? '→ العودة إلى الرئيسية' : '← Back to home'}
        </Link>
      </div>
    </div>
  );
}