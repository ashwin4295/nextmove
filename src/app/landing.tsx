"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function Landing({ source }: { source: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function start() {
    if (!name.trim()) {
      setError("First name is required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source }),
      });
      const data = (await res.json()) as { id?: string };
      if (!data.id) throw new Error("no id");
      router.push(`/talk/${data.id}?name=${encodeURIComponent(name.trim())}`);
    } catch {
      setError("Could not start. Try again.");
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center gap-6 px-4 py-12">
      <p className="text-sm font-semibold text-accent">NextMove</p>
      <h1 className="text-3xl font-semibold leading-tight">
        An AI career coach you talk to.
      </h1>
      <p className="text-base leading-relaxed text-stone-700">
        Up to 30 minutes. Where you&apos;ve been, what&apos;s pushing you, what
        you won&apos;t give up. You leave with a transition roadmap.
      </p>
      <label className="flex flex-col gap-2 text-sm font-medium">
        First name
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded border border-stone-400 bg-white px-3 py-2 text-base font-normal"
          autoComplete="given-name"
        />
      </label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button
        type="button"
        onClick={start}
        disabled={busy}
        className="rounded bg-accent px-4 py-3 text-base font-medium text-white disabled:opacity-50"
      >
        Start the conversation
      </button>
    </main>
  );
}
