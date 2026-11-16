# PRETWEAR E-Commerce Platform

**Brand:** PRETWEAR — *"Wear it. Brand it. Make it yours."*  
**Reference:** https://www.tiktok.com/@pretwear (brand/content reference only; no invented inventory/pricing/claims)

Premium, modern, responsive e-commerce platform for an Algerian clothing and textile personalization business (storefront + customization/B2B requests + admin).  
**Status:** Phases 1–6 implemented in codebase (core flows + admin UI + test/hardening baseline). **Runtime/E2E verification requires a running PostgreSQL instance, migrations/seed, and backend+frontend running together** (environment-dependent; not fully executed in-session).

> **Sample data policy:** Seed and demo content are clearly labeled SAMPLE/DEMO data and replaceable with actual PRETWEAR inventory. No real inventory, prices, or automatic customization pricing are hardcoded.

## Tech Stack
- **Frontend:** React (Vite), JavaScript (ES6+), React Router, Tailwind CSS, Framer Motion, Axios, React Hook Form, Zod, TanStack Query
- **Backend:** Node.js, Express, REST API, Prisma ORM, PostgreSQL, JWT (HTTP-only cookies), bcrypt, Multer, Cloudinary-ready integration
- **DevOps:** Docker, Docker Compose, Nginx (prod frontend + `/api` reverse proxy), env-driven config, volumes, healthchecks

## Project Structure
```
pretwear/
├── frontend/                  # Vite + React app (Tailwind, SPA)
│   ├── public/
│   ├── src/                   # components, pages, hooks, services, context, layouts, routes, utils, styles
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── backend/                   # Express + Prisma API
│   ├── prisma/                # schema.prisma, migrations/, seed.js
│   └── src/                   # config, controllers, middleware, routes, services, validators, utils, uploads, app.js, server.js
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml         # frontend + backend + postgres
├── .env.example
├── .env                       # local (not committed); copy from .env.example
├── .gitignore
└── README.md
```

## Prerequisites
- Node.js 20+ and npm
- Docker Desktop / Docker Engine + Docker Compose v2

## Environment Variables
1. Copy example env and adjust as needed:
   ```bash
   cp .env.example .env
   ```
   (Windows PowerShell: `Copy-Item .env.example .env`)
2. Key variables: `DATABASE_URL`, `POSTGRES_*`, `JWT_*`, `CLIENT_URL`, `VITE_API_URL`, upload/cloudinary placeholders. **Do not commit secrets.**

## Run with Docker (recommended)
Build and start all services:
```bash
docker compose up --build
```
- Frontend (Nginx): http://localhost
- Backend API: http://localhost:4000
- Health check: http://localhost:4000/api/health (or http://localhost/api/health via proxy)
- PostgreSQL: localhost:5433 on host by default (mapped to container 5432; configurable via `POSTGRES_PORT` in `.env`)

Stop:
```bash
docker compose down
```
Reset DB volume (destructive):
```bash
docker compose down -v
```

## Database migrations & seeding (Phase 3)
Phase 3 includes the full Prisma domain schema (`backend/prisma/schema.prisma`) and a labeled SAMPLE/DEMO seed (`backend/prisma/seed.js`).

1. Ensure PostgreSQL is running and `DATABASE_URL` is correct (`.env`).
2. Generate Prisma client:
   ```bash
   cd backend
   npx prisma generate
   ```
3. Create/apply migrations (first-time dev):
   ```bash
   npx prisma migrate dev --name phase3_init
   ```
   Or apply existing migrations in deploy environments:
   ```bash
   npx prisma migrate deploy
   ```
4. Seed sample data:
   ```bash
   npm run prisma:seed
   ```
   Sample accounts (password for all: `Password123!`): `admin@pretwear.demo` (ADMIN), `manager@pretwear.demo` (MANAGER), `customer@pretwear.demo` (CUSTOMER).

With Docker (after `docker compose up --build`):
```bash
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run prisma:seed
```

