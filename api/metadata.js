/**
 * Vercel serverless function: /api/metadata
 * Fetches file metadata (name, modifiedTime) from Google Drive server-side.
 */
export default async function handler(req, res) {
  const FILE_ID = process.env.VITE_DRIVE_FILE_ID;
  const API_KEY = process.env.VITE_DRIVE_API_KEY;

  if (!FILE_ID || !API_KEY) {
    return res
      .status(500)
      .json({ error: 'Missing VITE_DRIVE_FILE_ID or VITE_DRIVE_API_KEY env vars' });
  }

  const url = `https://www.googleapis.com/drive/v3/files/${FILE_ID}?fields=name,modifiedTime&key=${API_KEY}`;

  try {
    const upstream = await fetch(url);
    if (!upstream.ok) {
      return res
        .status(upstream.status)
        .json({ error: `Google Drive API returned HTTP ${upstream.status}` });
    }
    const data = await upstream.json();
    res.setHeader('Cache-Control', 'public, s-maxage=300');
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
