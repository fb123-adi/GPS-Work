/* AURUM imagery registry — the drop-in point for real photography.

   The house presents most pieces as engraved plates (js/garments.js).
   When a real product photograph exists, register it here and the plate
   frame renders the photo instead — same 4:5 exhibit box, same caption
   system, same hover choreography — with a graceful fall back to the
   engraved plate wherever no photo is registered.

   Two ways to attach a photo, checked in this order:
     1. Per product, by id           → BY_ID["men-15"]
     2. Per silhouette, as a default  → BY_SILHOUETTE["bomber"]
   A product may also carry its own `image` (and optional `video`) field
   set through the admin layer; that wins over anything here.

   Each entry is either a string (one image) or an object:
     { src, srcset?, video?, position?, alt? }
   Paths are relative to the site root (e.g. "img/bomber-noir.avif").
   `video` is an optional short, muted, looping preview shown on hover.

   No photographs ship yet, so both maps are empty and every piece shows
   its engraved plate. Populate a map and the boutique upgrades instantly. */

export const BY_ID = {
  // "men-15": { src: "img/regent-bomber.avif", video: "img/regent-bomber.mp4", alt: "Regent bomber, noir & gold" },
};

export const BY_SILHOUETTE = {
  // bomber: "img/silhouette/bomber.avif",
  // hoodie: "img/silhouette/hoodie.avif",
};

/* Resolve the best available photo for a product + colorway, or null. */
export function imageFor(product, cw = 0) {
  const raw =
    product?.image ??
    BY_ID[product?.id] ??
    BY_SILHOUETTE[product?.silhouette] ??
    null;
  if (!raw) return null;
  const rec = typeof raw === "string" ? { src: raw } : { ...raw };
  if (product?.video && !rec.video) rec.video = product.video;
  return rec;
}
