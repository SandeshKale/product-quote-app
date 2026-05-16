import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
import { Minus, Plus, Trash2, Share, X, ShoppingCart } from 'lucide-react';
import { formatCurrency, formatMargin, generateQuoteNumber } from '../../utils/formatters';
import { exportAndShare } from '../../services/quoteExporter';
import QuoteTemplate from '../QuoteTemplate/QuoteTemplate';
import styles from './QuotePanel.module.css';

export default function QuotePanel({
  items,
  totals,
  quoteTemplateItems,
  onRemove,
  onUpdateQuantity,
  onClear,
  isOpen,
  onClose,
}) {
  const templateRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quoteNumber] = useState(() => generateQuoteNumber());

  async function handleShare() {
    setIsGenerating(true);
    try {
      await exportAndShare(templateRef, quoteNumber);
    } catch {
      // Export failed silently
    } finally {
      setIsGenerating(false);
    }
  }

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.panel} role="dialog" aria-label="Quote panel">
        {/* Offscreen quote template — captured by html2canvas */}
        <div className={styles.offscreen} aria-hidden="true">
          <QuoteTemplate
            ref={templateRef}
            quoteNumber={quoteNumber}
            items={quoteTemplateItems}
            totals={totals}
          />
        </div>

        <div className={styles.panelHeader}>
          <div className={styles.panelTitle}>
            <ShoppingCart size={18} />
            <span>
              Quote ({items.length} item{items.length !== 1 ? 's' : ''})
            </span>
          </div>
          <div className={styles.panelActions}>
            {items.length > 0 && (
              <button className={styles.clearBtn} onClick={onClear}>
                Clear all
              </button>
            )}
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close quote panel">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className={styles.itemList}>
          {items.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No items in your quote yet.</p>
              <p>
                Search for products and click <strong>Add to Quote</strong>.
              </p>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div key={product.articleCode} className={styles.item}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemCode}>{product.articleCode}</span>
                  <p className={styles.itemName}>{product.articleName}</p>
                  {/* Margin % shown here for user reference — never in quote image */}
                  <span className={styles.itemMargin}>
                    Margin: {formatMargin(product.marginPercent)}
                    {' · '}
                    Dealer Post-Tax: {formatCurrency(product.dealerPricePostTax)}
                  </span>
                </div>
                <div className={styles.itemControls}>
                  <div className={styles.qtyControl}>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => onUpdateQuantity(product.articleCode, quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={13} />
                    </button>
                    <span className={styles.qty}>{quantity}</span>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => onUpdateQuantity(product.articleCode, quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <span className={styles.lineTotal}>
                    {formatCurrency(product.dealerPricePostTax * quantity)}
                  </span>
                  <button
                    className={styles.removeBtn}
                    onClick={() => onRemove(product.articleCode)}
                    aria-label={`Remove ${product.articleName}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <>
            <div className={styles.totals}>
              <div className={styles.totalRow}>
                <span>Total MRP</span>
                <span>{formatCurrency(totals.totalMRP)}</span>
              </div>
              <div className={styles.totalRow}>
                <span>Total RRP</span>
                <span>{formatCurrency(totals.totalRRP)}</span>
              </div>
              <div className={styles.totalRow}>
                <span>Total Dealer (Pre-Tax)</span>
                <span>{formatCurrency(totals.totalDealerPreTax)}</span>
              </div>
              <div className={`${styles.totalRow} ${styles.totalRowFinal}`}>
                <span>Total Dealer (Post-Tax)</span>
                <span>{formatCurrency(totals.totalDealerPostTax)}</span>
              </div>
            </div>

            <div className={styles.shareRow}>
              <button className={styles.shareBtn} onClick={handleShare} disabled={isGenerating}>
                {isGenerating ? (
                  <span>Generating…</span>
                ) : (
                  <>
                    <Share size={16} />
                    <span>Share Quote</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

QuotePanel.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      product: PropTypes.object.isRequired,
      quantity: PropTypes.number.isRequired,
    })
  ).isRequired,
  totals: PropTypes.shape({
    totalMRP: PropTypes.number,
    totalRRP: PropTypes.number,
    totalDealerPreTax: PropTypes.number,
    totalDealerPostTax: PropTypes.number,
  }).isRequired,
  quoteTemplateItems: PropTypes.arrayOf(PropTypes.object).isRequired,
  onRemove: PropTypes.func.isRequired,
  onUpdateQuantity: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

QuotePanel.displayName = 'QuotePanel';
