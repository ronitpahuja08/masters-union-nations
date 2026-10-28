/* Warm the heavy committee assets before the visitor clicks, so the intros never stall on a download or an image decode */
(function () {
  'use strict';
  var conn = navigator.connection || {};
  if (conn.saveData) return;
  var IMAGES = ['unhrc-geneva-cinematic', 'ccep-singapore-cinematic', 'ccep-port-night-v1', 'ipl-stadium-cinematic', 'ipl-batsman', 'ipl-bowler',
    'startup-san-francisco-cinematic', 'startup-sf-boardroom-golden-v1', 'aippm-parliament-live', 'ip-press-camera', 'ip-newsroom-v2',
    'mcc-new-york-night', 'dalal-bse-live', 'dalal-broker-portrait-v2', 'dalal-trading-floor-v3'];
  var VIDEOS = { MCC: ['mccDroneVideo'], STARTUP: ['slBridgeVideo', 'slBoardroomVideo'], DALAL: ['dcMarketVideo'] };
  var warmed = {}, kept = [];
  function warmVideo(id) {
    var v = document.getElementById(id);
    if (!v || warmed[id]) return;
    warmed[id] = 1; v.preload = 'auto'; try { v.load(); } catch (e) {}
  }
  function warmCode(code) { (VIDEOS[code] || []).forEach(warmVideo); }
  function warmImages() {
    var i = 0;
    (function next() {
      if (i >= IMAGES.length) return;
      var img = new Image(); img.decoding = 'async'; img.src = 'assets/images/' + IMAGES[i++] + '.webp'; kept.push(img);
      var go = function () { setTimeout(next, 120); };
      (img.decode ? img.decode() : Promise.resolve()).then(go, go);
    })();
  }
  function idle(fn, ms) { if ('requestIdleCallback' in window) requestIdleCallback(fn, { timeout: ms }); else setTimeout(fn, ms); }
  window.addEventListener('load', function () {
    idle(warmImages, 4000);
  });
  /* the moment a committee is hovered, touched or focused, its videos start downloading */
  function codeOf(el) {
    var b = el.closest && el.closest('button,.node,[class*="node-"]'); if (!b) return null;
    var m = (b.textContent || '').match(/\b(UNHRC|MCC|CCEP|IPL|AIPPM|DALAL|STARTUP|IP)\b/); return m && m[1];
  }
  ['pointerover', 'focusin', 'touchstart'].forEach(function (t) { document.addEventListener(t, function (e) { var c = codeOf(e.target); if (c) warmCode(c); }, { passive: true }); });
})();
