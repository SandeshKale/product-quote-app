// Maps raw Excel column headers (Row 3) to clean internal property names.
// NOTE: The Excel file has a display header in Row 1 and real headers in Row 3.
//       The parser uses range:2 (0-indexed) so Row 3 becomes the header row.
//
// marginPercent and cost ARE parsed — needed for margin slider recalculation.
// Neither must ever appear in the QuoteTemplate image output.

export const COLUMN_MAP = {
  serialNo: 'Sr. No.',
  articleCode: 'Article Code',
  articleName: 'ArticleName',
  category: 'ProductCategory',
  mrp: 'Q2 MRP',
  rrp: 'Q2 RRP',
  dealerPricePreTax: 'Dealer Price - pre-tax',
  gstRate: 'GST Rate',
  dealerPricePostTax: 'Dealer Price Post tax',
  marginPercent: 'Margin %',
  cost: 'Cost', // needed for margin slider formula
  dimensions: 'Dimensions', // new column — graceful fallback when absent
};

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Smart Quote Generator';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION
  ? import.meta.env.VITE_APP_VERSION.slice(0, 7)
  : 'dev';
export const CURRENCY = '₹';
export const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
