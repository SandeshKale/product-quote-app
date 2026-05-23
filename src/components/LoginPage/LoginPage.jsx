import PropTypes from 'prop-types';
import { useState, useRef, useEffect } from 'react';
import { Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { APP_NAME } from '../../constants/columnMap';
import styles from './LoginPage.module.css';

const FIXED_USERNAME = 'mbmbinu';

export default function LoginPage({ onLogin, error, isLoading }) {
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const passwordRef = useRef(null);

  useEffect(() => {
    passwordRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.trim()) onLogin(FIXED_USERNAME, password);
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.iconWrap}>
            <Lock size={22} strokeWidth={2} />
          </div>
          <h1 className={styles.appName}>{APP_NAME}</h1>
          <p className={styles.tagline}>Sign in to continue</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {/* Username — read-only display */}
          <div className={styles.fieldWrap}>
            <label className={styles.label} htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              className={styles.inputReadonly}
              value={FIXED_USERNAME}
              readOnly
              aria-readonly="true"
            />
          </div>

          {/* Password */}
          <div className={styles.fieldWrap}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <div className={styles.inputRow}>
              <input
                ref={passwordRef}
                id="password"
                type={showPass ? 'text' : 'password'}
                className={`${styles.input} ${error ? styles.inputError : ''}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
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
            disabled={isLoading || !password.trim()}
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
