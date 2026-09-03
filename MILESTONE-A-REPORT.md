# Milestone A report

## What was built

End-to-end voice coaching flow in this repo:

- Interview system prompt and first message (`src/lib/script.ts`) — §2 questions verbatim, act-boundary line, 30-minute hard cap, closing line.
- Claude extraction to the locked `Roadmap` JSON (`src/lib/extract.ts`).
- Convex schema + `sessions` mutations/queries (`convex/schema.ts`, `convex/sessions.ts`).
- Runtime store (`src/lib/convexClient.ts`): `ConvexHttpClient` + `anyApi` when `NEXT_PUBLIC_CONVEX_URL` is set; otherwise an in-process `Map` (on `globalThis` so Next.js HMR does not drop it). Logs `store: convex` or `store: memory`.
- Landing `/`, talk `/talk/[id]` (Vapi + text fallback), roadmap `/r/[id]` with selectable paths, share, Calendly, OG image 1200×630, `/admin` counters, APIs for session / chat / roadmap / select / share.
- Tailwind-only, one accent (`#b45309`), mobile-first, no animation.

`npx convex dev` was not run (operator does that). `.env.local` was not edited.

## What was verified in the browser

Headless Chrome against `npm run dev` at `http://localhost:3000`, same clicks as the plan:

1. Opened `/`. H1, subcopy, first-name input, "Start the conversation" present.
2. Typed first name `Ashwin`, started a session, landed on `/talk/[id]?name=Ashwin`.
3. Clicked "Mic not working? Type instead".
4. Sent two user messages. Transcript showed 5 turns (seeded first message + 2 user + 2 coach). Coach asked Act 1 question 2 verbatim.
5. Clicked "See my roadmap now". Landed on `/r/[id]` with **4** path cards, trigger sentence, decision date, Calendly link.
6. Clicked "This is my path", then Share.
7. Opened `/admin`. Counters increment (after this run: started 4, act1 2, roadmaps 2, selected 2, shared 2).

Also checked: OG image returns 1200×630 PNG; `privateItems` is stripped from the roadmap page payload; extract-failure path stores the transcript and shows "Roadmap failed, transcript saved".

`NEXT_PUBLIC_CONVEX_URL` was present at runtime, so the live store was Convex (`store: convex`). Session create / finish / select / share / stats all succeeded.

## What was not verified

- Real Vapi voice (Begin + mic). Plan says the operator tests voice.
- Convex codegen / `npx convex dev` login flow.
- Share clipboard contents (headless Chrome; Share still POSTed and the button handled the click).
- Admin `?key=` gate (`ADMIN_KEY` unset, page is open).
- 375px visual pass was not screenshot-tested; layout is stacked single-column with `max-w-lg` and `px-4`.

## Commands

- `NEXT_PUBLIC_CONVEX_URL= npm run build` — passed, logged `store: memory`.
- `NEXT_PUBLIC_CONVEX_URL= npm run lint` — passed after ignoring `convex/_generated/**`.

## Deviations from PLAN-M-A.md

| Deviation | Reason |
|---|---|
| No `temperature` on `claude-sonnet-5` calls (plan asked 0.3 on extract) | Model returns 400: `` `temperature` is deprecated for this model. `` |
| `thinking: { type: "disabled" }` on extract and chat | Sonnet 5 turns adaptive thinking on by default and it eats `max_tokens`; without this, JSON/chat replies truncate. |
| Extra client islands: `src/app/landing.tsx`, `src/app/r/[id]/RoadmapView.tsx` | Keep server pages for `searchParams` / store reads; interactivity stays client-side. |
| Memory store hung on `globalThis` | Next.js HMR would otherwise reset a module-level `Map`. |
| `agentRules: false` in `next.config.ts` | `next dev` wrote `AGENTS.md` / `CLAUDE.md`; those files are not part of this milestone. |
| `convex/_generated` ignored by ESLint | Codegen files (from the environment, not written by hand) trip unused-directive warnings. App still uses `anyApi` as specified. |
