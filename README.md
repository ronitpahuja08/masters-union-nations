# Masters Union Nations

Website for the Masters Union Nations (MUN) conference, 28 & 29 November 2026, Masters' Union School of Business, Gurugram.

Static site (HTML, CSS, vanilla JS) with no build step or dependencies.

## Run locally

```bash
python -m http.server 5173
```

Then open http://localhost:5173.

## Configure

In `assets/js/main.js`:
- `APPLY_ENDPOINT` - backend URL the application form POSTs JSON to.
- `matrix` field per committee in `COMMITTEES` - Matrix links.
