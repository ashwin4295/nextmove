# PLAN-M-C.md — NextMove milestone C: rubric plumbing (email, analytics, pack, paid link)

Work inside THIS repo only. Live at https://nextmove-pi.vercel.app. Keep every route, API and Convex function working. Do not touch `.env.local`, `convex/_generated`, `docs/`. Do not run `npx convex dev`. Only new dependency allowed: `posthog-js`. Commit with message `feat: milestone C — email capture, PostHog, next-move pack, paid link` and end the message with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`. DO NOT push. Copy is FINAL; no em dashes in visible copy.

Why: the Build Week rubric scores (a) signups = email + a first-use event, (b) unique visitors from PostHog with read-only access, (c) real payments. Today the app collects only a first name and has no analytics. Fix all three tonight.

## C1. Email capture (landing form)
- Landing inline form gets a second field: email (required, `type=email`, placeholder "Your email"). Button copy unchanged. Under the form keep the existing small line and add: "We email your next move so you can find it again. No newsletter."
- `POST /api/session` accepts `{ source, name, email }`. Validate email format server-side; reject with 400 if missing.
- Convex `sessions` doc: add optional `name: string`, `email: string`. `create` stores them. Add query `countUnique()` → number of distinct emails with `roadmap != null` (that is the rubric's "signup with first-use event"). Mirror in the memory store.
- `/admin`: add a counter "signups (unique email + next move written)" using `countUnique`, and show the email column in the last-25 table.
- Both the memory store and the Convex path must keep working for old sessions without email.

## C2. PostHog
- Add `posthog-js`. Create `src/app/providers.tsx` (client) that initialises PostHog ONLY when `NEXT_PUBLIC_POSTHOG_KEY` is set: `posthog.init(key, { api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com', capture_pageview: true, person_profiles: 'identified_only' })`. Wrap the app in `layout.tsx`. With no key, nothing loads and nothing errors.
- Events (names exact): `conversation_started` (Begin or Type instead clicked), `conversation_finished` (POST /api/roadmap succeeded), `next_move_written` (output page rendered with a next move), `message_copied`, `message_sent`, `page_shared`, `pack_clicked`, `pay_clicked`. Include `session_id` and `source` as properties. On `conversation_started`, call `posthog.identify(email)` when email is known (pass it from the session page via a server-fetched prop, never from the URL).
- Add a `?src=` reader that stores the source in `sessionStorage` on first landing so later events carry it.

## C3. The Next Move Pack (the thing that can be paid for; generated, not human hours)
On `/r/[id]`, after the "Your next 30 days" card, add a section, eyebrow "GO FURTHER", card title "The Next Move Pack", body: "Three more messages written for you: one to a hiring manager in that world, one to a mentor you admire, and one to your current manager for the internal version of this move. Plus a two-week follow-up plan and a re-run of this conversation after you have had the first one." Price line: "₹499, one time." Button: primary "Get the pack" → if `NEXT_PUBLIC_PAY_LINK` is set, open it in a new tab with `?client_reference_id=<session id>` appended (or `&` if the link already has a query) and fire `pay_clicked`; if unset, show the button as "Coming Saturday" disabled and fire `pack_clicked` on click. Do NOT build pack generation now; the button and the event are the deliverable.

## C4. Email the next move (Resend, only if `RESEND_API_KEY` is set)
- On successful `POST /api/roadmap`, if `RESEND_API_KEY` and the session email exist, send one plain-text email from `NextMove <nextmove@mbbprep.com>`: subject "Your next move: {chosenPath.name}", body: the headline, the chosen path with realism, the first message in full, the link to `/r/[id]`, and the line "Reply to this email if the message reads wrong. A human reads replies." Use `fetch('https://api.resend.com/emails', …)` directly, no SDK. Failures are logged and never block the response.

## C5. Verification before commit
- `npm run build` and `npm run lint` pass with NO PostHog key, NO pay link, NO Resend key set.
- Browser: landing rejects an empty or malformed email; a valid one reaches `/talk/[id]`; typed flow with three answers reaches `/r/[id]`; "Get the pack" shows "Coming Saturday"; `/admin?key=` shows the new signup counter and emails.
- Write `MILESTONE-C-REPORT.md`: verified, not verified, deviations with reasons.

Stop after the commit.
