#!/usr/bin/env python3
"""
AURUM branded art generator.

Renders editorial gradient-mesh artwork (light bloom + film grain + vignette)
in the brand "old money" palette. All typography stays in the HTML layer — these
are texture/atmosphere assets only, so nothing here harms accessibility or SEO.

Output: aurum/public/images/*.webp   ·   Run: python3 scripts/generate_art.py
"""
import os
import numpy as np
from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "images")
os.makedirs(OUT, exist_ok=True)

# Brand palette (RGB)
INK = (12, 10, 9)
CHARCOAL = (28, 25, 23)
GRAPHITE = (68, 64, 60)
TAUPE = (168, 162, 158)
CHAMPAGNE = (231, 220, 196)
GOLD = (169, 131, 67)
GOLD_GLOW = (202, 138, 4)
OLIVE = (74, 78, 56)
OXBLOOD = (96, 44, 38)


def vgrad(h, w, top, bot):
    t = np.linspace(0, 1, h)[:, None, None]
    return np.array(top, float)[None, None, :] * (1 - t) + np.array(bot, float)[None, None, :] * t


def _falloff(h, w, cx, cy, rad):
    y, x = np.mgrid[0:h, 0:w].astype(float)
    s = max(h, w)
    d = np.sqrt(((x - cx * w) / (rad * s)) ** 2 + ((y - cy * h) / (rad * s)) ** 2)
    return np.clip(1 - d, 0, 1) ** 2


def add_glow(img, cx, cy, rad, color, intensity):
    m = _falloff(img.shape[0], img.shape[1], cx, cy, rad)[..., None]
    # screen blend toward the glow colour for a soft optical bloom
    c = np.array(color, float)
    img += (255 - img) * (m * intensity) * (c / 255.0)
    return img


def vignette(img, strength=0.55):
    h, w = img.shape[:2]
    y, x = np.mgrid[0:h, 0:w].astype(float)
    d = np.sqrt(((x - w / 2) / (w / 2)) ** 2 + ((y - h / 2) / (h / 2)) ** 2)
    v = 1 - np.clip((d - 0.6) / 0.9, 0, 1) * strength
    return img * v[..., None]


def grain(img, sigma=6.0, seed=0):
    rng = np.random.default_rng(seed)
    n = rng.normal(0, sigma, img.shape[:2])[..., None]
    return img + n


def sheen(img, angle_strength=10.0):
    """A faint diagonal light sweep for depth."""
    h, w = img.shape[:2]
    y, x = np.mgrid[0:h, 0:w].astype(float)
    g = ((x + y) / (w + h))
    band = np.exp(-((g - 0.32) ** 2) / (2 * 0.10 ** 2))
    return img + band[..., None] * angle_strength


def compose(name, w, h, top, bot, glows, seed=7, vig=0.55, grain_sigma=6.0):
    img = vgrad(h, w, top, bot)
    img = sheen(img, 8.0)
    for (cx, cy, rad, color, inten) in glows:
        img = add_glow(img, cx, cy, rad, color, inten)
    img = vignette(img, vig)
    img = grain(img, grain_sigma, seed)
    img = np.clip(img, 0, 255).astype(np.uint8)
    path = os.path.join(OUT, name)
    Image.fromarray(img, "RGB").save(path, "WEBP", quality=82, method=6)
    print(f"  {name}  {w}x{h}")


print("Generating AURUM art ->", os.path.normpath(OUT))

# Cinematic hero — deep ink, gold bloom upper-right, soft central light
compose("hero.webp", 2400, 1350, CHARCOAL, INK,
        [(0.72, 0.18, 0.7, GOLD_GLOW, 0.45),
         (0.42, 0.52, 1.1, CHAMPAGNE, 0.10),
         (0.15, 0.85, 0.6, GOLD, 0.10)],
        seed=11, vig=0.62, grain_sigma=5.0)

# Category cards (4:5)
compose("category-men.webp", 1200, 1500, (38, 34, 31), INK,
        [(0.5, 0.28, 0.8, GOLD, 0.16), (0.7, 0.7, 0.7, CHARCOAL, 0.2)], seed=3, vig=0.6)
compose("category-women.webp", 1200, 1500, GRAPHITE, (24, 22, 20),
        [(0.4, 0.3, 0.85, CHAMPAGNE, 0.14), (0.7, 0.75, 0.7, GOLD, 0.12)], seed=5, vig=0.58)
compose("category-children.webp", 1200, 1500, OLIVE, (24, 26, 18),
        [(0.55, 0.3, 0.8, CHAMPAGNE, 0.12), (0.3, 0.8, 0.7, GOLD, 0.10)], seed=8, vig=0.58)

# Lifestyle
compose("lifestyle-feature.webp", 1760, 990, (30, 27, 24), INK,
        [(0.3, 0.4, 0.9, GOLD_GLOW, 0.18), (0.8, 0.2, 0.6, CHAMPAGNE, 0.10)], seed=14, vig=0.6)
compose("lifestyle-ambition.webp", 1000, 1334, OXBLOOD, (40, 20, 18),
        [(0.45, 0.3, 0.8, GOLD, 0.16), (0.7, 0.8, 0.7, OXBLOOD, 0.2)], seed=21, vig=0.6)
compose("lifestyle-success.webp", 1000, 1334, GRAPHITE, (22, 20, 18),
        [(0.4, 0.35, 0.85, CHAMPAGNE, 0.12), (0.7, 0.75, 0.7, GOLD, 0.12)], seed=22, vig=0.6)
compose("lifestyle-recovery.webp", 1000, 1334, OLIVE, (22, 24, 17),
        [(0.5, 0.3, 0.8, CHAMPAGNE, 0.12)], seed=23, vig=0.6)

# About
compose("about.webp", 1200, 1500, (36, 32, 28), INK,
        [(0.5, 0.25, 0.9, GOLD_GLOW, 0.22), (0.3, 0.8, 0.6, GOLD, 0.10)], seed=31, vig=0.62)

print("Done.")
