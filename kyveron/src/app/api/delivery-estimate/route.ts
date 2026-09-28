import { NextResponse } from "next/server";
import { estimateDelivery } from "@/lib/delivery";

export async function GET(req: Request) {
  const pin = new URL(req.url).searchParams.get("pin") ?? "";
  const r = estimateDelivery(pin);
  return NextResponse.json(r, { status: r.ok ? 200 : 400 });
}
