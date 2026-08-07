# QuantumStore

MERN ecommerce website for Quantum Logics Limited — sell and purchase tech products with a full admin panel.

## Stack

- **MongoDB** — in-memory by default (no Docker); optional Atlas URI for production
- **Express** — REST API
- **React (Vite)** — storefront + admin UI
- **Node.js** — server runtime
- **Stripe** — optional card checkout
- **Nodemailer** — optional order emails

## Features

- Public shop: home, catalog, product detail, cart, checkout, order success
- Customer accounts: register, login, order history (guest checkout still works)
- Admin panel: dashboard stats/charts, product CRUD + image upload, categories, order filters/details
- JWT auth, validation, low-stock alerts
- Optional Stripe payments + SMTP order emails to customers and `admin@quaantumlogicslimited.com`

## Quick start

### 1. Install dependencies

```bash
npm install
npm run install:all
```

### 2. Run the app

```bash
npm run dev
```

- Storefront: http://localhost:5173
- Admin: http://localhost:5173/admin/login
- API: http://localhost:5000/api/health

Default admin:

- Email: `admin@quaantumlogicslimited.com`
- Password: `admin123`

No Docker required. The API uses in-memory MongoDB and seeds sample data on start.

## Optional: MongoDB Atlas (production)

In `server/.env`:

```env
USE_MEMORY_DB=false
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/quantumstore
JWT_SECRET=use_a_long_random_secret
CLIENT_URL=https://your-frontend-domain
```

Then:

```bash
npm run seed
```

## Optional: Stripe + email

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
MAIL_FROM=QuantumStore <noreply@quaantumlogicslimited.com>
ADMIN_EMAIL=admin@quaantumlogicslimited.com
```

Without Stripe keys, checkout uses manual/COD-style order placement.

## Deploy (no Docker)

1. Create a MongoDB Atlas cluster and set `USE_MEMORY_DB=false` + `MONGODB_URI`.
2. Deploy API (Render/Railway/Fly) with `npm start` from `server/`, set env vars, expose port.
3. Deploy client (Vercel/Netlify) with `npm run build` from `client/`.
4. Point Vite/`CLIENT_URL` and API proxy or `VITE_API_URL` at your API origin; set CORS `CLIENT_URL` on the server.
5. Run `npm run seed` once against Atlas.

## Project structure

```
QuantumStore/
├── client/          React storefront + admin
├── server/          Express API
└── package.json
```

## Environment

Copy `server/.env.example` to `server/.env` and adjust if needed.
