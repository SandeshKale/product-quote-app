import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportAndShare } from './quoteExporter';

// Mock html2canvas
vi.mock('html2canvas', () => ({
  default: vi.fn(),
}));

import html2canvas from 'html2canvas';

const mockBlob = new Blob(['png-data'], { type: 'image/png' });
const mockCanvas = {
  toBlob: vi.fn((cb) => cb(mockBlob)),
};

const mockRef = { current: document.createElement('div') };
const quoteNumber = 'QT-1747295834123';

beforeEach(() => {
  html2canvas.mockResolvedValue(mockCanvas);
  // Reset navigator mocks
  delete navigator.canShare;
  delete navigator.share;

  // Mock URL methods
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn(() => 'blob:mock-url'),
    revokeObjectURL: vi.fn(),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('exportAndShare', () => {
  it('calls html2canvas with scale 2 and white background', async () => {
    navigator.canShare = vi.fn(() => false);

    await exportAndShare(mockRef, quoteNumber);

    expect(html2canvas).toHaveBeenCalledWith(
      mockRef.current,
      expect.objectContaining({ scale: 2, backgroundColor: '#ffffff' })
    );
  });

  it('uses navigator.share when file sharing is supported', async () => {
    navigator.canShare = vi.fn(() => true);
    navigator.share = vi.fn(() => Promise.resolve());

    const result = await exportAndShare(mockRef, quoteNumber);

    expect(navigator.share).toHaveBeenCalled();
    expect(result.method).toBe('share');
    expect(result.success).toBe(true);
  });

  it('returns aborted:true when user dismisses share sheet', async () => {
    navigator.canShare = vi.fn(() => true);
    navigator.share = vi.fn(() =>
      Promise.reject(Object.assign(new Error('AbortError'), { name: 'AbortError' }))
    );

    const result = await exportAndShare(mockRef, quoteNumber);

    expect(result.method).toBe('share');
    expect(result.aborted).toBe(true);
  });

  it('falls back to download when navigator.canShare is not available', async () => {
    navigator.canShare = undefined;

    // Create a real anchor element so appendChild works in jsdom
    const anchor = document.createElement('a');
    const clickSpy = vi.spyOn(anchor, 'click').mockImplementation(() => {});
    vi.spyOn(document, 'createElement').mockReturnValueOnce(anchor);

    const result = await exportAndShare(mockRef, quoteNumber);

    expect(result.method).toBe('download');
    expect(result.success).toBe(true);
    expect(clickSpy).toHaveBeenCalled();
  });

  it('falls back to download when canShare returns false', async () => {
    navigator.canShare = vi.fn(() => false);

    const appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    const removeSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

    const result = await exportAndShare(mockRef, quoteNumber);

    expect(result.method).toBe('download');
    expect(result.success).toBe(true);

    appendSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('uses quoteNumber as the file name', async () => {
    navigator.canShare = vi.fn(() => true);
    navigator.share = vi.fn(({ files }) => {
      expect(files[0].name).toBe(`${quoteNumber}.png`);
      return Promise.resolve();
    });

    await exportAndShare(mockRef, quoteNumber);
  });
});
