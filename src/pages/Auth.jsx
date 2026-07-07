import { useState } from 'react';
import { Link } from 'react-router-dom';
import DotGrid from '../components/ui/DotGrid';
import './Auth.css';

export default function Auth() {
  const [mode, setMode] = useState('signin');
  const [role, setRole] = useState('buyer');
  const isRtl = document.documentElement.dir === 'rtl';

  return (
    <div className="auth">
      <DotGrid
        dotSize={4}
        gap={16}
        baseColor="#e1e3e4"
        activeColor="#ff6201"
        proximity={100}
        opacity={0.5}
      />

      <div className="auth__container">
        <Link to="/" className="auth__logo">
          <img src="/logos/Black-logo.png" alt="Mawrid" />
        </Link>

        <div className="auth__tabs">
          <button
            className={`auth__tab ${mode === 'signin' ? 'auth__tab--active' : ''}`}
            onClick={() => setMode('signin')}
          >
            {isRtl ? 'تسجيل الدخول' : 'Sign In'}
          </button>
          <button
            className={`auth__tab ${mode === 'signup' ? 'auth__tab--active' : ''}`}
            onClick={() => setMode('signup')}
          >
            {isRtl ? 'إنشاء حساب' : 'Sign Up'}
          </button>
        </div>

        <div className="auth__role-switch">
          <span className="auth__role-label">{isRtl ? 'أنا:' : 'I am a:'}</span>
          <button
            className={`auth__role-btn ${role === 'buyer' ? 'auth__role-btn--active' : ''}`}
            onClick={() => setRole('buyer')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {isRtl ? 'مشتري' : 'Buyer'}
          </button>
          <button
            className={`auth__role-btn ${role === 'seller' ? 'auth__role-btn--active' : ''}`}
            onClick={() => setRole('seller')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            {isRtl ? 'بائع' : 'Seller'}
          </button>
        </div>

        <form className="auth__form" onSubmit={(e) => e.preventDefault()}>
          <div className="auth__field">
            <label>{isRtl ? 'البريد الإلكتروني' : 'Email'}</label>
            <input type="email" placeholder="you@example.com" required />
          </div>

          <div className="auth__field">
            <label>{isRtl ? 'كلمة المرور' : 'Password'}</label>
            <input type="password" placeholder="••••••••" required />
          </div>

          {mode === 'signup' && (
            <div className="auth__field">
              <label>{isRtl ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
              <input type="password" placeholder="••••••••" required />
            </div>
          )}

          {mode === 'signin' && (
            <a href="#" className="auth__forgot">
              {isRtl ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
            </a>
          )}

          <button type="submit" className="auth__submit">
            {mode === 'signin'
              ? (isRtl ? 'تسجيل الدخول' : 'Sign In')
              : (isRtl ? 'إنشاء حساب' : 'Create Account')}
          </button>
        </form>

        {mode === 'signup' && (
          <p className="auth__terms">
            {isRtl
              ? 'بالتسجيل أنت توافق على شروط الخدمة وسياسة الخصوصية'
              : 'By signing up, you agree to our Terms of Service and Privacy Policy.'}
          </p>
        )}
      </div>
    </div>
  );
}
