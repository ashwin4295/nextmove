# Milestone B report

Ten-minute conversation, one next move, first message, design system. `npx convex dev` was not run. `.env.local`, `convex/_generated`, and `docs/` were not edited.

## Verified

`npm run lint` and `npm run build` pass.

Headless Chrome against `npm run dev` at `http://localhost:3000`, 375px and 1280px:

- `/` at both widths: H1 "Ten minutes. One honest next move.", eyebrow, first-name input, how-it-works H2.
- Start with first name lands on `/talk/[id]`. Ready card "Before we begin". Type instead.
- F1: one answer then "See my next move" shows "Give me two answers first, then I can write something honest." and does not navigate.
- Three text answers that never name a person → `/r/[id]` with chosen path, realism badge, first message, other doors.
- Contact-null: inline "Who do you know in this world? First name" + "Write it for them" swapped in a message to Meera and persisted on reload.
- Copy message → "Copied". "I sent it" → "Sent ✓" and persisted. Share this page → "Link copied".
- `/r/[id]` at 375px still reads.
- Transcript with one user turn stored via `/api/roadmap` shows "This conversation was too short for an honest answer. Start again."
- `/admin?key=`: counters started, act1, act2, act3, written, sent, shared. Last-25 table shows createdAt, source, actReached, sent, shares, link (after a page get seeds the process-local fallback; see deviations).
- OG image is 1200×630 PNG: Wordmark, chosen path, realism badge, headline, nextmove-pi.vercel.app. No message, no contact name.

`NEXT_PUBLIC_CONVEX_URL` was present, so the live store was Convex (`store: convex`). Session create / finish / get succeeded against the already-deployed functions.

## Not verified

- Real Vapi voice (Begin + microphone). Operator tests voice.
- `NEXT_PUBLIC_VOICE_TIER=budget` live call.
- Orb pulse on `speech-start` / `speech-end` (needs a live call).
- Mic-denied card from a real browser permission prompt. The failed state is wired (`vapi.start` try/catch, `vapi.on('error')`, call-end within 15s with an empty transcript).
- Convex codegen / deploy (`npx convex dev` was not run).
- Clipboard payload itself (headless Chrome still flipped the button labels and POSTed).

## Deviations

| Deviation | Reason |
|---|---|
| New Convex fields (`sent`, `contactName`) and functions (`markSent`, `setContact`, `listRecent`, `finish.actReached`) are in the repo but not on the live deployment | Plan forbids `npx convex dev`. Existing `create` / `finish` / `get` / `stats` / `selectPath` / `share` stay compatible. |
| `sent` and `contactName` are `v.optional` in the schema | Required fields would break existing session documents. Create writes `false` / `null`. |
| Client does not send extra `finish` args to Convex | Live `finish` still has the M-A signature. `actReached` is written onto the stored NextMove object as `Math.max(client, extracted)`. |
| `markSent` / `setContact` fall back to `finish` plus `__sessionSent` / `__contactName` on the stored object | So "I sent it" and "Write it for them" persist before the operator deploys. |
| `listRecent` falls back to a `globalThis` id list + `get` | Live Convex has no `listRecent` yet. Admin table is empty on a cold worker until a `get`/`create` in that process. |
| `stats.sent` stays 0 on live Convex until deploy | Old `stats` has no `sent`. Admin `written` maps from `roadmaps`. |
| `vapi.start(...)` is cast | SDK types do not include Deepgram `aura-2-thalia-en`. Runtime config matches the plan. |
| JSX apostrophes escaped as `&apos;` | ESLint `react/no-unescaped-entities`. Visible copy is unchanged. |
| OG fonts fetched from jsDelivr Fontsource | `next/font` is not available inside `ImageResponse`. |
| Old `Roadmap` documents are normalized to `NextMove` on read | Keep `/r/[id]` working for milestone A sessions. |
