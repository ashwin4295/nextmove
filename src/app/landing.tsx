"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { rememberSource, track } from "@/lib/analytics";
import { normalizeLinkedInUrl } from "@/lib/profile";
import {
  Badge,
  Button,
  Container,
  Eyebrow,
  Frame,
  Rule,
  Section,
  Wordmark,
} from "@/lib/ui";

const inputClass =
  "w-full min-h-12 rounded-none border border-muted bg-paper px-4 py-3 text-base text-ink placeholder:text-muted";

const labelClass =
  "flex flex-1 flex-col gap-1.5 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-forest";

function StartForm({ source, id }: { source: string; id?: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [capMessage, setCapMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("First name is required.");
      return;
    }
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Enter a valid email.");
      return;
    }
    const phoneDigits = phone.replace(/[^0-9]/g, "");
    if (phoneDigits.length < 8 || phoneDigits.length > 15) {
      setError("Add the WhatsApp number we should send your result to.");
      return;
    }
    const trimmedLinkedin = linkedin.trim();
    if (!trimmedLinkedin) {
      setError("Add your LinkedIn profile link to start.");
      return;
    }
    const normalised = normalizeLinkedInUrl(trimmedLinkedin);
    if (!normalised) {
      setError("That doesn't look like a LinkedIn profile link.");
      return;
    }
    const linkedinUrl: string = normalised;
    setBusy(true);
    setError("");
    setCapMessage("");
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source,
          name: name.trim(),
          email: trimmedEmail,
          linkedinUrl,
          phone: phone.trim() || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        id?: string;
        error?: string;
      };
      if (data.error === "email_cap") {
        setCapMessage(
          "You've already had your free conversation. Your result page has everything from it. Reply to your result email if you need it again.",
        );
        setBusy(false);
        return;
      }
      if (data.error === "daily_cap") {
        setCapMessage(
          "We're full for today. Your spot is saved and we'll email you when it opens tomorrow.",
        );
        setBusy(false);
        return;
      }
      if (!res.ok) {
        setError(
          data.error === "invalid linkedin"
            ? "That doesn't look like a LinkedIn profile link."
            : res.status === 400
              ? "Enter a valid email."
              : "Could not start. Try again.",
        );
        setBusy(false);
        return;
      }
      if (!data.id) throw new Error("no id");
      void fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: data.id }),
        keepalive: true,
      });
      if (linkedinUrl) {
        track("profile_submitted", { session_id: data.id, source });
      }
      router.push(`/talk/${data.id}`);
    } catch {
      setError("Could not start. Try again.");
      setBusy(false);
    }
  }

  return (
    <form id={id} className="flex flex-col gap-3" onSubmit={onSubmit}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className={labelClass}>
          First name
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your first name"
            autoComplete="given-name"
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            autoComplete="email"
            className={inputClass}
          />
        </label>
      </div>
      <label className={labelClass}>
        LinkedIn profile
        <input
          required
          value={linkedin}
          onChange={(e) => setLinkedin(e.target.value)}
          placeholder="linkedin.com/in/yourname"
          autoComplete="url"
          inputMode="url"
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        WhatsApp number{" "}
        <span className="font-sans text-[0.8125rem] font-normal normal-case tracking-normal text-muted">
          (we WhatsApp you your result)
        </span>
        <input
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 98765 43210"
          autoComplete="tel"
          inputMode="tel"
          className={inputClass}
        />
      </label>
      <Button type="submit" disabled={busy} className="w-full sm:w-auto">
        {busy ? "Starting…" : "Start a conversation"}
      </Button>
      {capMessage ? (
        <p className="text-[15px] leading-relaxed text-ink">{capMessage}</p>
      ) : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </form>
  );
}

const HOW_STAGES = [
  {
    label: "Tell your story",
    line: "About ten minutes. What changed, what you are moving toward, what has to stay true.",
  },
  {
    label: "See the doors",
    line: "Two or three directions, each with an honest read on how real it is for you.",
  },
  {
    label: "Take one step",
    line: "One named person, one drafted message, one experiment, one date.",
  },
] as const;

