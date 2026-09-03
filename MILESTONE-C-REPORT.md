# Milestone C report

Email capture, PostHog, Next Move Pack, paid link, Resend. `npx convex dev` was not run. `.env.local`, `convex/_generated`, and `docs/` were not edited. Only new dependency: `posthog-js`.

## Verified

`NEXT_PUBLIC_POSTHOG_KEY= NEXT_PUBLIC_PAY_LINK= RESEND_API_KEY= npm run lint` and the same for `npm run build` pass. Build logged `store: convex`.

Headless Chrome against `npm run dev` at `http://localhost:3010` (those three vars forced empty):

- Landing shows the required email field (`type=email`, placeholder "Your email") and the line "We email your next move so you can find it again. No newsletter." Button copy unchanged.
- Empty email is blocked by the required field (`valueMissing`). Malformed `not-an-email` is blocked (`typeMismatch`). Neither reaches `/talk/`.
- `POST /api/session` without email or with a malformed email returns 400. A valid `{ source, name, email }` returns `{ id }`.
- A valid name plus email reaches `/talk/[id]` with no name or email in the URL.
- Typed flow: Type instead, three answers, See my next move, lands on `/r/[id]`.
- After a next move is written: eyebrow GO FURTHER, card "The Next Move Pack", price "₹499, one time.", button "Coming Saturday" (not "Get the pack"). Click stays on the page.
- `/admin?key=` (real `ADMIN_KEY`): counter "signups (unique email + next move written)" and an email column. Last-25 showed `meera.pack@example.com` after that session's next move was written.

## Not verified

- PostHog network capture with a live `NEXT_PUBLIC_POSTHOG_KEY` (build and lint were required with the key unset; init is gated).
- `pay_clicked` and a live `NEXT_PUBLIC_PAY_LINK` tab. Unset path was the required browser check.
- Resend delivery with a live `RESEND_API_KEY`. Send is gated and must not block `/api/roadmap`.
- Convex codegen / deploy (`npx convex dev` was not run).
- Voice Begin plus microphone.

## Deviations

| Deviation | Reason |
|---|---|
| New Convex fields (`name`, `email`) and `countUnique` are in the repo but not on the live deployment | Plan forbids `npx convex dev`. Existing `create` / `finish` / `get` stay compatible. |
| `name` and `email` are `v.optional` | Required fields would break existing session documents. |
| Convex `create` retries with `{ source }` if extra args are rejected | Live `create` still has the pre-C signature until the operator deploys. |
| Email/name are kept in a process-local map and, on `finish`, baked onto the stored object as `__email` / `__name` | So talk-page identify, admin emails, and `countUnique` work in this process before deploy. Same fallback style as milestone B. |
| `countUnique` / email on `listRecent` fall back when the live query is missing or old | Live Convex has no `countUnique` yet. Admin verification used the fallback and showed the email. |
| "Coming Saturday" is visually disabled (`opacity-50`) but not `disabled` | A real `disabled` button cannot fire `pack_clicked`. |
| First-name is no longer put on the talk URL | Plan stores name on the session and forbids passing email via the URL. |
| Short three-answer extracts sometimes returned `Missing chosenPath` | Pre-existing model parse flake. A richer three-turn transcript wrote a next move; pack copy was verified on that page. |
| Admin is gated by `ADMIN_KEY` | It was open in milestones A/B. Verification used `?key=` with the configured key; the key was not printed. |
