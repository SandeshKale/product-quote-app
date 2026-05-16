import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useQuote } from './useQuote';

const productA = {
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
};

const productB = {
  serialNo: 2,
  articleCode: '538.81.001',
  articleName: 'Castor Hob 4-Burner',
  category: 'Hobs',
  mrp: 22000,
  rrp: 18000,
  dealerPricePreTax: 5000,
  gstRate: 0.08,
  dealerPricePostTax: 5400,
  marginPercent: 0.1,
};

describe('useQuote — addItem', () => {
  it('adds a new product with quantity 1', () => {
    const { result } = renderHook(() => useQuote());

    act(() => {
      result.current.addItem(productA);
    });

    expect(result.current.items.length).toBe(1);
    expect(result.current.items[0].product.articleCode).toBe('534.84.523');
  });

  it('increments quantity when same product added again', () => {
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

  it('exposes itemCount', () => {
    const { result } = renderHook(() => useQuote());

    act(() => {
      result.current.addItem(productA);
      result.current.addItem(productB);
    });

    expect(result.current.itemCount).toBe(2);
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
      result.current.removeItem('534.84.523');
    });

    expect(result.current.items.length).toBe(1);
    expect(result.current.items[0].product.articleCode).toBe('538.81.001');
  });
});

describe('useQuote — updateQuantity', () => {
  it('updates quantity for a specific product', () => {
    const { result } = renderHook(() => useQuote());

    act(() => {
      result.current.addItem(productA);
    });

    act(() => {
      result.current.updateQuantity('534.84.523', 5);
    });

    expect(result.current.items[0].quantity).toBe(5);
  });

  it('qty 0 removes the item', () => {
    const { result } = renderHook(() => useQuote());

    act(() => {
      result.current.addItem(productA);
    });

    act(() => {
      result.current.updateQuantity('534.84.523', 0);
    });

    expect(result.current.items.length).toBe(0);
  });

  it('floors decimal quantities', () => {
    const { result } = renderHook(() => useQuote());

    act(() => {
      result.current.addItem(productA);
    });

    act(() => {
      result.current.updateQuantity('534.84.523', 2.7);
    });

    expect(result.current.items[0].quantity).toBe(2);
  });
});

describe('useQuote — clearQuote', () => {
  it('removes all items', () => {
    const { result } = renderHook(() => useQuote());

    act(() => {
      result.current.addItem(productA);
      result.current.addItem(productB);
    });

    act(() => {
      result.current.clearQuote();
    });

    expect(result.current.items.length).toBe(0);
    expect(result.current.itemCount).toBe(0);
  });
});

describe('useQuote — totals', () => {
  it('calculates totalMRP correctly', () => {
    const { result } = renderHook(() => useQuote());

    act(() => {
      result.current.addItem(productA);
      result.current.addItem(productA); // qty = 2
    });

    expect(result.current.totals.totalMRP).toBe(productA.mrp * 2);
  });

  it('calculates totalRRP correctly', () => {
    const { result } = renderHook(() => useQuote());

    act(() => {
      result.current.addItem(productA);
      result.current.addItem(productB);
    });

    expect(result.current.totals.totalRRP).toBe(productA.rrp + productB.rrp);
  });

  it('calculates totalDealerPreTax correctly', () => {
    const { result } = renderHook(() => useQuote());

    act(() => {
      result.current.addItem(productA);
    });

    expect(result.current.totals.totalDealerPreTax).toBe(productA.dealerPricePreTax);
  });

  it('calculates totalDealerPostTax correctly', () => {
    const { result } = renderHook(() => useQuote());

    act(() => {
      result.current.addItem(productA);
    });

    expect(result.current.totals.totalDealerPostTax).toBe(productA.dealerPricePostTax);
  });

  it('totals object never contains margin', () => {
    const { result } = renderHook(() => useQuote());

    act(() => {
      result.current.addItem(productA);
    });

    expect(result.current.totals).not.toHaveProperty('marginPercent');
    expect(result.current.totals).not.toHaveProperty('totalMargin');
    expect(result.current.totals).not.toHaveProperty('averageMargin');
  });

  it('totals reset to zero on clearQuote', () => {
    const { result } = renderHook(() => useQuote());

    act(() => {
      result.current.addItem(productA);
      result.current.clearQuote();
    });

    expect(result.current.totals.totalMRP).toBe(0);
    expect(result.current.totals.totalDealerPostTax).toBe(0);
  });
});

describe('useQuote — quoteTemplateItems', () => {
  it('does not include marginPercent in quoteTemplateItems', () => {
    const { result } = renderHook(() => useQuote());

    act(() => {
      result.current.addItem(productA);
    });

    const templateItem = result.current.quoteTemplateItems[0];
    expect(templateItem).not.toHaveProperty('marginPercent');
  });

  it('includes all required fields for the quote template', () => {
    const { result } = renderHook(() => useQuote());

    act(() => {
      result.current.addItem(productA);
    });

    const templateItem = result.current.quoteTemplateItems[0];
    expect(templateItem).toHaveProperty('articleCode');
    expect(templateItem).toHaveProperty('articleName');
    expect(templateItem).toHaveProperty('mrp');
    expect(templateItem).toHaveProperty('rrp');
    expect(templateItem).toHaveProperty('dealerPricePostTax');
    expect(templateItem).toHaveProperty('quantity');
    expect(templateItem).toHaveProperty('lineTotal');
  });

  it('calculates lineTotal as dealerPricePostTax × quantity', () => {
    const { result } = renderHook(() => useQuote());

    act(() => {
      result.current.addItem(productA);
      result.current.updateQuantity(productA.articleCode, 3);
    });

    const templateItem = result.current.quoteTemplateItems[0];
    expect(templateItem.lineTotal).toBe(productA.dealerPricePostTax * 3);
  });
});
