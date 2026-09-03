# PLAN-M-A.md — NextMove milestone A: ugly, hardcoded, complete flow

You are building inside THIS repo only (a fresh Next.js 16 App Router + TypeScript + Tailwind v4 app, `src/` dir, `@/*` alias). Dependencies already installed: `convex`, `@vapi-ai/web`, `@anthropic-ai/sdk`. Do not add other runtime dependencies. Do not touch `.env.local`. Commit when done with message `feat: milestone A — voice coaching flow end to end`. DO NOT push. Do not run `npx convex dev` (needs interactive login; the operator runs it).

Read `docs/IDEA_SCOPE.md` §1 and §2 first. The interview script and the extraction JSON shape there are FINAL; copy the question wording verbatim into the system prompt.

## Env vars available at runtime (names only, values exist in .env.local and later Vercel)
- `NEXT_PUBLIC_VAPI_PUBLIC_KEY` — Vapi web SDK
- `VAPI_PRIVATE_KEY`, `VAPI_WEBHOOK_SECRET` — not used in this milestone
- `ANTHROPIC_API_KEY` — server-side extraction
- `NEXT_PUBLIC_CONVEX_URL` — will be set after operator runs `npx convex dev --once`; code must build without it
- `ADMIN_KEY` — optional; gates `/admin`

## Files to create

### 1. `src/lib/script.ts`
Export `SYSTEM_PROMPT: string` and `FIRST_MESSAGE: string`.
- Persona paragraph: senior mentor who has sat through a thousand career transitions; reflect one line, ask ONE question, never list, never lecture, push back once per act when two statements conflict.
- The three acts and all 12 questions from IDEA_SCOPE §2, verbatim, with the act-boundary line: "I have enough for a first roadmap. Want to go deeper, or see it now?" If the user says "see it now" or similar, say exactly: "Good. Ending here — your roadmap is being written." and stop talking.
- Hard cap instruction: after roughly 30 minutes of conversation, say the closing line above unprompted.
- `FIRST_MESSAGE`: "Hi, I'm your NextMove coach. This is a conversation, not a form. Tell me what you do today the way you'd tell a friend, not a recruiter."

### 2. `src/lib/extract.ts`
`export async function extractRoadmap(transcript: TranscriptTurn[]): Promise<Roadmap>` using `@anthropic-ai/sdk`, model `claude-sonnet-5`, max_tokens 2000, temperature 0.3. The prompt instructs: return ONLY JSON matching this TypeScript type:
```ts
export type TranscriptTurn = { role: 'assistant' | 'user'; text: string };
export type PathOption = { name: string; whyItFits: string; realism: 'strong fit' | 'realistic' | 'a stretch' | 'long shot'; firstGap: string; firstExperiment: string };
export type Roadmap = {
  headline: string;            // one line about the person, third person, no name
  years: number | null;
  trigger: 'push' | 'pull' | 'drift';
  awayFrom: string; toward: string; energyEvidence: string;
  anchors: string[]; envy: string; tried: string[]; costOfStaying: string;
  paths: PathOption[];         // 3 or 4; at least one must be 'a stretch' or 'long shot' unless evidence clearly says otherwise; include 'Stay and reinvent' as a path when the evidence supports it
  decisionDate: string;        // ISO date 30–60 days from today
  actReached: 1 | 2 | 3;       // highest act whose questions were substantially answered
  privateItems: string[];      // anything the user asked to keep private — NEVER rendered on the share card
};
```
Path vocabulary the prompt must offer: Product · Growth · AI / applied AI · Engineering · Consulting / strategy · Founder / operator · Leadership rise in current function · MBA as a route (never a verdict) · Stay and reinvent.
Rule in the prompt: quote the user's own words inside `whyItFits` where possible. If the transcript is short (act 1 only), still produce 3 paths and mark `actReached: 1`.
Parse with a tolerant JSON extractor (strip code fences). On parse failure throw.

### 3. Convex
- `convex/schema.ts`: table `sessions` { createdAt: number, source: string, transcript: TranscriptTurn[], roadmap: any | null, actReached: number | null, selectedPath: string | null, shares: number }.
- `convex/sessions.ts`: mutations `create({source})` → id; `finish({id, transcript, roadmap})`; `selectPath({id, path})`; `share({id})`. Query `get({id})`. Query `stats()` → { started, act1, act2, act3, roadmaps, selected, shared } computed from all rows (fine for this week).
- `src/lib/convexClient.ts`: export a `ConvexHttpClient` built from `NEXT_PUBLIC_CONVEX_URL`; if the var is missing, export a `MemoryStore` implementing the same five operations with an in-process Map so `npm run build` and local dev work before Convex is wired. Choose at runtime by presence of the env var. Log one line which store is active.
- Do NOT run codegen commands that require login. Write `convex/_generated` stubs is NOT needed; import from `convex/browser` and use string function references (`"sessions:create"`) via `client.mutation(anyApi.sessions.create, ...)` using `anyApi` from `convex/server` so the app compiles without generated files.

