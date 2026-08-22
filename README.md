# Tour India Tour Report Management System — Phase 1

Production-oriented foundation:

**GitHub Pages frontend → Google Apps Script Web App → Google Drive + Google Sheets**

## 1. Create the Google Drive root

Create:

`Tour India Tour Reports`

Copy its folder ID.

## 2. Create the Google Sheet index

Create a Google Sheet named, for example:

`Tour India Tour Report Index`

Copy the spreadsheet ID.

## 3. Create the Apps Script project

Create a standalone Google Apps Script project and add every `.gs` file from `apps-script/`.

## 4. Configure Script Properties

In Apps Script:

**Project Settings → Script Properties**

Add:

| Property | Value |
|---|---|
| `MAIN_DRIVE_FOLDER_ID` | ID of `Tour India Tour Reports` |
| `INDEX_SHEET_ID` | Google Sheet ID |
| `AUTHORIZED_USERS` | comma-separated authorized Google email addresses |
| `GOOGLE_OAUTH_CLIENT_ID` | Google OAuth Web Client ID, if using token verification |

Never put these values in GitHub.

## 5. Deploy Apps Script

Deploy → New deployment → Web app.

For the initial architecture:

- Execute as: **Me**
- Who has access: **Anyone**

The backend itself must enforce authorization. Do not rely on the deployment access setting as the application's authorization layer.

Copy the Web App URL.

## 6. Configure GitHub frontend

Open:

`config/config.js`

Set:

```js
API_BASE_URL: "YOUR_APPS_SCRIPT_WEB_APP_URL",
GOOGLE_CLIENT_ID: "YOUR_GOOGLE_OAUTH_WEB_CLIENT_ID"
```

These are public frontend configuration values. Do not put secrets here.

## 7. Important authentication note

Apps Script's `Session.getActiveUser()` is not guaranteed to identify the browser user when an external GitHub-hosted frontend calls a web app.

Therefore, the production authentication layer should use Google Identity Services:

1. User signs in with Google.
2. Browser receives a Google ID token.
3. Frontend sends the token to Apps Script.
4. Apps Script verifies the token.
5. Apps Script checks the email against `AUTHORIZED_USERS`.
6. Only then are internal records accessible.

The Phase 1 API foundation includes the server-side token-verification helper. The Google Identity Services browser flow should be connected before production use.

## 8. GitHub Pages

Push the repository to GitHub.

Enable:

**Settings → Pages → Deploy from branch**

Select the branch/folder containing `index.html`.

## 9. Phase 1 test

After configuration:

1. Open the GitHub Pages URL.
2. Verify API connectivity.
3. Verify authorization.
4. Create a new tour.
5. Confirm a `TIR-YYYY-XXXX` ID is generated.
6. Confirm the Drive folder is created.
7. Confirm `Tour Data/tour-data.json` exists.
8. Confirm the Sheet index row exists.
9. Edit the tour.
10. Refresh and verify the record remains available.

## Security

Never commit:

- `.env`
- service-account JSON
- private keys
- passwords
- OAuth client secrets
- Drive access tokens
- Script secrets

The Google Drive folder and Sheet IDs used by the backend belong in Apps Script Script Properties.

## Current scope

Phase 1 implements:

- API router
- authorization foundation
- Drive storage
- Tour ID generation with LockService
- JSON tour database
- Sheet index
- dashboard
- search
- create/edit tour
- group calculations
- archive
- duplicate foundation
- responsive GitHub frontend

Phase 2 will add the complete operational Tour Form modules.
