import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useQuote } from './useQuote';

const productA = {
  serialNo: 1,
  articleCode: '534.84.523',
  articleName: 'Teresa Neo Hood',
  category: 'Cooker Hoods',
  dimensions: 'Chimney - 90cm',
  stockStatus: 'Good',
  stock: 125,
  mrp: 90290,
  rrp: 68990,
  dealerPricePreTax: 46254,
  dealerPricePostTax: 54580,
  gstRate: 0.18,
  marginPercent: 0.13,
  avgLanding: 47482,
};
const productB = {
  serialNo: 2,
  articleCode: '538.66.600',
  articleName: 'Altius Fs 130 Hob',
  category: 'Hobs',
  dimensions: 'Hob - 30cm',
  stockStatus: 'Good',
  stock: 3,
  mrp: 26990,
  rrp: 20341,
  dealerPricePreTax: 14398,
  dealerPricePostTax: 16989,
  gstRate: 0.18,
  marginPercent: 0.13,
  avgLanding: 14780,
};

describe('useQuote — addItem', () => {
  it('adds new product with qty 1', () => {
    const { result } = renderHook(() => useQuote());
    act(() => {
      result.current.addItem(productA);
    });
    expect(result.current.items[0].quantity).toBe(1);
  });

  it('increments qty on re-add', () => {
    const { result } = renderHook(() => useQuote());
    act(() => {
      result.current.addItem(productA);
      result.current.addItem(productA);
    });
    expect(result.current.items.length).toBe(1);
    expect(result.current.items[0].quantity).toBe(2);
  });

  it('adds multiple products', () => {
    const { result } = renderHook(() => useQuote());
    act(() => {
      result.current.addItem(productA);
      result.current.addItem(productB);
    });
    expect(result.current.items.length).toBe(2);
    expect(result.current.itemCount).toBe(2);
  });
});

describe('useQuote — removeItem', () => {
  it('removes item by code', () => {
    const { result } = renderHook(() => useQuote());
    act(() => {
      result.current.addItem(productA);
      result.current.addItem(productB);
    });
    act(() => {
      result.current.removeItem(productA.articleCode);
    });
    expect(result.current.items.length).toBe(1);
    expect(result.current.items[0].product.articleCode).toBe(productB.articleCode);
  });
});

describe('useQuote — updateQuantity', () => {
  it('updates qty', () => {
    const { result } = renderHook(() => useQuote());
    act(() => {
      result.current.addItem(productA);
      result.current.updateQuantity(productA.articleCode, 5);
    });
    expect(result.current.items[0].quantity).toBe(5);
  });

  it('qty 0 removes item', () => {
    const { result } = renderHook(() => useQuote());
    act(() => {
      result.current.addItem(productA);
      result.current.updateQuantity(productA.articleCode, 0);
    });
    expect(result.current.items.length).toBe(0);
  });

  it('floors decimal qty', () => {
    const { result } = renderHook(() => useQuote());
    act(() => {
      result.current.addItem(productA);
      result.current.updateQuantity(productA.articleCode, 2.9);
    });
    expect(result.current.items[0].quantity).toBe(2);
  });
});

describe('useQuote — setItemMargin', () => {
  it('overrides margin for an item', () => {
    const { result } = renderHook(() => useQuote());
    act(() => {
      result.current.addItem(productA);
      result.current.setItemMargin(productA.articleCode, 20);
    });
    expect(result.current.marginOverrides[productA.articleCode]).toBe(20);
    expect(result.current.hasAnyOverride).toBe(true);
  });

  it('resetItemMargin clears override', () => {
    const { result } = renderHook(() => useQuote());
    act(() => {
      result.current.addItem(productA);
      result.current.setItemMargin(productA.articleCode, 20);
    });
    act(() => {
      result.current.resetItemMargin(productA.articleCode);
    });
    expect(result.current.marginOverrides[productA.articleCode]).toBeUndefined();
    expect(result.current.hasAnyOverride).toBe(false);
  });
});

describe('useQuote — enrichedItems', () => {
  it('includes adjDealerPostTax recalculated from override', () => {
    const { result } = renderHook(() => useQuote());
    act(() => {
      result.current.addItem(productA);
      result.current.setItemMargin(productA.articleCode, 20);
    });
    const ei = result.current.enrichedItems[0];
    expect(ei.adjDealerPostTax).toBeCloseTo(productA.avgLanding / 0.8, 0);
  });

  it('includes adjDealerPreTax = adjPostTax / 1.18', () => {
    const { result } = renderHook(() => useQuote());
    act(() => {
      result.current.addItem(productA);
      result.current.setItemMargin(productA.articleCode, 20);
    });
    const ei = result.current.enrichedItems[0];
    expect(ei.adjDealerPreTax).toBeCloseTo(ei.adjDealerPostTax / 1.18, 0);
  });

  it('isOverridden false when no override set', () => {
    const { result } = renderHook(() => useQuote());
    act(() => {
      result.current.addItem(productA);
    });
    expect(result.current.enrichedItems[0].isOverridden).toBe(false);
  });

  it('isOverridden true when override set', () => {
    const { result } = renderHook(() => useQuote());
    act(() => {
      result.current.addItem(productA);
      result.current.setItemMargin(productA.articleCode, 20);
    });
    expect(result.current.enrichedItems[0].isOverridden).toBe(true);
  });
});

describe('useQuote — weightedMarginPct', () => {
  it('equals original margin when no overrides', () => {
    const { result } = renderHook(() => useQuote());
    act(() => {
      result.current.addItem(productA);
    });
    // margin = 1 - avgLanding/postTax = 1 - 47482/54580 ≈ 13%
    expect(result.current.weightedMarginPct).toBe(13);
  });
});

describe('useQuote — clearQuote', () => {
  it('empties items and overrides', () => {
    const { result } = renderHook(() => useQuote());
    act(() => {
      result.current.addItem(productA);
      result.current.setItemMargin(productA.articleCode, 20);
    });
    act(() => {
      result.current.clearQuote();
    });
    expect(result.current.items.length).toBe(0);
    expect(result.current.hasAnyOverride).toBe(false);
  });
});

describe('useQuote — totals', () => {
  it('totals do not contain marginPercent', () => {
    const { result } = renderHook(() => useQuote());
    act(() => {
      result.current.addItem(productA);
    });
    expect(result.current.totals).not.toHaveProperty('marginPercent');
    expect(result.current.totals).not.toHaveProperty('avgLanding');
  });
});

describe('useQuote — quoteTemplateItems', () => {
  it('does not include marginPercent', () => {
    const { result } = renderHook(() => useQuote());
    act(() => {
      result.current.addItem(productA);
    });
    expect(result.current.quoteTemplateItems[0]).not.toHaveProperty('marginPercent');
  });

  it('does not include avgLanding', () => {
    const { result } = renderHook(() => useQuote());
    act(() => {
      result.current.addItem(productA);
    });
    expect(result.current.quoteTemplateItems[0]).not.toHaveProperty('avgLanding');
  });

  it('includes dealerPricePreTax', () => {
    const { result } = renderHook(() => useQuote());
    act(() => {
      result.current.addItem(productA);
    });
    expect(result.current.quoteTemplateItems[0]).toHaveProperty('dealerPricePreTax');
  });
});
