import { NextResponse } from "next/server";
import { store } from "@/lib/convexClient";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json()) as { id?: string; path?: string };
  if (!body.id || !body.path) {
    return NextResponse.json({ error: "missing id or path" }, { status: 400 });
  }
  await store.selectPath({ id: body.id, path: body.path });
  return NextResponse.json({ id: body.id });
}
