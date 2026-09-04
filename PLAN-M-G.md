# PLAN-M-G.md — NextMove milestone G: launch hardening

Work inside THIS repo only. Keep everything from milestones A to F working. Do not touch `.env.local`, `convex/_generated`, `docs/`. No new dependencies (use `fetch`). Commit with message `feat: launch hardening — domain, caps, verified payments, pack fulfilment, privacy, voice` ending with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`. DO NOT push. Do not run `npx convex dev`. No em dashes in visible copy. Copy below is FINAL.

Facts: production URL is now `https://nextmove.thedirectorloop.com`. Convex production is `https://brave-parakeet-842.convex.cloud` (Vercel already points at it; local `.env.local` still points at the dev deployment, that is fine for your verification). Env available in production: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `ANTHROPIC_API_KEY`, `APIFY_TOKEN`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_PAY_LINK`, `ADMIN_KEY`; `RESEND_API_KEY` may be absent, all email must stay gated on it.

## G1. Dead links and broken ids
- Remove "Talk it through with Ashwin" from the result page actions and "Talk to Ashwin" from the landing footer. Remove every Calendly URL from the codebase.
- `/r/[id]` for an unknown or malformed id: catch the store error and call `notFound()`. Add `src/app/not-found.tsx` in the design system: H1 "That link doesn't go anywhere.", body "The page may have been mistyped, or the conversation was never finished.", primary button "Start a conversation" → `/`.
- `/talk/[id]` for an unknown id: server-check the session; if missing, `notFound()`.
- `/admin` without a valid `?key=` when `ADMIN_KEY` is set: return HTTP 401 with a plain "Unauthorised" body, not a 200.

## G2. Copy
- Everywhere "Free till Sep 8 2026" appears (hero small line, FAQ "What does it cost?"): replace with "Try for free till September 6". FAQ answer becomes: "Try for free till September 6. A paid pack with more drafted messages is ₹99."
- Landing footer: remove "Built during GrowthX Build Week, September 2026". Footer links become: "Privacy" → `/privacy`, "Terms" → `/terms`, "GitHub" → https://github.com/ashwin4295/nextmove.
- `README.md`: remove the "Build Week log" section and the Build Week line under the title; replace the title line with "Live: https://nextmove.thedirectorloop.com". Keep everything else.
- `src/app/layout.tsx`: `metadataBase` = `https://nextmove.thedirectorloop.com`; `openGraph.url` likewise. OG image bottom-right text becomes `nextmove.thedirectorloop.com`. Add `<link rel="canonical">` via metadata `alternates.canonical`.

## G3. Voice
Default voice becomes Cartesia: `{ provider: "cartesia", voiceId: "3b554273-4299-48b9-9aaf-eefd438e3941", model: "sonic-2" }`. `NEXT_PUBLIC_VOICE_TIER === "male"` → `{ provider: "cartesia", voiceId: "638efaaa-4d0c-442e-b701-3fae16aad012", model: "sonic-2" }`; `"aura"` → `{ provider: "deepgram", model: "aura-2", voiceId: "thalia" }`; `"eleven"` unchanged. Remove the Vapi built-in "Rohan" option.

## G4. Spending guard
- New Convex field `startedAt: number | null` on sessions; new mutation `markStarted({id})`; new query `caps({ email })` → `{ emailStarted: number, todayStarted: number }` where "today" is the UTC day. Mirror in the memory store.
- `POST /api/started` (new): body `{ id }`; sets `startedAt` if null. The talk client calls it when Begin or "Write it out instead" is clicked, before starting Vapi.
- `POST /api/session`: before creating, read caps for the email. If `emailStarted >= PER_EMAIL_CAP` (env, default 3) → return `{ error: "email_cap" }` 200. If `todayStarted >= DAILY_CAP` (env, default 60) → still create the session (so the email is captured) but return `{ id, error: "daily_cap" }`.
- Landing: on `email_cap` show inline "You've used your three free conversations. Reply to your result email and we'll open another." On `daily_cap` show inline "We're full for today. Your spot is saved and we'll email you when it opens tomorrow." and do not navigate.
- Talk page: if the session's caps are exceeded at load (recheck server-side), render the same daily-cap message instead of the Ready state.