const MEERA_MESSAGE =
  "Hi Meera, I have been in customer operations for eight years and lately I am only reporting on dashboards. I want to move into business operations, and you are the person I know who already did. Could I get twenty minutes to ask what the week actually looks like? Completely fine if this month is too full.";

const BRIEF_OPTIONS: {
  name: string;
  tone: "realistic" | "strong fit" | "a stretch";
  why: string;
  check: string;
  trade: string;
  test: string;
}[] = [
  {
    name: "Business operations",
    tone: "realistic",
    why: "You already improve how things work. Broader operations reuse that craft with more ownership.",
    check: "The scope is wider, and the day-to-day still needs a real look.",
    trade: "You leave a function you know for a seat that is less mapped.",
    test: "A twenty-minute conversation with Meera about what the week actually looks like.",
  },
  {
    name: "Customer operations elsewhere",
    tone: "strong fit",
    why: "Same craft, a different team, and a chance to stop only reporting on dashboards.",
    check: "Whether the new role is ownership or another reporting loop.",
    trade: "You move, but you may still be in the same kind of work.",
    test: "Ask two people who left similar teams what actually changed in the first month.",
  },
  {
    name: "Product management",
    tone: "a stretch",
    why: "Improving systems sits next to product. The pull is real; the proof is not there yet.",
    check: "You have not done the role, and income stability has to stay true.",
    trade: "A longer ramp, and a title that does not reuse your current evidence.",
    test: "Sit with one product manager for a working session before you treat it as the door.",
  },
];

