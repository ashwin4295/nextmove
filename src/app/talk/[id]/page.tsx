"use client";

import Vapi from "@vapi-ai/web";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { FIRST_MESSAGE, SYSTEM_PROMPT } from "@/lib/script";
import { userTurnCount, type TranscriptTurn } from "@/lib/extract";
import { Button, Card, Wordmark } from "@/lib/ui";

type TalkState =
  | "ready"
  | "connecting"
  | "live"
  | "failed"
  | "text"
  | "writing";

const ACT_NAME = {
  1: "The trigger",
  2: "The move",
  3: "Close",
} as const;

function formatElapsed(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function actFromText(text: string, current: 1 | 2 | 3): 1 | 2 | 3 {
  const lower = text.toLowerCase();
  if (lower.includes("next move is being written")) return 3;
  if (lower.includes("enough for a first read")) return 2;
  return current;
}

function Orb({
  speaking,
  dim,
  still,
}: {
  speaking?: boolean;
  dim?: boolean;
  still?: boolean;
}) {
  return (
    <div
      className={`mx-auto rounded-full bg-accent card-shadow ${
        still ? "size-24" : "size-24"
      } ${speaking ? "orb-speak" : ""}`}
      style={{ opacity: dim ? 0.4 : 1 }}
    />
  );
}

export default function TalkPage() {
  return (
    <Suspense fallback={<p className="p-4 text-muted">Loading…</p>}>
      <TalkInner />
    </Suspense>
  );
}

function TalkInner() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const vapiRef = useRef<Vapi | null>(null);
  const finishingRef = useRef(false);
  const transcriptRef = useRef<TranscriptTurn[]>([]);
  const startedAtRef = useRef(0);
  const actRef = useRef<1 | 2 | 3>(1);

  const [state, setState] = useState<TalkState>("ready");
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [timerOn, setTimerOn] = useState(false);
  const [act, setAct] = useState<1 | 2 | 3>(1);
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [tooShort, setTooShort] = useState("");

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    actRef.current = act;
  }, [act]);

  useEffect(() => {
    if (!timerOn) return;
    const t = setInterval(() => setElapsed((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [timerOn]);

  useEffect(() => {
    return () => {
      vapiRef.current?.stop().catch(() => undefined);
    };
  }, []);

  function setActFrom(text: string) {
    setAct((current) => {
      const next = actFromText(text, current);
      actRef.current = next;
      return next;
    });
  }

  function appendTurn(turn: TranscriptTurn) {
    const next = [...transcriptRef.current, turn];
    transcriptRef.current = next;
    setTranscript(next);
    if (turn.role === "assistant") setActFrom(turn.text);
  }

  function countUsers() {
    return userTurnCount(transcriptRef.current);
  }

  async function finishNextMove() {
    if (finishingRef.current) return;
    if (countUsers() < 2) {
      setTooShort(
        "Give me two answers first, then I can write something honest.",
      );
      return;
    }
    finishingRef.current = true;
    setTimerOn(false);
    setState("writing");
    setError("");
    setTooShort("");
    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          transcript: transcriptRef.current,
          actReached: actRef.current,
        }),
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (data.error === "too_short") {
        finishingRef.current = false;
        setState("text");
        setTooShort(
          "Give me two answers first, then I can write something honest.",
        );
        return;
      }
      if (!data.id) throw new Error("no id");
      router.push(`/r/${data.id}`);
    } catch {
      finishingRef.current = false;
      setError("Could not write your next move.");
    }
  }

  function vapiConfig() {
    const budget = process.env.NEXT_PUBLIC_VOICE_TIER === "budget";
    return {
      model: {
        provider: "anthropic" as const,
        model: budget
          ? ("claude-haiku-4-5-20251001" as const)
          : ("claude-sonnet-4-6" as const),
        messages: [{ role: "system" as const, content: SYSTEM_PROMPT }],
      },
      voice: budget
        ? { provider: "deepgram" as const, voiceId: "aura-2-thalia-en" }
        : { provider: "11labs" as const, voiceId: "paula" },
      transcriber: {
        provider: "deepgram" as const,
        model: "nova-2",
        language: "en" as const,
      },
      firstMessage: FIRST_MESSAGE,
      silenceTimeoutSeconds: 90,
      maxDurationSeconds: 780,
      backgroundSound: "off" as const,
      firstMessageMode: "assistant-speaks-first" as const,
      endCallPhrases: ["next move is being written"],
    };
  }

  function wireVapi(vapi: Vapi) {
    vapi.on(
      "message",
      (message: {
        type?: string;
        transcriptType?: string;
        role?: string;
        transcript?: string;
      }) => {
        if (
          message.type === "transcript" &&
          message.transcriptType === "final"
        ) {
          const role = message.role === "assistant" ? "assistant" : "user";
          const text = message.transcript ?? "";
          if (text) appendTurn({ role, text });
        }
      },
    );
    vapi.on("speech-start", () => setSpeaking(true));
    vapi.on("speech-end", () => setSpeaking(false));
    vapi.on("call-start", () => {
      setState("live");
      setTimerOn(true);
    });
    vapi.on("error", () => {
      setTimerOn(false);
      setState("failed");
    });
    vapi.on("call-end", () => {
      const empty = transcriptRef.current.every((t) => !t.text.trim());
      const quick = Date.now() - startedAtRef.current < 15_000;
      if (quick && empty) {
        setTimerOn(false);
        setState("failed");
        return;
      }
      if (countUsers() >= 2) {
        finishNextMove();
      }
    });
  }

  async function beginVoice() {
    setError("");
    setTooShort("");
    setState("connecting");
    startedAtRef.current = Date.now();
    try {
      const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!);
      vapiRef.current = vapi;
      wireVapi(vapi);
      await vapi.start(vapiConfig() as Parameters<Vapi["start"]>[0]);
    } catch {
      setTimerOn(false);
      setState("failed");
    }
  }

  function openText() {
    try {
      vapiRef.current?.stop();
    } catch {
      // voice may not be running
    }
    setState("text");
    setTimerOn(true);
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
        setActFrom(data.text);
      }
    } catch {
      setError("Message failed. Try again.");
    } finally {
      setSending(false);
    }
  }

  async function seeNextMove() {
    if (countUsers() < 2) {
      setTooShort(
        "Give me two answers first, then I can write something honest.",
      );
      return;
    }
    try {
      await vapiRef.current?.stop();
    } catch {
      // voice may not be running
    }
    await finishNextMove();
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    vapiRef.current?.setMuted(next);
  }

  const lastTwo = transcript.slice(-2);
  const status = speaking ? "Coach is speaking" : "Listening";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[640px] flex-col bg-canvas px-4 pb-28 pt-5">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link href="/">
          <Wordmark />
        </Link>
        <Button variant="ghost" href="/">
          Leave
        </Button>
      </div>

      {state === "live" || state === "text" || state === "writing" ? (
        <div className="mb-6 flex items-center justify-between text-sm">
          <p className="font-medium">
            Act {act} of 3 · {ACT_NAME[act]}
          </p>
          <p className="tabular-nums text-muted">{formatElapsed(elapsed)}</p>
        </div>
      ) : null}

      {state === "ready" ? (
        <Card className="border border-line p-6">
          <h1 className="font-display text-2xl font-medium">Before we begin</h1>
          <ul className="mt-4 flex flex-col gap-3 text-sm leading-relaxed">
            <li>About ten minutes, in three short acts. Stop any time.</li>
            <li>Speak naturally. The coach may push back.</li>
            <li>Nothing here is shared without your say.</li>
          </ul>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button onClick={beginVoice}>Begin</Button>
            <Button variant="secondary" onClick={openText}>
              Type instead
            </Button>
          </div>
        </Card>
      ) : null}

      {state === "connecting" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16">
          <Orb dim />
          <p className="text-muted">Connecting…</p>
        </div>
      ) : null}

      {state === "live" ? (
        <div className="flex flex-1 flex-col items-center">
          <Orb speaking={speaking} />
          <p className="mt-4 text-sm text-muted">{status}</p>
          <div className="mt-8 flex w-full flex-col gap-4">
            {lastTwo.map((t, i) => (
              <p
                key={`${i}-${t.role}`}
                className={`text-lg leading-relaxed ${
                  t.role === "assistant" ? "text-ink" : "text-muted"
                }`}
              >
                <span className="font-semibold text-ink">
                  {t.role === "assistant" ? "Coach" : "You"}:{" "}
                </span>
                {t.text}
              </p>
            ))}
          </div>
          <button
            type="button"
            className="mt-6 text-sm text-muted underline"
            onClick={() => setShowFull((v) => !v)}
          >
            {showFull ? "Hide full transcript" : "Show full transcript"}
          </button>
          {showFull ? (
            <ol className="mt-4 w-full flex-col gap-3">
              {transcript.map((t, i) => (
                <li key={i} className="text-sm leading-relaxed">
                  <span className="font-semibold">
                    {t.role === "assistant" ? "Coach" : "You"}:{" "}
                  </span>
                  {t.text}
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      ) : null}

      {state === "failed" ? (
        <Card className="border border-line p-6">
          <h1 className="font-display text-2xl font-medium">
            I can&apos;t hear you yet.
          </h1>
          <p className="mt-3 leading-relaxed text-muted">
            Your browser blocked the microphone, or the call dropped. Allow the
            mic and try again, or type your answers instead. You get the same
            result either way.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={() => {
                setElapsed(0);
                beginVoice();
              }}
            >
              Try voice again
            </Button>
            <Button variant="secondary" onClick={openText}>
              Type instead
            </Button>
          </div>
        </Card>
      ) : null}

      {state === "text" ? (
        <div className="flex flex-1 flex-col gap-4">
          <ol className="flex flex-1 flex-col gap-3 overflow-y-auto">
            {transcript.map((t, i) => (
              <li key={i} className="text-sm leading-relaxed">
                <span className="font-semibold">
                  {t.role === "assistant" ? "Coach" : "You"}:{" "}
                </span>
                {t.text}
              </li>
            ))}
          </ol>
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
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendText();
                }
              }}
              rows={3}
              className="w-full rounded-[10px] border border-line bg-surface px-3 py-2 text-base"
              placeholder="Type your answer"
            />
            <Button type="submit" disabled={sending || !draft.trim()}>
              {sending ? "Sending…" : "Send"}
            </Button>
          </form>
        </div>
      ) : null}

      {state === "writing" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16">
          <Orb still />
          <p className="font-medium">Writing your next move…</p>
          <p className="text-sm text-muted">Usually under twenty seconds.</p>
          {error ? (
            <div className="mt-4 flex flex-col items-center gap-3">
              <p className="text-sm text-red-700">{error}</p>
              <Button
                onClick={() => {
                  finishingRef.current = false;
                  finishNextMove();
                }}
              >
                Try again
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {tooShort ? (
        <p className="mt-4 text-sm text-muted">{tooShort}</p>
      ) : null}
      {error && state !== "writing" ? (
        <p className="mt-4 text-sm text-red-700">{error}</p>
      ) : null}

      {state === "live" ? (
        <div className="fixed inset-x-0 bottom-0 border-t border-line bg-canvas px-4 py-3">
          <div className="mx-auto flex max-w-[640px] flex-wrap items-center justify-center gap-2">
            <Button variant="secondary" onClick={toggleMute}>
              {muted ? "Unmute" : "Mute"}
            </Button>
            <Button onClick={seeNextMove}>See my next move</Button>
            <Button variant="ghost" onClick={openText}>
              Type instead
            </Button>
          </div>
        </div>
      ) : null}

      {state === "text" ? (
        <div className="fixed inset-x-0 bottom-0 border-t border-line bg-canvas px-4 py-3">
          <div className="mx-auto flex max-w-[640px] justify-center">
            <Button onClick={seeNextMove}>See my next move</Button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
