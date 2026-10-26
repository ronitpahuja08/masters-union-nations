/** Returns a delegate's own card details for the token in their personal link / QR (POST {token}). */
const { reply, guard, clientIp, limited, sheet, TOKEN_RE } = require('./_shared');

module.exports = async function handler(req, res) {
  const body = guard(req, res); if (!body) return;
  if (limited('delegate:' + clientIp(req), 40, 10 * 60 * 1000)) return reply(res, 429, { error: 'Too many requests. Please wait a few minutes.' });
  const token = typeof body.token === 'string' ? body.token.trim().toLowerCase() : '';
  if (!TOKEN_RE.test(token)) return reply(res, 400, { error: 'That card link is not valid.' });
  try {
    const out = await sheet({ action: 'lookup', token });
    if (!out.ok || !out.delegate) return reply(res, 404, { error: 'We could not find that card. Please check the link in your email.' });
    const d = out.delegate;
    return reply(res, 200, { ok: true, delegate: { id: d.id, name: d.name, email: d.email, institution: d.institution, committee: d.committee, token, checkedIn: Boolean(d.checkedIn) } });
  } catch (err) {
    console.error('delegate lookup failed', err.message);
    return reply(res, err.code === 503 ? 503 : 502, { error: 'The card service is unavailable. Please try again shortly.' });
  }
};
