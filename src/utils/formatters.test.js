import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateQuoteNumber,
  formatCurrency,
  formatMargin,
  formatGST,
  formatDateTime,
  formatDateShort,
} from './formatters';

describe('generateQuoteNumber', () => {
  it('starts with QT-', () => {
    expect(generateQuoteNumber()).toMatch(/^QT-/);
  });

  it('contains a long numeric timestamp', () => {
    const result = generateQuoteNumber();
    const ts = result.replace('QT-', '');
    expect(Number(ts)).toBeGreaterThan(1_000_000_000_000); // > year 2001 in ms
    expect(Number.isInteger(Number(ts))).toBe(true);
  });

  it('generates unique numbers on consecutive calls', () => {
    // Freeze time, then advance — ensures uniqueness strategy is timestamp-based
    const first = generateQuoteNumber();
    vi.setSystemTime(Date.now() + 5);
    const second = generateQuoteNumber();
    expect(first).not.toBe(second);
    vi.useRealTimers();
  });
});

describe('formatCurrency', () => {
  it('formats a normal value with ₹ prefix', () => {
    const result = formatCurrency(48120);
    expect(result).toContain('₹');
    expect(result).toContain('48');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('₹0');
  });

  it('handles null gracefully', () => {
    expect(formatCurrency(null)).toBe('₹0');
  });

  it('handles undefined gracefully', () => {
    expect(formatCurrency(undefined)).toBe('₹0');
  });

  it('handles NaN gracefully', () => {
    expect(formatCurrency(NaN)).toBe('₹0');
  });

  it('rounds decimals', () => {
    const result = formatCurrency(48120.63);
    expect(result).not.toContain('.');
  });
});

describe('formatMargin', () => {
  it('converts decimal to percentage string', () => {
    expect(formatMargin(0.13)).toBe('13%');
  });

  it('handles 0', () => {
    expect(formatMargin(0)).toBe('0%');
  });

  it('handles null', () => {
    expect(formatMargin(null)).toBe('—');
  });

  it('handles undefined', () => {
    expect(formatMargin(undefined)).toBe('—');
  });

  it('rounds to nearest integer', () => {
    expect(formatMargin(0.135)).toBe('14%');
  });
});

describe('formatGST', () => {
  it('converts 0.18 to "18%"', () => {
    expect(formatGST(0.18)).toBe('18%');
  });

  it('converts 0.08 to "8%"', () => {
    expect(formatGST(0.08)).toBe('8%');
  });

  it('handles null', () => {
    expect(formatGST(null)).toBe('—');
  });
});

describe('formatDateTime', () => {
  it('formats a valid ISO string', () => {
    const result = formatDateTime('2026-05-15T09:00:00.000Z');
    expect(result).toContain('2026');
    expect(result).not.toBe('Unknown');
  });

  it('formats a Date object', () => {
    const result = formatDateTime(new Date('2026-05-15T09:00:00.000Z'));
    expect(result).toContain('2026');
  });

  it('returns "Unknown" for null', () => {
    expect(formatDateTime(null)).toBe('Unknown');
  });

  it('returns "Unknown" for invalid date string', () => {
    expect(formatDateTime('not-a-date')).toBe('Unknown');
  });
});

describe('formatDateShort', () => {
  it('formats a valid date', () => {
    const result = formatDateShort(new Date('2026-05-15T09:00:00.000Z'));
    expect(result).toContain('2026');
    expect(result).not.toBe('Unknown');
  });

  it('returns "Unknown" for null', () => {
    expect(formatDateShort(null)).toBe('Unknown');
  });
});
