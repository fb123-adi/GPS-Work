/**
 * Product photography system for the Kyveron catalogue.
 *
 * One source of truth for every product image: what the garment is, how it
 * must look in every view, the exact prompt used to generate it, the file it
 * lands in, and the alt text customers hear. `scripts/import-images.ts` maps
 * these files onto products in the database.
 *
 * Asset priority: (1) real photos supplied by the owner, (2) approved
 * renders, (3) cleaned-up supplied assets, (4) generated photography only
 * where nothing real exists. Generated files are marked `generated: true`
 * and must be replaced with real photography of the actual garments before
 * the site claims to show inventory.
 */

export type View = "front" | "back" | "detail" | "lifestyle";

export type ProductSpec = {
  slug: string;
  name: string;
  category: string;
  garment: string;
  /** Material and how its surface should read on camera. */
  material: string;
  fit: string;
  /** Construction details that must stay identical in every view. */
  details: string;
  /** Brand mark: Kyveron garments carry no visible logo on the outside. */
  brandMark: string;
  /** Colourways exactly as sold. The first is the hero colour. */
  colours: { name: string; description: string }[];
  presentation: "ghost-mannequin" | "flat-lay";
  lifestyle?: string;
};

// House style shared by every catalogue image.
export const HOUSE = {
  background: "seamless warm ivory studio sweep (#F2EEE6), very subtle floor gradient",
  lighting: "large soft key light from upper left, gentle fill from right, soft natural contact shadow beneath the garment",
  camera: "premium commercial e-commerce product photograph, 85mm lens perspective, sharp fabric texture, accurate colour, clean edges",
  crop: "4:5 portrait, garment centred with generous even margin on all sides, nothing cropped (sleeves, hem, collar, cuffs fully in frame)",
  negatives: "No text, no lettering, no logos, no watermark, no extra garments, no duplicate products, no hanger, no props, no people unless specified, no illustration, no cartoon, no malformed fabric, no distorted anatomy.",
};

