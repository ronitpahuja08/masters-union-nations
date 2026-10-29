# Landing film + mobile pass — spec (29 Oct 2026)

## Goal
The landing stops being a long scroll. One press plays a short film that sells the event in order:
**what you can win (₹2,20,000) → where it happens → the world resets → pick your room.** It must hold 60 fps on
weak laptops (4× CPU throttle in Chrome) and on phones.

## Hero
- Primary button: **Reset the world** (≥ 48 px tall). Secondary text link: **Skip to the map**.
- A wheel, swipe or Space/Enter on the hero also starts the film. The document no longer scrolls;
  the map, committee pages and modals keep their own scroll areas.
- A **Skip** control is visible for the whole film and jumps straight to the map.

## Storyboard (≈ 13 s of film, then the existing reset ≈ 5 s)
| Time | Act | What happens |
|---|---|---|
| — | — | *Revised 29 Oct: Act I is a spotlit 3D bundle of original ₹ notes with a rolling ₹2,20,000 odometer that snaps into a slow-motion note burst; Act II draws the tower as a blueprint, then fills it in glass at sunset with an editorial lockup. The table below is the first draft.* |
| 0.0–0.6 s | I · Prize | Red paper tears open across the screen (two jagged halves part), revealing a dark vault. |
| 0.6–1.2 s | I | A brass-and-oxblood chest at the bottom shakes, the lid bursts open with a flash. |
| 1.0–3.6 s | I | Banknotes (original ZERO guilloche design, no real faces) erupt, spin and flow upward; the counter rolls 0 → **4,29,45,08,854 RIAL**, then a red pill stamps **= ₹2,20,000 prize pool · Don't give it a reason to leave.** |
| 3.6–4.4 s | I → II | The notes swirl and rush at the camera, filling the screen — the wipe into the venue. |
| 4.4–8.6 s | II · Venue | A sunset-red sky. A low-poly 3D **CDS Corporate Tower** (glass curtain wall + corner glass drum) assembles floor by floor, windows light up, the camera arcs around it. Lock-up: *Masters' Union Nations 26 is taking place at* / **CDS CORPORATE TOWER** / *Gurugram* / **28–29 NOVEMBER 2026**. |
| 8.6–9.6 s | II → III | Sky drops to night, the camera tilts up into the stars, the film fades into the existing globe scene. |
| 9.6–12.4 s | III · Reset | Existing statue wind-up and gavel strike, auto-driven (journey progress .24 → .62). |
| 12.4 s → | III | Existing shatter → black "THE WORLD RESETS" → world map, unchanged. |

If the globe textures are not ready at 8.6 s, the venue holds (max +3 s); if the globe fails, the
film goes straight to the reset card and map.

## Implementation
- `assets/js/intro-film.js` (ES module, shares the three.js CDN import with `globe-journey.js`):
  2D canvas for notes and particles, inline SVG chest and torn paper, WebGL canvas for the tower.
  Built lazily on first press (warmed in idle time after the hero settles).
- `home.js` gains an `auto` phase that drives progress on a fixed curve, then hands to the
  existing `handoff` phase. Exposed as `window.MUNJourney.play()` / `.skip()`.
- Reduced motion: no tear, burst or camera move — each act shows as a still card for ~1.5 s,
  then the map.
- Budgets: ≤ 140 notes desktop / 70 phone, device-pixel ratio capped at 1.5, transforms and
  opacity only in CSS.

## Other parts of this pass
- **Itinerary → "Order of Business"**: Day 1 / Day 2 switch, one vertical timeline, sessions in the
  committee colour, special rows for Closing Ceremony and Masquerade, a live NOW marker on 28–29 Nov (IST).
- **Phone map**: the San Francisco → Singapore band fits the screen width; all eight cities visible
  with ≥ 44 px tap targets; committee list below.
- **Committee pages on phones**: compact top bar, smaller music button that hides over forms,
  IPL empty gap, MCC hero button, doubled "Rupees … only" on the prize cheque.
- **Speed**: landing-critical CSS first, committee/modal CSS loaded without blocking first paint,
  unused font families trimmed; re-profile to zero janky frames at 4× throttle.

## Venue
CDS Corporate Tower, Udyog Vihar, Gurugram — matching the hero and the poster.
