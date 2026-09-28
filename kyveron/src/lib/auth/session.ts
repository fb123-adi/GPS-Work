import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { sql } from "@/lib/db";
import { drivers, env } from "@/lib/env";
import { secureCookie } from "@/lib/security/request";
import { supabaseServer } from "./supabase";
import type { StaffRole } from "./roles";

export type CurrentUser = {
  id: string;
  email: string;
  emailVerified: boolean;
  fullName: string | null;
  roles: StaffRole[];
  /** Authenticator assurance: 'aal2' once MFA has been passed (Supabase only). */
  aal: "aal1" | "aal2";
};

export const SESSION_COOKIE = "kv_session";
export const ADMIN_SEEN_COOKIE = "kv_admin_seen";
const SESSION_DAYS = 30;

const secret = () => new TextEncoder().encode(env().SESSION_SECRET);

async function loadUser(id: string, aal: CurrentUser["aal"]): Promise<CurrentUser | null> {
  const rows = await sql<{
    id: string; email: string; email_verified_at: Date | null; full_name: string | null; roles: StaffRole[];
  }[]>`
    select u.id, u.email, u.email_verified_at, p.full_name,
      coalesce(array_agg(ur.role) filter (where ur.role is not null), '{}') as roles
    from users u
    left join profiles p on p.user_id = u.id
    left join user_roles ur on ur.user_id = u.id
    where u.id = ${id} and u.deleted_at is null
    group by u.id, p.full_name`;
  const r = rows[0];
  if (!r) return null;
  return { id: r.id, email: r.email, emailVerified: !!r.email_verified_at, fullName: r.full_name, roles: r.roles, aal };
}

/** The signed-in user for this request, or null. Memoised per request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  if (drivers().auth === "supabase") {
    const supabase = await supabaseServer();
    // getUser() revalidates the JWT with Supabase; never trust getSession() alone.
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    return loadUser(data.user.id, aal?.currentLevel === "aal2" ? "aal2" : "aal1");
  }
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { issuer: "kyveron", audience: "session" });
    const sid = String(payload.sid);
    const [s] = await sql<{ user_id: string }[]>`
      update local_sessions set last_seen_at = now()
      where id = ${sid} and revoked_at is null and expires_at > now()
      returning user_id`;
    if (!s) return null;
    // Local driver has no MFA; it is refused in production (see env.ts).
    return loadUser(s.user_id, "aal1");
  } catch {
    return null;
  }
});

/** Local driver only: create a DB-backed session and set the cookie. */
export async function startLocalSession(userId: string, ua: string) {
  const [s] = await sql<{ id: string }[]>`
    insert into local_sessions (user_id, expires_at, user_agent)
    values (${userId}, now() + make_interval(days => ${SESSION_DAYS}), ${ua})
    returning id`;
  const jwt = await new SignJWT({ sid: s.id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("kyveron")
    .setAudience("session")
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret());
  (await cookies()).set(SESSION_COOKIE, jwt, { ...secureCookie(), maxAge: SESSION_DAYS * 86400 });
}

export async function endSession() {
  const store = await cookies();
  if (drivers().auth === "supabase") {
    const supabase = await supabaseServer();
    await supabase.auth.signOut();
  } else {
    const token = store.get(SESSION_COOKIE)?.value;
    if (token) {
      try {
        const { payload } = await jwtVerify(token, secret(), { issuer: "kyveron", audience: "session" });
        await sql`update local_sessions set revoked_at = now() where id = ${String(payload.sid)}`;
      } catch {
        /* already invalid */
      }
    }
    store.delete(SESSION_COOKIE);
  }
  store.delete(ADMIN_SEEN_COOKIE);
}

/** Revokes every session for a user (password change, account deletion). */
export async function revokeAllSessions(userId: string) {
  await sql`update local_sessions set revoked_at = now() where user_id = ${userId} and revoked_at is null`;
}

/** Marks admin activity; the proxy enforces the idle timeout from this. */
export async function signAdminActivity(): Promise<string> {
  return new SignJWT({ t: Date.now() })
    .setProtectedHeader({ alg: "HS256" })
    .setAudience("admin-activity")
    .sign(secret());
}

export async function touchAdminActivity() {
  (await cookies()).set(ADMIN_SEEN_COOKIE, await signAdminActivity(), { ...secureCookie(), maxAge: 12 * 3600 });
}
