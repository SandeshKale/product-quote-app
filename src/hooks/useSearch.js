import { useState, useEffect, useMemo, useCallback } from 'react';
import { searchEngine } from '../services/searchEngine';

export const DEFAULT_FILTERS = {
  categories: [],
  mrpRange: { min: null, max: null },
  rrpRange: { min: null, max: null },
  marginRange: { min: null, max: null },
  dimensions: [],
  stockStatus: [], // ['Good'] or ['Discntd'] or [] for all
};

function hasActiveFilters(f) {
  return (
    f.categories.length > 0 ||
    f.mrpRange.min != null ||
    f.mrpRange.max != null ||
    f.rrpRange.min != null ||
    f.rrpRange.max != null ||
    f.marginRange.min != null ||
    f.marginRange.max != null ||
    f.dimensions.length > 0 ||
    f.stockStatus.length > 0
  );
}

export function useSearch(products) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(t);
  }, [query]);

  const results = useMemo(() => {
    if (!products.length) return [];
    if (!debouncedQuery.trim() && !hasActiveFilters(filters)) return products;
    return searchEngine(debouncedQuery, products, filters);
  }, [debouncedQuery, products, filters]);

  const clearFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const availableCategories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))].sort(),
    [products]
  );

  const availableDimensions = useMemo(
    () => [...new Set(products.map((p) => p.dimensions).filter(Boolean))].sort(),
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
    availableDimensions,
  };
}
