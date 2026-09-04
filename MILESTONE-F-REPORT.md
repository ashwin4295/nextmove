# Milestone F report

LinkedIn profile enrichment via Apify before the conversation, a profile-aware opener, and a result-page "From your profile" line. `.env.local`, `convex/_generated`, and `docs/` were not edited. No new dependencies (`fetch` only). `npx convex dev` was not run. Not pushed.

## Verified

`npm run lint` and `npm run build` pass with `APIFY_TOKEN` present in `.env.local`, and again with `APIFY_TOKEN` unset in the shell. Build logged `store: convex`. `/api/enrich` and `/api/session/[id]` are in the route table.

Headless Chrome against the existing `npm run dev` at `http://localhost:3011`:

- Landing has a third input, placeholder `linkedin.com/in/yourname (optional)`, the unchanged "About ten minutes · Voice or text · Free till Sep 8 2026" line, and the second muted line about reading the public profile and never posting, connecting, or messaging.
- `https://www.linkedin.com/in/williamhgates` submitted on the form. `POST /api/session` returned immediately with `{ id }`. `POST /api/enrich` stored `status: "ready"` in 4.4s with headline `Chair, Gates Foundation and Founder, Breakthrough Energy` and 3 roles (first: Co-chair at Gates Foundation). `yearsExperience` was 51.
- Ready screen started with "Reading your profile…", resolved to "Profile read.", and still showed "Enable microphone and start" (Begin was not blocked).
- Text mode first coach line was the profile-aware opener ("I've had a look at your profile", "I'll skip the basics", "what does that description miss"). It was not the default LinkedIn-version line.
- Result page "What we heard" card shows `From your profile: Chair, Gates Foundation and Founder, Breakthrough Energy · 51 years`.
- Invalid link `twitter.com/billgates` stays on the landing page and shows "That doesn't look like a LinkedIn profile link." Server-side re-validation returns 400 `{ error: "invalid linkedin" }`.
- Submit with no LinkedIn URL still starts a talk session, shows no profile chip, and uses the default first message.
- Admin last-25 table has a `profile` column. Live rows showed `ready` (2) and `none` (23).

## Not verified

- Voice path with the profile-aware Vapi `firstMessage` / system prompt (headless Chrome cannot grant a microphone). Wiring matches text mode (`buildFirstMessage` / `buildSystemPrompt` on the same `profileRef`).
- PostHog `profile_submitted` / `profile_ready` / `profile_failed` network capture with a live key (same gating as earlier milestones).
- Convex codegen / deploy (`npx convex dev` was not run). Live `create` extra fields and `setProfile` therefore persist through the existing `finish` blob fallback (`__linkedinUrl`, `__profileStatus`, `__profile`) plus the in-process extras map until those mutations are deployed.
- A second real Apify run after the Gates example (cost kept to the one public example).

## Actor fields used

`POST https://api.apify.com/v2/acts/harvestapi~linkedin-profile-scraper/run-sync-get-dataset-items?token=APIFY_TOKEN&timeout=60` with body `{ "urls": [url], "profileScraperMode": "Profile details no email ($4 per 1k)" }`. Response is a JSON array; the first item is normalised.

Fields read from the Gates item:

- `firstName`, `lastName` → `name`
- `headline`
- `about` (first 600 characters)
- `location.linkedinText` → `location`
- `currentPosition[]` and `experience[]`: `companyName`, `position`, `startDate.text`, `startDate.year`, `endDate.text`, `duration`
- `education[]`: `schoolName`, `degree`, `fieldOfStudy` (Gates returned schools with empty degree/field)
- `topSkills` (empty on this profile; string or string[] both accepted)

`yearsExperience` is the current year minus the earliest `experience.startDate` year (51 for Gates). Any error or 30s `AbortController` timeout stores `failed` and is logged with `console.error`. The client always gets JSON, never a thrown response.

## Deviations

| Deviation | Reason |
|---|---|
| `create` extra fields and `setProfile` fall back to the roadmap blob and extras map when the new Convex functions are not on the deployment | Same pattern as `setPayLink` / `markSent`. The plan forbids `npx convex dev`, so the live deployment may still have the older function set. |
| First "See my next move" on a two-turn verify transcript returned `extract` (`Missing chosenPath`); "Write it now" on the same session then rendered the profile line | Pre-existing extraction parse flake. The profile was already stored; the result card only renders once a NextMove exists. |
| Talk page polls immediately, then every 2s, and stops at 20s | The plan says every 2s for up to 20s. An immediate first poll lets the chip resolve if enrich already finished. |
| Gates `topSkills` and education degrees were empty | That is what the actor returned for this public example. Headline and roles were present, which is what the plan asked to confirm. |
