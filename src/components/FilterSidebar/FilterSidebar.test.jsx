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

  it('renders Stock Status filter with In Stock and Discontinued', () => {
    render(<FilterSidebar {...baseProps} />);
    expect(screen.getByText('Stock Status')).toBeInTheDocument();
    expect(screen.getByText(/In Stock/)).toBeInTheDocument();
    expect(screen.getByText(/Discontinued/)).toBeInTheDocument();
  });

  it('does NOT show GST filter', () => {
    render(<FilterSidebar {...baseProps} />);
    expect(screen.queryByText(/GST Rate/i)).not.toBeInTheDocument();
  });

  it('shows Margin % filter', () => {
    render(<FilterSidebar {...baseProps} />);
    expect(screen.getByText('Margin %')).toBeInTheDocument();
  });

  it('shows Dimensions trigger button when dimensions data present', () => {
    render(<FilterSidebar {...baseProps} />);
    expect(screen.getByText('Dimensions')).toBeInTheDocument();
    expect(screen.getByText('All dimensions')).toBeInTheDocument();
  });

  it('opens Dimensions dropdown on trigger click', () => {
    render(<FilterSidebar {...baseProps} />);
    fireEvent.click(screen.getByText('All dimensions'));
    expect(screen.getByPlaceholderText(/search dimensions/i)).toBeInTheDocument();
  });

  it('filters dimension options via search', () => {
    render(<FilterSidebar {...baseProps} />);
    fireEvent.click(screen.getByText('All dimensions'));
    fireEvent.change(screen.getByPlaceholderText(/search dimensions/i), {
      target: { value: 'chimney' },
    });
    expect(screen.getByText('Chimney - 90cm')).toBeInTheDocument();
    expect(screen.queryByText('Hob - 30cm')).not.toBeInTheDocument();
  });

  it('shows no results message when search matches nothing', () => {
    render(<FilterSidebar {...baseProps} />);
    fireEvent.click(screen.getByText('All dimensions'));
    fireEvent.change(screen.getByPlaceholderText(/search dimensions/i), {
      target: { value: 'xyz' },
    });
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('shows selected count in trigger when dimensions selected', () => {
    const filtersWithDim = { ...defaultFilters, dimensions: ['Chimney - 90cm'] };
    render(<FilterSidebar {...baseProps} filters={filtersWithDim} />);
    expect(screen.getByText('Chimney - 90cm')).toBeInTheDocument();
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

describe('FilterSidebar — DimensionsDropdown interactions', () => {
  it('selects a dimension option via checkbox', () => {
    const setFilters = vi.fn();
    render(<FilterSidebar {...baseProps} setFilters={setFilters} />);
    fireEvent.click(screen.getByText('All dimensions'));
    fireEvent.click(screen.getByRole('checkbox', { name: /chimney/i }));
    expect(setFilters).toHaveBeenCalled();
  });

  it('shows selected count in section title and clear section button', () => {
    const filtersWithDim = { ...defaultFilters, dimensions: ['Chimney - 90cm'] };
    render(<FilterSidebar {...baseProps} filters={filtersWithDim} />);
    // Section title shows count
    expect(screen.getByText(/Dimensions \(1\)/i)).toBeInTheDocument();
    // Clear dimensions button exists
    expect(screen.getByRole('button', { name: /clear dimensions/i })).toBeInTheDocument();
  });

  it('clears dimension selection via ✕ on trigger', () => {
    const setFilters = vi.fn((fn) => fn({ ...defaultFilters, dimensions: ['Chimney - 90cm'] }));
    const filtersWithDim = { ...defaultFilters, dimensions: ['Chimney - 90cm'] };
    render(<FilterSidebar {...baseProps} filters={filtersWithDim} setFilters={setFilters} />);
    // The ✕ button clears dimensions
    const clearX = screen.getByRole('button', { name: /clear dimensions/i });
    fireEvent.click(clearX);
    expect(setFilters).toHaveBeenCalled();
  });

  it('closes dropdown on outside click', () => {
    render(<FilterSidebar {...baseProps} />);
    fireEvent.click(screen.getByText('All dimensions'));
    expect(screen.getByPlaceholderText(/search dimensions/i)).toBeInTheDocument();
    // Simulate outside click
    fireEvent.mouseDown(document.body);
    expect(screen.queryByPlaceholderText(/search dimensions/i)).not.toBeInTheDocument();
  });
});
