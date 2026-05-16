import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
    expect(screen.getByText('Teresa Hood')).toBeInTheDocument();
  });

  it('shows margin % for each item in the panel', () => {
    render(<QuotePanel {...defaultProps} />);
    expect(screen.getByText(/Margin: 13%/i)).toBeInTheDocument();
  });

  it('shows totals section', () => {
    render(<QuotePanel {...defaultProps} />);
    expect(screen.getByText('Total MRP')).toBeInTheDocument();
    expect(screen.getByText('Total Dealer (Post-Tax)')).toBeInTheDocument();
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
});
