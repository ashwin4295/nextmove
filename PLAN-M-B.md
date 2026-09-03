# PLAN-M-B.md — NextMove milestone B: ten minutes, one output, real design

You are working inside THIS repo only. Milestone A is live at https://nextmove-pi.vercel.app. Keep every route, API and Convex function working. Do not touch `.env.local`, `convex/_generated`, or `docs/`. No new runtime dependencies except `next/font/google` (built in). Commit when done with message `feat: milestone B — ten-minute conversation, first-message output, design system`. DO NOT push. Do not run `npx convex dev`.

Read `docs/IDEA_SCOPE.md` §2 for the origin of the questions, then this file fully. Copy below is FINAL; reproduce it verbatim. No em dashes anywhere in visible copy.

**Product change (read this first).** The conversation is now **ten minutes**, not thirty. The product's output is no longer a roadmap. It is **one next move plus the first message, drafted and ready to send to a specific person the user already knows**. The list of other paths survives only as a compact secondary section. Every counter, page and line of copy follows from that.

---

## PART 1 — Conversation script (replace `src/lib/script.ts`; wording FINAL)

`FIRST_MESSAGE`: "Hi, I'm your NextMove coach. Ten minutes, real questions, and you leave with your next move and the first message to send. Tell me what you do today the way you'd tell a friend, not a recruiter."

`SYSTEM_PROMPT` persona (keep the existing persona paragraph: senior mentor, reflect one line then ONE question, never list, never lecture, one push-back when two statements conflict). Replace the acts with:

ACT 1 — the trigger (about 4 minutes)
1. "Tell me what you do today the way you'd tell a friend, not a recruiter."
2. "What's prompting this now? What changed in the last six months?"
3. "What are you moving away from? … And what are you moving toward?" (probe the second half)
4. "What has to stay true about your life for the next move to be a good one?" (listen for money floor, city, family, health, visa, time)
Then say exactly: "I have enough for a first read. Want to go on, or see it now?"

ACT 2 — the move (about 4 minutes)
5. "From what you've told me, I see two or three doors: [A], [B], maybe [C]. Which one pulls you more, honestly?" (draw doors from what they said; prefer this vocabulary when it fits: Product · Growth · AI / applied AI · Engineering · Consulting / strategy · Founder / operator · Leadership rise in current function · MBA as a route (never a verdict) · Stay and reinvent)
6. "If [chosen] took three years and you knew you'd succeed, would you still want it?"
7. "Who do you know who is already in that world, or one step ahead of you on it? First name, and how you know them." (If they cannot name anyone, ask: "Who is the closest person you could reach in two messages?" Accept a role description if no name.)
8. "What would you actually want to ask them?"

ACT 3 — close (about 1 minute)
9. "Anything you want kept private, or anything you'd want said louder?"
Then say exactly: "Good. Ending here — your next move is being written." and stop talking.

Rules: hard cap about 12 minutes, then say the closing line unprompted. If the user says "see it now", "that's enough", "stop", or similar at any point, say the closing line and stop. One question at a time. If they ramble, reflect one line and move to the next unanswered question.

---

## PART 2 — Extraction (replace types + prompt in `src/lib/extract.ts`)

```ts
export type TranscriptTurn = { role: 'assistant' | 'user'; text: string };
export type Realism = 'strong fit' | 'realistic' | 'a stretch' | 'long shot';
export type PathOption = { name: string; whyItFits: string; realism: Realism; firstGap: string };
export type Contact = { name: string | null; relation: string | null; role: string | null };
export type NextMove = {
  headline: string;                 // one line about the person, third person, no name
  trigger: 'push' | 'pull' | 'drift';
  awayFrom: string; toward: string;
  anchors: string[];                // what has to stay true
  chosenPath: PathOption;           // the door they said pulls them, or the best-supported one
  otherPaths: PathOption[];         // 1–3 others, at least one 'a stretch' or 'long shot' unless evidence clearly says otherwise; include 'Stay and reinvent' when the evidence supports it
  contact: Contact;                 // the person from Q7; nulls if none
  message: string;                  // 60–110 words, first person, the user's own phrasing where possible, addressed to contact.name (or "Hi," if null): one line on where they are, one honest line on what is pulling them toward the chosen path, one specific ask for a 20-minute conversation with a concrete question from Q8, one line making it easy to say no. No flattery, no exclamation marks, no buzzwords.
  experiment: string;               // one thing to do in the next 30 days beyond sending the message
  decisionDate: string;             // ISO, 30–45 days from today
  actReached: 1 | 2 | 3;
  privateItems: string[];           // never rendered on the share card
};
```
Model `claude-sonnet-5`, `thinking: { type: 'disabled' }`, max_tokens 2500, no temperature. Keep the tolerant JSON extractor. If the transcript has fewer than 2 user turns, do not call the model (see F1). Rename `Roadmap` → `NextMove` everywhere (type only; keep the route name `/r/[id]`).

