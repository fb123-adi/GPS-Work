import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { sql } from "@/lib/db";

/** One-time tokens (email verification, password reset). Only the hash is stored. */
export async function issueToken(userId: string, purpose: "verify_email" | "reset_password", ttlMinutes: number) {
  const raw = randomBytes(32).toString("base64url");
  const hash = createHash("sha256").update(raw).digest("hex");
  await sql`update local_tokens set used_at = now() where user_id = ${userId} and purpose = ${purpose} and used_at is null`;
  await sql`insert into local_tokens (token_hash, user_id, purpose, expires_at)
    values (${hash}, ${userId}, ${purpose}, now() + make_interval(mins => ${ttlMinutes}))`;
  return raw;
}

export async function consumeToken(raw: string, purpose: "verify_email" | "reset_password"): Promise<string | null> {
  const hash = createHash("sha256").update(raw).digest("hex");
  const [row] = await sql<{ user_id: string }[]>`
    update local_tokens set used_at = now()
    where token_hash = ${hash} and purpose = ${purpose} and used_at is null and expires_at > now()
    returning user_id`;
  return row?.user_id ?? null;
}