### 4. Pages (App Router)
- `src/app/page.tsx` — landing. H1: "An AI career coach you talk to." Sub: "Up to 30 minutes. Where you've been, what's pushing you, what you won't give up. You leave with a transition roadmap." Input: first name (required). Button: "Start the conversation". On click: POST `/api/session` {source from `?src=`} → id → navigate `/talk/[id]?name=`.
- `src/app/talk/[id]/page.tsx` (client component) — uses `@vapi-ai/web`. `new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!)`. On mount show a big "Begin" button (browser mic permission needs a gesture). On Begin: `vapi.start({ model: { provider: 'anthropic', model: 'claude-sonnet-4-6', messages: [{ role: 'system', content: SYSTEM_PROMPT }] }, voice: { provider: '11labs', voiceId: 'paula' }, transcriber: { provider: 'deepgram', model: 'nova-2', language: 'en' }, firstMessage: FIRST_MESSAGE, maxDurationSeconds: 1920, endCallPhrases: ['your roadmap is being written'] })`. Listen to `message` events with `type === 'transcript'` and `transcriptType === 'final'`; append `{role, text}` to local state. Show elapsed timer, a live transcript panel, and a persistent button "See my roadmap now" which calls `vapi.stop()`. On `call-end` (or the button): POST `/api/roadmap` {id, transcript} → on success navigate `/r/[id]`. Show a text fallback: a link "Mic not working? Type instead" that reveals a simple chat textarea loop calling `/api/chat` (below) with the same system prompt; same transcript state; same "See my roadmap now" button.
- `src/app/api/session/route.ts` — creates session, returns id.
- `src/app/api/roadmap/route.ts` — runs `extractRoadmap`, stores via `finish`, returns id. If extraction throws, store transcript anyway and return `{ id, error: 'extract' }`; the roadmap page must render the transcript with a "Roadmap failed, transcript saved" notice rather than a blank page.
- `src/app/api/chat/route.ts` — text fallback: takes transcript, returns the next assistant line from `claude-sonnet-5` with `SYSTEM_PROMPT`. Non-streaming.
- `src/app/r/[id]/page.tsx` — the roadmap. Headline; trigger as a sentence ("You're being pushed more than pulled." etc.); anchors as chips; then path cards (name, realism as a word badge, whyItFits, firstGap, firstExperiment). Each card has a button "This is my path" → POST `/api/select` {id, path} → card highlights, others dim. Below: "Decision date: {date}". Share button copies `/r/[id]` to clipboard and POSTs `/api/share` {id}; on the page show a "Talk this through with Ashwin" link to `https://calendly.com/mbbprepofficial/15min?utm_source=nextmove`. Never render `privateItems`.
- `src/app/r/[id]/opengraph-image.tsx` — `next/og`, 1200×630: "NextMove" wordmark, headline, selected path name if any else first path, its realism word. No private items.
- `src/app/api/select/route.ts`, `src/app/api/share/route.ts` — thin.
- `src/app/admin/page.tsx` — if `ADMIN_KEY` is set, require `?key=` to match; else open. Render the seven counters from `stats()` as a plain table. No styling effort.

### 5. Styling
Tailwind only. One accent colour. Mobile first: the talk page and roadmap page must be usable at 375px. No animation. Ugly is fine, broken is not.

### 6. Verification you must run before committing
- `npm run build` passes with NO `NEXT_PUBLIC_CONVEX_URL` set (memory store path).
- `npm run lint` passes.
- `npm run dev`, open `/`, type a name, reach `/talk/[id]`, click "Mic not working? Type instead", send two messages, click "See my roadmap now", land on `/r/[id]` with 3+ path cards, click a path, click share; open `/admin` and see counters incremented. Fix anything broken. (You cannot test real voice; the operator will.)
- Write `MILESTONE-A-REPORT.md`: what was built, what was verified in the browser, what was not, and any deviation from this plan with the reason.

Stop after the commit.
