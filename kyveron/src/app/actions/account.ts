"use server";

import { z } from "zod";
import { refresh } from "next/cache";
import { sql } from "@/lib/db";
import { drivers } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth/session";
import { supabaseServer } from "@/lib/auth/supabase";
import { addressSchema, fieldErrors, indianMobile } from "@/lib/validation";
import { BRAND, CURRENCIES, POLICY_VERSION } from "@/lib/config/store";
import { clientIp, userAgent } from "@/lib/security/request";
import { sendEmail } from "@/lib/email";
import { esc } from "@/lib/email/templates";

export type AccountState = { ok?: boolean; message?: string; errors?: Record<string, string> } | undefined;

async function need() {
  const u = await getCurrentUser();
  if (!u) throw new Error("Please sign in again.");
  return u;
}

export async function updateProfile(_: AccountState, form: FormData): Promise<AccountState> {
  const user = await need();
  const parsed = z.object({
    fullName: z.string().trim().min(2, "Enter your name.").max(80),
    phone: z.union([z.literal(""), indianMobile]),
    preferredSize: z.enum(["", "XS", "S", "M", "L", "XL", "XXL"]),
    preferredCurrency: z.string().refine((c) => CURRENCIES.some((x) => x.code === c)),
  }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const d = parsed.data;
  await sql.begin(async (tx) => {
    await tx`update users set phone = ${d.phone || null} where id = ${user.id}`;
    await tx`insert into profiles (user_id, full_name, preferred_size, preferred_currency) values (${user.id}, ${d.fullName}, ${d.preferredSize || null}, ${d.preferredCurrency})
      on conflict (user_id) do update set full_name = excluded.full_name, preferred_size = excluded.preferred_size, preferred_currency = excluded.preferred_currency`;
  });
  refresh();
  return { ok: true, message: "Saved." };
}

export async function updateMarketingPrefs(_: AccountState, form: FormData): Promise<AccountState> {
  const user = await need();
  const email = form.get("marketingEmail") === "on";
  const whatsapp = form.get("marketingWhatsapp") === "on";
  const ip = await clientIp();
  const ua = await userAgent();
  await sql`update profiles set marketing_email = ${email}, marketing_whatsapp = ${whatsapp} where user_id = ${user.id}`;
  for (const [purpose, granted] of [["marketing_email", email], ["marketing_whatsapp", whatsapp]] as const) {
    await sql`insert into consent_records (user_id, subject, purpose, granted, policy_version, source, ip, user_agent)
      values (${user.id}, ${user.email}, ${purpose}, ${granted}, ${POLICY_VERSION}, 'account', ${ip}, ${ua})`;
  }
  if (!email) await sql`update newsletter_subscribers set unsubscribed_at = now() where email = ${user.email}`;
  return { ok: true, message: "Preferences saved." };
}

export async function saveAddress(_: AccountState, form: FormData): Promise<AccountState> {
  const user = await need();
  const raw = Object.fromEntries(form);
  const parsed = addressSchema.safeParse({ ...raw, country: "IN" });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const a = parsed.data;
  const id = z.string().uuid().safeParse(raw.id);
  const label = z.string().trim().max(30).catch("").parse(raw.label) || null;
  const makeDefault = raw.isDefault === "on";
  await sql.begin(async (tx) => {
    if (makeDefault) await tx`update addresses set is_default = false where user_id = ${user.id}`;
    if (id.success) {
      await tx`update addresses set label = ${label}, full_name = ${a.fullName}, phone = ${a.phone}, line1 = ${a.line1}, line2 = ${a.line2},
        landmark = ${a.landmark}, city = ${a.city}, state = ${a.state}, postal_code = ${a.postalCode},
        is_default = ${makeDefault} or is_default where id = ${id.data} and user_id = ${user.id} and deleted_at is null`;
    } else {
      const [{ n }] = await tx<{ n: number }[]>`select count(*)::int n from addresses where user_id = ${user.id} and deleted_at is null`;
      if (n >= 10) throw new Error("You can save up to 10 addresses.");
      await tx`insert into addresses (user_id, label, full_name, phone, line1, line2, landmark, city, state, postal_code, is_default)
        values (${user.id}, ${label}, ${a.fullName}, ${a.phone}, ${a.line1}, ${a.line2}, ${a.landmark}, ${a.city}, ${a.state}, ${a.postalCode}, ${makeDefault || n === 0})`;
    }
  });
  refresh();
  return { ok: true, message: "Address saved." };
}

export async function deleteAddress(id: string) {
  const user = await need();
  if (!z.string().uuid().safeParse(id).success) return;
  await sql`update addresses set deleted_at = now(), is_default = false where id = ${id} and user_id = ${user.id}`;
  refresh();
}

export async function requestAccountDeletion(_: AccountState, form: FormData): Promise<AccountState> {
  const user = await need();
  if (String(form.get("confirm") ?? "").trim().toUpperCase() !== "DELETE") return { errors: { confirm: "Type DELETE to confirm." } };
  const [open] = await sql`select 1 from orders where user_id = ${user.id}
    and status in ('paid','confirmed','processing','packed','shipped','out_for_delivery','return_requested','refund_pending') limit 1`;
  await sql`update profiles set deletion_requested_at = now() where user_id = ${user.id}`;
  await sql`insert into consent_records (user_id, subject, purpose, granted, policy_version, source, ip)
    values (${user.id}, ${user.email}, 'account_deletion_request', true, ${POLICY_VERSION}, 'account', ${await clientIp()})`;
  await sendEmail({
    to: BRAND.supportEmail, subject: `Account deletion request: ${user.email}`,
    html: `<p>Account deletion requested by ${esc(user.email)} (user ${esc(user.id)}). Open orders: ${open ? "yes" : "no"}. Process within the period stated in the privacy policy; retain invoices as required by law.</p>`,
    text: `Account deletion requested by ${user.email} (${user.id}). Open orders: ${open ? "yes" : "no"}.`,
    dedupeKey: `deletion:${user.id}:${new Date().toISOString().slice(0, 10)}`,
  });
  return {
    ok: true,
    message: open
      ? "Request received. We will delete your account after your open orders are complete, and confirm by email. Tax records we must keep by law are retained."
      : "Request received. We will confirm by email once your account is deleted. Tax records we must keep by law are retained.",
  };
}

/** Supabase TOTP enrolment for MFA (required for staff when ADMIN_REQUIRE_MFA=true). */
export async function enrollMfa(): Promise<{ ok: boolean; factorId?: string; qr?: string; secret?: string; message?: string }> {
  await need();
  if (drivers().auth !== "supabase") return { ok: false, message: "Two-step verification requires Supabase auth to be configured." };
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `Kyveron ${new Date().toISOString().slice(0, 10)}` });
  if (error || !data) return { ok: false, message: "Could not start two-step verification." };
  return { ok: true, factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret };
}

export async function verifyMfa(factorId: string, code: string): Promise<{ ok: boolean; message: string }> {
  await need();
  if (drivers().auth !== "supabase" || !/^\d{6}$/.test(code)) return { ok: false, message: "Enter the 6-digit code from your authenticator app." };
  const supabase = await supabaseServer();
  const { data: ch, error: e1 } = await supabase.auth.mfa.challenge({ factorId });
  if (e1 || !ch) return { ok: false, message: "Could not verify. Try again." };
  const { error } = await supabase.auth.mfa.verify({ factorId, challengeId: ch.id, code });
  if (error) return { ok: false, message: "That code did not match. Check the time on your phone and try again." };
  return { ok: true, message: "Two-step verification is on." };
}
