/* AURUM catalog — deterministic data layer.
   Every product derives stable attributes (price, colorways, fabric,
   provenance, capsule) from its position, so ids survive reloads. */

const LINES = [
  "Sovereign", "Regent", "Meridian", "Vanta", "Aurelius", "Monarch",
  "Atlas", "Onyx", "Imperial", "Caldera", "Tempest", "Legacy",
];

const FABRICS = [
  ["Merino wool", "Biella, Italy"],
  ["Egyptian cotton", "Giza, Egypt"],
  ["Recycled performance knit", "Kyoto, Japan"],
  ["Bamboo jersey", "Fukuoka, Japan"],
  ["Waterproof shell", "Zürich, Switzerland"],
  ["Thermal fleece", "Trondheim, Norway"],
  ["Luxury knit", "Como, Italy"],
  ["Technical mesh", "Seoul, Korea"],
];

const COLORWAYS = [
  { id: "noir",     name: "Noir / Gold",     stroke: "#D4AF37", hex: "#141310" },
  { id: "ivory",    name: "Ivory",           stroke: "#EAE3D2", hex: "#EAE3D2" },
  { id: "emerald",  name: "Emerald",         stroke: "#2F9E77", hex: "#14523C" },
  { id: "burgundy", name: "Royal Burgundy",  stroke: "#B04A5A", hex: "#5C1F2A" },
  { id: "sapphire", name: "Sapphire",        stroke: "#5B7FD4", hex: "#22345F" },
  { id: "titanium", name: "Titanium Silver", stroke: "#C9CCD4", hex: "#8A8E98" },
];

const CAPSULES = [
  "Royal Collection", "Executive Collection", "Elite Collection", "Heritage Collection",
  "Limited Edition", "Signature Gold", "Black Label", "Performance Elite",
  "Travel Collection", "Winter Collection", "Summer Collection", "Training Collection",
  "Recovery Collection", "Championship Collection",
];

/* item: [display name, silhouette, price band, group]
   bands: 1 accessories · 2 tops · 3 bottoms · 4 outerwear · 5 kits/sets · 6 bags · 7 footwear */
const MEN = [
  ["Hoodie", "hoodie", 2, "Tops"], ["Sweatshirt", "sweatshirt", 2, "Tops"],
  ["Polo", "polo", 2, "Tops"], ["T-Shirt", "tee", 2, "Tops"],
  ["Oversized Tee", "oversizedTee", 2, "Tops"], ["Tank Top", "tank", 2, "Tops"],
  ["Compression Shirt", "compression", 2, "Performance"], ["Compression Shorts", "shorts", 3, "Performance"],
  ["Joggers", "joggers", 3, "Bottoms"], ["Track Pants", "joggers", 3, "Bottoms"],
  ["Cargo Joggers", "cargo", 3, "Bottoms"], ["Shorts", "shorts", 3, "Bottoms"],
  ["Running Shorts", "shorts", 3, "Performance"], ["Jacket", "jacket", 4, "Outerwear"],
  ["Bomber Jacket", "bomber", 4, "Outerwear"], ["Windbreaker", "windbreaker", 4, "Outerwear"],
  ["Rain Jacket", "windbreaker", 4, "Outerwear"], ["Puffer Jacket", "puffer", 4, "Outerwear"],
  ["Winter Coat", "coat", 4, "Outerwear"], ["Blazer", "blazer", 4, "Outerwear"],
  ["Travel Jacket", "jacket", 4, "Outerwear"], ["Performance Jacket", "jacket", 4, "Performance"],
  ["Gym Set", "set", 5, "Kits"], ["Football Kit", "jersey", 5, "Kits"],
  ["Basketball Kit", "jersey", 5, "Kits"], ["Tennis Kit", "set", 5, "Kits"],
  ["Golf Kit", "polo", 5, "Kits"], ["Running Set", "set", 5, "Kits"],
  ["Cycling Kit", "compression", 5, "Kits"], ["Swimwear", "shorts", 2, "Performance"],
  ["Base Layer", "compression", 2, "Performance"], ["Socks", "socks", 1, "Accessories"],
  ["Gloves", "gloves", 1, "Accessories"], ["Cap", "cap", 1, "Accessories"],
  ["Beanie", "beanie", 1, "Accessories"], ["Belt", "belt", 1, "Accessories"],
  ["Scarf", "scarf", 1, "Accessories"], ["Sneakers", "sneaker", 7, "Footwear"],
  ["Slides", "slide", 1, "Footwear"], ["Duffel Bag", "duffel", 6, "Bags"],
  ["Backpack", "backpack", 6, "Bags"], ["Wallet", "wallet", 1, "Accessories"],
  ["Watch Strap", "strap", 1, "Accessories"], ["Sunglasses", "sunglasses", 1, "Accessories"],
];

