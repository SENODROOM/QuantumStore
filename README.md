# QuantumStore

MERN ecommerce website for Quantum Logics Limited — sell and purchase tech products with a full admin panel.

## Stack

- **MongoDB** — persistent local file DB via `mongodb-memory-server` by default (no Docker); optional Atlas URI for production
- **Express** — REST API (`backend/`)
- **React (Vite)** — storefront + admin UI (`frontend/`)
- **Node.js** — server runtime
- **Stripe** — optional card checkout
- **Nodemailer** — optional order / password-reset emails
- **Vitest + Playwright** — API unit tests and end-to-end checks

## Features

### Storefront
- Catalog with pagination, sort, search autocomplete, product reviews, related products
- Multi-image galleries, product variants, image zoom
- Cart drawer, coupons (`WELCOME10`), guest checkout, dark mode, toasts
- Recently viewed strip (localStorage)
- Public order tracking (`/order/track`) and printable invoices
- Customer cancellation of **pending** orders (restores stock)

### Accounts
- Register / login / password change
- Forgot / reset password (JWT, 15 min; SMTP or console link when SMTP is unset)
- Unified `/account/*` layout: Profile, Orders, Wishlist

### Admin / staff
- Dashboard analytics, products (bulk actions, stock edits), categories, orders
- Coupons, customers, settings — **admin only**
- Staff role can manage products/orders but not settings/coupons/customers
- Team invites from Settings; activity / stock audit log

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

No Docker required. The API seeds sample data on start.

## Scripts

```bash
npm run dev          # backend + frontend
npm test             # Vitest API suite
npm run build        # production frontend build
npm run test:e2e     # Playwright (requires app running or webServer in config)
npm run seed         # reseed database
```

## Optional: MongoDB Atlas (production)

In `backend/.env`:

```env
USE_MEMORY_DB=false
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/quantumstore
JWT_SECRET=use_a_long_random_secret
CLIENT_URL=https://your-frontend-domain
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

Without SMTP, password-reset links are printed to the API console so local testing still works.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs backend Vitest, frontend build, and Playwright on push/PR.

## Project structure

```
QuantumStore/
├── frontend/        React storefront + admin
├── backend/         Express API
├── e2e/             Playwright specs
├── .github/workflows/ci.yml
└── package.json
```

## Environment

Copy `backend/.env.example` to `backend/.env` and adjust if needed.
