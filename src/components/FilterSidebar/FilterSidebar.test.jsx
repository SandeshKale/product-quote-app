import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FilterSidebar from './FilterSidebar';

const defaultFilters = {
  categories: [], mrpRange: { min: null, max: null },
  rrpRange: { min: null, max: null }, marginRange: { min: null, max: null }, gstRate: null,
};
const products = [
  { category: 'Cooker Hoods', mrp: 48120, rrp: 36768, marginPercent: 0.13, gstRate: 0.18 },
  { category: 'Hobs', mrp: 22000, rrp: 18000, marginPercent: 0.1, gstRate: 0.08 },
];

describe('FilterSidebar', () => {
  it('renders category checkboxes from product data', () => {
    render(<FilterSidebar filters={defaultFilters} setFilters={vi.fn()} clearFilters={vi.fn()}
      availableCategories={['Cooker Hoods', 'Hobs']} products={products} isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('Cooker Hoods')).toBeInTheDocument();
    expect(screen.getByText('Hobs')).toBeInTheDocument();
  });

  it('shows Margin % filter section', () => {
    render(<FilterSidebar filters={defaultFilters} setFilters={vi.fn()} clearFilters={vi.fn()}
      availableCategories={['Cooker Hoods']} products={products} isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('Margin %')).toBeInTheDocument();
  });

  it('shows GST rate options', () => {
    render(<FilterSidebar filters={defaultFilters} setFilters={vi.fn()} clearFilters={vi.fn()}
      availableCategories={['Cooker Hoods']} products={products} isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('18%')).toBeInTheDocument();
    expect(screen.getByText('8%')).toBeInTheDocument();
  });

  it('shows Clear all when filters are active', () => {
    const filters = { ...defaultFilters, categories: ['Hobs'] };
    render(<FilterSidebar filters={filters} setFilters={vi.fn()} clearFilters={vi.fn()}
      availableCategories={['Cooker Hoods', 'Hobs']} products={products} isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('Clear all')).toBeInTheDocument();
  });

  it('calls clearFilters when Clear all clicked', () => {
    const clearFilters = vi.fn();
    const filters = { ...defaultFilters, categories: ['Hobs'] };
    render(<FilterSidebar filters={filters} setFilters={vi.fn()} clearFilters={clearFilters}
      availableCategories={['Cooker Hoods', 'Hobs']} products={products} isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByText('Clear all'));
    expect(clearFilters).toHaveBeenCalled();
  });

  it('calls setFilters when a category is toggled', () => {
    const setFilters = vi.fn();
    render(<FilterSidebar filters={defaultFilters} setFilters={setFilters} clearFilters={vi.fn()}
      availableCategories={['Cooker Hoods', 'Hobs']} products={products} isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('checkbox', { name: /cooker hoods/i }));
    expect(setFilters).toHaveBeenCalled();
  });
});
