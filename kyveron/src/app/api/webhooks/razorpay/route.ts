import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { gateway } from "@/lib/payments/gateway";
import { processWebhook } from "@/lib/payments/service";

/**
 * Razorpay webhook. Configure in the Razorpay dashboard with the events:
 * payment.authorized, payment.captured, payment.failed, order.paid,
 * refund.processed, refund.failed, payment.dispute.created/won/lost.
 * The signature is verified against the raw body before anything is parsed.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  if (raw.length > 512_000) return new NextResponse("Too large", { status: 413 });
  if (!gateway.verifyWebhook(raw, req.headers.get("x-razorpay-signature"))) {
    return new NextResponse("Invalid signature", { status: 401 });
  }
  let event: Parameters<typeof processWebhook>[1];
  try {
    event = JSON.parse(raw);
  } catch {
    return new NextResponse("Bad payload", { status: 400 });
  }
  const eventId = req.headers.get("x-razorpay-event-id") ?? createHash("sha256").update(raw).digest("hex");
  try {
    const fresh = await processWebhook(eventId, event);
    return NextResponse.json({ ok: true, duplicate: !fresh });
  } catch {
    // Non-2xx makes Razorpay retry; the error is stored on webhook_events.
    return new NextResponse("Processing failed", { status: 500 });
  }
}
