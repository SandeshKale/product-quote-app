import PropTypes from 'prop-types';
import { useRef, useState, useCallback } from 'react';
import { Minus, Plus, Trash2, Share, X, ShoppingCart, Edit2, RotateCcw } from 'lucide-react';
import { formatCurrency, formatMargin, generateQuoteNumber } from '../../utils/formatters';
import { exportAndShare } from '../../services/quoteExporter';
import { APP_NAME } from '../../constants/columnMap';
import QuoteTemplate from '../QuoteTemplate/QuoteTemplate';
import styles from './QuotePanel.module.css';

const TEMPLATES = [
  { id: 'detailed', label: 'Detailed' },
  { id: 'simple', label: 'Simple' },
];

export default function QuotePanel({
  enrichedItems,
  adjustedTotals,
  quoteTemplateItems,
  onRemove,
  onUpdateQuantity,
  onClear,
  isOpen,
  onClose,
  setItemMargin,
  resetItemMargin,
  marginOverrides,
  weightedMarginPct,
  hasAnyOverride,
}) {
  const templateRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quoteNumber] = useState(generateQuoteNumber);
  const [quoteTitle, setQuoteTitle] = useState(APP_NAME);
  const [editingTitle, setEditingTitle] = useState(false);
  const [templateType, setTemplateType] = useState('detailed');

  const handleShare = useCallback(async () => {
    setIsGenerating(true);
    try {
      await exportAndShare(templateRef, quoteNumber);
    } catch {
      /* silent */
    } finally {
      setIsGenerating(false);
    }
  }, [quoteNumber]);

  if (!isOpen) return null;

  const hasItems = enrichedItems.length > 0;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.panel} role="dialog" aria-label="Quote panel">
        {/* Offscreen template */}
        <div className={styles.offscreen} aria-hidden="true">
          <QuoteTemplate
            ref={templateRef}
            quoteTitle={quoteTitle}
            items={quoteTemplateItems}
            totals={adjustedTotals}
            templateType={templateType}
            hasOverride={hasAnyOverride}
          />
        </div>

        {/* Header */}
        <div className={styles.panelHeader}>
          <div className={styles.panelTitle}>
            <ShoppingCart size={17} />
            <span>Quote ({enrichedItems.length})</span>
          </div>
          <div className={styles.panelActions}>
            {hasItems && (
              <button className={styles.clearBtn} onClick={onClear}>
                Clear all
              </button>
            )}
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
              <X size={19} />
            </button>
          </div>
        </div>

        {/* Title rename */}
        <div className={styles.titleRow}>
          {editingTitle ? (
            <input
              className={styles.titleInput}
              value={quoteTitle}
              onChange={(e) => setQuoteTitle(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
              autoFocus
            />
          ) : (
            <div className={styles.titleDisplay}>
              <span className={styles.titleText}>{quoteTitle}</span>
              <button
                className={styles.editTitleBtn}
                onClick={() => setEditingTitle(true)}
                aria-label="Edit title"
              >
                <Edit2 size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Template type */}
        <div className={styles.templateRow}>
          <span className={styles.templateLabel}>Template:</span>
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              className={`${styles.templateBtn} ${templateType === t.id ? styles.templateBtnActive : ''}`}
              onClick={() => setTemplateType(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Items with per-item margin slider (#5) */}
        <div className={styles.itemList}>
          {!hasItems ? (
            <div className={styles.emptyState}>
              <p>
                No items yet. Search for products and click <strong>Add to Quote</strong>.
              </p>
            </div>
          ) : (
            enrichedItems.map((ei) => {
              const {
                product,
                quantity,
                effectiveMarginPct,
                adjDealerPostTax,
                adjDealerPreTax,
                origDealerPostTax,
                origDealerPreTax,
                isOverridden,
              } = ei;
              const origMarginPct = Math.round(product.marginPercent * 100);

              return (
                <div
                  key={product.articleCode}
                  className={`${styles.item} ${isOverridden ? styles.itemOverridden : ''}`}
                >
                  {/* Item info */}
                  <div className={styles.itemHeader}>
                    <span className={styles.itemCode}>{product.articleCode}</span>
                    <button
                      className={styles.removeBtn}
                      onClick={() => onRemove(product.articleCode)}
                      aria-label={`Remove ${product.articleName}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className={styles.itemName}>{product.articleName}</p>

                  {/* Prices — original and adjusted (#3 dealer pre-tax) */}
                  <div className={styles.priceTable}>
                    <div className={styles.priceCol}>
                      <span className={styles.priceHdr}>Field</span>
                      <span className={styles.priceHdr}>Pre-Tax</span>
                      <span className={styles.priceHdr}>Post-Tax</span>
                    </div>
                    <div className={styles.priceCol}>
                      <span className={styles.priceHdr}>Original ({origMarginPct}%)</span>
                      <span className={styles.priceVal}>{formatCurrency(origDealerPreTax)}</span>
                      <span className={styles.priceVal}>{formatCurrency(origDealerPostTax)}</span>
                    </div>
                    {isOverridden && (
                      <div className={styles.priceCol}>
                        <span className={styles.priceHdr}>Adjusted ({effectiveMarginPct}%)</span>
                        <span className={`${styles.priceVal} ${styles.adjVal}`}>
                          {formatCurrency(adjDealerPreTax)}
                        </span>
                        <span className={`${styles.priceVal} ${styles.adjVal}`}>
                          {formatCurrency(adjDealerPostTax)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Per-item margin slider (#5) */}
                  <div className={styles.itemSlider}>
                    <div className={styles.itemSliderHeader}>
                      <span>Margin</span>
                      <span
                        className={`${styles.marginVal} ${isOverridden ? styles.marginValAdj : ''}`}
                      >
                        {effectiveMarginPct}%
                      </span>
                      {isOverridden && (
                        <button
                          className={styles.resetBtn}
                          onClick={() => resetItemMargin(product.articleCode)}
                          title="Reset to Excel value"
                          aria-label="Reset margin"
                        >
                          <RotateCcw size={11} />
                        </button>
                      )}
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={50}
                      step={0.5}
                      value={marginOverrides[product.articleCode] ?? origMarginPct}
                      onChange={(e) => setItemMargin(product.articleCode, Number(e.target.value))}
                      className={styles.slider}
                    />
                  </div>

                  {/* Qty + line total */}
                  <div className={styles.itemFooter}>
                    <div className={styles.qtyControl}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => onUpdateQuantity(product.articleCode, quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className={styles.qty}>{quantity}</span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => onUpdateQuantity(product.articleCode, quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className={styles.lineTotal}>
                      {formatCurrency(adjDealerPostTax * quantity)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {hasItems && (
          <>
            {/* Weighted margin summary (#5) */}
            {hasAnyOverride && (
              <div className={styles.weightedRow}>
                <span>Weighted average margin:</span>
                <span className={styles.weightedVal}>{weightedMarginPct}%</span>
              </div>
            )}

            {/* Totals */}
            <div className={styles.totals}>
              {hasAnyOverride && (
                <div className={styles.totalsHeader}>
                  <span></span>
                  <span className={styles.totalsColHdr}>Original</span>
                  <span className={styles.totalsColHdr}>Adjusted</span>
                </div>
              )}
              {[
                { label: 'Total MRP', orig: adjustedTotals.totalMRP, adj: adjustedTotals.totalMRP },
                { label: 'Total RRP', orig: adjustedTotals.totalRRP, adj: adjustedTotals.totalRRP },
                {
                  label: 'Dealer Pre-Tax',
                  orig: adjustedTotals.totalDealerPreTax,
                  adj: adjustedTotals.totalDealerPreTax,
                },
                {
                  label: 'Dealer Post-Tax',
                  orig: adjustedTotals.totalDealerPostTax,
                  adj: adjustedTotals.totalDealerPostTax,
                  final: true,
                },
              ].map(({ label, adj, final }) => (
                <div
                  key={label}
                  className={`${styles.totalRow} ${final ? styles.totalRowFinal : ''}`}
                >
                  <span>{label}</span>
                  <span className={final && hasAnyOverride ? styles.adjVal : ''}>
                    {formatCurrency(adj)}
                  </span>
                </div>
              ))}
            </div>

            {/* Share */}
            <div className={styles.shareRow}>
              <button className={styles.shareBtn} onClick={handleShare} disabled={isGenerating}>
                {isGenerating ? (
                  <span>Generating…</span>
                ) : (
                  <>
                    <Share size={15} />
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
  enrichedItems: PropTypes.arrayOf(PropTypes.object).isRequired,
  adjustedTotals: PropTypes.object.isRequired,
  quoteTemplateItems: PropTypes.arrayOf(PropTypes.object).isRequired,
  onRemove: PropTypes.func.isRequired,
  onUpdateQuantity: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  setItemMargin: PropTypes.func.isRequired,
  resetItemMargin: PropTypes.func.isRequired,
  marginOverrides: PropTypes.object.isRequired,
  weightedMarginPct: PropTypes.number.isRequired,
  hasAnyOverride: PropTypes.bool.isRequired,
};
QuotePanel.displayName = 'QuotePanel';
