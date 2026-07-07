/* AURUM plate engine — procedural engraved garment plates.
   Each product renders as hairline SVG line art on a lit graphite
   plinth. Deterministic per product; tinted by colorway. */

const G = "#D4AF37";          // gold detail ink
const GHOST = "rgba(234,227,210,0.16)";

/* Shared flat-lay bodies. LONG = long-sleeve torso; variants derive by hem. */
const LONG_BODY = "M142 150 Q200 136 258 150 L296 176 Q305 184 306 196 L312 314 Q312 326 300 328 L278 332 Q268 332 266 320 L258 236 L258 352 Q258 364 246 364 L154 364 Q142 364 142 352 L142 236 L134 320 Q132 332 122 332 L100 328 Q88 326 88 314 L94 196 Q95 184 104 176 Z";
const rehem = (path, hem, edge) => path.replaceAll("364", String(edge)).replaceAll("352", String(hem));
const CUFFS = "M268 322 L310 316 M132 322 L90 316";
const HOOD = "M164 146 Q200 96 236 146";
const HOOD_IN = "M170 150 Q200 188 230 150";


/* Every silhouette returns inner SVG centered in a 400×500 box.
   `s` = primary stroke (colorway), gold details stay gold. */
const S = {
  tee: s => `
    <path d="M140 152 Q200 138 260 152 L296 178 Q306 190 300 204 L282 232 Q276 240 266 236 L252 224 L252 348 Q252 360 240 360 L160 360 Q148 360 148 348 L148 224 L134 236 Q124 240 118 232 L100 204 Q94 190 104 178 Z" stroke="${s}"/>
    <path d="M172 150 Q200 172 228 150" stroke="${s}"/>
    <path d="M152 344 L248 344" stroke="${GHOST}"/>
    <path d="M196 196 L204 196 M200 192 L200 200" stroke="${G}"/>`,
  oversizedTee: s => `
    <path d="M126 158 Q200 142 274 158 L312 190 Q322 202 314 214 L294 240 Q287 248 277 243 L260 230 L262 356 Q262 368 250 368 L150 368 Q138 368 138 356 L140 230 L123 243 Q113 248 106 240 L86 214 Q78 202 88 190 Z" stroke="${s}"/>
    <path d="M170 156 Q200 180 230 156" stroke="${s}"/>
    <path d="M144 350 L256 350" stroke="${GHOST}"/>`,
  cropTee: s => `
    <path d="M142 156 Q200 142 258 156 L292 182 Q302 194 296 206 L280 230 Q274 238 264 234 L250 224 L250 296 Q250 306 240 306 L160 306 Q150 306 150 296 L150 224 L136 234 Q126 238 120 230 L104 206 Q98 194 108 182 Z" stroke="${s}"/>
    <path d="M174 154 Q200 174 226 154" stroke="${s}"/>
    <path d="M154 292 L246 292" stroke="${GHOST}"/>`,
  tank: s => `
    <path d="M156 140 Q160 178 138 206 L138 350 Q138 362 150 362 L250 362 Q262 362 262 350 L262 206 Q240 178 244 140" stroke="${s}"/>
    <path d="M156 140 Q200 168 244 140" stroke="${s}"/>
    <path d="M156 140 Q200 128 244 140" stroke="${GHOST}"/>
    <path d="M142 346 L258 346" stroke="${GHOST}"/>`,
  polo: s => `
    <path d="M140 152 Q200 138 260 152 L296 178 Q306 190 300 204 L282 232 Q276 240 266 236 L252 224 L252 352 Q252 364 240 364 L160 364 Q148 364 148 352 L148 224 L134 236 Q124 240 118 232 L100 204 Q94 190 104 178 Z" stroke="${s}"/>
    <path d="M172 150 L188 170 L200 236 L212 170 L228 150" stroke="${s}"/>
    <path d="M188 170 L212 170" stroke="${s}"/>
    <path d="M200 184 L200 224" stroke="${GHOST}"/>
    <circle cx="200" cy="196" r="1.6" fill="${G}" stroke="none"/>
    <circle cx="200" cy="212" r="1.6" fill="${G}" stroke="none"/>`,
  compression: s => `
    <path d="${LONG_BODY}" stroke="${s}"/>
    <path d="M176 148 Q200 166 224 148" stroke="${s}"/>
    <path d="M148 240 Q200 252 252 240 M148 284 Q200 296 252 284" stroke="${GHOST}"/>
    <path d="${CUFFS}" stroke="${GHOST}"/>`,
  hoodie: s => `
    <path d="${HOOD}" stroke="${s}"/>
    <path d="${HOOD_IN}" stroke="${s}"/>
    <path d="${LONG_BODY}" stroke="${s}"/>
    <path d="M188 192 L186 226 M212 192 L214 226" stroke="${G}"/>
    <path d="M168 352 L180 302 L220 302 L232 352" stroke="${s}"/>
    <path d="${CUFFS}" stroke="${GHOST}"/>`,
  cropHoodie: s => `
    <path d="${HOOD}" stroke="${s}"/>
    <path d="${HOOD_IN}" stroke="${s}"/>
    <path d="${rehem(LONG_BODY, 296, 308)}" stroke="${s}"/>
    <path d="M188 192 L186 224 M212 192 L214 224" stroke="${G}"/>
    <path d="M146 292 L254 292" stroke="${GHOST}"/>
    <path d="${CUFFS}" stroke="${GHOST}"/>`,
  sweatshirt: s => `
    <path d="${LONG_BODY}" stroke="${s}"/>
    <path d="M176 148 Q200 168 224 148 M180 154 Q200 172 220 154" stroke="${s}"/>
    <path d="M146 346 L254 346 M146 354 L254 354" stroke="${GHOST}"/>
    <path d="${CUFFS}" stroke="${GHOST}"/>`,
  jersey: s => `
    <path d="M144 150 Q200 136 256 150 L292 176 Q302 188 296 202 L280 230 Q274 238 264 234 L250 222 L250 350 Q250 362 238 362 L162 362 Q150 362 150 350 L150 222 L136 234 Q126 238 120 230 L104 202 Q98 188 108 176 Z" stroke="${s}"/>
    <path d="M170 148 L200 184 L230 148" stroke="${s}"/>
    <text x="200" y="286" text-anchor="middle" font-family="Italiana, serif" font-size="64" fill="none" stroke="${G}" stroke-width="1.4">07</text>
    <path d="M150 322 L250 322 M150 330 L250 330" stroke="${GHOST}"/>`,
  jacket: s => `
    <path d="${LONG_BODY}" stroke="${s}"/>
    <path d="M178 146 L200 178 L222 146" stroke="${s}"/>
    <path d="M200 178 L200 358" stroke="${G}" stroke-dasharray="3 5"/>
    <path d="M162 306 L184 306 M216 306 L238 306" stroke="${s}"/>
    <path d="${CUFFS}" stroke="${GHOST}"/>`,
  bomber: s => `
    <path d="${rehem(LONG_BODY, 338, 350)}" stroke="${s}"/>
    <path d="M178 148 Q200 164 222 148 M182 154 Q200 168 218 154" stroke="${s}"/>
    <path d="M200 166 L200 344" stroke="${G}" stroke-dasharray="3 5"/>
    <path d="M146 330 L254 330 M146 340 L254 340" stroke="${s}"/>
    <path d="M268 322 L310 316 M268 314 L308 309 M132 322 L90 316 M132 314 L92 309" stroke="${s}"/>`,
  windbreaker: s => `
    <path d="${HOOD}" stroke="${s}"/>
    <path d="${HOOD_IN}" stroke="${s}"/>
    <path d="${LONG_BODY}" stroke="${s}"/>
    <path d="M200 188 L200 358" stroke="${G}" stroke-dasharray="3 5"/>
    <path d="M224 270 L244 270 L244 296" stroke="${s}"/>
    <path d="M150 332 Q200 342 250 332" stroke="${GHOST}"/>
    <path d="${CUFFS}" stroke="${GHOST}"/>`,
  puffer: s => `
    <path d="${LONG_BODY}" stroke="${s}"/>
    <path d="M176 148 Q200 166 224 148" stroke="${s}"/>
    <path d="M146 238 Q200 252 254 238 M146 276 Q200 290 254 276 M146 314 Q200 326 254 314 M146 344 Q200 354 254 344" stroke="${s}"/>
    <path d="M200 166 L200 358" stroke="${G}" stroke-dasharray="3 5"/>
    <path d="M306 226 Q296 262 290 300 M94 226 Q104 262 110 300" stroke="${GHOST}"/>`,
  coat: s => `
    <path d="${rehem(LONG_BODY, 396, 408)}" stroke="${s}"/>
    <path d="M178 144 L200 190 L222 144 M178 144 L192 168 L200 190 M222 144 L208 168 L200 190" stroke="${s}"/>
    <path d="M200 190 L200 402" stroke="${G}" stroke-dasharray="3 5"/>
    <circle cx="190" cy="240" r="1.6" fill="${G}" stroke="none"/>
    <circle cx="190" cy="276" r="1.6" fill="${G}" stroke="none"/>
    <circle cx="190" cy="312" r="1.6" fill="${G}" stroke="none"/>
    <path d="${CUFFS}" stroke="${GHOST}"/>`,
  blazer: s => `
    <path d="${rehem(LONG_BODY, 372, 384)}" stroke="${s}"/>
    <path d="M178 146 L200 208 L222 146 M178 146 L190 178 L178 200 L200 208 M222 146 L210 178 L222 200 L200 208" stroke="${s}"/>
    <path d="M200 208 L198 378" stroke="${GHOST}"/>
    <circle cx="206" cy="288" r="1.8" fill="${G}" stroke="none"/>
    <path d="M160 318 L184 318 M216 318 L240 318" stroke="${s}"/>
    <path d="${CUFFS}" stroke="${GHOST}"/>`,
  vest: s => `
    <path d="M158 142 Q162 178 142 202 L142 352 Q142 364 154 364 L246 364 Q258 364 258 352 L258 202 Q238 178 242 142" stroke="${s}"/>
    <path d="M158 142 Q200 168 242 142" stroke="${s}"/>
    <path d="M200 168 L200 358" stroke="${G}" stroke-dasharray="3 5"/>
    <path d="M144 242 Q200 254 256 242 M144 288 Q200 300 256 288 M144 330 Q200 340 256 330" stroke="${s}"/>`,
  bra: s => `
    <path d="M148 166 L148 244 Q174 268 200 268 Q226 268 252 244 L252 166" stroke="${s}"/>
    <path d="M148 166 Q160 152 176 166 L176 210 M252 166 Q240 152 224 166 L224 210" stroke="${s}"/>
    <path d="M176 166 Q200 180 224 166" stroke="${s}"/>
    <path d="M176 210 Q200 226 224 210" stroke="${GHOST}"/>
    <path d="M148 244 Q200 262 252 244" stroke="${G}"/>`,
  dress: s => `
    <path d="M162 142 Q166 176 150 198 L158 236 Q142 320 132 384 Q170 400 200 400 Q230 400 268 384 Q258 320 242 236 L250 198 Q234 176 238 142" stroke="${s}"/>
    <path d="M162 142 Q200 166 238 142" stroke="${s}"/>
    <path d="M158 236 Q200 248 242 236" stroke="${G}"/>
    <path d="M180 250 L172 388 M220 250 L228 388" stroke="${GHOST}"/>`,
  skirt: s => `
    <path d="M154 200 L246 200 L272 340 Q236 354 200 354 Q164 354 128 340 Z" stroke="${s}"/>
    <path d="M154 214 L246 214" stroke="${G}"/>
    <path d="M172 216 L156 342 M200 216 L200 350 M228 216 L244 342" stroke="${GHOST}"/>`,
  swim: s => `
    <path d="M164 156 L164 214 Q150 262 158 302 Q178 314 200 314 Q222 314 242 302 Q250 262 236 214 L236 156" stroke="${s}"/>
    <path d="M164 156 Q176 144 190 156 L190 190 M236 156 Q224 144 210 156 L210 190" stroke="${s}"/>
    <path d="M190 156 Q200 164 210 156 M190 190 Q200 200 210 190" stroke="${s}"/>
    <path d="M160 244 Q200 254 240 244" stroke="${GHOST}"/>`,
  joggers: s => `
    <path d="M156 150 L244 150 L252 220 L236 396 Q236 406 226 406 L212 406 Q204 406 204 396 L200 250 L196 396 Q196 406 188 406 L174 406 Q164 406 164 396 L148 220 Z" stroke="${s}"/>
    <path d="M156 164 L244 164" stroke="${s}"/>
    <path d="M186 158 L184 176 M214 158 L216 176" stroke="${G}"/>
    <path d="M166 388 L196 388 M204 388 L234 388" stroke="${s}"/>
    <path d="M230 230 L242 230" stroke="${GHOST}"/>`,
  cargo: s => `
    <path d="M154 150 L246 150 L256 224 L242 400 Q242 410 232 410 L214 410 Q206 410 206 400 L200 252 L194 400 Q194 410 186 410 L168 410 Q158 410 158 400 L144 224 Z" stroke="${s}"/>
    <path d="M154 164 L246 164" stroke="${s}"/>
    <path d="M158 268 L186 268 L188 306 L162 306 Z M242 268 L214 268 L212 306 L238 306 Z" stroke="${s}"/>
    <path d="M158 284 L187 284 M242 284 L213 284" stroke="${GHOST}"/>`,
  shorts: s => `
    <path d="M154 178 L246 178 L258 296 Q240 304 218 302 L212 306 L204 246 L196 306 L190 302 Q162 304 142 296 Z" stroke="${s}"/>
    <path d="M154 192 L246 192" stroke="${s}"/>
    <path d="M186 184 L184 202 M214 184 L216 202" stroke="${G}"/>
    <path d="M148 282 L188 288 M252 282 L212 288" stroke="${GHOST}"/>`,
  leggings: s => `
    <path d="M162 152 L238 152 L244 214 L228 400 Q228 408 220 408 L212 408 Q206 408 206 400 L200 240 L194 400 Q194 408 188 408 L180 408 Q172 408 172 400 L156 214 Z" stroke="${s}"/>
    <path d="M162 168 L238 168" stroke="${G}"/>
    <path d="M170 250 Q182 262 178 280 M230 250 Q218 262 222 280" stroke="${GHOST}"/>`,
  set: s => `
    <g transform="translate(-52 -18) scale(0.78)"><path d="M140 152 Q200 138 260 152 L296 178 Q306 190 300 204 L282 232 Q276 240 266 236 L252 224 L252 348 Q252 360 240 360 L160 360 Q148 360 148 348 L148 224 L134 236 Q124 240 118 232 L100 204 Q94 190 104 178 Z M172 150 Q200 172 228 150" stroke="${s}"/></g>
    <g transform="translate(92 118) scale(0.62)"><path d="M154 178 L246 178 L258 296 Q240 304 218 302 L212 306 L204 246 L196 306 L190 302 Q162 304 142 296 Z M154 192 L246 192" stroke="${s}"/><path d="M186 184 L184 202 M214 184 L216 202" stroke="${G}"/></g>`,
  cap: s => `
    <path d="M136 234 Q136 158 200 158 Q264 158 264 234 Z" stroke="${s}"/>
    <path d="M200 158 L200 234 M164 170 Q158 200 158 234 M236 170 Q242 200 242 234" stroke="${GHOST}"/>
    <path d="M136 234 Q196 222 296 238 Q298 250 286 252 Q200 240 138 246 Q132 240 136 234 Z" stroke="${s}"/>
    <circle cx="200" cy="158" r="3" stroke="${G}"/>`,
  beanie: s => `
    <path d="M142 250 Q142 158 200 158 Q258 158 258 250" stroke="${s}"/>
    <path d="M138 250 L262 250 L262 282 L138 282 Z" stroke="${s}"/>
    <path d="M150 252 L150 280 M166 252 L166 280 M182 252 L182 280 M198 252 L198 280 M214 252 L214 280 M230 252 L230 280 M246 252 L246 280" stroke="${GHOST}"/>
    <path d="M172 176 Q200 164 228 176" stroke="${GHOST}"/>`,
  scarf: s => `
    <path d="M158 130 L242 130 L246 300 Q248 330 232 352 L216 344 Q228 326 226 300 L222 170 L178 170 L174 300 Q172 326 184 344 L168 352 Q152 330 154 300 Z" stroke="${s}"/>
    <path d="M160 316 L172 318 M228 316 L240 318" stroke="${G}"/>
    <path d="M166 352 L162 372 M176 348 L174 368 M224 348 L226 368 M234 352 L238 372" stroke="${s}"/>`,
  socks: s => `
    <g transform="translate(-24 0)"><path d="M168 150 L212 150 L212 262 Q244 282 238 312 Q232 340 200 336 Q172 332 168 300 Z" stroke="${s}"/><path d="M168 164 L212 164" stroke="${G}"/><path d="M176 240 Q190 248 204 240" stroke="${GHOST}"/></g>
    <g transform="translate(48 22) scale(0.9)"><path d="M168 150 L212 150 L212 262 Q244 282 238 312 Q232 340 200 336 Q172 332 168 300 Z" stroke="${s}"/><path d="M168 164 L212 164" stroke="${GHOST}"/></g>`,
  gloves: s => `
    <path d="M172 348 L172 216 Q172 200 182 200 Q190 200 190 214 L190 172 Q190 158 199 158 Q208 158 208 172 L208 156 Q208 142 217 142 Q226 142 226 158 L226 176 Q226 164 234 164 Q242 164 242 178 L242 250 Q258 240 264 252 Q270 262 258 274 L232 306 L232 348 Z" stroke="${s}"/>
    <path d="M190 214 L190 240 M208 172 L208 240 M226 176 L226 240" stroke="${GHOST}"/>
    <path d="M172 320 L232 320" stroke="${G}"/>`,
  belt: s => `
    <ellipse cx="200" cy="250" rx="92" ry="74" stroke="${s}"/>
    <ellipse cx="200" cy="250" rx="64" ry="48" stroke="${s}"/>
    <path d="M200 176 L200 148 L236 148 L236 190" stroke="${s}"/>
    <rect x="188" y="140" width="24" height="34" rx="4" stroke="${G}"/>`,
  sneaker: s => `
    <path d="M116 302 Q112 274 130 270 L164 262 Q186 256 200 238 Q210 226 224 230 Q262 244 292 262 Q308 270 306 288 L304 302 Z" stroke="${s}"/>
    <path d="M112 302 L308 302 Q310 320 292 320 L128 320 Q110 320 112 302 Z" stroke="${s}"/>
    <path d="M196 244 L216 276 M212 238 L232 270 M180 256 L196 284" stroke="${GHOST}"/>
    <path d="M238 240 Q262 264 296 272" stroke="${G}"/>
    <path d="M130 306 L290 306" stroke="${GHOST}"/>`,
  slide: s => `
    <path d="M116 296 Q116 282 130 282 L270 282 Q284 282 284 296 Q284 312 268 312 L132 312 Q116 312 116 296 Z" stroke="${s}"/>
    <path d="M140 282 Q170 226 232 240 Q262 248 260 282" stroke="${s}"/>
    <path d="M186 250 L192 262 M206 246 L210 258" stroke="${G}"/>`,
  boot: s => `
    <path d="M156 148 L228 148 L228 262 Q262 276 278 296 Q290 312 278 322 L156 322 Z" stroke="${s}"/>
    <path d="M156 162 L228 162" stroke="${G}"/>
    <path d="M150 322 L286 322 L286 338 Q286 346 276 346 L160 346 Q150 346 150 338 Z" stroke="${s}"/>
    <path d="M168 200 L216 200 M168 232 L216 232" stroke="${GHOST}"/>`,
  duffel: s => `
    <path d="M112 232 Q112 196 148 196 L252 196 Q288 196 288 232 L288 290 Q288 326 252 326 L148 326 Q112 326 112 290 Z" stroke="${s}"/>
    <path d="M158 196 Q158 150 200 150 Q242 150 242 196" stroke="${s}"/>
    <path d="M158 196 L158 326 M242 196 L242 326" stroke="${GHOST}"/>
    <path d="M148 240 L112 240 M288 240 L252 240" stroke="${GHOST}"/>
    <path d="M186 258 L214 258" stroke="${G}"/>`,
  backpack: s => `
    <path d="M144 190 Q144 150 200 150 Q256 150 256 190 L256 330 Q256 352 234 352 L166 352 Q144 352 144 330 Z" stroke="${s}"/>
    <path d="M144 224 Q200 240 256 224" stroke="${s}"/>
    <path d="M162 262 L238 262 L238 320 Q238 332 226 332 L174 332 Q162 332 162 320 Z" stroke="${s}"/>
    <path d="M162 292 L238 292" stroke="${GHOST}"/>
    <path d="M178 150 Q174 130 200 130 Q226 130 222 150" stroke="${s}"/>
    <path d="M196 268 L204 268" stroke="${G}"/>`,
  tote: s => `
    <path d="M132 208 L268 208 L254 356 Q252 368 240 368 L160 368 Q148 368 146 356 Z" stroke="${s}"/>
    <path d="M164 208 Q160 152 200 152 Q240 152 236 208" stroke="${s}"/>
    <path d="M148 232 L252 232" stroke="${GHOST}"/>
    <path d="M186 288 L214 288" stroke="${G}"/>`,
  crossbody: s => `
    <path d="M148 258 Q148 234 172 234 L228 234 Q252 234 252 258 L252 302 Q252 326 228 326 L172 326 Q148 326 148 302 Z" stroke="${s}"/>
    <path d="M148 272 L252 272" stroke="${s}"/>
    <path d="M172 234 Q120 200 128 132 M228 234 Q280 200 272 132" stroke="${GHOST}"/>
    <path d="M194 288 L206 288" stroke="${G}"/>`,
  wallet: s => `
    <path d="M136 200 Q136 188 148 188 L252 188 Q264 188 264 200 L264 296 Q264 308 252 308 L148 308 Q136 308 136 296 Z" stroke="${s}"/>
    <path d="M136 232 L264 232" stroke="${s}"/>
    <path d="M212 252 L264 252 L264 284 L212 284 Z" stroke="${s}"/>
    <circle cx="234" cy="268" r="4" stroke="${G}"/>`,
  strap: s => `
    <path d="M182 128 L218 128 L222 210 L178 210 Z M178 290 L222 290 L218 372 L182 372 Z" stroke="${s}"/>
    <path d="M178 210 Q166 250 178 290 M222 210 Q234 250 222 290" stroke="${GHOST}"/>
    <rect x="186" y="222" width="28" height="56" rx="6" stroke="${G}"/>
    <path d="M192 152 L208 152 M192 176 L208 176 M192 336 L208 336" stroke="${GHOST}"/>`,
  sunglasses: s => `
    <path d="M118 226 Q118 202 142 202 L180 202 Q198 202 198 220 L198 240 Q198 264 174 264 L146 264 Q118 264 118 240 Z" stroke="${s}"/>
    <path d="M282 226 Q282 202 258 202 L220 202 Q202 202 202 220 L202 240 Q202 264 226 264 L254 264 Q282 264 282 240 Z" stroke="${s}"/>
    <path d="M198 216 Q200 208 202 216" stroke="${s}"/>
    <path d="M118 214 L96 206 M282 214 L304 206" stroke="${G}"/>`,
  bottle: s => `
    <path d="M176 174 L176 202 Q160 224 160 260 L160 348 Q160 364 176 364 L224 364 Q240 364 240 348 L240 260 Q240 224 224 202 L224 174 Z" stroke="${s}"/>
    <path d="M172 160 Q172 148 184 148 L216 148 Q228 148 228 160 L228 174 L172 174 Z" stroke="${s}"/>
    <path d="M160 268 L240 268 M160 320 L240 320" stroke="${GHOST}"/>
    <path d="M188 294 L212 294" stroke="${G}"/>`,
  towel: s => `
    <path d="M138 172 L262 172 L262 328 L138 328 Z" stroke="${s}"/>
    <path d="M138 196 L262 196 M138 304 L262 304" stroke="${G}"/>
    <path d="M162 172 L162 328 M200 172 L200 328 M238 172 L238 328" stroke="${GHOST}"/>`,
  sleeve: s => `
    <path d="M162 152 Q162 140 174 140 L226 140 Q238 140 238 152 L238 336 Q238 348 226 348 L174 348 Q162 348 162 336 Z" stroke="${s}"/>
    <path d="M162 176 L238 176" stroke="${GHOST}"/>
    <path d="M188 340 L212 340" stroke="${G}"/>`,
  umbrella: s => `
    <path d="M110 240 Q110 140 200 140 Q290 140 290 240 Q272 224 254 240 Q236 224 218 240 Q209 232 200 240 Q191 232 182 240 Q164 224 146 240 Q128 224 110 240 Z" stroke="${s}"/>
    <path d="M200 140 L200 122" stroke="${s}"/>
    <path d="M200 240 L200 352 Q200 372 218 372" stroke="${s}"/>
    <path d="M146 240 Q160 180 200 150 M254 240 Q240 180 200 150" stroke="${GHOST}"/>`,
  pillow: s => `
    <path d="M132 220 Q124 156 200 156 Q276 156 268 220 Q264 262 236 278 L236 302 Q218 292 200 292 Q182 292 164 302 L164 278 Q136 262 132 220 Z" stroke="${s}"/>
    <path d="M164 278 Q200 296 236 278" stroke="${GHOST}"/>
    <path d="M188 200 Q200 208 212 200" stroke="${G}"/>`,
  mask: s => `
    <path d="M116 226 Q116 186 162 186 Q186 186 200 200 Q214 186 238 186 Q284 186 284 226 Q284 268 238 268 Q214 268 200 254 Q186 268 162 268 Q116 268 116 226 Z" stroke="${s}"/>
    <path d="M116 214 L88 200 M284 214 L312 200" stroke="${GHOST}"/>
    <path d="M160 226 Q170 220 180 226 M220 226 Q230 220 240 226" stroke="${G}"/>`,
  organizer: s => `
    <path d="M126 190 L274 190 L274 330 L126 330 Z" stroke="${s}"/>
    <path d="M126 236 L274 236" stroke="${s}"/>
    <path d="M126 212 L274 212" stroke="${GHOST}"/>
    <path d="M150 262 L196 262 L196 306 L150 306 Z M204 262 L250 262 L250 306 L204 306 Z" stroke="${s}"/>
    <path d="M168 284 L178 284 M222 284 L232 284" stroke="${G}"/>`,
};