const WOMEN = [
  ["Sports Bra", "bra", 2, "Performance"], ["Leggings", "leggings", 3, "Bottoms"],
  ["Yoga Pants", "leggings", 3, "Bottoms"], ["Jacket", "jacket", 4, "Outerwear"],
  ["Hoodie", "hoodie", 2, "Tops"], ["Sweatshirt", "sweatshirt", 2, "Tops"],
  ["Crop Hoodie", "cropHoodie", 2, "Tops"], ["Crop Tee", "cropTee", 2, "Tops"],
  ["Performance Tee", "tee", 2, "Performance"], ["Tank", "tank", 2, "Tops"],
  ["Shorts", "shorts", 3, "Bottoms"], ["Running Shorts", "shorts", 3, "Performance"],
  ["Tennis Skirt", "skirt", 3, "Kits"], ["Golf Outfit", "dress", 5, "Kits"],
  ["Compression Wear", "compression", 2, "Performance"], ["Swimwear", "swim", 2, "Performance"],
  ["Lounge Set", "set", 5, "Kits"], ["Tracksuit", "set", 5, "Kits"],
  ["Bomber Jacket", "bomber", 4, "Outerwear"], ["Winter Jacket", "puffer", 4, "Outerwear"],
  ["Windbreaker", "windbreaker", 4, "Outerwear"], ["Puffer Jacket", "puffer", 4, "Outerwear"],
  ["Rain Jacket", "windbreaker", 4, "Outerwear"], ["Joggers", "joggers", 3, "Bottoms"],
  ["Cargo Pants", "cargo", 3, "Bottoms"], ["Lifestyle Dress", "dress", 4, "Tops"],
  ["Polo", "polo", 2, "Tops"], ["Performance Polo", "polo", 2, "Performance"],
  ["Socks", "socks", 1, "Accessories"], ["Sneakers", "sneaker", 7, "Footwear"],
  ["Slides", "slide", 1, "Footwear"], ["Backpack", "backpack", 6, "Bags"],
  ["Tote Bag", "tote", 6, "Bags"], ["Gym Bag", "duffel", 6, "Bags"],
  ["Cap", "cap", 1, "Accessories"], ["Visor", "cap", 1, "Accessories"],
  ["Gloves", "gloves", 1, "Accessories"], ["Scarf", "scarf", 1, "Accessories"],
  ["Sunglasses", "sunglasses", 1, "Accessories"], ["Watch Strap", "strap", 1, "Accessories"],
];

const UNISEX = [
  ["Oversized Hoodie", "hoodie", 2, "Tops"], ["Oversized Tee", "oversizedTee", 2, "Tops"],
  ["Performance Hoodie", "hoodie", 2, "Performance"], ["Tracksuit", "set", 5, "Kits"],
  ["Windbreaker", "windbreaker", 4, "Outerwear"], ["Rain Jacket", "windbreaker", 4, "Outerwear"],
  ["Puffer Jacket", "puffer", 4, "Outerwear"], ["Sweatshirt", "sweatshirt", 2, "Tops"],
  ["Joggers", "joggers", 3, "Bottoms"], ["Cargo Pants", "cargo", 3, "Bottoms"],
  ["Compression Wear", "compression", 2, "Performance"], ["Performance Shorts", "shorts", 3, "Performance"],
  ["Lifestyle Shorts", "shorts", 3, "Bottoms"], ["Performance Jacket", "jacket", 4, "Performance"],
  ["Gym Set", "set", 5, "Kits"], ["Travel Set", "set", 5, "Travel"],
  ["Sneakers", "sneaker", 7, "Footwear"], ["Slides", "slide", 1, "Footwear"],
  ["Cap", "cap", 1, "Accessories"], ["Beanie", "beanie", 1, "Accessories"],
  ["Scarf", "scarf", 1, "Accessories"], ["Duffel Bag", "duffel", 6, "Bags"],
  ["Backpack", "backpack", 6, "Bags"], ["Travel Backpack", "backpack", 6, "Travel"],
  ["Laptop Bag", "tote", 6, "Bags"], ["Crossbody Bag", "crossbody", 6, "Bags"],
  ["Wallet", "wallet", 1, "Accessories"], ["Belt", "belt", 1, "Accessories"],
  ["Compression Socks", "socks", 1, "Performance"], ["Premium Socks", "socks", 1, "Accessories"],
  ["Water Bottle", "bottle", 1, "Equipment"], ["Performance Towel", "towel", 1, "Equipment"],
  ["Gym Gloves", "gloves", 1, "Equipment"], ["Phone Sleeve", "sleeve", 1, "Accessories"],
  ["Umbrella", "umbrella", 1, "Accessories"], ["Travel Pillow", "pillow", 1, "Travel"],
  ["Eye Mask", "mask", 1, "Travel"], ["Travel Organizer", "organizer", 1, "Travel"],
  ["Weekend Bag", "duffel", 6, "Travel"], ["Performance Vest", "vest", 4, "Performance"],
];

