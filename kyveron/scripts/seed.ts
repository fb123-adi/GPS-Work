/**
 * Development seed: catalogue, collections, content pages, FAQs, journal,
 * exchange rates, and (optionally) a first super admin for the local auth
 * driver. Idempotent. Refuses to run when APP_ENV=production.
 *
 *   SEED_ADMIN_EMAIL=you@example.com SEED_ADMIN_PASSWORD='long passphrase' npm run db:seed
 *
 * With Supabase auth, create the admin through Supabase instead and grant the
 * role with scripts/grant-role.ts.
 */
import path from "node:path";
import postgres from "postgres";
import { hashPassword } from "../src/lib/auth/password";
import { writeEditorial, writePlate, type Garment } from "./placeholders";

const COLOURS: Record<string, string> = {
  Obsidian: "#1C1C1E", Ivory: "#EDE7DC", Graphite: "#3A3C42", Stone: "#AAA394",
  Cobalt: "#214C9A", Sage: "#8C9A86", Clay: "#9B6F5A", Navy: "#1F2A44", Oat: "#D8CBB5",
};

type Seed = {
  slug: string; name: string; subtitle: string; category: string; gender: "men" | "women" | "unisex";
  garment: Garment; price: number; compare?: number; colours: string[]; sizes: string[];
  material: string; care: string; fit: string; fitNotes: string; description: string;
  collections: string[]; featured?: boolean; performance?: boolean; stock?: number;
};

const TOP = ["XS", "S", "M", "L", "XL", "XXL"];
const W = ["XS", "S", "M", "L", "XL"];
const CARE_COTTON = "Machine wash cold, inside out, with similar colours. Do not bleach. Dry flat in shade. Warm iron on the reverse.";
const CARE_TECH = "Machine wash cold on a gentle cycle. No fabric softener, it blocks the wicking finish. Line dry. Do not iron the print or tape.";

