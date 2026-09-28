"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { sql } from "@/lib/db";
import { drivers, env } from "@/lib/env";
import { clientIp, userAgent } from "@/lib/security/request";
import { enforce, LIMITS, RateLimitError } from "@/lib/security/rate-limit";
import { isBot } from "@/lib/security/captcha";
import { sendEmail } from "@/lib/email";
import { templates } from "@/lib/email/templates";
import { afterSignIn } from "./flows";
import { POLICY_VERSION } from "@/lib/config/store";
import { emailSchema, indianMobile } from "@/lib/validation";
import { hashPassword, passwordProblem, verifyPassword } from "./password";
import { consumeToken, issueToken } from "./tokens";
import { endSession, getCurrentUser, revokeAllSessions, startLocalSession } from "./session";
import { supabaseServer } from "./supabase";

export type FormState = { ok?: boolean; message?: string; errors?: Record<string, string> } | undefined;

const GENERIC_LOGIN_ERROR = "That email and password do not match an account.";

function safeNext(next: FormDataEntryValue | null): string {
  const n = String(next ?? "");
  return n.startsWith("/") && !n.startsWith("//") && !n.startsWith("/\\") ? n : "/account";
}


async function recordConsent(userId: string | null, subject: string, purpose: string, granted: boolean, source: string) {
  await sql`insert into consent_records (user_id, subject, purpose, granted, policy_version, source, ip, user_agent)
    values (${userId}, ${subject}, ${purpose}, ${granted}, ${POLICY_VERSION}, ${source}, ${await clientIp()}, ${await userAgent()})`;
}

export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  const parsed = z.object({ email: emailSchema, password: z.string().min(1).max(128) }).safeParse({
    email: form.get("email"), password: form.get("password"),
  });
  if (!parsed.success) return { message: GENERIC_LOGIN_ERROR };
  const { email, password } = parsed.data;
  const ip = await clientIp();
  try {
    await enforce(LIMITS.login(`ip:${ip}`));
    await enforce(LIMITS.login(`email:${email}`));
  } catch (e) {
    if (e instanceof RateLimitError) return { message: e.message };
    throw e;
  }

  let userId: string;
  if (drivers().auth === "supabase") {
    const supabase = await supabaseServer();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      return { message: error?.code === "email_not_confirmed" ? "Please confirm your email first. Check your inbox for the link." : GENERIC_LOGIN_ERROR };
    }
    userId = data.user.id;
  } else {
    const [row] = await sql<{ id: string; password_hash: string; failed_attempts: number; locked_until: Date | null }[]>`
      select u.id, c.password_hash, c.failed_attempts, c.locked_until from users u
      join local_credentials c on c.user_id = u.id where u.email = ${email} and u.deleted_at is null`;
    if (!row) {
      await hashPassword(password); // equalise timing with the found-user path
      return { message: GENERIC_LOGIN_ERROR };
    }
    if (row.locked_until && row.locked_until.getTime() > Date.now()) {
      return { message: "Too many attempts. Please wait 15 minutes or reset your password." };
    }
    if (!(await verifyPassword(password, row.password_hash))) {
      await sql`update local_credentials set failed_attempts = failed_attempts + 1,
        locked_until = case when failed_attempts + 1 >= 5 then now() + interval '15 minutes' else null end
        where user_id = ${row.id}`;
      return { message: GENERIC_LOGIN_ERROR };
    }
    await sql`update local_credentials set failed_attempts = 0, locked_until = null where user_id = ${row.id}`;
    await startLocalSession(row.id, await userAgent());
    userId = row.id;
  }
  await afterSignIn(userId);
  redirect(safeNext(form.get("next")));
}

const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your name.").max(80),
  email: emailSchema,
  phone: z.union([z.literal(""), indianMobile]).optional(),
  password: z.string().max(128),
  acceptTerms: z.literal("on", { message: "Please accept the terms and privacy policy." }),
  marketingEmail: z.string().optional(),
});

export async function register(_: FormState, form: FormData): Promise<FormState> {
  if (isBot(form)) return { ok: true, message: "Check your inbox to confirm your email." };
  const parsed = registerSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { errors };
  }
  const d = parsed.data;
  const pwProblem = passwordProblem(d.password, d.email);
  if (pwProblem) return { errors: { password: pwProblem } };
  try {
    await enforce(LIMITS.signup(await clientIp()));
  } catch (e) {
    if (e instanceof RateLimitError) return { message: e.message };
    throw e;
  }
  // Same response whether or not the email exists: no account enumeration.
  const done: FormState = { ok: true, message: "Check your inbox to confirm your email, then sign in." };

  if (drivers().auth === "supabase") {
    const supabase = await supabaseServer();
    const { data, error } = await supabase.auth.signUp({
      email: d.email, password: d.password,
      options: { data: { full_name: d.fullName }, emailRedirectTo: `${env().APP_URL}/auth/callback?next=/account` },
    });
    if (error && error.code === "weak_password") return { errors: { password: "Choose a stronger password." } };
    if (data.user) {
      if (d.phone) await sql`update users set phone = ${d.phone} where id = ${data.user.id}`;
      await recordConsent(data.user.id, d.email, "terms", true, "register");
      await recordConsent(data.user.id, d.email, "marketing_email", d.marketingEmail === "on", "register");
      await sql`update profiles set marketing_email = ${d.marketingEmail === "on"} where user_id = ${data.user.id}`;
    }
    return done;
  }

  const [exists] = await sql`select 1 from users where email = ${d.email}`;
  if (exists) return done;
  const hash = await hashPassword(d.password);
  const userId = await sql.begin(async (tx) => {
    const [u] = await tx<{ id: string }[]>`insert into users (email, phone) values (${d.email}, ${d.phone || null}) returning id`;
    await tx`insert into profiles (user_id, full_name, marketing_email) values (${u.id}, ${d.fullName}, ${d.marketingEmail === "on"})`;
    await tx`insert into local_credentials (user_id, password_hash) values (${u.id}, ${hash})`;
    return u.id;
  });
  await recordConsent(userId, d.email, "terms", true, "register");
  await recordConsent(userId, d.email, "marketing_email", d.marketingEmail === "on", "register");
  const token = await issueToken(userId, "verify_email", 24 * 60);
  await sendEmail({ to: d.email, ...templates.verifyEmail(`${env().APP_URL}/auth/verify?token=${token}`) });
  return done;
}

