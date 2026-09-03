"use client";

import Vapi from "@vapi-ai/web";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { identifyEmail, track } from "@/lib/analytics";
import { FIRST_MESSAGE, SYSTEM_PROMPT } from "@/lib/script";
import { userTurnCount, type TranscriptTurn } from "@/lib/extract";
import { Button, StateLabel, Waveform, Wordmark } from "@/lib/ui";

type TalkState =
  | "ready"
  | "connecting"
  | "live"
  | "failed"
  | "text"
  | "writing";

type VoicePhase = "ready" | "listening" | "thinking" | "speaking";

const PHASE = {
  1: "Your story",
  2: "Your options",
  3: "Your next step",
} as const;

const VOICE_LABEL: Record<VoicePhase, string> = {
  ready: "Ready when you are",
  listening: "Listening",
  thinking: "Thinking about what you shared",
  speaking: "Speaking",
};

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

function PhaseRow({ act }: { act: 1 | 2 | 3 }) {
  return (
    <p className="text-[15px]">
      {([1, 2, 3] as const).map((n, i) => (
        <span key={n}>
          {i > 0 ? <span className="text-muted"> · </span> : null}
          <span className={act === n ? "font-semibold text-forest" : "text-muted"}>
            {PHASE[n]}
          </span>
        </span>
      ))}
    </p>
  );
}

function HairlineRow({ children }: { children: string }) {
  return (
    <p className="border-t border-line py-4 text-[15px] leading-relaxed last:border-b">
      {children}
    </p>
  );
}

