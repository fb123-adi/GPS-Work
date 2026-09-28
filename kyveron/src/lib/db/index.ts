import "server-only";
import postgres from "postgres";
import { env } from "@/lib/env";

/**
 * One pooled connection for the process. All queries use tagged templates,
 * which postgres.js sends as parameterised statements (no string-built SQL).
 *
 * On Supabase use the pooled connection string (Supavisor, transaction mode)
 * with `prepare: false`, which is set automatically below.
 */
declare global {
  var __kyveronSql: postgres.Sql | undefined;
}

function create() {
  const url = env().DATABASE_URL;
  const pooled = /pooler\.supabase\.com|:6543\//.test(url);
  return postgres(url, {
    max: Number(process.env.DATABASE_POOL_MAX ?? 10),
    idle_timeout: 20,
    prepare: !pooled,
    transform: { undefined: null },
    onnotice: () => {},
  });
}

export const sql: postgres.Sql = globalThis.__kyveronSql ?? create();
if (env().APP_ENV !== "production") globalThis.__kyveronSql = sql;

export type Tx = postgres.TransactionSql;
export type Db = postgres.Sql | postgres.TransactionSql;

/**
 * Runs `fn` inside a transaction with RLS applied as the given user, exactly as
 * Supabase would for a request carrying that user's JWT. Use it for
 * customer-scoped reads as defence in depth on top of application checks.
 */
export async function withUserRls<T>(userId: string, fn: (tx: Tx) => Promise<T>): Promise<T> {
  return sql.begin(async (tx) => {
    await tx`select set_config('request.jwt.claim.sub', ${userId}, true)`;
    await tx`set local role authenticated`;
    return fn(tx);
  }) as Promise<T>;
}
