import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchExcelFile, fetchFileMetadata } from './driveService';

const mockArrayBuffer = new ArrayBuffer(8);

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('fetchExcelFile', () => {
  it('returns an ArrayBuffer on success', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      arrayBuffer: () => Promise.resolve(mockArrayBuffer),
    });

    const result = await fetchExcelFile();
    expect(result).toBe(mockArrayBuffer);
  });

  it('throws on HTTP error', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 403 });
    await expect(fetchExcelFile()).rejects.toThrow('HTTP 403');
  });

  it('throws on network failure', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));
    await expect(fetchExcelFile()).rejects.toThrow('Network error');
  });

  it('calls fetch with the correct URL structure', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      arrayBuffer: () => Promise.resolve(mockArrayBuffer),
    });

    await fetchExcelFile();
    const calledUrl = fetch.mock.calls[0][0];
    expect(calledUrl).toContain('googleapis.com/drive/v3/files');
    expect(calledUrl).toContain('alt=media');
    expect(calledUrl).toContain('key=');
  });
});

describe('fetchFileMetadata', () => {
  it('returns fileName and modifiedTime on success', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ name: 'TestData.xlsx', modifiedTime: '2026-05-15T09:00:00Z' }),
    });

    const result = await fetchFileMetadata();
    expect(result.fileName).toBe('TestData.xlsx');
    expect(result.modifiedTime).toBe('2026-05-15T09:00:00Z');
  });

  it('returns fallback on HTTP error (non-fatal)', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 400 });
    const result = await fetchFileMetadata();
    expect(result.fileName).toBe('TestData.xlsx');
    expect(result.modifiedTime).toBeNull();
  });

  it('returns fallback on network failure (non-fatal)', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));
    const result = await fetchFileMetadata();
    expect(result.fileName).toBe('TestData.xlsx');
    expect(result.modifiedTime).toBeNull();
  });

  it('calls fetch with fields=name,modifiedTime', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ name: 'TestData.xlsx', modifiedTime: '2026-05-15T09:00:00Z' }),
    });

    await fetchFileMetadata();
    const calledUrl = fetch.mock.calls[0][0];
    expect(calledUrl).toContain('fields=name,modifiedTime');
  });
});
