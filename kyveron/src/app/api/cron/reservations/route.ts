import { NextResponse } from "next/server";
import { authorizeCron } from "@/lib/security/cron";
import { releaseExpiredReservations } from "@/lib/orders/service";

/** Run every 5 minutes: releases lapsed stock holds and cancels orders unpaid for 24h. */
export async function POST(req: Request) {
  if (!authorizeCron(req)) return new NextResponse("Unauthorized", { status: 401 });
  return NextResponse.json(await releaseExpiredReservations());
}
