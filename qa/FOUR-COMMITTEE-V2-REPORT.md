# Masters' Union Nations V2 — feature branch QA

Branch: `feature/four-committee-cinematic-polish`

Scope: MCC, International Press, AIPPM, Dalal Street, global map stability, performance, registration.
Environment: local static server (`127.0.0.1:8765`), desktop 1440 × 900 and mobile 390 × 844. No production deployment, merge, payment integration, or cIAo database access.

## Integration

- Read the supplied `README.md` and `CODEX-BUILD-BRIEF.md` before inspecting the repository.
- Ran the package installer in dry-run mode. All source anchor checks passed and no files were changed by the dry run. Applied the same installer afterward.
- Preserved the existing committee routing and entrance sequences. Added scoped V2 presentation and inline registration for the four requested committees; stabilized the map and made its mobile atlas horizontally explorable without distorting geography.
- Source checks: `git diff --check` and `node --check` for the touched JavaScript and API files passed. The package's `qa/test-api.cjs` passed mocked 503, 400, cross-origin rejection, and successful database-write cases.

## Browser checks

| Flow | Desktop | Mobile | Result |
| --- | --- | --- | --- |
| MCC | [Hero](screenshots/mcc-desktop.png), [scrolled content](screenshots/mcc-scroll-desktop.png) | [Hero](screenshots/mcc-mobile.png) | Entrance opened the existing page automatically; hero registration button reached the inline form. |
| International Press | [Hero](screenshots/ip-desktop.png), [scrolled content](screenshots/ip-scroll-desktop.png) | [Hero](screenshots/ip-mobile.png) | Entrance opened the page automatically; newsroom hero and content remained readable. |
| AIPPM | [Hero](screenshots/aippm-desktop.png), [registration](screenshots/aippm-register-desktop.png) | [Hero](screenshots/aippm-mobile.png) | Entrance opened the page automatically; Parliament hero and form were usable. |
| Dalal Street | [Hero](screenshots/dalal-desktop.png), [scrolled content](screenshots/dalal-scroll-desktop.png) | [Hero](screenshots/dalal-mobile.png), [registration](screenshots/dalal-register-mobile.png) | Entrance opened the page automatically; ticker stayed below the title; form replaced the old payment path. |
| World map | [Desktop](screenshots/map-desktop.png) | [Mobile](screenshots/map-mobile.png) | Eight pins remained clickable. A pointer drag left desktop map bounds unchanged; mobile horizontal swipe preserved aspect ratio. |

The transition handoffs and Skip control were exercised in the browser. Screenshots above show the resulting pages, rather than unverified in-between frames. Scrolling to content and registration was exercised for all four committees. The four forms were submitted with disposable test data against the local static server, which has no `/api/register` handler; each displayed a failure rather than claiming a saved request. No payment interface was invoked. One browser console check showed no warnings or errors.

## Performance observations

Local browser, warm cache, no network or CPU throttling:

| Viewport | First contentful paint | Largest contentful paint | Layout shift | DOM content loaded |
| --- | ---: | ---: | ---: | ---: |
| 1440 × 900 | 324 ms | 1,588 ms | 0 | 484 ms |
| 390 × 844 | 600 ms | 1,832 ms | 0 | 922 ms |

A sampled desktop click interaction measured 32 ms. These are local observations, not Lighthouse scores or cold-load benchmarks. The existing `assets/` directory totals approximately 67 MiB; the added compressed newsroom WebP is 213,828 bytes. Ambient cursor movement and eager loading of unrelated committee backgrounds were reduced. No before/after baseline trace exists, so a measured performance improvement cannot be claimed.

## Still incomplete before production approval

1. A dedicated event Supabase project, private Vercel environment variables, schema application and a verified live insert are required. The endpoint intentionally returns an unavailable/failure response without them. The existing cIAo database was not used.
2. Add production bot protection, rate limiting, a data retention/privacy notice, and an organiser workflow for registrations. Confirm the delegate/payment workflow separately; payments remain disabled.
3. Run cold-load Lighthouse and a mobile performance trace with network/CPU throttling. Capture four actual transition-to-registration recordings and repeat keyboard/focus/reduced-motion QA.
4. Complete the third-party asset license inventory. Optional licensed political portraits were not supplied, so that AIPPM gallery remains hidden. The IP newsroom visual is an original generated asset.

This branch is ready for design and engineering review. It has not been merged, deployed, or connected to a live registration database.