Add `export async function draftMessage(nextMove: NextMove, contactName: string): Promise<string>`: one short Claude call that rewrites `message` for a newly supplied name, same rules.

---

## PART 3 — Product fixes (bugs seen in production)

F1. `POST /api/roadmap`: if fewer than 2 user turns → do not call Claude; store transcript with `nextMove: null`; return `{ id, error: 'too_short' }`. Client: on `call-end`, only finish if ≥ 2 user turns; "See my next move" with < 2 user turns shows inline "Give me two answers first, then I can write something honest." and does nothing else.
F2. Mic denied / call failed is a first-class state: wrap `vapi.start()` in try/catch, listen to `vapi.on('error')`; on either, or on `call-end` within 15 s of start with an empty transcript, show the card: title "I can't hear you yet." body "Your browser blocked the microphone, or the call dropped. Allow the mic and try again, or type your answers instead. You get the same result either way." Buttons "Try voice again" (primary), "Type instead" (secondary).
F3. Track the act on the client: assistant text containing `enough for a first read` → act 2; containing `next move is being written` → act 3. Header shows `Act 1 of 3 · The trigger` / `Act 2 of 3 · The move` / `Act 3 of 3 · Close`. Send `actReached` in the `/api/roadmap` body; server stores `Math.max(client, extracted)`.
F4. Elapsed timer starts at call start; pauses in failed state.
F5. Vapi config: keep `claude-sonnet-4-6`, `11labs/paula`, `deepgram nova-2`. Add `silenceTimeoutSeconds: 90`, `maxDurationSeconds: 780`, `backgroundSound: 'off'`, `firstMessageMode: 'assistant-speaks-first'`, `endCallPhrases: ['next move is being written']`. If `NEXT_PUBLIC_VOICE_TIER === 'budget'`: model `claude-haiku-4-5-20251001`, voice `{ provider: 'deepgram', voiceId: 'aura-2-thalia-en' }`.
F6. `/r/[id]` when `nextMove` is null and transcript exists: title "Not written yet", button "Write it now" (re-POST with stored transcript, reload on success). If transcript < 2 user turns: "This conversation was too short for an honest answer. Start again." linking to `/`.

---

## PART 4 — Convex
- `sessions` doc: rename field `roadmap` → keep the field name `roadmap` in the DB (no migration this week) but it now stores the `NextMove` object. Add fields `sent: boolean` (default false) and `contactName: string | null`.
- Mutations: keep `create`, `finish` (accept optional `actReached`), `selectPath` (now stores which path card was chosen, still useful), `share`. Add `markSent({id})`, `setContact({id, contactName, message})`. Queries: `get`, `stats` (add `sent`), `listRecent({limit})` → last 25 with createdAt, source, actReached, sent, shares.
- Mirror all of it in the memory store in `src/lib/convexClient.ts`.

---

## PART 5 — Design system (`src/app/globals.css` tokens via Tailwind v4 `@theme` + `src/lib/ui.tsx` primitives)

Direction: a quiet, premium coaching product. White paper, warm near-black ink, one accent, generous air. Pluto's calm plus a senior advisor's desk. Not a startup gradient page.

Tokens: `--canvas #fafaf9` · `--surface #ffffff` · `--ink #0c0a09` · `--muted #6b6560` · `--line #e7e5e4` · `--wash #f3f1ee` · `--accent #0f766e` (sole chromatic accent: primary buttons, the coach orb, one phrase in the hero) · `--accent-ink #ffffff` · `--accent-wash #e6f4f2`. Realism badges: strong fit `#0f766e` on `#e6f4f2` · realistic `#1d4ed8` on `#e8efff` · a stretch `#b45309` on `#fff4e5` · long shot `#6b6560` on `#f3f1ee`.
Radius: buttons pill, cards 12px, inputs 10px. Shadows: none, except the hero conversation card, the message card and the coach orb (`0 10px 30px rgba(12,10,9,0.08)`).
Fonts via `next/font/google`: display **Inter Tight** 500 (never 700); body **Inter** 400/500/600. H1 clamp(2.5rem, 5vw, 4rem) lh 1.05 ls -0.02em; H2 clamp(1.75rem, 3vw, 2.5rem); body 1.0625rem/1.65; eyebrow 0.75rem uppercase 600 tracking 0.12em muted.
Layout: max-width 1120px; section padding 96px desktop / 64px mobile. Primary button: accent bg, white, 14px 600, 14px 24px padding, pill, hover 8% darker. Secondary: 1px line border, ink text. Focus ring 2px accent, offset 2px, everywhere.
Motion: only under `prefers-reduced-motion: no-preference`: 320ms fade-up on section entry (IntersectionObserver) and the orb pulse. NO pinning, NO scroll-driven animation, NO parallax. Nothing invisible by default.
Primitives: `Button({variant:'primary'|'secondary'|'ghost', href?})`, `Card`, `Eyebrow`, `Badge({tone})`, `Wordmark` ("Next" ink + "Move" accent, Inter Tight 500), `Container`, `Section({band?})`.

