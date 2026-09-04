import { NextResponse } from "next/server";
import { store } from "@/lib/convexClient";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

function fallbackUrl(id: string) {
  const fallback = process.env.NEXT_PUBLIC_PAY_LINK;
  if (!fallback) return null;
  return `${fallback}?client_reference_id=${id}`;
}

function fallbackOrUnavailable(id: string) {
  const url = fallbackUrl(id);
  if (url) return NextResponse.json({ url });
  return NextResponse.json({ error: "no_pay" }, { status: 503 });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { id?: unknown };
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) {
    return NextResponse.json({ error: "missing id" }, { status: 400 });
  }

  const session = await store.get({ id });
  if (!session) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (session.payLinkUrl) {
    return NextResponse.json({ url: session.payLinkUrl });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (keyId && keySecret) {
    try {
      const origin = new URL(req.url).origin;
      const customer: { name?: string; email?: string } = {};
      if (session.name) customer.name = session.name;
      if (session.email) customer.email = session.email;

      const payload: Record<string, unknown> = {
        amount: 29900,
        currency: "INR",
        accept_partial: false,
        description: "NextMove Pack",
        reference_id: id.slice(0, 40),
        notify: { sms: false, email: false },
        reminder_enable: false,
        notes: {
          session_id: id,
          email: session.email ?? "",
          source: session.source ?? "",
        },
        callback_url: `${origin}/r/${id}?paid=1`,
        callback_method: "get",
        options: { checkout: { name: "NextMove", theme: { hide_topbar: true } } },
      };
      if (customer.name || customer.email) {
        payload.customer = customer;
      }

      const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
      const rzp = await fetch("https://api.razorpay.com/v1/payment_links", {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = (await rzp.json().catch(() => ({}))) as {
        short_url?: unknown;
        id?: unknown;
        error?: unknown;
      };

      if (!rzp.ok || typeof data.short_url !== "string") {
        console.error("Razorpay payment_links error", data.error ?? data);
        return fallbackOrUnavailable(id);
      }

      const url = data.short_url;
      const linkId = typeof data.id === "string" ? data.id : "";
      await store.setPayLink({ id, url, linkId });
      return NextResponse.json({ url });
    } catch (err) {
      console.error("Razorpay payment_links error", err);
      return fallbackOrUnavailable(id);
    }
  }

  return fallbackOrUnavailable(id);
}
