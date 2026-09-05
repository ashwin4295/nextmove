import { NextResponse } from "next/server";
import { envCap } from "@/lib/caps";
import { store } from "@/lib/convexClient";

export const dynamic = "force-dynamic";

export async function GET() {
  const started = await store.pilotStarted();
  const cap = envCap("PILOT_CAP", 50);
  return NextResponse.json({
    full: started >= cap,
    started,
    cap,
  });
}
