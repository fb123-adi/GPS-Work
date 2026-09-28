# Kyveron setup, configuration, and deployment

This guide takes the store from a local checkout to production. Work through it in order. Anything marked **Owner** needs a business decision or a professional (lawyer, chartered accountant) before launch.

---

## 1. Environment variables

Copy `.env.example` to `.env.local` (development) or set these in your host. Only `NEXT_PUBLIC_*` values reach the browser. Never commit real values.

| Variable | Required | What it is |
|---|---|---|
| `APP_ENV` | yes | `development`, `test`, `staging`, or `production`. In `production` the app refuses to start if any integration would fall back to a mock. |
| `APP_URL` | yes | Public base URL, e.g. `https://kyveron.in`. Used for emails, redirects, CSRF origin checks, and cookie `Secure` flags. |
| `DATABASE_URL` | yes | Postgres connection string. On Supabase use the **pooled** URL (port 6543) on serverless hosts; prepared statements are disabled automatically for it. |
| `SESSION_SECRET` | yes | 32+ random characters (`openssl rand -base64 48`). Signs session, order-access, and admin-activity cookies. Rotating it signs everyone out. |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | production | Supabase project URL and anon key. Enables Supabase Auth. |
| `SUPABASE_SERVICE_ROLE_KEY` | production | **Server only.** Used for Storage uploads. Never expose it. |
| `SUPABASE_STORAGE_BUCKET` | no | Default `media`. |
| `AUTH_DRIVER` | no | Force `supabase` or `local`. Auto-detected. |
| `ADMIN_REQUIRE_MFA` | no | Default `true`: staff need TOTP two-step verification (Supabase) to open admin. |
| `ADMIN_IDLE_TIMEOUT_MINUTES` | no | Default 30. Admin sessions expire after this much inactivity. |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | production | API keys. Key id is public; secret is server only. |
| `RAZORPAY_WEBHOOK_SECRET` | production | Secret you set on the webhook in the Razorpay dashboard. |
| `MOCK_PAYMENT_SECRET` | no | Secret for the local mock gateway (derived from `SESSION_SECRET` if unset). |
| `RESEND_API_KEY`, `EMAIL_FROM`, `SUPPORT_EMAIL` | production | Transactional email. `EMAIL_FROM` must be on a domain verified in Resend. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | recommended | Cloudflare Turnstile for the contact form. Honeypot + rate limits apply either way. |
| `CRON_SECRET` | production | Bearer token your scheduler sends to `/api/cron/*`. |
| `UPLOAD_DIR` | dev only | Local upload folder for the development storage driver. |
| `INTERNATIONAL_CHECKOUT_ENABLED` | no | Keep `false` until shipping, duties, tax, and refunds are configured for other countries. |
| `COD_ENABLED` | no | Keep `false` unless your courier supports COD and reconciliation. |
| `TZ` | no | Defaults to `Asia/Kolkata` for server-rendered dates. |

## 2. Database (Supabase Postgres)

1. Create a Supabase project in the Mumbai region (`ap-south-1`) for latency and data-locality.
2. Apply migrations, either:
   - `DATABASE_URL=<direct connection string> npm run db:migrate`, or
   - `supabase link` then `supabase db push` (the files in `supabase/migrations` are standard SQL).
3. What the migrations create:
   - `0000_compat.sql`: no-op on Supabase; creates `anon`/`authenticated` roles and `auth.uid()` on plain Postgres.
   - `0001_schema.sql`: all tables (users, profiles, roles, user_roles, addresses, products, product_images, product_variants, collections, collection_products, inventory_movements, carts, cart_items, wishlists, wishlist_items, orders, order_items, payments, refunds, shipments, coupons, coupon_redemptions, returns, return_items, reviews, review_votes, newsletter_subscribers, contact_tickets, journal_posts, admin_audit_logs, webhook_events, consent_records, plus content, email outbox, rate limits, exchange rates). Money is `bigint` paise; there are no floats.
   - `0002_rls.sql`: row-level security on every table. Anonymous users can read only the published catalogue; customers only their own rows; cost price is column-restricted; operational tables (webhooks, outbox, rate limits) are unreachable from user roles.
   - `0003_auth_sync.sql`: seeds staff roles and, on Supabase, a trigger that mirrors `auth.users` into `public.users`.
