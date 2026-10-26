/**
 * Masters' Union Nations - registrations to Google Sheets.
 * Paste this into Extensions > Apps Script on the Google Sheet that should hold the responses,
 * then deploy it as a Web app (see SETUP.md). The site's /api/register function posts here.
 *
 * Every registration is written to the "All Registrations" tab and to a tab named after the
 * committee (UNHRC, MCC, CCEP, IPL, AIPPM, DALAL, STARTUP, IP). Tabs are created automatically.
 */
var ALL_TAB = 'All Registrations';
var HEADERS = ['Timestamp', 'Committee', 'Name', 'Email', 'Institution', 'Category', 'Phone', 'Why this committee', 'Source'];
var COMMITTEES = ['UNHRC', 'MCC', 'CCEP', 'IPL', 'AIPPM', 'DALAL', 'STARTUP', 'IP'];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var secret = PropertiesService.getScriptProperties().getProperty('SECRET');
    var d = JSON.parse(e.postData.contents);
    if (!secret || d.secret !== secret) return reply({ ok: false, error: 'unauthorized' });
    var committee = String(d.committee || '').toUpperCase();
    if (COMMITTEES.indexOf(committee) === -1) return reply({ ok: false, error: 'unknown committee' });
    var row = [d.timestamp, committee, d.name, d.email, d.institution, d.category, d.phone, d.motivation, d.source].map(safe);
    append(ALL_TAB, row);
    append(committee, row);
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() { return reply({ ok: true, service: 'mun-registrations' }); }

function append(tabName, row) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(tabName) || ss.insertSheet(tabName);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  sh.appendRow(row);
}

// Stops a delegate's text being run as a spreadsheet formula (=, +, -, @ at the start).
function safe(v) {
  v = v == null ? '' : String(v);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
