/**
 * Masters' Union Nations - registrations, delegate cards and on-the-day check-in, all in one Google Sheet.
 * Paste this into Extensions > Apps Script on the Google Sheet (see SETUP.md). The site's /api functions call it.
 *
 * Every registration is written to the "All Registrations" tab and to a tab named after the committee, and gets:
 *   - a Delegate ID (MUN26-0001, MUN26-0002 ...)
 *   - a private random Token that is the delegate's personal QR code
 * On the day a volunteer scans the QR; the "Checked in" columns are filled in automatically.
 *
 * Script properties (Project Settings > Script properties):
 *   SECRET       required - the same value as GOOGLE_SHEETS_SECRET in Vercel
 *   SEND_EMAILS  optional - set to  yes  to email each delegate their iCard link (needs the Gmail send permission)
 */
var ALL_TAB = 'All Registrations';
var HEADERS = ['Timestamp', 'Committee', 'Name', 'Email', 'Institution', 'Category', 'Phone', 'Why this committee', 'Source', 'Repeat submission', 'Delegate ID', 'Token', 'Checked in', 'Check-in time', 'Checked in by'];
var COL = { TIME: 1, COMMITTEE: 2, NAME: 3, EMAIL: 4, INSTITUTION: 5, CATEGORY: 6, PHONE: 7, WHY: 8, SOURCE: 9, REPEAT: 10, ID: 11, TOKEN: 12, IN: 13, IN_TIME: 14, IN_BY: 15 };
// Same email can register again (a delegate may have typed wrong details the first time).
// Repeats are flagged in the "Repeat submission" column. Set to true to block repeats instead.
var BLOCK_DUPLICATES = false;
var COMMITTEES = ['UNHRC', 'MCC', 'CCEP', 'IPL', 'AIPPM', 'DALAL', 'STARTUP', 'IP'];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var secret = PropertiesService.getScriptProperties().getProperty('SECRET');
    var d = JSON.parse(e.postData.contents);
    if (!secret || d.secret !== secret) return reply({ ok: false, error: 'unauthorized' });
    switch (d.action || 'register') {
      case 'register': return register(d);
      case 'lookup': return lookup(d);
      case 'checkin': return checkin(d);
      case 'search': return search(d);
      case 'stats': return reply(Object.assign({ ok: true }, counts()));
      default: return reply({ ok: false, error: 'unknown action' });
    }
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() { return reply({ ok: true, service: 'mun-registrations' }); }

/* ---------------- register ---------------- */
function register(d) {
  var committee = String(d.committee || '').toUpperCase();
  if (COMMITTEES.indexOf(committee) === -1) return reply({ ok: false, error: 'unknown committee' });
  var repeat = isDuplicate(d.email);
  if (repeat && BLOCK_DUPLICATES) return reply({ ok: false, error: 'duplicate' });
  var id = nextId(), token = Utilities.getUuid().replace(/-/g, '');
  var row = [d.timestamp, committee, d.name, d.email, d.institution, d.category, d.phone, d.motivation, d.source,
    repeat ? 'Repeat of an earlier email' : '', id, token, '', '', ''].map(safe);
  append(ALL_TAB, row);
  append(committee, row);
  emailCard(d, id, token, committee);
  return reply({ ok: true, id: id, token: token });
}

function nextId() {
  var props = PropertiesService.getScriptProperties();
  var n = Number(props.getProperty('SEQ') || '0') + 1;
  props.setProperty('SEQ', String(n));
  return 'MUN26-' + ('0000' + n).slice(-4);
}

function emailCard(d, id, token, committee) {
  try {
    if (PropertiesService.getScriptProperties().getProperty('SEND_EMAILS') !== 'yes') return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(d.email || ''))) return;
    var link = 'https://' + String(d.source || '').replace(/[^a-z0-9.\-:]/gi, '') + '/card.html#' + token;
    var name = String(d.name || 'Delegate').replace(/[<>&"]/g, '');
    MailApp.sendEmail({
      to: d.email,
      name: "Masters' Union Nations",
      subject: "You're registered for Masters' Union Nations 2026 (" + committee + ')',
      htmlBody: '<p>Hi ' + name + ',</p><p>Your registration request for <b>' + committee + '</b> at Masters\' Union Nations (28&ndash;29 November 2026, Gurugram) has been received. Your Delegate ID is <b>' + id + '</b>.</p>' +
        '<p><a href="' + link + '" style="display:inline-block;padding:12px 20px;background:#6c0e24;color:#fff;text-decoration:none;border-radius:8px">Open my iCard</a></p>' +
        '<p>Design it however you like, and keep the link: on the day, open it on your phone and show the QR code at the registration desk to check in. Please do not share it, because the QR code is personal to you.</p>' +
        '<p>The organising team will be in touch with the next steps.</p>',
      body: 'Hi ' + name + ', your registration for ' + committee + ' is received (Delegate ID ' + id + '). Open your iCard: ' + link
    });
  } catch (err) { /* a mail failure must never lose a registration */ }
}

/* ---------------- delegate card ---------------- */
function lookup(d) {
  var sh = allSheet(); var r = rowByCol(sh, COL.TOKEN, d.token);
  if (!r) return reply({ ok: false, error: 'not found' });
  return reply({ ok: true, delegate: delegateAt(sh, r) });
}

