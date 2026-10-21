# Masters Union Nations

Website for the Masters Union Nations (MUN) conference, 28 & 29 November 2026, Masters' Union School of Business, Gurugram.

Static site (HTML, CSS, vanilla JS) with two Vercel serverless functions for payments. No build step.

## Structure

1. **Home** (`#home`) - the original Masters Union Nations lobby: title, dates, countdown. Styles in `assets/css/home.css`, behaviour in `assets/js/home.js`.
2. **Boardroom onwards** - the Global Boardroom world map, committee dossiers, prizes, applications, contact, Delegate ID Studio and Razorpay checkout. Styles in `assets/css/boardroom.css`, behaviour in `assets/js/boardroom.js` (from `SakshamJain17/MUU-me-MUN`).

The identity-scan gates are disabled but kept: Saksham's `#access` section is still in `index.html` (hidden via `.gate-disabled`), and the original badge-scan + Committee Doors site is preserved untouched in `legacy/original-doors/` (open its `index.html` through a local server).

## Run locally

```bash
python -m http.server 5173
```

Then open http://localhost:5173. The payment functions in `api/` need `vercel dev` to run locally.

## Configure

- `APPLY_ENDPOINT` in `assets/js/boardroom.js` - backend URL the application form POSTs JSON to.
- Razorpay: copy the variable names from `.env.example` into the Vercel project settings (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `REGISTRATION_FEE_INR`).
- Audio in `assets/audio/` - confirm web-use permission before production.
