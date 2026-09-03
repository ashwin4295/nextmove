# PLAN-M-D.md — NextMove milestone D: the real design ("The next chapter")

Work inside THIS repo only. Live at https://nextmove-pi.vercel.app. Keep every route, API, Convex function, PostHog event and counter working exactly as they are after milestone C. Do not touch `.env.local`, `convex/`, `docs/`, `src/lib/extract.ts`, `src/lib/script.ts`, or any `src/app/api/*` route except where PART 6 says so. Only new dependency: none (fonts via `next/font/google`). Commit with message `feat: milestone D — editorial design system, landing, session and result screens` ending with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`. DO NOT push. Copy is FINAL: reproduce verbatim. No em dashes in visible copy. Every screen must be understandable with animation off.

Design source: `docs/DESIGN-BRIEF.md` (read §4, §5, §6 first). Where this plan and the brief differ, THIS PLAN WINS; it adapts the brief to what the product actually does.

Product facts you must not contradict in copy: the conversation is about ten minutes, voice or text; the output is one chosen path with an honest realism read, the other doors, a first message drafted to a person the user named, a 30-day experiment and a decision date; audio is not stored by NextMove (PART 6 turns Vapi recording off); transcripts are stored so the result page works; the shareable card never shows private items; Ashwin is not on the call. It is free during Build Week. Do not invent numbers.

---

## PART 1 — Visual system (replace tokens in `globals.css`; update `src/lib/ui.tsx` primitives)

Art direction: "The next chapter". Ivory editorial canvas, ink type, deep forest actions, sage surfaces, one warm accent used rarely. One recurring motif: a thin route line that branches into options and ends at a selected point. It appears in exactly three places (hero scene, result page header, closing section). Nowhere else.

Tokens:
- `--canvas #F7F6F2` · `--surface #FFFFFF` · `--sage #E7ECE5` · `--line #D8DDD5` · `--ink #20251F` · `--muted #586257` · `--forest #204B3A` (primary action, active markers) · `--forest-deep #17372B` (hover, dark band) · `--warm #B56B45` (illustrative emphasis only, never body text) · realism badges: strong fit forest on sage; realistic `#1F4E79` on `#E4EEF7`; a stretch `#8A5A2B` on `#F6EBDD`; long shot muted on `#EEF0EC`.
- Type via `next/font/google`: display **Source Serif 4** 400/500 for H1, H2 and result headline only; **Inter** 400/500/600 everywhere else. Desktop H1 clamp(2.75rem, 5.2vw, 4.75rem) line-height 1.05; H2 clamp(2rem, 3.4vw, 3rem) line-height 1.1; body 1.0625rem/1.65 (17px on mobile); eyebrow 0.75rem uppercase 600 tracking 0.12em muted; product-preview text never below 15px.
- Layout: 1200px max, 12 columns, 24px gaps; mobile gutters 20px. Section padding 104px desktop / 56px mobile; trust band 72/48.
- Buttons 50px high, radius 10px (NOT pill), primary forest bg white text 15px 600, hover forest-deep; secondary 1px line border ink text; ghost text link with underline on hover. Cards radius 16px, 1px line border, no shadow except the hero scene and the message card (`0 12px 32px rgba(32,37,31,0.08)`). Focus ring 2px forest offset 2px everywhere. Touch targets ≥ 44px.
- Motion: controls 200ms, scene changes 350ms, fades and ≤12px translations only; all under `prefers-reduced-motion: no-preference`; nothing hidden by default; no parallax, no pinning, no autoplay audio.
- Delete the old teal tokens and the old orb pulse; replace the orb with the waveform component below.

Primitives to add/replace in `src/lib/ui.tsx`: `Button`, `Eyebrow`, `Badge`, `Wordmark` (Inter 600, "Next" ink "Move" forest), `Container`, `Section({tone:'canvas'|'sage'|'forest'})`, `RouteLine({variant:'hero'|'result'|'closing'})` (inline SVG, stroke line 1.5px, three branches, one filled endpoint), `Waveform({state})` (five 3px bars, heights animate only in Listening/Speaking, static otherwise), `StateLabel`.

