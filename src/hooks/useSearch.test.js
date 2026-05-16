import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSearch } from './useSearch';

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
  },
];

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('useSearch', () => {
  it('returns all products on initial load', async () => {
    const { result } = renderHook(() => useSearch(products));
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.results.length).toBe(3);
  });

  it('debounces search by 200ms', async () => {
    const { result } = renderHook(() => useSearch(products));
    act(() => {
      result.current.setQuery('teresa');
    });
    expect(result.current.results.length).toBe(3); // still debouncing
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.results.length).toBe(1);
  });

  it('filters by category', async () => {
    const { result } = renderHook(() => useSearch(products));
    act(() => {
      result.current.setFilters((f) => ({ ...f, categories: ['Hobs'] }));
    });
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.results.every((r) => r.category === 'Hobs')).toBe(true);
  });

  it('filters by stockStatus', async () => {
    const { result } = renderHook(() => useSearch(products));
    act(() => {
      result.current.setFilters((f) => ({ ...f, stockStatus: ['Discntd'] }));
    });
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.results.length).toBe(1);
    expect(result.current.results[0].stockStatus).toBe('Discntd');
  });

  it('derives availableCategories from product data', () => {
    const { result } = renderHook(() => useSearch(products));
    expect(result.current.availableCategories).toContain('Cooker Hoods');
    expect(result.current.availableCategories).toContain('Hobs');
  });

  it('derives availableDimensions from product data', () => {
    const { result } = renderHook(() => useSearch(products));
    expect(result.current.availableDimensions).toContain('Chimney - 90cm');
    expect(result.current.availableDimensions).toContain('Hob - 30cm');
  });

  it('clearFilters resets to all products', async () => {
    const { result } = renderHook(() => useSearch(products));
    act(() => {
      result.current.setFilters((f) => ({ ...f, stockStatus: ['Good'] }));
    });
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.results.length).toBe(2);
    act(() => {
      result.current.clearFilters();
    });
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.results.length).toBe(3);
  });
});
