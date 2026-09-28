/**
 * Generates neutral studio-style placeholder product plates (WebP) so the
 * store renders before real photography exists. These are NOT product
 * photos; replace them from the admin (Products > Images) before launch.
 *
 *   npx tsx scripts/placeholders.ts
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export type Garment = "tee" | "polo" | "hoodie" | "crew" | "jogger" | "short" | "tank" | "jacket" | "legging";

const SHAPES: Record<Garment, string> = {
  tee: "M140 90 L175 78 Q200 96 225 78 L260 90 L318 132 L296 176 L262 158 L262 400 L138 400 L138 158 L104 176 L82 132 Z",
  polo: "M140 90 L178 76 L190 112 L200 96 L210 112 L222 76 L260 90 L318 132 L296 176 L262 158 L262 400 L138 400 L138 158 L104 176 L82 132 Z",
  crew: "M138 92 L176 80 Q200 98 224 80 L262 92 L300 150 L322 330 L294 338 L266 190 L266 404 L134 404 L134 190 L106 338 L78 330 L100 150 Z",
  hoodie: "M140 96 Q150 44 200 40 Q250 44 260 96 L300 150 L324 336 L296 344 L266 196 L266 406 L134 406 L134 196 L104 344 L76 336 L100 150 Z",
  jacket: "M138 92 L178 72 L200 110 L222 72 L262 92 L302 150 L324 340 L296 348 L268 196 L268 408 L132 408 L132 196 L104 348 L76 340 L98 150 Z",
  tank: "M150 84 Q162 80 170 84 Q200 130 230 84 Q238 80 250 84 L262 160 L262 400 L138 400 L138 160 Z",
  jogger: "M136 70 L264 70 L270 110 L256 410 Q250 424 232 424 L214 424 L204 150 L196 150 L186 424 L168 424 Q150 424 144 410 L130 110 Z",
  legging: "M142 70 L258 70 L262 104 L240 424 L218 424 L204 150 L196 150 L182 424 L160 424 L138 104 Z",
  short: "M130 110 L270 110 L286 290 L214 300 L200 190 L186 300 L114 290 Z",
};

const DETAILS: Record<Garment, string> = {
  tee: "M175 78 Q200 110 225 78",
  polo: "M190 112 L190 170 M200 130 L200 132 M200 150 L200 152",
  crew: "M176 80 Q200 112 224 80 M134 386 L266 386",
  hoodie: "M170 64 Q200 110 230 64 M186 150 L186 196 M214 150 L214 196 M150 290 L250 290 L240 340 L160 340 Z",
  jacket: "M200 110 L200 408 M150 250 L180 250 M220 250 L250 250",
  tank: "M170 84 Q200 130 230 84",
  jogger: "M136 88 L264 88 M150 410 L182 410 M218 410 L250 410",
  legging: "M142 86 L258 86",
  short: "M130 126 L270 126",
};

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = (s: number) => Math.max(0, Math.min(255, ((n >> s) & 255) + amt));
  return `rgb(${c(16)},${c(8)},${c(0)})`;
}

export function plateSvg(g: Garment, colourHex: string, variant: "front" | "detail") {
  const dark = parseInt(colourHex.slice(1, 3), 16) < 90;
  const bg = dark ? "#E7E2D8" : "#DAD4C8";
  const stroke = dark ? shade(colourHex, 38) : shade(colourHex, -40);
  const scale = variant === "detail" ? "translate(-160 -150) scale(1.8)" : "translate(0 10)";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="1200" height="1500">
  <defs>
    <radialGradient id="l" cx="50%" cy="38%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <linearGradient id="f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(colourHex, 18)}"/><stop offset="1" stop-color="${shade(colourHex, -14)}"/></linearGradient>
  </defs>
  <rect width="400" height="500" fill="${bg}"/>
  <rect width="400" height="500" fill="url(#l)"/>
  <ellipse cx="200" cy="452" rx="120" ry="10" fill="#000" opacity=".08"/>
  <g transform="${scale}">
    <path d="${SHAPES[g]}" fill="url(#f)" stroke="${stroke}" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="${DETAILS[g]}" fill="none" stroke="${stroke}" stroke-width="1.2" stroke-linecap="round" opacity=".8"/>
  </g>
</svg>`;
}

export async function writePlate(outDir: string, name: string, g: Garment, hex: string, v: "front" | "detail") {
  await mkdir(outDir, { recursive: true });
  const file = path.join(outDir, `${name}.webp`);
  await sharp(Buffer.from(plateSvg(g, hex, v))).webp({ quality: 82 }).toFile(file);
  return file;
}

export async function writeEditorial(outDir: string, name: string, tone: string, w = 2400, h = 1350) {
  await mkdir(outDir, { recursive: true });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs><radialGradient id="g" cx="62%" cy="40%" r="75%"><stop offset="0" stop-color="${shade(tone, 34)}"/><stop offset="1" stop-color="${shade(tone, -22)}"/></radialGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <g opacity=".12" stroke="#F2EEE6" fill="none">${Array.from({ length: 14 }, (_, i) => `<path d="M${-200 + i * 190} ${h} C ${200 + i * 160} ${h * 0.55}, ${400 + i * 150} ${h * 0.4}, ${w + 200} ${i * 40}"/>`).join("")}</g>
</svg>`;
  const file = path.join(outDir, `${name}.webp`);
  await sharp(Buffer.from(svg)).webp({ quality: 80 }).toFile(file);
  return file;
}
