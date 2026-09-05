# Milestone I report

Pilot cap of 50 (total, not daily) plus end-of-conversation feedback. `.env.local`, `docs/`, `src/lib/extract.ts`, and `src/lib/script.ts` were not edited. No new npm dependencies. Not pushed.

## Verified

`npm run lint` and `npm run build` pass.

Against a memory-store `next start` on `http://localhost:3014` with `PILOT_CAP=1` as a process env override (`.env.local` was not written):

- `/api/pilot` started at `{ full: false, started: 0, cap: 1 }`.
- After one `POST /api/session` and `POST /api/started`, `/api/pilot` returned `{ full: true, started: 1, cap: 1 }`.
- A second `POST /api/session` returned `{ error: "pilot_full" }` with status 200 and no new id.
- Headless Chrome on `/` after the client fetch showed the closed plate (`PILOT CLOSED`, `The first fifty conversations are taken.`, `KEEP ME POSTED →`) and not the start form, LinkedIn field, or the two small lines under the form.
- Feedback: on that started session after a seeded next-move, `/r/[id]` rendered `ONE QUESTION` / `Was that worth ten minutes of your time?`. `POST /api/feedback` with score 4 and text, then reload, replaced the section with `Thank you. This goes straight to the person building NextMove.`
- `POST /api/waitlist` accepted a valid email (`{ ok: true }`), accepted a duplicate lowercased email, and rejected `not-an-email` with 400.

Override removed by stopping that server. A follow-up `npm run build` with the repo's normal `.env.local` (Convex) still passes. `TalkClient.tsx` was not edited.

## Not verified

- Headed click-through of the five score buttons and the send control. Persistence was checked via the feedback API plus a full page reload.
- `/admin` in the browser. The memory-store server returned 401 without `ADMIN_KEY`. Counters and the `fb` column were checked in code only.
- Live Convex deploy of `pilotStatus`, `setFeedback`, and `waitlist.*`. Next.js falls back to process-local counts / extras until those functions are on the deployment.
- Waitlist success copy (`Noted. We will write to you first.`) in the browser. The POST path was checked; the replace-the-form state was not clicked.

## Deviations

| Deviation | Reason |
|---|---|
| Convex `pilotStatus` returns `{ started }` only | The plan says not to read `PILOT_CAP` from Convex env. `/api/pilot` adds `cap` and `full` on the Next.js side. |
| `store.waitlistCount()` on the session store | Admin needs a row count; the plan named the counter, not the method. |
| `track` accepts optional `score` | Required for `track("feedback_given", { session_id, score })`. |
| Pilot override used process env, not a written `.env.local` line | The plan also says do not touch or commit `.env.local`. |