function ResultBrief() {
  return (
    <div className="border border-[var(--rule)]">
      <p className="px-5 py-4 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-forest md:px-8">
        Illustrative brief · Priya, 8 years in customer operations
      </p>
      <Rule />
      <div className="px-5 py-6 md:px-8">
        <h3 className="font-display text-[1.75rem] font-normal leading-[1.25]">
          What we heard
        </h3>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <Eyebrow>Moving away from</Eyebrow>
            <p className="mt-2 text-[15px] text-muted">
              Only reporting on dashboards, with little ownership of how things
              work.
            </p>
          </div>
          <div>
            <Eyebrow>Moving toward</Eyebrow>
            <p className="mt-2 text-[15px] text-muted">
              Broader operations work that lets her improve the system, not just
              describe it.
            </p>
          </div>
        </div>
        <Eyebrow className="mt-6">What has to stay true</Eyebrow>
        <p className="mt-2 text-[15px] text-muted">
          Income stability · Ownership · Improving systems
        </p>
      </div>
      {BRIEF_OPTIONS.map((opt) => (
        <div key={opt.name}>
          <Rule />
          <div className="px-5 py-6 md:px-8">
            <div className="flex flex-wrap items-baseline gap-3">
              <p className="font-display text-[1.75rem] font-normal leading-[1.25]">
                {opt.name}
              </p>
              <Badge tone={opt.tone} />
            </div>
            <div className="mt-4 grid gap-4 text-[15px] md:grid-cols-2">
              <div>
                <Eyebrow>Why it may fit</Eyebrow>
                <p className="mt-2 text-muted">{opt.why}</p>
              </div>
              <div>
                <Eyebrow>What needs checking</Eyebrow>
                <p className="mt-2 text-muted">{opt.check}</p>
              </div>
              <div>
                <Eyebrow>The trade-off</Eyebrow>
                <p className="mt-2 text-muted">{opt.trade}</p>
              </div>
              <div>
                <Eyebrow>One low-risk test</Eyebrow>
                <p className="mt-2 text-muted">{opt.test}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
      <Rule />
      <div className="px-5 py-6 md:px-8">
        <Eyebrow>First message → Meera</Eyebrow>
        <p className="mt-3 text-[15px] leading-relaxed">{MEERA_MESSAGE}</p>
        <p className="mt-3 text-[15px] text-muted">
          You decide whether to send it. Nothing is sent for you.
        </p>
      </div>
    </div>
  );
}

const FAQ = [
  {
    q: "Is this an AI or a human coach?",
    a: "An AI, running a script written by a real coach. For the hard calls, book the human at the end of your result.",
  },
  {
    q: "What if I don't know what I want next?",
    a: "That is the normal starting point. The first act is about what changed, not what you want.",
  },
  {
    q: "Can I type instead of speaking?",
    a: "Yes. Type instead works the same way and gives the same result.",
  },
  {
    q: "Will it help me find a job?",
    a: "No. It helps you decide the direction and start the first conversation. Job search comes after, and it is not this product.",
  },
  {
    q: "Can the next move be staying where I am?",
    a: "Yes, and the coach will say so if that is the honest read. Stay and reinvent is one of the doors.",
  },
  {
    q: "What does it cost?",
    a: "Try for free till September 6. A paid pack with more drafted messages is ₹299 till September 6, then ₹999.",
  },
  {
    q: "What happens to my conversation?",
    a: "Audio is not stored. The transcript is, so your page works. Nothing is sent to anyone unless you send it.",
  },
];

function FaqList() {
  return (
    <div>
      {FAQ.map((item) => (
        <details key={item.q} className="group">
          <Rule />
          <summary className="flex cursor-pointer items-center justify-between gap-4 py-5 text-left">
            <span className="font-display text-[1.25rem] leading-snug">
              {item.q}
            </span>
            <span
              className="ml-4 inline-flex size-11 shrink-0 items-center justify-center font-mono text-lg font-medium text-muted group-open:hidden"
              aria-hidden
            >
              +
            </span>
            <span
              className="ml-4 hidden size-11 shrink-0 items-center justify-center font-mono text-lg font-medium text-muted group-open:inline-flex"
              aria-hidden
            >
              −
            </span>
          </summary>
          <p className="max-w-[62ch] pb-5 text-muted">{item.a}</p>
        </details>
      ))}
      <Rule />
    </div>
  );
}

function TrustRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-t border-[var(--rule)] py-4 first:border-t-0 first:pt-0 last:pb-0">
      <Eyebrow>{label}</Eyebrow>
      <p className="mt-2 text-[15px] text-muted">{children}</p>
    </div>
  );
}

const PROBLEM_ROWS = [
  {
    n: "01 · Recruiter",
    quote: "\"You'd be great for this.\"",
    note: "Fit for them is not fit for you.",
  },
  {
    n: "02 · Friend",
    quote: "\"Just go for it.\"",
    note: "Encouragement is not evidence.",
  },
  {
    n: "03 · Quiz",
    quote: "\"You're an Explorer type.\"",
    note: "A label is not a next step.",
  },
];

const LEAVE_WITH = [
  {
    eyebrow: "For the undecided",
    head: "Know which door fits before you tell anyone.",
    body: "Two or three doors, one graded above the rest, in your own words. At least one will be marked a stretch or a long shot when the evidence says so.",
  },
  {
    eyebrow: "For the almost-sure",
    head: "Know how real your shot is.",
    body: "Not a percentage. A word: strong fit, realistic, a stretch, long shot. And the one thing that would sink it.",
  },
  {
    eyebrow: "For the stuck",
    head: "Send the first message tonight.",
    body: "To a person you already know in that world, drafted from what you said. You copy it. You send it. Nothing is sent for you.",
  },
];

const NAV_LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#example", label: "See an example" },
  { href: "#faq", label: "FAQ" },
];

