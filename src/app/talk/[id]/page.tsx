import { store } from "@/lib/convexClient";
import type { Profile, ProfileStatus } from "@/lib/profile";
import { TalkClient } from "./TalkClient";

export const dynamic = "force-dynamic";

export default async function TalkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let email: string | null = null;
  let source = "";
  let linkedinUrl: string | null = null;
  let profileStatus: ProfileStatus = "none";
  let profile: Profile | null = null;
  try {
    const session = await store.get({ id });
    email = session?.email ?? null;
    source = session?.source ?? "";
    linkedinUrl = session?.linkedinUrl ?? null;
    profileStatus = session?.profileStatus ?? "none";
    profile = session?.profile ?? null;
  } catch {
    // talk still works if the store cannot load this id
  }
  return (
    <TalkClient
      id={id}
      email={email}
      source={source}
      linkedinUrl={linkedinUrl}
      profileStatus={profileStatus}
      profile={profile}
    />
  );
}