---

## PART 6 — Landing `/` (replace `landing.tsx`; copy FINAL)

Nav (sticky, canvas bg, 1px line after scroll): Wordmark · "How it works" (#how) · "What you get" (#output) · "FAQ" (#faq) · primary "Start" (scrolls to #start).

S1 Hero (two columns desktop, stacked mobile; id="start")
- Eyebrow: "FOR PROFESSIONALS 4 TO 15 YEARS IN · INDIA"
- H1: "Ten minutes. One honest next move." ("next move" in accent)
- Sub (max 56ch): "An AI career coach you talk to. It asks the questions a real coach asks, tells you which door actually fits, and writes the first message to someone you already know in that world. You leave with something to send, not something to read."
- Inline form: first-name input (placeholder "Your first name") + primary "Start the conversation". Small muted below: "Free during Build Week. Voice or text. Nothing is shared without your say."
- Trust line (small, muted): "Written by a coach who has guided 1,000+ professionals through career transitions. Ex-Bain. INSEAD MBA."
- Right: conversation card (surface, 12px, the shadow). Header: 12px accent orb + "NextMove coach" + "06:40" + pill "Act 2 of 3". Three caption lines:
  Coach: "Who do you know who is already in that world, or one step ahead of you on it?"
  You: "Rohan. We were at Flipkart together. He moved into an applied AI product role last year."
  Coach: "Good. What would you actually want to ask him?"
  Footer: a small message-preview strip "Drafting your message to Rohan…" with the accent orb.

S2 How it works (id="how", wash band). Eyebrow "HOW IT WORKS". H2: "Talk. Choose a door. Send the first message."
Three numbered cards:
01 "Talk for ten minutes" — "Real coaching questions in three short acts: what's prompting this, what you won't give up, which door pulls you. Stop whenever you like."
02 "Get your next move" — "One path, graded honestly: strong fit, realistic, a stretch, or long shot. In your own words, not a template. The other doors are listed, so nothing is hidden."
03 "Send the first message" — "You name one person already in that world. NextMove drafts the message, you copy it, you send it. That is the moment a transition actually starts."

S3 What you get (id="output"). Eyebrow "WHAT YOU GET". H2: "A message you can send tonight, not a plan you'll admire."
Left paragraph: "Career advice is either free and generic or ₹20,000 an hour, and both end in a document. Nobody drifts another year for lack of a document. They drift because the first conversation never happens. NextMove writes it."
Right: a sample "first message" card (static): To: "Rohan" · body: "Hi Rohan, quick one. I'm still running lending product at the fintech, nine years in now, and the honest version is that I've been managing dashboards more than building. Your move into applied AI product is the one path I keep coming back to. Could I get twenty minutes to ask how you made the jump without a pay cut, and what you'd do differently? Completely fine if this month is too full." Under it, small line: "Path: Applied AI product · realistic".

S4 Why it is different (three columns)
- "Coaching questions, not a quiz" — "What's prompting this, what you're moving toward, what has to stay true. The questions that unlock people, in a fixed order that works."
- "Honest realism" — "At least one door is graded a stretch or a long shot. If everything looks easy, nobody is telling you the truth."
- "An action, not analysis" — "You leave with a message to a real person and a date. Momentum beats certainty."

S5 Founder (compact, wash band): 56px circle with initials "AS" <!-- PLACEHOLDER: replace before launch --> + "Ashwin Shetty. Ex-Bain, INSEAD MBA, 15 years in HR and organisation transformation, 1,000+ professionals coached. He left a stable consulting career for the thing he kept coming back to. He wrote these questions."

S6 FAQ (id="faq", native `<details>`)
1. "Is this a real coach?" — "It is an AI coach running a script written by a real one. For the hard calls, book the human at the end."
2. "Do I have to use voice?" — "No. Type instead works the same way and produces the same message."
3. "Isn't this just ChatGPT voice mode?" — "ChatGPT will chat with you for an hour and agree with you. NextMove asks fixed coaching questions, pushes back when your answers conflict, grades your options honestly, and ends with a message to a named person. Then it asks whether you sent it."
4. "What happens to what I say?" — "Your conversation is stored so your page works. Anything you ask to keep private never appears on the shareable card."
5. "Can it tell me to stay where I am?" — "Yes, and it will if the evidence says so. Stay and reinvent is one of the doors."

S7 Final CTA + footer: H2 "Ten minutes. One message. Send it tonight." + the inline form. Footer: Wordmark · "Built during GrowthX Build Week, September 2026" · "GitHub" → https://github.com/ashwin4295/nextmove · "Talk to Ashwin" → https://calendly.com/mbbprepofficial/15min?utm_source=nextmove

---

## PART 7 — Talk screen `/talk/[id]`

Single column, max-width 640px, canvas bg, Wordmark top-left, ghost "Leave" → `/`.
States:
1. Ready: card "Before we begin": "About ten minutes, in three short acts. Stop any time." · "Speak naturally. The coach may push back." · "Nothing here is shared without your say." Primary "Begin" (this click requests the mic). Secondary "Type instead".
2. Connecting: orb at 40% opacity, "Connecting…".
3. Live: 96px accent orb centred; scales 1.0 → 1.08 in a 1.6 s loop while the assistant speaks (Vapi `speech-start` / `speech-end`), rests otherwise. Status "Listening" / "Coach is speaking". Header: `Act N of 3 · <name>` left, elapsed right. Below the orb: the last two turns as large captions (coach in ink, you in muted). Ghost toggle "Show full transcript". Controls (fixed bottom on mobile): secondary "Mute" (`vapi.setMuted`), primary "See my next move", ghost "Type instead".
4. Failed: the F2 card.
5. Text mode: transcript list + composer (textarea + "Send"; Enter sends, Shift+Enter newline). Keep "See my next move".
6. Writing: orb still, "Writing your next move…", muted "Usually under twenty seconds." Never leave this state without navigating or showing an error with "Try again".

---

## PART 8 — Output page `/r/[id]` ("Your next move")

Max-width 720px. Top to bottom:
1. Wordmark + eyebrow "YOUR NEXT MOVE".
2. H1: `chosenPath.name`. Under it the realism Badge and `chosenPath.whyItFits`. Then one muted line: the trigger sentence (`push` → "You're being pushed more than pulled." / `pull` → "You're being pulled more than pushed." / `drift` → "You're drifting more than being pushed or pulled.").
3. Eyebrow "THE FIRST MESSAGE". A message card (surface, shadow). Line "To: {contact.name}{contact.relation ? ` · ${relation}` : ''}". The message body as a paragraph, selectable. Buttons: primary "Copy message" (clipboard; label becomes "Copied" for 2 s), secondary "I sent it" (POST `/api/sent` → button becomes "Sent ✓", disabled). If `contact.name` is null: above the buttons show an inline input "Who do you know in this world? First name" + button "Write it for them" → POST `/api/contact` {id, contactName} which calls `draftMessage`, stores via `setContact`, and swaps the message in place.
4. Eyebrow "WHAT HAS TO STAY TRUE": anchors as chips. Two short columns "Moving away from" / "Moving toward".
5. Eyebrow "THE OTHER DOORS": compact list of `otherPaths`: name, Badge, one line `whyItFits`, muted `firstGap`. No buttons.
6. "Your next 30 days" card (accent-wash): `experiment` and "Decision date: {15 October 2026 format}".
7. Actions: primary "Share this page" (copies URL, "Link copied" 2 s, POST `/api/share`) · secondary "Talk it through with Ashwin" (Calendly link above).
8. `<details>` "Read the transcript".
Never render `privateItems`. Keep server-side stripping.

`opengraph-image.tsx`: canvas bg, Wordmark top-left, `chosenPath.name` large in Inter Tight, realism badge, `headline` muted under it (max two lines), "nextmove-pi.vercel.app" bottom right. No message text, no contact name, no private items.

APIs: `/api/sent` (POST {id}), `/api/contact` (POST {id, contactName}); keep `/api/select`, `/api/share`, `/api/session`, `/api/chat`, `/api/roadmap`.

---

## PART 9 — Admin `/admin?key=`
Counters: started, act1, act2, act3, written (nextMove not null), sent, shared. Below: last 25 sessions table (createdAt, source, actReached, sent, shares, link to `/r/[id]`). Primitives only.

---

## PART 10 — Verification before commit
- `npm run build` and `npm run lint` pass.
- Browser at 375px and 1280px: `/`, `/talk/[id]` text mode through three answers to `/r/[id]`, copy message, "I sent it", share, `/admin?key=`. Fix anything broken.
- F1: "See my next move" after one answer shows the inline line and does not navigate.
- Contact-null path: a transcript that never names a person renders the inline name input, and "Write it for them" swaps in a message.
- Write `MILESTONE-B-REPORT.md`: verified, not verified, deviations with reasons.

Stop after the commit.
