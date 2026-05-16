import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QuotePanel from './QuotePanel';

vi.mock('../../services/quoteExporter', () => ({
  exportAndShare: vi.fn(() => Promise.resolve({ method: 'share', success: true })),
}));
vi.mock('html2canvas', () => ({ default: vi.fn() }));

const product = {
  serialNo: 1,
  articleCode: '534.84.523',
  articleName: 'Teresa Hood',
  category: 'Cooker Hoods',
  mrp: 48120,
  rrp: 36768,
  dealerPricePreTax: 11931,
  gstRate: 0.18,
  dealerPricePostTax: 14079,
  marginPercent: 0.13,
};
const templateItem = {
  serialNo: 1,
  articleCode: '534.84.523',
  articleName: 'Teresa Hood',
  category: 'Cooker Hoods',
  mrp: 48120,
  rrp: 36768,
  dealerPricePreTax: 11931,
  gstRate: 0.18,
  dealerPricePostTax: 14079,
  quantity: 2,
  lineTotal: 28158,
};
const totals = {
  totalMRP: 96240,
  totalRRP: 73536,
  totalDealerPreTax: 23862,
  totalDealerPostTax: 28158,
};

const defaultProps = {
  items: [{ product, quantity: 2 }],
  totals,
  quoteTemplateItems: [templateItem],
  onRemove: vi.fn(),
  onUpdateQuantity: vi.fn(),
  onClear: vi.fn(),
  isOpen: true,
  onClose: vi.fn(),
};

describe('QuotePanel', () => {
  it('renders quote items', () => {
    render(<QuotePanel {...defaultProps} />);
    // Text appears in both the panel list and the offscreen QuoteTemplate
    expect(screen.getAllByText('Teresa Hood').length).toBeGreaterThan(0);
  });

  it('shows margin % for each item in the panel', () => {
    render(<QuotePanel {...defaultProps} />);
    expect(screen.getByText(/Margin: 13%/i)).toBeInTheDocument();
  });

  it('shows totals section', () => {
    render(<QuotePanel {...defaultProps} />);
    // Totals appear in both the panel and the offscreen QuoteTemplate
    expect(screen.getAllByText(/Total.*MRP|Dealer.*Tax/i).length).toBeGreaterThan(0);
    // totals appear in QuotePanel section
  });

  it('does not show margin in totals', () => {
    render(<QuotePanel {...defaultProps} />);
    expect(screen.queryByText(/total margin/i)).not.toBeInTheDocument();
  });

  it('calls onRemove when trash button clicked', () => {
    const onRemove = vi.fn();
    render(<QuotePanel {...defaultProps} onRemove={onRemove} />);
    fireEvent.click(screen.getByLabelText(/remove teresa hood/i));
    expect(onRemove).toHaveBeenCalledWith('534.84.523');
  });

  it('calls onUpdateQuantity when + clicked', () => {
    const onUpdateQuantity = vi.fn();
    render(<QuotePanel {...defaultProps} onUpdateQuantity={onUpdateQuantity} />);
    fireEvent.click(screen.getByLabelText(/increase quantity/i));
    expect(onUpdateQuantity).toHaveBeenCalledWith('534.84.523', 3);
  });

  it('calls onClear when Clear all clicked', () => {
    const onClear = vi.fn();
    render(<QuotePanel {...defaultProps} onClear={onClear} />);
    fireEvent.click(screen.getByText('Clear all'));
    expect(onClear).toHaveBeenCalled();
  });

  it('shows empty state when no items', () => {
    render(
      <QuotePanel
        {...defaultProps}
        items={[]}
        quoteTemplateItems={[]}
        totals={{ totalMRP: 0, totalRRP: 0, totalDealerPreTax: 0, totalDealerPostTax: 0 }}
      />
    );
    expect(screen.getByText(/No items/i)).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<QuotePanel {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('calls exportAndShare when Share Quote button is clicked', async () => {
    const { exportAndShare } = await import('../../services/quoteExporter');
    render(<QuotePanel {...defaultProps} />);
    fireEvent.click(screen.getByText('Share Quote'));
    await waitFor(() => {
      expect(exportAndShare).toHaveBeenCalled();
    });
  });
});

describe('QuotePanel — margin slider', () => {
  it('renders the margin slider section', () => {
    render(<QuotePanel {...defaultProps} />);
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('shows adjusted values when slider is moved', async () => {
    const getAdjustedItems = vi.fn(() => [
      {
        ...templateItem,
        adjDealerPostTax: 16000,
        adjDealerPreTax: 13559,
        adjLineTotal: 32000,
        origDealerPostTax: 14079,
        origDealerPreTax: 11931,
        origLineTotal: 28158,
        origMarginPercent: 0.13,
        adjMarginPercent: 0.2,
      },
    ]);
    render(<QuotePanel {...defaultProps} getAdjustedItems={getAdjustedItems} />);
    fireEvent.change(screen.getByRole('slider'), { target: { value: '20' } });
    await waitFor(() => {
      expect(screen.getAllByText('20%').length).toBeGreaterThan(0);
    });
  });

  it('renders template type buttons', () => {
    render(<QuotePanel {...defaultProps} />);
    expect(screen.getByText('Detailed')).toBeInTheDocument();
    expect(screen.getByText('Simple')).toBeInTheDocument();
  });

  it('switches template type on button click', () => {
    render(<QuotePanel {...defaultProps} />);
    fireEvent.click(screen.getByText('Simple'));
    expect(screen.getByText('Simple').className).toMatch(/Active/);
  });

  it('shows edit title button', () => {
    render(<QuotePanel {...defaultProps} />);
    expect(screen.getByLabelText(/edit title/i)).toBeInTheDocument();
  });

  it('allows editing the quote title', async () => {
    render(<QuotePanel {...defaultProps} />);
    fireEvent.click(screen.getByLabelText(/edit title/i));
    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: '' })).toBeInTheDocument();
    });
  });
});
