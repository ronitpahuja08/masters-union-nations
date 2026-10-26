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
| MCC | [Hero](screenshots/mcc-repair-desktop.png) | [Hero](screenshots/mcc-repair-mobile.png) | Video transition handed off to the existing page. New York backdrop, moving train and registration entry point fit the mobile viewport. |
| International Press | [Hero](screenshots/ip-repair-desktop.png) | [Hero](screenshots/ip-mobile.png) | Newspaper intro handed off to the newsroom page. Desktop frame and committee content were readable. |
| AIPPM | [Hero](screenshots/aippm-repair-desktop.png) | [Hero](screenshots/aippm-repair-mobile.png) | Parliament transition handed off to the page. Removed the empty side podium panels; the mobile hero has no horizontal overflow. |
| Dalal Street | [Hero](screenshots/dalal-repair-desktop.png), [registration](screenshots/dalal-register-repair-desktop.png) | [Hero](screenshots/dalal-repair-mobile.png), [registration](screenshots/dalal-register-repair-mobile.png) | Market transition handed off to the page. Historic trading floor, moving simulated quote board and shared registration form render at both sizes. |
| World map | [Desktop](screenshots/map-repair-desktop.png) | [Mobile](screenshots/map-repair-mobile.png) | Eight destination pins and rail remain available. Desktop map fills the frame; mobile map keeps geographic proportions and can be swiped horizontally. Prize-pool copy and audio control no longer collide on mobile. |

All four entrance-to-page handoffs were observed. The MCC intro exposed its Skip control; all page Start Registration controls reached the shared inline form. Dalal required-field validation was exercised without transmitting data. The registration API mock suite passes its 503, 400, CORS rejection and database-success cases; the local static preview has no `/api/register` handler, so no real registration was submitted. No payment interface was invoked. Browser console had no errors or warnings during the final mobile check. Desktop Dalal and mobile views were checked for horizontal overflow; both matched viewport width.

## Performance observations

Previous local browser smoke measurements (warm cache, no network or CPU throttling; before the final CSS-only mobile control adjustment):

| Viewport | First contentful paint | Largest contentful paint | Layout shift | DOM content loaded |
| --- | ---: | ---: | ---: | ---: |
| 1440 × 900 | 324 ms | 1,588 ms | 0 | 484 ms |
| 390 × 844 | 600 ms | 1,832 ms | 0 | 922 ms |

A sampled desktop click interaction measured 32 ms. These are local observations, not Lighthouse scores or cold-load benchmarks, and were not repeated after the final small CSS adjustment. The existing `assets/` directory totals approximately 67 MiB; the added compressed newsroom WebP is 213,828 bytes. The new trading-floor WebP is 192,234 bytes. Ambient cursor movement and eager loading of unrelated committee backgrounds were reduced. No before/after baseline trace exists, so a measured performance improvement cannot be claimed.

## Still incomplete before production approval

1. A dedicated event Supabase project, private Vercel environment variables, schema application and a verified live insert are required. The endpoint intentionally returns an unavailable/failure response without them. The existing cIAo database was not used.
2. Add production bot protection, rate limiting, a data retention/privacy notice, and an organiser workflow for registrations. Confirm the delegate/payment workflow separately; payments remain disabled.
3. Run cold-load Lighthouse and a mobile performance trace with network/CPU throttling. Capture four actual transition-to-registration recordings and repeat keyboard/focus/reduced-motion QA.
4. Complete the third-party asset license inventory. Optional licensed political portraits were not supplied, so that AIPPM gallery remains hidden. The IP newsroom visual is an original generated asset.

This branch is ready for design and engineering review. It has not been merged, deployed, or connected to a live registration database.
