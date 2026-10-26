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

## Repeat emails

- The same email address **can** register more than once, in case a delegate typed the wrong details the first time. When an email appears again, the new row is marked **Repeat of an earlier email** in the last column, so you can tell which row is the newer one.
- To block repeats instead, set `var BLOCK_DUPLICATES = true;` at the top of `Code.gs` and publish a new version.
- After changing `Code.gs` publish it again: **Deploy > Manage deployments > pencil icon > Version: New version > Deploy**. The URL stays the same.

## On-the-day check-in (personal QR on every iCard)

How it works:
1. A delegate registers. The sheet script gives them a **Delegate ID** (MUN26-0001 ...) and a private **Token** (long random string, a new one per registration). The token is their personal QR code.
2. The iCard shows that QR. The same QR is on their personal page `https://<your-site>/card.html#<token>`, which is the link in their email.
3. On the day the delegate opens their card on their phone. A volunteer scans the QR; the delegate is marked **Checked in**, with the time and the volunteer's name, in the "Checked in" columns of the sheet.
4. A second scan shows "Already checked in at ..." so nobody is counted twice. A QR that is not on the list shows "Not recognised".

Volunteer page: `https://<your-site>/checkin.html` (not linked anywhere on the site). A volunteer signs in with their name and the **desk PIN**, then can:
- scan with the phone's normal Camera app (it opens the page and checks the delegate in, even on iPhone),
- use the in-page camera button (Chrome on Android),
- use a USB / Bluetooth handheld scanner (click the box, scan),
- or search by name / email / ID when a QR will not scan.

Setup (one time):
1. Replace the script in Extensions > Apps Script with the new `Code.gs`, then **Deploy > Manage deployments > pencil > Version: New version > Deploy**. New columns (Delegate ID, Token, Checked in, Check-in time, Checked in by) are added to the sheet automatically.
2. In Vercel > Settings > Environment Variables add `STAFF_PIN` (a PIN of your choice, 6+ digits; share it only with volunteers) and redeploy.
3. Optional, to email every delegate their iCard link: in Apps Script > Project Settings > Script properties add `SEND_EMAILS` = `yes`. The first time a registration runs, Google asks you to approve sending email. Free Gmail accounts can send about 100 emails a day, Google Workspace accounts about 1,500; beyond that emails silently stop but registrations still save.
4. Test with your own registration before the event: register, open the card page, sign in to `checkin.html`, scan.

Notes:
- Registrations made before this update have no token, so they have no QR. Only new registrations get one.
- If someone registers twice, each registration has its own QR and its own row (the later row is flagged "Repeat of an earlier email").
- Change the PIN any time by editing `STAFF_PIN` in Vercel and redeploying.
## Emails and the daily sending limit

Apps Script sends each delegate their iCard link when the script property `SEND_EMAILS` is `yes`. Google caps how many emails an account can send per day: about **100** for a normal @gmail.com account and about **1,500** for a Google Workspace (school / company) account. Run `showMailQuota` in the Apps Script editor to see the exact number for your account.

Nothing is lost when the limit is reached:
- The **Email status** column in the sheet shows `Sent`, `Queued` (limit reached, waiting) or `Failed`.
- `sendPendingEmails` sends everything that is `Queued` (and retries `Failed`) as soon as the limit resets. Run `installDailyEmailTrigger` once and it does this by itself every morning around 9am.

To send more per day, own the sheet and script from your Workspace account (for example your mastersunion.org address), or move sending to an email service (Resend, Brevo, Amazon SES) later.