import { NextResponse } from "next/server";
import { z } from "zod";
import { assertSameOrigin } from "@/lib/security/request";
import { verifyCheckout } from "@/lib/payments/service";

const schema = z.object({
  gatewayOrderId: z.string().min(6).max(64),
  paymentId: z.string().min(6).max(64),
  signature: z.string().regex(/^[a-f0-9]{64}$/),
});

/** Browser callback after checkout. Only a valid gateway signature can mark an order paid. */
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
  } catch (r) {
    return r as Response;
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid payment response." }, { status: 400 });
  try {
    const r = await verifyCheckout(parsed.data);
    if (!r.ok) {
      return NextResponse.json({ ok: false, orderId: r.orderId, error: "We could not verify this payment. If money left your account, it will be confirmed or refunded automatically." }, { status: 400 });
    }
    return NextResponse.json({ ok: true, orderId: r.orderId });
  } catch {
    return NextResponse.json({ ok: false, error: "Verification is taking longer than usual. Your order page will update once confirmed." }, { status: 502 });
  }
}