/* ---------------- check-in (volunteer scans the QR) ---------------- */
function checkin(d) {
  var sh = allSheet(), r = 0;
  if (d.token) r = rowByCol(sh, COL.TOKEN, d.token);
  else if (d.id) r = rowByCol(sh, COL.ID, d.id);
  if (!r) return reply(Object.assign({ ok: true, status: 'unknown' }, counts()));
  var del = delegateAt(sh, r);
  if (del.checkedIn) return reply(Object.assign({ ok: true, status: 'already', delegate: del }, counts()));
  var now = new Date(), by = String(d.by || 'Volunteer').slice(0, 60);
  sh.getRange(r, COL.IN, 1, 3).setValues([['Yes', now, safe(by)]]);
  var cs = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(del.committee);
  if (cs) { var cr = rowByCol(cs, COL.TOKEN, del.token); if (cr) cs.getRange(cr, COL.IN, 1, 3).setValues([['Yes', now, safe(by)]]); }
  del = delegateAt(sh, r);
  return reply(Object.assign({ ok: true, status: 'ok', delegate: del }, counts()));
}

/* manual fallback when a phone or QR will not scan */
function search(d) {
  var q = String(d.q || '').trim().toLowerCase();
  if (q.length < 2) return reply({ ok: true, matches: [] });
  var sh = allSheet(), n = sh.getLastRow() - 1, out = [];
  if (n > 0) {
    var vals = sh.getRange(2, 1, n, HEADERS.length).getValues();
    for (var i = 0; i < vals.length && out.length < 8; i++) {
      var v = vals[i], hay = [v[COL.NAME - 1], v[COL.EMAIL - 1], v[COL.ID - 1], v[COL.PHONE - 1]].join(' ').toLowerCase();
      if (hay.indexOf(q) > -1) out.push(delegateFrom(v, false));
    }
  }
  return reply({ ok: true, matches: out });
}

function counts() {
  var sh = allSheet(), n = sh.getLastRow() - 1;
  if (n < 1) return { total: 0, checkedIn: 0 };
  var ids = sh.getRange(2, COL.ID, n, 1).getValues(), ins = sh.getRange(2, COL.IN, n, 1).getValues(), total = 0, inn = 0;
  for (var i = 0; i < n; i++) { if (ids[i][0]) { total++; if (ins[i][0]) inn++; } }
  return { total: total, checkedIn: inn };
}

/* ---------------- helpers ---------------- */
function allSheet() { var ss = SpreadsheetApp.getActiveSpreadsheet(); var sh = ss.getSheetByName(ALL_TAB) || ss.insertSheet(ALL_TAB); ensureHeaders(sh); return sh; }

function rowByCol(sh, col, value) {
  value = String(value || '').trim(); if (!value || sh.getLastRow() < 2) return 0;
  var vals = sh.getRange(2, col, sh.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < vals.length; i++) if (String(vals[i][0]) === value) return i + 2;
  return 0;
}

function delegateAt(sh, r) { return delegateFrom(sh.getRange(r, 1, 1, HEADERS.length).getValues()[0], true); }
function delegateFrom(v, withToken) {
  var t = v[COL.IN_TIME - 1];
  return {
    id: v[COL.ID - 1], name: v[COL.NAME - 1], email: v[COL.EMAIL - 1], institution: v[COL.INSTITUTION - 1], category: v[COL.CATEGORY - 1],
    committee: v[COL.COMMITTEE - 1], phone: v[COL.PHONE - 1], token: withToken ? v[COL.TOKEN - 1] : undefined,
    checkedIn: v[COL.IN - 1] === 'Yes', checkedInAt: t instanceof Date ? t.toISOString() : String(t || ''), checkedInBy: v[COL.IN_BY - 1]
  };
}

/** One registration per email only when BLOCK_DUPLICATES is on. Gmail dots and +tags are ignored. */
function normEmail(e) {
  e = String(e || '').trim().toLowerCase().replace(/^'/, '');
  var at = e.lastIndexOf('@');
  if (at < 1) return e;
  var local = e.slice(0, at).split('+')[0], domain = e.slice(at + 1);
  if (domain === 'googlemail.com') domain = 'gmail.com';
  if (domain === 'gmail.com') local = local.replace(/\./g, '');
  return local + '@' + domain;
}

function isDuplicate(email) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ALL_TAB);
  if (!sh || sh.getLastRow() < 2) return false;
  var want = normEmail(email);
  var seen = sh.getRange(2, COL.EMAIL, sh.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < seen.length; i++) if (normEmail(seen[i][0]) === want) return true;
  return false;
}

function ensureHeaders(sh) {
  var have = sh.getLastRow() > 0 ? sh.getRange(1, 1, 1, HEADERS.length).getValues()[0] : [];
  var changed = false;
  for (var i = 0; i < HEADERS.length; i++) if (!have[i]) { sh.getRange(1, i + 1).setValue(HEADERS[i]).setFontWeight('bold'); changed = true; }
  if (changed) sh.setFrozenRows(1);
}

function append(tabName, row) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(tabName) || ss.insertSheet(tabName);
  ensureHeaders(sh);
  sh.appendRow(row);
}

// Stops a delegate's text being run as a spreadsheet formula (=, +, -, @ at the start).
function safe(v) {
  if (v instanceof Date) return v;
  v = v == null ? '' : String(v);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