---

## PART 2 — Landing page `/` (rewrite `landing.tsx` + `page.tsx`)

### 01 Navigation
Sticky, canvas bg, hairline after scroll. Left: Wordmark. Centre (desktop only): "How it works" (#how) · "See an example" (#example) · "About" (#about). Right: primary "Start a conversation" (#start). Mobile: Wordmark + primary button only.

### 02 Hero (asymmetric 5/7; stacked on mobile; id="start")
Left column:
- Eyebrow: "A CAREER CONVERSATION, BUILT AROUND YOU"
- H1 (serif): "You've come this far. What comes next?"
- Sub: "Talk it through with an AI coach for about ten minutes. It asks what a good coach asks, tells you which door actually fits and how real your shot is, and writes the first message to someone you already know in that world."
- Inline form (existing fields: first name, email; keep the milestone C validation and API): inputs side by side on desktop, stacked on mobile; button "Start a conversation".
- Small line: "About ten minutes · Voice or text · Free during Build Week"
- Trust line: "Questions written by a coach who has guided 1,000+ professionals through career transitions. Ex-Bain. INSEAD MBA."
Right column, the product scene (surface card, 16px radius, the shadow), labelled top-left in a small muted chip "Illustrative example". It shows the transformation in three connected levels, joined by `RouteLine variant='hero'`:
1. Input row: a small waveform (static) + "Priya, 8 years in customer operations" + quote in serif: "I like improving how things work. Lately I'm only reporting on dashboards."
2. Themes row: three chips "Wants ownership" · "Needs income stability" · "Enjoys improving systems".
3. Direction row: label "Next move" + "Business operations" + Badge "realistic" + one line "Builds on your systems experience. The broader scope and the day-to-day still need testing." + a thin message preview line: "First message → to Meera, ex-colleague now in business ops".
No phone frame, no fake timer, no floating widgets. Mobile: the same three levels stacked, full width, text ≥ 15px.

### 03 Recognition (editorial question index; id="recognise")
Left third: H2 "You don't need a perfect plan to begin." Right two-thirds: four full-width rows separated by hairlines, native `<details>` with one open at a time (close others via a small script), plus/minus indicator:
- "I'm doing well. I'm not sure I want more of this." → "The conversation starts with what changed, not with job titles. Doing well and wanting out is a real signal, not ingratitude."
- "I want a change without starting from zero." → "Most good moves are adjacent. The coach looks for the door that reuses what you already know."
- "I can see several paths. I don't know which fits." → "You will be asked which one pulls you, and then what you would give up. That is usually where the answer is."
- "I'm not sure I need a new role, or a different way to work." → "Staying and reshaping the role is one of the doors, and the coach will say so if that is the honest read."
Each open row shows a ghost link "Start here" → `#start`.

### 04 How it works (stage rail above one canvas; id="how"; sage band)
H2: "From your story to a door worth walking through."
Rail: three stages, number + label + one line; selected stage has a forest marker bar and 600 weight. Clicking a stage swaps the canvas below (client state, no layout shift, fixed canvas height). Mobile: three stacked mini-scenes in order, no rail.
1. "Tell your story" — "About ten minutes. What changed, what you are moving toward, what has to stay true." Canvas: the session screen in miniature: state label "Listening", the question "What's prompting this now? What changed in the last six months?", two transcript lines from Priya, labelled controls Mute · End · Switch to text.
2. "See the doors" — "Two or three directions, each with an honest read on how real it is for you." Canvas: three compact option rows for Priya: Business operations (realistic) · Customer operations elsewhere (strong fit) · Product management (a stretch), each with one line and a "What needs checking" line.
3. "Take one step" — "One named person, one drafted message, one experiment, one date." Canvas: the message card to Meera (short, 60 words), buttons Copy message · I sent it, and "Decision date: 15 October".
Same person, same story, all three panels.

### 05 The result (wide career brief; id="example")
H2 (serif): "A clearer direction. With the reasoning behind it."
Sub: "Career advice is either free and generic or ₹20,000 an hour, and both end in a document. The first conversation is what actually moves people. NextMove tells you which door, why, and who to talk to first."
Full-width paper surface (surface, 16px, hairline), header chip "Illustrative brief · Priya, 8 years in customer operations", then: "What we heard" two columns (Moving away from / Moving toward) and chips "What has to stay true"; then three option rows with consistent sub-headings "Why it may fit" · "What needs checking" · "The trade-off" · "One low-risk test"; then one selected action block "First message → Meera" with the draft and a muted note "You decide whether to send it. Nothing is sent for you."

### 06 Coaching approach and founder (portrait-led; id="about"; sage band)
Layout 5/7: left the note, right the portrait `/ashwin-founder.jpg` (already in `public/`; `next/image`, 16px radius, alt "Ashwin Shetty"). Mobile: heading, portrait, note.
H2: "Built around the questions that matter."
Note (first person, FINAL, 96 words):
"I spent fifteen years inside HR and organisation transformations, and a few more at Bain. The moment I kept seeing was the same: a capable person, nine years in, who knew they wanted a change and could not say what. Free advice was generic. A good coach was ₹20,000 an hour. So I wrote down the questions that actually unlock people, in the order that works, and built a coach that asks them. It is an AI. I am not on the call. But the questions are mine, and I read the transcripts."
Signature line: "Ashwin Shetty · Ex-Bain · INSEAD MBA · 1,000+ professionals coached"
Three principles under the note as a hairline list: "Understand what you want to change, not just your title." · "Take your constraints seriously." · "Leave room for staying, moving sideways, or trying something small first."

### 07 Trust band (forest background, white text; id="trust")
Left: H2 "Know what happens to your story." Right: four factual rows, label + one line:
- "Audio" — "Not stored. Your voice is processed live to make the conversation work and is not kept by NextMove."
- "Transcript" — "Stored, so your result page and your message keep working. Processed by the AI providers that run the coach; not used to train them by us."
- "Sharing" — "Your result page is private unless you share the link. Anything you ask to keep private never appears on the shareable card."
- "Sending" — "Nothing is sent for you. You copy the message and decide."
Small link "How this works in detail" → `#faq`.

### 08 FAQ (split; id="faq")
Left third H2 "Questions people ask first." Right: native `<details>` accordion, hairlines, plus/minus:
- "Is this an AI or a human coach?" — "An AI, running a script written by a real coach. For the hard calls, book the human at the end of your result."
- "What if I don't know what I want next?" — "That is the normal starting point. The first act is about what changed, not what you want."
- "Can I type instead of speaking?" — "Yes. Type instead works the same way and gives the same result."
- "Will it help me find a job?" — "No. It helps you decide the direction and start the first conversation. Job search comes after, and it is not this product."
- "Can the next move be staying where I am?" — "Yes, and the coach will say so if that is the honest read. Stay and reinvent is one of the doors."
- "What does it cost?" — "Free during Build Week. A paid pack with more drafted messages is coming."
- "What happens to my conversation?" — "Audio is not stored. The transcript is, so your page works. Nothing is sent to anyone unless you send it."

### 09 Closing (typographic; id="close")
Centered serif H2 "Your next move starts with a conversation." Sub "You don't need to have the answer before you begin." Primary "Start a conversation" → `#start`. Small "Prefer to type? You can." `RouteLine variant='closing'` beneath. Footer: Wordmark · "Privacy" (→ `#trust`) · "GitHub" → https://github.com/ashwin4295/nextmove · "Talk to Ashwin" → https://calendly.com/mbbprepofficial/15min?utm_source=nextmove · muted "Built during GrowthX Build Week, September 2026".

---

## PART 3 — Session screens `/talk/[id]` (restyle; keep all logic, events, guards)

Single column, 560px max, canvas. Header: Wordmark left, ghost "Leave" right. Under it the phase row: "Your story · Your options · Your next step" with the current phase in 600 forest (map act 1/2/3 to these; keep the existing act detection).

A. Ready (replaces "Before we begin"): H2 serif "Let's get ready to talk." Three hairline rows: "About ten minutes, in three short parts. Stop any time." · "Your voice is not stored. The transcript is, so your result works." · "Nothing is sent for you." Primary "Enable microphone and start" (this is the click that requests the mic and starts the call). Secondary "Write it out instead". Small muted "You're speaking with an AI. Ashwin is not on the call."
B. Connecting: Waveform static, StateLabel "Connecting".
C. Live: Waveform (animates in Listening and Speaking), StateLabel one of "Ready when you are" / "Listening" / "Thinking about what you shared" / "Speaking" (map: before first assistant speech → Ready; user turn → Listening; between user final transcript and assistant speech-start → Thinking; speech-start → Speaking). Below: the current coach question in serif 1.25rem (last assistant turn), then the last user line muted, then ghost "Show full transcript". Control bar pinned to the bottom on mobile with safe-area padding: secondary "Mute" (toggles label to "Unmute"), primary "See my next move", ghost "Switch to text". No timer pressure: show elapsed in small muted text only.
D. Blocked: H2 "Microphone access is blocked." Body "Your browser blocked the microphone, or the call dropped. Allow the mic in the address bar and try again, or write it out instead. You get the same result either way." Primary "Try again", secondary "Write it out instead", ghost `<details>` "How to allow the microphone" with three lines: Chrome (lock icon → Site settings → Microphone), Safari (Safari menu → Settings for this website), Mobile (browser site settings, then reload).
E. Text mode: the transcript list with the coach lines in serif and a composer at the bottom (textarea, "Send"); keep "See my next move".
F. Writing: Waveform static, StateLabel "Writing your next move", muted "Usually under twenty seconds."

---

## PART 4 — Result page `/r/[id]` (restyle; keep all logic, buttons, events)

720px max. Top: Wordmark, then `RouteLine variant='result'` small, then eyebrow "YOUR NEXT MOVE".
1. H1 serif = chosenPath.name; Badge; whyItFits as body; trigger sentence muted.
2. "What we heard" (paper card): two columns Moving away from / Moving toward; chips under "What has to stay true". Add a ghost link "That's not quite right" that reveals a textarea "Tell the coach what it got wrong" + button "Update my next move" → POST `/api/roadmap` with `{ id, transcript: storedTranscript + [{role:'user', text: 'Correction: ' + input}], actReached }` and reload on success. Event `result_corrected`.
3. "The first message" card (the shadow): To line, message body, Copy message · I sent it (existing behaviour and events); muted line "You decide whether to send it. Nothing is sent for you."
4. "The other doors": rows with sub-headings "Why it may fit" and "What needs checking" (map to whyItFits and firstGap).
5. "Your next 30 days" (sage card): experiment + decision date.
6. Actions: primary "Share this page", secondary "Talk it through with Ashwin".
7. The pack section and `<details>` transcript, restyled, unchanged in behaviour.
OG image: ivory bg, serif path name, badge, headline, Wordmark.

---

## PART 5 — Admin
Restyle only with the primitives. No behaviour changes.

---

## PART 6 — Vapi recording off (the only API/config change allowed)
In the Vapi assistant config in `src/app/talk/[id]/TalkClient.tsx` add `artifactPlan: { recordingEnabled: false }` so the "Audio: not stored" line is true. Keep the cast that already exists for the config type.

---

## PART 7 — Verification before commit
- `npm run build`, `npm run lint` pass.
- 390px and 1440px screenshots of `/`, `/talk/[id]` ready state, text mode after three answers, `/r/[id]`, saved to `verification/` (git-ignored: add `verification/` to `.gitignore`).
- No horizontal overflow at 360, 390, 768, 1440.
- Keyboard: tab through the landing form, the FAQ and the session controls; visible focus everywhere.
- Correction flow on `/r/[id]` re-generates and reloads.
- Write `MILESTONE-D-REPORT.md`: verified, not verified, deviations with reasons.

Stop after the commit.
