import { NextResponse } from "next/server";
import { capsExceeded } from "@/lib/caps";
import { store } from "@/lib/convexClient";
import { normalizeLinkedInUrl } from "@/lib/profile";

export const dynamic = "force-dynamic";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    source?: string;
    name?: string;
    email?: string;
    linkedinUrl?: string;
  };
  const source = typeof body.source === "string" ? body.source : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }
  const rawLinkedin =
    typeof body.linkedinUrl === "string" ? body.linkedinUrl : "";
  const normalised = rawLinkedin.trim()
    ? normalizeLinkedInUrl(rawLinkedin)
    : null;
  if (!normalised) {
    return NextResponse.json({ error: "invalid linkedin" }, { status: 400 });
  }
  const linkedinUrl: string = normalised;
  const caps = await store.caps({ email });
  if (capsExceeded(caps, "email")) {
    return NextResponse.json({ error: "email_cap" });
  }
  const id = await store.create({ source, name, email, linkedinUrl });
  if (capsExceeded(caps, "daily")) {
    return NextResponse.json({ id, error: "daily_cap" });
  }
  return NextResponse.json({ id });
}
