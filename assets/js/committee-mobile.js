/* Committee pages on phones: keep the floating soundtrack button off the registration
   form and the placard. Sets body.cm-music-tucked while either is on screen; the styling
   (and the phone-only scope) lives in committee-mobile.css. Does not change audio logic. */
(() => {
  'use strict';
  const pages = [document.getElementById('committeePage'), document.getElementById('dalalCommitteePage')].filter(Boolean);
  if (!pages.length || !('IntersectionObserver' in window)) return;

  // The shared back button shows only an arrow on phones; give it a spoken name.
  const back = document.getElementById('committeePageClose');
  if (back && !back.hasAttribute('aria-label')) back.setAttribute('aria-label', 'Return to committee map');

  const TARGETS = '.mu-inline-form, #dalalInlineForm, .rv-seat';
  const visible = new Set();
  const sync = () => {
    const open = pages.some(p => p.classList.contains('open'));
    document.body.classList.toggle('cm-music-tucked', open && visible.size > 0);
  };
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
    sync();
  }, { threshold: 0 });

  let raf = 0;
  const rescan = () => {
    raf = 0;
    io.disconnect(); visible.clear();
    pages.forEach(p => { if (p.classList.contains('open')) p.querySelectorAll(TARGETS).forEach(el => io.observe(el)); });
    sync();
  };
  // committee-v2.js builds the form and the placard when a page opens; observe after it has run.
  const schedule = () => { if (!raf) raf = requestAnimationFrame(() => requestAnimationFrame(rescan)); };
  const mo = new MutationObserver(schedule);
  pages.forEach(p => mo.observe(p, { attributes: true, attributeFilter: ['class', 'data-committee'] }));
  schedule();
})();
