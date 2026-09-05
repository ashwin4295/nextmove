# PLAN-M-I.md — NextMove milestone I: pilot cap of 50 + end-of-conversation feedback

Work inside THIS repo only. Keep every other route, event, payment and WhatsApp behaviour exactly as is. Do not touch `.env.local`, `docs/`, `src/lib/extract.ts`, `src/lib/script.ts`. No new dependencies. Follow `docs/DESIGN.md` (radius 0, mono eyebrows, serif headings, forest accent, no em dashes in visible copy). Copy below is FINAL. Commit with message `feat: milestone I — pilot cap + feedback` ending with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`. DO NOT push. Stop after the commit.

## I1. Pilot cap (total, not daily)
- `src/lib/caps.ts`: add `pilotStarted: number` to `Caps`; add `kind: "pilot"` to `capsExceeded`, checking `caps.pilotStarted >= envCap("PILOT_CAP", 50)`.
- `convex/sessions.ts` `caps` query: also return `pilotStarted` = count of ALL sessions where `startedAt` is a number (use the `by_startedAt` index with `gte("startedAt", 0)`; do not scan without an index). Add a new query `pilotStatus` with no args returning `{ started: number, cap: number }` where `cap` is NOT read from env in Convex (Convex has no Vercel env); return only `started` and let the Next.js side compare against `PILOT_CAP`.
- `src/lib/convexClient.ts`: extend the `Caps` fallback paths (memory store and the catch path) so `pilotStarted` is always a number (memory store = count of sessions with a `startedAt`). Add `pilotStarted()` on the store, returning that count (Convex: `pilotStatus.started`; memory: same count).
- `src/app/api/session/route.ts`: check the pilot cap FIRST, before the email cap and before creating any row: if `capsExceeded(caps, "pilot")` return `NextResponse.json({ error: "pilot_full" })` with status 200 and do NOT create a session. Keep the existing email and daily checks after it, unchanged.
- New route `src/app/api/pilot/route.ts` (GET, `force-dynamic`): returns `{ full: boolean, started: number, cap: number }` using `store.pilotStarted()` and `envCap("PILOT_CAP", 50)`.
- `src/app/talk/[id]/TalkClient.tsx`: no change (sessions that already exist keep working).

## I2. Landing when the pilot is full
- `src/app/landing.tsx` is a client component. On mount, fetch `/api/pilot`. While loading, render the form as today. If `full` is true, replace the form (inputs and the primary button) with a paper plate (1px rule border, 24px padding, radius 0) containing:
  - Eyebrow: `PILOT CLOSED`
  - Serif line (1.75rem/1.25): `The first fifty conversations are taken.`
  - Body (1.0625rem): `We opened NextMove to fifty people to learn what a ten-minute coaching conversation should be. Those seats are full. Leave your email and we will write to you if we open the next fifty.`
  - A single-line email form: mono label `EMAIL`, input, secondary button `KEEP ME POSTED →`. On submit POST `/api/waitlist` with `{ email, source }`; on success replace the form with the body line `Noted. We will write to you first.` On error show `Something went wrong. Try again.`
  - Keep the two small lines under the form removed in this state.
- Also handle the `pilot_full` error from `/api/session` the same way (in case the cap fills between page load and submit): swap the form for the same plate.
- The nav button `START A CONVERSATION →` and the closing-section button: when `full`, both scroll to the plate instead of the form (same anchor `#start`).

## I3. Waitlist
- `convex/schema.ts`: new table `waitlist` with `{ email: v.string(), source: v.string(), createdAt: v.number() }`, index `by_email` on `email`.
- `convex/sessions.ts` (or a new `convex/waitlist.ts`): mutation `joinWaitlist({ email, source })` that inserts once per lowercased email (no duplicates), returns `{ ok: true }`.
- `src/lib/convexClient.ts`: `joinWaitlist` on the store, memory fallback = a Set.
- New route `src/app/api/waitlist/route.ts` (POST): validates the email with the same check the session route uses, calls `store.joinWaitlist`, returns `{ ok: true }`. Track PostHog server-side is not needed; the client fires `track("waitlist_joined", { source })` on success using the existing `track` helper.
- `/admin`: add a `waitlist` counter (count of rows) next to the existing counters. Add a `pilot` line: `pilot 17 / 50` using `store.pilotStarted()` and `PILOT_CAP`.

## I4. Feedback at the end of the conversation
- `convex/schema.ts`: add optional fields on `sessions`: `feedbackScore: v.optional(v.number())` (1 to 5), `feedbackText: v.optional(v.string())`, `feedbackAt: v.optional(v.number())`.
- `convex/sessions.ts`: mutation `setFeedback({ id, score, text })` (score clamped 1 to 5, text trimmed, max 600 chars).
- `src/lib/convexClient.ts`: `setFeedback` on the store + memory fallback; include `feedbackScore` and `feedbackText` in the `get` result and in `listRecent` rows.
- New route `src/app/api/feedback/route.ts` (POST `{ id, score, text }`): validates, calls `store.setFeedback`, returns `{ ok: true }`.
- `src/app/r/[id]/RoadmapView.tsx`: add a ruled section AFTER the first-message card and BEFORE "THE OTHER DOORS" (so it sits where the reader has just seen the main output). Eyebrow `ONE QUESTION`. Serif line (1.5rem): `Was that worth ten minutes of your time?` Five square buttons in a row, radius 0, 1px ink outline, mono labels `1` `2` `3` `4` `5`, with small muted mono captions under the row: `NOT REALLY` on the left, `VERY` on the right. Selecting a score fills that button forest with canvas text and reveals a textarea (radius 0, 1px muted border, 3 rows) with the mono label `WHAT WOULD HAVE MADE IT BETTER?` and a secondary button `SEND →`. On send POST `/api/feedback`; replace the whole section with the body line `Thank you. This goes straight to the person building NextMove.` Fire `track("feedback_given", { session_id: id, score })`. If the stored session already has `feedbackScore`, render the thank-you line instead of the form. The score alone (without text) is also saved immediately on click, so a reader who leaves after tapping a number still counts.
- `/admin` recent-sessions table: add a `fb` column showing `score` (or a dot when absent), and show the text on hover via `title`.

## I5. Verification
- `npm run build`, `npm run lint`.
- With `PILOT_CAP=1` in a local `.env.local` override (do not commit) and one started session in the memory store, confirm `/` shows the closed plate and `/api/session` returns `pilot_full`. Then remove the override.
- Feedback: on a stored session's `/r/[id]`, click a score, type text, send, reload, confirm the thank-you line persists.
- Write `MILESTONE-I-REPORT.md`: verified, not verified, deviations with reasons.
