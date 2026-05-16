import { CURRENCY } from '../constants/columnMap';

/**
 * Generates a unique quote number using Date.now() as a long integer timestamp.
 * Format: QT-<milliseconds since Unix epoch>
 * Example: QT-1747295834123
 */
export function generateQuoteNumber() {
  return `QT-${Date.now()}`;
}

/**
 * Formats a number as Indian Rupee currency string.
 * Uses Indian numbering system (lakhs, crores).
 */
export function formatCurrency(value) {
  if (value == null || isNaN(value)) return `${CURRENCY}0`;
  return `${CURRENCY}${Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/**
 * Formats a decimal margin (e.g. 0.13) as a percentage string (e.g. "13%").
 */
export function formatMargin(value) {
  if (value == null || isNaN(value)) return '—';
  return `${Math.round(Number(value) * 100)}%`;
}

/**
 * Formats a GST rate decimal (e.g. 0.18) as a percentage string (e.g. "18%").
 */
export function formatGST(value) {
  if (value == null || isNaN(value)) return '—';
  return `${Math.round(Number(value) * 100)}%`;
}

/**
 * Formats a Date object or ISO string to a readable label.
 * Example: "May 15, 2026 9:00 AM"
 */
export function formatDateTime(date) {
  if (!date) return 'Unknown';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return 'Unknown';
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Formats a Date object to a short date string for the quote image.
 * Example: "May 15, 2026"
 */
export function formatDateShort(date) {
  if (!date) return 'Unknown';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return 'Unknown';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
