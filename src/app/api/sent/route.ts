import { NextResponse } from "next/server";
import { store } from "@/lib/convexClient";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json()) as { id?: string };
  if (!body.id) {
    return NextResponse.json({ error: "missing id" }, { status: 400 });
  }
  await store.markSent({ id: body.id });
  return NextResponse.json({ id: body.id });
}
