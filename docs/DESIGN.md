# NextMove design file — "The next chapter", editorial edition
Fable 5.1, 2026-09-05. Named reference for register and confidence: flatdata.in (warm paper, monumental serif, one full-bleed accent moment, hairline page frame, monospace labels, one hand-drawn illustration). Borrow the discipline, not the colour or the copy.

## Tokens
- Canvas `#F7F6F2` · Paper (cards, hero art plate) `#FBFAF7` · Sage band `#E7ECE5` · Ink `#20251F` · Muted `#6B6560` · Rule `#D8DDD5`
- Accent `#204B3A` forest. Deep `#17372B`. Forest is the ONLY colour: it paints the full-bleed band, the primary buttons, the eyebrows, the callout numbers, the route line. No teal, no warm orange, no second accent.
- On forest: text `#F7F6F2`, muted `#C9D4CC`, rules `rgba(247,246,242,0.28)`.

## Type
- Display: Source Serif 4, weight 400, tight. H1 `clamp(3.25rem, 7vw, 6rem)` (52 to 96px), line-height 0.98, letter-spacing -0.02em, max 4 lines, max-width 12ch. H2 `clamp(2.25rem, 4.5vw, 3.75rem)`, line-height 1.02, max-width 16ch. Never bold display.
- Body: Inter 400/500/600. Body 1.0625rem/1.6; lede 1.25rem/1.5; small 0.9375rem.
- Eyebrow / labels: JetBrains Mono 500, 0.6875rem, uppercase, letter-spacing 0.16em, forest. Used for section labels, the 01/02/03 numbers, "Illustrative" tags, table headers.
- Big quote lines (the doors, the problem statement): Source Serif 4 1.75rem/1.25, ink.

## Page frame
- Content column 1120px. Two vertical hairlines run the full page height at the column edges (`--rule`), visible on canvas and on the forest band (lighter rule). Sections are separated by a full-width hairline, not by padding alone.
- Section padding 112px desktop / 72px mobile. Rows inside sections are ruled top and bottom, never boxed cards, except the single hero art plate and the message card.
- Mobile: frame lines disappear below 768px; scale drops to H1 44px, H2 32px.

## Buttons
- Primary: forest fill, canvas text, JetBrains Mono 0.75rem uppercase 0.12em, 52px tall, radius 0, arrow glyph at right. Secondary: 1px ink outline, same type. No pills anywhere.

## Motion
- None on load. Hover: underline on links, arrow nudges 4px. Reduced motion respected by default because there is nothing to reduce.

## The illustration
- One ink sketch: a path forking into three, plan-style callouts 01 02 03. File `public/fork.png` (portrait) and `public/fork-wide.png` (crop for the share card). It appears in the hero (right column, on a paper plate with a hairline border and 24px margin), cropped as a band header on the result page, and on the OG image. Nowhere else.

## Do not
- No gradients, glows, shadows (except one 0 12px 32px rgba(32,37,31,.08) on the hero plate and the message card), no rounded card grids, no icons, no emoji, no stock photos, no second colour, no animation.
