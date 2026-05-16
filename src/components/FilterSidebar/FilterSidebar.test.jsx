import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FilterSidebar from './FilterSidebar';

const defaultFilters = {
  categories: [],
  mrpRange: { min: null, max: null },
  rrpRange: { min: null, max: null },
  marginRange: { min: null, max: null },
  dimensions: [],
  stockStatus: [],
};
const products = [
  {
    category: 'Cooker Hoods',
    mrp: 90290,
    rrp: 68990,
    marginPercent: 0.13,
    stockStatus: 'Good',
    dimensions: 'Chimney - 90cm',
  },
  {
    category: 'Hobs',
    mrp: 26990,
    rrp: 20341,
    marginPercent: 0.13,
    stockStatus: 'Discntd',
    dimensions: 'Hob - 30cm',
  },
];
const baseProps = {
  filters: defaultFilters,
  setFilters: vi.fn(),
  clearFilters: vi.fn(),
  availableCategories: ['Cooker Hoods', 'Hobs'],
  availableDimensions: ['Chimney - 90cm', 'Hob - 30cm'],
  products,
  isOpen: true,
  onClose: vi.fn(),
};

describe('FilterSidebar', () => {
  it('renders category checkboxes', () => {
    render(<FilterSidebar {...baseProps} />);
    expect(screen.getByText('Cooker Hoods')).toBeInTheDocument();
    expect(screen.getByText('Hobs')).toBeInTheDocument();
  });

  it('renders Stock Status filter', () => {
    render(<FilterSidebar {...baseProps} />);
    expect(screen.getByText('Stock Status')).toBeInTheDocument();
    expect(screen.getByText(/In Stock/i)).toBeInTheDocument();
    expect(screen.getByText(/Discontinued/i)).toBeInTheDocument();
  });

  it('does NOT show GST filter (removed)', () => {
    render(<FilterSidebar {...baseProps} />);
    expect(screen.queryByText(/GST Rate/i)).not.toBeInTheDocument();
  });

  it('shows Margin % filter', () => {
    render(<FilterSidebar {...baseProps} />);
    expect(screen.getByText('Margin %')).toBeInTheDocument();
  });

  it('shows Dimensions dropdown when data present', () => {
    render(<FilterSidebar {...baseProps} />);
    expect(screen.getByText('Dimensions')).toBeInTheDocument();
    // Dimensions now uses checkboxes in a scrollable box (no listbox)
    expect(screen.getByText('Chimney - 90cm')).toBeInTheDocument();
  });

  it('hides Dimensions when no data', () => {
    render(<FilterSidebar {...baseProps} availableDimensions={[]} />);
    expect(screen.queryByText('Dimensions')).not.toBeInTheDocument();
  });

  it('shows Clear all when filters active', () => {
    render(<FilterSidebar {...baseProps} filters={{ ...defaultFilters, categories: ['Hobs'] }} />);
    expect(screen.getByText('Clear all')).toBeInTheDocument();
  });

  it('calls clearFilters on Clear all', () => {
    const clearFilters = vi.fn();
    render(
      <FilterSidebar
        {...baseProps}
        filters={{ ...defaultFilters, stockStatus: ['Good'] }}
        clearFilters={clearFilters}
      />
    );
    fireEvent.click(screen.getByText('Clear all'));
    expect(clearFilters).toHaveBeenCalled();
  });

  it('calls setFilters when category toggled', () => {
    const setFilters = vi.fn();
    render(<FilterSidebar {...baseProps} setFilters={setFilters} />);
    fireEvent.click(screen.getByRole('checkbox', { name: /cooker hoods/i }));
    expect(setFilters).toHaveBeenCalled();
  });

  it('calls setFilters when stockStatus toggled', () => {
    const setFilters = vi.fn();
    render(<FilterSidebar {...baseProps} setFilters={setFilters} />);
    fireEvent.click(screen.getByRole('checkbox', { name: /in stock/i }));
    expect(setFilters).toHaveBeenCalled();
  });

  it('calls setFilters on MRP min change', () => {
    const setFilters = vi.fn();
    render(<FilterSidebar {...baseProps} setFilters={setFilters} />);
    fireEvent.change(screen.getAllByRole('spinbutton')[0], { target: { value: '10000' } });
    expect(setFilters).toHaveBeenCalled();
  });

  it('calls setFilters on margin min change', () => {
    const setFilters = vi.fn();
    render(<FilterSidebar {...baseProps} setFilters={setFilters} />);
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[4], { target: { value: '10' } });
    expect(setFilters).toHaveBeenCalled();
  });
});

it('calls setFilters on RRP min change', () => {
  const setFilters = vi.fn();
  render(<FilterSidebar {...baseProps} setFilters={setFilters} />);
  fireEvent.change(screen.getAllByRole('spinbutton')[2], { target: { value: '5000' } });
  expect(setFilters).toHaveBeenCalled();
});

it('calls setFilters on RRP max change', () => {
  const setFilters = vi.fn();
  render(<FilterSidebar {...baseProps} setFilters={setFilters} />);
  fireEvent.change(screen.getAllByRole('spinbutton')[3], { target: { value: '40000' } });
  expect(setFilters).toHaveBeenCalled();
});

it('calls setFilters on margin max change', () => {
  const setFilters = vi.fn();
  render(<FilterSidebar {...baseProps} setFilters={setFilters} />);
  fireEvent.change(screen.getAllByRole('spinbutton')[5], { target: { value: '20' } });
  expect(setFilters).toHaveBeenCalled();
});
