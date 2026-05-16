import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from './SearchBar';

describe('SearchBar', () => {
  it('renders the search input', () => {
    render(<SearchBar query="" onChange={vi.fn()} resultCount={10} isLoading={false} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('calls onChange on user input', () => {
    const onChange = vi.fn();
    render(<SearchBar query="" onChange={onChange} resultCount={0} isLoading={false} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'teresa' } });
    expect(onChange).toHaveBeenCalledWith('teresa');
  });

  it('shows clear button when query is non-empty', () => {
    render(<SearchBar query="teresa" onChange={vi.fn()} resultCount={1} isLoading={false} />);
    expect(screen.getByLabelText(/clear/i)).toBeInTheDocument();
  });

  it('does not show clear button when query is empty', () => {
    render(<SearchBar query="" onChange={vi.fn()} resultCount={10} isLoading={false} />);
    expect(screen.queryByLabelText(/clear/i)).not.toBeInTheDocument();
  });

  it('calls onChange with empty string when clear is clicked', () => {
    const onChange = vi.fn();
    render(<SearchBar query="teresa" onChange={onChange} resultCount={1} isLoading={false} />);
    fireEvent.click(screen.getByLabelText(/clear/i));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('shows correct result count', () => {
    render(<SearchBar query="" onChange={vi.fn()} resultCount={27} isLoading={false} />);
    expect(screen.getByText(/27 products found/i)).toBeInTheDocument();
  });

  it('shows singular form for 1 result', () => {
    render(<SearchBar query="x" onChange={vi.fn()} resultCount={1} isLoading={false} />);
    expect(screen.getByText(/1 product found/i)).toBeInTheDocument();
  });

  it('shows "No products found" for 0 results', () => {
    render(<SearchBar query="xyz" onChange={vi.fn()} resultCount={0} isLoading={false} />);
    expect(screen.getByText(/No products found/i)).toBeInTheDocument();
  });

  it('hides result count while loading', () => {
    render(<SearchBar query="" onChange={vi.fn()} resultCount={0} isLoading={true} />);
    expect(screen.queryByText(/found/i)).not.toBeInTheDocument();
  });
});