export const CATALOGUE: ProductSpec[] = [
  { slug: "everyday-supima-tee", name: "Everyday Supima Tee", category: "T-shirts", garment: "short-sleeve crew-neck T-shirt",
    material: "heavyweight 220 GSM Supima cotton single jersey with a dense, smooth matte surface", fit: "regular fit, shoulder seam slightly forward, straight hem",
    details: "narrow 1x1 ribbed crew collar, double-needle cover-stitched hem and sleeve openings, sleeves ending mid-bicep", brandMark: "no visible branding",
    colours: [{ name: "Obsidian", description: "near-black charcoal (#1C1C1E)" }, { name: "Ivory", description: "warm off-white (#EDE7DC)" }, { name: "Stone", description: "warm grey-beige (#AAA394)" }, { name: "Graphite", description: "dark slate grey (#3A3C42)" }],
    presentation: "ghost-mannequin", lifestyle: "worn by a man in his thirties leaning against a sunlit concrete wall in an Indian city courtyard, morning light" },
  { slug: "pique-knit-polo", name: "Piqué Knit Polo", category: "Polos", garment: "short-sleeve polo shirt",
    material: "mercerised cotton piqué, 240 GSM, fine honeycomb texture with a soft sheen", fit: "tailored, slim through the body, split side hems",
    details: "self-fabric flat collar, two-button placket with matte tonal buttons, ribbed sleeve cuffs", brandMark: "no visible branding",
    colours: [{ name: "Navy", description: "deep navy (#1F2A44)" }, { name: "Ivory", description: "warm off-white (#EDE7DC)" }, { name: "Obsidian", description: "near-black (#1C1C1E)" }],
    presentation: "ghost-mannequin", lifestyle: "worn by a man walking through a leafy Bengaluru street, late afternoon light, relaxed" },
  { slug: "loopback-crew", name: "Loopback Crew", category: "Sweats and hoodies", garment: "long-sleeve crew-neck sweatshirt",
    material: "360 GSM garment-dyed cotton French terry, soft slightly mottled surface", fit: "relaxed, roomy chest, dropped shoulder",
    details: "ribbed crew collar, ribbed cuffs and hem, set-in raglan-free shoulder seams", brandMark: "no visible branding",
    colours: [{ name: "Oat", description: "light oatmeal beige (#D8CBB5)" }, { name: "Graphite", description: "dark slate grey (#3A3C42)" }, { name: "Sage", description: "muted grey-green (#8C9A86)" }],
    presentation: "flat-lay" },
  { slug: "heavyweight-hoodie", name: "Heavyweight Hoodie", category: "Sweats and hoodies", garment: "pullover hoodie",
    material: "420 GSM brushed cotton-blend fleece, dense and matte", fit: "relaxed, dropped shoulder",
    details: "double-lined hood with no drawcords, kangaroo front pocket, ribbed cuffs and hem", brandMark: "no visible branding",
    colours: [{ name: "Obsidian", description: "near-black (#1C1C1E)" }, { name: "Stone", description: "warm grey-beige (#AAA394)" }, { name: "Navy", description: "deep navy (#1F2A44)" }],
    presentation: "ghost-mannequin", lifestyle: "worn by a woman sitting on steps outside a modern apartment block at dusk, calm, hood down" },
  { slug: "tapered-travel-jogger", name: "Tapered Travel Jogger", category: "Bottoms", garment: "tapered jogger trousers",
    material: "four-way stretch nylon-elastane twill with a smooth technical matte finish", fit: "tapered leg, mid-rise",
    details: "flat elastic waistband with internal drawcord, slanted side pockets, zipped rear pocket, cuffed ankle", brandMark: "no visible branding",
    colours: [{ name: "Obsidian", description: "near-black (#1C1C1E)" }, { name: "Graphite", description: "dark slate grey (#3A3C42)" }, { name: "Navy", description: "deep navy (#1F2A44)" }],
    presentation: "flat-lay" },
  { slug: "aero-training-tee", name: "Aero Training Tee", category: "Performance tops", garment: "short-sleeve training T-shirt",
    material: "recycled polyester-elastane performance knit, fine technical texture, laser-perforated panel across the upper back", fit: "athletic, close through chest and arms",
    details: "crew neck, flatlock seams visible as flat stitched lines, raw-cut hem", brandMark: "no visible branding",
    colours: [{ name: "Obsidian", description: "near-black (#1C1C1E)" }, { name: "Cobalt", description: "deep cobalt blue (#214C9A)" }, { name: "Ivory", description: "warm off-white (#EDE7DC)" }],
    presentation: "ghost-mannequin", lifestyle: "worn by a runner mid-stride on an early-morning seafront promenade in Mumbai, soft haze" },
  { slug: "stride-run-short", name: "Stride Run Short", category: "Bottoms", garment: "5-inch lined running shorts",
    material: "lightweight recycled polyester woven shell", fit: "athletic, 5 inch inseam",
    details: "elastic waistband, rear zip pocket, small reflective hem detail, split side hem", brandMark: "no visible branding",
    colours: [{ name: "Obsidian", description: "near-black (#1C1C1E)" }, { name: "Cobalt", description: "deep cobalt blue (#214C9A)" }, { name: "Graphite", description: "dark slate grey (#3A3C42)" }],
    presentation: "flat-lay" },
  { slug: "sculpt-legging", name: "Sculpt Legging", category: "Bottoms", garment: "high-rise 7/8 leggings",
    material: "280 GSM nylon-elastane interlock with a smooth matte compressive surface", fit: "high-rise, 7/8 length, compressive",
    details: "wide high waistband, deep side phone pockets on both thighs, flat seams", brandMark: "no visible branding",
    colours: [{ name: "Obsidian", description: "near-black (#1C1C1E)" }, { name: "Navy", description: "deep navy (#1F2A44)" }, { name: "Clay", description: "muted terracotta brown (#9B6F5A)" }],
    presentation: "ghost-mannequin", lifestyle: "worn by a woman stretching in a bright minimal studio with pale wooden floor, morning light" },
  { slug: "studio-rib-tank", name: "Studio Rib Tank", category: "Tops", garment: "fitted ribbed tank top",
    material: "modal-elastane 2x1 rib, soft fine vertical ribbing", fit: "fitted, close to the body",
    details: "scoop neckline, scooped racer-free back, narrow shoulder straps", brandMark: "no visible branding",
    colours: [{ name: "Ivory", description: "warm off-white (#EDE7DC)" }, { name: "Obsidian", description: "near-black (#1C1C1E)" }, { name: "Sage", description: "muted grey-green (#8C9A86)" }],
    presentation: "ghost-mannequin" },
  { slug: "womens-boxy-tee", name: "Boxy Supima Tee", category: "T-shirts", garment: "boxy cropped short-sleeve T-shirt",
    material: "220 GSM Supima cotton single jersey, smooth matte surface", fit: "boxy, cropped at the high hip, wide body",
    details: "ribbed crew collar, dropped shoulder, wide short sleeves", brandMark: "no visible branding",
    colours: [{ name: "Ivory", description: "warm off-white (#EDE7DC)" }, { name: "Obsidian", description: "near-black (#1C1C1E)" }, { name: "Oat", description: "light oatmeal beige (#D8CBB5)" }],
    presentation: "flat-lay" },
  { slug: "featherweight-shell", name: "Featherweight Shell", category: "Outerwear", garment: "packable hooded wind jacket",
    material: "40 g/m² nylon ripstop with a faint grid texture and slight sheen", fit: "regular, room for a mid layer",
    details: "full-length two-way front zip, adjustable hood, zipped chest pocket, elasticated cuffs, drop-back hem", brandMark: "no visible branding",
    colours: [{ name: "Graphite", description: "dark slate grey (#3A3C42)" }, { name: "Stone", description: "warm grey-beige (#AAA394)" }, { name: "Cobalt", description: "deep cobalt blue (#214C9A)" }],
    presentation: "ghost-mannequin", lifestyle: "worn open by a man on a misty hill trail in the Western Ghats, overcast soft light" },
  { slug: "merino-base-crew", name: "Merino Base Crew", category: "Performance tops", garment: "long-sleeve fitted base-layer crew",
    material: "190 GSM superfine merino wool jersey, fine soft knit", fit: "fitted, close to the body",
    details: "crew neck, flatlock seams, thumb-free plain cuffs", brandMark: "no visible branding",
    colours: [{ name: "Obsidian", description: "near-black (#1C1C1E)" }, { name: "Navy", description: "deep navy (#1F2A44)" }],
    presentation: "ghost-mannequin" },
  { slug: "wide-leg-lounge-pant", name: "Wide-Leg Lounge Pant", category: "Bottoms", garment: "wide-leg lounge trousers",
    material: "brushed modal-cotton blend with a soft peached drape", fit: "wide leg, full length",
    details: "flat front waistband with internal drawcord, side seam pockets", brandMark: "no visible branding",
    colours: [{ name: "Oat", description: "light oatmeal beige (#D8CBB5)" }, { name: "Graphite", description: "dark slate grey (#3A3C42)" }],
    presentation: "flat-lay" },
  { slug: "court-pique-dress", name: "Court Piqué Polo", category: "Polos", garment: "women's fitted short-sleeve polo shirt",
    material: "mercerised cotton piqué with a fine honeycomb texture", fit: "fitted, shaped through the waist, slightly cropped",
    details: "flat collar, short two-button placket with tonal buttons, ribbed cuffs", brandMark: "no visible branding",
    colours: [{ name: "Ivory", description: "warm off-white (#EDE7DC)" }, { name: "Navy", description: "deep navy (#1F2A44)" }],
    presentation: "ghost-mannequin" },
  { slug: "tempo-tank", name: "Tempo Training Tank", category: "Performance tops", garment: "men's training tank top",
    material: "recycled polyester open-knit mesh, visible fine open weave", fit: "athletic, deep dropped armholes",
    details: "crew neck, bound armholes, straight hem", brandMark: "no visible branding",
    colours: [{ name: "Obsidian", description: "near-black (#1C1C1E)" }, { name: "Cobalt", description: "deep cobalt blue (#214C9A)" }],
    presentation: "ghost-mannequin" },
  { slug: "fleece-short", name: "Fleece Lounge Short", category: "Bottoms", garment: "7-inch French terry lounge shorts",
    material: "340 GSM cotton French terry, soft matte surface", fit: "regular, 7 inch inseam",
    details: "elastic waistband with flat drawcord kept inside, deep side pockets", brandMark: "no visible branding",
    colours: [{ name: "Oat", description: "light oatmeal beige (#D8CBB5)" }, { name: "Graphite", description: "dark slate grey (#3A3C42)" }, { name: "Obsidian", description: "near-black (#1C1C1E)" }],
    presentation: "flat-lay" },
];

