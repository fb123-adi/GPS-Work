import { NextResponse } from "next/server";
import { getProduct } from "@/lib/catalog";
import { getPriceFormatter } from "@/lib/currency";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const p = await getProduct(slug);
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const fmt = await getPriceFormatter();
  const min = Math.min(...p.variants.map((v) => v.priceMinor));
  return NextResponse.json({
    name: p.name,
    slug: p.slug,
    fit: p.fit,
    image: p.images[0] ? { url: p.images[0].url, alt: p.images[0].alt } : null,
    priceText: fmt.format(min),
    variants: p.variants.map((v) => ({ id: v.id, size: v.size, colour: v.colour, colourHex: v.colourHex, available: v.available, lowStock: v.lowStock })),
  });
}
