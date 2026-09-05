import { NextResponse } from "next/server";
import { store } from "@/lib/convexClient";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    id?: unknown;
    score?: unknown;
    text?: unknown;
  };
  const id = typeof body.id === "string" ? body.id : "";
  const score = typeof body.score === "number" ? body.score : Number(body.score);
  const text = typeof body.text === "string" ? body.text : "";
  if (!id) {
    return NextResponse.json({ error: "missing id" }, { status: 400 });
  }
  if (!Number.isFinite(score)) {
    return NextResponse.json({ error: "invalid score" }, { status: 400 });
  }
  await store.setFeedback({ id, score, text });
  return NextResponse.json({ ok: true });
}