export function fileName(slug: string, colour: string, view: View) {
  return `${slug}-${colour.toLowerCase()}-${view}.webp`;
}

export function presentationText(p: ProductSpec) {
  return p.presentation === "ghost-mannequin"
    ? "shown on an invisible ghost mannequin so the garment holds its natural three-dimensional shape"
    : "neatly styled flat-lay shot from directly above, garment smoothed with natural soft folds";
}

/** The exact prompt for one catalogue image. */
export function promptFor(p: ProductSpec, colourIndex: number, view: View): string {
  const c = p.colours[colourIndex];
  const base = `Realistic premium e-commerce product photograph of the ${p.name}, a ${p.garment} made from ${p.material}, in ${c.name.toLowerCase()}: ${c.description}. ${p.fit}. Details: ${p.details}. ${p.brandMark}.`;
  const views: Record<View, string> = {
    front: `Clean front view, ${presentationText(p)}. Preserve exact construction, proportions, seams, collar, sleeves and pockets.`,
    back: `Clean back view of the same garment, ${presentationText(p)}. Identical colour, fabric and proportions to the front view.`,
    detail: `Close-up macro detail of the fabric texture and construction (stitching, rib, seam finish) of this exact garment, filling the frame, shallow depth of field.`,
    lifestyle: `Lifestyle photograph: ${p.lifestyle ?? "worn naturally in a calm real-world setting"}. The garment is clearly visible and the hero of the image, accurate colour and fit, natural anatomy, editorial fashion photography, candid, not posed stiffly.`,
  };
  const setting = view === "lifestyle" || view === "detail"
    ? HOUSE.camera
    : `Lighting: ${HOUSE.lighting}. Background: ${HOUSE.background}. Composition: ${HOUSE.crop}. Camera: ${HOUSE.camera}.`;
  return `${base} ${views[view]} ${setting} No random redesign. ${HOUSE.negatives}`;
}

