"use client";

import { useState } from "react";
import type { Roadmap, TranscriptTurn } from "@/lib/extract";

type PublicRoadmap = Omit<Roadmap, "privateItems">;

const TRIGGER_SENTENCE: Record<Roadmap["trigger"], string> = {
  push: "You're being pushed more than pulled.",
  pull: "You're being pulled more than pushed.",
  drift: "You're drifting more than being pushed or pulled.",
};

export function RoadmapView({
  id,
  roadmap,
  transcript,
  initialSelected,
}: {
  id: string;
  roadmap: PublicRoadmap | null;
  transcript: TranscriptTurn[];
  initialSelected: string | null;
}) {
  const [selected, setSelected] = useState(initialSelected);
  const [shared, setShared] = useState(false);
  const [busy, setBusy] = useState(false);

  async function choose(path: string) {
    setBusy(true);
    try {
      await fetch("/api/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, path }),
      });
      setSelected(path);
    } finally {
      setBusy(false);
    }
  }

  async function share() {
    const url = `${window.location.origin}/r/${id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // clipboard may be blocked
    }
    await fetch("/api/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setShared(true);
  }

  if (!roadmap) {
    return (
      <div className="flex flex-col gap-4">
        <p className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm">
          Roadmap failed, transcript saved
        </p>
        <ol className="flex flex-col gap-3">
          {transcript.map((t, i) => (
            <li key={i} className="text-sm leading-relaxed">
              <span className="font-semibold">
                {t.role === "assistant" ? "Coach" : "You"}:{" "}
              </span>
              {t.text}
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold leading-tight">{roadmap.headline}</h1>
      <p className="text-base">
        {TRIGGER_SENTENCE[roadmap.trigger] ?? TRIGGER_SENTENCE.drift}
      </p>
      {roadmap.anchors.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {roadmap.anchors.map((a) => (
            <li
              key={a}
              className="rounded-full border border-accent px-3 py-1 text-sm text-accent"
            >
              {a}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-col gap-4">
        {roadmap.paths.map((path) => {
          const isSelected = selected === path.name;
          const dimmed = selected != null && !isSelected;
          return (
            <article
              key={path.name}
              className={`rounded border bg-white p-4 ${
                isSelected
                  ? "border-accent"
                  : dimmed
                    ? "border-stone-200 opacity-40"
                    : "border-stone-300"
              }`}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold">{path.name}</h2>
                <span className="rounded bg-accent px-2 py-0.5 text-xs font-medium text-white">
                  {path.realism}
                </span>
              </div>
              <p className="mb-2 text-sm leading-relaxed">{path.whyItFits}</p>
              <p className="text-sm">
                <span className="font-semibold">Gap: </span>
                {path.firstGap}
              </p>
              <p className="mb-3 text-sm">
                <span className="font-semibold">Experiment: </span>
                {path.firstExperiment}
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={() => choose(path.name)}
                className="rounded border border-stone-400 px-3 py-2 text-sm font-medium disabled:opacity-50"
              >
                This is my path
              </button>
            </article>
          );
        })}
      </div>

      <p className="text-base font-medium">
        Decision date: {roadmap.decisionDate}
      </p>

      <button
        type="button"
        onClick={share}
        className="rounded bg-accent px-4 py-3 text-base font-medium text-white"
      >
        {shared ? "Link copied" : "Share"}
      </button>

      <a
        href="https://calendly.com/mbbprepofficial/15min?utm_source=nextmove"
        className="text-sm underline"
      >
        Talk this through with Ashwin
      </a>
    </div>
  );
}