export function Landing({
  source,
  heroArt,
}: {
  source: string;
  heroArt: ReactNode;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (source) rememberSource(source);
  }, [source]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Frame>
      <div className="min-h-full bg-canvas">
        <header className="sticky top-0 z-20 h-16 bg-canvas">
          <Container className="relative flex h-16 items-center justify-between gap-3">
            <a
              href="#start"
              className="inline-flex min-h-11 shrink-0 items-center"
              aria-label="NextMove"
            >
              <Wordmark />
            </a>
            <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="inline-flex min-h-11 items-center font-mono text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-ink hover:underline"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <Button
              href="#start"
              className="shrink-0 !gap-2 !px-2 !text-[0.625rem] !tracking-[0.08em] min-[400px]:!gap-4 min-[400px]:!px-3 min-[400px]:!text-[0.75rem] min-[400px]:!tracking-[0.12em] md:!px-6"
            >
              Start a conversation
            </Button>
          </Container>
          {scrolled ? <Rule /> : null}
        </header>

        <Section id="start">
          <div className="grid items-center gap-12 md:grid-cols-12 md:gap-10 lg:gap-14">
            <div className="min-w-0 md:col-span-6">
              <h1 className="hero-h1 mt-4">
                <span>You&apos;ve come</span>
                <span className="md:hidden"> </span>
                <br />
                <span>this far.</span>
                <span className="md:hidden"> </span>
                <br />
                <span>What comes</span>
                <span className="md:hidden"> </span>
                <br />
                <span>next?</span>
              </h1>
              <p className="mt-5 max-w-[46ch] text-[1.25rem] leading-[1.5]">
                Talk it through with an AI coach for about ten minutes. It tells
                you which door fits, how real your shot is, and writes the first
                message to someone you already know in that world.
              </p>
              <div className="mt-8">
                <StartForm source={source} />
              </div>
              <p className="mt-4 text-[15px] text-muted">
                About ten minutes · Voice or text · Try for free till September 6
              </p>
              <p className="mt-1 text-[15px] text-muted">
                The coach reads your public LinkedIn profile and skips the
                basics. We never post, connect, or message anyone.
              </p>
            </div>
            <div className="min-w-0 md:col-span-6">
              <div className="card-shadow border border-[var(--rule)] bg-paper p-6">
                <div className="text-ink">{heroArt}</div>
                <p className="mt-4 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-forest">
                  Fig. 01 · Three doors, one path
                </p>
              </div>
            </div>
          </div>
        </Section>

        <Section id="problem">
          <div className="grid gap-10 md:grid-cols-12 md:gap-6">
            <div className="md:col-span-5">
              <h2>
                Every career
                <br /> decision begins with
                <br /> someone else&apos;s word.
              </h2>
            </div>
            <div className="md:col-span-7">
              <p className="border-b border-[var(--rule)] pb-5 font-display text-[1.75rem] leading-[1.25]">
                A recruiter gives you a role.
              </p>
              <p className="border-b border-[var(--rule)] py-5 font-display text-[1.75rem] leading-[1.25]">
                A friend gives you an opinion.
              </p>
              <p className="border-b border-[var(--rule)] py-5 font-display text-[1.75rem] leading-[1.25]">
                A quiz gives you a label.
              </p>
              <p className="pt-5 font-display text-[1.75rem] leading-[1.25] text-forest">
                None of them has to tell you which door actually fits, or what
                would sink it.
              </p>
            </div>
          </div>
          <div className="mt-12 grid gap-0 border-t border-[var(--rule)] md:grid-cols-3">
            {PROBLEM_ROWS.map((row, i) => (
              <div
                key={row.n}
                className={`py-6 md:px-6 md:py-8 ${i > 0 ? "border-t border-[var(--rule)] md:border-t-0 md:border-l" : ""}`}
              >
                <Eyebrow>{row.n}</Eyebrow>
                <p className="mt-4 font-display text-[1.75rem] leading-[1.25]">
                  {row.quote}
                </p>
                <p className="mt-3 text-[15px] text-muted">{row.note}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="leave" tone="forest">
          <Eyebrow className="text-canvas">What you leave with</Eyebrow>
          <h2 className="mt-4 max-w-[18ch] text-canvas">
            One door. Graded honestly.{" "}
            <em className="italic">The first message written.</em>
          </h2>
          <div className="mt-12 grid gap-0 border-t border-[var(--rule)] md:grid-cols-3">
            {LEAVE_WITH.map((col, i) => (
              <div
                key={col.eyebrow}
                className={`py-6 md:px-6 md:py-8 ${i > 0 ? "border-t border-[var(--rule)] md:border-t-0 md:border-l" : ""}`}
              >
                <Eyebrow className="text-canvas">{col.eyebrow}</Eyebrow>
                <p className="mt-4 font-display text-[1.75rem] leading-[1.25] text-canvas">
                  {col.head}
                </p>
                <p className="mt-3 text-[15px] text-muted">{col.body}</p>
                <a
                  href="#example"
                  className="mt-5 inline-flex min-h-11 items-center font-mono text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-canvas hover:underline"
                >
                  See an example →
                </a>
              </div>
            ))}
          </div>
        </Section>

        <Section id="how">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-4 max-w-none">
            Ten minutes. Three parts. One move.
          </h2>
          <div className="mt-10">
            {HOW_STAGES.map((item, i) => (
              <div
                key={item.label}
                className="grid gap-3 border-t border-[var(--rule)] py-8 last:border-b md:grid-cols-12 md:items-baseline"
              >
                <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-forest md:col-span-2">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p className="font-display text-[1.75rem] leading-[1.25] md:col-span-4">
                  {item.label}
                </p>
                <p className="text-[15px] text-muted md:col-span-6">
                  {item.line}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="example">
          <Eyebrow>An example, illustrative</Eyebrow>
          <h2 className="mt-4 max-w-[16ch]">
            A clearer direction. With the reasoning behind it.
          </h2>
          <div className="mt-10">
            <ResultBrief />
          </div>
        </Section>

        <Section id="trust" tone="sage">
          <div className="grid gap-10 md:grid-cols-12 md:gap-6">
            <div className="md:col-span-5">
              <h2>Know what happens to your story.</h2>
            </div>
            <div className="md:col-span-7">
              <TrustRow label="Audio">
                Not stored. Your voice is processed live to make the conversation
                work and is not kept by NextMove.
              </TrustRow>
              <TrustRow label="Transcript">
                Stored, so your result page and your message keep working.
                Processed by the AI providers that run the coach; not used to
                train them by us.
              </TrustRow>
              <TrustRow label="Sharing">
                Your result page is private unless you share the link. Anything
                you ask to keep private never appears on the shareable card.
              </TrustRow>
              <TrustRow label="Sending">
                Nothing is sent for you. You copy the message and decide.
              </TrustRow>
            </div>
          </div>
        </Section>

        <Section id="faq">
          <div className="grid gap-10 md:grid-cols-12 md:gap-6">
            <div className="md:col-span-4">
              <h2>Questions people ask first.</h2>
            </div>
            <div className="md:col-span-8">
              <FaqList />
            </div>
          </div>
        </Section>

        <Section id="close">
          <div className="mx-auto max-w-[720px] text-center">
            <h2 className="mx-auto max-w-none">
              Your next move
              <br /> starts with
              <br /> a conversation.
              <br /> Not a plan.
            </h2>
            <div className="mt-8 flex justify-center">
              <Button href="#start">Start a conversation</Button>
            </div>
          </div>
        </Section>

        <footer className="py-8">
          <Container className="flex flex-col gap-4 text-muted md:flex-row md:items-center md:justify-between">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center"
              aria-label="NextMove home"
            >
              <Wordmark />
            </Link>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <a
                href="/privacy"
                className="inline-flex min-h-11 items-center px-3 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.16em] hover:text-ink hover:underline"
              >
                Privacy
              </a>
              <a
                href="/terms"
                className="inline-flex min-h-11 items-center px-3 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.16em] hover:text-ink hover:underline"
              >
                Terms
              </a>
              <a
                href="https://github.com/ashwin4295/nextmove"
                className="inline-flex min-h-11 items-center px-3 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.16em] hover:text-ink hover:underline"
              >
                GitHub
              </a>
            </div>
          </Container>
        </footer>
      </div>
    </Frame>
  );
}
