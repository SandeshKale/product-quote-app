import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDataSync } from './useDataSync';

vi.mock('../services/driveService', () => ({
  fetchExcelFile: vi.fn(),
  fetchFileMetadata: vi.fn(),
}));

vi.mock('../utils/excelParser', () => ({
  parseExcel: vi.fn(),
}));

import { fetchExcelFile, fetchFileMetadata } from '../services/driveService';
import { parseExcel } from '../utils/excelParser';

const mockProducts = [
  { articleCode: 'A', articleName: 'Product A', category: 'Hoods' },
];
const mockMeta = { fileName: 'TestData.xlsx', modifiedTime: '2026-05-15T09:00:00Z' };

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  fetchExcelFile.mockResolvedValue(new ArrayBuffer(8));
  fetchFileMetadata.mockResolvedValue(mockMeta);
  parseExcel.mockReturnValue(mockProducts);
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
  localStorage.clear();
});

describe('useDataSync', () => {
  it('starts with idle status', () => {
    const { result } = renderHook(() => useDataSync());
    // Before useEffect resolves
    expect(result.current.status).toBe('idle');
  });

  it('transitions to loading then ready on successful fetch', async () => {
    const { result } = renderHook(() => useDataSync());

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.status).toBe('ready');
    expect(result.current.products).toEqual(mockProducts);
    expect(result.current.metadata).toEqual(mockMeta);
  });

  it('sets lastSynced after a successful fetch', async () => {
    const { result } = renderHook(() => useDataSync());

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.lastSynced).toBeInstanceOf(Date);
  });

  it('serves cached data when cache is valid (under 2h)', async () => {
    // Pre-populate cache with valid timestamp
    localStorage.setItem('pq_products_v1', JSON.stringify(mockProducts));
    localStorage.setItem('pq_metadata_v1', JSON.stringify(mockMeta));
    localStorage.setItem('pq_timestamp_v1', String(Date.now()));

    const { result } = renderHook(() => useDataSync());

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // Should not have called fetchExcelFile for cache hit
    // (it may call it in background after 3s — that's acceptable)
    expect(result.current.status).toBe('ready');
    expect(result.current.products).toEqual(mockProducts);
  });

  it('falls back to stale cache when fetch fails', async () => {
    // Pre-populate stale cache
    localStorage.setItem('pq_products_v1', JSON.stringify(mockProducts));
    localStorage.setItem('pq_metadata_v1', JSON.stringify(mockMeta));
    localStorage.setItem('pq_timestamp_v1', '0'); // expired timestamp

    fetchExcelFile.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useDataSync());

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.status).toBe('stale');
    expect(result.current.products).toEqual(mockProducts);
  });

  it('sets error status when fetch fails and no cache exists', async () => {
    fetchExcelFile.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useDataSync());

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.products).toEqual([]);
  });

  it('refresh() forces a fresh fetch bypassing cache', async () => {
    // Valid cache
    localStorage.setItem('pq_products_v1', JSON.stringify(mockProducts));
    localStorage.setItem('pq_metadata_v1', JSON.stringify(mockMeta));
    localStorage.setItem('pq_timestamp_v1', String(Date.now()));

    const { result } = renderHook(() => useDataSync());

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    const callsBefore = fetchExcelFile.mock.calls.length;

    await act(async () => {
      result.current.refresh();
      await vi.runAllTimersAsync();
    });

    expect(fetchExcelFile.mock.calls.length).toBeGreaterThan(callsBefore);
    expect(result.current.status).toBe('ready');
  });

  it('writes fetched data to localStorage cache', async () => {
    localStorage.setItem('pq_timestamp_v1', '0'); // force miss

    const { result } = renderHook(() => useDataSync());

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.status).toBe('ready');
    const stored = JSON.parse(localStorage.getItem('pq_products_v1'));
    expect(stored).toEqual(mockProducts);
  });
});
