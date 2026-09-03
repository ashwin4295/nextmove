# IDEA_SCOPE.md — NextMove
GrowthX Build Week, Season 03. Solo. Submit Sat 5 Sep 2026, 11:00 IST. Demo 15:00 IST.
Primary track: **Virality**. Cross-track: AI Agent as a Service (the coach runs the whole conversation unattended). Revenue optional, §4.
Control plane for the build. Update this file, not your memory. Written Thu 3 Sep 2026. Time left: Thu night, Fri night, Sat morning.

Statement sources: (S) stated by founder · (V) verified from a public source · (I) inference.

---

## 0. Idea lock

| Field | Locked |
|---|---|
| One sentence | An AI career coach you talk to: a 30-minute voice conversation about where you have been, what is pushing you to move and what you will not give up, ending in a career transition roadmap with your options and one next step. (S) |
| The person | Indian professional, 4–15 years in, who wants a change but cannot say what. Engineer to product, product to growth, anyone into AI, operator to consulting, the MBA question. (S: broad on purpose, niche later) |
| The pain | Career advice is free and generic, or ₹20,000 an hour and slow. So they read LinkedIn, take a quiz, ask two friends, and drift another year. |
| Core action | User talks for up to 30 minutes → gets a Transition Roadmap: 3–4 paths open to them, a realism grade per path, the one experiment to run this month, a decision date. User picks a path. |
| v1 does | Landing → voice conversation (Vapi) in three acts → transcript to Convex → Claude builds the roadmap → `/r/[id]` page with selectable paths and a share card. |
| v1 does NOT | Jobs, LinkedIn matching, applications, accounts, history, re-runs, editing, PDF, email, payments beyond one link, anything from MBB Prep code. |
| Riskiest assumption | Strangers will stay in a voice conversation with an AI for 20+ minutes from a cold link, and finish. (I: Pluto chose 10 minutes for a reason, V) |
| First three users | 1 coachee at 5–10 yrs who has mentioned a switch · 1 GrowthX Build Week member · 1 LinkedIn contact who posted about a job change in the last 90 days. |
| Distribution | GrowthX #build-week (the post is written, tag @Shaktimaan @UD) · WhatsApp to 10 coachees · one LinkedIn post with your own roadmap card · Kit broadcast to masterclass registrants. |
| Saturday numbers | Conversations started · reached act 2 · reached act 3 · roadmaps generated · paths selected · cards shared. |
| Non-goals | Recruiter side (Pluto's business, V). Niching. Jobs. |

---

## 1. Design rule that makes 30 minutes survivable

Depth from questions, not clock. Three acts; a roadmap is generated at the end of ANY act, so a person who stops at 12 minutes still gets something worth sharing.

- Act 1 · The trigger (8–10 min): what is prompting this, away-from vs toward, energy evidence.
- Act 2 · The anchors (8–10 min): non-negotiables, envy, what they have tried, the cost of staying.
- Act 3 · The paths (8–10 min): coach names 3–4 candidate paths from acts 1–2, tests each aloud with the user, asks the 3-year question.

Hard cap 32 minutes. Coach says at each act boundary: "I have enough for a first roadmap. Want to go deeper, or see it now?" Both answers are wins; the counter records where people stop.

---

## 2. Interview script v1 (S: founder's coaching style · V: frameworks named · I: Fable's synthesis; founder edits before the prompt is written)

Persona: a senior mentor who has sat through a thousand of these. Reflects one line, then asks one question. Never lists. Never lectures. Pushes back once per act when two statements conflict.

**Act 1 — the trigger** (Bridges: transitions begin with an ending; Burnett & Evans: energy evidence)
1. "Tell me what you do today the way you'd tell a friend, not a recruiter."
2. "What's prompting this now? What changed in the last six months?"
3. "What are you moving away from? … And what are you moving toward?" (probe the second half; most can't answer it)
4. "When were you last completely absorbed at work? Walk me through that day."

**Act 2 — the anchors** (Schein: career anchors; Ibarra: envy and experiments)
5. "What has to stay true about your life for the next move to be a good one?" (money floor, city, family, health, visa, time)
6. "Whose career do you envy? What specifically?"
7. "What have you already tried, and what did you learn?"
8. "What does staying exactly where you are for two more years cost you?"
Push-back slot: "You said X earlier and Y just now. Say more."

**Act 3 — the paths** (Ibarra: possible selves; Johnson/Blake: pivot from a stable base)
9. Coach proposes: "From what you've told me, I see three or four doors: [A], [B], [C], maybe [D]. Let's test them." For each: "What would the first month of [A] actually look like for you?"
10. "If [A] took three years and you knew you'd succeed, would you still want it?"
11. "Who have you told, and what did they say?"
12. Close: "Anything you want kept private, or anything you'd want said louder?"

**Extraction (Claude, JSON):** headline, years, trigger type (push / pull / drift), away_from, toward, energy_evidence, anchors[], envy, tried[], cost_of_staying, paths[3–4] each {name, why_it_fits, realism 1–5, first_gap, first_experiment}, decision_date, private[].

**Path vocabulary** (S: keep broad): Product · Growth · AI / applied AI · Engineering · Consulting / strategy · Founder / operator · Leadership rise in current function · MBA as a route (never a verdict) · Stay and reinvent.

Roadmap page = act-3 output rendered: paths as selectable cards, realism as words not numbers, one experiment, one date. Share card = headline + the chosen path + one-line reason. Private items never render.

---

## 3. Riskiest-assumption test — BEFORE any code (Thu 3 Sep, 30 min)

DM 10 people who fit §0:
> Building this for Build Week: you talk to an AI career coach for up to 30 minutes about what you've done and what you want next, and it hands you a transition roadmap: your options, how realistic each is, one experiment for this month. Would you do it Friday night and tell me where it breaks?

Pass = 5 of 10 yes. If fewer than 3 → lead copy becomes "15 minutes" and act 3 becomes optional; product unchanged.
Log in §8.

---

## 4. Stack (fixed) and optional revenue

- Claude Code (you); Cursor dispatch for boilerplate. Fresh public repo `nextmove`. No MBB Prep imports.
- Next.js on Vercel. Convex: sessions, act-boundary events, transcripts, roadmaps, selections, shares.
- Voice: **Vapi** (S: already wired, handles endpointing and turns). ElevenLabs voice inside Vapi if quality matters. Text fallback on the same page.
- Generation: Claude API, one call at each act boundary (cheap, gives the "see it now" option).
- Share: `/r/[id]` with OG image via `next/og`.
- Optional revenue, only if M-A ships by Thu 23:00: one button on the roadmap, "Talk this through with Ashwin, 30 min" → existing Calendly, and a ₹999 payment link for a written version of the roadmap. Ignore if behind.

---

## 5. Milestones, hard-coded

| # | Build Week date | Milestone | This build |
|---|---|---|---|
| 1 | Sat 29 Aug | Pick an idea | DONE (this file, Thu 3 Sep). Post the GrowthX message tonight. |
| 2 | Sun 30 Aug | Build core flow | Thu 3 Sep evening. |
| 3 | Mon 31 Aug | First users | Fri 4 Sep, 19:00–20:30. |
| 4 | Tue 1 Sep | Distribute | Fri 4 Sep, 20:30 onward. |
| 5 | Wed 2 → Fri 4 Sep | Build, user calls, build again | Fri 4 Sep, 21:00–22:30. |
| 6 | Sat 5 Sep 11:00 | Submit | Sat 5 Sep morning reserved. |

### M-A · Thu 3 Sep, 19:00–23:00 — ugly, hardcoded, complete, deployed
- §3 test first (30 min, no editor). Post the GrowthX message with "[link] coming tonight".
- One page: name + "Start the conversation". Vapi assistant with the §2 script hardcoded in the system prompt, act boundaries as explicit instructions.
- On each act end: transcript so far → Convex → Claude → roadmap JSON. On stop: `/r/[id]` with path cards, experiment, date, share button.
- Push to GitHub, deploy to Vercel, run it on yourself once on desktop and once on phone. Edit the GrowthX post with the live URL.
- **Acceptance:** a stranger opens the URL, talks, stops whenever, and sees a roadmap with selectable paths without you explaining anything.
- **If behind:** text conversation instead of voice; single act (act 1 + a shortened act 3); roadmap = paths + one experiment only.

### M-B · Fri 4 Sep, 19:00–22:30 — three users watching, distribute, fix, v2
- 19:00–20:30 three screen-shares, 30 min each. Say nothing. Note where each stops and which path they pick. Convex logs the act reached.
- 20:30–21:00 fix the single biggest stop. Deploy.
- 21:00–21:30 post: WhatsApp 10, LinkedIn post with your own roadmap card, Kit broadcast. Links carry `?src=growthx|wa|li|kit`.
- 21:30–22:30 watch sessions arrive. Fix the most common failure. `/admin` counters: started, act1, act2, act3, roadmaps, selected, shared.
- **Acceptance:** 3 observed sessions, 1 blocker fixed, 4 channels posted, share card renders in LinkedIn and WhatsApp previews, counters correct.
- **If behind:** 2 users, GrowthX + WhatsApp only, read Convex dashboard instead of `/admin`.

### M-D · Sat 5 Sep, 08:00–11:00 — verify, screenshot, submit
- 08:00 full run on a fresh browser and on phone.
- 08:30 screenshot counters → `/submission/`.
- 09:00 README: the one-paragraph test, the numbers, a 60-second Loom of a conversation ending on the roadmap.
- 10:00 submit on growthx.club. 10:30 hands off.
- 15:00 demo: 90 seconds live with a volunteer, jump to act 3, end on their roadmap card.

---

## 6. Parking lot (nothing here ships this week)
- Jobs: pull LinkedIn/job-board roles for the chosen path; apply-assist (S: "later")
- Niche skins: consulting-readiness (MBB Prep), MBA decision (MBA After 30), director push (Director Loop), stay-and-reinvent (ANL)
- Paid layer: founder-reviewed roadmap; 30-min debrief
- Accounts, history, re-run after the experiment, progress check-in at the decision date
- Hindi / Hinglish conversation
- Cohort mode for HR heads (People Function Partners)
- PDF and email delivery
- Pluto re-run decode (only if founder records his own session)

---

## 7. Public failure modes
- Voice drops mid-act → text fallback; transcript so far still yields a roadmap.
- User rambles → coach reflects one line and moves on; 32-minute hard cap.
- Roadmap reads generic → quote the user's own sentences in each path card; never a blank page.
- Card leaks something private → Q12 answers excluded from the card by rule.
- Every path always looks realistic → rubric forces at least one path graded "long shot" or one "stay and reinvent" when the evidence says so. Honesty is the product.

---

## 8. Log
- Thu 3 Sep: test sent to __ people. Yes: __. GrowthX post at __:__. M-A deployed at __:__.
- Fri 4 Sep: users observed __ / stop points __ / channels __ / started __ act3 __ roadmaps __ selected __ shared __.
- Sat 5 Sep: submitted at __:__.

---

## Next single action
Send the §3 message to 10 people now, then post the GrowthX message. Set a 30-minute timer. Do not open an editor until it rings.
