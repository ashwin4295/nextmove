import { NextResponse } from "next/server";
import { store } from "@/lib/convexClient";
import { extractRoadmap, type TranscriptTurn } from "@/lib/extract";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    id?: string;
    transcript?: TranscriptTurn[];
  };
  const id = body.id;
  const transcript = Array.isArray(body.transcript) ? body.transcript : [];
  if (!id) {
    return NextResponse.json({ error: "missing id" }, { status: 400 });
  }

  try {
    const roadmap = await extractRoadmap(transcript);
    await store.finish({ id, transcript, roadmap });
    return NextResponse.json({ id });
  } catch {
    await store.finish({ id, transcript, roadmap: null });
    return NextResponse.json({ id, error: "extract" });
  }
}
