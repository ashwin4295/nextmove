import { NextResponse } from "next/server";
import { store } from "@/lib/convexClient";
import {
  extractNextMove,
  userTurnCount,
  type TranscriptTurn,
} from "@/lib/extract";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const body = (await req.json()) as {
    id?: string;
    transcript?: TranscriptTurn[];
    actReached?: number;
  };
  const id = body.id;
  const transcript = Array.isArray(body.transcript) ? body.transcript : [];
  const clientAct =
    body.actReached === 1 || body.actReached === 2 || body.actReached === 3
      ? body.actReached
      : undefined;
  if (!id) {
    return NextResponse.json({ error: "missing id" }, { status: 400 });
  }

  if (userTurnCount(transcript) < 2) {
    await store.finish({
      id,
      transcript,
      roadmap: null,
      actReached: clientAct,
    });
    return NextResponse.json({ id, error: "too_short" });
  }

  try {
    const nextMove = await extractNextMove(transcript);
    const actReached = Math.max(clientAct ?? 0, nextMove.actReached) as 1 | 2 | 3;
    await store.finish({
      id,
      transcript,
      roadmap: { ...nextMove, actReached },
      actReached,
    });
    return NextResponse.json({ id });
  } catch {
    await store.finish({
      id,
      transcript,
      roadmap: null,
      actReached: clientAct,
    });
    return NextResponse.json({ id, error: "extract" });
  }
}
