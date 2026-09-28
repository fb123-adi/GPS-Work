# Kyveron

E-commerce for Kyveron, a premium Indian apparel brand (daily wear and training). Next.js 16 (App Router, TypeScript), Tailwind CSS 4, PostgreSQL with row-level security, Supabase Auth and Storage, Razorpay payments, Resend email.

Full setup, environment variables, webhooks, and deployment: **[docs/SETUP.md](docs/SETUP.md)**.

## Status: what is real and what is a placeholder

| Area | State |
|---|---|
| Catalogue, filters, search, product pages, cart, checkout, orders, returns, reviews, wishlist, account, admin | Working against Postgres. Tested. |
| Server-side pricing, GST, coupons, stock reservation, oversell protection, order state machine, audit log | Working. Covered by integration tests. |
| Payments | **Mock gateway** until Razorpay keys are set. The Razorpay code path (order creation, signature and webhook verification, refunds) is implemented but has **not been run against Razorpay** from this environment. Test with Razorpay test keys before launch. |
| Sign-in | **Local development driver** (scrypt passwords, DB sessions) until Supabase is configured. Google, Apple, magic links, and MFA need Supabase. The local driver refuses to run in production. |
| Email | Written to the `email_outbox` table and logged until `RESEND_API_KEY` is set. |
| Image storage | Local disk until Supabase Storage is configured. |
| Product photography, hero video | **Placeholders** (generated drawings). Replace before launch. |
| Legal pages, business details, GST slabs, shipping fees, size charts, quality claims | **Placeholders marked for owner/lawyer/CA review.** Nothing here is legal advice. |
| Delivery estimates | PIN-zone heuristic, not a courier API. |
| International checkout, COD, EMI | Off by design until configured. Other currencies are display-only approximations. |

Every simulated integration shows a visible "Development mode" notice, and `APP_ENV=production` refuses to start while any mock driver is active.

## Quick start (local)

Requirements: Node 22, PostgreSQL 15+.

```bash
cd kyveron
npm ci
cp .env.example .env.local           # set DATABASE_URL and SESSION_SECRET (openssl rand -base64 48)
npm run db:migrate
SEED_ADMIN_EMAIL=you@example.com SEED_ADMIN_PASSWORD='a long passphrase' npm run db:seed
npm run dev                          # http://localhost:3000, admin at /admin
```

Or with Docker: see `docker-compose.yml`.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run db:migrate` | Apply `supabase/migrations/*.sql` to `DATABASE_URL` |
| `npm run db:seed` | Sample catalogue, content, and optional local super admin (never in production) |
| `npm run db:grant-role -- email role` | Grant a staff role to an existing account |
| `npm test` | Unit + integration tests (needs Postgres; uses a throwaway `kyveron_test` database) |
| `npm run test:e2e` | Playwright end-to-end tests against a running, seeded app |
| `npm run audit:deps` | Production dependency audit |

## Layout

```
src/app/(home), (store)     customer routes          src/lib/orders      order service, state machine
src/app/admin               RBAC admin               src/lib/payments    Razorpay/mock adapter, webhooks, refunds
src/app/api                 webhooks, cron, exports   src/lib/auth        sessions, roles, guards, actions
src/proxy.ts                CSP, session refresh,     src/lib/pricing.ts  the only place totals are computed
                            admin idle timeout        supabase/migrations schema, RLS, auth sync
```

Design notes live in `PRODUCT.md` and `DESIGN.md`. The hero follows the scroll-scrub engineering standard (Blob-loaded video, gated seeks, dt-normalised easing, five static-hero gates, complete without video).
