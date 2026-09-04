import { NextResponse } from "next/server";
import { store } from "@/lib/convexClient";
import { draftMessage, normalizeNextMove } from "@/lib/extract";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const body = (await req.json()) as { id?: string; contactName?: string };
  const id = body.id;
  const contactName = body.contactName?.trim();
  if (!id || !contactName) {
    return NextResponse.json(
      { error: "missing id or contactName" },
      { status: 400 },
    );
  }

  const session = await store.get({ id });
  const nextMove = normalizeNextMove(session?.roadmap, { lenient: true });
  if (!session || !nextMove) {
    return NextResponse.json({ error: "no next move" }, { status: 400 });
  }

  const message = await draftMessage(nextMove, contactName);
  await store.setContact({ id, contactName, message });
  return NextResponse.json({ id, contactName, message });
}
