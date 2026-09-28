import "server-only";
import { sql } from "@/lib/db";
import { drivers, env } from "@/lib/env";

export type Email = {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Same key = same email; prevents duplicates from retried webhooks. */
  dedupeKey?: string;
};

/**
 * Writes the email to the outbox first (durable record, idempotent by
 * dedupeKey), then attempts delivery. Delivery failure never breaks the
 * business action that triggered it; failed rows can be retried by
 * /api/cron/email.
 */
export async function sendEmail(email: Email): Promise<void> {
  const rows = await sql<{ id: number }[]>`
    insert into email_outbox (dedupe_key, to_email, subject, html, text_body)
    values (${email.dedupeKey ?? null}, ${email.to}, ${email.subject}, ${email.html}, ${email.text})
    on conflict (dedupe_key) do nothing
    returning id`;
  if (!rows[0]) return; // already queued
  await deliver(rows[0].id);
}

export async function deliver(id: number) {
  const [row] = await sql<{ to_email: string; subject: string; html: string; text_body: string }[]>`
    update email_outbox set attempts = attempts + 1 where id = ${id} and status in ('queued','failed')
    returning to_email, subject, html, text_body`;
  if (!row) return;

  if (drivers().email === "log") {
    // Development: no provider configured. The full message stays in
    // email_outbox for inspection; only the subject is logged.
    console.info(`[email:log] to=${row.to_email} subject="${row.subject}" (outbox #${id})`);
    await sql`update email_outbox set status = 'logged', sent_at = now() where id = ${id}`;
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env().RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: env().EMAIL_FROM, to: [row.to_email], subject: row.subject, html: row.html, text: row.text_body }),
      signal: AbortSignal.timeout(8000),
    });
    const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok) throw new Error(data.message ?? `HTTP ${res.status}`);
    await sql`update email_outbox set status = 'sent', provider_id = ${data.id ?? null}, sent_at = now(), error = null where id = ${id}`;
  } catch (err) {
    const msg = err instanceof Error ? err.message.slice(0, 300) : "unknown";
    await sql`update email_outbox set status = 'failed', error = ${msg} where id = ${id}`;
  }
}
