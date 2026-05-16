import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseExcel } from './excelParser';

// Mock XLSX to control what sheet_to_json returns
vi.mock('xlsx', () => ({
  read: vi.fn(),
  utils: {
    sheet_to_json: vi.fn(),
  },
}));

import * as XLSX from 'xlsx';

const mockRow = {
  'Sr. No.': 1,
  'Article Code': '534.84.523',
  ArticleName: 'Teresa Neo I-90 Bldc Tsensor Hood',
  ProductCategory: 'Cooker Hoods',
  'Q2 MRP': 48120.63,
  'Q2 RRP': 36768.66,
  'Dealer Price - pre-tax': 11931.84,
  'GST Rate': 0.18,
  'Dealer Price Post tax': 14079.57,
  'Margin %': 0.13,
  Cost: 12249.22, // should be excluded
};

beforeEach(() => {
  XLSX.read.mockReturnValue({
    SheetNames: ['Sheet1'],
    Sheets: { Sheet1: {} },
  });
  XLSX.utils.sheet_to_json.mockReturnValue([mockRow]);
});

describe('parseExcel', () => {
  it('returns an array of products', () => {
    const result = parseExcel(new ArrayBuffer(8));
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
  });

  it('maps articleCode correctly', () => {
    const [p] = parseExcel(new ArrayBuffer(8));
    expect(p.articleCode).toBe('534.84.523');
  });

  it('maps articleName correctly', () => {
    const [p] = parseExcel(new ArrayBuffer(8));
    expect(p.articleName).toBe('Teresa Neo I-90 Bldc Tsensor Hood');
  });

  it('maps category correctly', () => {
    const [p] = parseExcel(new ArrayBuffer(8));
    expect(p.category).toBe('Cooker Hoods');
  });

  it('maps mrp as a number', () => {
    const [p] = parseExcel(new ArrayBuffer(8));
    expect(p.mrp).toBe(48120.63);
  });

  it('maps rrp as a number', () => {
    const [p] = parseExcel(new ArrayBuffer(8));
    expect(p.rrp).toBe(36768.66);
  });

  it('maps dealerPricePreTax as a number', () => {
    const [p] = parseExcel(new ArrayBuffer(8));
    expect(p.dealerPricePreTax).toBe(11931.84);
  });

  it('maps gstRate as a number', () => {
    const [p] = parseExcel(new ArrayBuffer(8));
    expect(p.gstRate).toBe(0.18);
  });

  it('maps dealerPricePostTax as a number', () => {
    const [p] = parseExcel(new ArrayBuffer(8));
    expect(p.dealerPricePostTax).toBe(14079.57);
  });

  it('includes marginPercent for in-app use', () => {
    const [p] = parseExcel(new ArrayBuffer(8));
    expect(p.marginPercent).toBe(0.13);
  });

  it('does NOT include cost field', () => {
    const [p] = parseExcel(new ArrayBuffer(8));
    expect(p).not.toHaveProperty('cost');
    expect(p).not.toHaveProperty('Cost');
  });

  it('filters out completely empty rows', () => {
    XLSX.utils.sheet_to_json.mockReturnValue([
      mockRow,
      { 'Sr. No.': null, 'Article Code': null, ArticleName: null },
    ]);
    const result = parseExcel(new ArrayBuffer(8));
    expect(result.length).toBe(1);
  });

  it('coerces null numeric fields to 0', () => {
    XLSX.utils.sheet_to_json.mockReturnValue([
      { ...mockRow, 'Q2 MRP': null, 'Q2 RRP': null },
    ]);
    const [p] = parseExcel(new ArrayBuffer(8));
    expect(p.mrp).toBe(0);
    expect(p.rrp).toBe(0);
  });

  it('handles missing optional columns gracefully', () => {
    XLSX.utils.sheet_to_json.mockReturnValue([
      { 'Article Code': 'TEST-001', ArticleName: 'Test Product' },
    ]);
    const [p] = parseExcel(new ArrayBuffer(8));
    expect(p.articleCode).toBe('TEST-001');
    expect(p.gstRate).toBe(0);
    expect(p.mrp).toBe(0);
  });

  it('assigns sequential serialNo when Sr. No. is missing', () => {
    XLSX.utils.sheet_to_json.mockReturnValue([
      { 'Article Code': 'A', ArticleName: 'Product A' },
      { 'Article Code': 'B', ArticleName: 'Product B' },
    ]);
    const result = parseExcel(new ArrayBuffer(8));
    expect(result[0].serialNo).toBe(1);
    expect(result[1].serialNo).toBe(2);
  });

  it('handles multiple products', () => {
    XLSX.utils.sheet_to_json.mockReturnValue([mockRow, { ...mockRow, 'Article Code': 'B' }]);
    const result = parseExcel(new ArrayBuffer(8));
    expect(result.length).toBe(2);
  });
});
