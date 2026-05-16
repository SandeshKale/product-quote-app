import * as XLSX from 'xlsx';
import { COLUMN_MAP, GST_RATE } from '../constants/columnMap';

/**
 * Parses the Excel file and returns normalised product objects.
 *
 * NEW SHEET STRUCTURE (vs old):
 *   - Headers are on Row 1 (no more Row 3 offset — range:2 removed)
 *   - 14 columns: added ProductGroup, Dimensions, StockStatus, Stock, Avg Landing
 *   - GST is no longer a column — hardcoded at 18% via GST_RATE constant
 *   - Formulas:
 *       Dealer Post-Tax = Avg Landing / (1 - Margin)
 *       Dealer Pre-Tax  = Dealer Post-Tax / 1.18
 *   - Some RRP values are Indian-formatted strings ('1,12,442') — stripped before parsing
 *
 * avgLanding and marginPercent are included for the margin slider formula.
 * Neither must ever appear in the QuoteTemplate image.
 */
export function parseExcel(arrayBuffer) {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Headers are now on Row 1 — use default (no range offset needed)
  const raw = XLSX.utils.sheet_to_json(sheet, { defval: null });

  return raw.map((row, index) => normaliseRow(row, index)).filter((p) => p !== null);
}

function normaliseRow(row, index) {
  const articleCode = safeStr(row[COLUMN_MAP.articleCode]);
  const articleName = safeStr(row[COLUMN_MAP.articleName]);

  // Skip header leakage or truly empty rows
  if (!articleCode && !articleName) return null;

  const marginPercent = safeNum(row[COLUMN_MAP.marginPercent]);
  const avgLanding = safeNum(row[COLUMN_MAP.avgLanding]);

  // Recalculate from Excel formula:
  //   Post-Tax = AvgLanding / (1 - Margin)
  //   Pre-Tax  = Post-Tax / 1.18
  const dealerPricePostTax =
    avgLanding > 0 && marginPercent < 1
      ? avgLanding / (1 - marginPercent)
      : safeNum(row[COLUMN_MAP.dealerPricePostTax]);

  const dealerPricePreTax =
    dealerPricePostTax > 0
      ? dealerPricePostTax / (1 + GST_RATE)
      : safeNum(row[COLUMN_MAP.dealerPricePreTax]);

  return {
    serialNo: safeNum(row[COLUMN_MAP.serialNo]) || index + 1,
    articleCode,
    articleName,
    productGroup: safeStr(row[COLUMN_MAP.productGroup]),
    category: safeStr(row[COLUMN_MAP.category]),
    dimensions: safeStr(row[COLUMN_MAP.dimensions]) || null,
    stockStatus: safeStr(row[COLUMN_MAP.stockStatus]) || null,
    stock: safeNum(row[COLUMN_MAP.stock]),
    mrp: safeNum(row[COLUMN_MAP.mrp]),
    rrp: safeIndianNum(row[COLUMN_MAP.rrp]), // handles '1,12,442' strings
    dealerPricePreTax,
    dealerPricePostTax,
    gstRate: GST_RATE, // always 0.18 — kept for display compatibility
    marginPercent,
    avgLanding, // for margin slider recalculation
  };
}

function safeStr(val) {
  if (val == null) return '';
  return String(val).trim();
}

function safeNum(val) {
  if (val == null) return 0;
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

/**
 * Parses Indian-formatted number strings like '1,12,442' → 112442.
 * Also handles plain numbers gracefully.
 */
function safeIndianNum(val) {
  if (val == null) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (typeof val === 'string') {
    const stripped = val.replace(/,/g, '');
    const n = Number(stripped);
    return isNaN(n) ? 0 : n;
  }
  return 0;
}
