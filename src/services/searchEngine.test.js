import { describe, it, expect } from 'vitest';
import { searchEngine, levenshtein } from './searchEngine';

const products = [
  {
    serialNo: 1,
    articleCode: '534.84.523',
    articleName: 'Teresa Neo I-90 Bldc Hood',
    category: 'Cooker Hoods',
    mrp: 48120,
    rrp: 36768,
    dealerPricePreTax: 11931,
    gstRate: 0.18,
    dealerPricePostTax: 14079,
    marginPercent: 0.13,
  },
  {
    serialNo: 2,
    articleCode: '534.84.503',
    articleName: 'Teresa T-90 Bldc Hood',
    category: 'Cooker Hoods',
    mrp: 34637,
    rrp: 26003,
    dealerPricePreTax: 7945,
    gstRate: 0.18,
    dealerPricePostTax: 9375,
    marginPercent: 0.13,
  },
  {
    serialNo: 3,
    articleCode: '538.81.001',
    articleName: 'Castor Hob 4-Burner',
    category: 'Hobs',
    mrp: 22000,
    rrp: 18000,
    dealerPricePreTax: 5000,
    gstRate: 0.08,
    dealerPricePostTax: 5400,
    marginPercent: 0.1,
  },
];

const noFilters = {
  categories: [],
  mrpRange: { min: null, max: null },
  rrpRange: { min: null, max: null },
  marginRange: { min: null, max: null },
  gstRate: null,
};

describe('searchEngine — scoring priority', () => {
  it('returns all products when query is empty', () => {
    const results = searchEngine('', products, noFilters);
    expect(results.length).toBe(3);
  });

  it('ranks name matches above code matches', () => {
    // 'hood' appears in product names — those should rank highest
    const results = searchEngine('hood', products, noFilters);
    expect(results.length).toBeGreaterThan(0);
    // The top result must be a name match, not a code or fuzzy-only match
    expect(results[0].articleName.toLowerCase()).toContain('hood');
  });

  it('finds products by exact word in name (teresa)', () => {
    const results = searchEngine('teresa', products, noFilters);
    expect(results.length).toBe(2);
    results.forEach((r) => {
      expect(r.articleName.toLowerCase()).toContain('teresa');
    });
  });

  it('finds product by article code (exact)', () => {
    const results = searchEngine('534.84.523', products, noFilters);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].articleCode).toBe('534.84.523');
  });

  it('finds products by partial code (534)', () => {
    const results = searchEngine('534', products, noFilters);
    expect(results.length).toBe(2);
  });

  it('finds product by category (hobs)', () => {
    // 'hobs' directly matches the Hobs category — that product should rank first
    const results = searchEngine('hobs', products, noFilters);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].category).toBe('Hobs');
  });

  it('name match scores higher than code match for same term', () => {
    // "bldc" is in the product name — should come before any code-only match
    const results = searchEngine('bldc', products, noFilters);
    expect(results[0].articleName.toLowerCase()).toContain('bldc');
  });

  it('strips _score from returned objects', () => {
    const results = searchEngine('teresa', products, noFilters);
    results.forEach((r) => {
      expect(r).not.toHaveProperty('_score');
    });
  });

  it('returns empty array for no matches', () => {
    const results = searchEngine('xyznotaproduct', products, noFilters);
    expect(results.length).toBe(0);
  });
});

describe('searchEngine — fuzzy matching', () => {
  it('finds product with 1 typo (tresa → teresa)', () => {
    const results = searchEngine('tresa', products, noFilters);
    // Fuzzy should catch this
    expect(results.length).toBeGreaterThan(0);
  });

  it('does not run fuzzy for terms shorter than 3 chars', () => {
    // Very short terms should not trigger fuzzy
    const results = searchEngine('xy', products, noFilters);
    expect(results.length).toBe(0);
  });
});

describe('searchEngine — filters', () => {
  it('filters by category', () => {
    const filters = { ...noFilters, categories: ['Hobs'] };
    const results = searchEngine('', products, filters);
    expect(results.length).toBe(1);
    expect(results[0].category).toBe('Hobs');
  });

  it('filters by MRP min', () => {
    const filters = { ...noFilters, mrpRange: { min: 40000, max: null } };
    const results = searchEngine('', products, filters);
    expect(results.every((r) => r.mrp >= 40000)).toBe(true);
  });

  it('filters by MRP max', () => {
    const filters = { ...noFilters, mrpRange: { min: null, max: 30000 } };
    const results = searchEngine('', products, filters);
    expect(results.every((r) => r.mrp <= 30000)).toBe(true);
  });

  it('filters by RRP range', () => {
    const filters = { ...noFilters, rrpRange: { min: 20000, max: 30000 } };
    const results = searchEngine('', products, filters);
    expect(results.every((r) => r.rrp >= 20000 && r.rrp <= 30000)).toBe(true);
  });

  it('filters by margin min', () => {
    const filters = { ...noFilters, marginRange: { min: 0.12, max: null } };
    const results = searchEngine('', products, filters);
    expect(results.every((r) => r.marginPercent >= 0.12)).toBe(true);
  });

  it('filters by margin max', () => {
    const filters = { ...noFilters, marginRange: { min: null, max: 0.11 } };
    const results = searchEngine('', products, filters);
    expect(results.every((r) => r.marginPercent <= 0.11)).toBe(true);
  });

  it('filters by GST rate', () => {
    const filters = { ...noFilters, gstRate: 0.08 };
    const results = searchEngine('', products, filters);
    expect(results.length).toBe(1);
    expect(results[0].gstRate).toBe(0.08);
  });

  it('combines query and filters', () => {
    const filters = { ...noFilters, categories: ['Cooker Hoods'] };
    const results = searchEngine('teresa', products, filters);
    expect(results.length).toBe(2);
    results.forEach((r) => expect(r.category).toBe('Cooker Hoods'));
  });
});

describe('levenshtein', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshtein('teresa', 'teresa')).toBe(0);
  });

  it('returns 1 for one substitution', () => {
    expect(levenshtein('tresa', 'teresa')).toBe(1);
  });

  it('returns 1 for one deletion', () => {
    expect(levenshtein('teress', 'teresa')).toBe(1);
  });

  it('returns correct distance for "hood" vs "hobs"', () => {
    expect(levenshtein('hood', 'hobs')).toBeGreaterThanOrEqual(2);
  });
});
