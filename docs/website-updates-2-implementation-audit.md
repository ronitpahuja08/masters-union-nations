# Website Updates-2 — implementation audit
Date: 2026-10-29
Reference: team-supplied 19-page "Website Updates-2.docx".

## Implemented or already present

- The three tags/skill boxes are already hidden across all committees. Kept this intact.
- "No payment is collected here" on live inline registration forms: styled red; forms, API calls and payment flows unchanged.
- Cumulative total-prize-pool cheques are already present. No individual awards or payouts revealed.
- Prize sections are already above the registration section on shared and Dalal pages. Retained this order.
- Current two-day itinerary cards already cover all eight committees. Retained them without duplicating sections.
- All eight site data agendas now have meaningful descriptions rather than the stale "To be announced" placeholders; CCEP/IPL are *descriptive summaries*, not confirmed official agenda titles.
- Main theme reveal "THE WORLD RESET" restrained to one line.
- Single-line Masquerade eligibility note: included for delegates with paid registration; non-delegates require separate paid entry. No price invented.
- UNHRC: revised scope to distinguish exploitation categories and focus on Sudan, Human Rights Council mandate and three supplied steps.
- Dalal Street: simulation framing, underwriter-first copy, and diligence / price / bell three steps.
- AIPPM: "One Nation, One Code" / UCC rendered as "एक राष्ट्र, एक संहिता — समान नागरिक संहिता (UCC)" with equality/faith/federalism supporting copy.
- Startup: 48-hour Indian problem / VC mentor copy and three steps.
- IPL: concise dossier/mandate, three short steps, and one elegant seven-step "How the auction works" list. Current itinerary kept.
- International Press: newsroom copy and chase/verify/publish points. The optional public leaderboard is *not* created.
- MCC: "Eternal Court: Afterlife", "Death is dead", "Answer before the dawn does" and three steps.
- CCEP: its existing itinerary is already present; no duplicate.

## Needs factual or creative approval (not changed)

- Venue: existing public location is Masters' Union, DLF Cyber Park, Gurugram. Team document says "CDS Corporate Tower, Ugyog Vihar" under UNHRC. Confirm whether this applies to every committee, only one event, or is a mistake; no venue/map link altered.
- Masters' Union institutional logo: the website currently uses its MU typography and the ZERO brand. Need an approved official logo asset before changing the masthead.
- Specific individual prize titles: team requests Bull of the Floor, Best Parliamentarian, Keeper of Eternity, etc. Current user-approved interface reveals only **cumulative** prize pool. No individual awards shown until team decides whether to reveal award tiers/names.
- Dalal page "swap": document wording is incomplete. Titles and step content were corrected, but page blocks were not reordered because its exact desired order is ambiguous.
- Official CCEP and IPL agenda names are not supplied in the document. Current description text is neutral, not a claimed named agenda.
- Optional IP public scoring/leaderboard: not implemented without scoring rules or data source.
- Music autoplay: existing code attempts playback by default and preserves visitor opt-out; browser policies block audible autoplay until interaction on many devices.

## Performance work

- WebGL globe: particles, sparks, trails and chips use quality budgets based on memory/CPU/viewport, preserving timing, scene choreography and the fallback.
- Home star canvas: reduce draw work, especially at narrow widths, retaining the atmosphere.
- Dalal floating character: change scroll motion from the layout-triggering CSS top property to compositor-friendly transform.
- Mobile translucent backgrounds: remove a few expensive backdrop blur effects while retaining dark readable surfaces.
- Existing offscreen pause guards and reduced-motion support are retained.
- The old assets/js/map-life.js contains a canvas-light renderer but is not loaded by index.html or its active scripts. No change to this unused file is counted as an improvement.
- No Supabase/database migration: static animation frame drops are a rendering workload, not a database bottleneck.

These changes are *probable improvements from code inspection*, **not a claimed measured FPS gain**. Validate via Chrome DevTools Performance with CPU throttling, plus an S23 Ultra and 8 GB laptop. Run screenshots/regression tests on direct links, Back navigation, all registration forms, 3D itinerary, map hover/click and reduced motion before calling the work fully QA complete.

Rollback target: Git commit immediately before this bundle; production should advance only after the Vercel preview build is successful.
