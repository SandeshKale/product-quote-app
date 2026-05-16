import { useState, useEffect, useMemo, useCallback } from 'react';
import { searchEngine } from '../services/searchEngine';

const DEFAULT_FILTERS = {
  categories: [],
  mrpRange: { min: null, max: null },
  rrpRange: { min: null, max: null },
  marginRange: { min: null, max: null },
  gstRate: null,
};

function hasActiveFilters(filters) {
  return (
    filters.categories.length > 0 ||
    filters.mrpRange.min != null ||
    filters.mrpRange.max != null ||
    filters.rrpRange.min != null ||
    filters.rrpRange.max != null ||
    filters.marginRange.min != null ||
    filters.marginRange.max != null ||
    filters.gstRate != null
  );
}

/**
 * Provides debounced elastic search over the products array.
 * Auto-searches on every keystroke with a 200ms debounce.
 * Empty query + no filters returns all products.
 * marginRange filter is available to the user.
 */
export function useSearch(products) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // Debounce: fire search 200ms after the user stops typing
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(timer);
  }, [query]);

  const results = useMemo(() => {
    if (!products.length) return [];
    if (!debouncedQuery.trim() && !hasActiveFilters(filters)) return products;
    return searchEngine(debouncedQuery, products, filters);
  }, [debouncedQuery, products, filters]);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Derive unique categories from product data (not hardcoded)
  const availableCategories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))].sort(),
    [products]
  );

  return {
    query,
    setQuery,
    filters,
    setFilters,
    clearFilters,
    results,
    availableCategories,
  };
}
