/**
 * Maps Excel column headers (Row 1 — now the ONLY header row) to internal names.
 *
 * FORMULA CHANGES (vs old sheet):
 *   Dealer Post-Tax = Avg Landing / (1 - Margin)
 *   Dealer Pre-Tax  = Dealer Post-Tax / 1.18   ← GST now hardcoded at 18%
 *
 * GST Rate is no longer a column — use GST_RATE constant everywhere.
 *
 * New columns: ProductGroup, Dimensions, StockStatus, Stock
 * Renamed:     Cost → Avg Landing   |   Margin % → Margin
 */

export const COLUMN_MAP = {
  serialNo: 'Sr. No.',
  articleCode: 'Article Code',
  articleName: 'ArticleName',
  productGroup: 'ProductGroup', // currently all 'Appliances'
  category: 'ProductCategory',
  dimensions: 'Dimensions',
  stockStatus: 'StockStatus', // 'Good' | 'Discntd'
  stock: 'Stock', // qty in warehouse
  mrp: 'Q2 MRP',
  rrp: 'Q2 RRP',
  dealerPricePreTax: 'Dealer Price - pre-tax',
  dealerPricePostTax: 'Dealer Price Post tax',
  marginPercent: 'Margin',
  avgLanding: 'Avg Landing', // renamed from 'Cost'
};

/** GST is now hardcoded at 18% in all Excel formulas — no longer a per-product column */
export const GST_RATE = 0.18;

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Smart Quote Generator';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION
  ? import.meta.env.VITE_APP_VERSION.slice(0, 7)
  : 'dev';
export const CURRENCY = '₹';
export const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
