# Registrations -> Google Sheets

The registration form on every committee page posts to `/api/register`. That function now also writes each
registration to a Google Sheet, through a small Apps Script that lives inside the sheet. No Google Cloud
project, service account or paid service is needed.

## One-time setup (about 5 minutes)

1. Create a Google Sheet (for example "MUN Registrations 2026").
2. In the sheet: **Extensions > Apps Script**. Delete the sample code and paste in all of `Code.gs` from this folder.
3. In Apps Script: **Project Settings (gear) > Script properties > Add script property**
   - Name: `SECRET`
   - Value: a long random string you make up (for example 30+ random characters). Keep it private.
4. **Deploy > New deployment > Select type: Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**, approve the permissions, and copy the **Web app URL** (it ends in `/exec`).
5. In Vercel (project `masters-union-nations` > Settings > Environment Variables), add for Production:
   - `GOOGLE_SHEETS_WEBHOOK_URL` = the Web app URL
   - `GOOGLE_SHEETS_SECRET` = the same string you used for `SECRET`
6. Redeploy (Deployments > the latest one > Redeploy) so the function picks up the variables.

## What you get

- A tab **All Registrations** with every response, newest at the bottom.
- One tab per committee (UNHRC, MCC, CCEP, IPL, AIPPM, DALAL, STARTUP, IP), created automatically on the first response.
- Columns: Timestamp, Committee, Name, Email, Institution, Category, Phone, Why this committee, Source.

## Notes

- A delegate only sees "request received" after the sheet write succeeds.
- If you change the script later, use **Deploy > Manage deployments > Edit > New version** so the same URL keeps working.
- The secret stops anyone who finds the URL from adding rows. Never put it in the website code.
- Supabase is optional now. If `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are also set, each registration is
  written to both; if only one is set, only that one is used.
- If you would rather use a real Google Form, open the form > Responses > **Link to Sheets**. That needs no backend
  at all, but then the site's own form is bypassed and delegates leave the site to fill it in.

## Duplicate emails

- The script rejects a second registration with the same email address (for any committee). Gmail dots and +tags are ignored, so `a.b+x@gmail.com` and `ab@gmail.com` count as the same person.
- The check reads the **Email** column of the All Registrations tab, so delete any test rows from that tab (and the committee tabs) before launch, otherwise those test emails stay blocked.
- After changing `Code.gs` you must publish it again: **Deploy > Manage deployments > pencil icon > Version: New version > Deploy**. The URL stays the same.
