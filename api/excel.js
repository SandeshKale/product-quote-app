/**
 * Vercel serverless function: /api/excel
 * Fetches the Excel file from Google Drive server-side, bypassing browser CORS.
 * Uses env vars that are never exposed to the client bundle.
 */
export default async function handler(req, res) {
  const FILE_ID = process.env.VITE_DRIVE_FILE_ID;
  const API_KEY = process.env.VITE_DRIVE_API_KEY;

  if (!FILE_ID || !API_KEY) {
    return res
      .status(500)
      .json({ error: 'Missing VITE_DRIVE_FILE_ID or VITE_DRIVE_API_KEY env vars' });
  }

  const url = `https://www.googleapis.com/drive/v3/files/${FILE_ID}?alt=media&key=${API_KEY}`;

  try {
    const upstream = await fetch(url);
    if (!upstream.ok) {
      return res
        .status(upstream.status)
        .json({ error: `Google Drive API returned HTTP ${upstream.status}` });
    }
    const buffer = await upstream.arrayBuffer();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Cache-Control', 'public, s-maxage=7200, stale-while-revalidate=3600');
    res.status(200).send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
