import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const pageVariants = {
  initial: { opacity: 0, y: 20, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -20, filter: 'blur(8px)', transition: { duration: 0.3 } },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const inputVariants = {
  focus: { scale: 1.01, transition: { duration: 0.2 } },
};

function LoadingSpinner() {
  return (
    <svg className="auth__spinner" width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="50 20" />
    </svg>
  );
}

function EyeIcon({ show }) {
  return show ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function Auth() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const initialRole = searchParams.get('role') === 'seller' ? 'seller' : 'buyer';

  const [mode, setMode] = useState(initialMode);
  const [role, setRole] = useState(initialRole);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { t, dir } = useLanguage();
  const { login, signup, user, role: userRole } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef(null);

  useEffect(() => {
    if (user) {
      if (userRole === 'seller') navigate('/dashboard/seller', { replace: true });
      else if (userRole === 'buyer') navigate('/dashboard/buyer', { replace: true });
      else if (userRole === 'admin') navigate('/owner', { replace: true });
    }
  }, [user, userRole, navigate]);

  const switchMode = (newMode) => {
    setError('');
    setMode(newMode);
    setShowPassword(false);
    setShowConfirm(false);
  };

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
      } else {
        const name = form.name.value;
        const phone = form.phone?.value || '';
        const storeName = form.store?.value || '';
        const confirmPassword = form.confirm?.value;
        if (confirmPassword && password !== confirmPassword) {
          setError(t('auth.errorPasswordMismatch') || 'Passwords do not match');
          setSubmitting(false);
          return;
        }
        await signup({ email, password, name, role, phone, storeName });
        if (role === 'seller') navigate('/dashboard/seller', { replace: true });
        else navigate('/dashboard/buyer', { replace: true });
      }
    } catch (err) {
      const code = err.code;
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setError(t('auth.errorInvalid'));
      } else if (code === 'auth/email-already-in-use') {
        setError(t('auth.errorEmailInUse'));
      } else if (code === 'auth/weak-password') {
        setError(t('auth.errorWeakPassword'));
      } else {
        setError(err.message || 'An error occurred');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__bg-pattern" />
      <div className="auth__bg-glow auth__bg-glow--1" />
      <div className="auth__bg-glow auth__bg-glow--2" />

      <motion.div
        className="auth__card"
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link to="/" className="auth__logo">
          <img src="/logos/Black-logo.png" alt="Mawrid" width="160" height="50" />
        </Link>

        <motion.div
          className="auth__tabs"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.button
            variants={staggerItem}
            className={`auth__tab ${mode === 'signin' ? 'auth__tab--active' : ''}`}
            onClick={() => switchMode('signin')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {t('auth.signIn')}
          </motion.button>
          <motion.button
            variants={staggerItem}
            className={`auth__tab ${mode === 'signup' ? 'auth__tab--active' : ''}`}
            onClick={() => switchMode('signup')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {t('auth.signUp')}
          </motion.button>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <form ref={formRef} className="auth__form" onSubmit={handleSubmit}>
              <motion.div className="auth__form-header" variants={staggerContainer} initial="initial" animate="animate">
                <motion.h2 className="auth__title" variants={staggerItem}>
                  {mode === 'signin' ? t('auth.signInTitle') : t('auth.signUpTitle')}
                </motion.h2>
                <motion.p className="auth__subtitle" variants={staggerItem}>
                  {mode === 'signin'
                    ? (dir === 'rtl' ? 'أدخل بياناتك للوصول إلى حسابك' : 'Enter your credentials to access your account')
                    : (dir === 'rtl' ? 'انشئ حسابك وابدأ رحلتك الرقمية' : 'Create your account and start your digital journey')
                  }
                </motion.p>
              </motion.div>

              {mode === 'signup' && (
                <motion.div className="auth__role-switch" variants={staggerItem} initial="initial" animate="animate">
                  <button
                    type="button"
                    className={`auth__role-btn ${role === 'buyer' ? 'auth__role-btn--active' : ''}`}
                    onClick={() => setRole('buyer')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    {t('auth.buyer')}
                  </button>
                  <button
                    type="button"
                    className={`auth__role-btn ${role === 'seller' ? 'auth__role-btn--active' : ''}`}
                    onClick={() => setRole('seller')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    {t('auth.seller')}
                  </button>
                </motion.div>
              )}

              <motion.div className="auth__fields" variants={staggerContainer} initial="initial" animate="animate">
                {mode === 'signup' && (
                  <motion.div className={`auth__field ${focusedField === 'name' ? 'auth__field--focused' : ''}`} variants={staggerItem}>
                    <label>{t('auth.fullName')}</label>
                    <div className="auth__input-wrap">
                      <svg className="auth__field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      <input
                        type="text"
                        name="name"
                        placeholder={t('auth.placeholderName')}
                        required
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </div>
                  </motion.div>
                )}

                <motion.div className={`auth__field ${focusedField === 'email' ? 'auth__field--focused' : ''}`} variants={staggerItem}>
                  <label>{t('auth.email')}</label>
                  <div className="auth__input-wrap">
                    <svg className="auth__field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    <input
                      type="email"
                      name="email"
                      placeholder={t('auth.placeholderEmail')}
                      required
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                </motion.div>

                {mode === 'signup' && (
                  <motion.div className={`auth__field ${focusedField === 'phone' ? 'auth__field--focused' : ''}`} variants={staggerItem}>
                    <label>{t('auth.phone')}</label>
                    <div className="auth__input-wrap">
                      <svg className="auth__field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                      <input
                        type="tel"
                        name="phone"
                        placeholder={t('auth.placeholderPhone')}
                        onFocus={() => setFocusedField('phone')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </div>
                  </motion.div>
                )}

                {mode === 'signup' && role === 'seller' && (
                  <motion.div className={`auth__field ${focusedField === 'store' ? 'auth__field--focused' : ''}`} variants={staggerItem}>
                    <label>{t('auth.storeName')}</label>
                    <div className="auth__input-wrap">
                      <svg className="auth__field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                      <input
                        type="text"
                        name="store"
                        placeholder={t('auth.placeholderStore')}
                        required
                        onFocus={() => setFocusedField('store')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </div>
                  </motion.div>
                )}

                <motion.div className={`auth__field ${focusedField === 'password' ? 'auth__field--focused' : ''}`} variants={staggerItem}>
                  <label>{t('auth.password')}</label>
                  <div className="auth__input-wrap">
                    <svg className="auth__field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder={t('auth.placeholderPassword')}
                      required
                      minLength={6}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                    />
                    <button
                      type="button"
                      className="auth__eye-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      <EyeIcon show={showPassword} />
                    </button>
                  </div>
                </motion.div>

                {mode === 'signup' && (
                  <motion.div className={`auth__field ${focusedField === 'confirm' ? 'auth__field--focused' : ''}`} variants={staggerItem}>
                    <label>{t('auth.confirmPassword')}</label>
                    <div className="auth__input-wrap">
                      <svg className="auth__field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        name="confirm"
                        placeholder={t('auth.placeholderPassword')}
                        required
                        onFocus={() => setFocusedField('confirm')}
                        onBlur={() => setFocusedField(null)}
                      />
                      <button
                        type="button"
                        className="auth__eye-btn"
                        onClick={() => setShowConfirm(!showConfirm)}
                        tabIndex={-1}
                      >
                        <EyeIcon show={showConfirm} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {mode === 'signin' && (
                <motion.a
                  href="#"
                  className="auth__forgot"
                  onClick={(e) => e.preventDefault()}
                  variants={staggerItem}
                  initial="initial"
                  animate="animate"
                  whileHover={{ x: dir === 'rtl' ? -2 : 2 }}
                >
                  {t('auth.forgot')}
                </motion.a>
              )}

              <AnimatePresence>
                {error && (
                  <motion.div
                    className="auth__error"
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                className="auth__submit"
                disabled={submitting}
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.98 }}
                variants={staggerItem}
                initial="initial"
                animate="animate"
              >
                {submitting ? (
                  <span className="auth__submit-loading">
                    <LoadingSpinner />
                    {mode === 'signin' ? (dir === 'rtl' ? 'جاري تسجيل الدخول...' : 'Signing in...') : (dir === 'rtl' ? 'جاري إنشاء الحساب...' : 'Creating account...')}
                  </span>
                ) : (
                  mode === 'signin' ? t('auth.signIn') : t('auth.create')
                )}
              </motion.button>
            </form>
          </motion.div>
        </AnimatePresence>

        <motion.div
          className="auth__divider"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <span>{t('auth.orContinueWith')}</span>
        </motion.div>

        <motion.div
          className="auth__social"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.button
            type="button"
            className="auth__social-btn"
            variants={staggerItem}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          </motion.button>
          <motion.button
            type="button"
            className="auth__social-btn"
            variants={staggerItem}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </motion.button>
          <motion.button
            type="button"
            className="auth__social-btn"
            variants={staggerItem}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          </motion.button>
        </motion.div>

        <motion.p
          className="auth__switch-mode"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {mode === 'signin' ? (
            <>{t('auth.noAccount')} <Link to="/auth?mode=signup">{t('auth.signUpNow')}</Link></>
          ) : (
            <>{t('auth.haveAccount')} <Link to="/auth">{t('auth.signInNow')}</Link></>
          )}
        </motion.p>

        {mode === 'signup' && (
          <motion.p
            className="auth__terms"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {t('auth.terms')}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
