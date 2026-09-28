import "server-only";
import { sql, type Db } from "@/lib/db";
import { clientIp } from "@/lib/security/request";

const REDACT = /(password|secret|token|signature|card|cvv|key)/i;

function scrub(v: unknown): unknown {
  if (!v || typeof v !== "object") return v;
  if (Array.isArray(v)) return v.map(scrub);
  return Object.fromEntries(Object.entries(v).map(([k, val]) => [k, REDACT.test(k) ? "[redacted]" : scrub(val)]));
}

/** Records an admin action. Secrets are redacted before they are stored. */
export async function audit(
  actorId: string | null,
  action: string,
  entityType: string,
  entityId: string | null,
  change: { before?: unknown; after?: unknown } = {},
  db: Db = sql,
) {
  let ip: string | null = null;
  try {
    ip = await clientIp();
  } catch {
    ip = null; // outside a request (scripts, cron)
  }
  await db`insert into admin_audit_logs (actor_id, action, entity_type, entity_id, before, after, ip)
    values (${actorId}, ${action}, ${entityType}, ${entityId},
      ${change.before === undefined ? null : sql.json(scrub(change.before) as never)},
      ${change.after === undefined ? null : sql.json(scrub(change.after) as never)}, ${ip})`;
}
