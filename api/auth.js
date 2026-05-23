/**
 * Vercel serverless function: POST /api/auth
 *
 * Compares the submitted passphrase against a SHA-256 hash stored in
 * VITE_APP_PASSPHRASE_HASH env var. The hash never ships to the client bundle.
 *
 * Body: { passphrase: string }
 * Response 200: { ok: true,  token: <32-char hex session token> }
 * Response 401: { ok: false, error: 'Invalid passphrase' }
 *
 * To generate the hash for your .env.local / Vercel dashboard:
 *   node -e "const c=require('crypto');console.log(c.createHash('sha256').update('YOUR_PASS').digest('hex'))"
 */

import { createHash, randomBytes } from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const expectedHash = process.env.VITE_APP_PASSPHRASE_HASH;
  if (!expectedHash) {
    return res.status(500).json({ error: 'Auth not configured — set VITE_APP_PASSPHRASE_HASH' });
  }

  const { passphrase } = req.body || {};
  if (!passphrase || typeof passphrase !== 'string') {
    return res.status(400).json({ ok: false, error: 'Missing passphrase' });
  }

  const submitted = createHash('sha256').update(passphrase.trim()).digest('hex');

  if (submitted !== expectedHash) {
    // Constant-time-ish delay to slow brute force
    await new Promise((r) => setTimeout(r, 400));
    return res.status(401).json({ ok: false, error: 'Invalid passphrase' });
  }

  // Issue a random session token — stored in sessionStorage client-side
  const token = randomBytes(16).toString('hex');
  return res.status(200).json({ ok: true, token });
}
