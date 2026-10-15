// POST /api/onboard - receives Sunny onboarding answers, emails config to the team.
// Env: RESEND_API_KEY (Vercel env var, never in source).
const RATE = new Map();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 10;
const MAX_LEN = 500;
const str = (v) => (typeof v === 'string' ? v.trim().slice(0, MAX_LEN) : '');
function validPhone(v) {
  if (!v) return false;
  const digits = v.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}
function validEmail(v) {
  if (!v) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}
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
  const answers = body.answers || {};
  if (typeof answers !== 'object') {
    return res.status(400).json({ error: 'Missing answers' });
  }
  const practice = str(answers.practice);
  const phone = str(answers.phone);
  const email = str(answers.email);
  if (!practice) return res.status(400).json({ error: 'Practice name is required' });
  if (!validPhone(phone)) return res.status(400).json({ error: 'Valid office phone is required' });
  if (!validEmail(email)) return res.status(400).json({ error: 'Valid office email is required' });
  const lines = [
    'Practice: ' + practice,
    'Address: ' + (str(answers.address) || '-'),
    'Phone: ' + phone,
    'Mon-Fri hours: ' + (str(answers.weekdayHours) || '-'),
    'Saturday hours: ' + (str(answers.satHours) || '-'),
    'Sunday hours: ' + (str(answers.sunHours) || '-'),
    'Services: ' + (str(answers.services) || '-'),
    'New patients: ' + (str(answers.newPatients) || '-'),
    'Call handling: ' + (str(answers.callHandling) || '-'),
    str(answers.oncallNumber) ? 'On-call #: ' + str(answers.oncallNumber) : null,
    'Emergencies: ' + (str(answers.emergency) || '-'),
    'Never do: ' + (str(answers.donts) || '-'),
    'Practice software: ' + (str(answers.software) || '-'),
    'Calendar: ' + (str(answers.calendar) || '-'),
    'Office email: ' + email,
    'Wants connected: ' + (str(answers.integrations) || '-'),
    '',
    'Submitted: ' + (body.at || new Date().toISOString())
  ].filter(Boolean);
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY not set');
    return res.status(500).json({ error: 'Email not configured' });
  }
  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Sunny Setup <onboarding@ringandrespond.com>',
      to: ['hello@ringandrespond.com'],
      subject: 'New Sunny setup: ' + practice,
      text: 'A new customer completed Sunny onboarding.\n\n' + lines.join('\n') + '\n\nNext: configure their Retell agent with these details, tune voice, run test calls.'
    })
  });
  if (!emailRes.ok) {
    const err = await emailRes.text();
    console.error('Resend error:', err);
    return res.status(502).json({ error: 'Email send failed' });
  }
  return res.status(200).json({ ok: true });
}