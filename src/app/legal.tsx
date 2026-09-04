import Link from "next/link";
import type { ReactNode } from "react";
import { Container, Wordmark } from "@/lib/ui";

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <p className="text-lg font-semibold">{title}</p>
      <p className="mt-2 leading-relaxed">{children}</p>
    </section>
  );
}

export function LegalDoc({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-full bg-canvas pb-16">
      <Container className="max-w-[720px] py-8">
        <Link href="/">
          <Wordmark />
        </Link>
        <h1 className="mt-10">{title}</h1>
        <div className="mt-8 flex flex-col gap-8">{children}</div>
        <p className="mt-12 text-[15px] text-muted">
          Last updated 5 September 2026.
        </p>
      </Container>
    </main>
  );
}
