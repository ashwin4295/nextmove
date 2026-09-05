# Milestone H report

Editorial design pass: DESIGN.md tokens, JetBrains Mono eyebrows, radius 0, page frame, signature fork sketch, rewritten landing, restyled talk and result, OG sketch. `.env.local`, `convex/`, `docs/`, `src/lib/extract.ts`, `src/lib/script.ts`, and `src/app/api/*` were not edited. No new npm dependencies (`next/font/google` for JetBrains Mono). Not pushed.

## Verified

`npm run lint` and `npm run build` pass.

Against `npm run dev` at `http://localhost:3011`:

- Landing copy matches the plan: hero eyebrow and four-line H1, new lede, problem section, forest "what you leave with" band, how-it-works rows (existing three titles and lines, no stage rail or canvas preview), illustrative brief as a ruled document, trust on sage, FAQ questions/answers unchanged, closing four-line H2. Form behaviour, cap messages, and the two small lines under the form are unchanged.
- Hero H1 at 1440 is exactly four lines: "You've come / this far. / What comes / next?". At 360 and 390 the same words wrap naturally with spaces.
- No horizontal overflow (`documentElement.scrollWidth === clientWidth`) at 360, 390, 768, and 1440 on `/`, `/r/j5744jft9p4n99h7jz49r4kkx18dqvkg`, and `/talk/j57bbp4hcgeh7faefg99pxyrjd8dvn4g`.
- `/talk/[id]` ready state still has the three hairline rows, Enable microphone / Write it out, and profile chip. Buttons are radius 0 and mono uppercase; the live question line is 1.75rem serif.
- `/r/[id]` stored session still shows Product / realistic, What we heard, first message (copy / send / write-for-them), other doors, next 30 days, share, pack upsell, and transcript. Header is a 220px ForkSketch band at opacity 0.35 with wordmark and YOUR NEXT MOVE.
- `public/fork.png` is absent, so the hero uses the SVG fallback (`HeroFork` `fs.existsSync`). Sketch source is ~8KB.
- Inter, Source Serif 4 (normal + italic), and JetBrains Mono all use `display: "swap"` (next/font size-adjust fallbacks left at defaults).
- Screenshots at 390 and 1440 for `/`, `/r/[id]`, and `/talk/[id]` ready are in `verification/` (git-ignored).

## Not verified

- Formal Lighthouse run. Font swap + size-adjust defaults were confirmed in `layout.tsx` only.
- `public/fork.png` / `public/fork-wide.png` render path. Files are not in the repo; the SVG is used for the hero, result band, and OG.
- Live OG image pixels in a crawler. The route builds (`/r/[id]/opengraph-image`) and inlines the same path data on a canvas background.
- Visual QA of the fork sketch against a commissioned `fork.png`. The inline SVG is the plan-drawing fallback.

## Deviations

| Deviation | Reason |
|---|---|
| Hero H1 uses `max-width: none` and nowrap spans instead of the global 12ch H1 measure | DESIGN.md's 12ch plus a 6/6 column at 96px wrapped "You've come" and "What comes" into extra lines. The plan requires exactly four lines at 1440. |
| Nav primary button is 0.625rem / tighter tracking below 400px | "START A CONVERSATION →" at the spec 0.75rem / 0.12em overflowed 15px at 360 next to the wordmark. |
| Heading rules live in `@layer base` | Unlayered `h1 { max-width: 12ch }` in `globals.css` beat Tailwind `max-w-none` and blocked the four-line hero. |
| Footer home control is `Link` instead of `<a href="/">` | `@next/next/no-html-link-for-pages` failed lint. Same destination. |
| Result page is wrapped in `Frame` | DESIGN.md page frame is full-page hairlines, not landing-only. Talk is unchanged (no Frame) per "no layout change". |
| Realism badges are mono forest/ink, not blue/orange pills | DESIGN.md: forest is the only colour; no pills. Behaviour and labels unchanged. |
| `Reveal` and waveform pulse CSS are removed; `Waveform` stays as static bars | Required by H1. Talk still passes `state` into `Waveform`. |
| Admin cards/table are radius 0 | H1 says remove pill radii everywhere. |
