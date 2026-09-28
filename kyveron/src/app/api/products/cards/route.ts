import { NextResponse } from "next/server";
import { productsByIds } from "@/lib/catalog";
import { getPriceFormatter } from "@/lib/currency";

const UUID = /^[0-9a-f-]{36}$/i;

export async function GET(req: Request) {
  const ids = (new URL(req.url).searchParams.get("ids") ?? "").split(",").filter((i) => UUID.test(i)).slice(0, 8);
  const [cards, fmt] = await Promise.all([productsByIds(ids), getPriceFormatter()]);
  return NextResponse.json(cards.map((c) => ({ slug: c.slug, name: c.name, priceText: fmt.format(c.priceMinor), image: c.image?.url ?? null, alt: c.image?.alt ?? c.name })));
}
