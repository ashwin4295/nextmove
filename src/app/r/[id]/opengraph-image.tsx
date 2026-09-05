import { ImageResponse } from "next/og";
import {
  FORK_BUILDINGS,
  FORK_CIRCLES,
  FORK_HATCH,
  FORK_OPEN,
  FORK_PATHS,
  FORK_TAGS,
  FORK_TREES,
} from "@/components/forkDrawing";
import { store } from "@/lib/convexClient";
import { normalizeNextMove } from "@/lib/extract";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

const STROKES = [
  ...FORK_PATHS,
  ...FORK_HATCH,
  ...FORK_BUILDINGS,
  ...FORK_TREES,
  ...FORK_OPEN,
];

async function loadFont(url: string) {
  const res = await fetch(url);
  if (!res.ok) return null;
  return await res.arrayBuffer();
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await store.get({ id });
  const nextMove = normalizeNextMove(session?.roadmap, { lenient: true });
  const pathName = nextMove?.chosenPath.name ?? "Your next move";
  const realism = nextMove?.chosenPath.realism ?? "";

  const [serif, mono] = await Promise.all([
    loadFont(
      "https://cdn.jsdelivr.net/fontsource/fonts/source-serif-4@latest/latin-400-normal.ttf",
    ),
    loadFont(
      "https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-500-normal.ttf",
    ),
  ]);

  const fonts = [
    ...(serif
      ? [{ name: "Source Serif 4", data: serif, weight: 400 as const }]
      : []),
    ...(mono
      ? [{ name: "JetBrains Mono", data: mono, weight: 500 as const }]
      : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#F7F6F2",
          color: "#20251F",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: "40%",
            height: "100%",
            display: "flex",
            opacity: 0.22,
            color: "#20251F",
          }}
        >
          <svg
            width="480"
            height="630"
            viewBox="0 0 800 1000"
            fill="none"
            style={{ display: "flex" }}
          >
            {STROKES.map((s, i) => (
              <path
                key={i}
                d={s.d}
                stroke="#20251F"
                strokeWidth={s.width}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            {FORK_CIRCLES.map((c, i) => (
              <circle
                key={i}
                cx={c.cx}
                cy={c.cy}
                r={c.r}
                stroke="#20251F"
                strokeWidth={c.width}
              />
            ))}
            {FORK_TAGS.map((tag) => (
              <g key={tag.label}>
                <line
                  x1={tag.x + 18}
                  y1={tag.y + 11}
                  x2={tag.toX}
                  y2={tag.toY}
                  stroke="#20251F"
                  strokeWidth="1"
                />
                <rect
                  x={tag.x}
                  y={tag.y}
                  width="36"
                  height="22"
                  fill="#20251F"
                />
                <text
                  x={tag.x + 18}
                  y={tag.y + 15}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#F7F6F2"
                  fontFamily="JetBrains Mono"
                >
                  {tag.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 72,
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "JetBrains Mono",
              fontSize: 22,
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            <span>Next</span>
            <span style={{ color: "#204B3A" }}>Move</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                fontSize: 64,
                fontWeight: 400,
                lineHeight: 1.02,
                fontFamily: "Source Serif 4",
                maxWidth: 760,
              }}
            >
              {pathName}
            </div>
            {realism ? (
              <div
                style={{
                  display: "flex",
                  fontFamily: "JetBrains Mono",
                  fontSize: 18,
                  fontWeight: 500,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#204B3A",
                }}
              >
                {realism}
              </div>
            ) : null}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "JetBrains Mono",
              fontSize: 16,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#6B6560",
            }}
          >
            nextmove.thedirectorloop.com
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