const FALLBACK = { tee: S.tee };
export const silhouetteKeys = Object.keys(S);

let uid = 0;

/* Render one plate. product needs { silhouette, colorways, n } */
export function plate(product, opts = {}) {
  const cw = product.colorways[opts.colorway ?? 0] || product.colorways[0];
  const draw = (S[product.silhouette] || FALLBACK.tee)(cw.stroke);
  const view = opts.view || "front";
  const id = `pl${++uid}`;
  const label = opts.alt ?? `${product.name} — engraved plate, ${cw.name} colorway`;
  let transform = "";
  if (view === "detail") transform = `transform="translate(-260 -220) scale(2.3)"`;
  if (view === "back") transform = `transform="translate(400 0) scale(-1 1)"`;
  return `
  <svg viewBox="0 0 400 500" role="img" aria-label="${label}" ${opts.attrs || ""}>
    <defs>
      <radialGradient id="${id}-spot" cx="50%" cy="26%" r="72%">
        <stop offset="0%" stop-color="rgba(234,227,210,0.10)"/>
        <stop offset="46%" stop-color="rgba(234,227,210,0.03)"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
      </radialGradient>
      <linearGradient id="${id}-plinth" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(212,175,55,0.35)"/>
        <stop offset="100%" stop-color="rgba(212,175,55,0)"/>
      </linearGradient>
    </defs>
    <rect width="400" height="500" fill="#0B0A09"/>
    <rect width="400" height="500" fill="url(#${id}-spot)"/>
    <ellipse cx="200" cy="446" rx="118" ry="10" fill="rgba(0,0,0,0.55)"/>
    <path d="M82 446 L318 446" stroke="url(#${id}-plinth)" stroke-width="1.5"/>
    <g fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${transform}>
      ${draw}
    </g>
    <text x="24" y="478" font-family="Archivo, sans-serif" font-size="11" letter-spacing="2.5" fill="rgba(234,227,210,0.45)">AURUM · N&#186; ${String(product.n).padStart(3, "0")}</text>
    <text x="376" y="478" text-anchor="end" font-family="Archivo, sans-serif" font-size="11" letter-spacing="2.5" fill="rgba(212,175,55,0.55)">${(product.origin || "").split(",")[0].toUpperCase()}</text>
  </svg>`;
}

