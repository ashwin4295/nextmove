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
    <span
      className={`font-display text-[1.125rem] font-medium tracking-tight ${className}`}
    >
      <span className="text-ink">Next</span>
      <span className="text-accent">Move</span>
    </span>
  );
}

const buttonClass: Record<"primary" | "secondary" | "ghost", string> = {
  primary:
    "bg-accent text-accent-ink text-[14px] font-semibold px-6 py-[14px] rounded-full hover:bg-[#0d6d65] disabled:opacity-50",
  secondary:
    "border border-line text-ink text-[14px] font-semibold px-6 py-[14px] rounded-full bg-transparent hover:bg-wash disabled:opacity-50",
  ghost:
    "text-ink text-[14px] font-medium px-3 py-2 rounded-full hover:bg-wash disabled:opacity-50",
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
      className={`rounded-[12px] bg-surface ${shadow ? "card-shadow" : ""} ${className}`}
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
  "strong fit": "bg-[#e6f4f2] text-[#0f766e]",
  realistic: "bg-[#e8efff] text-[#1d4ed8]",
  "a stretch": "bg-[#fff4e5] text-[#b45309]",
  "long shot": "bg-[#f3f1ee] text-[#6b6560]",
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
    <div className={`mx-auto w-full max-w-[1120px] px-4 md:px-6 ${className}`}>
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
    const motion = window.matchMedia(
      "(prefers-reduced-motion: no-preference)",
    );
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

export function Section({
  band,
  id,
  children,
  className = "",
}: {
  band?: boolean;
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`${band ? "bg-wash" : "bg-canvas"} py-16 md:py-24 ${className}`}
    >
      <Container>
        <Reveal>{children}</Reveal>
      </Container>
    </section>
  );
}
