# Milestone D report

Editorial design system, landing rewrite, session and result restyle, Vapi recording off. `.env.local`, `convex/`, `docs/`, `src/lib/extract.ts`, `src/lib/script.ts`, and `src/app/api/*` were not edited. Only new dependency: none (Source Serif 4 via `next/font/google`).

## Verified

`npm run lint` and `npm run build` pass. Build logged `store: convex`.

Headless Chrome against `npm run dev` at `http://localhost:3011`:

- Landing copy matches the plan (hero, recognition, how-it-works headings, result brief heading, founder note, trust, FAQ, closing, footer). No em dashes in landing chrome.
- Sticky nav: Wordmark, desktop centre links (How it works / See an example / About), primary "Start a conversation". Mobile is Wordmark + primary only.
- Hero form keeps milestone C validation and `POST /api/session`. Valid name plus email reaches `/talk/[id]`.
- Session ready state: "Let's get ready to talk.", three hairline rows, "Enable microphone and start", "Write it out instead", phase row Your story · Your options · Your next step.
- Typed flow: Write it out instead, three answers, See my next move, lands on `/r/[id]`.
- Result restyle: chosen path H1, What we heard, first message with Copy / I sent it, other doors, 30 days, Share / Talk it through with Ashwin, pack "Coming Saturday", transcript details. Existing events still fire from the same handlers.
- Correction: "That's not quite right" reveals the textarea and "Update my next move"; submit POSTs `/api/roadmap` with `Correction:` appended and reloads. Event `result_corrected`.
- No horizontal overflow at 360, 390, 768, 1440 on `/`, `/talk/[id]`, and `/r/[id]` (`scrollWidth === clientWidth`).
- Keyboard: tab through landing nav, name/email/submit, recognition/FAQ summaries; session Wordmark, Leave, textarea, See my next move. Focus ring is 2px forest (`rgb(32, 75, 58)`) on those controls. FAQ summary opens with Enter.
- Screenshots at 390 and 1440 for `/`, talk ready, text mode after three answers, and `/r/[id]` saved under `verification/` (git-ignored).
- `artifactPlan: { recordingEnabled: false }` is in the Vapi assistant config in `TalkClient.tsx`.

## Not verified

- Voice "Enable microphone and start" plus a live microphone grant.
- Waveform motion in Listening/Speaking (needs a live Vapi call).
- PostHog network capture for `result_corrected` with a live `NEXT_PUBLIC_POSTHOG_KEY` (same gating as milestone C).
- OG image pixel render in a social crawler (route compiles; fonts load from jsDelivr at request time).
- Convex codegen / deploy (`npx convex dev` was not run).

## Deviations

| Deviation | Reason |
|---|---|
| How-it-works canvas lines and the illustrative brief option bodies are not in the plan | The plan specified structure, Priya, Meera, badges, and a ~60-word message. Surrounding one-liners were written to stay consistent with that story and not invent numbers. |
| Result page em dashes appear inside model-written path/message text | UI chrome has none. `extract.ts` / `script.ts` were not to be edited. |
| Send is `disabled` when the composer is empty, so it is skipped while tabbing a blank text session | Same disabled rule as milestone C. Focus is visible on Send once it has text. |
