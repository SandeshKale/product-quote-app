import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseExcel } from './excelParser';

vi.mock('xlsx', () => ({
  read: vi.fn(),
  utils: { sheet_to_json: vi.fn() },
}));

import * as XLSX from 'xlsx';

// New column structure matching updated Excel (Row 1 headers, 14 cols)
const mockRow = {
  'Sr. No.': 1,
  'Article Code': '534.84.523',
  ArticleName: 'Teresa Neo I-90 Bldc Tsensor Hood',
  ProductGroup: 'Appliances',
  ProductCategory: 'Cooker Hoods',
  Dimensions: 'Chimney - 90cm',
  StockStatus: 'Good',
  Stock: 125,
  'Q2 MRP': 90290,
  'Q2 RRP': 68990,
  'Dealer Price - pre-tax': null, // formula col — recalculated from avgLanding
  'Dealer Price Post tax': null, // formula col — recalculated from avgLanding
  Margin: 0.13,
  'Avg Landing': 47482,
};

beforeEach(() => {
  XLSX.read.mockReturnValue({ SheetNames: ['Sheet1'], Sheets: { Sheet1: {} } });
  XLSX.utils.sheet_to_json.mockReturnValue([mockRow]);
});

describe('parseExcel', () => {
  it('returns an array of products', () => {
    expect(Array.isArray(parseExcel(new ArrayBuffer(8)))).toBe(true);
    expect(parseExcel(new ArrayBuffer(8)).length).toBe(1);
  });

  it('maps articleCode correctly', () => {
    const [p] = parseExcel(new ArrayBuffer(8));
    expect(p.articleCode).toBe('534.84.523');
  });

  it('maps articleName correctly', () => {
    const [p] = parseExcel(new ArrayBuffer(8));
    expect(p.articleName).toBe('Teresa Neo I-90 Bldc Tsensor Hood');
  });

  it('maps productGroup correctly', () => {
    const [p] = parseExcel(new ArrayBuffer(8));
    expect(p.productGroup).toBe('Appliances');
  });

  it('maps category from ProductCategory column', () => {
    const [p] = parseExcel(new ArrayBuffer(8));
    expect(p.category).toBe('Cooker Hoods');
  });

  it('maps dimensions correctly', () => {
    const [p] = parseExcel(new ArrayBuffer(8));
    expect(p.dimensions).toBe('Chimney - 90cm');
  });

  it('maps stockStatus correctly', () => {
    const [p] = parseExcel(new ArrayBuffer(8));
    expect(p.stockStatus).toBe('Good');
  });

  it('maps stock qty correctly', () => {
    const [p] = parseExcel(new ArrayBuffer(8));
    expect(p.stock).toBe(125);
  });

  it('maps mrp correctly', () => {
    const [p] = parseExcel(new ArrayBuffer(8));
    expect(p.mrp).toBe(90290);
  });

  it('includes avgLanding (renamed from Cost)', () => {
    const [p] = parseExcel(new ArrayBuffer(8));
    expect(p.avgLanding).toBe(47482);
  });

  it('includes marginPercent', () => {
    const [p] = parseExcel(new ArrayBuffer(8));
    expect(p.marginPercent).toBe(0.13);
  });

  it('recalculates dealerPricePostTax from AvgLanding formula', () => {
    const [p] = parseExcel(new ArrayBuffer(8));
    // AvgLanding / (1 - Margin) = 47482 / 0.87
    expect(p.dealerPricePostTax).toBeCloseTo(47482 / 0.87, 0);
  });

  it('recalculates dealerPricePreTax with hardcoded 18% GST', () => {
    const [p] = parseExcel(new ArrayBuffer(8));
    const expectedPostTax = 47482 / 0.87;
    expect(p.dealerPricePreTax).toBeCloseTo(expectedPostTax / 1.18, 0);
  });

  it('sets gstRate to 0.18 constant', () => {
    const [p] = parseExcel(new ArrayBuffer(8));
    expect(p.gstRate).toBe(0.18);
  });

  it('does NOT include a separate GST rate column', () => {
    const [p] = parseExcel(new ArrayBuffer(8));
    // gstRate is always 0.18 — there is no per-product GST column
    expect(p.gstRate).toBe(0.18);
  });

  it('filters out completely empty rows', () => {
    XLSX.utils.sheet_to_json.mockReturnValue([
      mockRow,
      { 'Article Code': null, ArticleName: null },
    ]);
    expect(parseExcel(new ArrayBuffer(8)).length).toBe(1);
  });

  it('parses Indian-formatted RRP strings correctly', () => {
    XLSX.utils.sheet_to_json.mockReturnValue([{ ...mockRow, 'Q2 RRP': '1,12,442' }]);
    const [p] = parseExcel(new ArrayBuffer(8));
    expect(p.rrp).toBe(112442);
  });

  it('handles discontinued products', () => {
    XLSX.utils.sheet_to_json.mockReturnValue([{ ...mockRow, StockStatus: 'Discntd' }]);
    const [p] = parseExcel(new ArrayBuffer(8));
    expect(p.stockStatus).toBe('Discntd');
  });

  it('uses default (no range offset) — Row 1 is the header row', () => {
    parseExcel(new ArrayBuffer(8));
    // sheet_to_json should be called WITHOUT range:2
    const callArgs = XLSX.utils.sheet_to_json.mock.calls[0][1];
    expect(callArgs?.range).toBeUndefined();
  });
});