export function altFor(p: ProductSpec, colourIndex: number, view: View): string {
  const c = p.colours[colourIndex].name;
  const g = `${p.name} in ${c}`;
  return {
    front: `${g}, ${p.garment} with ${p.details.split(",")[0]}, shown from the front`,
    back: `${g}, shown from the back`,
    detail: `Close-up of the ${p.material.split(",")[0]} and stitching on the ${p.name}`,
    lifestyle: `${g} ${p.lifestyle ? p.lifestyle.replace(/^worn/, "worn") : "worn outdoors"}`,
  }[view];
}

/** Which images the catalogue needs (front per colourway; back and detail for the hero colour; lifestyle where specified). */
export function plan() {
  const out: { slug: string; colour: string; colourIndex: number; view: View; file: string }[] = [];
  for (const p of CATALOGUE) {
    p.colours.forEach((c, i) => out.push({ slug: p.slug, colour: c.name, colourIndex: i, view: "front", file: fileName(p.slug, c.name, "front") }));
    out.push({ slug: p.slug, colour: p.colours[0].name, colourIndex: 0, view: "back", file: fileName(p.slug, p.colours[0].name, "back") });
    out.push({ slug: p.slug, colour: p.colours[0].name, colourIndex: 0, view: "detail", file: fileName(p.slug, p.colours[0].name, "detail") });
    if (p.lifestyle) out.push({ slug: p.slug, colour: p.colours[0].name, colourIndex: 0, view: "lifestyle", file: fileName(p.slug, p.colours[0].name, "lifestyle") });
  }
  return out;
}
