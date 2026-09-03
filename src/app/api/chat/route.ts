import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/script";
import type { TranscriptTurn } from "@/lib/extract";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const body = (await req.json()) as { transcript?: TranscriptTurn[] };
  const transcript = Array.isArray(body.transcript) ? body.transcript : [];

  const messages = transcript
    .filter((t) => t.text.trim().length > 0)
    .map((t) => ({
      role: t.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: t.text,
    }));

  if (messages.length === 0 || messages[0].role !== "user") {
    messages.unshift({
      role: "user",
      content: "(conversation started)",
    });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 400,
    thinking: { type: "disabled" },
    system: SYSTEM_PROMPT,
    messages,
  });

  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");

  return NextResponse.json({ text });
}
