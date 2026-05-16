import PropTypes from 'prop-types';
import { Search, X } from 'lucide-react';
import styles from './SearchBar.module.css';

export default function SearchBar({ query, onChange, resultCount, isLoading }) {
  return (
    /* Sticky so search pins to top of main column (#9) */
    <div className={styles.wrapper}>
      <div className={styles.inputRow}>
        <Search size={17} className={styles.icon} />
        <input
          className={styles.input}
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search by product name, code, or category…"
          aria-label="Search products"
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button
            className={styles.clearBtn}
            onClick={() => onChange('')}
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>
      {!isLoading && (
        <p className={styles.resultCount}>
          {resultCount === 0
            ? 'No products found'
            : `${resultCount} product${resultCount === 1 ? '' : 's'} found`}
        </p>
      )}
    </div>
  );
}

SearchBar.propTypes = {
  query: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  resultCount: PropTypes.number.isRequired,
  isLoading: PropTypes.bool.isRequired,
};
SearchBar.displayName = 'SearchBar';