4. The server connects as the database owner and performs authorization in code; customer order reads also run through RLS as that customer (`withUserRls`). On Supabase the `postgres` role can `SET ROLE authenticated`; on self-hosted Postgres grant it: `grant authenticated to <app_user>;`.
5. **Do not run `db:seed` in production.** It loads sample products and placeholder images. Create real products in admin.

## 3. Authentication (Supabase Auth)

1. Authentication > Providers > Email: enable, require email confirmation, set minimum password length to 10.
2. Authentication > URL configuration: Site URL = `APP_URL`; add `APP_URL/auth/callback` to redirect URLs.
3. **Google**: create an OAuth client in Google Cloud Console (Web), authorised redirect URI `https://<project>.supabase.co/auth/v1/callback`; paste the client id and secret into Supabase.
4. **Apple**: needs an Apple Developer account (paid), a Services ID, a key, and your domain verified with Apple. Follow Supabase's Apple guide.
5. **Facebook**: supported by the code (`provider=facebook`) but not shown on the login page. Add it only if your customers ask for it; it requires Meta app review and adds a data processor.
6. **Magic links** use Supabase's PKCE flow (single use, one hour). They appear automatically when Supabase auth is on.
7. **MFA**: Authentication > Multi-factor: enable TOTP. Staff enrol from Account > Password and security. With `ADMIN_REQUIRE_MFA=true`, admin is blocked until they do.
8. Customise the Supabase email templates (confirm signup, reset password, magic link) with your brand and sender domain (SMTP settings > use Resend SMTP).
9. First admin: sign up normally on the live site, then run `DATABASE_URL=... npm run db:grant-role -- you@yourdomain.in super_admin`. There is no default admin password anywhere.

## 4. Payments (Razorpay)

1. Create a Razorpay account, complete KYC, and enable the payment methods you want (UPI, cards, net banking, wallets). EMI and "Pay Later" need separate approval; the checkout rejects EMI until you wire it.
2. Dashboard > Account & Settings > API keys: generate **test** keys first. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
3. Dashboard > Webhooks > Add: URL `https://<your-domain>/api/webhooks/razorpay`, a strong secret (set as `RAZORPAY_WEBHOOK_SECRET`), and these events:
   `payment.authorized`, `payment.captured`, `payment.failed`, `order.paid`, `refund.processed`, `refund.failed`, `payment.dispute.created`, `payment.dispute.won`, `payment.dispute.lost`.
4. How the flow works:
   - Checkout sends only choices (variants, address, coupon code, delivery method). The server recalculates the total, reserves stock, creates the order, and creates a Razorpay order for that exact amount.
   - The browser opens Razorpay Checkout for the server-created order id.
   - On success the browser posts `order_id|payment_id|signature` to `/api/payments/verify`. The server checks the HMAC signature **and** fetches the payment from Razorpay to confirm amount and status before marking the order paid.
   - Webhooks are verified against the raw body, stored in `webhook_events`, and processed once per event id (duplicates are acknowledged and ignored).
   - Payment is auto-captured (`payment_capture: 1`). Stock is held for 30 minutes; a retry re-holds it without creating a new order. A payment that arrives after the hold lapsed is still recorded; if stock is gone the order is flagged for review.
   - Refunds (full or partial) go through Razorpay with an idempotency key from the admin order page.
5. Run the end-to-end checkout in test mode (Razorpay test cards and UPI `success@razorpay`), including a failure, a refund, and a duplicate webhook replay from the dashboard. **This has not been done from the development environment; do it before switching to live keys.**
6. Go live: swap to live keys and a new live-mode webhook secret.

## 5. Email (Resend)

1. Add and verify your sending domain (SPF, DKIM, DMARC records) in Resend.
2. Set `RESEND_API_KEY` and `EMAIL_FROM="Kyveron <orders@yourdomain.in>"`.
3. Emails sent: order confirmation, payment failed (with retry link), shipped (with tracking), out for delivery, delivered, cancellation, refund started/processed, return updates, back in stock, support ticket receipt, and (local driver only) verify email and password reset. Every email is written to `email_outbox` first and deduplicated, so webhook retries never double-send.

## 6. Images (Supabase Storage)

1. Storage > New bucket `media`, **public** (product and editorial images are public). Return evidence is also written here under `returns/` but is only ever served through `/api/media/*`, which requires staff with returns access. If you prefer, create a separate private bucket and adjust `src/lib/storage.ts`.
2. Uploads are checked by size (8 MB) and magic bytes (JPEG, PNG, WebP, AVIF only; no SVG). File names are generated on the server.
3. Next.js Image optimises and serves AVIF/WebP at responsive sizes; the Supabase host is allowed automatically from `NEXT_PUBLIC_SUPABASE_URL`.

