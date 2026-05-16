import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSearch } from './useSearch';

const products = [
  {
    articleCode: '534.84.523',
    articleName: 'Teresa Neo I-90 Bldc Hood',
    category: 'Cooker Hoods',
    mrp: 48120,
    rrp: 36768,
    marginPercent: 0.13,
    gstRate: 0.18,
  },
  {
    articleCode: '538.81.001',
    articleName: 'Castor Hob 4-Burner',
    category: 'Hobs',
    mrp: 22000,
    rrp: 18000,
    marginPercent: 0.1,
    gstRate: 0.08,
  },
];

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useSearch', () => {
  it('returns all products on initial load (empty query)', async () => {
    const { result } = renderHook(() => useSearch(products));

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.results.length).toBe(2);
  });

  it('does not fire search immediately on keystroke (debounce)', async () => {
    const { result } = renderHook(() => useSearch(products));

    act(() => {
      result.current.setQuery('teresa');
    });

    // Before debounce fires, results should still be all products
    expect(result.current.query).toBe('teresa');
    expect(result.current.results.length).toBe(2); // still debouncing

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    // Now debounce has fired
    expect(result.current.results.length).toBe(1);
    expect(result.current.results[0].articleName).toContain('Teresa');
  });

  it('fires search 200ms after last keystroke', async () => {
    const { result } = renderHook(() => useSearch(products));

    act(() => {
      result.current.setQuery('castor'); // unique to Castor Hob — no fuzzy overlap
    });

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.results.length).toBe(1);
    expect(result.current.results[0].category).toBe('Hobs');
  });

  it('resets to all products when query is cleared', async () => {
    const { result } = renderHook(() => useSearch(products));

    act(() => {
      result.current.setQuery('teresa');
    });

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.results.length).toBe(1);

    act(() => {
      result.current.setQuery('');
    });

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.results.length).toBe(2);
  });

  it('returns empty array when no products are provided', async () => {
    const { result } = renderHook(() => useSearch([]));

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.results.length).toBe(0);
  });

  it('derives availableCategories from products', () => {
    const { result } = renderHook(() => useSearch(products));
    expect(result.current.availableCategories).toContain('Cooker Hoods');
    expect(result.current.availableCategories).toContain('Hobs');
  });

  it('clearFilters resets to default filters', async () => {
    const { result } = renderHook(() => useSearch(products));

    act(() => {
      result.current.setFilters((prev) => ({ ...prev, categories: ['Hobs'] }));
    });

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.results.length).toBe(1);

    act(() => {
      result.current.clearFilters();
    });

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.results.length).toBe(2);
  });

  it('applies category filter', async () => {
    const { result } = renderHook(() => useSearch(products));

    act(() => {
      result.current.setFilters((prev) => ({ ...prev, categories: ['Hobs'] }));
    });

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.results.length).toBe(1);
    expect(result.current.results[0].category).toBe('Hobs');
  });

  it('applies margin filter', async () => {
    const { result } = renderHook(() => useSearch(products));

    act(() => {
      result.current.setFilters((prev) => ({
        ...prev,
        marginRange: { min: 0.12, max: null },
      }));
    });

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.results.every((r) => r.marginPercent >= 0.12)).toBe(true);
  });
});
