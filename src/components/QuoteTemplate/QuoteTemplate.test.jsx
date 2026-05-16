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
    origDealerPostTax: 14079,
    origDealerPreTax: 11931,
    adjDealerPostTax: 14079,
    adjDealerPreTax: 11931,
    adjLineTotal: 28158,
    origLineTotal: 28158,
  },
];
const totals = {
  totalMRP: 96240,
  totalRRP: 73536,
  totalDealerPreTax: 23862,
  totalDealerPostTax: 28158,
};
const baseProps = {
  quoteTitle: 'Smart Quote Generator',
  items,
  totals,
  templateType: 'detailed',
  sliderMarginPct: null,
};

describe('QuoteTemplate — margin enforcement', () => {
  it('NEVER renders margin % in the output', () => {
    render(<QuoteTemplate {...baseProps} />);
    expect(screen.queryByText(/\bmargin\b/i)).not.toBeInTheDocument();
  });

  it('NEVER renders an expiry date', () => {
    render(<QuoteTemplate {...baseProps} />);
    expect(screen.queryByText(/expir/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/valid for/i)).not.toBeInTheDocument();
  });

  it('NEVER renders cost price', () => {
    render(<QuoteTemplate {...baseProps} />);
    expect(screen.queryByText(/\bcost\b/i)).not.toBeInTheDocument();
  });
});

describe('QuoteTemplate — quote number removed (#18)', () => {
  it('does NOT render a QT- quote number', () => {
    render(<QuoteTemplate {...baseProps} />);
    expect(screen.queryByText(/QT-\d+/)).not.toBeInTheDocument();
  });
});

describe('QuoteTemplate — content', () => {
  it('renders the quote title', () => {
    render(<QuoteTemplate {...baseProps} />);
    expect(screen.getAllByText('Smart Quote Generator').length).toBeGreaterThan(0);
  });

  it('renders the article code', () => {
    render(<QuoteTemplate {...baseProps} />);
    expect(screen.getByText('534.84.523')).toBeInTheDocument();
  });

  it('renders the product name', () => {
    render(<QuoteTemplate {...baseProps} />);
    expect(screen.getByText('Teresa Neo I-90 Bldc Hood')).toBeInTheDocument();
  });

  it('renders TOTALS in tfoot (#3)', () => {
    render(<QuoteTemplate {...baseProps} />);
    expect(screen.getByText('TOTALS')).toBeInTheDocument();
  });

  it('renders Dealer Pre-Tax column header in detailed mode (#20)', () => {
    render(<QuoteTemplate {...baseProps} />);
    expect(screen.getByText('Dealer Pre-Tax')).toBeInTheDocument();
  });

  it('hides Dealer Pre-Tax column in simple mode', () => {
    render(<QuoteTemplate {...baseProps} templateType="simple" />);
    expect(screen.queryByText('Dealer Pre-Tax')).not.toBeInTheDocument();
  });

  it('shows Margin Applied in header when slider is active (#19)', () => {
    render(<QuoteTemplate {...baseProps} sliderMarginPct={20} />);
    expect(screen.getByText('Margin Applied')).toBeInTheDocument();
  });

  it('accepts a ref for html2canvas', () => {
    const ref = { current: null };
    render(<QuoteTemplate ref={ref} {...baseProps} />);
    expect(ref.current).not.toBeNull();
  });
});
