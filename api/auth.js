/**
 * Vercel serverless function: POST /api/auth
 *
 * Validates username + password against env vars stored in Vercel dashboard.
 * Credentials never reach the client bundle.
 *
 * Env vars required (set in Vercel dashboard / GitHub Actions secrets):
 *   APP_USERNAME  — e.g. mbmbinu
 *   APP_PASSWORD  — your chosen password
 *
 * Body:    { username: string, password: string }
 * 200 OK:  { ok: true }
 * 401:     { ok: false, error: 'Invalid credentials' }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { APP_USERNAME, APP_PASSWORD } = process.env;
  if (!APP_USERNAME || !APP_PASSWORD) {
    return res.status(500).json({ error: 'Auth not configured — set APP_USERNAME and APP_PASSWORD' });
  }

  const { username, password } = req.body || {};

  if (
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    username.trim() !== APP_USERNAME ||
    password !== APP_PASSWORD
  ) {
    await new Promise((r) => setTimeout(r, 400)); // slow brute force
    return res.status(401).json({ ok: false, error: 'Invalid credentials' });
  }

  return res.status(200).json({ ok: true });
}
