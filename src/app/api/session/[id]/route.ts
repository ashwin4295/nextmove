import { NextResponse } from "next/server";
import { store } from "@/lib/convexClient";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const session = await store.get({ id });
    if (!session) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({
      status: session.profileStatus,
      profile: session.profile,
    });
  } catch {
    return NextResponse.json({ status: "none", profile: null });
  }
}
