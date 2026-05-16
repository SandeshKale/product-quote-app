import * as XLSX from 'xlsx';
import { COLUMN_MAP } from '../constants/columnMap';

/**
 * Parses an Excel ArrayBuffer and returns normalised product objects.
 *
 * IMPORTANT: The Excel file has two header rows:
 *   Row 1 — display labels (MD-SKU-Code, MD-SKU-Name …)
 *   Row 2 — empty
 *   Row 3 — real field names (Article Code, ArticleName …)  ← we use this
 *   Row 4+ — data
 *
 * SheetJS `range: 2` (0-indexed) makes Row 3 the header row.
 *
 * Fields included:  all visible fields + cost (for margin slider formula)
 * Fields excluded:  none — cost is server-side only, never in quote image
 * marginPercent + cost MUST NEVER be passed to QuoteTemplate.
 */
export function parseExcel(arrayBuffer) {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // range:2 = skip rows 1-2 (0-indexed), use row 3 as header
  const raw = XLSX.utils.sheet_to_json(sheet, { defval: null, range: 2 });

  return raw.map((row, index) => normaliseRow(row, index)).filter((p) => p !== null);
}

function normaliseRow(row, index) {
  const articleCode = safeStr(row[COLUMN_MAP.articleCode]);
  const articleName = safeStr(row[COLUMN_MAP.articleName]);

  // Skip completely empty rows or internal label rows
  if (!articleCode && !articleName) return null;
  // Skip the Row 1 display-label row that leaks through as a data row
  if (articleCode === 'MD - SKU - Code' || articleName === 'MD - SKU - Name') return null;

  const cost = safeNum(row[COLUMN_MAP.cost]);
  const gstRate = safeNum(row[COLUMN_MAP.gstRate]);
  const marginPercent = safeNum(row[COLUMN_MAP.marginPercent]);

  // Recalculate dealer prices from formula to ensure consistency
  // Formula: PostTax = Cost / (1 - Margin%)   PreTax = PostTax / (1 + GST)
  const dealerPricePostTax =
    cost > 0 && marginPercent < 1
      ? cost / (1 - marginPercent)
      : safeNum(row[COLUMN_MAP.dealerPricePostTax]);
  const dealerPricePreTax =
    dealerPricePostTax > 0 && gstRate > 0
      ? dealerPricePostTax / (1 + gstRate)
      : safeNum(row[COLUMN_MAP.dealerPricePreTax]);

  const dimensions = safeStr(row[COLUMN_MAP.dimensions]); // '' when column absent

  return {
    serialNo: safeNum(row[COLUMN_MAP.serialNo]) || index + 1,
    articleCode,
    articleName,
    category: safeStr(row[COLUMN_MAP.category]),
    mrp: safeNum(row[COLUMN_MAP.mrp]),
    rrp: safeNum(row[COLUMN_MAP.rrp]),
    dealerPricePreTax,
    gstRate,
    dealerPricePostTax,
    marginPercent,
    cost,
    dimensions: dimensions || null, // null when column not in sheet yet
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
