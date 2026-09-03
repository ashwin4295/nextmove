import { notFound } from "next/navigation";
import { store } from "@/lib/convexClient";
import { toPublicNextMove } from "@/lib/extract";
import { NextMoveView } from "./RoadmapView";

export const dynamic = "force-dynamic";

export default async function NextMovePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await store.get({ id });
  if (!session) notFound();

  return (
    <NextMoveView
      id={id}
      nextMove={toPublicNextMove(session.roadmap)}
      transcript={session.transcript}
      sent={session.sent}
      contactName={session.contactName}
    />
  );
}
