import { sql } from "@/lib/db";
import { requireStaffPage } from "@/lib/auth/guards";
import { PERMISSIONS, STAFF_ROLES } from "@/lib/auth/roles";
import { PageHeader, Panel, Table } from "@/components/admin/ui";
import { RevokeRole, StaffForm } from "@/components/admin/Buttons";

export const metadata = { title: "Staff and roles" };

export default async function Staff() {
  await requireStaffPage("staff.manage");
  const rows = await sql<{ email: string; full_name: string | null; roles: string[] }[]>`
    select u.email, p.full_name, array_agg(ur.role::text order by ur.role) roles from user_roles ur join users u on u.id = ur.user_id
    left join profiles p on p.user_id = u.id group by u.email, p.full_name order by u.email`;
  return (
    <div className="grid gap-6">
      <PageHeader title="Staff and roles" sub="Give each person the least access their job needs. Staff must use two-step verification when Supabase auth is on." />
      <Panel title="Grant a role"><StaffForm /></Panel>
      <Table head={["Person", "Roles"]}>
        {rows.map((r) => (
          <tr key={r.email}><td className="px-3 py-2.5">{r.full_name ?? "—"}<span className="block text-xs text-ink-soft">{r.email}</span></td>
            <td className="px-3">{r.roles.map((role) => <span key={role} className="mr-3 inline-flex items-center gap-1 text-sm">{role}<RevokeRole email={r.email} role={role} /></span>)}</td></tr>
        ))}
      </Table>
      <Panel title="What each role can do">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr><th className="py-1 text-left">Permission</th>{STAFF_ROLES.map((r) => <th key={r} className="px-2 py-1">{r.replace("_", " ")}</th>)}</tr></thead>
            <tbody>{Object.entries(PERMISSIONS).map(([p, roles]) => <tr key={p} className="border-t border-line"><td className="py-1">{p}</td>{STAFF_ROLES.map((r) => <td key={r} className="text-center">{(roles as readonly string[]).includes(r) ? "✓" : ""}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
