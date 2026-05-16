import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductList, { ProductCard } from './ProductList';

const product = {
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
};

describe('ProductCard', () => {
  it('renders article code', () => {
    render(<ProductCard product={product} isInQuote={false} onAdd={vi.fn()} />);
    expect(screen.getByText('534.84.523')).toBeInTheDocument();
  });

  it('renders product name', () => {
    render(<ProductCard product={product} isInQuote={false} onAdd={vi.fn()} />);
    expect(screen.getByText('Teresa Neo I-90 Bldc Hood')).toBeInTheDocument();
  });

  it('shows margin % to the user', () => {
    render(<ProductCard product={product} isInQuote={false} onAdd={vi.fn()} />);
    expect(screen.getByText('13%')).toBeInTheDocument();
  });

  it('calls onAdd when button clicked', () => {
    const onAdd = vi.fn();
    render(<ProductCard product={product} isInQuote={false} onAdd={onAdd} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onAdd).toHaveBeenCalledWith(product);
  });

  it('shows "Add Again" when product is in quote', () => {
    render(<ProductCard product={product} isInQuote={true} onAdd={vi.fn()} />);
    expect(screen.getByText('Add Again')).toBeInTheDocument();
  });
});

describe('ProductList', () => {
  it('renders a list of product cards', () => {
    render(
      <ProductList
        products={[product]}
        quoteItems={[]}
        onAdd={vi.fn()}
        isLoading={false}
        status="ready"
      />
    );
    expect(screen.getByText('534.84.523')).toBeInTheDocument();
  });

  it('shows empty state when no products', () => {
    render(
      <ProductList products={[]} quoteItems={[]} onAdd={vi.fn()} isLoading={false} status="ready" />
    );
    expect(screen.getByText(/No products found/i)).toBeInTheDocument();
  });

  it('shows loading skeletons when isLoading', () => {
    render(
      <ProductList
        products={[]}
        quoteItems={[]}
        onAdd={vi.fn()}
        isLoading={true}
        status="loading"
      />
    );
    expect(screen.queryByText(/No products/i)).not.toBeInTheDocument();
  });

  it('shows error state when status is error', () => {
    render(
      <ProductList products={[]} quoteItems={[]} onAdd={vi.fn()} isLoading={false} status="error" />
    );
    expect(screen.getByText(/Unable to load/i)).toBeInTheDocument();
  });
});
