import PropTypes from 'prop-types';
import { useRef, useState, useCallback } from 'react';
import {
  Minus,
  Plus,
  Trash2,
  Share,
  Download,
  X,
  ShoppingCart,
  Edit2,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { formatCurrency, generateQuoteNumber } from '../../utils/formatters';
import { exportAndShare } from '../../services/quoteExporter';
import { APP_NAME } from '../../constants/columnMap';
import QuoteTemplate from '../QuoteTemplate/QuoteTemplate';
import styles from './QuotePanel.module.css';

/**
 * MarginControl — linked slider + text input for per-item margin.
 * - Slider step 0.1 (1 decimal via drag)
 * - Text input accepts up to 1 decimal digit; clamps to [0, 50] on blur
 * - Both controls stay in sync; only propagates clean values to parent
 */
function MarginControl({
  articleCode,
  isOverridden,
  sliderValue,
  onSetMargin,
  onResetMargin,
  styles,
}) {
  const [inputVal, setInputVal] = useState(String(sliderValue));
  const isMounted = useRef(false);

  // Keep input in sync when slider value changes from outside (e.g. reset)
  if (!isMounted.current) isMounted.current = true;

  // Sync inputVal when sliderValue changes externally (reset button)
  const prevSlider = useRef(sliderValue);
  if (prevSlider.current !== sliderValue) {
    prevSlider.current = sliderValue;
    setInputVal(String(parseFloat(sliderValue).toFixed(1)));
  }

  const commitValue = useCallback(
    (raw) => {
      const parsed = parseFloat(raw);
      if (isNaN(parsed)) return sliderValue;
      return Math.min(50, Math.max(0, Math.round(parsed * 10) / 10));
    },
    [sliderValue]
  );

  const handleSliderChange = (e) => {
    const val = Math.round(Number(e.target.value) * 10) / 10;
    setInputVal(val.toFixed(1));
    onSetMargin(articleCode, val);
  };

  const handleInputChange = (e) => {
    const raw = e.target.value;
    // Allow: digits, optional dot, at most 1 decimal digit
    if (/^\d{0,2}(\.\d?)?$/.test(raw)) {
      setInputVal(raw);
      const parsed = parseFloat(raw);
      if (!isNaN(parsed) && raw.slice(-1) !== '.') {
        onSetMargin(articleCode, Math.min(50, Math.max(0, Math.round(parsed * 10) / 10)));
      }
    }
  };

  const handleBlur = () => {
    const clean = commitValue(inputVal);
    setInputVal(clean.toFixed(1));
    onSetMargin(articleCode, clean);
  };

  return (
    <div className={styles.itemSlider}>
      <div className={styles.itemSliderHeader}>
        <span>Margin</span>
        <div className={styles.marginInputWrapper}>
          <input
            type="text"
            inputMode="decimal"
            value={inputVal}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`${styles.marginTextInput} ${isOverridden ? styles.marginTextInputAdj : ''}`}
            aria-label="Margin percentage"
          />
          <span className={styles.marginPctSymbol}>%</span>
        </div>
        {isOverridden && (
          <button
            className={styles.resetBtn}
            onClick={() => onResetMargin(articleCode)}
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
        value={sliderValue}
        onChange={handleSliderChange}
        className={styles.slider}
      />
    </div>
  );
}

MarginControl.propTypes = {
  articleCode: PropTypes.string.isRequired,
  isOverridden: PropTypes.bool.isRequired,
  sliderValue: PropTypes.number.isRequired,
  onSetMargin: PropTypes.func.isRequired,
  onResetMargin: PropTypes.func.isRequired,
  styles: PropTypes.object.isRequired,
};

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
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [quoteNumber] = useState(generateQuoteNumber);
  const [quoteTitle, setQuoteTitle] = useState(APP_NAME);
  const [editingTitle, setEditingTitle] = useState(false);
  const [templateType, setTemplateType] = useState('detailed');

  const handleShare = useCallback(async () => {
    setIsSharing(true); // spinner shows immediately
    try {
      await exportAndShare(templateRef, quoteNumber);
    } catch {
      /* silent */
    } finally {
      setIsSharing(false);
    }
  }, [quoteNumber]);

  const handleDownload = useCallback(async () => {
    setIsDownloading(true); // spinner shows immediately
    try {
      await exportAndShare(templateRef, quoteNumber, true);
    } catch {
      /* silent */
    } finally {
      setIsDownloading(false);
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
              aria-label="Quote title"
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
                origMarginPct,
              } = ei;

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
                      <span className={styles.priceHdr}>
                        Original ({Number(origMarginPct).toFixed(1)}%)
                      </span>
                      <span className={styles.priceVal}>{formatCurrency(origDealerPreTax)}</span>
                      <span className={styles.priceVal}>{formatCurrency(origDealerPostTax)}</span>
                    </div>
                    {isOverridden && (
                      <div className={styles.priceCol}>
                        <span className={styles.priceHdr}>
                          Adjusted ({Number(effectiveMarginPct).toFixed(1)}%)
                        </span>
                        <span className={`${styles.priceVal} ${styles.adjVal}`}>
                          {formatCurrency(adjDealerPreTax)}
                        </span>
                        <span className={`${styles.priceVal} ${styles.adjVal}`}>
                          {formatCurrency(adjDealerPostTax)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Per-item margin slider + text input (#5) */}
                  <MarginControl
                    articleCode={product.articleCode}
                    isOverridden={isOverridden}
                    sliderValue={marginOverrides[product.articleCode] ?? origMarginPct}
                    onSetMargin={setItemMargin}
                    onResetMargin={resetItemMargin}
                    styles={styles}
                  />

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
            {/* Weighted margin — % + rupee value (#5 / feedback) */}
            {hasAnyOverride && (
              <div className={styles.weightedRow}>
                <span>Weighted avg margin:</span>
                <div className={styles.weightedVals}>
                  <span className={styles.weightedVal}>{weightedMarginPct.toFixed(1)}%</span>
                  <span className={styles.weightedRupee}>
                    {formatCurrency(adjustedTotals.totalMarginValue)}
                  </span>
                </div>
              </div>
            )}

            {/* Totals — when overridden show original | adjusted split */}
            <div className={styles.totals}>
              {hasAnyOverride && (
                <div className={styles.totalsHeader}>
                  <span />
                  <span className={styles.totalsColHdr}>Original</span>
                  <span className={styles.totalsColHdr}>Adjusted</span>
                </div>
              )}
              {[
                {
                  label: 'Total MRP',
                  orig: adjustedTotals.totalMRP,
                  adj: adjustedTotals.totalMRP,
                },
                {
                  label: 'Total RRP',
                  orig: adjustedTotals.totalRRP,
                  adj: adjustedTotals.totalRRP,
                },
                {
                  label: 'Dealer Pre-Tax',
                  orig: adjustedTotals.totalDealerPreTax,
                  adj: adjustedTotals.totalAdjDealerPreTax,
                },
                {
                  label: 'Dealer Post-Tax',
                  orig: adjustedTotals.totalDealerPostTax,
                  adj: adjustedTotals.totalAdjDealerPostTax,
                  final: true,
                },
              ].map(({ label, orig, adj, final }) => (
                <div
                  key={label}
                  className={`${styles.totalRow} ${final ? styles.totalRowFinal : ''}`}
                >
                  <span>{label}</span>
                  {hasAnyOverride ? (
                    <>
                      <span className={styles.origTotalVal}>{formatCurrency(orig)}</span>
                      <span className={final ? styles.adjVal : styles.adjTotalVal}>
                        {formatCurrency(adj)}
                      </span>
                    </>
                  ) : (
                    <span>{formatCurrency(orig)}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Share + Download buttons — each shows its own spinner immediately */}
            <div className={styles.shareRow}>
              <button
                className={styles.shareBtn}
                onClick={handleShare}
                disabled={isSharing || isDownloading}
              >
                {isSharing ? (
                  <>
                    <Loader2 size={15} className={styles.spinning} />
                    <span>Sharing…</span>
                  </>
                ) : (
                  <>
                    <Share size={15} />
                    <span>Share</span>
                  </>
                )}
              </button>
              <button
                className={styles.downloadBtn}
                onClick={handleDownload}
                disabled={isSharing || isDownloading}
                aria-label="Download quote as PNG"
                title="Download as PNG"
              >
                {isDownloading ? (
                  <Loader2 size={15} className={styles.spinning} />
                ) : (
                  <Download size={15} />
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
