import Link from "next/link";
import { notFound } from "next/navigation";
import { capsExceeded } from "@/lib/caps";
import { store } from "@/lib/convexClient";
import { Wordmark } from "@/lib/ui";
import { TalkClient } from "./TalkClient";

export const dynamic = "force-dynamic";

export default async function TalkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let session;
  try {
    session = await store.get({ id });
  } catch {
    notFound();
  }
  if (!session) notFound();

  if (session.email && session.startedAt == null) {
    const caps = await store.caps({ email: session.email });
    if (capsExceeded(caps, "daily")) {
      return (
        <main className="mx-auto flex min-h-dvh w-full max-w-[560px] flex-col bg-canvas px-5 pt-5 pb-10">
          <Link href="/">
            <Wordmark />
          </Link>
          <p className="mt-8 leading-relaxed">
            We&apos;re full for today. Your spot is saved and we&apos;ll email
            you when it opens tomorrow.
          </p>
        </main>
      );
    }
  }

  return (
    <TalkClient
      id={id}
      email={session.email}
      source={session.source}
      linkedinUrl={session.linkedinUrl}
      profileStatus={session.profileStatus}
      profile={session.profile}
    />
  );
}