## G5. Verified payment and automatic pack fulfilment
- On the `/r/[id]?paid=1…` callback, BEFORE marking paid: call `GET https://api.razorpay.com/v1/payment_links/{payLinkId}` with Basic auth and require `status === "paid"`. If not paid, ignore the callback. If the session has no `payLinkId`, ignore.
- On verified paid (first time only): generate the pack server-side with `claude-sonnet-5` (thinking disabled, max_tokens 3000) from the stored transcript and next move: JSON `{ messages: [{ to: "A hiring manager in that world", body }, { to: "A mentor you admire", body }, { to: "Your current manager, the internal version", body }], plan: [{ day: "Day 1–3", action }, …up to 6 rows across two weeks] }`. Rules in the prompt: first person, the user's own phrasing, 70–120 words per message, no flattery, no exclamation marks, no dashes, each message ends with an easy no. Store as `pack` on the session (new optional field; mutation `setPack`).
- Result page paid state renders the pack: eyebrow "YOUR PACK", three message cards each with "To:" line, body, Copy button; then "Your two weeks" table. If generation failed, keep the existing "on its way" copy and log.
- Email (only if `RESEND_API_KEY`): send the pack as plain text to the session email, from `NextMove <nextmove@mbbprep.com>`, subject "Your Next Move Pack", body = the three messages and the plan, plus the result link. Failures logged, never thrown.
- Admin: `paid` column shows `paid`, `paid+pack`, or `paid, pack failed`.

## G6. Privacy and terms pages (`/privacy`, `/terms`, design system, 720px column, serif H1)
`/privacy` H1 "Privacy" then these sections, copy FINAL:
- "What we collect": "Your first name and email. Your LinkedIn URL if you give it. The transcript of your conversation, typed or spoken. The result we write for you. If you buy the pack, Razorpay's payment reference; we never see your card or UPI details."
- "Audio": "Your voice is processed live by our voice providers to run the conversation. NextMove does not store recordings."
- "Who processes it": "Vapi, Deepgram and Cartesia for the live voice; Anthropic for the coaching model; Apify to read a public LinkedIn profile when you give the link; Convex and Vercel to host the app and store your data; PostHog for product analytics without transcripts; Razorpay for payments; Resend for email. None of them are permitted by us to train models on your data."
- "Sharing": "Your result page is private unless you share the link. Anything you ask the coach to keep private never appears on the shareable card. We never contact anyone on your behalf."
- "Retention and deletion": "We keep your transcript and result so your page keeps working. Email nextmove@mbbprep.com from the address you used and we delete everything within seven days."
- "Analytics": "We record which buttons you use and where you came from. We do not send your transcript to analytics."
- "Contact": "nextmove@mbbprep.com"
- Footer line: "Last updated 5 September 2026."
`/terms` H1 "Terms" then, copy FINAL:
- "What this is": "NextMove is an AI coaching conversation. It is not professional career, legal or financial advice. Decisions are yours."
- "Free and paid": "The conversation is free until 6 September 2026. The Next Move Pack costs ₹99, paid through Razorpay. Because the pack is generated for you within minutes, it is not refundable once delivered. If it does not arrive within 24 hours, email nextmove@mbbprep.com and we refund or resend."
- "Your content": "You own what you say and what we write for you. You give us permission to process it as described in the privacy page."
- "Acceptable use": "One person per conversation, your own profile only, no attempts to break or overload the service."
- "Changes": "We may change the service and these terms; we will update the date below."
- "Law": "These terms are governed by the laws of India."
- Footer line: "Last updated 5 September 2026."

## G7. Verification before commit
- `npm run build`, `npm run lint` pass with and without the Razorpay keys.
- Local dev: unknown `/r/x` and `/talk/x` render the not-found page; `/admin` without key returns 401; footer has Privacy, Terms, GitHub only; no Calendly string anywhere (`grep -r calendly src` returns nothing); hero shows "Try for free till September 6"; `/privacy` and `/terms` render.
- Caps: with `PER_EMAIL_CAP=1` in the shell, a second session for the same email shows the email-cap message; with `DAILY_CAP=0`, the daily message shows and the email is still stored.
- Pack: simulate a verified callback by stubbing the Razorpay GET only in a test path if needed, or verify by unit-invoking the generator against a stored transcript; confirm the pack renders in the paid state.
- Write `MILESTONE-G-REPORT.md`: verified, not verified, deviations with reasons.

Stop after the commit.

## G8. Extraction robustness
In `extractNextMove`, if the model output fails to parse or lacks `chosenPath`, retry the call ONCE with the instruction "Your previous output was not valid JSON matching the type. Return only the JSON." appended. Only then throw. Log both failures.
