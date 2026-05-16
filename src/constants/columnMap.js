// Maps raw Excel column headers to clean internal property names.
// marginPercent IS parsed — needed for in-app filtering and quote builder display.
// It must NEVER be passed as a prop to QuoteTemplate.
// cost is intentionally excluded everywhere.

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
  marginPercent: 'Margin %', // used in UI filters and quote builder only
};

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Smart Quote Generator';
export const CURRENCY = '₹';
export const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
