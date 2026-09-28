import Link from "next/link";
import { sql } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { formatMoney } from "@/lib/money";
import { STATUS_LABEL, type OrderStatus } from "@/lib/orders/state";
import { ProfileForm, SignOutButton } from "@/components/account/AccountForms";

export default async function AccountOverview() {
  const user = await requireUser();
  const [[p], orders] = await Promise.all([
    sql<{ phone: string | null; preferred_size: string | null; preferred_currency: string }[]>`
      select u.phone, pr.preferred_size, coalesce(pr.preferred_currency, 'INR') preferred_currency
      from users u left join profiles pr on pr.user_id = u.id where u.id = ${user.id}`,
    sql<{ id: string; order_number: string; status: OrderStatus; total_minor: string; created_at: Date }[]>`
      select id, order_number, status, total_minor, created_at from orders where user_id = ${user.id} order by created_at desc limit 3`,
  ]);
  return (
    <div className="grid gap-14">
      <section>
        <h1 className="display text-[clamp(1.8rem,3vw,2.6rem)]">Hello{user.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}</h1>
        {!user.emailVerified && <p className="notice notice-cobalt mt-4 text-sm">Please confirm your email address. Check your inbox for the link we sent when you registered.</p>}
      </section>
      <section aria-labelledby="recent-orders">
        <div className="mb-4 flex items-baseline justify-between"><h2 id="recent-orders" className="text-lg font-semibold">Recent orders</h2><Link href="/account/orders" className="link text-sm">All orders</Link></div>
        {orders.length === 0 ? <p className="text-ink-soft">No orders yet. <Link href="/shop" className="link">Start shopping</Link></p> : (
          <ul className="divide-y divide-line border-y border-line">
            {orders.map((o) => (
              <li key={o.id}><Link href={`/account/orders/${o.id}`} className="grid grid-cols-2 gap-2 py-4 text-sm hover:bg-surface sm:grid-cols-4">
                <span className="font-medium">{o.order_number}</span><span className="text-ink-soft">{o.created_at.toLocaleDateString("en-IN")}</span>
                <span>{STATUS_LABEL[o.status]}</span><span className="text-right tabular-nums">{formatMoney(Number(o.total_minor))}</span>
              </Link></li>
            ))}
          </ul>
        )}
      </section>
      <section aria-labelledby="profile-h">
        <h2 id="profile-h" className="mb-4 text-lg font-semibold">Profile</h2>
        <ProfileForm v={{ fullName: user.fullName ?? "", email: user.email, phone: p?.phone ?? "", preferredSize: p?.preferred_size ?? "", preferredCurrency: p?.preferred_currency ?? "INR" }} />
      </section>
      <div className="lg:hidden"><SignOutButton /></div>
    </div>
  );
}
