import "server-only";
import { redirect, notFound } from "next/navigation";
import { drivers, env } from "@/lib/env";
import { getCurrentUser, type CurrentUser } from "./session";
import { can, type Permission } from "./roles";

export class AuthError extends Error {
  constructor(public status: 401 | 403, message: string) {
    super(message);
  }
}

/** For pages: redirects to login when signed out. */
export async function requireUser(next = "/account"): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

function mfaSatisfied(user: CurrentUser) {
  // The local driver has no MFA and is refused in production (env.ts).
  return env().ADMIN_REQUIRE_MFA === "false" || user.aal === "aal2" || drivers().auth === "local";
}

/**
 * For admin pages. Unknown visitors get a 404 rather than a hint that an
 * admin area exists; signed-in non-staff get the same.
 */
export async function requireStaffPage(perm: Permission): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/admin`);
  if (user.roles.length === 0) notFound();
  if (!mfaSatisfied(user)) redirect("/account/security?mfa=required");
  if (!can(user.roles, perm)) redirect("/admin?denied=1");
  return user;
}

/** For server actions and route handlers: throws instead of redirecting. */
export async function requirePermission(perm: Permission): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError(401, "Please sign in.");
  if (!can(user.roles, perm) || !mfaSatisfied(user)) throw new AuthError(403, "You do not have access to do that.");
  return user;
}
