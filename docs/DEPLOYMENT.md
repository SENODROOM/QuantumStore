# Deployment guide — QuantumStore on Vercel

Production deployment for **two Vercel projects** (frontend SPA + Express API as serverless), with MongoDB Atlas, S3-compatible object storage, Stripe, and Resend.

## Architecture

| Project | Root directory | Role |
|---------|----------------|------|
| **API** | `backend/` | Express app via `api/index.js` |
| **Storefront** | `frontend/` | Vite React SPA + PWA |

If `backend/` and `frontend/` are git submodules, create each Vercel project from its own repository (simplest; no submodule PAT required).

```
Browser ──► Vercel Frontend (Vite)
               │  VITE_API_URL
               ▼
            Vercel Backend (Express serverless)
               ├── MongoDB Atlas
               ├── S3 / R2 (product images)
               ├── Stripe Checkout + webhook
               └── Resend / SMTP
```

## 1. MongoDB Atlas

1. Create a cluster and database user.
2. Network Access: allow `0.0.0.0/0` (required for Vercel serverless egress IPs).
3. Copy the connection string into `MONGODB_URI`.
4. Enable continuous backups / snapshots.

## 2. Object storage (required in production)

Local `uploads/` does **not** work on Vercel. Set:

```env
STORAGE_DRIVER=s3
S3_BUCKET=...
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_PUBLIC_URL=https://your-cdn-or-bucket-url
```

Optional: `S3_ENDPOINT` for Cloudflare R2 or MinIO. Configure the bucket CORS to allow `GET`/`PUT` from your frontend origin.

## 3. Backend (API) Vercel project

**Root:** `backend`  
**Build command:** leave empty or `npm install`  
**Output:** serverless via `api/index.js`  
**Install command:** `npm install`

Environment variables (see `backend/.env.example`):

| Variable | Notes |
|----------|--------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Atlas URI |
| `JWT_SECRET` | 32+ random characters |
| `CLIENT_URL` | Frontend origin, e.g. `https://store.example.com` |
| `CORS_ORIGINS` | Optional comma-separated allowlist |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seed once via `npm run seed` against Atlas |
| `STRIPE_*` | Secret, publishable, webhook secret |
| `RESEND_API_KEY` or `SMTP_*` | Transactional email |
| `STORAGE_DRIVER` | Must be `s3` |
| `S3_*` | Bucket credentials |
| `CRON_SECRET` | Shared secret for Vercel Cron |
| `SENTRY_DSN` | Optional |

`backend/vercel.json` rewrites all traffic to `/api` and schedules:

- `GET /api/cron/low-stock-digest` daily at 08:00 UTC  
  Auth: `Authorization: Bearer <CRON_SECRET>` (Vercel Cron sends this when `CRON_SECRET` is set — ensure the secret matches; the route also accepts `x-cron-secret`).

### Seed admin (once)

From your machine against Atlas:

```bash
cd backend
MONGODB_URI='mongodb+srv://...' ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run seed
```

Do **not** seed on every serverless cold start.

## 4. Frontend Vercel project

**Root:** `frontend`  
**Framework preset:** Vite  
**Build:** `npm run build`  
**Output:** `dist`

Environment:

```env
VITE_API_URL=https://your-api.vercel.app
```

Edit [`frontend/vercel.json`](../frontend/vercel.json) and replace `PLACEHOLDER_API_URL` with your real API origin for `/sitemap.xml` and `/robots.txt` rewrites.

## 5. Stripe webhook

Point Stripe to:

`https://<your-api-host>/api/payments/webhook`

Events: `checkout.session.completed`. The webhook is the **only** writer of paid status.

## 6. Health & uptime

Monitor `GET /api/health`. Pair with Sentry (`SENTRY_DSN`) and structured logs (pino + `x-request-id`).

## 7. Legal pages

Storefront routes `/privacy`, `/terms`, and `/returns` must remain published before taking live payments.

## 8. Local development

```bash
npm run install:all
cp backend/.env.example backend/.env
npm run dev
```

- Storefront: http://localhost:5173  
- API: http://localhost:5000/api/health  

Local hosts still use `src/server.js` (`app.listen` + optional daily `setInterval` digest). Vercel uses the serverless entry + Cron instead.

## 9. Verification checklist

- [ ] `GET /api/health` returns `ok`
- [ ] Admin login works
- [ ] Product image upload lands on S3 and absolute URL renders
- [ ] Stripe test checkout + webhook marks order paid
- [ ] Cron route rejects missing secret; succeeds with Bearer token
- [ ] CORS allows only the frontend origin
- [ ] Playwright e2e green locally (`npm run test:e2e`)
