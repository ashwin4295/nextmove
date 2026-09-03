import { notFound } from "next/navigation";
import { store } from "@/lib/convexClient";
import type { Roadmap } from "@/lib/extract";
import { RoadmapView } from "./RoadmapView";

function toPublicRoadmap(roadmap: Roadmap | null) {
  if (!roadmap) return null;
  const pub = { ...roadmap };
  delete pub.privateItems;
  return pub;
}

export const dynamic = "force-dynamic";

export default async function RoadmapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await store.get({ id });
  if (!session) notFound();

  const roadmap = toPublicRoadmap(session.roadmap);

  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-col gap-6 px-4 py-8">
      <p className="text-sm font-semibold text-accent">NextMove</p>
      <RoadmapView
        id={id}
        roadmap={roadmap}
        transcript={session.transcript}
        initialSelected={session.selectedPath}
      />
    </main>
  );
}
