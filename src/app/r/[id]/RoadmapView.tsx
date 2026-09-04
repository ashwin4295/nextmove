"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import type { NextMove, Pack, TranscriptTurn } from "@/lib/extract";
import type { Profile } from "@/lib/profile";
import {
  Badge,
  Button,
  Card,
  Container,
  Eyebrow,
  RouteLine,
  Wordmark,
} from "@/lib/ui";

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
  paid = false,
  pack = null,
  profile = null,
}: {
  id: string;
  nextMove: PublicNextMove | null;
  transcript: TranscriptTurn[];
  sent: boolean;
  contactName: string | null;
  source: string;
  paid?: boolean;
  pack?: Pack | null;
  profile?: Profile | null;
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
  const [showCorrection, setShowCorrection] = useState(false);
  const [correction, setCorrection] = useState("");
  const [correctBusy, setCorrectBusy] = useState(false);
  const [correctError, setCorrectError] = useState("");
  const [packBusy, setPackBusy] = useState(false);
  const [packError, setPackError] = useState("");
  const [copiedPack, setCopiedPack] = useState<number | null>(null);

  const userTurns = transcript.filter(
    (t) => t.role === "user" && t.text.trim(),
  ).length;

  useEffect(() => {
    if (nextMove) {
      track("next_move_written", { session_id: id, source });
    }
  }, [id, nextMove, source]);

  useEffect(() => {
    if (!paid) return;
    try {
      const key = `nextmove_pack_paid_${id}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // private mode
    }
    track("pack_paid", { session_id: id, source });
  }, [id, paid, source]);

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

  async function onPack() {
    if (packBusy) return;
    track("pay_clicked", { session_id: id, source });
    setPackBusy(true);
    setPackError("");
    try {
      const res = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.error || !data.url) {
        setPackError("Payments are not available right now.");
        return;
      }
      const opened = window.open(data.url, "_blank", "noopener,noreferrer");
      if (!opened) {
        window.location.href = data.url;
      }
    } catch {
      setPackError("Payments are not available right now.");
    } finally {
      setPackBusy(false);
    }
  }

  async function submitCorrection() {
    const text = correction.trim();
    if (!text || !nextMove || correctBusy) return;
    setCorrectBusy(true);
    setCorrectError("");
    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          transcript: [
            ...transcript,
            { role: "user" as const, text: `Correction: ${text}` },
          ],
          actReached: nextMove.actReached,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok || data.error) {
        setCorrectError("Could not update. Try again.");
        return;
      }
      track("result_corrected", { session_id: id, source });
      window.location.reload();
    } catch {
      setCorrectError("Could not update. Try again.");
    } finally {
      setCorrectBusy(false);
    }
  }

  if (!nextMove) {
    return (
      <main className="mx-auto flex min-h-full w-full max-w-[720px] flex-col gap-6 px-5 py-8">
        <Wordmark />
        {userTurns < 2 ? (
          <p className="font-display text-2xl font-normal leading-snug">
            This conversation was too short for an honest answer.{" "}
            <Link href="/" className="text-forest underline">
              Start again.
            </Link>
          </p>
        ) : (
          <div>
            <h1>Not written yet</h1>
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
        <div className="mt-8">
          <RouteLine variant="result" />
        </div>
        <Eyebrow className="mt-6">YOUR NEXT MOVE</Eyebrow>
        <h1 className="mt-3">{nextMove.chosenPath.name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge tone={nextMove.chosenPath.realism} />
        </div>
        <p className="mt-4 leading-relaxed">{nextMove.chosenPath.whyItFits}</p>
        <p className="mt-3 text-muted">
          {TRIGGER_SENTENCE[nextMove.trigger] ?? TRIGGER_SENTENCE.drift}
        </p>

        <Card className="mt-10 p-6">
          <p className="text-lg font-semibold">What we heard</p>
          {profile ? (
            <p className="mt-2 text-[15px] text-muted">
              From your profile: {profile.headline}
              {profile.yearsExperience != null
                ? ` · ${profile.yearsExperience} years`
                : ""}
            </p>
          ) : null}
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-[15px] font-semibold">Moving away from</p>
              <p className="mt-1 text-[15px] leading-relaxed text-muted">
                {nextMove.awayFrom}
              </p>
            </div>
            <div>
              <p className="text-[15px] font-semibold">Moving toward</p>
              <p className="mt-1 text-[15px] leading-relaxed text-muted">
                {nextMove.toward}
              </p>
            </div>
          </div>
          <p className="mt-5 text-[15px] font-semibold">What has to stay true</p>
          {nextMove.anchors.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {nextMove.anchors.map((a) => (
                <li
                  key={a}
                  className="rounded-full bg-sage px-3 py-1 text-[15px] text-ink"
                >
                  {a}
                </li>
              ))}
            </ul>
          ) : null}
          <button
            type="button"
            className="mt-5 min-h-11 text-[15px] font-medium text-ink hover:underline"
            onClick={() => setShowCorrection((v) => !v)}
          >
            That&apos;s not quite right
          </button>
          {showCorrection ? (
            <div className="mt-3 flex flex-col gap-3">
              <textarea
                value={correction}
                onChange={(e) => setCorrection(e.target.value)}
                rows={4}
                className="w-full rounded-[10px] border border-line bg-surface px-3 py-2 text-base"
                placeholder="Tell the coach what it got wrong"
              />
              <Button
                onClick={submitCorrection}
                disabled={correctBusy || !correction.trim()}
                className="self-start"
              >
                {correctBusy ? "Updating…" : "Update my next move"}
              </Button>
              {correctError ? (
                <p className="text-sm text-red-700">{correctError}</p>
              ) : null}
            </div>
          ) : null}
        </Card>

        <Card shadow className="mt-8 p-6">
          <p className="text-[15px] font-semibold">The first message</p>
          <p className="mt-3 text-sm font-semibold">{toLine}</p>
          <p className="mt-4 select-text leading-relaxed">{message}</p>
          {!contactName ? (
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                placeholder="Who do you know in this world? First name"
                className="w-full min-h-12 rounded-[10px] border border-line bg-surface px-3 py-2 text-base"
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
            <Button variant="secondary" onClick={markSent} disabled={sent}>
              {sent ? "Sent ✓" : "I sent it"}
            </Button>
          </div>
          <p className="mt-4 text-[15px] text-muted">
            You decide whether to send it. Nothing is sent for you.
          </p>
        </Card>

        {nextMove.otherPaths.length > 0 ? (
          <div className="mt-10">
            <p className="text-lg font-semibold">The other doors</p>
            <ul className="mt-4 flex flex-col">
              {nextMove.otherPaths.map((path) => (
                <li key={path.name} className="border-t border-line py-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{path.name}</p>
                    <Badge tone={path.realism} />
                  </div>
                  <p className="mt-3 text-[15px] font-semibold">Why it may fit</p>
                  <p className="mt-1 text-[15px] leading-relaxed">
                    {path.whyItFits}
                  </p>
                  <p className="mt-3 text-[15px] font-semibold">
                    What needs checking
                  </p>
                  <p className="mt-1 text-[15px] text-muted">{path.firstGap}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <Card className="mt-8 border-0 bg-sage p-6">
          <p className="text-lg font-semibold">Your next 30 days</p>
          <p className="mt-3 leading-relaxed">{nextMove.experiment}</p>
          <p className="mt-3 text-[15px] font-medium">
            Decision date: {formatDecisionDate(nextMove.decisionDate)}
          </p>
        </Card>

        {/consult|strateg/i.test(nextMove.chosenPath.name) ? (
          <Card className="mt-6 p-6">
            <p className="text-lg font-semibold">Consulting is your door.</p>
            <p className="mt-3 leading-relaxed">
              The gap between wanting it and getting an offer is the case
              interview, and it is trainable. MBB Prep is where the same coach
              who wrote these questions trains people for it: AI mock cases,
              drills, and a free masterclass every week.
            </p>
            <div className="mt-4">
              <Button
                href="https://mbbprep.com/?utm_source=nextmove&utm_medium=result&utm_campaign=consulting_door"
                variant="secondary"
                onClick={() => track("mbbprep_clicked", { session_id: id })}
              >
                See how MBB Prep works
              </Button>
            </div>
          </Card>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button onClick={share}>
            {shared ? "Link copied" : "Share this page"}
          </Button>
        </div>

        {paid && pack ? (
          <div className="mt-10">
            <Eyebrow>YOUR PACK</Eyebrow>
            <div className="mt-4 flex flex-col gap-4">
              {pack.messages.map((m, i) => (
                <Card key={`${m.to}-${i}`} className="p-6">
                  <p className="text-sm font-semibold">To: {m.to}</p>
                  <p className="mt-4 select-text leading-relaxed">{m.body}</p>
                  <div className="mt-5">
                    <Button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(m.body);
                        } catch {
                          // clipboard may be blocked
                        }
                        setCopiedPack(i);
                        window.setTimeout(() => setCopiedPack(null), 2000);
                      }}
                    >
                      {copiedPack === i ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            <p className="mt-8 text-lg font-semibold">Your two weeks</p>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-surface">
              <table className="w-full text-sm">
                <tbody>
                  {pack.plan.map((row) => (
                    <tr key={row.day} className="border-b border-line last:border-0">
                      <td className="px-4 py-3 font-semibold align-top whitespace-nowrap">
                        {row.day}
                      </td>
                      <td className="px-4 py-3 leading-relaxed">{row.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
        <Card className="mt-10 p-6">
          {paid ? (
            <>
              <p className="text-lg font-semibold">Your pack is on its way</p>
              <p className="mt-3 leading-relaxed">
                Thank you. The three messages and your two-week plan will reach
                your email within 24 hours. Reply to that email if anything
                reads wrong.
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold">The Next Move Pack</p>
              <p className="mt-3 leading-relaxed">
                Three more messages written for you: one to a hiring manager in
                that world, one to a mentor you admire, and one to your current
                manager for the internal version of this move. Plus a two-week
                follow-up plan and a re-run of this conversation after you have
                had the first one.
              </p>
              <p className="mt-3 text-[15px] font-medium">₹299, one time.</p>
              <div className="mt-5">
                <Button onClick={onPack} disabled={packBusy}>
                  {packBusy ? "Opening Razorpay…" : "Get the pack"}
                </Button>
              </div>
              {packError ? (
                <p className="mt-3 text-sm text-red-700">{packError}</p>
              ) : null}
            </>
          )}
        </Card>
        )}

        <details className="group mt-10 border-t border-b border-line py-4">
          <summary className="flex cursor-pointer items-center justify-between gap-3 font-semibold">
            Read the transcript
            <span className="text-muted group-open:hidden" aria-hidden>
              +
            </span>
            <span className="hidden text-muted group-open:inline" aria-hidden>
              −
            </span>
          </summary>
          <ol className="mt-4 flex flex-col gap-3">
            {transcript.map((t, i) => (
              <li
                key={i}
                className={`text-[15px] leading-relaxed ${
                  t.role === "assistant" ? "font-display" : "text-muted"
                }`}
              >
                <span className="font-sans font-semibold text-ink">
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
