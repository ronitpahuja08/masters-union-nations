/* Warm a committee's heavy assets just before the visitor needs them, so its intro never stalls.
   Nothing is fetched on the landing: phones and slow connections only fetch the committee they point at;
   fast desktops also warm the rest quietly once the map is on screen. */
(function () {
  'use strict';
  var conn = navigator.connection || {};
  if (conn.saveData) return;
  var IMAGES = {
    UNHRC: ['unhrc-geneva-cinematic'],
    MCC: ['mcc-new-york-night'],
    CCEP: ['ccep-singapore-cinematic', 'ccep-port-night-v1'],
    IPL: ['ipl-stadium-cinematic', 'ipl-batsman', 'ipl-bowler'],
    AIPPM: ['aippm-parliament-live'],
    DALAL: ['dalal-bse-live', 'dalal-broker-portrait-v2', 'dalal-trading-floor-v3'],
    STARTUP: ['startup-san-francisco-cinematic', 'startup-sf-boardroom-golden-v1'],
    IP: ['ip-press-camera', 'ip-newsroom-v2']
  };
  var VIDEOS = { MCC: ['mccDroneVideo'], STARTUP: ['slBridgeVideo', 'slBoardroomVideo'], DALAL: ['dcMarketVideo'] };
  var warmed = {}, kept = [];
  function warmImage(name) {
    if (warmed[name]) return;
    warmed[name] = 1;
    var img = new Image(); img.decoding = 'async'; img.src = 'assets/images/' + name + '.webp'; kept.push(img);
  }
  function warmVideo(id) {
    var v = document.getElementById(id);
    if (!v || warmed[id]) return;
    warmed[id] = 1; v.preload = 'auto'; try { v.load(); } catch (e) {}
  }
  function warmCode(code) { (IMAGES[code] || []).forEach(warmImage); (VIDEOS[code] || []).forEach(warmVideo); }

  /* the moment a committee is hovered, touched or focused, its images and videos start downloading */
  function codeOf(el) {
    var b = el.closest && el.closest('button,.node,[class*="node-"]'); if (!b) return null;
    var m = (b.textContent || '').match(/\b(UNHRC|MCC|CCEP|IPL|AIPPM|DALAL|STARTUP|IP)\b/); return m && m[1];
  }
  ['pointerover', 'focusin', 'touchstart'].forEach(function (t) {
    document.addEventListener(t, function (e) { var c = codeOf(e.target); if (c) warmCode(c); }, { passive: true });
  });

  /* fast desktops: once the map is showing, warm the remaining stills one at a time in idle time */
  var fast = (!conn.effectiveType || conn.effectiveType === '4g') && matchMedia('(min-width: 900px) and (pointer: fine)').matches;
  if (!fast) return;
  function idle(fn) { if ('requestIdleCallback' in window) requestIdleCallback(fn, { timeout: 3000 }); else setTimeout(fn, 600); }
  var queue = Object.keys(IMAGES).reduce(function (a, k) { return a.concat(IMAGES[k]); }, []);
  function next() { var n = queue.shift(); if (!n) return; if (!warmed[n]) warmImage(n); setTimeout(function () { idle(next); }, 400); }
  var started = false;
  new MutationObserver(function () {
    if (!started && document.body.classList.contains('at-map')) { started = true; setTimeout(function () { idle(next); }, 1500); }
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
})();
