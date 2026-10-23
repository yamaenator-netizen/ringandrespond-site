// /api/champion-api - same-origin relay for the Champion claim store.
// The claim page talks ONLY to this endpoint (plain HTTPS on the site's own
// domain). The one-time burn is still enforced by the claim store on the
// Sunny box; this function just carries the request there server-side, so
// visitor browsers never need to reach the store's port directly.
const STORE = 'https://voice.ringandrespond.com:8445';
const RATE = new Map();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 30;
const MAX_LEN = 200;
const str = (v) => (typeof v === 'string' ? v.trim().slice(0, MAX_LEN) : '');

function rateOk(ip) {
  const now = Date.now();
  let bucket = RATE.get(ip);
  if (!bucket || now > bucket.resetAt) bucket = { count: 0, resetAt: now + WINDOW_MS };
  bucket.count += 1;
  RATE.set(ip, bucket);
  return bucket.count <= MAX_PER_WINDOW;
}

async function fetchStore(path, options) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const r = await fetch(STORE + path, { ...options, signal: ctrl.signal });
    const d = await r.json().catch(() => ({}));
    return { http: r.status, d };
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (!rateOk(ip)) {
    return res.status(429).json({ status: 'error', error: 'Too many requests, try again later' });
  }
  try {
    if (req.method === 'GET') {
      const code = str((req.query && req.query.c) || '');
      if (!code) return res.status(400).json({ status: 'invalid' });
      const { http, d } = await fetchStore('/champion/check?c=' + encodeURIComponent(code));
      return res.status(http).json(d);
    }
    if (req.method === 'POST') {
      const body = req.body || {};
      const payload = {
        code: str(body.code),
        name: str(body.name),
        practice: str(body.practice),
        role: str(body.role),
        contact: str(body.contact),
      };
      if (!payload.code || !payload.name || !payload.practice || !payload.contact) {
        return res.status(400).json({ status: 'error', error: 'Missing claim fields' });
      }
      const { http, d } = await fetchStore('/champion/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return res.status(http).json(d);
    }
    return res.status(405).json({ status: 'error', error: 'Method not allowed' });
  } catch (e) {
    console.error('champion-api relay failed:', e && e.message);
    return res.status(502).json({ status: 'error', error: 'Claim store unreachable' });
  }
}
