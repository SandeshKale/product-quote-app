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
  dimensions: 'Chimney - 90cm',
  stockStatus: 'Good',
  stock: 125,
  mrp: 90290,
  rrp: 68990,
  dealerPricePreTax: 46254,
  gstRate: 0.18,
  dealerPricePostTax: 54580,
  marginPercent: 0.13,
  avgLanding: 47482,
};

const enrichedItem = {
  product,
  quantity: 2,
  effectiveMarginPct: 13,
  effectiveMarginDec: 0.13,
  adjDealerPostTax: 54580,
  adjDealerPreTax: 46254,
  origDealerPostTax: 54580,
  origDealerPreTax: 46254,
  origMarginPct: 13,
  isOverridden: false,
  adjLineTotal: 109160,
  origLineTotal: 109160,
};

const templateItem = {
  serialNo: 1,
  articleCode: '534.84.523',
  articleName: 'Teresa Hood',
  category: 'Cooker Hoods',
  mrp: 90290,
  rrp: 68990,
  dealerPricePreTax: 46254,
  dealerPricePostTax: 54580,
  quantity: 2,
  lineTotal: 109160,
  origDealerPreTax: 46254,
  origDealerPostTax: 54580,
  adjDealerPreTax: 46254,
  adjDealerPostTax: 54580,
  adjLineTotal: 109160,
  origLineTotal: 109160,
  isOverridden: false,
};

const totals = {
  totalMRP: 180580,
  totalRRP: 137980,
  totalDealerPreTax: 92508,
  totalDealerPostTax: 109160,
};

const defaultProps = {
  enrichedItems: [enrichedItem],
  adjustedTotals: totals,
  quoteTemplateItems: [templateItem],
  onRemove: vi.fn(),
  onUpdateQuantity: vi.fn(),
  onClear: vi.fn(),
  isOpen: true,
  onClose: vi.fn(),
  setItemMargin: vi.fn(),
  resetItemMargin: vi.fn(),
  marginOverrides: {},
  weightedMarginPct: 13,
  hasAnyOverride: false,
};

