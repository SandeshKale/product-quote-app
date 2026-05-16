import PropTypes from 'prop-types';
import { useRef, useState, useCallback } from 'react';
import { Minus, Plus, Trash2, Share, X, ShoppingCart, Edit2 } from 'lucide-react';
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
  items,
  totals,
  quoteTemplateItems,
  onRemove,
  onUpdateQuantity,
  onClear,
  isOpen,
  onClose,
  getAdjustedItems,
}) {
  const templateRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quoteNumber] = useState(generateQuoteNumber);
  const [quoteTitle, setQuoteTitle] = useState(APP_NAME); // rename #5
  const [editingTitle, setEditingTitle] = useState(false);
  const [sliderMargin, setSliderMargin] = useState(null); // null = use Excel value
  const [templateType, setTemplateType] = useState('detailed'); // #13

  const adjustedItems = sliderMargin != null ? getAdjustedItems(sliderMargin) : null;

  // Adjusted totals for slider
  const adjTotals = adjustedItems
    ? adjustedItems.reduce(
        (acc, i) => ({
          totalMRP: acc.totalMRP + i.mrp * i.quantity,
          totalRRP: acc.totalRRP + i.rrp * i.quantity,
          totalDealerPreTax: acc.totalDealerPreTax + i.adjDealerPreTax * i.quantity,
          totalDealerPostTax: acc.totalDealerPostTax + i.adjDealerPostTax * i.quantity,
        }),
        { totalMRP: 0, totalRRP: 0, totalDealerPreTax: 0, totalDealerPostTax: 0 }
      )
    : null;

  // Build template items reflecting slider if active (#19, #20)
  const templateItems =
    adjustedItems ??
    quoteTemplateItems.map((i) => ({
      ...i,
      origDealerPostTax: i.dealerPricePostTax,
      origDealerPreTax: i.dealerPricePreTax,
      adjDealerPostTax: i.dealerPricePostTax,
      adjDealerPreTax: i.dealerPricePreTax,
      adjLineTotal: i.lineTotal,
      origLineTotal: i.lineTotal,
    }));

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

  const displayTotals = adjTotals ?? totals;
  const sliderActive = sliderMargin != null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.panel} role="dialog" aria-label="Quote panel">
        {/* Offscreen template for html2canvas */}
        <div className={styles.offscreen} aria-hidden="true">
          <QuoteTemplate
            ref={templateRef}
            quoteTitle={quoteTitle}
            items={templateItems}
            totals={displayTotals}
            templateType={templateType}
            sliderMarginPct={sliderMargin}
          />
        </div>

        {/* ── Header ── */}
        <div className={styles.panelHeader}>
          <div className={styles.panelTitle}>
            <ShoppingCart size={17} />
            <span>Quote ({items.length})</span>
          </div>
          <div className={styles.panelActions}>
            {items.length > 0 && (
              <button className={styles.clearBtn} onClick={onClear}>
                Clear all
              </button>
            )}
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
              <X size={19} />
            </button>
          </div>
        </div>

        {/* ── Quote Title Rename (#5) ── */}
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

        {/* ── Template Type (#13) ── */}
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

        {/* ── Items ── */}
        <div className={styles.itemList}>
          {items.length === 0 ? (
            <div className={styles.emptyState}>
              <p>
                No items yet. Search for products and click <strong>Add to Quote</strong>.
              </p>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div key={product.articleCode} className={styles.item}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemCode}>{product.articleCode}</span>
                  <p className={styles.itemName}>{product.articleName}</p>
                  <span className={styles.itemMargin}>
                    Margin: {formatMargin(product.marginPercent)}
                    {' · '}Dealer Post-Tax: {formatCurrency(product.dealerPricePostTax)}
                  </span>
                </div>
                <div className={styles.itemControls}>
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
                    {formatCurrency(product.dealerPricePostTax * quantity)}
                  </span>
                  <button
                    className={styles.removeBtn}
                    onClick={() => onRemove(product.articleCode)}
                    aria-label={`Remove ${product.articleName}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <>
            {/* ── Margin Slider (#11) ── */}
            <div className={styles.sliderSection}>
              <div className={styles.sliderHeader}>
                <span>Margin Adjustment</span>
                <span className={styles.sliderValue}>
                  {sliderActive
                    ? `${sliderMargin}%`
                    : `Excel value (${formatMargin(items[0]?.product.marginPercent)})`}
                </span>
                {sliderActive && (
                  <button className={styles.clearBtn} onClick={() => setSliderMargin(null)}>
                    Reset
                  </button>
                )}
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={0.5}
                value={sliderMargin ?? items[0]?.product.marginPercent * 100 ?? 13}
                onChange={(e) => setSliderMargin(Number(e.target.value))}
                className={styles.slider}
              />
            </div>

            {/* ── Totals — original + adjusted (#19) ── */}
            <div className={styles.totals}>
              {sliderActive && (
                <div className={styles.totalsCompare}>
                  <span className={styles.totalsColLabel}>Field</span>
                  <span className={styles.totalsColLabel}>Original</span>
                  <span className={styles.totalsColLabel}>@ {sliderMargin}%</span>
                </div>
              )}
              <TotalRow
                label="Total MRP"
                orig={totals.totalMRP}
                adj={adjTotals?.totalMRP}
                sliderActive={sliderActive}
              />
              <TotalRow
                label="Total RRP"
                orig={totals.totalRRP}
                adj={adjTotals?.totalRRP}
                sliderActive={sliderActive}
              />
              <TotalRow
                label="Dealer Pre-Tax"
                orig={totals.totalDealerPreTax}
                adj={adjTotals?.totalDealerPreTax}
                sliderActive={sliderActive}
              />
              <TotalRow
                label="Dealer Post-Tax"
                orig={totals.totalDealerPostTax}
                adj={adjTotals?.totalDealerPostTax}
                sliderActive={sliderActive}
                final
              />
            </div>

            {/* ── Share ── */}
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

function TotalRow({ label, orig, adj, sliderActive, final }) {
  return (
    <div className={`${styles.totalRow} ${final ? styles.totalRowFinal : ''}`}>
      <span>{label}</span>
      {sliderActive ? (
        <>
          <span className={styles.origValue}>{formatCurrency(orig)}</span>
          <span className={styles.adjValue}>{formatCurrency(adj)}</span>
        </>
      ) : (
        <span>{formatCurrency(orig)}</span>
      )}
    </div>
  );
}

TotalRow.propTypes = {
  label: PropTypes.string,
  orig: PropTypes.number,
  adj: PropTypes.number,
  sliderActive: PropTypes.bool,
  final: PropTypes.bool,
};

QuotePanel.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({ product: PropTypes.object, quantity: PropTypes.number })
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
  getAdjustedItems: PropTypes.func.isRequired,
};

QuotePanel.displayName = 'QuotePanel';
