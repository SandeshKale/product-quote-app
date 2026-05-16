import { describe, it, expect } from 'vitest';
import { searchEngine, levenshtein } from './searchEngine';

const products = [
  {
    articleCode: '534.84.523',
    articleName: 'Teresa Neo I-90 Bldc Hood',
    category: 'Cooker Hoods',
    dimensions: 'Chimney - 90cm',
    stockStatus: 'Good',
    mrp: 90290,
    rrp: 68990,
    marginPercent: 0.13,
    gstRate: 0.18,
    dealerPricePostTax: 54580,
    dealerPricePreTax: 46254,
    avgLanding: 47482,
  },
  {
    articleCode: '534.84.503',
    articleName: 'Teresa T-90 Bldc Hood',
    category: 'Cooker Hoods',
    dimensions: 'Chimney - 90cm',
    stockStatus: 'Good',
    mrp: 64990,
    rrp: 48791,
    marginPercent: 0.13,
    gstRate: 0.18,
    dealerPricePostTax: 36340,
    dealerPricePreTax: 30797,
    avgLanding: 31615,
  },
  {
    articleCode: '538.66.600',
    articleName: 'Altius Fs 130 Hob',
    category: 'Hobs',
    dimensions: 'Hob - 30cm',
    stockStatus: 'Good',
    mrp: 26990,
    rrp: 20341,
    marginPercent: 0.13,
    gstRate: 0.18,
    dealerPricePostTax: 16989,
    dealerPricePreTax: 14398,
    avgLanding: 14780,
  },
  {
    articleCode: '536.88.313',
    articleName: 'Frida 90 Hood',
    category: 'Cooker Hoods',
    dimensions: 'Chimney - 90cm',
    stockStatus: 'Discntd',
    mrp: 0,
    rrp: 46819,
    marginPercent: 0.13,
    gstRate: 0.18,
    dealerPricePostTax: 8525,
    dealerPricePreTax: 7225,
    avgLanding: 7417,
  },
];

const noFilters = {
  categories: [],
  mrpRange: { min: null, max: null },
  rrpRange: { min: null, max: null },
  marginRange: { min: null, max: null },
  dimensions: [],
  stockStatus: [],
};

describe('searchEngine — scoring', () => {
  it('returns all products on empty query', () => {
    expect(searchEngine('', products, noFilters).length).toBe(4);
  });

  it('product name match ranks highest', () => {
    const results = searchEngine('teresa', products, noFilters);
    expect(results.length).toBeGreaterThanOrEqual(2);
    results.forEach((r) => expect(r.articleName.toLowerCase()).toContain('teresa'));
  });

  it('finds by article code (exact)', () => {
    const results = searchEngine('534.84.523', products, noFilters);
    expect(results[0].articleCode).toBe('534.84.523');
  });

  it('finds by partial code', () => {
    const results = searchEngine('534', products, noFilters);
    expect(results.length).toBeGreaterThanOrEqual(2);
  });

  it('finds by category', () => {
    const results = searchEngine('hobs', products, noFilters);
    expect(results[0].category).toBe('Hobs');
  });

  it('finds by dimensions', () => {
    const results = searchEngine('30cm', products, noFilters);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].dimensions).toContain('30cm');
  });

  it('strips _score from returned objects', () => {
    const results = searchEngine('teresa', products, noFilters);
    results.forEach((r) => expect(r).not.toHaveProperty('_score'));
  });

  it('returns empty array for no matches', () => {
    expect(searchEngine('xyznothing', products, noFilters).length).toBe(0);
  });
});

describe('searchEngine — filters', () => {
  it('filters by category', () => {
    const f = { ...noFilters, categories: ['Hobs'] };
    const results = searchEngine('', products, f);
    expect(results.every((r) => r.category === 'Hobs')).toBe(true);
  });

  it('filters by stockStatus Good', () => {
    const f = { ...noFilters, stockStatus: ['Good'] };
    const results = searchEngine('', products, f);
    expect(results.every((r) => r.stockStatus === 'Good')).toBe(true);
  });

  it('filters by stockStatus Discntd', () => {
    const f = { ...noFilters, stockStatus: ['Discntd'] };
    const results = searchEngine('', products, f);
    expect(results.length).toBe(1);
    expect(results[0].stockStatus).toBe('Discntd');
  });

  it('filters by dimensions', () => {
    const f = { ...noFilters, dimensions: ['Hob - 30cm'] };
    const results = searchEngine('', products, f);
    expect(results.length).toBe(1);
    expect(results[0].dimensions).toBe('Hob - 30cm');
  });

  it('filters by MRP range', () => {
    const f = { ...noFilters, mrpRange: { min: 50000, max: null } };
    const results = searchEngine('', products, f);
    expect(results.every((r) => r.mrp >= 50000)).toBe(true);
  });

  it('filters by margin range', () => {
    const f = { ...noFilters, marginRange: { min: 0.12, max: 0.14 } };
    const results = searchEngine('', products, f);
    expect(results.every((r) => r.marginPercent >= 0.12 && r.marginPercent <= 0.14)).toBe(true);
  });

  it('combines query + filter', () => {
    const f = { ...noFilters, stockStatus: ['Good'] };
    const results = searchEngine('teresa', products, f);
    expect(results.every((r) => r.stockStatus === 'Good')).toBe(true);
    expect(results.length).toBeGreaterThanOrEqual(2);
  });
});

describe('searchEngine — fuzzy', () => {
  it('finds with 1 typo', () => {
    const results = searchEngine('tresa', products, noFilters);
    expect(results.length).toBeGreaterThan(0);
  });

  it('does not run fuzzy for terms under 3 chars', () => {
    expect(searchEngine('xy', products, noFilters).length).toBe(0);
  });
});

describe('levenshtein', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshtein('teresa', 'teresa')).toBe(0);
  });

  it('returns 1 for one substitution', () => {
    expect(levenshtein('tresa', 'teresa')).toBe(1);
  });
});
