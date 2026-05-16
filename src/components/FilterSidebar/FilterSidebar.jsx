import PropTypes from 'prop-types';
import { SlidersHorizontal, X } from 'lucide-react';
import { formatMargin, formatCurrency } from '../../utils/formatters';
import styles from './FilterSidebar.module.css';

const STOCK_STATUS_OPTIONS = [
  { value: 'Good', label: '✓ In Stock' },
  { value: 'Discntd', label: '✗ Discontinued' },
];

export default function FilterSidebar({
  filters,
  setFilters,
  clearFilters,
  availableCategories,
  availableDimensions,
  products,
  isOpen,
  onClose,
}) {
  const mrpValues = products.map((p) => p.mrp).filter(Boolean);
  const rrpValues = products.map((p) => p.rrp).filter(Boolean);
  const maxMRP = mrpValues.length ? Math.ceil(Math.max(...mrpValues)) : 200000;
  const maxRRP = rrpValues.length ? Math.ceil(Math.max(...rrpValues)) : 200000;

  const hasActive =
    filters.categories.length > 0 ||
    filters.mrpRange.min != null ||
    filters.mrpRange.max != null ||
    filters.rrpRange.min != null ||
    filters.rrpRange.max != null ||
    filters.marginRange.min != null ||
    filters.marginRange.max != null ||
    filters.dimensions.length > 0 ||
    filters.stockStatus.length > 0;

  const toggle = (key, val) =>
    setFilters((p) => ({
      ...p,
      [key]: p[key].includes(val) ? p[key].filter((v) => v !== val) : [...p[key], val],
    }));

  const setRange = (key, side, value) =>
    setFilters((p) => ({ ...p, [key]: { ...p[key], [side]: value ? Number(value) : null } }));

  const setMarginRange = (side, raw) =>
    setFilters((p) => ({
      ...p,
      marginRange: { ...p.marginRange, [side]: raw ? Number(raw) / 100 : null },
    }));

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose} />}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarTitle}>
            <SlidersHorizontal size={14} />
            <span>Filters</span>
          </div>
          <div className={styles.sidebarActions}>
            {hasActive && (
              <button className={styles.clearBtn} onClick={clearFilters}>
                Clear all
              </button>
            )}
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close filters">
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Stock Status */}
        <Section title="Stock Status">
          <div className={styles.checkboxList}>
            {STOCK_STATUS_OPTIONS.map(({ value, label }) => (
              <label key={value} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={filters.stockStatus.includes(value)}
                  onChange={() => toggle('stockStatus', value)}
                />
                <span className={value === 'Discntd' ? styles.discontinued : ''}>{label}</span>
              </label>
            ))}
          </div>
        </Section>

        {/* Category */}
        <Section title="Category">
          <div className={styles.checkboxList}>
            {availableCategories.map((cat) => (
              <label key={cat} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={filters.categories.includes(cat)}
                  onChange={() => toggle('categories', cat)}
                />
                <span>{cat}</span>
              </label>
            ))}
          </div>
        </Section>

        {/* Dimensions — multi-select with checkboxes in a scrollable box (#7) */}
        {availableDimensions.length > 0 && (
          <Section
            title={`Dimensions${filters.dimensions.length > 0 ? ` (${filters.dimensions.length})` : ''}`}
          >
            <div className={styles.dimBox}>
              {availableDimensions.map((d) => (
                <label key={d} className={styles.dimOption}>
                  <input
                    type="checkbox"
                    checked={filters.dimensions.includes(d)}
                    onChange={() => toggle('dimensions', d)}
                  />
                  <span>{d}</span>
                </label>
              ))}
            </div>
            {filters.dimensions.length > 0 && (
              <button
                className={styles.clearBtn}
                style={{ marginTop: 6 }}
                onClick={() => setFilters((p) => ({ ...p, dimensions: [] }))}
              >
                Clear dimensions
              </button>
            )}
          </Section>
        )}

        {/* MRP Range */}
        <Section title="MRP Range">
          <RangeInputs
            min={filters.mrpRange.min}
            max={filters.mrpRange.max}
            placeholderMin={`Min (${formatCurrency(0)})`}
            placeholderMax={`Max (${formatCurrency(maxMRP)})`}
            onMin={(v) => setRange('mrpRange', 'min', v)}
            onMax={(v) => setRange('mrpRange', 'max', v)}
          />
        </Section>

        {/* RRP Range */}
        <Section title="RRP Range">
          <RangeInputs
            min={filters.rrpRange.min}
            max={filters.rrpRange.max}
            placeholderMin={`Min (${formatCurrency(0)})`}
            placeholderMax={`Max (${formatCurrency(maxRRP)})`}
            onMin={(v) => setRange('rrpRange', 'min', v)}
            onMax={(v) => setRange('rrpRange', 'max', v)}
          />
        </Section>

        {/* Margin % */}
        <Section title="Margin %">
          <RangeInputs
            min={filters.marginRange.min != null ? Math.round(filters.marginRange.min * 100) : null}
            max={filters.marginRange.max != null ? Math.round(filters.marginRange.max * 100) : null}
            placeholderMin="Min %"
            placeholderMax="Max %"
            onMin={(v) => setMarginRange('min', v)}
            onMax={(v) => setMarginRange('max', v)}
          />
        </Section>
      </aside>
    </>
  );
}

function Section({ title, children }) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      {children}
    </div>
  );
}

function RangeInputs({ min, max, placeholderMin, placeholderMax, onMin, onMax }) {
  return (
    <div className={styles.rangeInputs}>
      <input
        type="number"
        className={styles.rangeInput}
        placeholder={placeholderMin}
        value={min ?? ''}
        onChange={(e) => onMin(e.target.value)}
      />
      <span className={styles.rangeSep}>–</span>
      <input
        type="number"
        className={styles.rangeInput}
        placeholder={placeholderMax}
        value={max ?? ''}
        onChange={(e) => onMax(e.target.value)}
      />
    </div>
  );
}

const rangeShape = PropTypes.shape({ min: PropTypes.number, max: PropTypes.number });
FilterSidebar.propTypes = {
  filters: PropTypes.shape({
    categories: PropTypes.arrayOf(PropTypes.string).isRequired,
    mrpRange: rangeShape.isRequired,
    rrpRange: rangeShape.isRequired,
    marginRange: rangeShape.isRequired,
    dimensions: PropTypes.arrayOf(PropTypes.string).isRequired,
    stockStatus: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  setFilters: PropTypes.func.isRequired,
  clearFilters: PropTypes.func.isRequired,
  availableCategories: PropTypes.arrayOf(PropTypes.string).isRequired,
  availableDimensions: PropTypes.arrayOf(PropTypes.string).isRequired,
  products: PropTypes.arrayOf(PropTypes.object).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
Section.propTypes = { title: PropTypes.string.isRequired, children: PropTypes.node.isRequired };
RangeInputs.propTypes = {
  min: PropTypes.number,
  max: PropTypes.number,
  placeholderMin: PropTypes.string,
  placeholderMax: PropTypes.string,
  onMin: PropTypes.func.isRequired,
  onMax: PropTypes.func.isRequired,
};
FilterSidebar.displayName = 'FilterSidebar';
