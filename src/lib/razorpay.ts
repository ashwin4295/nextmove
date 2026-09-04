export async function paymentLinkIsPaid(payLinkId: string): Promise<boolean> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret || !payLinkId) return false;
  try {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const res = await fetch(
      `https://api.razorpay.com/v1/payment_links/${encodeURIComponent(payLinkId)}`,
      {
        headers: { Authorization: `Basic ${auth}` },
        cache: "no-store",
      },
    );
    const data = (await res.json().catch(() => ({}))) as { status?: unknown };
    return data.status === "paid";
  } catch (err) {
    console.error(
      "razorpay verify failed",
      err instanceof Error ? err.message : err,
    );
    return false;
  }
}
