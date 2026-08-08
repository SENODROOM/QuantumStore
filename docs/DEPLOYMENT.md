# Deployment guide — QuantumStore

Production checklist for hosting QuantumStore on a Node host (Railway, Render, Fly.io, or a VPS) with MongoDB Atlas.

## 1. MongoDB Atlas

1. Create a cluster and database user.
2. Allow the host IP (or `0.0.0.0/0` with caution) in Network Access.
3. Copy the connection string into `MONGODB_URI`.
4. Enable continuous backups / snapshots in Atlas for the cluster.

## 2. Environment variables (backend)

Copy from `backend/.env.example` and set **at least**:

| Variable | Notes |
|----------|--------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Atlas URI (required; memory DB blocked in production) |
| `JWT_SECRET` | 32+ random characters |
| `CLIENT_URL` | Public storefront origin, e.g. `https://store.example.com` |
| `CORS_ORIGINS` | Optional comma-separated allowlist |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Strong admin credentials (seed on first boot) |
| `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET` | Required if card checkout is enabled |
| `RESEND_API_KEY` or SMTP_* | Transactional email |
| `STORAGE_DRIVER` | `s3` in production with `S3_*` vars |
| `SENTRY_DSN` | Optional error tracking |

## 3. Build & start

```bash
npm run install:all
npm run build --prefix frontend
npm run build --prefix backend   # tsc → dist/
npm start --prefix backend       # serves API + frontend/dist
```

Or with tsx in simpler hosts:

```bash
npm run build --prefix frontend
cd backend && npx tsx src/index.js
```

## 4. Stripe webhook

Point Stripe to:

`https://<your-api-host>/api/payments/webhook`

Events: `checkout.session.completed`. The webhook is the **only** writer of paid status.

## 5. Object storage

Set `STORAGE_DRIVER=s3` and bucket credentials so product images survive deploys (local `uploads/` is for development only).

## 6. Health & uptime

Monitor `GET /api/health`. Pair with Sentry (`SENTRY_DSN`) and structured logs (pino).

## 7. Legal pages

Storefront routes `/privacy`, `/terms`, and `/returns` must remain published before taking live payments.
