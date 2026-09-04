import { NextResponse } from "next/server";
import { store } from "@/lib/convexClient";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { id?: unknown };
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) {
    return NextResponse.json({ error: "missing id" }, { status: 400 });
  }
  await store.markStarted({ id });
  return NextResponse.json({ ok: true });
}