const KIDS = [
  ["Kids Hoodie", "hoodie", 2, "Tops"], ["Kids Sweatshirt", "sweatshirt", 2, "Tops"],
  ["Kids Tee", "tee", 2, "Tops"], ["Kids Polo", "polo", 2, "Tops"],
  ["Kids Shorts", "shorts", 3, "Bottoms"], ["Kids Joggers", "joggers", 3, "Bottoms"],
  ["Kids Tracksuit", "set", 5, "Kits"], ["Kids Jacket", "jacket", 4, "Outerwear"],
  ["Kids Windbreaker", "windbreaker", 4, "Outerwear"], ["Kids Rain Jacket", "windbreaker", 4, "Outerwear"],
  ["Kids Winter Jacket", "coat", 4, "Outerwear"], ["Kids Puffer Jacket", "puffer", 4, "Outerwear"],
  ["Kids Compression Shirt", "compression", 2, "Performance"], ["Kids Compression Shorts", "shorts", 3, "Performance"],
  ["Kids Football Kit", "jersey", 5, "Kits"], ["Kids Basketball Kit", "jersey", 5, "Kits"],
  ["Kids Tennis Kit", "set", 5, "Kits"], ["Kids Cricket Kit", "jersey", 5, "Kits"],
  ["Kids Running Set", "set", 5, "Kits"], ["Kids Swimming Set", "swim", 5, "Kits"],
  ["Kids Socks", "socks", 1, "Accessories"], ["Kids Sneakers", "sneaker", 7, "Footwear"],
  ["Kids Slides", "slide", 1, "Footwear"], ["Kids Cap", "cap", 1, "Accessories"],
  ["Kids Backpack", "backpack", 6, "Bags"], ["Kids Lunch Bag", "tote", 1, "Bags"],
  ["Kids Duffel Bag", "duffel", 6, "Bags"], ["Kids Gloves", "gloves", 1, "Accessories"],
  ["Kids Beanie", "beanie", 1, "Accessories"], ["Kids Scarf", "scarf", 1, "Accessories"],
  ["Kids Travel Set", "set", 5, "Travel"], ["Kids Pajama Set", "set", 2, "Lounge"],
  ["Kids Lounge Wear", "set", 2, "Lounge"], ["Kids Rain Boots", "boot", 1, "Footwear"],
  ["Kids Water Bottle", "bottle", 1, "Equipment"], ["Kids School Bag", "backpack", 6, "Bags"],
  ["Kids Performance Vest", "vest", 2, "Performance"], ["Kids Sports Pants", "joggers", 3, "Bottoms"],
  ["Kids Thermal Wear", "compression", 2, "Performance"], ["Kids Lifestyle Set", "set", 5, "Kits"],
];

/* price bands: [min, max] per band index (1-7) */
const BANDS = { 1: [90, 420], 2: [180, 690], 3: [260, 760], 4: [890, 4200], 5: [640, 1900], 6: [690, 2400], 7: [590, 1450] };

function mulberry(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildCategory(key, label, items, seedBase, kidsScale) {
  return items.map(([itemName, silhouette, band, group], i) => {
    const rnd = mulberry(seedBase + i * 97);
    const line = LINES[Math.floor(rnd() * LINES.length)];
    const [min, max] = BANDS[band];
    let price = Math.round((min + rnd() * (max - min)) / 10) * 10;
    if (kidsScale) price = Math.round(price * 0.55 / 5) * 5;
    const fabric = FABRICS[Math.floor(rnd() * FABRICS.length)];
    const cwStart = Math.floor(rnd() * COLORWAYS.length);
    const colorways = [0, 1, 2].map(k => COLORWAYS[(cwStart + k * 2) % COLORWAYS.length]);
    const capsule = CAPSULES[Math.floor(rnd() * CAPSULES.length)];
    const rating = (4.5 + rnd() * 0.5).toFixed(1);
    const reviews = 18 + Math.floor(rnd() * 240);
    const name = key === "kids" ? itemName.replace(/^Kids /, `${line} `) : `${line} ${itemName}`;
    return {
      id: `${key}-${String(i + 1).padStart(2, "0")}`,
      n: i + 1,
      name,
      item: itemName,
      cat: key, catLabel: label,
      silhouette, group, capsule,
      price, fabric: fabric[0], origin: fabric[1],
      colorways, rating, reviews,
      bestseller: rnd() > 0.82,
      limited: capsule === "Limited Edition" || capsule === "Signature Gold",
    };
  });
}

export const CATALOG = {
  men: buildCategory("men", "Men", MEN, 11),
  women: buildCategory("women", "Women", WOMEN, 211),
  unisex: buildCategory("unisex", "Unisex", UNISEX, 311),
  kids: buildCategory("kids", "Kids", KIDS, 411, true),
};

export const ALL = [...CATALOG.men, ...CATALOG.women, ...CATALOG.unisex, ...CATALOG.kids];
export const byId = id => ALL.find(p => p.id === id);
export const money = n => "$" + n.toLocaleString("en-US");
export { COLORWAYS, CAPSULES };
