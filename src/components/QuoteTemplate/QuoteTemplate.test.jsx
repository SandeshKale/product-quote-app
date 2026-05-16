import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import QuoteTemplate from './QuoteTemplate';

const items = [
  {
    serialNo: 1,
    articleCode: '534.84.523',
    articleName: 'Teresa Neo I-90 Bldc Hood',
    category: 'Cooker Hoods',
    mrp: 48120,
    rrp: 36768,
    dealerPricePreTax: 11931,
    gstRate: 0.18,
    dealerPricePostTax: 14079,
    quantity: 2,
    lineTotal: 28158,
    // marginPercent intentionally absent — never passed to this component
  },
];

const totals = {
  totalMRP: 96240,
  totalRRP: 73536,
  totalDealerPreTax: 23862,
  totalDealerPostTax: 28158,
};

describe('QuoteTemplate — margin enforcement', () => {
  it('NEVER renders margin % in the output', () => {
    render(<QuoteTemplate quoteNumber="QT-1747295834123" items={items} totals={totals} />);
    expect(screen.queryByText(/margin/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/13%/)).not.toBeInTheDocument();
  });

  it('NEVER renders an expiry date', () => {
    render(<QuoteTemplate quoteNumber="QT-1747295834123" items={items} totals={totals} />);
    expect(screen.queryByText(/valid for/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/expir/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/valid till/i)).not.toBeInTheDocument();
  });

  it('NEVER renders cost price', () => {
    render(<QuoteTemplate quoteNumber="QT-1747295834123" items={items} totals={totals} />);
    expect(screen.queryByText(/cost/i)).not.toBeInTheDocument();
  });

  it('NEVER renders a margin total', () => {
    render(<QuoteTemplate quoteNumber="QT-1747295834123" items={items} totals={totals} />);
    expect(screen.queryByText(/total margin/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/average margin/i)).not.toBeInTheDocument();
  });
});

describe('QuoteTemplate — quote number', () => {
  it('renders the quote number in QT-<long integer> format', () => {
    render(<QuoteTemplate quoteNumber="QT-1747295834123" items={items} totals={totals} />);
    expect(screen.getByText('QT-1747295834123')).toBeInTheDocument();
  });
});

describe('QuoteTemplate — content', () => {
  it('renders the article code', () => {
    render(<QuoteTemplate quoteNumber="QT-1747295834123" items={items} totals={totals} />);
    expect(screen.getByText('534.84.523')).toBeInTheDocument();
  });

  it('renders the product name', () => {
    render(<QuoteTemplate quoteNumber="QT-1747295834123" items={items} totals={totals} />);
    expect(screen.getByText('Teresa Neo I-90 Bldc Hood')).toBeInTheDocument();
  });

  it('renders Total MRP', () => {
    render(<QuoteTemplate quoteNumber="QT-1747295834123" items={items} totals={totals} />);
    expect(screen.getByText('Total MRP')).toBeInTheDocument();
  });

  it('renders Total Dealer Price (Post-Tax)', () => {
    render(<QuoteTemplate quoteNumber="QT-1747295834123" items={items} totals={totals} />);
    expect(screen.getByText('Total Dealer Price (Post-Tax)')).toBeInTheDocument();
  });

  it('renders the date', () => {
    render(<QuoteTemplate quoteNumber="QT-1747295834123" items={items} totals={totals} />);
    expect(screen.getByText(/Date/i)).toBeInTheDocument();
  });

  it('accepts a ref for html2canvas capture', () => {
    const ref = { current: null };
    render(
      <QuoteTemplate ref={ref} quoteNumber="QT-1747295834123" items={items} totals={totals} />
    );
    expect(ref.current).not.toBeNull();
  });
});