## Run locally (without Docker, for development)
### Backend
```bash
cd backend
npm install
npx prisma generate
npm run dev
```
Ensure `DATABASE_URL` points to a running PostgreSQL instance.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Vite dev server: http://localhost:5173 (proxies `/api` to backend in dev config).

## Design References
Stitch design assets and exports are in `stitch_pretwear_e_commerce_platform/` (Atelier Brut `DESIGN.md`, page HTML/screens). These guide the UI system and layouts for upcoming phases.

## Development Phases
1. **Phase 1 – Initialization:** structure, Vite/React, Express, Prisma/Postgres config, Docker, verification baseline. ✅
2. **Phase 2 – UI/UX:** design system and storefront pages/components. ✅
3. **Phase 3 – Backend:** full schema, seed, auth, core APIs, validation/security/transactions. ✅ (code complete; migrations/seed require running PostgreSQL)
4. **Phase 4 – Integration:** frontend-backend wiring (auth, catalog, cart, checkout, customization). ✅ (core flows integrated in code; end-to-end runtime verification pending in target environment)
5. **Phase 5 – Administration:** admin dashboard and management flows. ✅ (separate `/admin` SPA, RBAC guard, dashboard/orders/customizations/products/categories/customers/delivery-zones/settings UIs, attributes endpoints for product admin)
6. **Phase 6 – Testing & deployment hardening:** tests, E2E purchase flow, optimization, production docs. ✅ (baseline implemented)

## Phase 4 integration notes (implemented)
- Frontend now includes API layer (`frontend/src/services/*`), auth context, backend-synced cart context (guest `sessionId` + authenticated carts), and product/cart normalization helpers.
- Integrated flows: auth (register/login/logout/me), catalog/categories/products (home/shop/product/collections), cart (add/update/remove/clear via API), checkout order creation (server-side totals/reference/stock validation), customization request submission with attachments, and account order history (authenticated).
- Vite dev server proxies `/api` to backend; axios uses `withCredentials` for HTTP-only cookie auth.

## Phase 5 administration notes (implemented)
- Admin routes: `/admin/login`, guarded nested routes under `/admin` (dashboard, orders, customizations, products, categories, customers, delivery-zones, settings).
- RBAC: ADMIN/MANAGER access enforced by backend middleware and frontend guard; customers denied.
- Admin capabilities (within available APIs): metrics/alerts dashboard, order status updates, customization status/quotes, product+variant+inventory CRUD (images/variants replaced on save per backend), category CRUD, customer list/search, delivery zone upsert/delete, store settings/content JSON (`socialLinks`, `content` CMS-lite).
- Backend addition: `/api/attributes/sizes` and `/api/attributes/colors` (GET public, POST admin/manager) for product management.

