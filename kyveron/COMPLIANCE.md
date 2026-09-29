# Compliance checklist

Status of the 20 launch items for the Kyveron storefront (items 20 and 24, "data deletion
request", are the same item). "Done" means the change is in the code and was checked in a
browser. "You" lists what only the business can supply. Every legal text is a **draft for
review by a qualified Indian lawyer**; nothing here is legal advice.

Everything the business must fill in lives in one file: **`src/lib/business.ts`** (legal
name, address, GSTIN/CIN, support and privacy contacts, Grievance Officer, country of origin).
Until then those values show on the site in `[square brackets]`.

| # | Item | Status | Where | You |
|---|---|---|---|---|
| 1 | Privacy policy | Done: DPDP Act 2023 / IT Act structure: data collected, purposes, processors, retention, rights, children, security, grievance | `/privacy` (`src/pages/Legal.tsx`) | Name the real processors, retention periods, reply time; legal review |
| 2 | Terms of service | Done: seller identity, 18+, pricing incl. GST, order acceptance, cancellation, reviews, liability, grievance, governing law | `/terms` | Jurisdiction city; legal review |
| 3 | Refund policy | Done: free cancellation before dispatch, return window from settings, free pickup, no restocking fee, refund timelines, COD refunds, failed payments | `/refund-policy`, `/returns` | Damage-report window; legal review |
| 4 | Cookie policy | Done: lists every item actually stored (2 localStorage keys, no cookies), third-party requests, how to change choice | `/cookie-policy` | Update the table if you add any tool |
| 5 | Cookie consent banner | Done: Reject and Accept equally prominent, nothing pre-ticked, per-category choice, choice saved, reopen via footer "Cookie settings", `useConsent()` gate for future SDKs | `CookieBanner` in `src/components/Layout.tsx`, `src/lib/store.tsx` | Load any future analytics only behind `useConsent('analytics')` |
| 6 | Check form consents | Done: checkout and sign-up require separate unticked Terms and 18+ boxes; marketing is a separate optional unticked box; the bundled "consent to SMS/email" line removed; newsletter needs explicit opt-in; contact form states purpose | Checkout, `/register`, newsletter, `/contact` | Store consent records server-side when a backend exists |
| 7 | No unnecessary data | Done: phone optional at sign-up (required only at checkout, with the courier reason shown); no DOB, gender or IDs collected; cart/orders kept in memory only | `src/pages/Account.tsx`, checkout | Keep it that way in the backend |
| 8 | Audit third-party SDKs | Done: removed 8 unused packages (Supabase, dnd-kit, recharts, confetti, date-fns, uuid + types) and the unused Playfair font; Inter now self-hosted (Google Fonts removed); no analytics/ads/social SDKs | `package.json`, `index.html`, see audit below | Host product images yourself (see #19) |
| 9 | Remove dark patterns | Done: "by continuing you agree" cookie text removed, fake "Quick View" removed, "Buy Now" now really goes to checkout, placeholder "was" prices and Sale badges removed, dead buttons (social login, forgot password, add address, change password) removed, delete-account button now works | Various | Only show "was" prices you actually charged |
| 10 | Remove hidden fees | Done: 5% "tax" was being **added on top** of GST-inclusive prices; totals are now items − discount + delivery (+ COD fee only if chosen, shown before ordering). One totals component everywhere; delivery thresholds from settings | `calculateCart` in `src/lib/store.tsx`, `CartTotals` | None |
| 11 | Remove fake reviews | Done: 8 placeholder reviews and all invented ratings/review counts removed; stars only appear with real reviews; admin can no longer write reviews (moderation only, with a "never remove for being negative" rule); storage key bumped so old copies are discarded | `src/lib/dynamicStore.tsx`, `Rating` component, Admin → Reviews | Collect reviews only from verified buyers |
| 12 | Remove unsupported claims | Done: removed "moisture-wicking technology", "we test every material for pilling…", "response within 24 hours", "secure checkout powered by Razorpay" (not integrated), "confirmation email sent", "Crafted in India", "All actions are logged", per-PIN delivery promise; product images labelled as AI illustrations | Product data, About, checkout, footer | Confirm the fabric/GSM specs match the real garments; add only claims you can evidence |
| 13 | Accessibility alt text | Done: meaningful images described, decorative ones `alt=""`, gallery thumbnails labelled, AI images disclosed | All pages | Write real alt text when real photos arrive |
| 14 | Fix colour contrast | Done: secondary text `#AAA394` (2.2:1) → `#6B665B` (4.9:1) on light backgrounds; field borders → `#8A8577` (3.2:1); cobalt label on black → `#8FB0EA`; header no longer transparent over the hero | Global | Keep `#AAA394` for dark backgrounds/decoration only |
| 15 | Keyboard navigation | Done: skip link, visible focus on all inputs (removed `outline-none`), focus trap + Escape + focus return in cart, menu, filters and size guide, no nested interactive elements, wishlist button reachable, `aria-pressed`/`aria-expanded`, labelled fields and errors, focus moves to new page on navigation | `useDialog` in `Layout.tsx` + all forms | None |
| 16 | Add business details | Done: seller and Grievance Officer blocks in footer, contact page and every policy; country of origin and "sold by" on product pages | `src/lib/business.ts` | **Fill in every `[placeholder]`** |
| 17 | Age consent for kids' data | Done: 18+ confirmation required at sign-up, checkout and newsletter; children's section in privacy policy (no tracking/targeting of children; verifiable parental consent before any under-18 feature) | Forms, `/privacy` | None |
| 18 | Unsubscribe link in emails | Done: marketing template with one-click unsubscribe link + `List-Unsubscribe` headers spec; `/unsubscribe` page; marketing toggle in Account → Settings | `emails/`, `/unsubscribe` | Implement the server endpoint when email goes live (`VITE_UNSUBSCRIBE_ENDPOINT`) |
| 19 | License fonts/images | Partly: fonts (OFL) and icons (ISC) self-hosted and credited on `/credits`. **Product images are AI-generated with Qwen and hot-linked from image.qwenlm.ai**; rights not confirmed | `/credits` | Confirm Qwen output rights or replace with owned/licensed photos, and host them yourself |
| 20 / 24 | Data deletion request | Done: instant "delete data in this browser" (clears storage and state, re-asks consent); account deletion in Account → Settings; request form for access/correction/deletion/withdrawal/nomination/grievance | `/data-request`, Account → Settings | Implement the server endpoint (`VITE_PRIVACY_REQUEST_ENDPOINT`); until then the form opens a pre-filled email to `privacyEmail` |

## Verification (29 Sep 2026)

- `tsc --noEmit` and `vite build` pass.
- axe-core (WCAG 2.1 A/AA + best practice) on 25 routes: **0 serious or critical** issues.
  Remaining minor finding: `heading-order` on pages where product card titles are `h3` under the page `h1`.
- Browser checks (Playwright): banner shown, reject/accept equal size, nothing pre-ticked,
  choice survives reload, footer reopens it; skip link; cart drawer traps focus and returns it;
  cart total equals item price (no added tax); order blocked until Terms + 18+ ticked; COD fee
  shown before ordering; honest confirmation; phone optional; browser data deletion clears storage.

## Third-party audit

| Dependency / service | Runs in visitor's browser | Sends data to a third party | Notes |
|---|---|---|---|
| React, React DOM, React Router, Framer Motion, Lucide | Yes (bundled) | No | MIT / ISC |
| Inter via `@fontsource-variable/inter` | Yes (bundled) | No | OFL 1.1; replaced Google Fonts |
| GitHub Pages (hosting of this preview) | n/a | Request logs (IP) | Listed in privacy and cookie policies |
| image.qwenlm.ai (product images) | Yes | IP address on each image request | **Replace by self-hosting** |
| Analytics / ads / social pixels | None installed | No | Must be consent-gated if added |

`npm audit --omit=dev`: 2 moderate advisories in `react-router` 6.x (open redirect via
backslash URLs in `<Link>`/`useNavigate`; SSR `deserializeErrors`). Fixed only in v7. This
site passes only fixed internal paths to `<Link>`/`navigate` and doesn't use SSR, so neither
is reachable today. Upgrade to v7 when convenient.

## Known limits of this preview

The storefront is frontend-only. Accounts, carts and orders live in the browser tab, payments
and email are not connected, and the admin sign-in is checked in the browser (its password is
in the JavaScript bundle), so the admin screen must not be relied on for security. Admin edits
affect only the browser they were made in. Before selling: add a backend (auth, orders,
payments, consent records, data-request and unsubscribe endpoints), fill in `business.ts`, and
have the policies reviewed.
