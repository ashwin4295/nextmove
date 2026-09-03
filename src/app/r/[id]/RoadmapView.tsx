"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import type { NextMove, TranscriptTurn } from "@/lib/extract";
import { Badge, Button, Card, Container, Eyebrow, Wordmark } from "@/lib/ui";

type PublicNextMove = Omit<NextMove, "privateItems">;

const TRIGGER_SENTENCE: Record<NextMove["trigger"], string> = {
  push: "You're being pushed more than pulled.",
  pull: "You're being pulled more than pushed.",
  drift: "You're drifting more than being pushed or pulled.",
};

function formatDecisionDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function NextMoveView({
  id,
  nextMove,
  transcript,
  sent: initialSent,
  contactName: initialContactName,
  source,
}: {
  id: string;
  nextMove: PublicNextMove | null;
  transcript: TranscriptTurn[];
  sent: boolean;
  contactName: string | null;
  source: string;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(initialSent);
  const [shared, setShared] = useState(false);
  const [writing, setWriting] = useState(false);
  const [writeError, setWriteError] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [contactBusy, setContactBusy] = useState(false);
  const [message, setMessage] = useState(nextMove?.message ?? "");
  const [contactName, setContactName] = useState(
    nextMove?.contact.name ?? initialContactName,
  );
  const [contactRelation] = useState(nextMove?.contact.relation ?? null);

  const userTurns = transcript.filter(
    (t) => t.role === "user" && t.text.trim(),
  ).length;

  useEffect(() => {
    if (nextMove) {
      track("next_move_written", { session_id: id, source });
    }
  }, [id, nextMove, source]);

  async function writeNow() {
    setWriting(true);
    setWriteError("");
    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, transcript }),
      });
      const data = (await res.json()) as { error?: string };
      if (data.error === "too_short") {
        setWriteError("This conversation was too short for an honest answer.");
        return;
      }
      if (data.error) throw new Error(data.error);
      track("conversation_finished", { session_id: id, source });
      router.refresh();
    } catch {
      setWriteError("Could not write it. Try again.");
    } finally {
      setWriting(false);
    }
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
    } catch {
      // clipboard may be blocked
    }
    setCopied(true);
    track("message_copied", { session_id: id, source });
    window.setTimeout(() => setCopied(false), 2000);
  }

  async function markSent() {
    await fetch("/api/sent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setSent(true);
    track("message_sent", { session_id: id, source });
  }

  async function writeForThem() {
    const name = nameDraft.trim();
    if (!name) return;
    setContactBusy(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, contactName: name }),
      });
      const data = (await res.json()) as {
        message?: string;
        contactName?: string;
      };
      if (data.message) setMessage(data.message);
      setContactName(data.contactName ?? name);
    } finally {
      setContactBusy(false);
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
    track("page_shared", { session_id: id, source });
    window.setTimeout(() => setShared(false), 2000);
  }

  function onPack() {
    const payLink = process.env.NEXT_PUBLIC_PAY_LINK;
    if (payLink) {
      track("pay_clicked", { session_id: id, source });
      const sep = payLink.includes("?") ? "&" : "?";
      window.open(
        `${payLink}${sep}client_reference_id=${encodeURIComponent(id)}`,
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }
    track("pack_clicked", { session_id: id, source });
  }

  if (!nextMove) {
    return (
      <main className="mx-auto flex min-h-full w-full max-w-[720px] flex-col gap-6 px-4 py-8">
        <Wordmark />
        {userTurns < 2 ? (
          <p className="font-display text-2xl font-medium leading-snug">
            This conversation was too short for an honest answer.{" "}
            <Link href="/" className="text-accent underline">
              Start again.
            </Link>
          </p>
        ) : (
          <div>
            <h1 className="font-display text-3xl font-medium">
              Not written yet
            </h1>
            <div className="mt-6">
              <Button onClick={writeNow} disabled={writing}>
                {writing ? "Writing…" : "Write it now"}
              </Button>
            </div>
            {writeError ? (
              <p className="mt-3 text-sm text-red-700">{writeError}</p>
            ) : null}
          </div>
        )}
      </main>
    );
  }

  const toLine = contactName
    ? `To: ${contactName}${contactRelation ? ` · ${contactRelation}` : ""}`
    : "To: ";

  return (
    <main className="min-h-full bg-canvas pb-16">
      <Container className="max-w-[720px] py-8">
        <Wordmark />
        <Eyebrow className="mt-8">YOUR NEXT MOVE</Eyebrow>
        <h1 className="mt-3">{nextMove.chosenPath.name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge tone={nextMove.chosenPath.realism} />
        </div>
        <p className="mt-4 leading-relaxed">{nextMove.chosenPath.whyItFits}</p>
        <p className="mt-3 text-muted">
          {TRIGGER_SENTENCE[nextMove.trigger] ?? TRIGGER_SENTENCE.drift}
        </p>

        <Eyebrow className="mt-12">THE FIRST MESSAGE</Eyebrow>
        <Card shadow className="mt-4 border border-line p-6">
          <p className="text-sm font-semibold">{toLine}</p>
          <p className="mt-4 select-text leading-relaxed">{message}</p>
          {!contactName ? (
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                placeholder="Who do you know in this world? First name"
                className="w-full rounded-[10px] border border-line bg-surface px-3 py-2 text-base"
              />
              <Button
                onClick={writeForThem}
                disabled={contactBusy || !nameDraft.trim()}
              >
                {contactBusy ? "Writing…" : "Write it for them"}
              </Button>
            </div>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={copyMessage}>
              {copied ? "Copied" : "Copy message"}
            </Button>
            <Button
              variant="secondary"
              onClick={markSent}
              disabled={sent}
            >
              {sent ? "Sent ✓" : "I sent it"}
            </Button>
          </div>
        </Card>

        <Eyebrow className="mt-12">WHAT HAS TO STAY TRUE</Eyebrow>
        {nextMove.anchors.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {nextMove.anchors.map((a) => (
              <li
                key={a}
                className="rounded-full bg-wash px-3 py-1 text-sm text-ink"
              >
                {a}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold">Moving away from</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {nextMove.awayFrom}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold">Moving toward</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {nextMove.toward}
            </p>
          </div>
        </div>

        {nextMove.otherPaths.length > 0 ? (
          <>
            <Eyebrow className="mt-12">THE OTHER DOORS</Eyebrow>
            <ul className="mt-4 flex flex-col gap-4">
              {nextMove.otherPaths.map((path) => (
                <li key={path.name} className="border-b border-line pb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{path.name}</p>
                    <Badge tone={path.realism} />
                  </div>
                  <p className="mt-1 text-sm leading-relaxed">{path.whyItFits}</p>
                  <p className="mt-1 text-sm text-muted">{path.firstGap}</p>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <Card className="mt-12 bg-accent-wash p-6">
          <p className="font-display text-lg font-medium">Your next 30 days</p>
          <p className="mt-3 leading-relaxed">{nextMove.experiment}</p>
          <p className="mt-3 text-sm font-medium">
            Decision date: {formatDecisionDate(nextMove.decisionDate)}
          </p>
        </Card>

        <Eyebrow className="mt-12">GO FURTHER</Eyebrow>
        <Card className="mt-4 border border-line p-6">
          <p className="font-display text-lg font-medium">The Next Move Pack</p>
          <p className="mt-3 leading-relaxed">
            Three more messages written for you: one to a hiring manager in that
            world, one to a mentor you admire, and one to your current manager
            for the internal version of this move. Plus a two-week follow-up
            plan and a re-run of this conversation after you have had the first
            one.
          </p>
          <p className="mt-3 text-sm font-medium">₹499, one time.</p>
          <div className="mt-5">
            {process.env.NEXT_PUBLIC_PAY_LINK ? (
              <Button onClick={onPack}>Get the pack</Button>
            ) : (
              <Button className="opacity-50" onClick={onPack}>
                Coming Saturday
              </Button>
            )}
          </div>
        </Card>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button onClick={share}>
            {shared ? "Link copied" : "Share this page"}
          </Button>
          <Button
            variant="secondary"
            href="https://calendly.com/mbbprepofficial/15min?utm_source=nextmove"
          >
            Talk it through with Ashwin
          </Button>
        </div>

        <details className="mt-10 rounded-[12px] border border-line bg-surface px-5 py-4">
          <summary className="cursor-pointer font-semibold">
            Read the transcript
          </summary>
          <ol className="mt-4 flex flex-col gap-3">
            {transcript.map((t, i) => (
              <li key={i} className="text-sm leading-relaxed">
                <span className="font-semibold">
                  {t.role === "assistant" ? "Coach" : "You"}:{" "}
                </span>
                {t.text}
              </li>
            ))}
          </ol>
        </details>
      </Container>
    </main>
  );
}
