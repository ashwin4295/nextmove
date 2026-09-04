# PLAN-M-F.md — NextMove milestone F: LinkedIn profile enrichment before the conversation

Work inside THIS repo only. Keep everything working. Do not touch `.env.local`, `convex/_generated`, `docs/`. No new dependencies (use `fetch`). Commit with message `feat: LinkedIn profile enrichment via Apify, profile-aware opener` ending with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`. DO NOT push. Do not run `npx convex dev`. No em dashes in visible copy. Copy below is FINAL.

Env: `APIFY_TOKEN` (server only). Actor: `harvestapi/linkedin-profile-scraper`. Endpoint: `POST https://api.apify.com/v2/acts/harvestapi~linkedin-profile-scraper/run-sync-get-dataset-items?token=APIFY_TOKEN&timeout=60` with JSON body `{ "urls": [url], "profileScraperMode": "Profile details no email ($4 per 1k)" }`. Response: JSON array of profile objects. Fields to use: `firstName`, `lastName`, `headline`, `about`, `location.linkedinText`, `currentPosition[]` and `experience[]` (each: `companyName`, `position`, `startDate.text`, `endDate.text`, `duration`), `education[]` (`schoolName`, `degree`, `fieldOfStudy`), `topSkills[]`.

## F1. Landing form
Add a third input after email: LinkedIn URL, optional, placeholder "linkedin.com/in/yourname (optional)". Under the form, replace the small line with: "About ten minutes · Voice or text · Free till Sep 8 2026" (unchanged) and add a second small muted line: "If you add your LinkedIn, the coach reads the public profile and skips the basics. We never post, connect, or message anyone." Client-side: accept `linkedin.com/in/<id>` with or without `https://`, `www.`, trailing slash or query; normalise to `https://www.linkedin.com/in/<id>`; reject anything else with "That doesn't look like a LinkedIn profile link." Submit passes `linkedinUrl` to `POST /api/session`.

## F2. Session and Convex
- `POST /api/session` accepts optional `linkedinUrl` (re-validate server-side), stores it. Schema: add optional `linkedinUrl: string`, `profileStatus: "pending" | "ready" | "failed" | "none"`, `profile: any`. New mutation `setProfile({ id, status, profile })`, new query field in `get`. Mirror in the memory store with the same fallback pattern used in earlier milestones.
- If `linkedinUrl` is present, `/api/session` responds immediately with `{ id }` and does NOT wait for enrichment.

## F3. `POST /api/enrich` (new, `maxDuration = 60`)
Body `{ id }`. Load session. If no `linkedinUrl` → set status `none`, return. If `APIFY_TOKEN` missing → `failed`. Else call the actor with an `AbortController` timeout of 30 s. Normalise the first result to:
```ts
type Profile = {
  name: string; headline: string; location: string;
  about: string;                // first 600 chars
  yearsExperience: number | null;   // now minus the earliest experience startDate year, null if unknown
  currentRole: { company: string; title: string; since: string } | null;
  roles: { company: string; title: string; start: string; end: string; duration: string }[]; // up to 6, most recent first
  education: { school: string; degree: string }[]; // up to 2
  topSkills: string[];          // up to 8
};
```
Store via `setProfile` with `ready`, or `failed` on any error/timeout (log with `console.error`). Never throw to the client.

## F4. Trigger
- The landing page, after `POST /api/session` returns, fires `POST /api/enrich` with `keepalive: true` and does not await it, then navigates to `/talk/[id]`.
- The talk page Ready state: if the session has a `linkedinUrl` and status is `pending`, show a small muted chip under the heading: "Reading your profile…" and poll `GET /api/session/[id]` (new thin route returning `{ status, profile }`) every 2 s for up to 20 s. When `ready`, chip becomes "Profile read." When `failed` or after 20 s, chip becomes "Couldn't read the profile, no problem." Begin is never blocked.

## F5. Prompt injection (`src/lib/script.ts` and the talk client)
- Add `export function buildSystemPrompt(profile: Profile | null): string`: returns `SYSTEM_PROMPT` unchanged when null; otherwise prepends:
```
WHAT YOU ALREADY KNOW (from their public LinkedIn; they gave you this):
Name: … · Headline: … · Location: …
Current: … at … since …
Past: … (one line per role, up to 6)
Education: …
About (their words): …
Rules: use this to skip the basics and to make doors and the first message specific. Never read it back to them as a list. Never contradict what they say in the conversation with what the profile says; if they differ, believe the person and note the gap in one short question. Never mention "the scrape" or "the data".
```
- Add `export function buildFirstMessage(profile: Profile | null): string`: null → `FIRST_MESSAGE`; otherwise: "Hey, I'm your NextMove coach. Quick thing before we start: this isn't a form, it's just a conversation, about ten minutes. I've had a look at your profile, so I'll skip the basics. {currentRole.title} at {currentRole.company}, {yearsExperience} years in. So tell me, what does that description miss? What's the version you'd give a friend over coffee?" (omit the years clause if null; omit the role sentence if no current role).
- The talk client uses these two functions for both the Vapi config and the text-mode `/api/chat` call (pass the profile through to `/api/chat`, which uses `buildSystemPrompt`).
- With a profile present, the coach skips nothing else; PART 1 question 1 still follows.

## F6. Extraction and result
- `extractNextMove(transcript, profile?)`: when a profile exists, append a "PROFILE CONTEXT" block to the user content (same fields). Rule in the prompt: profile informs realism and specificity; the transcript wins on intent and constraints.
- Result page "What we heard" card: when a profile exists, add one muted line at the top: "From your profile: {headline} · {yearsExperience} years" (years omitted if null).
- Admin: add a `profile` column (none / pending / ready / failed).

## F7. Events
`profile_submitted` (form), `profile_ready`, `profile_failed` (talk page when the chip resolves), with `session_id`.

## F8. Verification before commit
- `npm run build`, `npm run lint` pass with and without `APIFY_TOKEN`.
- Local dev: submit the form with `https://www.linkedin.com/in/williamhgates` (public, the actor's own example; cost under one cent). Confirm `/api/enrich` stores a `ready` profile with a headline and at least one role; the Ready screen chip resolves to "Profile read."; text mode's first coach line is the profile-aware opener; the result page shows the "From your profile" line. Then submit with an invalid link and confirm the inline error, and with no link and confirm nothing changes.
- Write `MILESTONE-F-REPORT.md`: verified, not verified, deviations with reasons, and the exact actor response fields used.

Stop after the commit.
