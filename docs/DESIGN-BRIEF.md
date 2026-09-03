# NextMove — Design direction and Fable 5.1 handoff

Prepared 4 September 2026. Revision 2 — updated with authenticated Mobbin MCP research. This is a proposed design specification, not a claim that the proposed features already work. No production website or application code was changed.

## Start here — what changed after Mobbin research

Keep Granola as the visual anchor, but replace broad brand-name instructions with the inspected references below. Use one reference for each design problem, not a collage of all their styles.

1. **Hero:** retain the asymmetric editorial/product composition, now tied to the actual Granola section, M01. One coherent career artifact, not a giant orb or multiple device mockups.
2. **Process:** replace the original left-hand step list with a compact horizontal stage rail above one large preview, adapting Sequence, M02. This frees the full content width for a readable voice-to-result demonstration.
3. **Founder:** give the real portrait and an approved first-person note more weight, using KÖPPEN and incident.io, M03–M04. Avoid another generic feature list.
4. **Onboarding:** use a short optional intent chooser, then voice/text choice. Adapt the simple single-question structure in M07; do not reproduce Motion's multi-question qualification form.
5. **Voice:** explicit status plus labeled controls, from M09, M10 and M14. Add an explanatory microphone step informed by M08. Do not infer emotions or display technical model settings.
6. **Result:** preserve a stable, readable career brief with contextual follow-up, drawing narrowly on M11–M12. No inspected reference validates a career-fit score or NextMove's recommendation method.
7. **Trust:** place a concise, verified data-use explanation at microphone entry as well as in the landing-page trust section. Grain, M05, helps make consent concrete; its policies are not NextMove's policies.

The strongest evidence-backed reference set for Fable is **M01 Granola + M02 Sequence + M03 KÖPPEN + M08 Whereby + M09 Copilot + M12 Fabric**. The other references solve narrower controls, structure, or error-state questions.

Research scope: 16 Mobbin searches; 12 website-section images, 13 standalone screen images, and six preview images from two four-screen flows visually inspected. Flow positions 1, 3 and 4 were supplied and inspected; position 2 of each flow was not visually inspected. Static images do not verify animation, accessibility, conversion performance, or live behavior. Full search and rejection notes are in [the research log](./NextMove-Mobbin-Research-2026-09-04.md).

## 1. The design decision

Build a warm, editorial, product-led career thinking space. The central story is: **your experience → plausible directions → one useful next step**.

Use Granola as the primary reference for warmth and editorial character, Cursor for product demonstration, and Stripe for concrete explanation. Borrow Pluto's human storytelling, not its recruiting proposition. Use Linear's interface discipline within results. Interpret Parcel as parcel.io, the email development platform; borrow its feature-to-demonstration relationship, not its developer-oriented styling.

NextMove should feel like a thoughtful conversation with a rigorous coach: personal, composed, candid, and useful. It should not feel like an applicant-tracking system, motivational course funnel, personality quiz, therapist, or generic chatbot.

The site currently addresses professionals in India with 4–15 years of experience. Preserve that audience for this design; broadening it is a separate product decision.

## 2. What the current site needs

The original review inspected the live desktop landing page and a 390 × 844 mobile viewport at https://nextmove-pi.vercel.app/. That earlier inspection is the baseline below; revision 2 adds Mobbin research, not another live-site or backend audit.

- Keep: readable typography, restrained teal, a short session proposition, voice/text choice, concrete output, and founder credibility.
- Improve: the hero has a dense paragraph and a small transcript card; the latter communicates chat more clearly than voice or career direction.
- Improve: repeated pale bands, ordinary three-card process, and mostly text-based sections provide little visual progression.
- Improve: the result example is a long outreach message. Career direction and its rationale need to be visible before outreach becomes the payoff.
- Improve: founder credibility is visually subordinate to generic feature statements.
- Improve: the mobile first screen is dominated by explanation, name entry, and reassurance; the product preview begins near the bottom of the captured viewport.
- Clarify: “at least one door is graded a stretch or a long shot” is not a sound trust promise. Evaluate each option honestly; never manufacture a negative assessment to appear rigorous.
- Verify before reuse: numerical coaching credentials, duration, free access, pricing comparisons, and privacy promises. Presence on the current website is not independent substantiation.

The proposed repositioning follows the latest brief: career understanding and next-direction advice are the primary value. A drafted message remains a possible first action, not the whole product identity. The design must not imply new backend functionality is already implemented.

## 3. Reference map

The first table records the original live-site direction. The second table supplies exact Mobbin references inspected for revision 2. These may be captures of different versions from today's sites. Visual judgments are design recommendations, not evidence of conversion performance.

