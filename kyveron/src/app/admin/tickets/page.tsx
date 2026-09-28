import { sql } from "@/lib/db";
import { requireStaffPage } from "@/lib/auth/guards";
import { PageHeader, Table } from "@/components/admin/ui";
import { TicketStatus } from "@/components/admin/Buttons";

export const metadata = { title: "Support tickets" };

export default async function Tickets() {
  await requireStaffPage("tickets.manage");
  const rows = await sql<{ id: string; reference: string; name: string; email: string; phone: string | null; order_number: string | null; category: string; message: string; status: string; created_at: Date }[]>`
    select id, reference, name, email, phone, order_number, category, message, status, created_at from contact_tickets
    order by (status in ('open','pending')) desc, created_at desc limit 200`;
  return (
    <div>
      <PageHeader title="Support tickets" />
      <Table head={["Ref", "From", "Topic", "Message", "Status"]} empty={rows.length ? undefined : "No tickets."}>
        {rows.map((t) => (
          <tr key={t.id} className="align-top">
            <td className="px-3 py-2 font-mono text-xs">{t.reference}<span className="block text-ink-soft">{t.created_at.toLocaleString("en-IN")}</span></td>
            <td className="px-3 py-2">{t.name}<span className="block text-xs"><a className="link" href={`mailto:${t.email}?subject=${encodeURIComponent(`Re: ${t.reference}`)}`}>{t.email}</a>{t.phone ? ` · ${t.phone}` : ""}</span></td>
            <td className="px-3 py-2">{t.category}{t.order_number && <span className="block text-xs">{t.order_number}</span>}</td>
            <td className="max-w-md whitespace-pre-line px-3 py-2">{t.message}</td>
            <td className="px-3 py-2"><TicketStatus id={t.id} status={t.status} /></td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
