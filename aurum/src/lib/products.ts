/**
 * Mock catalogue. In production this maps cleanly onto a Shopify Headless /
 * Stripe product feed — keep the shape and swap the source in `getProducts`.
 *
 * `tone` drives the editorial duotone placeholder so the grid looks
 * intentional before real campaign photography is dropped in (see ProductCard).
 */
export type ProductTone = "ink" | "champagne" | "graphite" | "olive" | "oxblood";

export type Product = {
  id: string;
  name: string;
  category: "Men" | "Women" | "Children";
  collection: "Best Sellers" | "New Arrivals" | "Limited Edition" | "Performance";
  price: number;
  badge?: string;
  tone: ProductTone;
  story: string;
  /** Optional real glTF model — rendered in the 3D atelier viewer. */
  modelUrl?: string;
};

export const products: Product[] = [
  {
    id: "aur-001",
    name: "Aurelian Oversized Tee",
    category: "Men",
    collection: "Best Sellers",
    price: 145,
    badge: "Best Seller",
    tone: "ink",
    story: "Heavyweight pima cotton, garment-dyed for a depth of black that never fades flat.",
  },
  {
    id: "aur-002",
    name: "Meridian Compression Top",
    category: "Men",
    collection: "Performance",
    price: 180,
    badge: "Performance",
    tone: "graphite",
    story: "Engineered seamless knit with zoned ventilation for elite output.",
  },
  {
    id: "aur-003",
    name: "Sovereign Premium Jogger",
    category: "Men",
    collection: "New Arrivals",
    price: 220,
    badge: "New",
    tone: "champagne",
    story: "Tapered Japanese loopback with a brushed interior and tonal hardware.",
  },
  {
    id: "aur-004",
    name: "Regalia Luxe Hoodie",
    category: "Men",
    collection: "Limited Edition",
    price: 320,
    badge: "Limited",
    tone: "olive",
    story: "Double-faced merino blend, finished with hand-set antique brass eyelets.",
  },
  {
    id: "aur-005",
    name: "Athena Sculpt Legging",
    category: "Women",
    collection: "Best Sellers",
    price: 165,
    badge: "Best Seller",
    tone: "ink",
    story: "Buttery compression that sculpts and holds through the most demanding sessions.",
  },
  {
    id: "aur-006",
    name: "Lustre Support Bra",
    category: "Women",
    collection: "Performance",
    price: 110,
    badge: "Performance",
    tone: "oxblood",
    story: "Architectural support with a whisper-soft, second-skin hand-feel.",
  },
  {
    id: "aur-007",
    name: "Mirabelle Premium Set",
    category: "Women",
    collection: "New Arrivals",
    price: 285,
    badge: "New",
    tone: "champagne",
    story: "A matched set in a sand-washed knit that moves like liquid.",
  },
  {
    id: "aur-008",
    name: "Cassia Lifestyle Jacket",
    category: "Women",
    collection: "Limited Edition",
    price: 410,
    badge: "Limited",
    tone: "graphite",
    story: "Water-repellent technical shell, tailored to a clean editorial silhouette.",
  },
  {
    id: "aur-009",
    name: "Velocity Pro Trainer",
    category: "Men",
    collection: "Performance",
    price: 295,
    badge: "3D Atelier",
    tone: "champagne",
    story:
      "A precision-engineered performance trainer with a sculpted last and tonal detailing. Explore every angle in our interactive 3D atelier before it reaches you.",
    modelUrl: "/models/aurum-sneaker.glb",
  },
];

export function getProducts() {
  return products;
}

export function getProductById(id: string) {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: Product["category"]) {
  return products.filter((p) => p.category === category);
}

export function getRelated(product: Product, limit = 4) {
  return products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .concat(products.filter((p) => p.id !== product.id && p.category !== product.category))
    .slice(0, limit);
}

export function getCollections() {
  return ["Best Sellers", "New Arrivals", "Limited Edition", "Performance"] as const;
}

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
