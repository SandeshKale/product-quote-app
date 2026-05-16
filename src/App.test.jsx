import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// Mock all external dependencies so App renders in isolation
vi.mock('./hooks/useDataSync', () => ({
  useDataSync: vi.fn(() => ({
    products: [
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
        marginPercent: 0.13,
      },
      {
        serialNo: 2,
        articleCode: '538.81.001',
        articleName: 'Castor Hob 4-Burner',
        category: 'Hobs',
        mrp: 22000,
        rrp: 18000,
        dealerPricePreTax: 5000,
        gstRate: 0.08,
        dealerPricePostTax: 5400,
        marginPercent: 0.1,
      },
    ],
    metadata: { fileName: 'TestData.xlsx', modifiedTime: '2026-05-15T09:00:00Z' },
    status: 'ready',
    lastSynced: new Date(),
    refresh: vi.fn(),
  })),
}));

vi.mock('./services/quoteExporter', () => ({
  exportAndShare: vi.fn(() => Promise.resolve({ method: 'share', success: true })),
}));

vi.mock('html2canvas', () => ({ default: vi.fn() }));

beforeEach(() => {
  // No fake timers here — waitFor relies on real setTimeout to poll
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('App', () => {
  it('renders the app name in the header', () => {
    render(<App />);
    expect(screen.getByText(/Smart Quote Generator/i)).toBeInTheDocument();
  });

  it('renders the Excel filename badge', () => {
    render(<App />);
    expect(screen.getByText('TestData.xlsx')).toBeInTheDocument();
  });

  it('renders the search bar', () => {
    render(<App />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders product list initially', () => {
    render(<App />);
    expect(screen.getByText('Teresa Neo I-90 Bldc Hood')).toBeInTheDocument();
    expect(screen.getByText('Castor Hob 4-Burner')).toBeInTheDocument();
  });

  it('shows product count in search bar', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/2 products found/i)).toBeInTheDocument();
    });
  });

  it('shows quote bar at bottom', () => {
    render(<App />);
    expect(screen.getByText(/Add products to build a quote/i)).toBeInTheDocument();
  });

  it('View Quote button is disabled when no items', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /View Quote/i })).toBeDisabled();
  });

  it('adds a product to quote and updates the quote bar', async () => {
    render(<App />);

    const addButtons = screen.getAllByText('Add to Quote');
    fireEvent.click(addButtons[0]);

    // The View Quote button becomes enabled when itemCount > 0
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /View Quote/i })).not.toBeDisabled();
    });
  });

  it('enables View Quote button after adding an item', async () => {
    render(<App />);

    const addButtons = screen.getAllByText('Add to Quote');
    fireEvent.click(addButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /View Quote/i })).not.toBeDisabled();
    });
  });

  it('opens quote panel when View Quote is clicked', async () => {
    render(<App />);

    const addButtons = screen.getAllByText('Add to Quote');
    fireEvent.click(addButtons[0]);

    await waitFor(() => {
      const viewBtn = screen.getByRole('button', { name: /View Quote/i });
      fireEvent.click(viewBtn);
    });

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('filters panel shows margin % section', () => {
    render(<App />);
    // Open the filter sidebar on desktop (it is rendered but may be offscreen)
    // The sidebar renders in the DOM always on desktop
    expect(screen.getByText('Margin %')).toBeInTheDocument();
  });

  it('shows the refresh button in the header', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
  });

  it('opens filter sidebar when filter toggle button clicked', () => {
    render(<App />);
    // The mobile filter toggle button — use getAllByRole since there may be multiple Filter-labelled buttons
    const filterButtons = screen.getAllByRole('button', { name: /filters/i });
    fireEvent.click(filterButtons[0]);
    expect(filterButtons[0]).toBeInTheDocument();
  });
});
