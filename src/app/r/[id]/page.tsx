import { notFound } from "next/navigation";
import { store } from "@/lib/convexClient";
import { toPublicNextMove } from "@/lib/extract";
import { NextMoveView } from "./RoadmapView";

export const dynamic = "force-dynamic";

function firstString(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function NextMovePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const session = await store.get({ id });
  if (!session) notFound();

  const paidFlag = firstString(query.paid);
  const linkStatus = firstString(query.razorpay_payment_link_status);
  const referenceId = firstString(query.razorpay_payment_link_reference_id);
  const paymentId = firstString(query.razorpay_payment_id) ?? "";

  let paid = session.paid === true;
  if (
    paidFlag === "1" &&
    linkStatus === "paid" &&
    referenceId === id
  ) {
    await store.markPaid({ id, paymentId });
    paid = true;
  }

  return (
    <NextMoveView
      id={id}
      nextMove={toPublicNextMove(session.roadmap)}
      transcript={session.transcript}
      sent={session.sent}
      contactName={session.contactName}
      source={session.source}
      paid={paid}
      profile={session.profile}
    />
  );
}
