import { useState, useEffect } from 'react';
import { SlidersHorizontal, ShoppingCart } from 'lucide-react';
import Header from './components/Header/Header';
import SearchBar from './components/SearchBar/SearchBar';
import FilterSidebar from './components/FilterSidebar/FilterSidebar';
import ProductList from './components/ProductList/ProductList';
import QuotePanel from './components/QuotePanel/QuotePanel';
import { useDataSync } from './hooks/useDataSync';
import { useSearch } from './hooks/useSearch';
import { useQuote } from './hooks/useQuote';
import { formatCurrency } from './utils/formatters';
import './index.css';
import styles from './App.module.css';

export default function App() {
  const { products, metadata, status, refresh } = useDataSync();
  const {
    query,
    setQuery,
    filters,
    setFilters,
    clearFilters,
    results,
    availableCategories,
    availableDimensions,
  } = useSearch(products);

  // New useQuote API — uses enrichedItems + adjustedTotals
  const {
    items,
    enrichedItems,
    adjustedTotals,
    quoteTemplateItems,
    marginOverrides,
    weightedMarginPct,
    hasAnyOverride,
    addItem,
    removeItem,
    updateQuantity,
    clearQuote,
    setItemMargin,
    resetItemMargin,
    itemCount,
  } = useQuote();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  // Dark mode — persisted to localStorage
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('pq_dark') === 'true';
    } catch {
      return false;
    }
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    try {
      localStorage.setItem('pq_dark', darkMode ? 'true' : 'false');
    } catch {
      /**/
    }
  }, [darkMode]);

  const isLoading = status === 'loading' || status === 'idle';

  return (
    <div className={styles.app}>
      <Header
        metadata={metadata}
        status={status}
        onRefresh={refresh}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((d) => !d)}
      />

      <div className={styles.body}>
        <FilterSidebar
          filters={filters}
          setFilters={setFilters}
          clearFilters={clearFilters}
          availableCategories={availableCategories}
          availableDimensions={availableDimensions}
          products={products}
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
        />

        <main className={styles.main}>
          {/* Sticky bar: Filters button (mobile) + Search bar pin together (#5) */}
          <div className={styles.searchArea}>
            <div className={styles.searchRow}>
              <button className={styles.filterToggle} onClick={() => setIsFilterOpen(true)}>
                <SlidersHorizontal size={15} />
                <span>Filters</span>
              </button>
              <SearchBar
                query={query}
                onChange={setQuery}
                resultCount={results.length}
                isLoading={isLoading}
              />
            </div>
          </div>

          <div className={styles.results}>
            <ProductList
              products={results}
              quoteItems={items}
              onAdd={addItem}
              isLoading={isLoading}
              status={status}
            />
          </div>
        </main>
      </div>

      {/* Quote bar — position:fixed bottom */}
      <div className={styles.quoteBar}>
        <div className={styles.quoteBarContent}>
          <span className={styles.quoteBarSummary}>
            {itemCount === 0 ? (
              'Add products to build a quote'
            ) : (
              <>
                {itemCount} item{itemCount !== 1 ? 's' : ''} ·{' '}
                <strong>{formatCurrency(adjustedTotals.totalDealerPostTax)}</strong> dealer post-tax
              </>
            )}
          </span>
          <button
            className={styles.viewQuoteBtn}
            onClick={() => itemCount > 0 && setIsQuoteOpen(true)}
            disabled={itemCount === 0}
          >
            <ShoppingCart size={15} />
            <span>View Quote</span>
            {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
          </button>
        </div>
      </div>

      <QuotePanel
        enrichedItems={enrichedItems}
        adjustedTotals={adjustedTotals}
        quoteTemplateItems={quoteTemplateItems}
        onRemove={removeItem}
        onUpdateQuantity={updateQuantity}
        onClear={clearQuote}
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        setItemMargin={setItemMargin}
        resetItemMargin={resetItemMargin}
        marginOverrides={marginOverrides}
        weightedMarginPct={weightedMarginPct}
        hasAnyOverride={hasAnyOverride}
      />
    </div>
  );
}
