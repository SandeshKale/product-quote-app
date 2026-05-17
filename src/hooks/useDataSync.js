import { useState, useEffect, useCallback } from 'react';
import { fetchExcelFile, fetchFileMetadata } from '../services/driveService';
import { parseExcel } from '../utils/excelParser';
import { CACHE_TTL_MS } from '../constants/columnMap';

const CACHE_KEY = 'pq_products_v1';
const META_KEY = 'pq_metadata_v1';
const TS_KEY = 'pq_timestamp_v1';

function readCache(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

function writeCache(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // Quota exceeded or private mode — non-fatal
  }
}

/**
 * Manages product data syncing from Google Drive.
 * Cache TTL: 2 hours.
 * On cache hit: serves cached data immediately, refreshes silently in background.
 * On cache miss or force refresh: fetches fresh data.
 * On fetch failure: falls back to stale cache (status = 'stale').
 */
export function useDataSync() {
  const [products, setProducts] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | ready | stale | error
  const [lastSynced, setLastSynced] = useState(null);

  const load = useCallback(async (forceRefresh = false) => {
    const cached = readCache(CACHE_KEY);
    const cachedMeta = readCache(META_KEY);
    const ts = parseInt(localStorage.getItem(TS_KEY) || '0', 10);
    const isCacheValid = !forceRefresh && Date.now() - ts < CACHE_TTL_MS;

    if (cached && isCacheValid) {
      setProducts(cached);
      setMetadata(cachedMeta);
      setLastSynced(new Date(ts));
      setStatus('ready');
      // No background refresh — user can click Refresh manually when needed
      return;
    }

    setStatus('loading');

    try {
      const [buffer, meta] = await Promise.all([fetchExcelFile(), fetchFileMetadata()]);
      const parsed = parseExcel(buffer);

      writeCache(CACHE_KEY, parsed);
      writeCache(META_KEY, meta);
      localStorage.setItem(TS_KEY, String(Date.now()));

      setProducts(parsed);
      setMetadata(meta);
      setLastSynced(new Date());
      setStatus('ready');
    } catch {
      // Fetch failed — serve stale cache if available
      if (cached) {
        setProducts(cached);
        setMetadata(cachedMeta);
        setStatus('stale');
      } else {
        setStatus('error');
      }
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  return { products, metadata, status, lastSynced, refresh };
}
