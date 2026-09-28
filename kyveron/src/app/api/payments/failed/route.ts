import { NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { assertSameOrigin } from "@/lib/security/request";
import { reportCheckoutFailure } from "@/lib/payments/service";
import { canViewOrder } from "@/lib/orders/access";
import { getCurrentUser } from "@/lib/auth/session";

const schema = z.object({
  gatewayOrderId: z.string().min(6).max(64),
  paymentId: z.string().max(64).optional(),
  code: z.string().max(64).optional(),
  description: z.string().max(300).optional(),
});

/** Advisory failure report from the browser (can only ever mark a failure, never success). */
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
  } catch (r) {
    return r as Response;
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  const [o] = await sql<{ id: string; user_id: string | null }[]>`
    select o.id, o.user_id from payments p join orders o on o.id = p.order_id where p.gateway_order_id = ${parsed.data.gatewayOrderId}`;
  if (!o || !(await canViewOrder(o, await getCurrentUser()))) return NextResponse.json({ ok: false }, { status: 404 });
  await reportCheckoutFailure(parsed.data.gatewayOrderId, parsed.data);
  return NextResponse.json({ ok: true, orderId: o.id });
}
