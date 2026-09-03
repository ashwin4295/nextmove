import { store } from "@/lib/convexClient";
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
  try {
    const session = await store.get({ id });
    email = session?.email ?? null;
    source = session?.source ?? "";
  } catch {
    // talk still works if the store cannot load this id
  }
  return <TalkClient id={id} email={email} source={source} />;
}
