// POST /api/champion-notify - emails the team when a Champion QR invitation is claimed.
// The claim itself (and the one-time burn) is enforced by the claim store; this
// function only sends the notification email. Env: RESEND_API_KEY (Vercel env).
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
  const practice = str(body.practice);
  const role = str(body.role);
  const contact = str(body.contact);
  const receipt = str(body.receipt);
  const codeLast4 = str(body.codeLast4);
  if (!name || !practice || !contact || !receipt) {
    return res.status(400).json({ error: 'Missing claim fields' });
  }
  const lines = [
    'A Champion invitation was just claimed.',
    '',
    'Name: ' + name,
    'Practice: ' + practice,
    'Role: ' + (role || '-'),
    'Gift-card contact: ' + contact,
    'Code (last 4): ' + (codeLast4 || '-'),
    'Receipt: ' + receipt,
    '',
    'Next: match the receipt against the claim log on the Sunny box',
    '(/opt/sunny/champion/claims.jsonl), note the champion in the tracker,',
    'and start their first cycle once the office pilot converts.'
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
      from: 'Sunny Champions <onboarding@ringandrespond.com>',
      to: ['hello@ringandrespond.com'],
      subject: 'Champion claim: ' + name + ' at ' + practice,
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
