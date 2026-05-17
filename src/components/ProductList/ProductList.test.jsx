import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductList, { ProductCard } from './ProductList';

const product = {
  serialNo: 1,
  articleCode: '534.84.523',
  articleName: 'Teresa Neo Hood',
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
};
const discontinuedProduct = {
  ...product,
  articleCode: 'DISC-001',
  stockStatus: 'Discntd',
  stock: 5,
};

describe('ProductCard', () => {
  it('renders article code', () => {
    render(<ProductCard product={product} cartCount={0} onAdd={vi.fn()} />);
    expect(screen.getByText('534.84.523')).toBeInTheDocument();
  });

  it('renders product name', () => {
    render(<ProductCard product={product} cartCount={0} onAdd={vi.fn()} />);
    expect(screen.getByText('Teresa Neo Hood')).toBeInTheDocument();
  });

  it('shows stock count for in-stock products', () => {
    render(<ProductCard product={product} cartCount={0} onAdd={vi.fn()} />);
    expect(screen.getByText(/In Stock: 125/i)).toBeInTheDocument();
  });

  it('shows Discontinued badge for discontinued products', () => {
    render(<ProductCard product={discontinuedProduct} cartCount={0} onAdd={vi.fn()} />);
    expect(screen.getByText(/Discontinued · Stock:/)).toBeInTheDocument();
  });

  it('shows dimensions', () => {
    render(<ProductCard product={product} cartCount={0} onAdd={vi.fn()} />);
    expect(screen.getByText('Chimney - 90cm')).toBeInTheDocument();
  });

  it('shows margin %', () => {
    render(<ProductCard product={product} cartCount={0} onAdd={vi.fn()} />);
    expect(screen.getByText('13%')).toBeInTheDocument();
  });

  it('calls onAdd when button clicked', () => {
    const onAdd = vi.fn();
    render(<ProductCard product={product} cartCount={0} onAdd={onAdd} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onAdd).toHaveBeenCalledWith(product);
  });

  it('shows cart count instead of Add Again', () => {
    render(<ProductCard product={product} cartCount={3} onAdd={vi.fn()} />);
    expect(screen.getByText('In cart: 3')).toBeInTheDocument();
  });
});

describe('ProductList', () => {
  it('renders product cards', () => {
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

  it('shows empty state', () => {
    render(
      <ProductList products={[]} quoteItems={[]} onAdd={vi.fn()} isLoading={false} status="ready" />
    );
    expect(screen.getByText(/No products found/i)).toBeInTheDocument();
  });

  it('shows loading skeletons', () => {
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

  it('shows error state', () => {
    render(
      <ProductList products={[]} quoteItems={[]} onAdd={vi.fn()} isLoading={false} status="error" />
    );
    expect(screen.getByText(/Unable to load/i)).toBeInTheDocument();
  });
});
