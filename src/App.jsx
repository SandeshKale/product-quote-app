import { useState } from 'react';
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
  const { products, metadata, status, lastSynced, refresh } = useDataSync();
  const { query, setQuery, filters, setFilters, clearFilters, results, availableCategories } =
    useSearch(products);
  const {
    items,
    totals,
    quoteTemplateItems,
    addItem,
    removeItem,
    updateQuantity,
    clearQuote,
    itemCount,
  } = useQuote();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  const isLoading = status === 'loading' || status === 'idle';

  return (
    <div className={styles.app}>
      <Header
        metadata={metadata}
        status={status}
        lastSynced={lastSynced}
        onRefresh={refresh}
      />

      <div className={styles.body}>
        <FilterSidebar
          filters={filters}
          setFilters={setFilters}
          clearFilters={clearFilters}
          availableCategories={availableCategories}
          products={products}
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
        />

        <main className={styles.main}>
          {/* Mobile filter toggle */}
          <div className={styles.mobileBar}>
            <button
              className={styles.filterToggle}
              onClick={() => setIsFilterOpen(true)}
            >
              <SlidersHorizontal size={16} />
              <span>Filters</span>
            </button>
          </div>

          <div className={styles.searchArea}>
            <SearchBar
              query={query}
              onChange={setQuery}
              resultCount={results.length}
              isLoading={isLoading}
            />
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

      {/* Sticky quote bar at bottom */}
      <div className={styles.quoteBar}>
        <div className={styles.quoteBarContent}>
          <span className={styles.quoteBarSummary}>
            {itemCount === 0 ? (
              'Add products to build a quote'
            ) : (
              <>
                <strong>{itemCount}</strong> item{itemCount !== 1 ? 's' : ''} selected
                {' · '}
                <span className={styles.quoteTotal}>
                  Dealer Total: {formatCurrency(totals.totalDealerPostTax)}
                </span>
              </>
            )}
          </span>
          <button
            className={`${styles.viewQuoteBtn} ${itemCount === 0 ? styles.viewQuoteBtnDisabled : ''}`}
            onClick={() => itemCount > 0 && setIsQuoteOpen(true)}
            disabled={itemCount === 0}
          >
            <ShoppingCart size={16} />
            <span>View Quote</span>
            {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
          </button>
        </div>
      </div>

      <QuotePanel
        items={items}
        totals={totals}
        quoteTemplateItems={quoteTemplateItems}
        onRemove={removeItem}
        onUpdateQuantity={updateQuantity}
        onClear={clearQuote}
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
      />
    </div>
  );
}