const PRODUCTS: Seed[] = [
  { slug: "everyday-supima-tee", name: "Everyday Supima Tee", subtitle: "220 GSM long-staple cotton", category: "tees", gender: "unisex", garment: "tee", price: 2490, colours: ["Obsidian", "Ivory", "Stone", "Graphite"], sizes: TOP, material: "100% Supima cotton, 220 GSM single jersey", care: CARE_COTTON, fit: "Regular", fitNotes: "True to size. Size down for a closer fit.", description: "A heavyweight tee cut from long-staple Supima cotton. The collar is bound with a narrow rib that keeps its shape after washing, and the shoulder seam sits slightly forward so the sleeve falls clean.", collections: ["daily-uniform"], featured: true },
  { slug: "pique-knit-polo", name: "Piqué Knit Polo", subtitle: "Mercerised cotton piqué", category: "polos", gender: "men", garment: "polo", price: 3690, colours: ["Navy", "Ivory", "Obsidian"], sizes: TOP, material: "100% mercerised cotton piqué, 240 GSM", care: CARE_COTTON, fit: "Tailored", fitNotes: "Slim through the body. Size up if between sizes.", description: "Mercerised piqué with a two-button placket and a self-fabric collar that stays flat. Split side hems let it sit untucked without riding up.", collections: ["daily-uniform"], featured: true },
  { slug: "loopback-crew", name: "Loopback Crew", subtitle: "French terry, garment dyed", category: "sweats", gender: "unisex", garment: "crew", price: 4290, colours: ["Oat", "Graphite", "Sage"], sizes: TOP, material: "100% cotton French terry, 360 GSM", care: CARE_COTTON, fit: "Relaxed", fitNotes: "Roomy through the chest. Take your usual size.", description: "A 360 GSM loopback crew, garment dyed after sewing so each piece carries a slightly different depth of colour. Ribbed cuffs and hem hold their stretch.", collections: ["daily-uniform", "travel"] },
  { slug: "heavyweight-hoodie", name: "Heavyweight Hoodie", subtitle: "Brushed fleece, double-lined hood", category: "sweats", gender: "unisex", garment: "hoodie", price: 5490, colours: ["Obsidian", "Stone", "Navy"], sizes: TOP, material: "80% cotton, 20% polyester brushed fleece, 420 GSM", care: CARE_COTTON, fit: "Relaxed", fitNotes: "Dropped shoulder. Size down for a regular fit.", description: "Brushed fleece at 420 GSM with a double-lined hood that holds its shape. No drawcords, so nothing snags or pulls through in the wash.", collections: ["daily-uniform", "travel"], featured: true },
  { slug: "tapered-travel-jogger", name: "Tapered Travel Jogger", subtitle: "Four-way stretch twill", category: "bottoms", gender: "men", garment: "jogger", price: 4890, colours: ["Obsidian", "Graphite", "Navy"], sizes: ["28", "30", "32", "34", "36", "38"], material: "88% nylon, 12% elastane stretch twill", care: CARE_TECH, fit: "Tapered", fitNotes: "Mid-rise. Inseam 29 in on size 32.", description: "A jogger that passes for a trouser. Four-way stretch twill, a zipped rear pocket for your phone, and a gusset that lets you sit cross-legged on a long flight.", collections: ["travel", "performance"], performance: true },
  { slug: "aero-training-tee", name: "Aero Training Tee", subtitle: "Recycled polyester mesh", category: "performance-tops", gender: "men", garment: "tee", price: 2890, colours: ["Obsidian", "Cobalt", "Ivory"], sizes: TOP, material: "92% recycled polyester, 8% elastane, laser-perforated back panel", care: CARE_TECH, fit: "Athletic", fitNotes: "Close through the chest and arms. Size up for a relaxed fit.", description: "A training tee with a perforated back panel where heat builds first. Flatlock seams sit flat under a pack strap.", collections: ["performance"], featured: true, performance: true },
  { slug: "stride-run-short", name: "Stride Run Short", subtitle: "5 in, lined", category: "bottoms", gender: "men", garment: "short", price: 2690, colours: ["Obsidian", "Cobalt", "Graphite"], sizes: ["S", "M", "L", "XL"], material: "100% recycled polyester woven shell, mesh liner", care: CARE_TECH, fit: "Athletic", fitNotes: "5 in inseam. True to size.", description: "A light woven run short with a brief liner, a rear zip pocket that holds a key and a card, and reflective details at the hem for early starts.", collections: ["performance"], performance: true },
  { slug: "sculpt-legging", name: "Sculpt Legging", subtitle: "High-rise, 7/8 length", category: "bottoms", gender: "women", garment: "legging", price: 3990, colours: ["Obsidian", "Navy", "Clay"], sizes: W, material: "76% nylon, 24% elastane, 280 GSM interlock", care: CARE_TECH, fit: "Compressive", fitNotes: "Firm hold. If between sizes, size up.", description: "A high-rise legging with a wide waistband designed to stay put through squats. Side pockets fit a large phone.", collections: ["performance", "studio"], featured: true, performance: true },
  { slug: "studio-rib-tank", name: "Studio Rib Tank", subtitle: "Modal rib", category: "tops", gender: "women", garment: "tank", price: 2290, colours: ["Ivory", "Obsidian", "Sage"], sizes: W, material: "92% modal, 8% elastane 2x1 rib", care: CARE_COTTON, fit: "Fitted", fitNotes: "Close fit. Take your usual size.", description: "A fitted tank in soft modal rib with a scooped back. Layers under a shirt or works alone in the studio.", collections: ["studio", "daily-uniform"] },
  { slug: "womens-boxy-tee", name: "Boxy Supima Tee", subtitle: "Cropped, 220 GSM", category: "tees", gender: "women", garment: "tee", price: 2390, colours: ["Ivory", "Obsidian", "Oat"], sizes: W, material: "100% Supima cotton, 220 GSM single jersey", care: CARE_COTTON, fit: "Boxy", fitNotes: "Cropped at the high hip. Size down for less volume.", description: "Our Supima jersey in a boxy, slightly cropped shape that sits at the high hip, so it works with high-rise trousers and leggings alike.", collections: ["daily-uniform", "studio"] },
  { slug: "featherweight-shell", name: "Featherweight Shell", subtitle: "Packable wind jacket", category: "outerwear", gender: "unisex", garment: "jacket", price: 7990, compare: 9490, colours: ["Graphite", "Stone", "Cobalt"], sizes: TOP, material: "100% nylon ripstop, 40 g/m², DWR finish (PFC-free)", care: CARE_TECH, fit: "Regular", fitNotes: "Room for a mid layer. True to size.", description: "A wind shell that packs into its own chest pocket. The DWR finish sheds light drizzle; it is not a rain jacket. Two-way zip and a hood that follows your head when you turn.", collections: ["performance", "travel"], featured: true, performance: true },
  { slug: "merino-base-crew", name: "Merino Base Crew", subtitle: "17.5 micron merino", category: "performance-tops", gender: "unisex", garment: "crew", price: 5990, colours: ["Obsidian", "Navy"], sizes: TOP, material: "100% superfine merino wool, 190 GSM", care: "Hand wash or wool cycle, cold. Dry flat. Do not tumble dry.", fit: "Fitted", fitNotes: "Close to the body for layering. True to size.", description: "A superfine merino base layer. Merino wool naturally helps regulate temperature and resists odour, which makes it useful on the road.", collections: ["travel", "performance"], performance: true, stock: 2 },
  { slug: "wide-leg-lounge-pant", name: "Wide-Leg Lounge Pant", subtitle: "Brushed modal blend", category: "bottoms", gender: "women", garment: "jogger", price: 3990, colours: ["Oat", "Graphite"], sizes: W, material: "60% modal, 35% cotton, 5% elastane", care: CARE_COTTON, fit: "Wide", fitNotes: "Full-length on 5 ft 6 in. Elastic waist with internal drawcord.", description: "A soft wide-leg pant in brushed modal with a flat front waistband that looks finished under a tucked tee.", collections: ["studio", "travel"] },
  { slug: "court-pique-dress", name: "Court Piqué Polo", subtitle: "Women's fit", category: "polos", gender: "women", garment: "polo", price: 3490, colours: ["Ivory", "Navy"], sizes: W, material: "100% mercerised cotton piqué", care: CARE_COTTON, fit: "Fitted", fitNotes: "Shaped through the waist. True to size.", description: "The piqué polo, shaped for a closer fit with a shorter placket and a slightly cropped length.", collections: ["daily-uniform"] },
  { slug: "tempo-tank", name: "Tempo Training Tank", subtitle: "Open-knit mesh", category: "performance-tops", gender: "men", garment: "tank", price: 2190, colours: ["Obsidian", "Cobalt"], sizes: TOP, material: "100% recycled polyester open-knit", care: CARE_TECH, fit: "Athletic", fitNotes: "Deep armholes. True to size.", description: "An open-knit training tank with dropped armholes for full shoulder movement on overhead lifts.", collections: ["performance"], performance: true },
  { slug: "fleece-short", name: "Fleece Lounge Short", subtitle: "7 in, French terry", category: "bottoms", gender: "unisex", garment: "short", price: 2790, compare: 3290, colours: ["Oat", "Graphite", "Obsidian"], sizes: ["S", "M", "L", "XL"], material: "100% cotton French terry, 340 GSM", care: CARE_COTTON, fit: "Regular", fitNotes: "7 in inseam. True to size.", description: "A French terry short with deep side pockets and a flat drawcord that stays inside the waistband.", collections: ["daily-uniform"], stock: 0 },
];

