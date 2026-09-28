import Link from "next/link";
import { sql } from "@/lib/db";
import { requireStaffPage } from "@/lib/auth/guards";
import { PageHeader, Pill, Table, statusTone } from "@/components/admin/ui";
import { ReviewModeration } from "@/components/admin/Buttons";

export const metadata = { title: "Reviews" };

export default async function Reviews({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireStaffPage("reviews.moderate");
  const status = ["pending", "published", "rejected"].includes((await searchParams).status ?? "") ? (await searchParams).status! : "pending";
  const rows = await sql<{ id: string; rating: number; title: string | null; body: string; status: string; is_verified_purchase: boolean; created_at: Date; product: string; slug: string; email: string }[]>`
    select r.id, r.rating, r.title, r.body, r.status, r.is_verified_purchase, r.created_at, p.name product, p.slug, u.email
    from reviews r join products p on p.id = r.product_id join users u on u.id = r.user_id where r.status = ${status} order by r.created_at desc limit 100`;
  return (
    <div>
      <PageHeader title="Reviews" sub="Publish honest reviews, including critical ones. Reject only spam, abuse, or personal data." />
      <div className="mb-4 flex gap-2">{["pending", "published", "rejected"].map((s) => <Link key={s} href={`/admin/reviews?status=${s}`} className="chip !min-h-9 text-xs" data-selected={s === status}>{s}</Link>)}</div>
      <Table head={["Product", "Rating", "Review", "By", "Status", ""]} empty={rows.length ? undefined : "Nothing here."}>
        {rows.map((r) => (
          <tr key={r.id} className="align-top">
            <td className="px-3 py-2"><Link className="link" href={`/products/${r.slug}`} target="_blank">{r.product}</Link></td>
            <td className="px-3 py-2">{r.rating}/5</td>
            <td className="max-w-md px-3 py-2">{r.title && <strong className="block">{r.title}</strong>}{r.body}</td>
            <td className="px-3 py-2 text-xs">{r.email}{r.is_verified_purchase && <span className="block"><Pill tone="good">verified</Pill></span>}</td>
            <td className="px-3 py-2"><Pill tone={statusTone(r.status)}>{r.status}</Pill></td>
            <td className="px-3 py-2">{r.status === "pending" && <ReviewModeration id={r.id} />}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
