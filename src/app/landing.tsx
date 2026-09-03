"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  Button,
  Card,
  Container,
  Eyebrow,
  Section,
  Wordmark,
} from "@/lib/ui";

function StartForm({
  source,
  id,
}: {
  source: string;
  id?: string;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
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
    <form id={id} className="flex flex-col gap-3" onSubmit={onSubmit}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your first name"
          autoComplete="given-name"
          className="w-full rounded-[10px] border border-line bg-surface px-4 py-3 text-base text-ink placeholder:text-muted sm:max-w-xs"
        />
        <Button type="submit" disabled={busy}>
          {busy ? "Starting…" : "Start the conversation"}
        </Button>
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <p className="text-sm text-muted">
        Free during Build Week. Voice or text. Nothing is shared without your
        say.
      </p>
    </form>
  );
}

export function Landing({ source }: { source: string }) {
  const [scrolled, setScrolled] = useState(false);

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
        <Container className="flex items-center justify-between gap-4 py-4">
          <a href="#start" className="shrink-0">
            <Wordmark />
          </a>
          <nav className="hidden items-center gap-6 text-sm font-medium text-ink md:flex">
            <a href="#how" className="hover:text-accent">
              How it works
            </a>
            <a href="#output" className="hover:text-accent">
              What you get
            </a>
            <a href="#faq" className="hover:text-accent">
              FAQ
            </a>
          </nav>
          <Button href="#start" className="shrink-0">
            Start
          </Button>
        </Container>
      </header>

      <Section id="start" className="pt-12 md:pt-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <Eyebrow>FOR PROFESSIONALS 4 TO 15 YEARS IN · INDIA</Eyebrow>
            <h1 className="mt-4">
              Ten minutes. One honest{" "}
              <span className="text-accent">next move</span>.
            </h1>
            <p className="mt-5 max-w-[56ch] text-ink">
              An AI career coach you talk to. It asks the questions a real
              coach asks, tells you which door actually fits, and writes the
              first message to someone you already know in that world. You leave
              with something to send, not something to read.
            </p>
            <div className="mt-8">
              <StartForm source={source} />
            </div>
            <p className="mt-6 text-sm text-muted">
              Written by a coach who has guided 1,000+ professionals through
              career transitions. Ex-Bain. INSEAD MBA.
            </p>
          </div>

          <Card shadow className="overflow-hidden border border-line p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-accent card-shadow" />
                <span className="text-sm font-semibold">NextMove coach</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">06:40</span>
                <span className="rounded-full bg-accent-wash px-2.5 py-0.5 text-xs font-semibold text-accent">
                  Act 2 of 3
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-4 text-sm leading-relaxed">
              <p>
                <span className="font-semibold">Coach: </span>
                Who do you know who is already in that world, or one step ahead
                of you on it?
              </p>
              <p className="text-muted">
                <span className="font-semibold text-ink">You: </span>
                Rohan. We were at Flipkart together. He moved into an applied AI
                product role last year.
              </p>
              <p>
                <span className="font-semibold">Coach: </span>
                Good. What would you actually want to ask him?
              </p>
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-[10px] bg-wash px-3 py-2 text-sm text-muted">
              <span className="size-2.5 rounded-full bg-accent" />
              Drafting your message to Rohan…
            </div>
          </Card>
        </div>
      </Section>

      <Section id="how" band>
        <Eyebrow>HOW IT WORKS</Eyebrow>
        <h2 className="mt-3">Talk. Choose a door. Send the first message.</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            {
              n: "01",
              title: "Talk for ten minutes",
              body: "Real coaching questions in three short acts: what's prompting this, what you won't give up, which door pulls you. Stop whenever you like.",
            },
            {
              n: "02",
              title: "Get your next move",
              body: "One path, graded honestly: strong fit, realistic, a stretch, or long shot. In your own words, not a template. The other doors are listed, so nothing is hidden.",
            },
            {
              n: "03",
              title: "Send the first message",
              body: "You name one person already in that world. NextMove drafts the message, you copy it, you send it. That is the moment a transition actually starts.",
            },
          ].map((step) => (
            <Card key={step.n} className="border border-line p-6">
              <p className="font-display text-sm font-medium text-accent">
                {step.n}
              </p>
              <h3 className="mt-3 font-display text-xl font-medium">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {step.body}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="output">
        <Eyebrow>WHAT YOU GET</Eyebrow>
        <h2 className="mt-3">
          A message you can send tonight, not a plan you&apos;ll admire.
        </h2>
        <div className="mt-10 grid items-start gap-10 md:grid-cols-2">
          <p>
            Career advice is either free and generic or ₹20,000 an hour, and
            both end in a document. Nobody drifts another year for lack of a
            document. They drift because the first conversation never happens.
            NextMove writes it.
          </p>
          <div>
            <Card shadow className="border border-line p-6">
              <p className="text-sm font-semibold">To: Rohan</p>
              <p className="mt-3 leading-relaxed">
                Hi Rohan, quick one. I&apos;m still running lending product at
                the fintech, nine years in now, and the honest version is that
                I&apos;ve been managing dashboards more than building. Your
                move into applied AI product is the one path I keep coming back
                to. Could I get twenty minutes to ask how you made the jump
                without a pay cut, and what you&apos;d do differently?
                Completely fine if this month is too full.
              </p>
            </Card>
            <p className="mt-3 text-sm text-muted">
              Path: Applied AI product · realistic
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              title: "Coaching questions, not a quiz",
              body: "What's prompting this, what you're moving toward, what has to stay true. The questions that unlock people, in a fixed order that works.",
            },
            {
              title: "Honest realism",
              body: "At least one door is graded a stretch or a long shot. If everything looks easy, nobody is telling you the truth.",
            },
            {
              title: "An action, not analysis",
              body: "You leave with a message to a real person and a date. Momentum beats certainty.",
            },
          ].map((col) => (
            <div key={col.title}>
              <h3 className="font-display text-xl font-medium">{col.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {col.body}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section band>
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-ink">
            AS
          </div>
          <p className="text-sm leading-relaxed sm:text-base">
            Ashwin Shetty. Ex-Bain, INSEAD MBA, 15 years in HR and organisation
            transformation, 1,000+ professionals coached. He left a stable
            consulting career for the thing he kept coming back to. He wrote
            these questions.
          </p>
        </div>
      </Section>

      <Section id="faq">
        <Eyebrow>FAQ</Eyebrow>
        <div className="mt-6 flex flex-col gap-3">
          {[
            {
              q: "Is this a real coach?",
              a: "It is an AI coach running a script written by a real one. For the hard calls, book the human at the end.",
            },
            {
              q: "Do I have to use voice?",
              a: "No. Type instead works the same way and produces the same message.",
            },
            {
              q: "Isn't this just ChatGPT voice mode?",
              a: "ChatGPT will chat with you for an hour and agree with you. NextMove asks fixed coaching questions, pushes back when your answers conflict, grades your options honestly, and ends with a message to a named person. Then it asks whether you sent it.",
            },
            {
              q: "What happens to what I say?",
              a: "Your conversation is stored so your page works. Anything you ask to keep private never appears on the shareable card.",
            },
            {
              q: "Can it tell me to stay where I am?",
              a: "Yes, and it will if the evidence says so. Stay and reinvent is one of the doors.",
            },
          ].map((item) => (
            <details
              key={item.q}
              className="rounded-[12px] border border-line bg-surface px-5 py-4"
            >
              <summary className="cursor-pointer font-semibold">
                {item.q}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </Section>

      <Section>
        <h2>Ten minutes. One message. Send it tonight.</h2>
        <div className="mt-8">
          <StartForm source={source} />
        </div>
      </Section>

      <footer className="border-t border-line py-8">
        <Container className="flex flex-col gap-4 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <Wordmark />
          <p>Built during GrowthX Build Week, September 2026</p>
          <div className="flex gap-4">
            <a
              href="https://github.com/ashwin4295/nextmove"
              className="hover:text-ink"
            >
              GitHub
            </a>
            <a
              href="https://calendly.com/mbbprepofficial/15min?utm_source=nextmove"
              className="hover:text-ink"
            >
              Talk to Ashwin
            </a>
          </div>
        </Container>
      </footer>
    </div>
  );
}
