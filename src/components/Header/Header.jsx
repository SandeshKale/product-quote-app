import PropTypes from 'prop-types';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { APP_NAME } from '../../constants/columnMap';
import { formatDateTime } from '../../utils/formatters';
import styles from './Header.module.css';

export default function Header({ metadata, status, onRefresh }) {
  const isStale = status === 'stale';
  const isLoading = status === 'loading';

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.appName}>{APP_NAME}</h1>
        <div className={styles.versionBadge}>
          {isStale && <AlertTriangle size={14} className={styles.staleIcon} />}
          <span className={styles.fileName}>
            {metadata?.fileName ?? 'Loading…'}
          </span>
          {metadata?.modifiedTime && (
            <>
              <span className={styles.separator}>·</span>
              <span className={styles.modifiedTime}>
                Updated {formatDateTime(metadata.modifiedTime)}
              </span>
            </>
          )}
          {isStale && (
            <span className={styles.staleLabel}>(offline — showing cached data)</span>
          )}
        </div>
      </div>

      <div className={styles.right}>
        <button
          className={styles.refreshBtn}
          onClick={onRefresh}
          disabled={isLoading}
          aria-label="Refresh product data from Google Drive"
          title="Refresh data"
        >
          <RefreshCw size={16} className={isLoading ? styles.spinning : ''} />
          <span>{isLoading ? 'Syncing…' : 'Refresh'}</span>
        </button>
      </div>
    </header>
  );
}

Header.propTypes = {
  metadata: PropTypes.shape({
    fileName: PropTypes.string,
    modifiedTime: PropTypes.string,
  }),
  status: PropTypes.string.isRequired,
  onRefresh: PropTypes.func.isRequired,
};

Header.displayName = 'Header';
