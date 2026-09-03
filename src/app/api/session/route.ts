import { NextResponse } from "next/server";
import { store } from "@/lib/convexClient";

export const dynamic = "force-dynamic";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    source?: string;
    name?: string;
    email?: string;
  };
  const source = typeof body.source === "string" ? body.source : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }
  const id = await store.create({ source, name, email });
  return NextResponse.json({ id });
}
