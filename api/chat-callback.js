// POST /api/chat-callback - emails the team when a website chat visitor asks
// for a callback. The chat collects name, phone, and best time, then posts
// here. Env: RESEND_API_KEY (Vercel env).
const RATE = new Map();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 10;
const MAX_LEN = 200;
const str = (v) => (typeof v === 'string' ? v.trim().slice(0, MAX_LEN) : '');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const now = Date.now();
  let bucket = RATE.get(ip);
  if (!bucket || now > bucket.resetAt) bucket = { count: 0, resetAt: now + WINDOW_MS };
  bucket.count += 1;
  RATE.set(ip, bucket);
  if (bucket.count > MAX_PER_WINDOW) {
    return res.status(429).json({ error: 'Too many requests, try again later' });
  }
  const body = req.body || {};
  const name = str(body.name);
  const phone = str(body.phone);
  const time = str(body.time);
  if (!name || !phone) {
    return res.status(400).json({ error: 'Missing callback fields' });
  }
  const lines = [
    'A website chat visitor asked for a callback.',
    '',
    'Name: ' + name,
    'Phone: ' + phone,
    'Best time: ' + (time || '-'),
    '',
    'Requested via the website chat.'
  ];
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY not set');
    return res.status(500).json({ error: 'Email not configured' });
  }
  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Ring & Respond Chat <onboarding@ringandrespond.com>',
      to: ['hello@ringandrespond.com'],
      subject: 'Chat callback request: ' + name,
      text: lines.join('\n')
    })
  });
  if (!emailRes.ok) {
    const err = await emailRes.text();
    console.error('Resend error:', err);
    return res.status(502).json({ error: 'Email send failed' });
  }
  return res.status(200).json({ ok: true });
}
