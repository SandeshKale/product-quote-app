import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency, formatDateShort } from '../../utils/formatters';
import styles from './QuoteTemplate.module.css';

/**
 * QuoteTemplate — captured by html2canvas for sharing.
 *
 * Rules:
 * - NO quote number, NO marginPercent, NO cost/avgLanding, NO expiry
 * - NO Line Total column (#4 removed)
 * - Dealer Pre-Tax shown per line (#20)
 * - Totals in <tfoot> aligned under each column (#3)
 * - Simple template: plain table only, no header/footer, plain borders (#8)
 * - Detailed template: full header, styled table, footer
 */
const QuoteTemplate = forwardRef(function QuoteTemplate(
  { quoteTitle, items, totals, templateType, hasOverride },
  ref
) {
  const today = formatDateShort(new Date());
  const isSimple = templateType === 'simple';

  return (
    <div ref={ref} className={isSimple ? styles.templateSimple : styles.template}>
      {/* Header — detailed only */}
      {!isSimple && (
        <div className={styles.header}>
          <h1 className={styles.title}>{quoteTitle}</h1>
          <div className={styles.headerMeta}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Date</span>
              <span className={styles.metaValue}>{today}</span>
            </div>
            {hasOverride && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Margin</span>
                <span className={styles.metaValue}>Adjusted</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <table className={isSimple ? styles.tableSimple : styles.table}>
        {!isSimple && (
          <thead>
            <tr className={styles.thead}>
              <th className={styles.thSr}>#</th>
              <th className={styles.thCode}>Code</th>
              <th className={styles.thName}>Product</th>
              <th className={styles.thQty}>Qty</th>
              <th className={styles.thAmt}>MRP</th>
              <th className={styles.thAmt}>RRP</th>
              <th className={styles.thAmt}>Dealer Pre-Tax</th>
              <th className={styles.thAmt}>Dealer Post-Tax</th>
            </tr>
          </thead>
        )}
        {isSimple && (
          <thead>
            <tr className={styles.theadSimple}>
              <th className={styles.thSrS}>#</th>
              <th className={styles.thCodeS}>Code</th>
              <th className={styles.thNameS}>Product</th>
              <th className={styles.thQtyS}>Qty</th>
              <th className={styles.thAmtS}>MRP</th>
              <th className={styles.thAmtS}>RRP</th>
              <th className={styles.thAmtS}>Dealer Pre-Tax</th>
              <th className={styles.thAmtS}>Dealer Post-Tax</th>
            </tr>
          </thead>
        )}
        <tbody>
          {items.map((item, idx) => (
            <tr
              key={item.articleCode || idx}
              className={
                isSimple ? styles.trowS : `${styles.trow} ${idx % 2 === 1 ? styles.trowAlt : ''}`
              }
            >
              <td className={isSimple ? styles.tdSrS : styles.tdSr}>{idx + 1}</td>
              <td className={isSimple ? styles.tdCodeS : styles.tdCode}>{item.articleCode}</td>
              <td className={isSimple ? styles.tdNameS : styles.tdName}>
                <span className={styles.itemName}>{item.articleName}</span>
                {!isSimple && item.category && (
                  <span className={styles.itemCat}>{item.category}</span>
                )}
                {!isSimple && item.dimensions && (
                  <span className={styles.itemDim}>{item.dimensions}</span>
                )}
              </td>
              <td className={isSimple ? styles.tdQtyS : styles.tdQty}>{item.quantity}</td>
              <td className={isSimple ? styles.tdAmtS : styles.tdAmt}>
                {formatCurrency(item.mrp)}
              </td>
              <td className={isSimple ? styles.tdAmtS : styles.tdAmt}>
                {formatCurrency(item.rrp)}
              </td>
              <td className={isSimple ? styles.tdAmtS : styles.tdAmt}>
                {formatCurrency(item.dealerPricePreTax)}
              </td>
              <td className={isSimple ? styles.tdAmtS : styles.tdAmt}>
                {formatCurrency(item.dealerPricePostTax)}
              </td>
            </tr>
          ))}
        </tbody>
        {/* Totals below their column (#3) */}
        <tfoot>
          <tr className={isSimple ? styles.tfootRowS : styles.tfootRow}>
            <td colSpan={3} className={isSimple ? styles.tfootLabelS : styles.tfootLabel}>
              TOTALS
            </td>
            <td className={isSimple ? styles.tfootQtyS : styles.tfootQty}>
              {items.reduce((s, i) => s + i.quantity, 0)}
            </td>
            <td className={isSimple ? styles.tfootAmtS : styles.tfootAmt}>
              {formatCurrency(totals.totalMRP)}
            </td>
            <td className={isSimple ? styles.tfootAmtS : styles.tfootAmt}>
              {formatCurrency(totals.totalRRP)}
            </td>
            <td className={isSimple ? styles.tfootAmtS : styles.tfootAmt}>
              {formatCurrency(totals.totalDealerPreTax)}
            </td>
            <td className={isSimple ? styles.tfootAmtS : `${styles.tfootAmt} ${styles.grandTotal}`}>
              {formatCurrency(totals.totalDealerPostTax)}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Footer — detailed only */}
      {!isSimple && (
        <div className={styles.footer}>
          <p className={styles.footerText}>Generated by {quoteTitle}</p>
        </div>
      )}
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
  hasOverride: PropTypes.bool,
};
QuoteTemplate.displayName = 'QuoteTemplate';
export default QuoteTemplate;