## 7. Scheduled jobs

Call these with `Authorization: Bearer $CRON_SECRET` (Vercel Cron, GitHub Actions schedule, or any scheduler):

| Endpoint | Frequency | Does |
|---|---|---|
| `POST /api/cron/reservations` | every 5 minutes | Releases lapsed stock holds; cancels orders unpaid for 24 hours. |
| `POST /api/cron/email` | every 10 minutes | Retries failed emails (max 5 attempts). |

## 8. Deployment

**Vercel**: import the repo, set the root directory to `kyveron`, add the environment variables, and add the two cron jobs. Use the pooled Supabase connection string.

**Docker / VPS**: `docker build -t kyveron ./kyveron` then run with the environment variables; the image runs as a non-root user on port 3000. Put it behind a TLS-terminating proxy that sets `X-Forwarded-For`. `docker-compose.yml` runs a local stack with Postgres.

In both cases: set `APP_ENV=production` and `APP_URL` to the https URL. The app refuses to boot in production with mock payments, local auth, local storage, or a missing webhook secret.

## 9. Security summary

- Authorization on the server for every page, action, and API route; admin permissions are role-based (`src/lib/auth/roles.ts`), checked again inside each action, and non-staff get a 404 for `/admin`.
- RLS on every table as defence in depth.
- CSP with per-request nonces (`src/proxy.ts`), HSTS, frame denial, strict referrer, permissions policy.
- Server Actions verify Origin; JSON route handlers call `assertSameOrigin`; cookies are `HttpOnly`, `SameSite=Lax`, `Secure` on https.
- Postgres-backed rate limits on login, signup, password reset, checkout, coupons, tracking, contact, newsletter, uploads, and reviews. Account lockout after 5 failed logins (local driver); Supabase applies its own.
- Zod validation on all inputs; parameterised SQL everywhere; stored content rendered through a Markdown subset that never interprets HTML.
- Order pages require the owner's session or a signed per-browser access cookie; tracking needs order number plus email or mobile.
- No card data touches the server. Secrets are redacted from audit logs; errors shown to users never include internals.
- CI runs `npm audit`, lint, type checks, unit and integration tests against Postgres, a production build, and Playwright tests. Dependabot is configured.

## 10. Launch checklist (Owner)

- [ ] Business legal name, address, GSTIN, support contacts, grievance officer (`src/lib/config/store.ts`).
- [ ] GST slabs, HSN codes, and invoice format confirmed by a chartered accountant (`TAX` in `store.ts`, `/api/orders/[id]/invoice`).
- [ ] All legal pages written or approved by a qualified Indian lawyer (Terms, Privacy, Cookies, Shipping, Returns, Refunds, Cancellation, Payments, Grievance). Untick "pending legal review" in admin once approved; set version and effective date.
- [ ] Shipping fees, free-shipping threshold, courier SLAs, and return window/exclusions confirmed.
- [ ] Real product photography, hero poster, and optional hero video (see section 11).
- [ ] Size charts measured from real garments (`src/lib/config/sizes.ts`).
- [ ] Quality-check copy on the home page replaced with your real process (Admin > Content > Homepage). Seed product copy reviewed for accuracy.
- [ ] Razorpay test-mode end-to-end pass, then live keys.
- [ ] Remove seed data; create staff accounts with least-privilege roles and MFA.
- [ ] Analytics tool (only after cookie consent) if you want conversion rates; the dashboard does not estimate them.
- [ ] Courier serviceability API for delivery estimates (replace `src/lib/delivery.ts`).

## 11. Hero video (optional)

The home hero supports a scroll-scrubbed video on desktop (phones, portrait tablets, and reduced-motion visitors always get the still poster). Encode with a short keyframe interval or scrubbing stutters:

```bash
ffmpeg -i raw.mp4 -c:v libx264 -crf 18 -preset slow -g 8 -keyint_min 8 -pix_fmt yuv420p -movflags +faststart -an public/media/hero-scrub.mp4
ffmpeg -i public/media/hero-scrub.mp4 -frames:v 1 -q:v 2 hero-poster.jpg
```

Aim for 4 to 8 MB for a 6-second 1080p clip. In Admin > Content > Homepage set the video path and its byte size, upload the poster, preview, and publish. The page stays complete if the video fails to load.
