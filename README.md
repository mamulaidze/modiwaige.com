## Production Configuration

Copy `.env.example` to `.env` for local development and configure deployment
environment variables in your host.

Required:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_SITE_URL` for canonical and social metadata URLs.

Recommended for production:

- `VITE_SUPPORT_EMAIL`, currently `gaachuqegeorgia@gmail.com`.
- `VITE_APP_ENV=production`
- `VITE_APP_RELEASE` with the deployed version or commit SHA.

SEO crawler files are served from `public/robots.txt` and
`public/sitemap.xml`. Update their `https://gaachuqe.com` URLs if the
production domain changes.

Optional observability:

- Set `VITE_MONITORING_ENABLED=true` and `VITE_MONITORING_ENDPOINT` to receive
  sanitized frontend error payloads.
- Set `VITE_ANALYTICS_ENABLED=true`, `VITE_ANALYTICS_PROVIDER`, and
  `VITE_ANALYTICS_ENDPOINT` to receive route page-view events.

Monitoring and analytics stay disabled when these values are missing. Do not send
phone numbers, auth tokens, passwords, or private user data to observability
providers.

## E2E Smoke Tests

Playwright smoke tests live in `e2e/`.

Run guest-accessible checks locally:

```bash
npm run e2e
```

Run with the Playwright UI:

```bash
npm run e2e:ui
```

By default, Playwright starts the Vite dev server on `127.0.0.1:4173`. Set
`PLAYWRIGHT_BASE_URL` to test an already running local or staging deployment.

Auth-dependent tests are skipped unless these are set:

- `PLAYWRIGHT_TEST_EMAIL`
- `PLAYWRIGHT_TEST_PASSWORD`

Use a dedicated Supabase test project or disposable test account. Do not use
production credentials for E2E tests.
