import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from './Header';

const mockMeta = {
  fileName: 'TestData.xlsx',
  modifiedTime: '2026-05-15T09:00:00.000Z',
};

describe('Header', () => {
  it('renders the app name', () => {
    render(<Header metadata={mockMeta} status="ready" onRefresh={vi.fn()} />);
    expect(screen.getByText(/Smart Quote Generator/i)).toBeInTheDocument();
  });

  it('displays the file name from metadata', () => {
    render(<Header metadata={mockMeta} status="ready" onRefresh={vi.fn()} />);
    expect(screen.getByText('TestData.xlsx')).toBeInTheDocument();
  });

  it('displays the modified time', () => {
    render(<Header metadata={mockMeta} status="ready" onRefresh={vi.fn()} />);
    expect(screen.getByText(/Updated/i)).toBeInTheDocument();
  });

  it('shows "Loading…" when metadata is null', () => {
    render(<Header metadata={null} status="loading" onRefresh={vi.fn()} />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows stale warning when status is stale', () => {
    render(<Header metadata={mockMeta} status="stale" onRefresh={vi.fn()} />);
    expect(screen.getByText(/cached data/i)).toBeInTheDocument();
  });

  it('calls onRefresh when refresh button clicked', () => {
    const onRefresh = vi.fn();
    render(<Header metadata={mockMeta} status="ready" onRefresh={onRefresh} />);
    fireEvent.click(screen.getByRole('button', { name: /refresh/i }));
    expect(onRefresh).toHaveBeenCalledOnce();
  });

  it('disables refresh button when loading', () => {
    render(<Header metadata={mockMeta} status="loading" onRefresh={vi.fn()} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows "Syncing…" text when loading', () => {
    render(<Header metadata={mockMeta} status="loading" onRefresh={vi.fn()} />);
    expect(screen.getByText(/Syncing/i)).toBeInTheDocument();
  });
});
