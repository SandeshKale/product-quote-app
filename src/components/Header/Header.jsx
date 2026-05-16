import PropTypes from 'prop-types';
import { RefreshCw, AlertTriangle, Sun, Moon } from 'lucide-react';
import { APP_NAME, APP_VERSION } from '../../constants/columnMap';
import { formatDateTime } from '../../utils/formatters';
import styles from './Header.module.css';

export default function Header({ metadata, status, onRefresh, darkMode, onToggleDark }) {
  const isStale = status === 'stale';
  const isLoading = status === 'loading';

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.titleRow}>
          <h1 className={styles.appName}>{APP_NAME}</h1>
          <span className={styles.version}>v{APP_VERSION}</span>
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
};

Header.displayName = 'Header';
