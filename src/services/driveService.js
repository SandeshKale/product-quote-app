const FILE_ID = import.meta.env.VITE_DRIVE_FILE_ID || '';
const API_KEY = import.meta.env.VITE_DRIVE_API_KEY || '';

const BASE = 'https://www.googleapis.com/drive/v3/files';

/**
 * Fetches the Excel file content as an ArrayBuffer from Google Drive.
 * Uses the Drive API v3 with the API key (supports CORS for public files).
 */
export async function fetchExcelFile() {
  const url = `${BASE}/${FILE_ID}?alt=media&key=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch Excel file: HTTP ${response.status}`);
  }
  return response.arrayBuffer();
}

/**
 * Fetches file metadata (name, modifiedTime) from Google Drive.
 * Non-fatal: returns a fallback object if the request fails.
 */
export async function fetchFileMetadata() {
  const url = `${BASE}/${FILE_ID}?fields=name,modifiedTime&key=${API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Metadata fetch failed: HTTP ${response.status}`);
    const { name, modifiedTime } = await response.json();
    return { fileName: name, modifiedTime };
  } catch {
    // Non-fatal: the app still works without the version badge date
    return { fileName: 'TestData.xlsx', modifiedTime: null };
  }
}
