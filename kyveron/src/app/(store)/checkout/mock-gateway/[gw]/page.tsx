import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { sql } from "@/lib/db";
import { drivers } from "@/lib/env";
import { formatMoney } from "@/lib/money";
import { gateway } from "@/lib/payments/gateway";
import { reportCheckoutFailure, verifyCheckout } from "@/lib/payments/service";
import { canViewOrder } from "@/lib/orders/access";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Test payment", robots: { index: false } };

/**
 * DEVELOPMENT ONLY. Stands in for the Razorpay window when no keys are set.
 * It signs a mock payment exactly like the gateway would, and the result
 * goes through the same server verification code as a real payment.
 * Unavailable when real payments are configured or in production.
 */
async function load(gw: string) {
  if (drivers().payments !== "mock") notFound();
  const [p] = await sql<{ order_id: string; amount_minor: string; status: string; order_number: string; user_id: string | null }[]>`
    select p.order_id, p.amount_minor, p.status, o.order_number, o.user_id from payments p join orders o on o.id = p.order_id
    where p.gateway_order_id = ${gw} and p.provider = 'mock'`;
  if (!p || !(await canViewOrder({ id: p.order_id, user_id: p.user_id }, await getCurrentUser()))) notFound();
  return p;
}

export default async function MockGateway({ params }: { params: Promise<{ gw: string }> }) {
  const { gw } = await params;
  const p = await load(gw);

  async function succeed() {
    "use server";
    const row = await load(gw);
    const paymentId = `mock_pay_${randomBytes(8).toString("hex")}`;
    const r = await verifyCheckout({ gatewayOrderId: gw, paymentId, signature: gateway.signMock(gw, paymentId) });
    redirect(`/order-confirmation/${row.order_id}${r.ok ? "" : "?verify=failed"}`);
  }
  async function fail() {
    "use server";
    const row = await load(gw);
    await reportCheckoutFailure(gw, { paymentId: `mock_pay_${randomBytes(8).toString("hex")}`, code: "BAD_REQUEST_ERROR", description: "Payment declined by bank (simulated)" });
    redirect(`/checkout/pay/${row.order_id}?failed=1`);
  }
  async function cancel() {
    "use server";
    const row = await load(gw);
    redirect(`/checkout/pay/${row.order_id}?cancelled=1`);
  }

  return (
    <div className="container-x flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md border-2 border-dashed border-cobalt bg-surface p-8">
        <p className="badge badge-cobalt">Test gateway</p>
        <h1 className="mt-4 text-2xl font-semibold">Simulated payment</h1>
        <p className="mt-2 text-sm text-ink-soft">No money moves. This page replaces Razorpay until API keys are configured.</p>
        <dl className="mt-6 space-y-1 text-sm">
          <div className="flex justify-between"><dt>Order</dt><dd>{p.order_number}</dd></div>
          <div className="flex justify-between"><dt>Amount</dt><dd className="font-semibold tabular-nums">{formatMoney(Number(p.amount_minor))}</dd></div>
          <div className="flex justify-between"><dt>Gateway order</dt><dd className="truncate pl-4 text-ink-soft">{gw}</dd></div>
        </dl>
        <div className="mt-8 grid gap-2">
          <form action={succeed}><button className="btn btn-primary w-full">Simulate successful payment</button></form>
          <form action={fail}><button className="btn btn-danger w-full">Simulate declined payment</button></form>
          <form action={cancel}><button className="btn btn-secondary w-full">Cancel and go back</button></form>
        </div>
      </div>
    </div>
  );
}
