import { ImageResponse } from "next/og";
import { store } from "@/lib/convexClient";
import { normalizeNextMove } from "@/lib/extract";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

const BADGE: Record<string, { fg: string; bg: string }> = {
  "strong fit": { fg: "#0f766e", bg: "#e6f4f2" },
  realistic: { fg: "#1d4ed8", bg: "#e8efff" },
  "a stretch": { fg: "#b45309", bg: "#fff4e5" },
  "long shot": { fg: "#6b6560", bg: "#f3f1ee" },
};

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
  const nextMove = normalizeNextMove(session?.roadmap);
  const pathName = nextMove?.chosenPath.name ?? "Your next move";
  const realism = nextMove?.chosenPath.realism ?? "";
  const headline = nextMove?.headline ?? "";
  const badge = BADGE[realism] ?? { fg: "#6b6560", bg: "#f3f1ee" };

  const [tight, inter] = await Promise.all([
    loadFont(
      "https://cdn.jsdelivr.net/fontsource/fonts/inter-tight@latest/latin-500-normal.ttf",
    ),
    loadFont(
      "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf",
    ),
  ]);

  const fonts = [
    ...(tight
      ? [{ name: "Inter Tight", data: tight, weight: 500 as const }]
      : []),
    ...(inter
      ? [{ name: "Inter", data: inter, weight: 400 as const }]
      : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#fafaf9",
          color: "#0c0a09",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, fontWeight: 500 }}>
          <span>Next</span>
          <span style={{ color: "#0f766e" }}>Move</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 500,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              fontFamily: "Inter Tight",
            }}
          >
            {pathName}
          </div>
          {realism ? (
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                background: badge.bg,
                color: badge.fg,
                borderRadius: 999,
                padding: "6px 14px",
                fontSize: 22,
                fontWeight: 600,
              }}
            >
              {realism}
            </div>
          ) : null}
          {headline ? (
            <div
              style={{
                fontSize: 26,
                color: "#6b6560",
                lineHeight: 1.35,
                maxWidth: 900,
              }}
            >
              {headline}
            </div>
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            fontSize: 20,
            color: "#6b6560",
          }}
        >
          nextmove-pi.vercel.app
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
