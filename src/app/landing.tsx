"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { rememberSource, track } from "@/lib/analytics";
import { normalizeLinkedInUrl } from "@/lib/profile";
import {
  Badge,
  Button,
  Card,
  Container,
  Eyebrow,
  RouteLine,
  Section,
  StateLabel,
  Waveform,
  Wordmark,
} from "@/lib/ui";

const inputClass =
  "w-full min-h-12 rounded-[10px] border border-line bg-surface px-4 py-3 text-base text-ink placeholder:text-muted";

function StartForm({ source, id }: { source: string; id?: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");
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
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        id?: string;
        error?: string;
      };
      if (data.error === "email_cap") {
        setCapMessage(
          "You've used your three free conversations. Reply to your result email and we'll open another.",
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
        <label className="flex flex-1 flex-col gap-1.5 text-[14px] font-medium text-ink">
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
        <label className="flex flex-1 flex-col gap-1.5 text-[14px] font-medium text-ink">
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
      <label className="flex flex-col gap-1.5 text-[14px] font-medium text-ink">
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

function AccordionMark({ open }: { open: boolean }) {
  return (
    <span
      className="ml-4 inline-flex size-11 shrink-0 items-center justify-center text-xl font-medium text-muted"
      aria-hidden
    >
      {open ? "−" : "+"}
    </span>
  );
}

function HeroScene() {
  return (
    <Card shadow className="p-5 md:p-6">
      <p className="mb-5 inline-flex rounded-full bg-sage px-2.5 py-1 text-[13px] font-medium text-muted">
        Illustrative example
      </p>
      <div className="flex gap-3 sm:gap-4">
        <div className="w-8 shrink-0 self-stretch">
          <RouteLine variant="hero" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-6 text-[15px] leading-relaxed">
          <div>
            <div className="flex items-start gap-3">
              <Waveform state="idle" />
              <p className="font-medium">
                Priya, 8 years in customer operations
              </p>
            </div>
            <p className="mt-2 font-display text-[1.05rem] leading-snug">
              I like improving how things work. Lately I&apos;m only reporting
              on dashboards.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Wants ownership", "Needs income stability", "Enjoys improving systems"].map(
              (chip) => (
                <span
                  key={chip}
                  className="rounded-full bg-sage px-3 py-1 text-[15px] text-ink"
                >
                  {chip}
                </span>
              ),
            )}
          </div>
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">
              Next move
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p className="font-semibold">Business operations</p>
              <Badge tone="realistic" />
            </div>
            <p className="mt-2 text-muted">
              Builds on your systems experience. The broader scope and the
              day-to-day still need testing.
            </p>
            <p className="mt-3 text-[15px] text-ink">
              First message → to Meera, ex-colleague now in business ops
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

const RECOGNISE = [
  {
    q: "I'm doing well. I'm not sure I want more of this.",
    a: "The conversation starts with what changed, not with job titles. Doing well and wanting out is a real signal, not ingratitude.",
  },
  {
    q: "I want a change without starting from zero.",
    a: "Most good moves are adjacent. The coach looks for the door that reuses what you already know.",
  },
  {
    q: "I can see several paths. I don't know which fits.",
    a: "You will be asked which one pulls you, and then what you would give up. That is usually where the answer is.",
  },
  {
    q: "I'm not sure I need a new role, or a different way to work.",
    a: "Staying and reshaping the role is one of the doors, and the coach will say so if that is the honest read.",
  },
];

function Recognise() {
  const [open, setOpen] = useState(0);

  return (
    <div>
      {RECOGNISE.map((item, i) => {
        const isOpen = open === i;
        return (
          <details
            key={item.q}
            open={isOpen}
            className="border-t border-line last:border-b"
            onToggle={(e) => {
              e.preventDefault();
            }}
          >
            <summary
              className="flex cursor-pointer items-center justify-between gap-4 py-5 text-left font-semibold"
              onClick={(e) => {
                e.preventDefault();
                setOpen(isOpen ? -1 : i);
              }}
            >
              <span>{item.q}</span>
              <AccordionMark open={isOpen} />
            </summary>
            {isOpen ? (
              <div className="pb-5">
                <p className="max-w-[62ch] text-muted">{item.a}</p>
                <Button variant="ghost" href="#start" className="mt-3 px-0">
                  Start here
                </Button>
              </div>
            ) : null}
          </details>
        );
      })}
    </div>
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

function StoryCanvas() {
  return (
    <div className="flex h-full flex-col justify-between text-[15px]">
      <div>
        <div className="flex items-center gap-3">
          <Waveform state="idle" />
          <StateLabel>Listening</StateLabel>
        </div>
        <p className="mt-5 font-display text-xl leading-snug">
          What&apos;s prompting this now? What changed in the last six months?
        </p>
        <div className="mt-5 flex flex-col gap-3 text-muted">
          <p>
            <span className="font-semibold text-ink">Priya: </span>
            I like improving how things work. Lately I&apos;m only reporting on
            dashboards.
          </p>
          <p>
            <span className="font-semibold text-ink">Priya: </span>
            I still need the income to stay stable. I just want ownership of
            the system, not another report.
          </p>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2 text-[15px] font-medium text-ink">
        <span className="rounded-[10px] border border-line px-4 py-2">Mute</span>
        <span className="rounded-[10px] border border-line px-4 py-2">End</span>
        <span className="px-2 py-2 underline-offset-2">Switch to text</span>
      </div>
    </div>
  );
}

function DoorsCanvas() {
  const rows: {
    name: string;
    tone: "realistic" | "strong fit" | "a stretch";
    why: string;
    check: string;
  }[] = [
    {
      name: "Business operations",
      tone: "realistic",
      why: "Builds on your systems experience and the ownership you want.",
      check: "The broader scope and the day-to-day still need testing.",
    },
    {
      name: "Customer operations elsewhere",
      tone: "strong fit",
      why: "Same craft, with more room to improve how things work.",
      check: "Whether a new team gives you ownership, not another dashboard.",
    },
    {
      name: "Product management",
      tone: "a stretch",
      why: "You like improving systems. Product sits next to that craft.",
      check: "You have not done the role, and the income floor has to stay true.",
    },
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-4 text-[15px]">
      {rows.map((row) => (
        <div key={row.name} className="border-b border-line pb-4 last:border-0 last:pb-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{row.name}</p>
            <Badge tone={row.tone} />
          </div>
          <p className="mt-1">{row.why}</p>
          <p className="mt-1 text-muted">
            <span className="font-medium text-ink">What needs checking. </span>
            {row.check}
          </p>
        </div>
      ))}
    </div>
  );
}

function StepCanvas() {
  return (
    <div className="flex h-full flex-col justify-center">
      <Card shadow className="p-5">
        <p className="text-[15px] font-semibold">To: Meera · ex-colleague</p>
        <p className="mt-3 text-[15px] leading-relaxed">{MEERA_MESSAGE}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex h-[44px] items-center rounded-[10px] bg-forest px-4 text-[15px] font-semibold text-white">
            Copy message
          </span>
          <span className="inline-flex h-[44px] items-center rounded-[10px] border border-line px-4 text-[15px] font-semibold">
            I sent it
          </span>
        </div>
      </Card>
      <p className="mt-4 text-[15px] font-medium">Decision date: 15 October</p>
    </div>
  );
}

function HowCanvas({ stage }: { stage: number }) {
  const panels = [<StoryCanvas key="0" />, <DoorsCanvas key="1" />, <StepCanvas key="2" />];
  return (
    <Card className="min-h-[260px] p-6 md:p-8">
      <div className="scene-fade h-full">{panels[stage]}</div>
    </Card>
  );
}

function HowItWorks() {
  const [stage, setStage] = useState(0);

  return (
    <>
      <div className="hidden md:block">
        <div className="grid grid-cols-3 gap-6">
          {HOW_STAGES.map((item, i) => {
            const selected = stage === i;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setStage(i)}
                className="min-h-11 rounded-[10px] text-left"
              >
                <span
                  className={`mb-3 block h-1 w-10 rounded-full ${selected ? "bg-forest" : "bg-line"}`}
                />
                <p className={`text-[15px] ${selected ? "font-semibold" : "font-medium"}`}>
                  <span className="text-muted">{i + 1}. </span>
                  {item.label}
                </p>
                <p className="mt-1 text-[15px] text-muted">{item.line}</p>
              </button>
            );
          })}
        </div>
        <div className="mt-8">
          <HowCanvas stage={stage} />
        </div>
      </div>
      <div className="flex flex-col gap-8 md:hidden">
        {HOW_STAGES.map((item, i) => (
          <div key={item.label}>
            <p className="text-[15px] font-semibold">
              <span className="text-muted">{i + 1}. </span>
              {item.label}
            </p>
            <p className="mt-1 text-[15px] text-muted">{item.line}</p>
            <div className="mt-4">
              <HowCanvas stage={i} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

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
    <Card className="p-6 md:p-8">
      <p className="inline-flex rounded-full bg-sage px-3 py-1 text-[13px] font-medium text-muted">
        Illustrative brief · Priya, 8 years in customer operations
      </p>
      <h3 className="mt-6 text-lg font-semibold">What we heard</h3>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div>
          <p className="text-[15px] font-semibold">Moving away from</p>
          <p className="mt-1 text-[15px] text-muted">
            Only reporting on dashboards, with little ownership of how things
            work.
          </p>
        </div>
        <div>
          <p className="text-[15px] font-semibold">Moving toward</p>
          <p className="mt-1 text-[15px] text-muted">
            Broader operations work that lets her improve the system, not just
            describe it.
          </p>
        </div>
      </div>
      <p className="mt-5 text-[15px] font-semibold">What has to stay true</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {["Income stability", "Ownership", "Improving systems"].map((chip) => (
          <span
            key={chip}
            className="rounded-full bg-sage px-3 py-1 text-[15px]"
          >
            {chip}
          </span>
        ))}
      </div>
      <div className="mt-8 flex flex-col gap-6">
        {BRIEF_OPTIONS.map((opt) => (
          <div key={opt.name} className="border-t border-line pt-6">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold">{opt.name}</p>
              <Badge tone={opt.tone} />
            </div>
            <div className="mt-3 grid gap-3 text-[15px] md:grid-cols-2">
              <div>
                <p className="font-semibold">Why it may fit</p>
                <p className="mt-1 text-muted">{opt.why}</p>
              </div>
              <div>
                <p className="font-semibold">What needs checking</p>
                <p className="mt-1 text-muted">{opt.check}</p>
              </div>
              <div>
                <p className="font-semibold">The trade-off</p>
                <p className="mt-1 text-muted">{opt.trade}</p>
              </div>
              <div>
                <p className="font-semibold">One low-risk test</p>
                <p className="mt-1 text-muted">{opt.test}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 border-t border-line pt-6">
        <p className="font-semibold">First message → Meera</p>
        <p className="mt-3 text-[15px] leading-relaxed">{MEERA_MESSAGE}</p>
        <p className="mt-3 text-[15px] text-muted">
          You decide whether to send it. Nothing is sent for you.
        </p>
      </div>
    </Card>
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
    a: "Try for free till September 6. A paid pack with more drafted messages is ₹99.",
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
        <details key={item.q} className="group border-t border-line last:border-b">
          <summary className="flex cursor-pointer items-center justify-between gap-4 py-5 text-left font-semibold">
            <span>{item.q}</span>
            <span
              className="ml-4 inline-flex size-11 shrink-0 items-center justify-center text-xl font-medium text-muted group-open:hidden"
              aria-hidden
            >
              +
            </span>
            <span
              className="ml-4 hidden size-11 shrink-0 items-center justify-center text-xl font-medium text-muted group-open:inline-flex"
              aria-hidden
            >
              −
            </span>
          </summary>
          <p className="max-w-[62ch] pb-5 text-muted">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

function TrustRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-t border-white/20 py-4 first:border-t-0 first:pt-0 last:pb-0">
      <p className="text-[15px] font-semibold text-white">{label}</p>
      <p className="mt-1 text-[15px] text-white/80">{children}</p>
    </div>
  );
}

export function Landing({ source }: { source: string }) {
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
    <div className="min-h-full bg-canvas">
      <header
        className={`sticky top-0 z-20 bg-canvas ${scrolled ? "border-b border-line" : ""}`}
      >
        <Container className="flex items-center justify-between gap-3 py-3">
          <a href="#start" className="inline-flex min-h-11 shrink-0 items-center" aria-label="NextMove">
            <Wordmark />
          </a>
          <nav className="hidden items-center gap-8 text-[15px] font-medium text-ink md:flex">
            <a href="#how" className="inline-flex min-h-11 items-center hover:underline">
              How it works
            </a>
            <a href="#example" className="inline-flex min-h-11 items-center hover:underline">
              See an example
            </a>
          </nav>
          <Button href="#start" className="shrink-0 px-4 md:px-6">
            Start a conversation
          </Button>
        </Container>
      </header>

      <Section id="start">
        <div className="grid items-center gap-12 md:grid-cols-12 md:gap-6">
          <div className="min-w-0 md:col-span-5">
            <Eyebrow>A CAREER CONVERSATION, BUILT AROUND YOU</Eyebrow>
            <h1 className="mt-4">You&apos;ve come this far. What comes next?</h1>
            <p className="mt-5 max-w-[46ch]">
              Talk it through with an AI coach for about ten minutes. It asks
              what a good coach asks, tells you which door actually fits and how
              real your shot is, and writes the first message to someone you
              already know in that world.
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
          <div className="min-w-0 md:col-span-7">
            <HeroScene />
          </div>
        </div>
      </Section>

      <Section id="recognise">
        <div className="grid gap-10 md:grid-cols-12 md:gap-6">
          <div className="md:col-span-4">
            <h2>You don&apos;t need a perfect plan to begin.</h2>
          </div>
          <div className="md:col-span-8">
            <Recognise />
          </div>
        </div>
      </Section>

      <Section id="how" tone="sage">
        <h2>From your story to a door worth walking through.</h2>
        <div className="mt-10">
          <HowItWorks />
        </div>
      </Section>

      <Section id="example">
        <h2>A clearer direction. With the reasoning behind it.</h2>
        <p className="mt-5 max-w-[68ch]">
          Career advice is either free and generic or $200-$300 an hour. The
          first conversation is what actually moves people. NextMove tells you
          which door, why, and who to talk to first.
        </p>
        <div className="mt-10">
          <ResultBrief />
        </div>
      </Section>

      <Section id="trust" tone="forest">
        <div className="grid gap-10 md:grid-cols-12 md:gap-6">
          <div className="md:col-span-5">
            <h2 className="text-white">Know what happens to your story.</h2>
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
            <a
              href="#faq"
              className="mt-4 inline-flex min-h-11 items-center text-[15px] text-white underline-offset-2 hover:underline"
            >
              How this works in detail
            </a>
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
          <h2>Your next move starts with a conversation.</h2>
          <p className="mt-4 text-muted">
            You don&apos;t need to have the answer before you begin.
          </p>
          <div className="mt-8 flex justify-center">
            <Button href="#start">Start a conversation</Button>
          </div>
          <p className="mt-4 text-[15px] text-muted">Prefer to type? You can.</p>
          <div className="mt-10">
            <RouteLine variant="closing" />
          </div>
        </div>
      </Section>

      <footer className="border-t border-line py-8">
        <Container className="flex flex-col gap-4 text-[15px] text-muted md:flex-row md:items-center md:justify-between">
          <a href="/" className="inline-flex min-h-11 items-center" aria-label="NextMove home">
            <Wordmark />
          </a>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <a href="/privacy" className="inline-flex min-h-11 items-center px-3 hover:text-ink hover:underline">
              Privacy
            </a>
            <a href="/terms" className="inline-flex min-h-11 items-center px-3 hover:text-ink hover:underline">
              Terms
            </a>
            <a
              href="https://github.com/ashwin4295/nextmove"
              className="inline-flex min-h-11 items-center px-3 hover:text-ink hover:underline"
            >
              GitHub
            </a>
          </div>
        </Container>
      </footer>
    </div>
  );
}
