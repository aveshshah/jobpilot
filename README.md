# JobPilot

Android-first MVP for importing LinkedIn and Indeed job-alert emails, managing
multiple résumés, and initiating one-tap applications through explicitly
supported submission adapters.

## What works in this starter

- Expo Android job feed, job detail, profile and résumé screens.
- Fastify API with a deterministic application preflight.
- LinkedIn/Indeed alert-email link parser.
- MCP tools for searching jobs, listing résumés and submitting applications.
- Demo application adapter and automated tests.

The repository deliberately does **not** scrape LinkedIn or Indeed and does not
pretend their employer/ATS APIs are applicant APIs. Production submission needs
an authorized adapter for each supported destination. CAPTCHA, unknown required
questions, sensitive disclosures and missing profile data must block automatic
submission.

## Run locally

Requirements: Node.js 20+, npm, Android Studio or an Android phone with Expo Go.

```bash
cp .env.example .env
npm install
npm run dev:api
```

In another terminal:

```bash
npm run dev:mobile
```

The Android emulator reaches the API at `http://10.0.2.2:4000`. For a physical
phone, add an `extra.apiUrl` entry to `apps/mobile/app.json` using the computer's
LAN address.

## Build an installable Android APK

The APK contains the mobile client. Deploy the API first and set
`expo.extra.apiUrl` in `apps/mobile/app.json` to its HTTPS URL; otherwise the
installed app will still try to reach the Android-emulator loopback address.

```bash
npm install
npm install --global eas-cli
cd apps/mobile
eas login
eas build:configure
eas build --platform android --profile preview
```

When the cloud build completes, open its download URL on the Android phone,
download the `.apk`, allow installation from that browser when Android asks,
and install it. The `preview` profile in `eas.json` produces an installable APK;
the `production` profile produces an AAB for Google Play.

## Connect the MCP server

After installing dependencies:

```bash
codex mcp add jobpilot -- npm --prefix /absolute/path/to/jobpilot/apps/api run mcp
```

Restart the MCP host and confirm that `search_jobs`, `list_resumes`, and
`submit_application` are visible.

## Gmail alert ingestion

Create a Google Cloud OAuth client and request the narrow Gmail read-only scope.
The production ingestion worker should:

1. Search only for LinkedIn and Indeed alert messages.
2. Pass each message into `parseAlert` in `apps/api/src/email-parser.ts`.
3. Upsert normalized jobs by source plus external ID.
4. Retain the source URL and received timestamp.
5. Never store unrelated email bodies.

Do not ask users for Gmail passwords. Use OAuth with PKCE and encrypt refresh
tokens using a managed secret/key service.

## Production work still required

1. Replace the in-memory store with PostgreSQL.
2. Implement Gmail OAuth and periodic alert import.
3. Implement multipart résumé uploads to encrypted object storage.
4. Add authentication and per-user tenancy.
5. Add job-specific authorized submission adapters.
6. Add a visible blocked-question workflow.
7. Add audit logs, deletion/export controls and privacy documentation.
8. Build a signed Android package with EAS Build or Android Studio.

Keep `ENABLE_REAL_SUBMISSION=false` until a real adapter has integration tests,
idempotency protection, receipt capture and source authorization.

## Download an APK from GitHub

The repository includes `.github/workflows/build-android-apk.yml`. Every push
to `main` that changes the mobile app starts an Android debug APK build.

1. Open the repository's **Actions** tab.
2. Select **Build Android APK**.
3. Open the latest successful run.
4. Download the `JobPilot-Android-APK` artifact.
5. Extract `JobPilot-debug.apk` and install it on an Android phone.

The APK is a test build. It still needs a reachable JobPilot API URL before
email ingestion, résumé storage, and real application adapters can work.
