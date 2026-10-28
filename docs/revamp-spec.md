# Revamp spec — ZERO: The World Reset (option B)

Masters Union Nations, 28–29 Nov 2026, Gurugram. Audience: school and college delegates deciding whether to register. The site's job: make them feel the event before they read about it, then get them to a committee and a seat.

## Thesis
The whole site is one story: **the old world goes dark, and eight rooms light it back up.** Every page should feel like part of that story, not a separate template.

## Tokens (`assets/css/tokens.css`, loaded first)

| Token | Value | Use |
|---|---|---|
| `--void` | `#0B0306` | page black, slightly red |
| `--oxblood` | `#5E0B1C` | deep surfaces, glows |
| `--signal` | `#E0282E` | the reset red (eye bar, live states, the one urgent accent) |
| `--brass` | `#D2A95C` | gavel brass: rules, seals, stamps, small caps |
| `--ivory` | `#F3E9DC` | primary text |
| `--ash` | `#9C8A88` | secondary text |
| `--hair` | `rgba(243,233,220,.14)` | hairlines |

Committee colours stay per committee (existing `color` in `boardroom.js`); they are the "lights" that come back on after the blackout.

Type, 3 families only:
- `--f-display: 'Archivo'`, variable `wdth 62–125`, `wght 100–900`. Display = wide (`font-stretch:125%`, 800–900). Labels and eyebrows = condensed (`font-stretch:75%`, 600, letter-spacing .14em, uppercase).
- `--f-serif: 'Instrument Serif'`, italic only, for the human, emotional half of a headline ("yours to shape.").
- `--f-mono: 'DM Mono'`, for coordinates, timestamps, telex/cable copy, IDs.

Motion:
- `--ease-out: cubic-bezier(.23,1,.32,1)`, `--ease-io: cubic-bezier(.77,0,.175,1)`, `--ease-drawer: cubic-bezier(.32,.72,0,1)`.
- UI ≤ 250ms. Cinematic moments can be long but are always skippable.
- Buttons: `:active { transform: scale(.97) }`, transition `transform 160ms var(--ease-out)`.
- Hover effects only inside `@media (hover:hover) and (pointer:fine)`.
- Animate transform/opacity/clip-path/filter only. Never `transition: all`.
- `prefers-reduced-motion`: keep fades, drop movement.

## Anti-slop rules
- No gradient text except the one existing NATIONS gold. No glassmorphism card grids. No glows on everything.
- No fake numbering (`01 / THE BRIEF`) unless the content really is a sequence. Use diplomatic vernacular instead: `DOSSIER`, `MANDATE`, `CABLE`, `CREDENTIALS`, `RESOLUTION`.
- Real copy, specific to the committee. No "Unlock your potential".
- One signature move per page; everything else quiet.
- Keep all existing functionality: registration forms, Razorpay, delegate ID studio, check-in QR, audio, skip buttons, deep links.

## Signature moments
1. **Gavel strike opening (home):** page opens to near-black; one gavel strike (existing `MUNJourneyAudio.blast`-style thud, only after first user gesture) sends a shockwave; title assembles. Countdown becomes a **split-flap departures board**.
2. **Blackout → relight (journey):** the "THE WORLD RESETS" card becomes the globe's city lights going out region by region, the voice line, then 8 committee cities relighting in committee colours.
3. **Living world map (hub):** map is alive: city lights shimmer, arcs travel between committees, hover focuses a city with a cable-style readout, clicking zooms the map into the city before the committee intro.
4. **Diplomatic passport:** visiting a committee stamps its visa (localStorage, with try/catch); the Delegate ID becomes a passport carrying the stamps.
5. **Take your seat:** registration CTA is a delegate placard; press-and-hold raises it (with a normal click fallback for accessibility).

## Ownership (to avoid edit collisions)
- Home hero, journey, tokens, fonts, `home.css`/`home.js`/`globe-journey.js`/`journey-audio.js`: lead.
- Committee pages and intros (`committee-*.css/js`, `dalal-crash.js`, `startup-launch.js`, `mcc-night-flight.js`, `#committeeFlight`…`#committeePage` in `index.html`): committees agent. New CSS goes in `assets/css/revamp-committees.css`.
- World map (`.boardroom` section in `index.html`, map code in `boardroom.js`, map rules in `boardroom.css`): map agent. New CSS in `assets/css/revamp-map.css`.
- Dossier, apply/studio modals, `icard.*`, `card.html`, `checkin.html`, passport stamps: credentials agent. New CSS in `assets/css/revamp-credentials.css`.
- `index.html` is shared: re-read before every edit, keep edits to your own region, never reformat the file.
