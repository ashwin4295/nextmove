import { NextResponse } from "next/server";
import { store } from "@/lib/convexClient";
import {
  extractNextMove,
  userTurnCount,
  type NextMove,
  type TranscriptTurn,
} from "@/lib/extract";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function requestOrigin(req: Request) {
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (host) return `${proto}://${host}`;
  return "https://nextmove.thedirectorloop.com";
}

function sendNextMoveEmail(
  email: string,
  nextMove: NextMove,
  id: string,
  origin: string,
) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const text = [
    nextMove.headline,
    "",
    `${nextMove.chosenPath.name} · ${nextMove.chosenPath.realism}`,
    nextMove.chosenPath.whyItFits,
    "",
    nextMove.message,
    "",
    `${origin}/r/${id}`,
    "",
    "Reply to this email if the message reads wrong. A human reads replies.",
  ].join("\n");
  void fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "NextMove <nextmove@mbbprep.com>",
      reply_to: "ashwin4295@gmail.com",
      to: [email],
      subject: `Your next move: ${nextMove.chosenPath.name}`,
      text,
    }),
  })
    .then(async (res) => {
      if (!res.ok) {
        console.error("resend failed", res.status, await res.text());
      }
    })
    .catch((err) => {
      console.error("resend failed", err instanceof Error ? err.message : err);
    });
}

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
    const existing = await store.get({ id }).catch(() => null);
    const nextMove = await extractNextMove(transcript, existing?.profile);
    const actReached = Math.max(clientAct ?? 0, nextMove.actReached) as 1 | 2 | 3;
    await store.finish({
      id,
      transcript,
      roadmap: { ...nextMove, actReached },
      actReached,
    });
    const email = existing?.email;
    if (process.env.RESEND_API_KEY && email) {
      sendNextMoveEmail(email, nextMove, id, requestOrigin(req));
    }
    return NextResponse.json({ id });
  } catch (err) {
    console.error("extract failed", err instanceof Error ? err.message : err);
    await store.finish({
      id,
      transcript,
      roadmap: null,
      actReached: clientAct,
    });
    return NextResponse.json({ id, error: "extract" });
  }
}
