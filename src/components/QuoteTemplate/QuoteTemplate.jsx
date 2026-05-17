import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency, formatDateShort } from '../../utils/formatters';
import styles from './QuoteTemplate.module.css';

/**
 * QuoteTemplate — captured by html2canvas.
 *
 * Always shows the ADJUSTED dealer prices (after slider) as plain
 * "Dealer Pre-Tax" / "Dealer Post-Tax" — no orig/adj labelling.
 * When no slider used, adjusted = original, so values are identical.
 *
 * No quote number, no margin labels, no expiry, no Line Total column.
 */
const QuoteTemplate = forwardRef(function QuoteTemplate(
  { quoteTitle, items, totals, templateType },
  ref
) {
  const today = formatDateShort(new Date());
  const isSimple = templateType === 'simple';

  const cols = {
    detailed: (
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
    ),
    simple: (
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
    ),
  };

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
          </div>
        </div>
      )}

      {/* Table */}
      <table className={isSimple ? styles.tableSimple : styles.table}>
        <thead>{isSimple ? cols.simple : cols.detailed}</thead>
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
              {/* Always use adjusted prices — label is plain, no "(Adj)" suffix */}
              <td className={isSimple ? styles.tdAmtS : styles.tdAmt}>
                {formatCurrency(item.adjDealerPreTax ?? item.dealerPricePreTax)}
              </td>
              <td className={isSimple ? styles.tdAmtS : styles.tdAmt}>
                {formatCurrency(item.adjDealerPostTax ?? item.dealerPricePostTax)}
              </td>
            </tr>
          ))}
        </tbody>

        {/* Totals footer — aligned under each column */}
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
            {/* Use adjusted totals — same plain labels */}
            <td className={isSimple ? styles.tfootAmtS : styles.tfootAmt}>
              {formatCurrency(totals.totalAdjDealerPreTax ?? totals.totalDealerPreTax)}
            </td>
            <td className={isSimple ? styles.tfootAmtS : `${styles.tfootAmt} ${styles.grandTotal}`}>
              {formatCurrency(totals.totalAdjDealerPostTax ?? totals.totalDealerPostTax)}
            </td>
          </tr>
        </tfoot>
      </table>
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
    totalAdjDealerPreTax: PropTypes.number,
    totalAdjDealerPostTax: PropTypes.number,
  }).isRequired,
  templateType: PropTypes.string,
};

QuoteTemplate.displayName = 'QuoteTemplate';
export default QuoteTemplate;
