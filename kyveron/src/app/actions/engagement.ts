"use server";

import { z } from "zod";
import { randomBytes } from "node:crypto";
import { sql } from "@/lib/db";
import { POLICY_VERSION } from "@/lib/config/store";
import { clientIp, userAgent } from "@/lib/security/request";
import { enforce, LIMITS, RateLimitError } from "@/lib/security/rate-limit";
import { isBot, verifyCaptcha } from "@/lib/security/captcha";
import { emailSchema, indianMobile } from "@/lib/validation";
import { sendEmail } from "@/lib/email";
import { templates } from "@/lib/email/templates";
import { getCurrentUser } from "@/lib/auth/session";

export type SimpleState = { ok?: boolean; message?: string; errors?: Record<string, string> } | undefined;

async function limited(fn: () => Promise<void>): Promise<SimpleState | null> {
  try {
    await fn();
    return null;
  } catch (e) {
    if (e instanceof RateLimitError) return { message: e.message };
    throw e;
  }
}

export async function subscribe(_: SimpleState, form: FormData): Promise<SimpleState> {
  if (isBot(form)) return { ok: true, message: "You are on the list." };
  const channel = form.get("channel") === "whatsapp" ? "whatsapp" : "email";
  const raw = String(form.get("contact") ?? "");
  const parsed = channel === "email" ? emailSchema.safeParse(raw) : indianMobile.safeParse(raw);
  if (!parsed.success) return { errors: { contact: parsed.error.issues[0].message } };
  if (form.get("consent") !== "on") return { errors: { consent: "Please confirm you would like to hear from us." } };
  const ip = await clientIp();
  const blocked = await limited(() => enforce(LIMITS.newsletter(ip)));
  if (blocked) return blocked;

  const value = parsed.data;
  if (channel === "email") {
    await sql`insert into newsletter_subscribers (email, source) values (${value}, 'footer')
      on conflict (email) do update set unsubscribed_at = null`;
  } else {
    await sql`insert into newsletter_subscribers (whatsapp, source) values (${value}, 'footer')
      on conflict (whatsapp) do update set unsubscribed_at = null`;
  }
  await sql`insert into consent_records (subject, purpose, granted, policy_version, source, ip, user_agent)
    values (${value}, ${channel === "email" ? "marketing_email" : "marketing_whatsapp"}, true, ${POLICY_VERSION}, 'newsletter', ${ip}, ${await userAgent()})`;
  return {
    ok: true,
    message: channel === "email" ? "Thank you. New releases and journal notes, about twice a month." : "Thank you. We will message you on WhatsApp only for launches and restocks.",
  };
}

const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(80),
  email: emailSchema,
  phone: z.union([z.literal(""), indianMobile]).optional(),
  orderNumber: z.string().trim().toUpperCase().max(20).regex(/^[A-Z0-9-]*$/, "Order numbers look like KV2609-7QK3MX.").optional(),
  category: z.enum(["order", "delivery", "returns", "payment", "product", "account", "other"]),
  message: z.string().trim().min(10, "Tell us a little more (at least 10 characters).").max(3000),
});

export async function submitContact(_: SimpleState, form: FormData): Promise<SimpleState> {
  if (isBot(form)) return { ok: true, message: "Thanks, we have your message." };
  const ip = await clientIp();
  if (!(await verifyCaptcha(String(form.get("cf-turnstile-response") ?? ""), ip))) {
    return { message: "Please complete the verification and try again." };
  }
  const parsed = contactSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { errors };
  }
  const blocked = await limited(() => enforce(LIMITS.contact(ip)));
  if (blocked) return blocked;
  const d = parsed.data;
  const user = await getCurrentUser();
  const ref = `T-${randomBytes(4).toString("hex").toUpperCase()}`;
  await sql`insert into contact_tickets (reference, user_id, name, email, phone, order_number, category, message)
    values (${ref}, ${user?.id ?? null}, ${d.name}, ${d.email}, ${d.phone || null}, ${d.orderNumber || null}, ${d.category}, ${d.message})`;
  await sendEmail({ to: d.email, ...templates.ticketReceived(ref), dedupeKey: `ticket:${ref}` });
  return { ok: true, message: `Thanks, we have your message. Your reference is ${ref}. We reply within one working day.` };
}

export async function requestBackInStock(_: SimpleState, form: FormData): Promise<SimpleState> {
  const email = emailSchema.safeParse(form.get("email"));
  const variantId = z.string().uuid().safeParse(form.get("variantId"));
  if (!email.success) return { errors: { email: "Enter a valid email address." } };
  if (!variantId.success) return { message: "Choose a size first." };
  const ip = await clientIp();
  const blocked = await limited(() => enforce(LIMITS.newsletter(ip)));
  if (blocked) return blocked;
  await sql`insert into back_in_stock_requests (variant_id, email) values (${variantId.data}, ${email.data}) on conflict do nothing`;
  return { ok: true, message: "We will email you once when this size is back." };
}