/* Exhibit card (collection grids, rails). */
export function exhibitCard(p, { base = "" } = {}) {
  return `
  <article class="exhibit reveal" data-id="${p.id}">
    <a class="plate" href="${base}product.html?id=${p.id}" aria-label="${p.name}, ${fmt(p.price)}">
      ${plate(p)}
      <span class="plate-shine" aria-hidden="true"></span>
    </a>
    <button class="wish-btn" type="button" data-wish="${p.id}" aria-pressed="false" aria-label="Add ${p.name} to wishlist">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 20.5C7 16.5 3 13 3 8.9 3 6.2 5.1 4 7.8 4c1.7 0 3.3.9 4.2 2.3C12.9 4.9 14.5 4 16.2 4 18.9 4 21 6.2 21 8.9c0 4.1-4 7.6-9 11.6Z"/></svg>
    </button>
    <button class="quick-add" type="button" data-add="${p.id}">Add to cart — ${fmt(p.price)}</button>
    <div class="plate-caption">
      <div>
        <h4><a href="${base}product.html?id=${p.id}">${p.name}</a></h4>
        <span class="prov"><span class="n">N&#186; ${String(p.n).padStart(3, "0")}</span> · ${p.fabric}</span>
      </div>
      <span class="price">${fmt(p.price)}</span>
    </div>
  </article>`;
}

const fmt = n => "$" + n.toLocaleString("en-US");
