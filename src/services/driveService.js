/**
 * Google Drive integration via server-side Vercel proxy.
 *
 * In production (Vercel): calls /api/excel and /api/metadata
 *   -> serverless functions fetch from googleapis.com server-side (no browser CORS)
 *
 * In local dev (npm run dev): Vite proxies /api/* to googleapis.com
 *   -> same URLs work transparently via vite.config.js proxy
 */

export async function fetchExcelFile() {
  const response = await fetch('/api/excel');
  if (!response.ok) {
    throw new Error(`Failed to fetch Excel file: HTTP ${response.status}`);
  }
  return response.arrayBuffer();
}

export async function fetchFileMetadata() {
  try {
    const response = await fetch('/api/metadata');
    if (!response.ok) throw new Error(`Metadata fetch failed: HTTP ${response.status}`);
    const { name, modifiedTime } = await response.json();
    return { fileName: name, modifiedTime };
  } catch {
    // Non-fatal: app still works without the version badge date
    return { fileName: 'TestData.xlsx', modifiedTime: null };
  }
}
