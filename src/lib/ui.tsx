import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
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
    "group h-[52px] rounded-none bg-forest px-6 font-mono text-[0.75rem] font-medium uppercase tracking-[0.12em] text-canvas hover:bg-forest-deep disabled:opacity-50",
  secondary:
    "h-[52px] rounded-none border border-ink bg-transparent px-6 font-mono text-[0.75rem] font-medium uppercase tracking-[0.12em] text-ink hover:bg-sage disabled:opacity-50",
  ghost:
    "min-h-11 rounded-none px-2 py-2 font-mono text-[0.75rem] font-medium uppercase tracking-[0.12em] text-ink hover:underline disabled:opacity-50",
};

type ButtonProps = {
  variant?: "primary" | "secondary" | "ghost";
  href?: string;
  children: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

function ButtonInner({
  variant,
  children,
}: {
  variant: "primary" | "secondary" | "ghost";
  children: ReactNode;
}) {
  if (variant !== "primary") return children;
  return (
    <>
      <span>{children}</span>
      <span
        className="inline-block transition-transform group-hover:translate-x-1"
        aria-hidden
      >
        →
      </span>
    </>
  );
}

export function Button({
  variant = "primary",
  href,
  children,
  className = "",
  type,
  ...props
}: ButtonProps) {
  const justify = variant === "primary" ? "justify-between gap-4" : "justify-center";
  const cls = `inline-flex items-center ${justify} ${buttonClass[variant]} ${className}`;
  const inner = (
    <ButtonInner variant={variant}>{children}</ButtonInner>
  );
  if (href) {
    const external =
      href.startsWith("http") ||
      href.startsWith("mailto:") ||
      href.startsWith("#");
    if (external) {
      return (
        <a href={href} className={cls}>
          {inner}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type={type ?? "button"} className={cls} {...props}>
      {inner}
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
      className={`rounded-none border border-rule bg-paper ${shadow ? "card-shadow" : ""} ${className}`}
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
      className={`font-mono text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-forest ${className}`}
    >
      {children}
    </p>
  );
}

const badgeTone: Record<Realism, string> = {
  "strong fit": "text-forest",
  realistic: "text-forest",
  "a stretch": "text-ink",
  "long shot": "text-muted",
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
      className={`inline-flex rounded-none font-mono text-[0.6875rem] font-medium uppercase tracking-[0.16em] ${badgeTone[tone]}`}
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
    <div className={`mx-auto w-full max-w-[1120px] px-5 ${className}`}>
      {children}
    </div>
  );
}

export function Rule({ className = "" }: { className?: string }) {
  return (
    <div
      role="presentation"
      className={`h-px w-full bg-[var(--rule)] ${className}`}
    />
  );
}

export function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {children}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-1/2 z-30 hidden w-[min(1120px,100%)] -translate-x-1/2 md:block"
      >
        <div className="absolute inset-y-0 left-0 w-px bg-[var(--rule)]" />
        <div className="absolute inset-y-0 right-0 w-px bg-[var(--rule)]" />
      </div>
    </div>
  );
}

const sectionTone: Record<"canvas" | "sage" | "forest", string> = {
  canvas: "bg-canvas text-ink",
  sage: "bg-sage text-ink",
  forest: "bg-forest text-canvas",
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
      <Rule />
      <Container className="py-[72px] md:py-[112px]">{children}</Container>
      <Rule className="-mb-px" />
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
        className={`h-full w-8 shrink-0 text-rule ${className}`}
        viewBox="0 0 32 280"
        fill="none"
        aria-hidden
      >
        <path d="M16 12 V268" stroke="currentColor" strokeWidth="1.5" />
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
        className={`h-8 w-[120px] text-rule ${className}`}
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
      className={`mx-auto h-10 w-[220px] text-rule ${className}`}
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
  void state;
  const heights = [10, 18, 12, 20, 14];
  return (
    <div className="flex h-6 items-end gap-[3px]" aria-hidden>
      {heights.map((h, i) => (
        <span
          key={i}
          className="w-[3px] rounded-none bg-forest"
          style={{ height: h }}
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
    <p className={`font-mono text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-muted ${className}`}>
      {children}
    </p>
  );
}