export function TalkClient({
  id,
  email,
  source,
}: {
  id: string;
  email: string | null;
  source: string;
}) {
  const router = useRouter();

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
  const [voicePhase, setVoicePhase] = useState<VoicePhase>("ready");
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
    if (turn.role === "user") setVoicePhase("thinking");
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
      if (!data.error) {
        track("conversation_finished", { session_id: id, source });
      }
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
      // Aura-2 by default: ElevenLabs via Vapi failed with
      // pipeline-error-eleven-labs-voice-failed (account credential).
      // Set NEXT_PUBLIC_VOICE_TIER=eleven to opt back in once fixed.
      voice:
        process.env.NEXT_PUBLIC_VOICE_TIER === "eleven"
          ? {
              provider: "11labs" as const,
              voiceId: "EXAVITQu4vr4xnSDxMaL",
              model: "eleven_turbo_v2_5",
            }
          : { provider: "vapi" as const, voiceId: "Rohan" },
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
      artifactPlan: { recordingEnabled: false },
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
    vapi.on("speech-start", () => setVoicePhase("speaking"));
    vapi.on("speech-end", () => setVoicePhase("listening"));
    vapi.on("call-start", () => {
      setState("live");
      setVoicePhase("ready");
      setTimerOn(true);
    });
    vapi.on("error", (e: unknown) => {
      console.error("vapi error", e);
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

  function onConversationStarted() {
    track("conversation_started", { session_id: id, source });
    if (email) identifyEmail(email);
  }

  async function beginVoice() {
    onConversationStarted();
    setError("");
    setTooShort("");
    setState("connecting");
    setVoicePhase("ready");
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
    onConversationStarted();
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

  const lastAssistant = [...transcript]
    .reverse()
    .find((t) => t.role === "assistant");
  const lastUser = [...transcript].reverse().find((t) => t.role === "user");
  const waveState =
    state === "connecting"
      ? "connecting"
      : state === "writing"
        ? "writing"
        : voicePhase === "listening" || voicePhase === "speaking"
          ? voicePhase
          : "idle";

  return (
    <main
      className={`mx-auto flex min-h-dvh w-full max-w-[560px] flex-col bg-canvas px-5 pt-5 ${
        state === "text"
          ? "pb-[calc(17rem+env(safe-area-inset-bottom))]"
          : state === "live"
            ? "pb-32"
            : "pb-10"
      }`}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <Link href="/">
          <Wordmark />
        </Link>
        <Button variant="ghost" href="/">
          Leave
        </Button>
      </div>

      <div className="mb-6 flex items-center justify-between gap-3">
        <PhaseRow act={act} />
        {timerOn ? (
          <p className="shrink-0 text-sm tabular-nums text-muted">
            {formatElapsed(elapsed)}
          </p>
        ) : null}
      </div>

      {state === "ready" ? (
        <div>
          <h2>Let&apos;s get ready to talk.</h2>
          <div className="mt-6">
            <HairlineRow>
              About ten minutes, in three short parts. Stop any time.
            </HairlineRow>
            <HairlineRow>
              Your voice is not stored. The transcript is, so your result works.
            </HairlineRow>
            <HairlineRow>Nothing is sent for you.</HairlineRow>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <Button onClick={beginVoice}>Enable microphone and start</Button>
            <Button variant="secondary" onClick={openText}>
              Write it out instead
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted">
            You&apos;re speaking with an AI. Ashwin is not on the call.
          </p>
        </div>
      ) : null}

      {state === "connecting" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16">
          <Waveform state="connecting" />
          <StateLabel>Connecting</StateLabel>
        </div>
      ) : null}

      {state === "live" ? (
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col items-center gap-3">
            <Waveform state={waveState} />
            <StateLabel>{VOICE_LABEL[voicePhase]}</StateLabel>
          </div>
          {lastAssistant ? (
            <p className="mt-8 font-display text-[1.25rem] leading-snug">
              {lastAssistant.text}
            </p>
          ) : null}
          {lastUser ? (
            <p className="mt-4 text-muted">{lastUser.text}</p>
          ) : null}
          <button
            type="button"
            className="mt-6 min-h-11 self-start text-[15px] font-medium text-ink hover:underline"
            onClick={() => setShowFull((v) => !v)}
          >
            {showFull ? "Hide full transcript" : "Show full transcript"}
          </button>
          {showFull ? (
            <ol className="mt-4 flex flex-col gap-3">
              {transcript.map((t, i) => (
                <li
                  key={i}
                  className={`text-[15px] leading-relaxed ${
                    t.role === "assistant" ? "font-display" : "text-muted"
                  }`}
                >
                  {t.text}
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      ) : null}

      {state === "failed" ? (
        <div>
          <h2>Microphone access is blocked.</h2>
          <p className="mt-4 leading-relaxed">
            Your browser blocked the microphone, or the call dropped. Allow the
            mic in the address bar and try again, or write it out instead. You
            get the same result either way.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Button
              onClick={() => {
                setElapsed(0);
                beginVoice();
              }}
            >
              Try again
            </Button>
            <Button variant="secondary" onClick={openText}>
              Write it out instead
            </Button>
          </div>
          <details className="group mt-6">
            <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 text-[15px] font-medium hover:underline">
              How to allow the microphone
              <span className="text-muted group-open:hidden" aria-hidden>
                +
              </span>
              <span className="hidden text-muted group-open:inline" aria-hidden>
                −
              </span>
            </summary>
            <ul className="mt-3 flex flex-col gap-2 text-[15px] text-muted">
              <li>Chrome (lock icon → Site settings → Microphone)</li>
              <li>Safari (Safari menu → Settings for this website)</li>
              <li>Mobile (browser site settings, then reload)</li>
            </ul>
          </details>
        </div>
      ) : null}

      {state === "text" ? (
        <ol className="flex flex-1 flex-col gap-4 overflow-y-auto pb-4">
          {transcript.map((t, i) => (
            <li
              key={i}
              className={
                t.role === "assistant"
                  ? "font-display text-[1.125rem] leading-snug"
                  : "text-[15px] text-muted"
              }
            >
              {t.text}
            </li>
          ))}
        </ol>
      ) : null}

      {state === "writing" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16">
          <Waveform state="writing" />
          <StateLabel>Writing your next move</StateLabel>
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

      {tooShort ? <p className="mt-4 text-sm text-muted">{tooShort}</p> : null}
      {error && state !== "writing" ? (
        <p className="mt-4 text-sm text-red-700">{error}</p>
      ) : null}

      {state === "live" ? (
        <div className="fixed inset-x-0 bottom-0 border-t border-line bg-canvas px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex max-w-[560px] flex-wrap items-center justify-center gap-2">
            <Button variant="secondary" onClick={toggleMute}>
              {muted ? "Unmute" : "Mute"}
            </Button>
            <Button onClick={seeNextMove}>See my next move</Button>
            <Button variant="ghost" onClick={openText}>
              Switch to text
            </Button>
          </div>
        </div>
      ) : null}

      {state === "text" ? (
        <div className="fixed inset-x-0 bottom-0 border-t border-line bg-canvas px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <form
            className="mx-auto flex w-full max-w-[560px] flex-col gap-2"
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
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="submit" disabled={sending || !draft.trim()}>
                {sending ? "Sending…" : "Send"}
              </Button>
              <Button onClick={seeNextMove}>See my next move</Button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}
