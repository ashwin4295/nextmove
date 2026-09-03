# PLAN-M-E.md — NextMove milestone E: per-session Razorpay payment links with notes

Work inside THIS repo only. Keep everything else working. Do not touch `.env.local`, `convex/_generated`, `docs/`. No new dependencies (use `fetch`). Commit with message `feat: per-session Razorpay links with session notes and paid state` ending with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`. DO NOT push. Do not run `npx convex dev`. No em dashes in visible copy.

Env available: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (server only), `NEXT_PUBLIC_PAY_LINK` (fallback fixed link). Read the Razorpay docs page https://razorpay.com/docs/api/payments/payment-links/create-standard/ before writing the request.

## E1. `POST /api/pay` (new, `src/app/api/pay/route.ts`, `maxDuration = 30`)
Body `{ id }`. Load the session via `store.get`. If `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set:
- `POST https://api.razorpay.com/v1/payment_links` with Basic auth (`base64(key_id:key_secret)`), JSON:
  `{ amount: 9900, currency: "INR", accept_partial: false, description: "NextMove Pack", reference_id: id, customer: { name: session.name ?? undefined, email: session.email ?? undefined }, notify: { sms: false, email: false }, reminder_enable: false, notes: { session_id: id, email: session.email ?? "", source: session.source ?? "" }, callback_url: `${origin}/r/${id}?paid=1`, callback_method: "get" }`
  where `origin` = `new URL(req.url).origin`. `reference_id` must be ≤ 40 chars; session ids are shorter than that, but slice to 40 defensively. Omit `customer` fields that are empty.
- Cache: if the session already has `payLinkUrl`, return it instead of creating another (store it via a new mutation `setPayLink({id, url, linkId})`; mirror in the memory store; add optional `payLinkUrl`, `payLinkId`, `paid: boolean` fields to the Convex schema).
- Return `{ url }` (the `short_url` from Razorpay).
If keys are missing, or Razorpay returns an error (log it with `console.error`), return `{ url: NEXT_PUBLIC_PAY_LINK + "?client_reference_id=" + id }` when the fallback is set, else `{ error: "no_pay" }` with status 503.

## E2. Result page button
"Get the pack" now: fires `pay_clicked` (existing), shows "Opening Razorpay…" on the button, POSTs `/api/pay`, opens `url` in a new tab (fallback: same tab if the popup is blocked), restores the label. On `{error}` show inline "Payments are not available right now." Keep the ₹99 line.

## E3. Paid state
- `src/app/r/[id]/page.tsx`: read `searchParams`. If `paid=1` and `razorpay_payment_link_status === "paid"` and `razorpay_payment_link_reference_id === id`: call `store.markPaid({ id, paymentId: razorpay_payment_id })` (new mutation; mirror in memory store; idempotent) and render the pack card in its paid state: title "Your pack is on its way", body "Thank you. The three messages and your two-week plan will reach your email within 24 hours. Reply to that email if anything reads wrong." No button. Fire `pack_paid` from the client once (guard with sessionStorage).
- If the session is already `paid`, always render the paid state.
- Signature verification is NOT required for this milestone (the callback is only used to flip a UI state; fulfilment is manual). Note this in the report.

## E4. Admin
Add a `paid` counter (sessions with `paid === true`) and a `paid` column to the last-25 table.

## E5. Verification before commit
- `npm run build`, `npm run lint` pass with and without the Razorpay keys.
- With keys present in `.env.local`, run `npm run dev`, open a result page, click "Get the pack", confirm a Razorpay link opens whose page shows "NextMove Pack" and ₹99 (do NOT pay). Then open `/r/[id]?paid=1&razorpay_payment_link_status=paid&razorpay_payment_link_reference_id=[id]&razorpay_payment_id=pay_test` and confirm the paid state renders and persists on reload without the query string.
- Write `MILESTONE-E-REPORT.md`: verified, not verified, deviations with reasons, and the exact Razorpay response fields used.

Stop after the commit.
