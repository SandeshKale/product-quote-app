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

  it('increments qty when same product added', () => {
    const { result } = renderHook(() => useQuote());
    act(() => {
      result.current.addItem(productA);
      result.current.addItem(productA);
    });
    expect(result.current.items.length).toBe(1);
    expect(result.current.items[0].quantity).toBe(2);
  });

  it('adds multiple different products', () => {
    const { result } = renderHook(() => useQuote());
    act(() => {
      result.current.addItem(productA);
      result.current.addItem(productB);
    });
    expect(result.current.items.length).toBe(2);
  });
});

describe('useQuote — removeItem', () => {
  it('removes item by articleCode', () => {
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
  it('updates qty for a product', () => {
    const { result } = renderHook(() => useQuote());
    act(() => {
      result.current.addItem(productA);
    });
    act(() => {
      result.current.updateQuantity(productA.articleCode, 5);
    });
    expect(result.current.items[0].quantity).toBe(5);
  });

  it('qty 0 removes the item (#4)', () => {
    const { result } = renderHook(() => useQuote());
    act(() => {
      result.current.addItem(productA);
    });
    act(() => {
      result.current.updateQuantity(productA.articleCode, 0);
    });
    expect(result.current.items.length).toBe(0);
  });

  it('qty -1 also removes the item', () => {
    const { result } = renderHook(() => useQuote());
    act(() => {
      result.current.addItem(productA);
    });
    act(() => {
      result.current.updateQuantity(productA.articleCode, -1);
    });
    expect(result.current.items.length).toBe(0);
  });

  it('floors decimal quantities', () => {
    const { result } = renderHook(() => useQuote());
    act(() => {
      result.current.addItem(productA);
    });
    act(() => {
      result.current.updateQuantity(productA.articleCode, 2.9);
    });
    expect(result.current.items[0].quantity).toBe(2);
  });
});

describe('useQuote — clearQuote', () => {
  it('empties all items', () => {
    const { result } = renderHook(() => useQuote());
    act(() => {
      result.current.addItem(productA);
      result.current.addItem(productB);
    });
    act(() => {
      result.current.clearQuote();
    });
    expect(result.current.items.length).toBe(0);
  });
});

describe('useQuote — totals', () => {
  it('calculates totalMRP correctly', () => {
    const { result } = renderHook(() => useQuote());
    act(() => {
      result.current.addItem(productA);
      result.current.addItem(productA);
    });
    expect(result.current.totals.totalMRP).toBe(productA.mrp * 2);
  });

  it('calculates totalDealerPostTax correctly', () => {
    const { result } = renderHook(() => useQuote());
    act(() => {
      result.current.addItem(productA);
    });
    expect(result.current.totals.totalDealerPostTax).toBe(productA.dealerPricePostTax);
  });

  it('totals never contain margin', () => {
    const { result } = renderHook(() => useQuote());
    act(() => {
      result.current.addItem(productA);
    });
    expect(result.current.totals).not.toHaveProperty('marginPercent');
    expect(result.current.totals).not.toHaveProperty('avgLanding');
  });

  it('resets to 0 after clear', () => {
    const { result } = renderHook(() => useQuote());
    act(() => {
      result.current.addItem(productA);
      result.current.clearQuote();
    });
    expect(result.current.totals.totalMRP).toBe(0);
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

  it('lineTotal = dealerPricePostTax × qty', () => {
    const { result } = renderHook(() => useQuote());
    act(() => {
      result.current.addItem(productA);
      result.current.updateQuantity(productA.articleCode, 3);
    });
    expect(result.current.quoteTemplateItems[0].lineTotal).toBe(productA.dealerPricePostTax * 3);
  });
});

describe('useQuote — getAdjustedItems (margin slider)', () => {
  it('recalculates postTax using AvgLanding/(1-margin)', () => {
    const { result } = renderHook(() => useQuote());
    act(() => {
      result.current.addItem(productA);
    });
    const adjusted = result.current.getAdjustedItems(20); // 20%
    const expected = productA.avgLanding / (1 - 0.2);
    expect(adjusted[0].adjDealerPostTax).toBeCloseTo(expected, 0);
  });

  it('recalculates preTax as postTax/1.18 (hardcoded GST)', () => {
    const { result } = renderHook(() => useQuote());
    act(() => {
      result.current.addItem(productA);
    });
    const adjusted = result.current.getAdjustedItems(20);
    const expectedPost = productA.avgLanding / 0.8;
    expect(adjusted[0].adjDealerPreTax).toBeCloseTo(expectedPost / 1.18, 0);
  });

  it('preserves original values alongside adjusted', () => {
    const { result } = renderHook(() => useQuote());
    act(() => {
      result.current.addItem(productA);
    });
    const adjusted = result.current.getAdjustedItems(20);
    expect(adjusted[0].origDealerPostTax).toBe(productA.dealerPricePostTax);
    expect(adjusted[0].origMarginPercent).toBe(productA.marginPercent);
  });
});
