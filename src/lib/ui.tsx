"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import type { Realism } from "./extract";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-sans text-[1.125rem] font-semibold ${className}`}>
      <span className="text-ink">Next</span>
      <span className="text-forest">Move</span>
    </span>
  );
}

const buttonClass: Record<"primary" | "secondary" | "ghost", string> = {
  primary:
    "h-[50px] rounded-[10px] bg-forest px-6 text-[15px] font-semibold text-white hover:bg-forest-deep disabled:opacity-50 control-fade",
  secondary:
    "h-[50px] rounded-[10px] border border-line bg-transparent px-6 text-[15px] font-semibold text-ink hover:bg-sage disabled:opacity-50 control-fade",
  ghost:
    "min-h-11 rounded-[10px] px-2 py-2 text-[15px] font-medium text-ink hover:underline disabled:opacity-50 control-fade",
};

type ButtonProps = {
  variant?: "primary" | "secondary" | "ghost";
  href?: string;
  children: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = "primary",
  href,
  children,
  className = "",
  type,
  ...props
}: ButtonProps) {
  const cls = `inline-flex items-center justify-center ${buttonClass[variant]} ${className}`;
  if (href) {
    const external =
      href.startsWith("http") ||
      href.startsWith("mailto:") ||
      href.startsWith("#");
    if (external) {
      return (
        <a href={href} className={cls}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type ?? "button"} className={cls} {...props}>
      {children}
    </button>
  );
}

export function Card({
  children,
  className = "",
  shadow = false,
}: {
  children: ReactNode;
  className?: string;
  shadow?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-line bg-surface ${shadow ? "card-shadow" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function Eyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-muted ${className}`}
    >
      {children}
    </p>
  );
}

const badgeTone: Record<Realism, string> = {
  "strong fit": "bg-sage text-forest",
  realistic: "bg-[#E4EEF7] text-[#1F4E79]",
  "a stretch": "bg-[#F6EBDD] text-[#8A5A2B]",
  "long shot": "bg-[#EEF0EC] text-muted",
};

export function Badge({
  tone,
  children,
}: {
  tone: Realism;
  children?: ReactNode;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeTone[tone]}`}
    >
      {children ?? tone}
    </span>
  );
}

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1200px] px-5 ${className}`}>
      {children}
    </div>
  );
}

export function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    if (!motion.matches) {
      el.classList.add("in-view");
      return;
    }
    document.documentElement.classList.add("js-anim");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}

const sectionTone: Record<"canvas" | "sage" | "forest", string> = {
  canvas: "bg-canvas text-ink py-14 md:py-[104px]",
  sage: "bg-sage text-ink py-14 md:py-[104px]",
  forest: "bg-forest py-12 text-white md:py-[72px]",
};

export function Section({
  tone = "canvas",
  id,
  children,
  className = "",
}: {
  tone?: "canvas" | "sage" | "forest";
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-24 ${sectionTone[tone]} ${className}`}
    >
      <Container>
        <Reveal>{children}</Reveal>
      </Container>
    </section>
  );
}

export function RouteLine({
  variant,
  className = "",
}: {
  variant: "hero" | "result" | "closing";
  className?: string;
}) {
  if (variant === "hero") {
    return (
      <svg
        className={`h-full w-8 shrink-0 text-line ${className}`}
        viewBox="0 0 32 280"
        fill="none"
        aria-hidden
      >
        <path
          d="M16 12 V268"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M16 88 H28" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 168 H28" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 248 H28" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="16" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="16" cy="88" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        <circle
          cx="16"
          cy="168"
          r="3.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="16" cy="268" r="5" className="fill-forest" />
      </svg>
    );
  }

  if (variant === "result") {
    return (
      <svg
        className={`h-8 w-[120px] text-line ${className}`}
        viewBox="0 0 120 32"
        fill="none"
        aria-hidden
      >
        <path d="M4 16 H116" stroke="currentColor" strokeWidth="1.5" />
        <path d="M28 16 V6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M60 16 V6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M92 16 V26" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="28" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="60" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="92" cy="26" r="4" className="fill-forest" />
      </svg>
    );
  }

  return (
    <svg
      className={`mx-auto h-10 w-[220px] text-line ${className}`}
      viewBox="0 0 220 40"
      fill="none"
      aria-hidden
    >
      <path d="M8 20 H212" stroke="currentColor" strokeWidth="1.5" />
      <path d="M56 20 V8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M110 20 V8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M164 20 V32" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="56" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="110" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="164" cy="32" r="5" className="fill-forest" />
    </svg>
  );
}

export function Waveform({
  state,
}: {
  state: "idle" | "connecting" | "listening" | "speaking" | "writing";
}) {
  const animate = state === "listening" || state === "speaking";
  const heights = [10, 18, 12, 20, 14];
  return (
    <div
      className="flex h-6 items-end gap-[3px]"
      aria-hidden
    >
      {heights.map((h, i) => (
        <span
          key={i}
          className={`w-[3px] rounded-sm bg-forest ${animate ? "wave-bar" : ""}`}
          style={{
            height: h,
            animationDelay: animate ? `${i * 90}ms` : undefined,
          }}
        />
      ))}
    </div>
  );
}

export function StateLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-sm font-medium text-muted ${className}`}>{children}</p>
  );
}
