/**
 * Grants a staff role to an existing account (for example, the first
 * super_admin after signing up through Supabase auth).
 *
 *   npm run db:grant-role -- you@example.com super_admin
 */
import postgres from "postgres";

const ROLES = ["super_admin", "catalog_manager", "order_manager", "support_agent", "marketing_editor", "analyst"];

async function main() {
  const [email, role] = process.argv.slice(2);
  if (!email || !ROLES.includes(role)) throw new Error(`Usage: grant-role <email> <${ROLES.join("|")}>`);
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  try {
    const [u] = await sql<{ id: string }[]>`select id from users where email = ${email.toLowerCase()} and deleted_at is null`;
    if (!u) throw new Error("No user with that email. Sign up first, then run this again.");
    await sql`insert into user_roles (user_id, role) values (${u.id}, ${role}) on conflict do nothing`;
    await sql`insert into admin_audit_logs (action, entity_type, entity_id, after) values ('staff.grant.cli', 'user', ${u.id}, ${sql.json({ role })})`;
    console.log(`Granted ${role} to ${email}`);
  } finally {
    await sql.end();
  }
}
main().catch((e) => { console.error(e.message); process.exit(1); });
