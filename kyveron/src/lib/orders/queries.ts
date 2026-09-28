import "server-only";
import { sql } from "@/lib/db";
import type { OrderStatus } from "./state";
import type { Address } from "./service";

export type OrderDetail = {
  id: string; order_number: string; user_id: string | null; email: string; phone: string; status: OrderStatus; currency: string;
  subtotal_minor: string; discount_minor: string; shipping_minor: string; tax_minor: string; total_minor: string;
  coupon_code: string | null; shipping_method: string; shipping_address: Address; billing_address: Address; payment_method: string | null;
  estimated_delivery_from: Date | null; estimated_delivery_to: Date | null; created_at: Date; paid_at: Date | null; needs_review: boolean;
  review_reason: string | null;
};

export async function getOrder(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [o] = await sql<OrderDetail[]>`select * from orders where id = ${id}`;
  if (!o) return null;
  const [items, history, shipments, payments, refunds] = await Promise.all([
    sql<{ id: string; product_name: string; size: string; colour: string; sku: string; image_url: string | null; quantity: number; unit_price_minor: string; line_total_minor: string; tax_rate: string; tax_minor: string; discount_minor: string; returned_quantity: number; product_id: string | null }[]>`
      select id, product_name, size, colour, sku, image_url, quantity, unit_price_minor, line_total_minor, tax_rate, tax_minor, discount_minor, returned_quantity, product_id
      from order_items where order_id = ${id} order by product_name`,
    sql<{ from_status: OrderStatus | null; to_status: OrderStatus; actor_type: string; note: string | null; created_at: Date }[]>`
      select from_status, to_status, actor_type, note, created_at from order_status_history where order_id = ${id} order by created_at, id`,
    sql<{ courier: string; tracking_number: string; tracking_url: string | null; shipped_at: Date | null; delivered_at: Date | null }[]>`
      select courier, tracking_number, tracking_url, shipped_at, delivered_at from shipments where order_id = ${id} order by created_at desc`,
    sql<{ provider: string; status: string; method: string | null; amount_minor: string; gateway_payment_id: string | null; gateway_order_id: string | null; signature_verified: boolean; created_at: Date; captured_at: Date | null; error_description: string | null }[]>`
      select provider, status, method, amount_minor, gateway_payment_id, gateway_order_id, signature_verified, created_at, captured_at, error_description
      from payments where order_id = ${id} order by created_at desc`,
    sql<{ amount_minor: string; status: string; reason: string | null; created_at: Date; processed_at: Date | null; gateway_refund_id: string | null }[]>`
      select amount_minor, status, reason, created_at, processed_at, gateway_refund_id from refunds where order_id = ${id} order by created_at desc`,
  ]);
  return { ...o, items, history, shipments, payments, refunds };
}

export type FullOrder = NonNullable<Awaited<ReturnType<typeof getOrder>>>;
