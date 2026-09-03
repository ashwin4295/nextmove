"use client";

import Vapi from "@vapi-ai/web";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { FIRST_MESSAGE, SYSTEM_PROMPT } from "@/lib/script";
import type { TranscriptTurn } from "@/lib/extract";

function formatElapsed(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function TalkPage() {
  return (
    <Suspense fallback={<p className="p-4">Loading…</p>}>
      <TalkInner />
    </Suspense>
  );
}

function TalkInner() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id;
  const name = searchParams.get("name") ?? "";

  const vapiRef = useRef<Vapi | null>(null);
  const finishingRef = useRef(false);
  const transcriptRef = useRef<TranscriptTurn[]>([]);

  const [started, setStarted] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    const t = setInterval(() => setElapsed((n) => n + 1), 1000);
    return () => {
      clearInterval(t);
      vapiRef.current?.stop().catch(() => undefined);
    };
  }, []);

  function appendTurn(turn: TranscriptTurn) {
    const next = [...transcriptRef.current, turn];
    transcriptRef.current = next;
    setTranscript(next);
  }

  async function finishRoadmap() {
    if (finishingRef.current) return;
    finishingRef.current = true;
    setFinishing(true);
    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, transcript: transcriptRef.current }),
      });
      const data = (await res.json()) as { id?: string };
      if (!data.id) throw new Error("no id");
      router.push(`/r/${data.id}`);
    } catch {
      finishingRef.current = false;
      setFinishing(false);
      setError("Could not write the roadmap. Try again.");
    }
  }

  async function beginVoice() {
    setError("");
    const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!);
    vapiRef.current = vapi;
    vapi.on("message", (message: {
      type?: string;
      transcriptType?: string;
      role?: string;
      transcript?: string;
    }) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const role = message.role === "assistant" ? "assistant" : "user";
        const text = message.transcript ?? "";
        if (text) appendTurn({ role, text });
      }
    });
    vapi.on("call-end", () => {
      finishRoadmap();
    });
    setStarted(true);
    await vapi.start({
      model: {
        provider: "anthropic",
        model: "claude-sonnet-4-6",
        messages: [{ role: "system", content: SYSTEM_PROMPT }],
      },
      voice: { provider: "11labs", voiceId: "paula" },
      transcriber: { provider: "deepgram", model: "nova-2", language: "en" },
      firstMessage: FIRST_MESSAGE,
      maxDurationSeconds: 1920,
      endCallPhrases: ["your roadmap is being written"],
    });
  }

  function openTextFallback() {
    setTextMode(true);
    setTranscript((prev) => {
      if (prev.length === 0) {
        const seeded: TranscriptTurn[] = [
          { role: "assistant", text: FIRST_MESSAGE },
        ];
        transcriptRef.current = seeded;
        return seeded;
      }
      return prev;
    });
  }

  async function sendText() {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setDraft("");
    const next: TranscriptTurn[] = [
      ...transcriptRef.current,
      { role: "user", text },
    ];
    transcriptRef.current = next;
    setTranscript(next);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: next }),
      });
      const data = (await res.json()) as { text?: string };
      if (data.text) {
        const withAssistant: TranscriptTurn[] = [
          ...transcriptRef.current,
          { role: "assistant", text: data.text },
        ];
        transcriptRef.current = withAssistant;
        setTranscript(withAssistant);
      }
    } catch {
      setError("Message failed. Try again.");
    } finally {
      setSending(false);
    }
  }

  async function seeRoadmapNow() {
    setError("");
    try {
      await vapiRef.current?.stop();
    } catch {
      // voice may not be running
    }
    await finishRoadmap();
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-col gap-4 px-4 py-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-accent">
          NextMove{name ? ` · ${name}` : ""}
        </p>
        <p className="font-mono text-sm">{formatElapsed(elapsed)}</p>
      </div>

      {!started ? (
        <button
          type="button"
          onClick={beginVoice}
          className="rounded bg-accent px-6 py-8 text-2xl font-semibold text-white"
        >
          Begin
        </button>
      ) : (
        <p className="text-sm text-stone-600">Listening. Speak naturally.</p>
      )}

      <section className="min-h-48 flex-1 overflow-y-auto rounded border border-stone-300 bg-white p-3">
        {transcript.length === 0 ? (
          <p className="text-sm text-stone-500">Transcript will appear here.</p>
        ) : (
          <ol className="flex flex-col gap-3">
            {transcript.map((t, i) => (
              <li key={`${i}-${t.role}`} className="text-sm leading-relaxed">
                <span className="font-semibold">
                  {t.role === "assistant" ? "Coach" : "You"}:{" "}
                </span>
                {t.text}
              </li>
            ))}
          </ol>
        )}
      </section>

      {!textMode ? (
        <button
          type="button"
          onClick={openTextFallback}
          className="text-left text-sm underline"
        >
          Mic not working? Type instead
        </button>
      ) : (
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            sendText();
          }}
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            className="w-full rounded border border-stone-400 bg-white px-3 py-2 text-base"
            placeholder="Type your answer"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="rounded border border-stone-400 px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {sending ? "Sending…" : "Send"}
          </button>
        </form>
      )}

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <button
        type="button"
        onClick={seeRoadmapNow}
        disabled={finishing}
        className="sticky bottom-3 rounded bg-accent px-4 py-3 text-base font-medium text-white disabled:opacity-50"
      >
        {finishing ? "Writing your roadmap…" : "See my roadmap now"}
      </button>
    </main>
  );
}