const COLLECTIONS = [
  { slug: "daily-uniform", title: "The Daily Uniform", description: "Heavyweight cotton basics made to be worn often and washed often. The pieces you reach for first." },
  { slug: "performance", title: "Performance", description: "Training and running pieces built around heat, sweat, and movement." },
  { slug: "travel", title: "Travel", description: "Layers that pack small, resist creases, and look composed after a long flight." },
  { slug: "studio", title: "Studio", description: "Soft, close-fitting pieces for yoga, pilates, and the hours either side." },
];

const CATEGORIES = [
  ["tees", "T-shirts"], ["polos", "Polos"], ["sweats", "Sweats and hoodies"], ["tops", "Tops"],
  ["performance-tops", "Performance tops"], ["bottoms", "Bottoms"], ["outerwear", "Outerwear"],
];

const LEGAL = [
  ["terms", "Terms and Conditions"], ["privacy", "Privacy Policy"], ["cookies", "Cookie Policy"],
  ["shipping", "Shipping Policy"], ["returns-policy", "Returns and Exchanges Policy"],
  ["refunds", "Refund Policy"], ["cancellation", "Cancellation Policy"],
  ["payments", "Payment and Billing"], ["grievance", "Contact and Grievance Redressal"],
];

function legalBody(title: string) {
  return `> DRAFT. This page is a structural placeholder and is not legal advice. It must be written or reviewed by a qualified Indian lawyer before launch. Kyveron does not claim compliance with any law on the basis of this text.

## Who we are
[Registered legal entity name], [registered address]. GSTIN [GSTIN]. Contact: support@kyveron.example, +91 00000 00000.

## Scope
[Describe what this ${title.toLowerCase()} covers.]

## Details
[Owner to supply the terms that apply to Kyveron's actual operations, including timelines, fees, exclusions, and how customers can raise a concern.]

## Changes to this page
We will post changes here with a new version number and effective date.`;
}