## Phase 3 API overview (implemented)
- `GET /api/health`
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`, `GET /api/auth/me`
- Categories: `GET /api/categories`, `GET /api/categories/:idOrSlug`, admin/manager CRUD
- Products: `GET /api/products` (search/filter/sort/pagination), `GET /api/products/:idOrSlug`, admin/manager CRUD
- Cart: `GET/DELETE /api/cart`, `POST /api/cart/items`, `PUT/DELETE /api/cart/items/:itemId` (guest `sessionId` or authenticated)
- Orders: `POST /api/orders` (transactional stock validation/decrement, unique reference), `GET /api/orders/mine`, `GET /api/orders/reference/:reference`, admin/manager list/status update
- Customization: `POST /api/customization` (multipart attachments), `GET /api/customization/mine`, admin/manager list/detail/status/quotes
- Customers (admin/manager): `GET /api/customers`
- Admin dashboard (admin/manager): `GET /api/admin/dashboard`
- Delivery zones: `GET /api/delivery-zones`, admin/manager upsert/delete
- Settings: `GET /api/settings`, admin/manager update
- Attributes (Phase 5): `GET/POST /api/attributes/sizes`, `GET/POST /api/attributes/colors`
All mutating/admin endpoints are protected by JWT (HTTP-only cookies or Bearer) + RBAC; inputs validated with Zod.

## Testing (Phase 6 baseline)
> Install dependencies before running tests (new devDependencies added in Phase 6).

### Backend (Vitest + Supertest)
```bash
cd backend
npm install
npm test
```
- Includes: `GET /api/health` + 404 contract smoke test (no DB), utility tests (`pagination`, `response`, `asyncHandler`), and validator tests (`order`, `product`).
- Does **not** replace DB-backed integration tests or live API verification.

### Frontend (Vitest)
```bash
cd frontend
npm install
npm test
```
- Includes: utility/normalization smoke tests (`formatDZD`, `cn`, product/cart normalization).
- UI component/E2E browser tests are not included in this baseline.

## Manual E2E purchase flow checklist (run against migrated+seeded env)
1. **Setup:** start Postgres + backend + frontend; run `prisma generate/migrate/seed`.
2. **Browse:** open storefront, list products, open product detail, verify images/variants/prices (sample data).
3. **Cart:** add variant to cart, update quantity, remove item, clear cart (guest session).
4. **Auth:** register/login/logout/me; confirm protected account access and cookie-based session.
5. **Checkout (COD):** place order with valid wilaya/commune/address; verify server-calculated totals, unique reference, success view, and stock decrement/validation.
6. **Account:** view "my orders" for authenticated user.
7. **Customization:** submit customization request (with/without attachment), verify creation and status visibility (mine/admin).
8. **Admin RBAC:** login as `admin@pretwear.demo` / `Password123!` (or manager), verify dashboard, manage orders/customizations/products/categories/customers/delivery-zones/settings; confirm customer role cannot access admin.
9. **Negative cases:** invalid payloads rejected (Zod), insufficient stock/order conflicts handled, unauthorized/forbidden responses enforced.

## Optimization & production hardening notes
- **Frontend build optimization:** Vite `manualChunks` configured (react/query/forms/motion) to reduce main bundle size; `npm run build` verified after Phase 5 changes (chunk-size warning previously observed, improved by splitting but monitor on future growth).
- **Security:** Helmet enabled, CORS restricted to `CLIENT_URL` with credentials, rate limiting on `/api`, Zod validation, JWT in HTTP-only cookies + Bearer support, RBAC middleware, centralized error handling, `app.set('trust proxy', 1)` for proxied deployments.
- **Auth/cookies in production:** set strong `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET`, `NODE_ENV=production`, secure `CLIENT_URL` (HTTPS), and ensure cookie `secure/sameSite` behavior matches deployment domain/proxy.
- **Data/integrity:** transactional order creation with stock checks/decrement and unique order references; no automatic customization pricing.
- **Uploads/media:** local `/uploads` static serving in dev; Cloudinary integration is env-ready but requires credentials/config hardening for production use.
- **Deployment:** Docker Compose provides frontend (Nginx) + backend + Postgres with healthchecks/volumes; run migrations on deploy (`prisma migrate deploy`) and seed only for sample/demo environments. Rotate secrets, enable HTTPS/TLS termination, backups for Postgres volume, and monitoring/log aggregation in production.
- **Known gaps:** no automated DB-backed integration/E2E suite, no CI pipeline config, content CMS is JSON/settings-based, product update replaces variants/images (affects inventory history semantics) — address in future iterations as needed.

## Notes
- Prices are in **DZD/DA**. Delivery supports configurable Algerian wilaya/commune zones (COD workflows) managed via admin/delivery-zone APIs.
- No actual PRETWEAR inventory, automatic customization pricing, or invented business history/certifications are hardcoded.
- Admin route is `/admin` with role-based authorization (CUSTOMER/ADMIN/MANAGER). Sample seeded accounts (password `Password123!`): `admin@pretwear.demo`, `manager@pretwear.demo`, `customer@pretwear.demo`.
