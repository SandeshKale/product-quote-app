import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FilterSidebar from './FilterSidebar';

const defaultFilters = {
  categories: [],
  mrpRange: { min: null, max: null },
  rrpRange: { min: null, max: null },
  marginRange: { min: null, max: null },
  gstRate: null,
};
const products = [
  { category: 'Cooker Hoods', mrp: 48120, rrp: 36768, marginPercent: 0.13, gstRate: 0.18 },
  { category: 'Hobs', mrp: 22000, rrp: 18000, marginPercent: 0.1, gstRate: 0.08 },
];

describe('FilterSidebar', () => {
  it('renders category checkboxes from product data', () => {
    render(
      <FilterSidebar
        filters={defaultFilters}
        setFilters={vi.fn()}
        clearFilters={vi.fn()}
        availableCategories={['Cooker Hoods', 'Hobs']}
        products={products}
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText('Cooker Hoods')).toBeInTheDocument();
    expect(screen.getByText('Hobs')).toBeInTheDocument();
  });

  it('shows Margin % filter section', () => {
    render(
      <FilterSidebar
        filters={defaultFilters}
        setFilters={vi.fn()}
        clearFilters={vi.fn()}
        availableCategories={['Cooker Hoods']}
        products={products}
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText('Margin %')).toBeInTheDocument();
  });

  it('shows GST rate options', () => {
    render(
      <FilterSidebar
        filters={defaultFilters}
        setFilters={vi.fn()}
        clearFilters={vi.fn()}
        availableCategories={['Cooker Hoods']}
        products={products}
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText('18%')).toBeInTheDocument();
    expect(screen.getByText('8%')).toBeInTheDocument();
  });

  it('shows Clear all when filters are active', () => {
    const filters = { ...defaultFilters, categories: ['Hobs'] };
    render(
      <FilterSidebar
        filters={filters}
        setFilters={vi.fn()}
        clearFilters={vi.fn()}
        availableCategories={['Cooker Hoods', 'Hobs']}
        products={products}
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText('Clear all')).toBeInTheDocument();
  });

  it('calls clearFilters when Clear all clicked', () => {
    const clearFilters = vi.fn();
    const filters = { ...defaultFilters, categories: ['Hobs'] };
    render(
      <FilterSidebar
        filters={filters}
        setFilters={vi.fn()}
        clearFilters={clearFilters}
        availableCategories={['Cooker Hoods', 'Hobs']}
        products={products}
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText('Clear all'));
    expect(clearFilters).toHaveBeenCalled();
  });

  it('calls setFilters when a category is toggled', () => {
    const setFilters = vi.fn();
    render(
      <FilterSidebar
        filters={defaultFilters}
        setFilters={setFilters}
        clearFilters={vi.fn()}
        availableCategories={['Cooker Hoods', 'Hobs']}
        products={products}
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('checkbox', { name: /cooker hoods/i }));
    expect(setFilters).toHaveBeenCalled();
  });

  it('calls setFilters when MRP min input changes', () => {
    const setFilters = vi.fn();
    render(
      <FilterSidebar
        filters={defaultFilters}
        setFilters={setFilters}
        clearFilters={vi.fn()}
        availableCategories={['Cooker Hoods']}
        products={products}
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '10000' } });
    expect(setFilters).toHaveBeenCalled();
  });

  it('calls setFilters when MRP max input changes', () => {
    const setFilters = vi.fn();
    render(
      <FilterSidebar
        filters={defaultFilters}
        setFilters={setFilters}
        clearFilters={vi.fn()}
        availableCategories={['Cooker Hoods']}
        products={products}
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[1], { target: { value: '50000' } });
    expect(setFilters).toHaveBeenCalled();
  });

  it('calls setFilters when RRP min input changes', () => {
    const setFilters = vi.fn();
    render(
      <FilterSidebar
        filters={defaultFilters}
        setFilters={setFilters}
        clearFilters={vi.fn()}
        availableCategories={['Cooker Hoods']}
        products={products}
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[2], { target: { value: '5000' } });
    expect(setFilters).toHaveBeenCalled();
  });

  it('calls setFilters when RRP max input changes', () => {
    const setFilters = vi.fn();
    render(
      <FilterSidebar
        filters={defaultFilters}
        setFilters={setFilters}
        clearFilters={vi.fn()}
        availableCategories={['Cooker Hoods']}
        products={products}
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[3], { target: { value: '40000' } });
    expect(setFilters).toHaveBeenCalled();
  });

  it('calls setFilters when margin min input changes', () => {
    const setFilters = vi.fn();
    render(
      <FilterSidebar
        filters={defaultFilters}
        setFilters={setFilters}
        clearFilters={vi.fn()}
        availableCategories={['Cooker Hoods']}
        products={products}
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[4], { target: { value: '10' } });
    expect(setFilters).toHaveBeenCalled();
  });

  it('calls setFilters when margin max input changes', () => {
    const setFilters = vi.fn();
    render(
      <FilterSidebar
        filters={defaultFilters}
        setFilters={setFilters}
        clearFilters={vi.fn()}
        availableCategories={['Cooker Hoods']}
        products={products}
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[5], { target: { value: '20' } });
    expect(setFilters).toHaveBeenCalled();
  });

  it('calls setFilters when GST All radio selected', () => {
    const setFilters = vi.fn();
    const filtersWithGst = { ...defaultFilters, gstRate: 0.18 };
    render(
      <FilterSidebar
        filters={filtersWithGst}
        setFilters={setFilters}
        clearFilters={vi.fn()}
        availableCategories={['Cooker Hoods']}
        products={products}
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('radio', { name: /all/i }));
    expect(setFilters).toHaveBeenCalled();
  });

  it('calls setFilters when a GST rate radio is selected', () => {
    const setFilters = vi.fn();
    render(
      <FilterSidebar
        filters={defaultFilters}
        setFilters={setFilters}
        clearFilters={vi.fn()}
        availableCategories={['Cooker Hoods']}
        products={products}
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('radio', { name: /18%/i }));
    expect(setFilters).toHaveBeenCalled();
  });
});
