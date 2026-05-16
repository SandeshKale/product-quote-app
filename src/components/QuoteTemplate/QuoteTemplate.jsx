import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency, formatDateShort } from '../../utils/formatters';
import styles from './QuoteTemplate.module.css';

/**
 * QuoteTemplate — captured by html2canvas for sharing.
 *
 * Rules:
 * - NO quote number (#18)
 * - NO marginPercent or cost ever rendered
 * - Totals appear below their respective column (#3)
 * - Dealer Pre-Tax shown per line item (#20)
 * - Shows original + adjusted values when slider is active (#19)
 * - Two template types: 'detailed' and 'simple' (#13)
 */
const QuoteTemplate = forwardRef(function QuoteTemplate(
  { quoteTitle, items, totals, templateType, sliderMarginPct },
  ref
) {
  const today = formatDateShort(new Date());
  const sliderActive = sliderMarginPct != null;
  const isSimple = templateType === 'simple';

  return (
    <div ref={ref} className={styles.template}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>{quoteTitle}</h1>
        <div className={styles.headerMeta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Date</span>
            <span className={styles.metaValue}>{today}</span>
          </div>
          {sliderActive && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Margin Applied</span>
              <span className={styles.metaValue}>{sliderMarginPct}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <table className={styles.table}>
        <thead>
          <tr className={styles.thead}>
            <th className={styles.thSr}>#</th>
            <th className={styles.thCode}>Code</th>
            <th className={styles.thName}>Product</th>
            <th className={styles.thQty}>Qty</th>
            <th className={styles.thAmt}>MRP</th>
            <th className={styles.thAmt}>RRP</th>
            {!isSimple && <th className={styles.thAmt}>Dealer Pre-Tax</th>}
            <th className={styles.thAmt}>Dealer Post-Tax{sliderActive ? ' (Orig)' : ''}</th>
            {sliderActive && <th className={styles.thAmt}>Dealer Post-Tax (Adj)</th>}
            <th className={styles.thAmt}>Line Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr
              key={item.articleCode || idx}
              className={`${styles.trow} ${idx % 2 === 1 ? styles.trowAlt : ''}`}
            >
              <td className={styles.tdSr}>{idx + 1}</td>
              <td className={styles.tdCode}>{item.articleCode}</td>
              <td className={styles.tdName}>
                <span className={styles.itemName}>{item.articleName}</span>
                <span className={styles.itemCat}>{item.category}</span>
                {item.dimensions && <span className={styles.itemDim}>{item.dimensions}</span>}
              </td>
              <td className={styles.tdQty}>{item.quantity}</td>
              <td className={styles.tdAmt}>{formatCurrency(item.mrp)}</td>
              <td className={styles.tdAmt}>{formatCurrency(item.rrp)}</td>
              {!isSimple && (
                <td className={styles.tdAmt}>
                  {formatCurrency(item.origDealerPreTax ?? item.dealerPricePreTax)}
                </td>
              )}
              <td className={styles.tdAmt}>
                {formatCurrency(item.origDealerPostTax ?? item.dealerPricePostTax)}
              </td>
              {sliderActive && (
                <td className={`${styles.tdAmt} ${styles.adjCell}`}>
                  {formatCurrency(item.adjDealerPostTax)}
                </td>
              )}
              <td className={`${styles.tdAmt} ${styles.lineTotal}`}>
                {formatCurrency(item.adjLineTotal ?? item.lineTotal)}
              </td>
            </tr>
          ))}
        </tbody>
        {/* Totals below their column (#3) */}
        <tfoot>
          <tr className={styles.tfootRow}>
            <td colSpan={isSimple ? 3 : 3} className={styles.tfootLabel}>
              TOTALS
            </td>
            <td className={styles.tfootQty}>{items.reduce((s, i) => s + i.quantity, 0)}</td>
            <td className={styles.tfootAmt}>{formatCurrency(totals.totalMRP)}</td>
            <td className={styles.tfootAmt}>{formatCurrency(totals.totalRRP)}</td>
            {!isSimple && (
              <td className={styles.tfootAmt}>{formatCurrency(totals.totalDealerPreTax)}</td>
            )}
            <td className={styles.tfootAmt}>{formatCurrency(totals.totalDealerPostTax)}</td>
            {sliderActive && (
              <td className={`${styles.tfootAmt} ${styles.adjCell}`}>
                {formatCurrency(totals.totalDealerPostTax)}
              </td>
            )}
            <td className={`${styles.tfootAmt} ${styles.grandTotal}`}>
              {formatCurrency(items.reduce((s, i) => s + (i.adjLineTotal ?? i.lineTotal), 0))}
            </td>
          </tr>
        </tfoot>
      </table>

      <div className={styles.footer}>
        <p className={styles.footerText}>Generated by {quoteTitle}</p>
      </div>
    </div>
  );
});

QuoteTemplate.propTypes = {
  quoteTitle: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  totals: PropTypes.shape({
    totalMRP: PropTypes.number,
    totalRRP: PropTypes.number,
    totalDealerPreTax: PropTypes.number,
    totalDealerPostTax: PropTypes.number,
  }).isRequired,
  templateType: PropTypes.string,
  sliderMarginPct: PropTypes.number,
};

QuoteTemplate.displayName = 'QuoteTemplate';
export default QuoteTemplate;
