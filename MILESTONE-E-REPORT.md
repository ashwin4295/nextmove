# Milestone E report

Per-session Razorpay payment links with notes, result-page paid state, and an admin paid counter. `.env.local`, `convex/_generated`, and `docs/` were not edited. No new dependencies (`fetch` only). `npx convex dev` was not run.

Signature verification is not required for this milestone. The Razorpay callback only flips a UI paid state. Fulfilment stays manual.

## Verified

`npm run lint` and `npm run build` pass with Razorpay keys present in `.env.local`, and again with `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `NEXT_PUBLIC_PAY_LINK` unset in the shell. Build logged `store: convex`. `/api/pay` is in the route table.

Headless Chrome against the existing `npm run dev` at `http://localhost:3011`:

- Result page `/r/j5744jft9p4n99h7jz49r4kkx18dqvkg` shows "Get the pack" and the ₹99 line (no "Coming Saturday").
- Clicking "Get the pack" POSTs `/api/pay` and receives `{ url: "https://rzp.io/rzp/VtQQ2Yo" }`. Headless Chrome blocked the popup, so the same-tab fallback opened `https://razorpay.com/payment-link/plink_TXkNddWGX1WqRD`.
- That Razorpay page shows "NextMove Pack" and "AMOUNT PAYABLE / INR 99.00". Payment was not completed.
- A second `POST /api/pay` for `/r/j573g3jfdvv4ykjm2tsj90xm2s8dpbgg` returned the cached `short_url` (`https://rzp.io/rzp/SwKyfhhX`) instead of creating another link.
- `/r/[id]?paid=1&razorpay_payment_link_status=paid&razorpay_payment_link_reference_id=[id]&razorpay_payment_id=pay_test` renders "Your pack is on its way" and the thank-you body, with no pack button. Reload without the query string still shows the paid state.
- Admin has a `paid` counter (1 after the simulated callback) and a `paid` column on the last-25 table (`yes` on the marked session).

## Not verified

- A real Razorpay checkout completed by a human (explicitly out of scope; do not pay).
- Razorpay webhook or payment-link signature verification (not required; UI-only flip).
- PostHog `pay_clicked` / `pack_paid` network capture with a live `NEXT_PUBLIC_POSTHOG_KEY` (same gating as earlier milestones).
- Convex codegen / deploy (`npx convex dev` was not run). Live `setPayLink` / `markPaid` therefore persist through the existing `finish` blob fallback (`__payLinkUrl`, `__payLinkId`, `__paid`) plus the in-process extras map until those mutations are deployed.
- Popup-unblocked "new tab" path (headless Chrome blocked `window.open`; same-tab fallback ran as specified).

## Razorpay fields used

Request to `POST https://api.razorpay.com/v1/payment_links` (Basic `base64(key_id:key_secret)`), from https://razorpay.com/docs/api/payments/payment-links/create-standard/:

- Sent: `amount` (9900), `currency` (`INR`), `accept_partial` (false), `description` (`NextMove Pack`), `reference_id` (session id, sliced to 40), `customer.name` / `customer.email` when present, `notify.sms` / `notify.email` (false), `reminder_enable` (false), `notes.session_id` / `notes.email` / `notes.source`, `callback_url` (`{origin}/r/{id}?paid=1`), `callback_method` (`get`).
- Response used: `short_url` (returned as `{ url }`), `id` (stored as `payLinkId`). On failure, `error` is logged via `console.error`.
- Callback query used (no signature check): `paid`, `razorpay_payment_link_status`, `razorpay_payment_link_reference_id`, `razorpay_payment_id`.

## Deviations

| Deviation | Reason |
|---|---|
| `setPayLink` / `markPaid` fall back to the roadmap blob and extras map when the new Convex mutations are not on the deployment | Same pattern as `markSent` / `setContact`. The plan forbids `npx convex dev`, so the live deployment still has the older function set. |
| Admin `paid` counter is `max(Convex stats.paid, extras paid)` | Until the new `stats` query is deployed, Convex returns no `paid` field. Extras keep the counter honest for sessions marked in this process. |
| Razorpay hosted page copy is "INR 99.00", not the ₹ glyph | That string is Razorpay's checkout chrome. Our result card still shows "₹99, one time." |
