import { ImageResponse } from "next/og";
import { store } from "@/lib/convexClient";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await store.get({ id });
  const roadmap = session?.roadmap;
  const headline = roadmap?.headline ?? "A career transition roadmap";
  const path =
    roadmap?.paths.find((p) => p.name === session?.selectedPath) ??
    roadmap?.paths[0];
  const pathName = path?.name ?? "NextMove";
  const realism = path?.realism ?? "";

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
          background: "#f7f4ee",
          color: "#1c1917",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#b45309",
            letterSpacing: 1,
          }}
        >
          NextMove
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 48, fontWeight: 600, lineHeight: 1.2 }}>
            {headline}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 36, fontWeight: 600 }}>{pathName}</div>
            {realism ? (
              <div style={{ fontSize: 24, color: "#b45309" }}>{realism}</div>
            ) : null}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