| Reference | Borrow | Avoid |
| --- | --- | --- |
| [Granola](https://www.granola.ai/) | Editorial typography, warmth, product presented as a useful artifact | Copying its exact brand, illustrations, or maximal headline scale |
| [Cursor](https://cursor.com/) | Restrained copy, oversized legible product demonstration | Code density and developer language |
| [Stripe](https://stripe.com/) | Showing how a capability creates a concrete benefit; disciplined hierarchy | Enterprise mega-navigation and decorative gradients as the main idea |
| [Pluto](https://talentpluto.com/) | Human presence, a short conversation premise, clear story progression | Recruitment/discoverability promises and borrowed social proof |
| [Linear](https://linear.app/) | Consistent spacing, quiet controls, structured product surfaces | An all-dark career experience or tiny dashboard text |
| [Parcel](https://parcel.io/) | Pairing feature explanations with relevant interface examples | Long developer-feature inventories and email signup as the hero |

### Inspected Mobbin references — use by responsibility

Mobbin MCP searches succeeded in this revision. Canonical links below are the handoff references; temporary image links returned by the service are deliberately not used as durable assets. Reference images are inspiration, not licensed NextMove artwork. Do not publish reference brands' UI, faces, copy, or logos as NextMove assets.

| ID / inspected reference | What the supplied image actually shows | NextMove instruction / limit |
| --- | --- | --- |
| [M01 — Granola hero](https://mobbin.com/sites/sections/f98fa449-7e1f-451b-8bea-128af402ef1a) | Large serif headline left, short supporting copy and CTA, prominent note interface right with a smaller call view | Primary art-direction reference. Use the asymmetric hierarchy and tangible output; remove the collage of devices and decorative materials. |
| [M02 — Sequence process](https://mobbin.com/sites/sections/27bf1023-ba04-4af0-ae50-5fad11815613) | Four numbered stages in a horizontal rail above one large interface; first stage is accented | Adapt to three stages above a single NextMove canvas. Click behavior is our proposal, not established by the screenshot. |
| [M03 — KÖPPEN founder note](https://mobbin.com/sites/sections/81d6349f-9811-4b17-9b2d-327dbabfa4fa) | A small note at left, large founders' portrait at right, substantial negative space | Borrow portrait prominence and editorial asymmetry; make the text considerably more readable and reduce the empty span. |
| [M04 — incident.io founder note](https://mobbin.com/sites/sections/67e11461-af20-4b7e-8e9a-8f0cdc669a8d) | Serif heading left, personal note on the right, small team photograph and signatures beneath | Borrow personal authorship, not text volume or fabricated signatures. Use only an approved note from Ashwin. |
| [M05 — Grain privacy section](https://mobbin.com/sites/sections/68dc4f4e-2d13-4a81-9060-f9195553706f) | Privacy explanation beside role/access illustration, followed by recording-consent content | Explain specific data and consent decisions. Do not copy Grain's guarantees or add nonfunctional permission switches. |
| [M06 — Mixpanel FAQ](https://mobbin.com/sites/sections/67d59fad-c6e5-43b0-814b-469bcf735e79) | Single question column, one expanded answer, plus/minus indicators on a dark surface | Use the single-column question rhythm and explicit open state; retain our pale split-layout section and larger body text. |
| [M07 — Perplexity intent choice](https://mobbin.com/screens/be77de08-7011-42a4-914f-00a1368ec9c5) | One centered question with three vertically stacked choices and short explanations | Adapt the one-question/choice structure for optional career intent. Omit plan segmentation, discounts, and extra qualification. This is onboarding, not career advice. |
| [M08 — Whereby permission explanation](https://mobbin.com/screens/4aca8554-2b34-47e6-bf65-6919e3f6ea8a) | A compact panel explains camera/microphone access before a Request permissions button | Adapt to microphone only, with text fallback. Do not request a camera or copy its embedded-browser frame. |
| [M09 — Copilot listening state](https://mobbin.com/screens/c9b51af8-9575-4b5c-83c5-eb74049c93bf) | A centered listening label on a quiet visual field; compact controls at the bottom | Use a clear current-state label and uncluttered main pane. Add text labels and a visible prompt; do not make icon recognition or a scenic background essential. |
| [M10 — Hume AI conversation flow](https://mobbin.com/flows/4ff55c9b-55f0-4e9b-9047-12e0967ab251) | Previews 1/4, 3/4, 4/4 show device choice/start, a started conversation, and transcript turns with bottom call controls | Borrow preparation → active session continuity. Exclude developer sidebars, model controls, technical events and emotion scores. No completed/end-state transition was inspected. |
| [M11 — Evernote document](https://mobbin.com/screens/1554fa7d-6f46-4d56-9fbf-816a3d025c28) | A meeting document with headings, bullets, action items, selected text, and an AI editing menu | Borrow readable document hierarchy and an obvious editing affordance only. Do not reproduce toolbars, notebooks, tone menus, or imply the screenshot proves AI-generated content. |
| [M12 — Fabric contextual assistant](https://mobbin.com/screens/d4f35df1-cb1c-4a16-9210-0a965907a279) | A document remains visible beside an Ask panel with a question, answer and follow-up controls | Keep the career brief stable when users ask about it. Open a contextual explanation panel on demand, rather than replacing the result with an endless transcript. |
| [M13 — Copilot mobile permission](https://mobbin.com/screens/f7eb3829-05da-4a2a-a987-e71c6c0d22fa) | Large permission instruction, bottom Allow access button and close control | Borrow mobile readability and a clear escape. This is native iOS: browser permission recovery must use browser-appropriate instructions, not promise it can open native settings. |
| [M14 — TextNow mobile call controls](https://mobbin.com/screens/944e21b5-8b44-4d5f-aaa0-7034f972417b) | Labeled controls near the bottom, with End separated visually in red | Borrow reachable labeled controls. NextMove needs Mute, Pause, End and a text switch—not keypad, add-call or telephony controls. The captured timer is not evidence that NextMove should pressure users with one. |

### Research decisions, not a mood board

- **Keep:** Granola's editorial/product balance and our ivory/forest system. The inspected reference strengthens this choice; it does not require a new palette.
- **Change:** Sequence's stage-over-canvas arrangement replaces the original process split. The larger preview is more useful for explaining a conversation and its output than a narrow product pane.
- **Add:** an optional intent chooser, context-aware result questions, explicit permission preparation, and mobile control states.
- **Reject:** Clay's four-card process for this page, Oryzo's giant object centerpiece, Motion's multi-question onboarding, and Mercor's recruiting marketplace layout. The last is a job-listing screen, not a career-recommendation report.
- **Keep bespoke:** career-option logic, trade-off comparison, uncertainty, correction, and the chosen next action. No inspected screen establishes these as validated coaching patterns. Retain these as NextMove hypotheses to test.
- **Do not infer:** live recording behavior, accurate emotion detection, voice reliability, performance benefits, or a conversion lift from visual reference screenshots.

## 4. Visual system

### Art direction: The next chapter

An ivory editorial canvas, ink typography, deep forest-green actions, and subtle sage surfaces. Keep continuity with the existing teal identity without copying its exact implementation. One thin route line is the recurring brand motif: it branches into options and ends at a selected next action. It must carry meaning, not decorate every section.

Proposed tokens, not measurements extracted from reference sites:

- Canvas: `#F7F6F2`.
- Primary ink: `#20251F`.
- Primary action: `#204B3A`, with white text.
- Soft surface: `#E7ECE5`.
- Dividers: `#D8DDD5`.
- Secondary text: `#586257`.
- Warm accent: `#B56B45`, used sparingly for illustrative emphasis, not unchecked small-text contrast.
- Display type: Source Serif 4, regular/medium; reserve for major editorial headings.
- UI/body type: Inter, regular/medium/semibold.
- Desktop H1: approximately 68–80 px, 1.02–1.08 line-height; H2: 42–52 px.
- Mobile H1: approximately 40–44 px; H2: 30–34 px; body: 17–18 px.
- Product-preview text must remain readable: approximately 15–16 px on desktop, never a scaled-down desktop screenshot on mobile.
- Desktop content width: 1200 px maximum, 12 columns, 24 px gaps; mobile gutters: 20 px.
- Section padding: approximately 88–112 px desktop, 48–64 px mobile. Use less for narrow trust bands.
- Buttons: 48–52 px high, moderate 10–12 px rounding. Cards: 16–20 px rounding, faint border, very restrained shadow.

Do not use glassmorphism, neon glows, a constellation of floating cards, giant AI orbs, forced gradients, or a generic logo cloud. Avoid applying the same card-grid composition to adjacent sections.

Photography: a genuine founder portrait in the credibility section is the highest-priority human asset. If additional photos are used, depict believable Indian professionals in reflective everyday situations, using licensed or consented images. No generated person presented as a real customer or testimonial. Missing authentic assets should be clearly marked placeholders.

## 5. Landing page, section by section

### 01 — Navigation: a quiet utility row

Purpose: orient the visitor without creating another decision tree.

Layout: wordmark left; “How it works”, “See an example”, and “About” centered; “Start a conversation” right. About can anchor to the founder section. Include a small sign-in link only if returning-user access exists. No mega-menu.

Mobile: wordmark, start action, and an accessible menu only if necessary. Avoid an additional floating bottom CTA competing with this navigation. Sticky navigation may use an opaque ivory surface and hairline border after scrolling.

### 02 — Hero: editorial headline plus a career-direction preview

Purpose: answer what this is, why it matters, and what the visitor receives.

Layout: asymmetric 5/7 split. Left is a calm editorial composition; right is a large product scene. Unlike the current equal-looking copy/card pairing, the preview should be large enough to explain an output. Keep generous breathing room, not a rigid full-screen minimum height.

Mobbin anchor: [M01 — Granola](https://mobbin.com/sites/sections/f98fa449-7e1f-451b-8bea-128af402ef1a). At 1440 px, use the 1200 px content grid: roughly 480 px for copy and 696 px for the scene, separated by 24 px. These are proposed layout dimensions, not source measurements. Keep the headline visually dominant on the left and the direction artifact visually dominant on the right. Do not let secondary badges, a waveform, or a fake phone frame become the focal point.

Copy:

Eyebrow: “A career conversation, built around you.”

Headline: “You’ve come this far. What comes next?”

Supporting copy: “Talk through your career with an AI coach. Explore what fits, understand the trade-offs, and choose a next step you can actually take.”

Primary action: “Start a conversation”. Secondary text action: “See an example”.

Supporting line: “Around 10 minutes · Voice or text”. Duration is an estimate and must be checked against real sessions before launch. State free access only if currently authorized and true.

Move first-name entry into the next screen as a design hypothesis to test; do not claim this has proven conversion lift. Do not require a CV or LinkedIn profile just to explore.

Product scene: one connected, clearly labeled “Illustrative example”, not unrelated floating widgets. Show a short input, extracted themes, and one direction with an explanation:

- Person: Priya, eight years in customer operations: “I like improving how things work. Lately I’m only reporting on dashboards.”
- Themes: “Wants ownership”, “Needs income stability”, “Enjoys improving systems”.
- Direction: “Explore business operations”.
- Rationale: “Builds on your systems experience; the broader scope and day-to-day fit still need testing.”

A fine route line links these three levels. A “Play example” interaction may progress through the scene, but never request the microphone or imply a real session is listening. Default to a readable static state; animation is optional and pausable.

Mobile: headline, concise copy, CTA, compact reassurance, then a purpose-built stacked preview. No rotated cards, tiny text, or clipped product UI. Test first-screen comprehension rather than forcing everything above a universal fold.

### 03 — Recognition: an editorial question index

Purpose: let people recognize their situation without a long problem essay.

Layout: small left-column heading; four full-width text rows on the right, separated by hairlines. One row can be expanded at a time. This is not another set of cards.

Heading: “You don’t need a perfect plan to begin.”

Rows:

- “I’m doing well. I’m not sure I want more of this.”
- “I want a change without starting from zero.”
- “I can see several paths. I don’t know which fits.”
- “I’m not sure I need a new role—or a different way to work.”

Each expansion offers one sentence about how the conversation can help. Optional “Start here” transfers that chosen prompt into onboarding; do not silently create a session just because a row opens.

Mobile: heading above the index; generous tap targets and visible focus states.

### 04 — How it works: one evolving product canvas

Purpose: demonstrate the transformation instead of describing three abstract features.

Layout: a compact three-stage horizontal rail sits above one full-width product canvas, adapting [M02 — Sequence](https://mobbin.com/sites/sections/27bf1023-ba04-4af0-ae50-5fad11815613). Keep each step to a number, short label and one supporting line. Indicate the selected step with a forest-green marker and weight change, not color alone. Give the preview a stable frame so switching stages does not shift the page. Clickable steps switch the preview; this interaction is a NextMove proposal, not a behavior verified in the static reference. No multi-viewport scroll trap or autoplay that prevents reading.

Heading: “From your story to a direction worth exploring.”

Steps and preview states:

1. **Tell your story.** A voice/text screen asks what has brought the person here. Show one question, a transcript excerpt, and labeled voice controls.
2. **Make sense of your options.** A summary connects experience, preferences, and constraints to plausible directions. Make “That’s not quite right” visible.
3. **Choose a useful next step.** A selected direction becomes a small real-world experiment, with an optional outreach draft.

The same fictional example should persist throughout. Do not introduce inconsistent job histories or different people between panels. Do not display a fake countdown or an invented probability of success.

Mobile: three normal stacked mini-scenes in the same order. Prefer this to shrinking the horizontal rail or hiding essential content in swipe-only tabs. Do not stack a sticky pane above a long empty scroll region.

### 05 — The result: a wide career brief

Purpose: make the value inspectable before a user speaks about sensitive career concerns.

Layout: full-width paper-like document surface, not a metrics dashboard. Header above, three comparisons inside, and one selected action across the bottom. This is the main product-proof section.

Mobbin anchors: document hierarchy from [M11 — Evernote](https://mobbin.com/screens/1554fa7d-6f46-4d56-9fbf-816a3d025c28), contextual questions from [M12 — Fabric](https://mobbin.com/screens/d4f35df1-cb1c-4a16-9210-0a965907a279). The career comparison itself remains bespoke. Keep an “Illustrative career brief” header, the person's stated priorities, equally structured options, and one chosen experiment. Avoid completion percentages, success rankings, and stock-market-style charts.

In the application result, provide “Why this direction?”, “What am I giving up?” and “What could I try first?” as contextual prompts. Selecting one opens an explanation beside the brief on wide screens, keeping the relevant option identified. At narrower widths, use an in-flow expansion beneath that option; do not squeeze two panels onto mobile. Explanations must cite the user's supplied context or mark assumptions. The result is not silently changed by asking a question; provide a separate explicit correction/update action.

Heading: “A clearer direction. With the reasoning behind it.”

Fictional input: “Priya · 8 years in customer operations · enjoys improving systems · wants more ownership · needs stable income.” Mark the entire example as illustrative.

Show three hypotheses, not guaranteed destinations:

- Adjacent move: customer operations at a different organization.
- Possible pivot: business operations.
- Stay and reshape: explore more ownership in the current role.

Each shows: why it may fit; what needs checking; the main trade-off; one low-risk test. The actual product must generate fewer options when information is insufficient rather than padding to three.

One illustrative action: “Speak with someone doing business operations. Ask what their week actually looks like.” Optional draft follows; allow editing and copying. Never show “Sent” merely because text was copied.

Design a “What I may be missing” disclosure and a way to correct the source summary. Prefer “Worth exploring, based on what you shared” to “92% fit”. Avoid salary forecasts and guaranteed transition timelines.

Mobile: stack options with consistent comparison headings; no sideways spreadsheet or carousel hiding alternatives.

Implementation note: this richer output is a design proposal. If current functionality only supports a selected path and outreach message, preserve those working outputs and mark broader comparison as prototype until implemented and tested.

### 06 — Coaching approach and founder: a portrait-led editorial feature

Purpose: establish why this conversation is meaningfully structured without pretending the AI is a human coach.

Layout: an approved first-person note in approximately 5 columns on the left and a genuine founder portrait in 7 columns on the right, adapting [M03 — KÖPPEN](https://mobbin.com/sites/sections/81d6349f-9811-4b17-9b2d-327dbabfa4fa) and the authorship of [M04 — incident.io](https://mobbin.com/sites/sections/67e11461-af20-4b7e-8e9a-8f0cdc669a8d). Place on a sage surface. Keep the note around 80–120 words, with readable body type; this is a target for approved copy, not permission to invent a founder story. Credentials sit beneath the name. No fabricated quote, signature or tiny initials avatar standing in for the whole story. On mobile, heading, portrait, then note.

Heading: “Built around the questions that matter.”

Proposed principles:

- Understand what you want to change, not just your job title.
- Take your constraints seriously.
- Leave room for staying, moving sideways, or trying something small first.

Use an approved founder bio and verified credentials. The live site lists Ex-Bain, INSEAD, and coaching experience; independently verify the numerical claims before treating them as substantiated proof. Credentials are text, not implied company endorsements. Make explicit: “You’re speaking with AI; Ashwin is not on the call.”

If genuine pilot testimonials later exist, place one compact outcome-focused quote here with permission. Omit the block entirely before then. Do not reuse Pluto's numbers, logos, customer identities, or quotes.

### 07 — Trust: a high-contrast, concrete information band

Purpose: address the risk a person feels when discussing dissatisfaction, income, ambition, or their current employer.

Layout: deep forest background. Large left-aligned statement; right column contains short policy-backed explanations. No pretend settings switches on a marketing page.

Mobbin anchor: [M05 — Grain](https://mobbin.com/sites/sections/68dc4f4e-2d13-4a81-9060-f9195553706f). Adapt its specificity about access and recording consent, not its assurances. Use a simple factual list such as “Audio”, “Transcript”, “Sharing”, with approved explanations. Also repeat a concise data-use disclosure immediately before voice entry; the footer policy is not the only place users should learn about recording. Unresolved data-handling facts are a launch blocker for that copy, not placeholders to publish.

Working heading: “Know what happens to your story.”

The final content must accurately explain:

- Whether audio is stored, and for how long.
- What transcripts or summaries are retained and which providers process them.
- Whether data is used for training.
- How access, sharing, and deletion work.

These are questions to resolve, not permission to promise ideal privacy behavior. Use “You decide whether to send the draft” only when the application truly does not send automatically. Do not claim end-to-end encryption, zero retention, deletion controls, or “never shared” without verification.

Mobile: simple stacked statement and explanations, with a readable privacy link.

### 08 — FAQ: split layout with minimal rules

Purpose: clear remaining objections without repeating the page.

Layout: heading in the left third; accessible accordion in the right two-thirds. Plain hairlines and plus/minus controls; avoid another vertical stack of rounded cards.

Mobbin anchor: [M06 — Mixpanel](https://mobbin.com/sites/sections/67d59fad-c6e5-43b0-814b-469bcf735e79) for single-column questions and explicit expanded state only. Keep our layout and colors. Do not adopt the inspected HubSpot two-column arrangement, which would split the reading sequence and complicate mobile scanning. Space the answer to remain readable rather than reproducing the reference's small dense text.

Questions:

- “Is this an AI or a human coach?”
- “What if I don’t know what I want next?”
- “Can I type instead of speaking?”
- “Will it help me find a job?”
- “Can the next move be staying where I am?”
- “What does it cost?”
- “What happens to my conversation?”

Answers must reflect current features and policy. Do not imply recruitment, job placement, universal language support, free lifetime usage, or access to external opportunities unless real.

### 09 — Closing invitation: a typographic finale

Purpose: make starting feel manageable.

Layout: centered display type on ivory; one clear CTA; subtle route motif resolving beneath it. No new form, competing offer, or last-minute sales pressure.

Headline: “Your next move starts with a conversation.”

Supporting copy: “You don’t need to have the answer before you begin.”

CTA: “Start a conversation”. Small “Prefer to type? You can.” note only if text mode works.

Footer: wordmark, contact, privacy, terms. Move Build Week provenance and GitHub into quiet secondary positions if retained. Do not imply the product is abandoned after a dated event.

## 6. Design the experience after the CTA

The marketing site and the actual session must use the same typography, color, voice state language, and result surfaces. A polished landing page leading to a generic chat screen breaks the promise.

### A. Welcome / mode choice

Centered single-column layout, approximately 560 px maximum width. Borrow the single-question structure of [M07 — Perplexity](https://mobbin.com/screens/be77de08-7011-42a4-914f-00a1368ec9c5), not its plan-selection purpose. Ask “What would be most useful today?” with three large text choices: “Explore a change”, “Compare a few directions”, “Think it through”. Include “I'm not sure yet” as a skip path. A choice only sets context; it must not determine the outcome. If a recognition-section prompt was already selected, carry it through and let the person edit it instead of asking again.

Then offer “Talk it through” and “Write it out” with one-line descriptions and an optional first name unless truly required. Explain that the experience is AI-guided and what output to expect. Keep microphone activation separate from intent selection. No mandatory CV, phone number, LinkedIn URL, or account creation solely for aesthetic completeness. Any authentication requirement should be explicit and justified. Do not copy the multi-question Motion flow or ask for theme preferences before delivering value.

### B. Microphone preparation

Adapt the explanatory panel in [M08 — Whereby](https://mobbin.com/screens/4aca8554-2b34-47e6-bf65-6919e3f6ea8a), narrowed to microphone only. Suggested heading: “Let’s get ready to talk.” Explain what access enables and the verified recording/transcript policy before the browser permission prompt. Include a visible “Use text instead” route. Request permission only after an explicit “Enable microphone” action. Permission success should lead to a ready state with “Start conversation”, not ambiguous auto-start. Show supported input/output selection if implemented, following the preparation preview in [M10 — Hume AI](https://mobbin.com/flows/4ff55c9b-55f0-4e9b-9047-12e0967ab251); do not invent device controls that do not function.

### C. Conversation

One prompt at a time. Restrained waveform with labeled states: Ready, Listening, Thinking, Speaking, Paused, Reconnecting. Visible mute, pause, and end controls. End should not trap users; confirm only when meaningful unsaved work is at risk.

Use [M09 — Copilot](https://mobbin.com/screens/c9b51af8-9575-4b5c-83c5-eb74049c93bf) for a clear state label, [M10 — Hume AI](https://mobbin.com/flows/4ff55c9b-55f0-4e9b-9047-12e0967ab251) for transcript/control continuity, and [M14 — TextNow](https://mobbin.com/screens/944e21b5-8b44-4d5f-aaa0-7034f972417b) for reachable, labeled mobile controls. NextMove's main pane should show the current coaching question and state, with a compact transcript beneath. Pin the control bar within the session layout, respecting safe-area and keyboard space. Use clear labels: “Mute”, “Pause”, “End”; place “Switch to text” nearby, not in an overflow menu. Do not include add-call, keypad, model selection, technical event logs, emotion bars, or fabricated speaker identities.

Use three descriptive phase labels: Your story / Your options / Your next step. These indicate structure, not a false linear percentage. Transcript remains readable; avoid forcing autoscroll when someone is reviewing earlier text. Switching modes should preserve context if supported.

### D. Review understanding

Before advice, show “Here’s what I heard” with experience, motivations, constraints, and uncertainties. Allow correction. Keep the initial summary short with optional detail; show missing information honestly rather than inventing it.

Use short labeled rows with “Edit” per row, then “That's right—show my options”. Keep missing facts as questions or “Not discussed”. This confirmation gate is a NextMove design judgment, not a pattern proven by the retrieved career-report query. Do not build an elaborate document toolbar simply because the Evernote reference has one.

### E. Directions and chosen action

Reuse the landing-page career-brief design. Make the user’s own words, the AI’s interpretation, and uncertainty visually distinct. Explain each option in everyday language. Allow rejection of all options or another question. Build toward one chosen experiment, not an overwhelming 90-day checklist.

Follow [M12 — Fabric](https://mobbin.com/screens/d4f35df1-cb1c-4a16-9210-0a965907a279) only for keeping the artifact in view during contextual questions. Do not convert the result into a job marketplace or add Apply, Referrals, recruiter rankings, or salary badges based on the rejected Mercor reference. A chosen action might be a conversation, a work experiment, or further reflection; it is not always outreach.

### F. Save / draft / exit

Provide only working export or save options. If an account is necessary to save, explain that at the moment of saving without withholding the promised result unexpectedly. A draft remains editable and user-sent. Never automatically email a manager, recruiter, contact, or employer.

### Required exception designs

Permission denied; unsupported microphone; silent input; session interrupted; reconnecting; generation failed; insufficient information; user declines a question; user wants to stop; text fallback; loading results; corrected summary; no suitable recommendation yet. Error copy should explain what happened and offer one useful recovery action.

For mobile permission recovery, [M13 — Copilot](https://mobbin.com/screens/f7eb3829-05da-4a2a-a987-e71c6c0d22fa) supports a large clear instruction and escape control, but its native iOS settings behavior must not be copied into a browser. For NextMove show: “Microphone access is blocked”, an actionable browser-specific help disclosure, “Try again” where meaningful, and “Continue with text”. Never keep retriggering an impossible permission prompt.

| State | Visible feedback | Available recovery / control |
| --- | --- | --- |
| Ready | “Ready when you are” and the first-question preview | Start conversation; switch to text |
| Listening | State label plus small live input indication | Mute; pause; end |
| Thinking | “Thinking about what you shared” without a false percentage | Pause/end where supported; preserve submitted input |
| Speaking | Current response text and speaking label | Stop speaking or interrupt if supported; mute input; end |
| Paused | “Conversation paused”; distinguish it from muted input | Resume; switch to text; end |
| Reconnecting | Connection message; no “Listening” claim while disconnected | Retry or text fallback; state clearly if input was not saved |
| Permission blocked | Clear explanation, never just an error code | Browser help; text fallback |
| Insufficient context | “I need a little more context before suggesting a direction” | One useful question; skip; stop |

State transitions, interruption behavior and recovery are specifications for implementation and testing; they are not verified by the static Mobbin images.

These recommendations apply progressive disclosure and capability clarity to this context; they are not a requirement to add a separate floating chatbot. Supporting research: [NN/G on progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/) and [AI chatbot design guidelines](https://www.nngroup.com/articles/ai-chatbots-design-guidelines/).

## 7. Motion, accessibility, and verification

- Use motion to explain the transition from story to option to action. Avoid perpetual background animation.
- Proposed motion: 180–240 ms for controls, 300–450 ms for scene changes; short fades or small translations rather than dramatic parallax.
- Respect reduced-motion preferences. Provide static versions of every explanatory scene.
- No autoplay sound, automatic microphone prompts, scroll hijacking, or timers that pressure a career decision.
- Check text contrast, keyboard focus, semantic heading order, accessible tab/accordion behavior, and screen-reader labels. Do not claim accessibility compliance without testing.
- Touch controls should be at least 44 × 44 px by this design specification. Maintain comfortable line lengths and prevent horizontal overflow at 360, 390, 768, and 1440 px.
- Use responsive HTML/UI for previews, not tiny text baked into screenshots. If a static screenshot is necessary, provide an accessible text equivalent.
- Test whether a first-time visitor can state who the product is for, what happens when they start, and what they receive after a brief look. This is a validation plan, not completed research.
- Instrument only with an approved privacy approach: CTA selection, mode selection, permission result, session started/completed, result viewed, and chosen action. Do not send raw career transcripts to ordinary analytics.
- Optimize for comprehension, useful sessions, and chosen actions rather than visual novelty or scroll depth alone.

## 8. Paste-ready instruction for Fable 5.1

Use this entire document as the design specification. Begin with the following instruction:

> Design a premium responsive website and connected voice/text experience for NextMove, an AI-guided career conversation for Indian professionals with roughly 4–15 years of experience. The core transformation is career story → plausible directions → one useful next step. This is not a recruitment marketplace, job board, therapist, quiz, or generic chatbot. Use the section specifications, sample copy, visual tokens, and safeguards in this document. Reference Granola for warm editorial character, Cursor for a large believable product demonstration, Stripe for explaining concrete value, Pluto for human storytelling, and Linear for disciplined result UI. Do not copy brand assets or claim these companies endorse NextMove.
>
> Produce a coherent light, ivory-and-forest design with Source Serif 4 display type and Inter UI type. Use one purposeful route-line motif. Make every section composition different while sharing typography, spacing, color, and component rules: quiet navigation; asymmetric product-led hero; editorial question index; one evolving process canvas; wide career-brief result; portrait-led founder feature; dark trust band; split FAQ; typographic closing invitation. Do not produce repeated three-card sections, generic gradient blobs, glass panels, neon effects, a giant AI orb, or fabricated testimonials.
>
> Apply the inspected Mobbin references by responsibility, using the exact canonical links in section 3: M01 Granola for the hero; M02 Sequence for the three-stage rail above a full-width preview; M03–M04 for the portrait and approved founder note; M05 for concrete consent explanation; M06 for accordion states; M07 for optional intent selection; M08 for microphone preparation; M09–M10 and M14 for labeled voice states and mobile controls; M11–M12 for document hierarchy and contextual questions. M13 is native iOS permission inspiration only, not browser implementation guidance. Do not blend all reference brands into a new visual style. If you cannot open a Mobbin link, use the documented observation and ask for the particular image you need; do not claim you inspected it or substitute an invented screen.
>
> Keep the career-output logic bespoke: show stated priorities, plausible directions, trade-offs, uncertainty and one next action. The research did not establish a directly matching career-coaching results template. Do not turn the experience into the rejected Mercor job marketplace, Motion qualification form, Hume developer console or an unrestricted note editor. Use one fictional customer-operations professional consistently from hero to results; do not swap biographies between sections. Prioritize one useful result over a 90-day plan or a forced outreach message.
>
> Deliver desktop at 1440 px and mobile at 390 px, plus component styles and the post-CTA welcome, microphone preparation, voice/text conversation, editable summary, options, next action, and error states. Use clearly labeled fictional examples. Prototype transitions but distinguish prototype behavior from implemented functionality. Do not claim pricing, privacy guarantees, numerical outcomes, authentic customer quotes, or founder credentials without approved evidence. Do not create payment, messaging, or sharing behavior without separate authorization.
>
> First present the visual system and the hero/result-screen pair for review. After that direction is accepted, extend the same system to the full landing page and connected flow. Explain the rationale for each section in one sentence and identify the real assets or verified product facts still needed. Every screen should be understandable without animation.

## 9. Handoff boundaries

Completed across the two revisions: the original live design research and desktop/mobile baseline inspection; authenticated Mobbin searches and visual review of the supplied images; reference selection and rejection notes; revised section and interaction specifications; and this reusable brief. The separate research log records all 27 returned reference items and distinguishes flow previews from complete-flow inspection.

Not completed: user testing, full interaction playback for the Mobbin references, a rendered Fable design, production implementation, feature certification, claim substantiation, or live deployment. The file has been updated locally for handoff; it has not been submitted to Fable. These outcomes must not be inferred from the brief.
