import { NextResponse } from "next/server";
import { store } from "@/lib/convexClient";
import { normalizeProfile } from "@/lib/profile";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ACTOR =
  "https://api.apify.com/v2/acts/harvestapi~linkedin-profile-scraper/run-sync-get-dataset-items";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { id?: unknown };
    const id = typeof body.id === "string" ? body.id : "";
    if (!id) {
      return NextResponse.json({ status: "failed" });
    }

    const session = await store.get({ id });
    if (!session) {
      return NextResponse.json({ status: "failed" });
    }

    if (!session.linkedinUrl) {
      await store.setProfile({ id, status: "none", profile: null });
      return NextResponse.json({ status: "none" });
    }

    const token = process.env.APIFY_TOKEN;
    if (!token) {
      await store.setProfile({ id, status: "failed", profile: null });
      return NextResponse.json({ status: "failed" });
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30_000);
    try {
      const res = await fetch(
        `${ACTOR}?token=${encodeURIComponent(token)}&timeout=60`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            urls: [session.linkedinUrl],
            profileScraperMode: "Profile details no email ($4 per 1k)",
          }),
          signal: controller.signal,
        },
      );
      if (!res.ok) {
        throw new Error(`apify ${res.status}`);
      }
      const items = (await res.json()) as unknown;
      const first = Array.isArray(items) ? items[0] : null;
      const profile = normalizeProfile(first);
      if (!profile) {
        throw new Error("empty profile");
      }
      await store.setProfile({ id, status: "ready", profile });
      return NextResponse.json({ status: "ready" });
    } catch (err) {
      console.error(
        "enrich failed",
        err instanceof Error ? err.message : err,
      );
      await store.setProfile({ id, status: "failed", profile: null });
      return NextResponse.json({ status: "failed" });
    } finally {
      clearTimeout(timer);
    }
  } catch (err) {
    console.error("enrich failed", err instanceof Error ? err.message : err);
    return NextResponse.json({ status: "failed" });
  }
}
