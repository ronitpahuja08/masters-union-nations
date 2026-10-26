/** Volunteer check-in. POST {pin, action: 'scan' | 'search' | 'stats', ...}. The staff PIN lives only in the STAFF_PIN env var.
 *   scan   : {token | id, by}  marks the delegate as checked in (or reports they already are)
 *   search : {q}               manual lookup when a QR will not scan
 *   stats  : {}                total registered / checked in so far
 */
const { reply, guard, clientIp, limited, safeEqual, sheet, TOKEN_RE, ID_RE, cleanText } = require('./_shared');

module.exports = async function handler(req, res) {
  const body = guard(req, res); if (!body) return;
  const staffPin = process.env.STAFF_PIN;
  if (!staffPin) return reply(res, 503, { error: 'Check-in is not set up yet. Ask the organiser to set STAFF_PIN.' });
  const ip = clientIp(req);
  const pinOk = typeof body.pin === 'string' && safeEqual(body.pin, staffPin);
  if (!pinOk) return limited('pinfail:' + ip, 8, 10 * 60 * 1000) ? reply(res, 429, { error: 'Too many wrong PIN attempts. Wait 10 minutes.' }) : reply(res, 401, { error: 'Wrong PIN.' });
  if (limited('scan:' + ip, 600, 10 * 60 * 1000)) return reply(res, 429, { error: 'Slow down for a moment.' });

  try {
    const action = body.action || 'scan';
    if (action === 'stats') return reply(res, 200, await sheet({ action: 'stats' }));
    if (action === 'search') {
      const q = cleanText(body.q, 60);
      if (q.length < 2) return reply(res, 200, { ok: true, matches: [] });
      return reply(res, 200, await sheet({ action: 'search', q }));
    }
    if (action !== 'scan') return reply(res, 400, { error: 'Unknown action.' });
    const token = typeof body.token === 'string' ? body.token.trim().toLowerCase() : '';
    const id = typeof body.id === 'string' ? body.id.trim().toUpperCase() : '';
    if (!TOKEN_RE.test(token) && !ID_RE.test(id)) return reply(res, 200, { ok: true, status: 'invalid' });
    const out = await sheet({ action: 'checkin', token: TOKEN_RE.test(token) ? token : undefined, id: TOKEN_RE.test(token) ? undefined : id, by: cleanText(body.by, 40) || 'Volunteer' });
    if (!out.ok) return reply(res, 502, { error: 'The sheet did not confirm the check-in. Please scan again.' });
    if (out.delegate) delete out.delegate.token;
    return reply(res, 200, out);
  } catch (err) {
    console.error('checkin failed', err.message);
    return reply(res, err.code === 503 ? 503 : 502, { error: 'Could not reach the registration sheet. Check the connection and scan again.' });
  }
};
