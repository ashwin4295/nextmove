import { ImageResponse } from "next/og";
import { store } from "@/lib/convexClient";
import { normalizeNextMove } from "@/lib/extract";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

const BADGE: Record<string, { fg: string; bg: string }> = {
  "strong fit": { fg: "#204B3A", bg: "#E7ECE5" },
  realistic: { fg: "#1F4E79", bg: "#E4EEF7" },
  "a stretch": { fg: "#8A5A2B", bg: "#F6EBDD" },
  "long shot": { fg: "#586257", bg: "#EEF0EC" },
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
  const badge = BADGE[realism] ?? { fg: "#586257", bg: "#EEF0EC" };

  const [serif, inter] = await Promise.all([
    loadFont(
      "https://cdn.jsdelivr.net/fontsource/fonts/source-serif-4@latest/latin-500-normal.ttf",
    ),
    loadFont(
      "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-600-normal.ttf",
    ),
  ]);

  const fonts = [
    ...(serif
      ? [{ name: "Source Serif 4", data: serif, weight: 500 as const }]
      : []),
    ...(inter
      ? [{ name: "Inter", data: inter, weight: 600 as const }]
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
          background: "#F7F6F2",
          color: "#20251F",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "Inter",
            fontSize: 28,
            fontWeight: 600,
          }}
        >
          <span>Next</span>
          <span style={{ color: "#204B3A" }}>Move</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 500,
              lineHeight: 1.05,
              fontFamily: "Source Serif 4",
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
                color: "#586257",
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
            color: "#586257",
          }}
        >
          nextmove.thedirectorloop.com
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
