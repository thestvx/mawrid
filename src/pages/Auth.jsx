import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import DotGrid from '../components/ui/DotGrid';
import './Auth.css';

export default function Auth() {
  const [mode, setMode] = useState('signin');
  const [role, setRole] = useState('buyer');
  const { t } = useLanguage();

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
          <button
            className={`auth__tab ${mode === 'signin' ? 'auth__tab--active' : ''}`}
            onClick={() => setMode('signin')}
          >
            {t('auth.signIn')}
          </button>
          <button
            className={`auth__tab ${mode === 'signup' ? 'auth__tab--active' : ''}`}
            onClick={() => setMode('signup')}
          >
            {t('auth.signUp')}
          </button>
        </div>

        {mode === 'signup' && (
          <div className="auth__role-switch">
            <span className="auth__role-label">{t('auth.iam')}</span>
            <button
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
              className={`auth__role-btn ${role === 'seller' ? 'auth__role-btn--active' : ''}`}
              onClick={() => setRole('seller')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              {t('auth.seller')}
            </button>
          </div>
        )}

        <form className="auth__form" onSubmit={(e) => e.preventDefault()}>
          <div className="auth__field">
            <label>{t('auth.fullName')}</label>
            <input type="text" placeholder={t('auth.placeholderName')} required />
          </div>

          <div className="auth__field">
            <label>{t('auth.email')}</label>
            <input type="email" placeholder={t('auth.placeholderEmail')} required />
          </div>

          {mode === 'signup' && (
            <>
              <div className="auth__field">
                <label>{t('auth.phone')}</label>
                <input type="tel" placeholder={t('auth.placeholderPhone')} required />
              </div>

              <div className="auth__field">
                <label>{t('auth.country')}</label>
                <select className="auth__select" required defaultValue="">
                  <option value="" disabled>{t('auth.selectCountry')}</option>
                  <option value="SA">{t('auth.countrySA')}</option>
                  <option value="AE">{t('auth.countryAE')}</option>
                  <option value="KW">{t('auth.countryKW')}</option>
                  <option value="QA">{t('auth.countryQA')}</option>
                  <option value="BH">{t('auth.countryBH')}</option>
                  <option value="OM">{t('auth.countryOM')}</option>
                  <option value="EG">{t('auth.countryEG')}</option>
                  <option value="JO">{t('auth.countryJO')}</option>
                  <option value="other">{t('auth.countryOther')}</option>
                </select>
              </div>
            </>
          )}

          {mode === 'signup' && role === 'seller' && (
            <>
              <div className="auth__divider" />

              <div className="auth__field">
                <label>{t('auth.storeName')}</label>
                <input type="text" placeholder={t('auth.placeholderStore')} required />
              </div>

              <div className="auth__field">
                <label>{t('auth.storeDesc')}</label>
                <textarea className="auth__textarea" placeholder={t('auth.placeholderStoreDesc')} rows={3} />
              </div>

              <div className="auth__field">
                <label>{t('auth.category')}</label>
                <select className="auth__select" required defaultValue="">
                  <option value="" disabled>{t('auth.category')}</option>
                  <option value="design">{t('auth.catDesign')}</option>
                  <option value="dev">{t('auth.catDev')}</option>
                  <option value="marketing">{t('auth.catMarketing')}</option>
                  <option value="video">{t('auth.catVideo')}</option>
                  <option value="writing">{t('auth.catWriting')}</option>
                  <option value="business">{t('auth.catBusiness')}</option>
                  <option value="other">{t('auth.catOther')}</option>
                </select>
              </div>

              <div className="auth__field">
                <label>{t('auth.taxId')}</label>
                <input type="text" placeholder={t('auth.placeholderTaxId')} />
              </div>

              <div className="auth__field">
                <label>{t('auth.businessEmail')}</label>
                <input type="email" placeholder={t('auth.placeholderEmail')} />
              </div>
            </>
          )}

          <div className="auth__field">
            <label>{t('auth.password')}</label>
            <input type="password" placeholder={t('auth.placeholderPassword')} required />
          </div>

          {mode === 'signup' && (
            <div className="auth__field">
              <label>{t('auth.confirmPassword')}</label>
              <input type="password" placeholder={t('auth.placeholderPassword')} required />
            </div>
          )}

          {mode === 'signin' && (
            <a href="#" className="auth__forgot">{t('auth.forgot')}</a>
          )}

          <button type="submit" className="auth__submit">
            {mode === 'signin' ? t('auth.signIn') : t('auth.create')}
          </button>
        </form>

        <p className="auth__switch-mode">
          {mode === 'signin' ? (
            <>{t('auth.noAccount')} <Link to="/auth" onClick={() => setMode('signup')}>{t('auth.signUpNow')}</Link></>
          ) : (
            <>{t('auth.haveAccount')} <Link to="/auth" onClick={() => setMode('signin')}>{t('auth.signInNow')}</Link></>
          )}
        </p>

        {mode === 'signup' && (
          <p className="auth__terms">{t('auth.terms')}</p>
        )}
      </div>
    </div>
  );
}
