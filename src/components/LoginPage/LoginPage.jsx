import PropTypes from 'prop-types';
import { useState, useRef, useEffect } from 'react';
import { Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { APP_NAME } from '../../constants/columnMap';
import styles from './LoginPage.module.css';

export default function LoginPage({ onLogin, error, isLoading }) {
  const [passphrase, setPassphrase] = useState('');
  const [showPass, setShowPass] = useState(false);
  const inputRef = useRef(null);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passphrase.trim()) onLogin(passphrase);
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo / brand */}
        <div className={styles.brand}>
          <div className={styles.iconWrap}>
            <Lock size={22} strokeWidth={2} />
          </div>
          <h1 className={styles.appName}>{APP_NAME}</h1>
          <p className={styles.tagline}>Sign in to continue</p>
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.fieldWrap}>
            <label className={styles.label} htmlFor="passphrase">
              Passphrase
            </label>
            <div className={styles.inputRow}>
              <input
                ref={inputRef}
                id="passphrase"
                type={showPass ? 'text' : 'password'}
                className={`${styles.input} ${error ? styles.inputError : ''}`}
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Enter passphrase"
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? 'Hide passphrase' : 'Show passphrase'}
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <p className={styles.errorMsg}>{error}</p>}
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading || !passphrase.trim()}
          >
            {isLoading ? (
              <span className={styles.spinner} aria-label="Signing in" />
            ) : (
              <LogIn size={16} />
            )}
            <span>{isLoading ? 'Signing in…' : 'Sign in'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

LoginPage.propTypes = {
  onLogin: PropTypes.func.isRequired,
  error: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
};
