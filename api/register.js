/** MU Nations registration endpoint for Vercel Node functions.
 *  Saves each registration to every configured destination:
 *    - Google Sheets (via an Apps Script web app): GOOGLE_SHEETS_WEBHOOK_URL + GOOGLE_SHEETS_SECRET
 *    - Supabase: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *  At least one must be configured, and success is only reported after at least one real write.
 *  The sheet is checked first: one registration per email address (gmail dots and +tags are ignored).
 *  Secrets stay server-side. Payment deliberately NOT handled here.
 */
const ALLOWED = new Set(['UNHRC', 'MCC', 'CCEP', 'IPL', 'AIPPM', 'DALAL', 'STARTUP', 'IP']);
const clean = (value, max = 150) => typeof value === 'string'
  ? value.replace(/[\u0000-\u001F\u007F​-‏‪-‮⁦-⁩]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '';
const reply = (res, status, data) => { res.setHeader('Cache-Control', 'no-store'); res.status(status); return res.json(data); };

const NAME_RE = /^[\p{L}][\p{L}\p{M} .'’-]{1,99}$/u;
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/;
const TYPO_DOMAINS = { 'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gamil.com': 'gmail.com', 'gmail.co': 'gmail.com', 'gmail.con': 'gmail.com', 'gnail.com': 'gmail.com', 'hotmial.com': 'hotmail.com', 'hotmal.com': 'hotmail.com', 'yahooo.com': 'yahoo.com', 'yaho.com': 'yahoo.com', 'outlok.com': 'outlook.com', 'outloook.com': 'outlook.com' };

/** Returns the phone as +<digits> or '' when it is not a plausible number. Indian mobiles must be 10 digits starting 6-9. */
function normalizePhone(raw) {
  const s = String(raw || '').replace(/[\s().-]/g, '');
  if (/^\+91[6-9]\d{9}$/.test(s)) return s;
  if (/^(?:91|0)?[6-9]\d{9}$/.test(s)) return '+91' + s.slice(-10);
  if (/^\+(?!91)[1-9]\d{7,14}$/.test(s)) return s;
  return '';
}

module.exports = async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return reply(res, 405, { error: 'Method not allowed.' }); }
  const ct = (req.headers['content-type'] || '').toLowerCase();
  if (!ct.includes('application/json')) return reply(res, 415, { error: 'JSON body required.' });
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
  const origin = req.headers.origin;
  if (origin) { try { if (new URL(origin).host !== host) return reply(res, 403, { error: 'Cross-site requests not allowed.' }); } catch { return reply(res, 403, { error: 'Invalid request origin.' }); } }
  if (Number(req.headers['content-length'] || 0) > 12000) return reply(res, 413, { error: 'Request too large.' });
  const input = typeof req.body === 'object' && req.body !== null ? req.body : {};
  if (clean(input.website, 200)) return reply(res, 400, { error: 'Invalid submission.' }); // honeypot

  const name = clean(input.name, 100), email = clean(input.email, 180).toLowerCase(), institution = clean(input.institution, 180);
  const committee = clean(input.applyingFor, 10).toUpperCase(), category = clean(input.category, 20);
  const motivation = clean(input.motivation, 1000), phone = normalizePhone(clean(input.phone, 24));
  const errors = {};
  if (!NAME_RE.test(name)) errors.name = 'Enter your full name using letters only.';
  if (!EMAIL_RE.test(email) || email.length > 180 || email.includes('..')) errors.email = 'Enter a valid email address.';
  else if (TYPO_DOMAINS[email.split('@')[1]]) errors.email = 'Did you mean @' + TYPO_DOMAINS[email.split('@')[1]] + '?';
  if (institution.length < 2 || !/[\p{L}]/u.test(institution)) errors.institution = 'Enter your school or university.';
  if (!['school', 'college'].includes(category)) errors.category = 'Choose School or College.';
  if (!phone) errors.phone = 'Enter a valid mobile number (10 digits, or with a country code like +91).';
  if (committee === 'DALAL' && motivation.length < 3) errors.motivation = 'Tell us a little about your market instinct.';
  if (input.consent !== true) errors.consent = 'Please tick the consent box.';
  if (!ALLOWED.has(committee)) return reply(res, 400, { error: 'Please choose a valid committee.' });
  if (Object.keys(errors).length) return reply(res, 400, { error: 'Please correct the highlighted fields.', fields: errors });

  const sheetUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL, sheetSecret = process.env.GOOGLE_SHEETS_SECRET;
  const dbUrl = process.env.SUPABASE_URL, dbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const useSheet = Boolean(sheetUrl && sheetSecret), useDb = Boolean(dbUrl && dbKey);
  if (!useSheet && !useDb) return reply(res, 503, { error: 'Registration is not yet open. Backend configuration is pending.' });
  const consentedAt = new Date().toISOString();
  let saved = false;

  if (useSheet) {
    try {
      const r = await fetch(sheetUrl, { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ secret: sheetSecret, timestamp: consentedAt, committee, name, email, institution, category, phone, motivation, source: host }), signal: AbortSignal.timeout(12000) });
      const out = await r.json().catch(() => ({}));
      if (out.error === 'duplicate') return reply(res, 409, { error: 'This email address has already been used to register. If that was not you, or you need to change something, please contact the organisers.', fields: { email: 'This email is already registered.' } });
      if (r.ok && out.ok === true) saved = true; else console.error('Registration sheet write failed', r.status, out.error || '');
    } catch (err) { console.error('Registration sheet error', err.name); }
  }
  if (useDb && (saved || !useSheet)) {
    try {
      const r = await fetch(new URL('/rest/v1/mun_registrations', dbUrl), { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: dbKey, Authorization: `Bearer ${dbKey}`, Prefer: 'return=minimal' }, body: JSON.stringify({ name, email, institution, phone, motivation: motivation || null, category, committee, consented_at: consentedAt, payment_status: 'not_requested' }), signal: AbortSignal.timeout(8000) });
      if (r.ok) saved = true; else console.error('Registration DB write failed', r.status);
    } catch (err) { console.error('Registration DB error', err.name); }
  }
  if (saved) return reply(res, 201, { ok: true, message: 'Registration request received; payment instructions pending.' });
  return reply(res, 502, { error: 'Unable to save registration. Please retry or contact organisers.' });
};
