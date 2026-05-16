import PropTypes from 'prop-types';
import { SlidersHorizontal, X } from 'lucide-react';
import { formatMargin, formatCurrency } from '../../utils/formatters';
import styles from './FilterSidebar.module.css';

export default function FilterSidebar({
  filters,
  setFilters,
  clearFilters,
  availableCategories,
  products,
  isOpen,
  onClose,
}) {
  const mrpValues = products.map((p) => p.mrp).filter(Boolean);
  const rrpValues = products.map((p) => p.rrp).filter(Boolean);
  const maxMRP = mrpValues.length ? Math.ceil(Math.max(...mrpValues)) : 100000;
  const maxRRP = rrpValues.length ? Math.ceil(Math.max(...rrpValues)) : 100000;

  const gstRates = [...new Set(products.map((p) => p.gstRate).filter((v) => v != null))].sort(
    (a, b) => a - b
  );

  const hasActive =
    filters.categories.length > 0 ||
    filters.mrpRange.min != null ||
    filters.mrpRange.max != null ||
    filters.rrpRange.min != null ||
    filters.rrpRange.max != null ||
    filters.marginRange.min != null ||
    filters.marginRange.max != null ||
    filters.gstRate != null;

  function toggleCategory(cat) {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  }

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose} />}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarTitle}>
            <SlidersHorizontal size={16} />
            <span>Filters</span>
          </div>
          <div className={styles.sidebarActions}>
            {hasActive && (
              <button className={styles.clearBtn} onClick={clearFilters}>
                Clear all
              </button>
            )}
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close filters">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Category</h3>
          <div className={styles.checkboxList}>
            {availableCategories.map((cat) => (
              <label key={cat} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={filters.categories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  className={styles.checkbox}
                />
                <span>{cat}</span>
              </label>
            ))}
          </div>
        </div>

        {/* MRP Range */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>MRP Range</h3>
          <div className={styles.rangeInputs}>
            <input
              type="number"
              placeholder={`Min (${formatCurrency(0)})`}
              value={filters.mrpRange.min ?? ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  mrpRange: { ...prev.mrpRange, min: e.target.value ? Number(e.target.value) : null },
                }))
              }
              className={styles.rangeInput}
              min={0}
              max={maxMRP}
            />
            <span className={styles.rangeSep}>–</span>
            <input
              type="number"
              placeholder={`Max (${formatCurrency(maxMRP)})`}
              value={filters.mrpRange.max ?? ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  mrpRange: { ...prev.mrpRange, max: e.target.value ? Number(e.target.value) : null },
                }))
              }
              className={styles.rangeInput}
              min={0}
              max={maxMRP}
            />
          </div>
        </div>

        {/* RRP Range */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>RRP Range</h3>
          <div className={styles.rangeInputs}>
            <input
              type="number"
              placeholder={`Min (${formatCurrency(0)})`}
              value={filters.rrpRange.min ?? ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  rrpRange: { ...prev.rrpRange, min: e.target.value ? Number(e.target.value) : null },
                }))
              }
              className={styles.rangeInput}
            />
            <span className={styles.rangeSep}>–</span>
            <input
              type="number"
              placeholder={`Max (${formatCurrency(maxRRP)})`}
              value={filters.rrpRange.max ?? ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  rrpRange: { ...prev.rrpRange, max: e.target.value ? Number(e.target.value) : null },
                }))
              }
              className={styles.rangeInput}
            />
          </div>
        </div>

        {/* Margin % Range — visible to user for filtering */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Margin %</h3>
          <div className={styles.rangeInputs}>
            <input
              type="number"
              placeholder="Min %"
              value={
                filters.marginRange.min != null ? Math.round(filters.marginRange.min * 100) : ''
              }
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  marginRange: {
                    ...prev.marginRange,
                    min: e.target.value ? Number(e.target.value) / 100 : null,
                  },
                }))
              }
              className={styles.rangeInput}
              min={0}
              max={100}
            />
            <span className={styles.rangeSep}>–</span>
            <input
              type="number"
              placeholder="Max %"
              value={
                filters.marginRange.max != null ? Math.round(filters.marginRange.max * 100) : ''
              }
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  marginRange: {
                    ...prev.marginRange,
                    max: e.target.value ? Number(e.target.value) / 100 : null,
                  },
                }))
              }
              className={styles.rangeInput}
              min={0}
              max={100}
            />
          </div>
        </div>

        {/* GST Rate */}
        {gstRates.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>GST Rate</h3>
            <div className={styles.radioList}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="gstRate"
                  checked={filters.gstRate === null}
                  onChange={() => setFilters((prev) => ({ ...prev, gstRate: null }))}
                  className={styles.radio}
                />
                <span>All</span>
              </label>
              {gstRates.map((rate) => (
                <label key={rate} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="gstRate"
                    checked={filters.gstRate === rate}
                    onChange={() => setFilters((prev) => ({ ...prev, gstRate: rate }))}
                    className={styles.radio}
                  />
                  <span>{formatMargin(rate)}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

const rangeShape = PropTypes.shape({ min: PropTypes.number, max: PropTypes.number });

FilterSidebar.propTypes = {
  filters: PropTypes.shape({
    categories: PropTypes.arrayOf(PropTypes.string).isRequired,
    mrpRange: rangeShape.isRequired,
    rrpRange: rangeShape.isRequired,
    marginRange: rangeShape.isRequired,
    gstRate: PropTypes.number,
  }).isRequired,
  setFilters: PropTypes.func.isRequired,
  clearFilters: PropTypes.func.isRequired,
  availableCategories: PropTypes.arrayOf(PropTypes.string).isRequired,
  products: PropTypes.arrayOf(PropTypes.object).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

FilterSidebar.displayName = 'FilterSidebar';
