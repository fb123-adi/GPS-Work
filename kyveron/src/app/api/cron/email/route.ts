import { NextResponse } from "next/server";
import { authorizeCron } from "@/lib/security/cron";
import { sql } from "@/lib/db";
import { deliver } from "@/lib/email";

/** Run every 10 minutes: retries failed transactional emails (max 5 attempts). */
export async function POST(req: Request) {
  if (!authorizeCron(req)) return new NextResponse("Unauthorized", { status: 401 });
  const rows = await sql<{ id: number }[]>`select id from email_outbox where status = 'failed' and attempts < 5 order by id limit 50`;
  for (const r of rows) await deliver(r.id);
  return NextResponse.json({ retried: rows.length });
}
