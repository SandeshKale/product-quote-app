import PropTypes from 'prop-types';
import { RefreshCw, AlertTriangle, Sun, Moon, LogOut } from 'lucide-react';
import { useState, useCallback } from 'react';
import { APP_NAME, APP_VERSION } from '../../constants/columnMap';
import { formatDateTime } from '../../utils/formatters';
import styles from './Header.module.css';

const EASTER_EGG_CLICKS = 5;
const GITHUB_URL = 'https://github.com/SandeshKale';

export default function Header({ metadata, status, onRefresh, darkMode, onToggleDark, onLogout }) {
  const isStale = status === 'stale';
  const isLoading = status === 'loading';

  // Easter egg — click version badge 5× to reveal GitHub link (#8)
  const [eggClicks, setEggClicks] = useState(0);
  const [eggVisible, setEggVisible] = useState(false);

  const handleVersionClick = useCallback(() => {
    setEggClicks((n) => {
      const next = n + 1;
      if (next >= EASTER_EGG_CLICKS) {
        setEggVisible(true);
        return 0;
      }
      return next;
    });
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.titleRow}>
          <h1 className={styles.appName}>{APP_NAME}</h1>
          <button
            className={styles.version}
            onClick={handleVersionClick}
            aria-label="App version"
            title={eggClicks > 0 ? `${EASTER_EGG_CLICKS - eggClicks} more…` : 'App version'}
          >
            v{APP_VERSION}
          </button>
        </div>

        <div className={styles.versionBadge}>
          {isStale && <AlertTriangle size={13} className={styles.staleIcon} />}
          <span className={styles.fileName}>{metadata?.fileName ?? 'Loading…'}</span>
          {metadata?.modifiedTime && (
            <>
              <span className={styles.sep}>·</span>
              <span className={styles.modifiedTime}>
                Updated {formatDateTime(metadata.modifiedTime)}
              </span>
            </>
          )}
          {isStale && <span className={styles.staleLabel}>(offline — cached)</span>}
        </div>

        {/* Easter egg — revealed after 5 clicks on version badge */}
        {eggVisible && (
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.easterEgg}
            onClick={() => setEggVisible(false)}
          >
            🐣 Built by Sandesh · github.com/SandeshKale
          </a>
        )}
      </div>

      <div className={styles.right}>
        <button
          className={styles.iconBtn}
          onClick={onToggleDark}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          title={darkMode ? 'Light mode' : 'Dark mode'}
        >
          {darkMode ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <button
          className={styles.logoutBtn}
          onClick={onLogout}
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut size={15} />
        </button>
        <button
          className={styles.refreshBtn}
          onClick={onRefresh}
          disabled={isLoading}
          aria-label="Refresh product data"
        >
          <RefreshCw size={15} className={isLoading ? styles.spinning : ''} />
          <span className={styles.refreshLabel}>{isLoading ? 'Syncing…' : 'Refresh'}</span>
        </button>
      </div>
    </header>
  );
}

Header.propTypes = {
  metadata: PropTypes.shape({ fileName: PropTypes.string, modifiedTime: PropTypes.string }),
  status: PropTypes.string.isRequired,
  onRefresh: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
  onToggleDark: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

Header.displayName = 'Header';