export async function requestPasswordReset(_: FormState, form: FormData): Promise<FormState> {
  const parsed = emailSchema.safeParse(form.get("email"));
  const done: FormState = { ok: true, message: "If an account exists for that email, we have sent a reset link." };
  if (!parsed.success) return { errors: { email: "Enter a valid email address." } };
  try {
    await enforce(LIMITS.passwordReset(`ip:${await clientIp()}`));
    await enforce(LIMITS.passwordReset(`email:${parsed.data}`));
  } catch (e) {
    if (e instanceof RateLimitError) return { message: e.message };
    throw e;
  }
  if (drivers().auth === "supabase") {
    const supabase = await supabaseServer();
    await supabase.auth.resetPasswordForEmail(parsed.data, { redirectTo: `${env().APP_URL}/auth/callback?next=/reset-password` });
    return done;
  }
  const [u] = await sql<{ id: string }[]>`select id from users where email = ${parsed.data} and deleted_at is null`;
  if (u) {
    const token = await issueToken(u.id, "reset_password", 60);
    await sendEmail({ to: parsed.data, ...templates.resetPassword(`${env().APP_URL}/reset-password?token=${token}`) });
  }
  return done;
}

export async function resetPassword(_: FormState, form: FormData): Promise<FormState> {
  const password = String(form.get("password") ?? "");
  const problem = passwordProblem(password);
  if (problem) return { errors: { password: problem } };
  if (password !== String(form.get("confirm") ?? "")) return { errors: { confirm: "Passwords do not match." } };

  if (drivers().auth === "supabase") {
    // The recovery link established a session via /auth/callback.
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { message: "This reset link has expired. Request a new one." };
    return { ok: true, message: "Password updated. You are signed in." };
  }
  const userId = await consumeToken(String(form.get("token") ?? ""), "reset_password");
  if (!userId) return { message: "This reset link has expired or was already used. Request a new one." };
  await sql`update local_credentials set password_hash = ${await hashPassword(password)}, failed_attempts = 0, locked_until = null
    where user_id = ${userId}`;
  await revokeAllSessions(userId);
  return { ok: true, message: "Password updated. Sign in with your new password." };
}

export async function changePassword(_: FormState, form: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { message: "Please sign in again." };
  const next = String(form.get("password") ?? "");
  const problem = passwordProblem(next, user.email);
  if (problem) return { errors: { password: problem } };
  if (drivers().auth === "supabase") {
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.updateUser({ password: next });
    return error ? { message: "Could not update your password. Sign in again and retry." } : { ok: true, message: "Password updated." };
  }
  const [c] = await sql<{ password_hash: string }[]>`select password_hash from local_credentials where user_id = ${user.id}`;
  if (!c || !(await verifyPassword(String(form.get("current") ?? ""), c.password_hash))) {
    return { errors: { current: "Your current password is incorrect." } };
  }
  await sql`update local_credentials set password_hash = ${await hashPassword(next)} where user_id = ${user.id}`;
  await revokeAllSessions(user.id);
  await startLocalSession(user.id, await userAgent());
  return { ok: true, message: "Password updated. Other devices have been signed out." };
}

/** Google / Apple / Facebook via Supabase OAuth (PKCE). Requires provider setup in Supabase. */
export async function signInWithProvider(form: FormData) {
  const provider = z.enum(["google", "apple", "facebook"]).safeParse(form.get("provider"));
  if (!provider.success || drivers().auth !== "supabase") redirect("/login?error=provider_unavailable");
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider.data,
    options: { redirectTo: `${env().APP_URL}/auth/callback?next=${encodeURIComponent(safeNext(form.get("next")))}` },
  });
  if (error || !data.url) redirect("/login?error=provider_unavailable");
  redirect(data.url);
}

/** Email magic link through Supabase (PKCE, single use, short-lived). Not offered by the local driver. */
export async function sendMagicLink(_: FormState, form: FormData): Promise<FormState> {
  const email = emailSchema.safeParse(form.get("email"));
  if (!email.success) return { errors: { email: "Enter a valid email address." } };
  if (drivers().auth !== "supabase") return { message: "Magic links are not available in this environment." };
  try {
    await enforce(LIMITS.passwordReset(`magic:${email.data}`));
  } catch (e) {
    if (e instanceof RateLimitError) return { message: e.message };
    throw e;
  }
  const supabase = await supabaseServer();
  await supabase.auth.signInWithOtp({
    email: email.data,
    options: { shouldCreateUser: false, emailRedirectTo: `${env().APP_URL}/auth/callback?next=/account` },
  });
  return { ok: true, message: "If an account exists, a sign-in link is on its way. It expires in 1 hour." };
}

export async function signOut() {
  await endSession();
  redirect("/");
}
