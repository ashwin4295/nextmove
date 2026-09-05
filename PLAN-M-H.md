# PLAN-M-H.md — NextMove milestone H: editorial design pass

Work inside THIS repo only. Keep every route, API, Convex function, PostHog event, cap, payment and WhatsApp behaviour exactly as is. Do not touch `.env.local`, `convex/`, `docs/`, `src/lib/extract.ts`, `src/lib/script.ts`, or any `src/app/api/*`. Only new dependency: none (`next/font/google` for JetBrains Mono). Commit with message `feat: milestone H — editorial design pass` ending with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`. DO NOT push. Copy is FINAL where given; where a section's copy is not restated here, keep the existing copy verbatim. No em dashes in visible copy.

Design source of truth: `docs/DESIGN.md`. Read it first. Where this plan and DESIGN.md conflict, DESIGN.md wins.

## H1. Tokens and primitives
- Replace `globals.css` tokens with DESIGN.md. Add JetBrains Mono via `next/font/google` for eyebrows and labels. Remove pill radii everywhere: buttons radius 0, inputs radius 0 with 1px ink-muted border, cards radius 0. Remove the reveal animation and the waveform pulse CSS (the waveform component stays, static bars, no motion).
- `src/lib/ui.tsx`: `Button` per DESIGN.md (mono uppercase, 52px, radius 0, trailing arrow glyph "→" for primary). `Eyebrow` = JetBrains Mono 0.6875rem uppercase 0.16em forest. New `Rule` (full-width hairline). New `Frame` wrapper that draws the two vertical page hairlines at the 1120px column edges (absolute, full height, hidden below 768px). `Section({tone:'canvas'|'sage'|'forest'})` gets top and bottom `Rule`s.

## H2. Signature illustration, `src/components/ForkSketch.tsx`
An inline SVG, 800×1000 viewBox, drawn in ink line style: a footpath from the bottom centre forking into three paths, one rising to a block of simple building outlines (steps, tall rectangles, a few window ticks), one curving left toward low rooflines with three tree canopies drawn as loose scribbled circles, one straight ahead into open ground with a bench and a small standing figure (stick figure with a head circle, no face). Use only strokes: `stroke: currentColor`, widths 1 to 1.75, no fills except the three callout tags. Three callout tags: small rectangles with mono text `01`, `02`, `03`, each joined by a thin leader line to its path, exactly like plan drawings. Add light cross-hatching on the path edges using short parallel strokes. Colour is inherited: ink on canvas, canvas on forest. Keep it under 20KB. If `public/fork.png` exists at build time, render `<Image src="/fork.png">` instead of the SVG in the hero only (check with `fs.existsSync` in a server component wrapper); the SVG remains the fallback and the share-card version.

## H3. Landing `/` (rewrite `landing.tsx` layout; copy as stated)
Wrap the page in `Frame`. Nav: wordmark left, mono links centre ("HOW IT WORKS", "SEE AN EXAMPLE", "FAQ"), primary button right "START A CONVERSATION →". 64px tall, bottom `Rule` after scroll.

S1 Hero, two columns 6/6 on desktop, ruled bottom:
- Left: eyebrow "FOR PROFESSIONALS 4 TO 15 YEARS IN · INDIA". H1 in four lines exactly: "You've come / this far. / What comes / next?" (use `<br/>`; on mobile let it wrap naturally). Lede (1.25rem): "Talk it through with an AI coach for about ten minutes. It tells you which door fits, how real your shot is, and writes the first message to someone you already know in that world." Then the existing form, restyled: labels in mono, inputs radius 0, primary button "START A CONVERSATION →" full width on mobile. Keep the two small lines under the form.
- Right: a paper plate (`--paper`, 1px rule border, 24px inner margin, the one shadow) containing `ForkSketch` at full width. Mono caption inside the plate, bottom left: "FIG. 01 · THREE DOORS, ONE PATH". No conversation card, no chips.

S2 The problem, ruled, two columns 5/7:
- Left H2 in three lines: "Every career / decision begins with / someone else's word." 
- Right: three big serif lines stacked with rules between: "A recruiter gives you a role." / "A friend gives you an opinion." / "A quiz gives you a label." Then a forest-coloured serif pull line: "None of them has to tell you which door actually fits, or what would sink it."
- Below, a three-column ruled row, mono eyebrows "01 · RECRUITER", "02 · FRIEND", "03 · QUIZ", each with a serif quote line and a small muted line: "\"You'd be great for this.\" / Fit for them is not fit for you." · "\"Just go for it.\" / Encouragement is not evidence." · "\"You're an Explorer type.\" / A label is not a next step."

S3 Full-bleed forest band, ruled: eyebrow (canvas) "WHAT YOU LEAVE WITH". H2 (canvas, serif, italic on the last two words): "One door. Graded honestly. *The first message written.*" Three-column ruled row on forest (light rules), mono eyebrows "FOR THE UNDECIDED", "FOR THE ALMOST-SURE", "FOR THE STUCK", serif heads and small bodies:
  - "Know which door fits before you tell anyone." / "Two or three doors, one graded above the rest, in your own words. At least one will be marked a stretch or a long shot when the evidence says so."
  - "Know how real your shot is." / "Not a percentage. A word: strong fit, realistic, a stretch, long shot. And the one thing that would sink it."
  - "Send the first message tonight." / "To a person you already know in that world, drafted from what you said. You copy it. You send it. Nothing is sent for you."
  Each with a mono link "SEE AN EXAMPLE →" to #example.

S4 How it works, ruled: eyebrow "HOW IT WORKS", H2 "Ten minutes. Three parts. One move." Three ruled rows (not cards), each: mono number "01", serif title, one body line. Reuse the existing three titles and lines. Remove the stage rail and the canvas preview.

S5 The example, ruled, id="example": eyebrow "AN EXAMPLE, ILLUSTRATIVE", H2 "A clearer direction. With the reasoning behind it." Keep the existing illustrative brief content but render it as a ruled document: mono labels, serif option titles, no card borders inside, one outer rule.

S6 Trust band: keep content, restyle as a ruled two-column row on sage (H2 left, four mono-labelled lines right). No forest here; forest is used once, in S3.

S7 FAQ: keep questions and answers, ruled rows, mono "+" and "−" indicators, no card borders.

S8 Closing: H2 serif centred, four lines "Your next move / starts with / a conversation. / Not a plan." Primary button. Footer as is with mono links.

## H4. Talk screen and result page
- Talk: apply tokens (mono eyebrows, radius 0 buttons, serif question line at 1.75rem). No layout change.
- Result `/r/[id]`: page header becomes a full-width band: the `ForkSketch` cropped to its top 35% as a faint (opacity .35) background band 220px tall with the wordmark and eyebrow "YOUR NEXT MOVE" over it; then the existing content restyled with tokens: H1 serif at H2 scale, ruled sections instead of cards except the message card and the pack card, mono labels ("MOVING AWAY FROM", "MOVING TOWARD", "WHAT HAS TO STAY TRUE", "THE FIRST MESSAGE", "THE OTHER DOORS", "YOUR NEXT 30 DAYS"). Keep every button and behaviour.
- OG image: canvas background, the sketch faint on the right third, path name in serif, realism in mono, wordmark. Use inline SVG paths for the sketch in the OG route (copy the same path data; `ImageResponse` supports SVG elements).

## H5. Verification
- `npm run build`, `npm run lint`.
- Screenshots at 390 and 1440 of `/`, `/r/[id]` (a stored session), `/talk/[id]` ready state into `verification/` (git-ignored).
- No horizontal overflow at 360, 390, 768, 1440. Hero H1 renders in exactly four lines at 1440.
- Lighthouse-style sanity: no layout shift from fonts (use `display: swap` with size-adjust defaults).
- Write `MILESTONE-H-REPORT.md`: verified, not verified, deviations with reasons.

Stop after the commit.