async function main() {
  if (process.env.APP_ENV === "production") throw new Error("Seed refuses to run in production");
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const sql = postgres(url, { max: 1, onnotice: () => {} });
  const mediaDir = path.join(process.cwd(), "public", "media", "placeholder");

  try {
    for (const [i, [slug, name]] of CATEGORIES.entries()) {
      await sql`insert into categories (slug, name, sort_order) values (${slug}, ${name}, ${i})
        on conflict (slug) do update set name = excluded.name`;
    }
    for (const [i, c] of COLLECTIONS.entries()) {
      await writeEditorial(mediaDir, `collection-${c.slug}`, ["#303238", "#1F2A44", "#5C574D", "#6B6F66"][i]);
      await sql`insert into collections (slug, title, description, banner_url, banner_alt, status, sort_order)
        values (${c.slug}, ${c.title}, ${c.description}, ${`/media/placeholder/collection-${c.slug}.webp`},
                ${"Placeholder banner: replace with campaign photography"}, 'published', ${i})
        on conflict (slug) do update set title = excluded.title, description = excluded.description`;
    }
    await writeEditorial(mediaDir, "hero", "#2A2B30", 2400, 1500);
    await writeEditorial(mediaDir, "editorial-1", "#3A3C42", 1600, 2000);
    await writeEditorial(mediaDir, "editorial-2", "#5C574D", 1600, 2000);

    for (const [pi, p] of PRODUCTS.entries()) {
      const [cat] = await sql`select id from categories where slug = ${p.category}`;
      const [prod] = await sql`
        insert into products (slug, name, subtitle, description, category_id, gender, material, care, fit, fit_notes,
          status, is_featured, is_performance, seo_title, seo_description, publish_at, created_at)
        values (${p.slug}, ${p.name}, ${p.subtitle}, ${p.description}, ${cat.id}, ${p.gender}, ${p.material}, ${p.care},
          ${p.fit}, ${p.fitNotes}, 'published', ${!!p.featured}, ${!!p.performance},
          ${`${p.name} | Kyveron`}, ${p.description.slice(0, 155)}, now() - interval '1 day',
          now() - make_interval(days => ${PRODUCTS.length - pi}))
        on conflict (slug) do update set name = excluded.name, description = excluded.description
        returning id`;
      await sql`delete from product_images where product_id = ${prod.id}`;
      let order = 0;
      for (const colour of p.colours) {
        const hex = COLOURS[colour];
        const base = `${p.slug}-${colour.toLowerCase()}`;
        await writePlate(mediaDir, `${base}-front`, p.garment, hex, "front");
        await writePlate(mediaDir, `${base}-detail`, p.garment, hex, "detail");
        for (const v of ["front", "detail"] as const) {
          await sql`insert into product_images (product_id, url, alt, colour, width, height, sort_order)
            values (${prod.id}, ${`/media/placeholder/${base}-${v}.webp`},
              ${`${p.name} in ${colour}, ${v === "front" ? "front view" : "fabric detail"} (placeholder image)`},
              ${colour}, 1200, 1500, ${order++})`;
        }
        for (const [si, size] of p.sizes.entries()) {
          const sku = `KV-${p.slug.split("-").map((w) => w[0]).join("").toUpperCase()}-${colour.slice(0, 3).toUpperCase()}-${size}`;
          const stock = p.stock ?? ((pi * 7 + si * 3 + colour.length) % 9) + 2;
          await sql`insert into product_variants (product_id, sku, size, colour, colour_hex, price_minor, compare_at_minor,
              cost_minor, stock_on_hand, sort_order)
            values (${prod.id}, ${sku}, ${size}, ${colour}, ${hex}, ${p.price * 100}, ${p.compare ? p.compare * 100 : null},
              ${Math.round(p.price * 100 * 0.38)}, ${stock}, ${si})
            on conflict (sku) do nothing`;
        }
      }
      for (const cslug of p.collections) {
        await sql`insert into collection_products (collection_id, product_id, sort_order)
          select id, ${prod.id}, ${pi} from collections where slug = ${cslug} on conflict do nothing`;
      }
    }
    await sql`insert into inventory_movements (variant_id, delta, reason, note, stock_after)
      select v.id, v.stock_on_hand, 'initial', 'Seed stock', v.stock_on_hand from product_variants v
      where not exists (select 1 from inventory_movements m where m.variant_id = v.id)`;

    for (const [slug, title] of LEGAL) {
      await sql`insert into content_pages (slug, title, body) values (${slug}, ${title}, ${legalBody(title)})
        on conflict (slug) do nothing`;
    }
    await sql`insert into content_pages (slug, title, body, needs_legal_review) values
      ('size-guide', 'Size Guide', ${"Measurements are body measurements in centimetres. TODO(owner): replace with measured garment specifications for each block."}, false),
      ('about', 'About Kyveron', ${"Kyveron makes daily wear and training clothes in India. We start with the fabric, choose fewer styles, and make them properly."}, false)
      on conflict (slug) do nothing`;

    const faqs = [
      ["Orders", "When will my order ship?", "Orders placed before 14:00 IST on a working day usually leave our warehouse the same day. You will get an email with a tracking link when it ships."],
      ["Orders", "Can I change or cancel my order?", "You can request a cancellation from your account or the order tracking page until the order is packed. After that, you can return it once it arrives."],
      ["Payments", "Which payment methods do you accept?", "UPI, credit and debit cards, net banking, and wallets through Razorpay. Cash on delivery is not offered at the moment."],
      ["Payments", "My payment failed but money left my account.", "Failed payments are reversed by your bank, usually within 5 to 7 working days. Your order is never marked paid unless we receive confirmation from the payment provider."],
      ["Returns", "What is your return window?", "14 days from delivery for unworn items with tags attached. Start a return from the Returns page."],
      ["Sizing", "How do I choose a size?", "Each product page lists its fit and notes on how it runs. The size guide has body measurements for every size."],
    ];
    for (const [i, [topic, q, a]] of faqs.entries()) {
      await sql`insert into faqs (topic, question, answer, sort_order)
        select ${topic}, ${q}, ${a}, ${i} where not exists (select 1 from faqs where question = ${q})`;
    }

    const posts = [
      ["how-to-read-gsm", "How to read GSM on a label", "A plain guide to fabric weight and what it means for how a tee drapes and lasts."],
      ["dressing-for-humidity", "Dressing for training in humidity", "What actually helps when the air is already wet: fibre, weave, and fit."],
      ["packing-for-a-week-in-one-bag", "A week in one bag", "Six pieces, three climates, one carry-on. How we pack for a work trip."],
    ];
    for (const [i, [slug, title, excerpt]] of posts.entries()) {
      await sql`insert into journal_posts (slug, title, excerpt, body, cover_url, cover_alt, author_name, status, published_at, seo_description)
        values (${slug}, ${title}, ${excerpt},
          ${`${excerpt}\n\n## Placeholder article\nThis article is sample content so the journal renders. Replace it from Admin, Content, Journal.`},
          ${`/media/placeholder/editorial-${(i % 2) + 1}.webp`}, ${"Placeholder editorial image"}, 'Kyveron Studio',
          'published', now() - make_interval(days => ${i * 9 + 2}), ${excerpt})
        on conflict (slug) do nothing`;
    }

    // Display-only rates. TODO(owner): connect a rate source before enabling multi-currency checkout.
    for (const [c, r] of [["INR", 1], ["USD", 0.0119], ["EUR", 0.0107], ["GBP", 0.0089], ["AED", 0.0437]] as const) {
      await sql`insert into exchange_rates (currency, rate_from_inr, source) values (${c}, ${r}, 'seed-manual')
        on conflict (currency) do nothing`;
    }

    await sql`insert into coupons (code, description, kind, value, min_subtotal_minor, first_order_only, per_customer_limit)
      values ('WELCOME10', '10% off a first order over ₹2,000 (sample)', 'percent', 10, 200000, true, 1)
      on conflict (code) do nothing`;

    await sql`insert into content_blocks (key, data) values ('home', ${sql.json({
      heroHeadline: "Made for the hours you move.",
      heroSub: "Daily wear and training pieces in considered fabrics. Made in India.",
    })}) on conflict (key) do nothing`;

    const email = process.env.SEED_ADMIN_EMAIL;
    const password = process.env.SEED_ADMIN_PASSWORD;
    if (email && password) {
      if (password.length < 12) throw new Error("SEED_ADMIN_PASSWORD must be at least 12 characters");
      const [u] = await sql`insert into users (email, email_verified_at, auth_provider) values (${email}, now(), 'email')
        on conflict (email) do update set email = excluded.email returning id`;
      await sql`insert into profiles (user_id, full_name) values (${u.id}, 'Store Admin') on conflict do nothing`;
      await sql`insert into local_credentials (user_id, password_hash) values (${u.id}, ${await hashPassword(password)})
        on conflict (user_id) do update set password_hash = excluded.password_hash`;
      await sql`insert into user_roles (user_id, role) values (${u.id}, 'super_admin') on conflict do nothing`;
      console.log(`super_admin ready: ${email}`);
    }
    console.log("seed complete");
  } finally {
    await sql.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
