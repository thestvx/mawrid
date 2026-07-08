import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import DotGrid from '../components/ui/DotGrid';
import './Auth.css';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const initialRole = searchParams.get('role') === 'seller' ? 'seller' : 'buyer';

  const [mode, setMode] = useState(initialMode);
  const [role, setRole] = useState(initialRole);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { t } = useLanguage();
  const { login, signup, user, role: userRole } = useAuth();
  const navigate = useNavigate();

  // Redirect after login based on role
  useEffect(() => {
    if (user) {
      if (userRole === 'seller') {
        navigate('/dashboard/seller', { replace: true });
      } else if (userRole === 'buyer') {
        navigate('/dashboard/buyer', { replace: true });
      } else if (userRole === 'admin') {
        navigate('/owner', { replace: true });
      }
    }
  }, [user, userRole, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;

    try {
      if (mode === 'signin') {
        await login(email, password);
        // Redirect handled by useEffect above
      } else {
        const name = form.name.value;
        const phone = form.phone?.value || '';
        const storeName = form.store?.value || '';
        await signup({ email, password, name, role, phone, storeName });
        if (role === 'seller') navigate('/dashboard/seller', { replace: true });
        else navigate('/dashboard/buyer', { replace: true });
      }
    } catch (err) {
      const code = err.code;
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setError(t('auth.errorInvalid') || 'Invalid email or password');
      } else if (code === 'auth/email-already-in-use') {
        setError(t('auth.errorEmailInUse') || 'This email is already registered');
      } else if (code === 'auth/weak-password') {
        setError(t('auth.errorWeakPassword') || 'Password must be at least 6 characters');
      } else {
        setError(err.message || 'An error occurred');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth">
      <DotGrid dotSize={4} gap={16} baseColor="#e1e3e4" activeColor="#ff6201" proximity={100} opacity={0.5} />

      <div className="auth__container">
        <Link to="/" className="auth__logo">
          <img src="/logos/Black-logo.png" alt="Mawrid" width="180" height="60" />
        </Link>

        <h2 className="auth__title">
          {mode === 'signin' ? t('auth.signInTitle') : t('auth.signUpTitle')}
        </h2>

        <div className="auth__tabs">
          <button className={`auth__tab ${mode === 'signin' ? 'auth__tab--active' : ''}`} onClick={() => setMode('signin')}>
            {t('auth.signIn')}
          </button>
          <button className={`auth__tab ${mode === 'signup' ? 'auth__tab--active' : ''}`} onClick={() => setMode('signup')}>
            {t('auth.signUp')}
          </button>
        </div>

        {mode === 'signup' && (
          <div className="auth__role-switch">
            <span className="auth__role-label">{t('auth.iam')}</span>
            <button className={`auth__role-btn ${role === 'buyer' ? 'auth__role-btn--active' : ''}`} onClick={() => setRole('buyer')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {t('auth.buyer')}
            </button>
            <button className={`auth__role-btn ${role === 'seller' ? 'auth__role-btn--active' : ''}`} onClick={() => setRole('seller')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              {t('auth.seller')}
            </button>
          </div>
        )}

        <form className="auth__form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="auth__field">
              <label>{t('auth.fullName')}</label>
              <input type="text" name="name" placeholder={t('auth.placeholderName')} required />
            </div>
          )}

          <div className="auth__field">
            <label>{t('auth.email')}</label>
            <input type="email" name="email" placeholder={t('auth.placeholderEmail')} required />
          </div>

          {mode === 'signup' && (
            <div className="auth__field">
              <label>{t('auth.phone')}</label>
              <input type="tel" name="phone" placeholder={t('auth.placeholderPhone')} />
            </div>
          )}

          {mode === 'signup' && role === 'seller' && (
            <div className="auth__field">
              <label>{t('auth.storeName')}</label>
              <input type="text" name="store" placeholder={t('auth.placeholderStore')} required />
            </div>
          )}

          <div className="auth__field">
            <label>{t('auth.password')}</label>
            <input type="password" name="password" placeholder={t('auth.placeholderPassword')} required minLength={6} />
          </div>

          {mode === 'signup' && (
            <div className="auth__field">
              <label>{t('auth.confirmPassword')}</label>
              <input type="password" name="confirm" placeholder={t('auth.placeholderPassword')} required />
            </div>
          )}

          {mode === 'signin' && (
            <a href="#" className="auth__forgot" onClick={(e) => { e.preventDefault(); }}>{t('auth.forgot')}</a>
          )}

          {error && <p className="auth__error">{error}</p>}

          <button type="submit" className="auth__submit" disabled={submitting}>
            {submitting ? (mode === 'signin' ? '...' : '...') : (mode === 'signin' ? t('auth.signIn') : t('auth.create'))}
          </button>
        </form>

        <p className="auth__switch-mode">
          {mode === 'signin' ? (
            <>{t('auth.noAccount')} <Link to="/auth?mode=signup">{t('auth.signUpNow')}</Link></>
          ) : (
            <>{t('auth.haveAccount')} <Link to="/auth">{t('auth.signInNow')}</Link></>
          )}
        </p>

        {mode === 'signup' && (
          <p className="auth__terms">{t('auth.terms')}</p>
        )}
      </div>
    </div>
  );
}