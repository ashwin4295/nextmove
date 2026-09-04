# Milestone G report

Launch hardening: production domain, dead-link cleanup, spend caps, verified Razorpay fulfilment, pack generation, privacy/terms, and Cartesia as the default voice. `.env.local`, `convex/_generated`, and `docs/` were not edited. No new dependencies (`fetch` only). `npx convex dev` was not run. Not pushed.

## Verified

`npm run lint` and `npm run build` pass with Razorpay keys present in `.env.local`, and again with `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` unset in the shell. Build logged `store: convex`. New routes in the table: `/api/started`, `/privacy`, `/terms`, `/_not-found`.

Against `npm run dev` at `http://localhost:3011`:

- `GET /r/x` and `GET /talk/x` return HTTP 404. The not-found page copy is present: "That link doesn't go anywhere.", "The page may have been mistyped, or the conversation was never finished.", and "Start a conversation".
- `GET /admin` without `?key=` returns HTTP 401 with a plain `Unauthorised` body.
- Landing footer links are Privacy (`/privacy`), Terms (`/terms`), and GitHub only. "Talk to Ashwin", Calendly, and "Built during GrowthX Build Week, September 2026" are gone. `grep -r calendly src` returns nothing.
- Hero small line and FAQ "What does it cost?" show "Try for free till September 6". FAQ answer continues "A paid pack with more drafted messages is ₹99."
- `/privacy` and `/terms` render the final copy, serif H1, 720px column, and "Last updated 5 September 2026."
- Landing HTML includes `rel=canonical` and `nextmove.thedirectorloop.com`.
- Caps, `PER_EMAIL_CAP=1` in the shell: first `POST /api/session` for a new email returned `{ id }`; `POST /api/started` then a second session for the same email returned `{ error: "email_cap" }` with HTTP 200.
- Caps, `DAILY_CAP=0` in the shell: `POST /api/session` returned `{ id, error: "daily_cap" }` with HTTP 200. Convex `get` still had the email. `GET /talk/[id]` rendered "We're full for today. Your spot is saved and we'll email you when it opens tomorrow." and not the Ready state.
- Unverified `/r/[id]?paid=1…` callback with no `payLinkId` did not mark paid.
- Pack UI: a stored transcript/next-move session was given `__paid` and a fixture `__pack` via the existing `finish` mutation. `GET /r/[id]` rendered eyebrow YOUR PACK, three To: cards, Copy, and "Your two weeks". Admin last-25 paid column showed `paid+pack` for `gita.pack@example.com`.
- Pack generator: invoked against that stored transcript with `claude-sonnet-5`, thinking disabled, `max_tokens` 3000. Returned 3 messages (hiring manager, mentor, current manager) and 6 plan rows. First message was 100 words.

## Not verified

- A live Razorpay payment (would charge ₹99). Verification used the ignore-if-unverified callback path, plus fixture pack render and a generator invoke against a stored transcript.
- Pack email via Resend. `RESEND_API_KEY` is gated; no send was forced.
- Live Cartesia / Vapi voice (this environment cannot grant a microphone). `voiceForTier` defaults to Cartesia `sonic-2` `3b554273-4299-48b9-9aaf-eefd438e3941`; `male`, `aura`, and `eleven` match the plan. The Vapi built-in Rohan voice is gone.
- PostHog network capture with a live key (same gating as earlier milestones).
- Convex codegen / deploy (`npx convex dev` was not run). New fields and functions (`startedAt`, `pack`, `packFailed`, `markStarted`, `setPack`, `caps`, email/startedAt indexes) persist through the existing `finish` blob fallback (`__startedAt`, `__pack`, `__packFailed`, `__paid`) plus the in-process extras map until those functions are deployed.

## Deviations

| Deviation | Reason |
|---|---|
| `markStarted`, `setPack`, `caps`, and the new schema fields fall back to the roadmap blob and extras map when the new Convex functions are not on the deployment | Same pattern as `setPayLink` / `markSent` / `setProfile`. The plan forbids `npx convex dev`. |
| Admin last-25 hydrates paid/pack from `get()` when the live `listRecent` does not yet return `hasPack` | Needed so `paid+pack` is visible before the new `listRecent` shape is deployed. |
| HTTP 401 for `/admin` is enforced in `src/middleware.ts` (plain text body). The page also calls `unauthorized()` if middleware is bypassed | App Router pages cannot return a raw 401 body themselves. Next.js 16 warns that the middleware file convention is deprecated in favour of `proxy`; middleware is what actually sets status 401. |
| Pack UI was confirmed with a fixture pack on a stored session, not a paid Razorpay link | The plan allows stubbing Razorpay or unit-invoking the generator. A real charge was not made. |
| Restarted the long-running `localhost:3011` dev server so `PER_EMAIL_CAP` and `DAILY_CAP` could be set in the process | Caps are read from `process.env` on the server. Left a default (uncapped) `npm run dev` on 3011 afterwards. |
