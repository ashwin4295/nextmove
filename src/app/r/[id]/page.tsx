import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { store } from "@/lib/convexClient";
import { generatePack, toPublicNextMove, type Pack } from "@/lib/extract";
import { paymentLinkIsPaid } from "@/lib/razorpay";
import { NextMoveView } from "./RoadmapView";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function firstString(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function requestOriginFromHeaders(h: Headers) {
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) return `${proto}://${host}`;
  return "https://nextmove.thedirectorloop.com";
}

function sendPackWhatsApp(
  phone: string,
  name: string,
  door: string,
  id: string,
  origin: string,
) {
  const key = process.env.AISENSY_API_KEY;
  const campaign = process.env.AISENSY_PACK_CAMPAIGN;
  if (!key || !campaign) return;
  fetch("https://backend.aisensy.com/campaign/t1/api/v2", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      apiKey: key,
      campaignName: campaign,
      destination: phone,
      userName: name,
      templateParams: [name, door, `${origin}/r/${id}`],
    }),
  })
    .then(async (r) => {
      if (!r.ok) console.error("aisensy pack send failed", r.status, await r.text());
    })
    .catch((err) => console.error("aisensy pack send error", err));
}

function sendPackEmail(email: string, pack: Pack, id: string, origin: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const text = [
    ...pack.messages.flatMap((m) => [`To: ${m.to}`, "", m.body, ""]),
    "Your two weeks",
    ...pack.plan.map((row) => `${row.day}: ${row.action}`),
    "",
    `${origin}/r/${id}`,
  ].join("\n");
  void fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "NextMove <nextmove@mbbprep.com>",
      to: [email],
      subject: "Your Next Move Pack",
      text,
    }),
  })
    .then(async (res) => {
      if (!res.ok) {
        console.error("pack email failed", res.status, await res.text());
      }
    })
    .catch((err) => {
      console.error(
        "pack email failed",
        err instanceof Error ? err.message : err,
      );
    });
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

  let session;
  try {
    session = await store.get({ id });
  } catch {
    notFound();
  }
  if (!session) notFound();

  const paidFlag = firstString(query.paid);
  const linkStatus = firstString(query.razorpay_payment_link_status);
  const referenceId = firstString(query.razorpay_payment_link_reference_id);
  const paymentId = firstString(query.razorpay_payment_id) ?? "";

  let paid = session.paid === true;
  let pack = session.pack;
  const isCallback =
    paidFlag === "1" && linkStatus === "paid" && referenceId === id;

  if (isCallback && session.payLinkId) {
    const verified = await paymentLinkIsPaid(session.payLinkId);
    if (verified) {
      if (session.paid !== true) {
        await store.markPaid({ id, paymentId });
      }
      paid = true;
      if (!session.pack) {
        try {
          const nextMove = session.roadmap;
          if (!nextMove) throw new Error("no next move");
          pack = await generatePack(session.transcript, nextMove);
          await store.setPack({ id, pack });
          if (session.phone) {
            sendPackWhatsApp(
              session.phone,
              session.name ?? "there",
              nextMove.chosenPath.name,
              id,
              requestOriginFromHeaders(await headers()),
            );
          }
          if (session.email) {
            sendPackEmail(
              session.email,
              pack,
              id,
              requestOriginFromHeaders(await headers()),
            );
          }
        } catch (err) {
          console.error(
            "pack generation failed",
            err instanceof Error ? err.message : err,
          );
          await store.setPack({ id, pack: null, failed: true });
          pack = null;
        }
      }
    }
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
      pack={pack}
      profile={session.profile}
      phone={session.phone ?? null}
    />
  );
}
