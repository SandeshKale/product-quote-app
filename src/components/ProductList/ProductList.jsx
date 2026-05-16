import PropTypes from 'prop-types';
import { Plus } from 'lucide-react';
import { formatCurrency, formatMargin, formatGST } from '../../utils/formatters';
import styles from './ProductList.module.css';

export function ProductCard({ product, cartCount, onAdd }) {
  const inCart = cartCount > 0;

  return (
    <div className={`${styles.card} ${inCart ? styles.inCart : ''}`}>
      <div className={styles.cardHeader}>
        <span className={styles.code}>{product.articleCode}</span>
        <span className={styles.category}>{product.category}</span>
      </div>

      <h3 className={styles.name}>{product.articleName}</h3>

      {/* Dimensions — only shown when present (#17) */}
      {product.dimensions && <p className={styles.dimensions}>{product.dimensions}</p>}

      <div className={styles.priceGrid}>
        <PriceItem label="MRP" value={formatCurrency(product.mrp)} />
        <PriceItem label="RRP" value={formatCurrency(product.rrp)} />
        <PriceItem label="Dealer Post-Tax" value={formatCurrency(product.dealerPricePostTax)} />
        <PriceItem
          label="Margin"
          value={formatMargin(product.marginPercent)}
          className={styles.margin}
        />
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.gst}>GST {formatGST(product.gstRate)}</span>
        <button
          className={`${styles.addBtn} ${inCart ? styles.addBtnActive : ''}`}
          onClick={() => onAdd(product)}
          aria-label={`Add ${product.articleName} to quote`}
        >
          <Plus size={14} />
          {/* Show cart count instead of "Add Again" (#10) */}
          <span>{inCart ? `In cart: ${cartCount}` : 'Add to Quote'}</span>
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

  const cartMap = {};
  quoteItems.forEach(({ product, quantity }) => {
    cartMap[product.articleCode] = quantity;
  });

  return (
    <div className={styles.list}>
      {products.map((product) => (
        <ProductCard
          key={product.articleCode || product.serialNo}
          product={product}
          cartCount={cartMap[product.articleCode] || 0}
          onAdd={onAdd}
        />
      ))}
    </div>
  );
}

function PriceItem({ label, value, className }) {
  return (
    <div className={styles.priceItem}>
      <span className={styles.priceLabel}>{label}</span>
      <span className={`${styles.priceValue} ${className || ''}`}>{value}</span>
    </div>
  );
}

PriceItem.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  className: PropTypes.string,
};

const productShape = PropTypes.shape({
  serialNo: PropTypes.number,
  articleCode: PropTypes.string,
  articleName: PropTypes.string,
  category: PropTypes.string,
  dimensions: PropTypes.string,
  mrp: PropTypes.number,
  rrp: PropTypes.number,
  dealerPricePreTax: PropTypes.number,
  gstRate: PropTypes.number,
  dealerPricePostTax: PropTypes.number,
  marginPercent: PropTypes.number,
});

ProductCard.propTypes = {
  product: productShape.isRequired,
  cartCount: PropTypes.number.isRequired,
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
