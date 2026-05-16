import PropTypes from 'prop-types';
import { Plus, Check } from 'lucide-react';
import { formatCurrency, formatMargin, formatGST } from '../../utils/formatters';
import styles from './ProductList.module.css';

export function ProductCard({ product, isInQuote, onAdd }) {
  return (
    <div className={`${styles.card} ${isInQuote ? styles.inQuote : ''}`}>
      <div className={styles.cardHeader}>
        <span className={styles.code}>{product.articleCode}</span>
        <span className={styles.category}>{product.category}</span>
      </div>

      <h3 className={styles.name}>{product.articleName}</h3>

      <div className={styles.priceGrid}>
        <div className={styles.priceItem}>
          <span className={styles.priceLabel}>MRP</span>
          <span className={styles.priceValue}>{formatCurrency(product.mrp)}</span>
        </div>
        <div className={styles.priceItem}>
          <span className={styles.priceLabel}>RRP</span>
          <span className={styles.priceValue}>{formatCurrency(product.rrp)}</span>
        </div>
        <div className={styles.priceItem}>
          <span className={styles.priceLabel}>Dealer (Post-Tax)</span>
          <span className={styles.priceValue}>{formatCurrency(product.dealerPricePostTax)}</span>
        </div>
        <div className={styles.priceItem}>
          <span className={styles.priceLabel}>Margin</span>
          <span className={`${styles.priceValue} ${styles.margin}`}>
            {formatMargin(product.marginPercent)}
          </span>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.gst}>GST {formatGST(product.gstRate)}</span>
        <button
          className={`${styles.addBtn} ${isInQuote ? styles.addBtnActive : ''}`}
          onClick={() => onAdd(product)}
          aria-label={`${isInQuote ? 'Add another' : 'Add'} ${product.articleName} to quote`}
        >
          {isInQuote ? (
            <>
              <Check size={15} />
              <span>Add Again</span>
            </>
          ) : (
            <>
              <Plus size={15} />
              <span>Add to Quote</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function ProductList({ products, quoteItems, onAdd, isLoading, status }) {
  if (status === 'error') {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyTitle}>Unable to load products</p>
        <p className={styles.emptySubtitle}>
          Check your Google Drive connection and try refreshing.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.skeletonList}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.skeleton} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyTitle}>No products found</p>
        <p className={styles.emptySubtitle}>Try a different search term or clear the filters.</p>
      </div>
    );
  }

  const inQuoteCodes = new Set(quoteItems.map((i) => i.product.articleCode));

  return (
    <div className={styles.list}>
      {products.map((product) => (
        <ProductCard
          key={product.articleCode || product.serialNo}
          product={product}
          isInQuote={inQuoteCodes.has(product.articleCode)}
          onAdd={onAdd}
        />
      ))}
    </div>
  );
}

const productShape = PropTypes.shape({
  serialNo: PropTypes.number,
  articleCode: PropTypes.string,
  articleName: PropTypes.string,
  category: PropTypes.string,
  mrp: PropTypes.number,
  rrp: PropTypes.number,
  dealerPricePreTax: PropTypes.number,
  gstRate: PropTypes.number,
  dealerPricePostTax: PropTypes.number,
  marginPercent: PropTypes.number,
});

ProductCard.propTypes = {
  product: productShape.isRequired,
  isInQuote: PropTypes.bool.isRequired,
  onAdd: PropTypes.func.isRequired,
};

ProductList.propTypes = {
  products: PropTypes.arrayOf(productShape).isRequired,
  quoteItems: PropTypes.arrayOf(PropTypes.shape({ product: productShape })).isRequired,
  onAdd: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  status: PropTypes.string.isRequired,
};

ProductList.displayName = 'ProductList';
ProductCard.displayName = 'ProductCard';
