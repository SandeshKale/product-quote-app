import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FilterSidebar from './FilterSidebar';

const defaultFilters = {
  categories: [],
  mrpRange: { min: null, max: null },
  rrpRange: { min: null, max: null },
  marginRange: { min: null, max: null },
  dimensions: [],
};
const products = [
  {
    category: 'Cooker Hoods',
    mrp: 48120,
    rrp: 36768,
    marginPercent: 0.13,
    gstRate: 0.18,
    dimensions: '90cm',
  },
  { category: 'Hobs', mrp: 22000, rrp: 18000, marginPercent: 0.1, gstRate: 0.08, dimensions: null },
];
const baseProps = {
  filters: defaultFilters,
  setFilters: vi.fn(),
  clearFilters: vi.fn(),
  availableCategories: ['Cooker Hoods', 'Hobs'],
  availableDimensions: ['90cm'],
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

  it('shows Margin % filter', () => {
    render(<FilterSidebar {...baseProps} />);
    expect(screen.getByText('Margin %')).toBeInTheDocument();
  });

  it('does NOT show GST filter (removed #16)', () => {
    render(<FilterSidebar {...baseProps} />);
    expect(screen.queryByText(/GST Rate/i)).not.toBeInTheDocument();
  });

  it('shows Dimensions dropdown when data has values', () => {
    render(<FilterSidebar {...baseProps} />);
    expect(screen.getByText('Dimensions')).toBeInTheDocument();
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('hides Dimensions section when no dimension data', () => {
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
        filters={{ ...defaultFilters, categories: ['Hobs'] }}
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

  it('calls setFilters on MRP min change', () => {
    const setFilters = vi.fn();
    render(<FilterSidebar {...baseProps} setFilters={setFilters} />);
    fireEvent.change(screen.getAllByRole('spinbutton')[0], { target: { value: '10000' } });
    expect(setFilters).toHaveBeenCalled();
  });

  it('calls setFilters on MRP max change', () => {
    const setFilters = vi.fn();
    render(<FilterSidebar {...baseProps} setFilters={setFilters} />);
    fireEvent.change(screen.getAllByRole('spinbutton')[1], { target: { value: '50000' } });
    expect(setFilters).toHaveBeenCalled();
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

  it('calls setFilters on margin min change', () => {
    const setFilters = vi.fn();
    render(<FilterSidebar {...baseProps} setFilters={setFilters} />);
    fireEvent.change(screen.getAllByRole('spinbutton')[4], { target: { value: '10' } });
    expect(setFilters).toHaveBeenCalled();
  });

  it('calls setFilters on margin max change', () => {
    const setFilters = vi.fn();
    render(<FilterSidebar {...baseProps} setFilters={setFilters} />);
    fireEvent.change(screen.getAllByRole('spinbutton')[5], { target: { value: '20' } });
    expect(setFilters).toHaveBeenCalled();
  });
});