describe('QuotePanel', () => {
  it('renders product name', () => {
    render(<QuotePanel {...defaultProps} />);
    expect(screen.getAllByText('Teresa Hood').length).toBeGreaterThan(0);
  });

  it('shows dealer pre-tax in price table (#3)', () => {
    render(<QuotePanel {...defaultProps} />);
    // Pre-Tax column header is visible
    expect(screen.getAllByText('Pre-Tax').length).toBeGreaterThan(0);
  });

  it('shows original price column', () => {
    render(<QuotePanel {...defaultProps} />);
    expect(screen.getByText(/Original \(13%\)/i)).toBeInTheDocument();
  });

  it('shows Adjusted column when item is overridden', () => {
    const overriddenItem = { ...enrichedItem, isOverridden: true, effectiveMarginPct: 20 };
    render(<QuotePanel {...defaultProps} enrichedItems={[overriddenItem]} hasAnyOverride={true} />);
    expect(screen.getByText(/Adjusted \(20%\)/i)).toBeInTheDocument();
  });

  it('renders per-item margin slider', () => {
    render(<QuotePanel {...defaultProps} />);
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('calls setItemMargin when slider is moved', () => {
    const setItemMargin = vi.fn();
    render(<QuotePanel {...defaultProps} setItemMargin={setItemMargin} />);
    fireEvent.change(screen.getByRole('slider'), { target: { value: '20' } });
    expect(setItemMargin).toHaveBeenCalledWith('534.84.523', 20);
  });

  it('shows weighted margin % and rupee value when override is active', () => {
    render(
      <QuotePanel
        {...defaultProps}
        hasAnyOverride={true}
        weightedMarginPct={18}
        adjustedTotals={{
          ...totals,
          totalMarginValue: 15000,
          totalAdjDealerPreTax: 92508,
          totalAdjDealerPostTax: 109160,
        }}
      />
    );
    expect(screen.getByText(/Weighted avg margin/i)).toBeInTheDocument();
    expect(screen.getByText('18%')).toBeInTheDocument();
  });

  it('shows totals', () => {
    render(<QuotePanel {...defaultProps} />);
    expect(screen.getAllByText('Dealer Post-Tax').length).toBeGreaterThan(0);
  });

  it('calls onRemove when trash clicked', () => {
    const onRemove = vi.fn();
    render(<QuotePanel {...defaultProps} onRemove={onRemove} />);
    fireEvent.click(screen.getByLabelText(/remove teresa hood/i));
    expect(onRemove).toHaveBeenCalledWith('534.84.523');
  });

  it('calls onUpdateQuantity on + click', () => {
    const onUpdateQuantity = vi.fn();
    render(<QuotePanel {...defaultProps} onUpdateQuantity={onUpdateQuantity} />);
    fireEvent.click(screen.getByLabelText(/increase quantity/i));
    expect(onUpdateQuantity).toHaveBeenCalledWith('534.84.523', 3);
  });

  it('shows empty state when no items', () => {
    render(
      <QuotePanel
        {...defaultProps}
        enrichedItems={[]}
        quoteTemplateItems={[]}
        adjustedTotals={{ totalMRP: 0, totalRRP: 0, totalDealerPreTax: 0, totalDealerPostTax: 0 }}
      />
    );
    expect(screen.getByText(/No items yet/i)).toBeInTheDocument();
  });

  it('renders template type buttons', () => {
    render(<QuotePanel {...defaultProps} />);
    expect(screen.getByText('Detailed')).toBeInTheDocument();
    expect(screen.getByText('Simple')).toBeInTheDocument();
  });

  it('switches template type', () => {
    render(<QuotePanel {...defaultProps} />);
    fireEvent.click(screen.getByText('Simple'));
    expect(screen.getByText('Simple').className).toMatch(/Active/);
  });

  it('shows edit title button', () => {
    render(<QuotePanel {...defaultProps} />);
    expect(screen.getByLabelText(/edit title/i)).toBeInTheDocument();
  });

  it('calls Share when share button clicked', async () => {
    const { exportAndShare } = await import('../../services/quoteExporter');
    render(<QuotePanel {...defaultProps} />);
    fireEvent.click(screen.getByText('Share'));
    await waitFor(() => expect(exportAndShare).toHaveBeenCalled());
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<QuotePanel {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });
});

describe('QuotePanel — download button', () => {
  it('renders the download button', () => {
    render(<QuotePanel {...defaultProps} />);
    expect(screen.getByLabelText(/download quote/i)).toBeInTheDocument();
  });

  it('calls exportAndShare with forceDownload=true on download click', async () => {
    const { exportAndShare } = await import('../../services/quoteExporter');
    render(<QuotePanel {...defaultProps} />);
    fireEvent.click(screen.getByLabelText(/download quote/i));
    await waitFor(() => {
      expect(exportAndShare).toHaveBeenCalledWith(expect.anything(), expect.any(String), true);
    });
  });
});

describe('QuotePanel — title editing', () => {
  it('shows title input when edit button clicked', async () => {
    render(<QuotePanel {...defaultProps} />);
    fireEvent.click(screen.getByLabelText(/edit title/i));
    await waitFor(() => {
      // Input should appear
      expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0);
    });
  });

  it('closes title input on Enter key', async () => {
    render(<QuotePanel {...defaultProps} />);
    fireEvent.click(screen.getByLabelText(/edit title/i));
    const inputs = screen.getAllByRole('textbox');
    fireEvent.keyDown(inputs[inputs.length - 1], { key: 'Enter' });
    // Should close — edit button reappears
    await waitFor(() => {
      expect(screen.getByLabelText(/edit title/i)).toBeInTheDocument();
    });
  });
});
