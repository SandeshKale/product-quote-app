import * as XLSX from 'xlsx';
import { COLUMN_MAP } from '../constants/columnMap';

/**
 * Parses an Excel ArrayBuffer and returns an array of normalised product objects.
 * marginPercent is included for in-app use.
 * cost is intentionally excluded.
 * marginPercent must NEVER be passed to QuoteTemplate.
 */
export function parseExcel(arrayBuffer) {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const raw = XLSX.utils.sheet_to_json(sheet, { defval: null });

  return raw
    .map((row, index) => normaliseRow(row, index))
    .filter((p) => p !== null);
}

function normaliseRow(row, index) {
  const articleCode = safeStr(row[COLUMN_MAP.articleCode]);
  const articleName = safeStr(row[COLUMN_MAP.articleName]);

  // Skip rows that are clearly empty or header repeats
  if (!articleCode && !articleName) return null;

  return {
    serialNo: safeNum(row[COLUMN_MAP.serialNo]) || index + 1,
    articleCode,
    articleName,
    category: safeStr(row[COLUMN_MAP.category]),
    mrp: safeNum(row[COLUMN_MAP.mrp]),
    rrp: safeNum(row[COLUMN_MAP.rrp]),
    dealerPricePreTax: safeNum(row[COLUMN_MAP.dealerPricePreTax]),
    gstRate: safeNum(row[COLUMN_MAP.gstRate]),
    dealerPricePostTax: safeNum(row[COLUMN_MAP.dealerPricePostTax]),
    marginPercent: safeNum(row[COLUMN_MAP.marginPercent]), // for UI only
    // cost: intentionally excluded
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
