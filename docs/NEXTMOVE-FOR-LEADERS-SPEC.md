# NextMove for Leaders — product spec v0 (for discussion, not for build)
Fable 5.1, 2026-09-04. Founder-stated direction: leaders 10+ years, transition into more meaningful roles inside or outside the company, diagnosed on four capabilities, routed to the programme that closes the gap.

## 1. One paragraph
Rahul, 41, Senior Engineering Manager at a Bangalore GCC, twelve years in. Every appraisal he is told he is "solid" and passed over for the Director role, or he wonders whether the more meaningful move is a lateral, a smaller company, or reshaping what he already runs. Today he reads LinkedIn, asks a mentor, or pays ₹20,000 for a coach who tells him to "work on presence." NextMove for Leaders: he talks for twelve minutes about a real decision he is facing. He gets an honest read on where he stands on four capabilities, the door that fits, and the first message to the person who decides or who is already there. It worked if he books the programme that closes the gap the read named.

## 2. What it is, in one line each
- A twelve-minute voice conversation, text fallback, on the existing engine.
- An assessment disguised as coaching: the leader's own situation is the material; scoring is invisible until the end.
- Four capabilities, three bands each. Never a percentage.
- A result page that ends in a prescription: the door, the gap, the first message, the programme.

## 3. The four capabilities and what "evidence" means for each
| Capability | What we are listening for | Band 1: developing | Band 2: solid | Band 3: next-level |
|---|---|---|---|---|
| Strategic thinking | Can they name the bet, the alternatives they rejected, and what would change their mind | Describes activity, not a bet | Names the bet and one alternative | Names the bet, the rejected options, the kill criteria, and the second-order effect |
| Problem solving | Structure under ambiguity, using their own live problem | Jumps to a solution | Breaks the problem into parts | Isolates the driver, states what they would test first and why |
| Executive communication | Answer first, then reasons, in the time an executive gives | Narrates chronologically | Gets to the point with prompting | Answer, three reasons, the ask, unprompted, under 40 seconds |
| Leveraging AI to decide | Uses AI as a thinking partner and evidence engine, not a text generator | "I use ChatGPT for emails" | Uses it to draft and summarise | Uses it to pressure-test a decision, generate options, or model a scenario, and can describe one real instance |

Evidence rule: a band is assigned only from what the leader actually did or said in the conversation. Where there is no evidence, the result says "not enough to tell" for that capability, never a guessed band.

## 4. The conversation, three acts, about twelve minutes
Persona: senior mentor, reflects one line then asks one question, pushes back once when two answers conflict. Tone warm; posture assessing.

**Act 1 · Where you are (about 3 minutes)**
1. "Tell me what you run today, the way you'd tell a peer, not a recruiter."
2. "What's prompting this now? What changed in the last six months?"
3. "What are you moving away from, and what are you moving toward?"
4. "What has to stay true about your life for the next move to be a good one?"

**Act 2 · One real decision (about 6 minutes)** — the assessment, on their material
5. "Pick one decision you're facing at work right now that actually matters. Describe it in a minute." (problem solving: how they frame it)
6. "What's the bet you're making, and what did you decide not to do?" (strategic thinking)
7. "If your CEO gave you thirty seconds in the lift to tell them what you've decided and why, go." (executive communication; timed by the coach, not by a visible clock)
8. Push-back: "You said X earlier and Y just now. Which is it?" (used once, where the conflict is real)
9. "Have you used any AI on this decision? Walk me through exactly what you did with it." (AI leverage; follow-up if vague: "What would you ask it tomorrow morning?")

**Act 3 · The door and the first move (about 3 minutes)**
10. "From what you've told me, I see two or three doors: [bigger role here / bigger scope elsewhere / a lateral into a function that's growing / operator or founder / stay and reshape it, including becoming the AI-native leader on this team]. Which one pulls you, honestly?"
11. "Who decides that, or who is already living it? First name, and how you know them."
12. "What would you actually want to ask them?"
13. If the door is "bigger role here", two extra probes: "Would what you described have happened without you?" and "Is there next-level scope to step into, or would they be promoting you into nothing?"
14. "Anything you want kept private, or said louder?"

Closing line, then the read is written.

## 5. The result page: "Your read"
1. Headline: the door, with the realism word (strong fit / realistic / a stretch / long shot).
2. The four capabilities as four rows: capability, band as a word, one sentence of evidence quoted from what they said, one sentence on what next-level looks like for them. "Not enough to tell" rendered honestly.
3. The gap that matters most for the door they chose. One paragraph. This is the sentence the programme sells against.
4. The first message, to the person from question 11, drafted in their words. Copy · I sent it.
5. What has to stay true (anchors), moving away from / toward.
6. The other doors, compact.
7. Next 30 days: one experiment tied to the biggest gap, plus a decision date.
8. Two actions: "Talk it through with Ashwin" (strategy call, primary) and the programme card that matches the gap: ANL when the biggest gap is executive communication, problem solving or AI leverage; The Director Loop when the door is up-or-across and the gap is strategic scope or sponsorship. Price-silent, per the coaching rule.

## 6. What the founder gets
- Every finished conversation: name, email, door, four bands, the biggest gap, the transcript. This is the qualification data for the strategy call before the call happens.
- A weekly list: who chose which door, who has which gap, who booked.

## 7. What changes from NextMove today
- Script: Act 1 unchanged in spirit; Act 2 is new (the real decision); Act 3 gets the leader doors, the decider as contact, and the two "up here" probes.
- Extraction: adds `capabilities[4] { band, evidence, nextLevelLooksLike }` and `biggestGap`. Evidence must quote the transcript.
- Result page: adds the four rows, the gap paragraph, the programme card. Everything else exists.
- Landing: new persona (Rahul), new copy, "Get your read" as the CTA. Design system unchanged.
- Nothing else. Same engine, same repo, same Vapi and Convex.

## 8. Open questions for the founder, before any build
1. Is twelve minutes right, or is the assessment act worth stretching to fifteen for this buyer?
2. Bands: three words. Proposed "developing / solid / next-level". Better words?
3. Should "not enough to tell" be shown, or should the coach ask one more question until it can tell?
4. The lift question is timed silently. Should the leader be told it is timed?
5. Brand: NextMove for Leaders as its own page, or as the front door of The Director Loop.
6. Which programme card appears when the gap is AI leverage and the door is "bigger role here": ANL, Director Loop, or both?
