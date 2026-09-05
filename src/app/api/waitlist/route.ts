import { NextResponse } from "next/server";
import { store } from "@/lib/convexClient";

export const dynamic = "force-dynamic";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    email?: string;
    source?: string;
  };
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const source = typeof body.source === "string" ? body.source : "";
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }
  await store.joinWaitlist({ email, source });
  return NextResponse.json({ ok: true });
}
