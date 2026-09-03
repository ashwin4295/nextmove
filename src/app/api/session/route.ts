import { NextResponse } from "next/server";
import { store } from "@/lib/convexClient";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { source?: string };
  const source = typeof body.source === "string" ? body.source : "";
  const id = await store.create({ source });
  return NextResponse.json({ id });
}
