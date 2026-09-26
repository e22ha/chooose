"""Generate stylised placeholder portraits into photos/ (needs Pillow).

Usage: python3 scripts/generate-placeholders.py
"""
import colorsys
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

NAMES = [
    'Alisa', 'Boris', 'Vera', 'Gleb', 'Darya', 'Egor', 'Zhenya', 'Ilya',
    'Katya', 'Lev', 'Mila', 'Nikita', 'Olga', 'Pavel', 'Rita', 'Stas',
    'Taya', 'Fedya',
]
W, H = 600, 750
SKIN = ['#f5d0b5', '#eab896', '#d49a74', '#b27650', '#8a5638', '#f1c7a8']
HAIR = ['#1f1a17', '#3b2619', '#6b4226', '#a8652f', '#d8b36a', '#b33a2e', '#8f8f99', '#5b3a7a']


def hsl(h, s, l):
    r, g, b = colorsys.hls_to_rgb(h % 1, l, s)
    return int(r * 255), int(g * 255), int(b * 255)


def gradient(c1, c2):
    img = Image.new('RGB', (W, H))
    px = img.load()
    for y in range(H):
        for x in range(W):
            t = (x / W * 0.4 + y / H * 0.6)
            px[x, y] = tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))
    return img


def portrait(rng, hue):
    img = gradient(hsl(hue, 0.65, 0.62), hsl(hue + 0.12, 0.7, 0.35))

    # soft bokeh blobs
    blobs = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    bd = ImageDraw.Draw(blobs)
    for _ in range(9):
        r = rng.randint(30, 120)
        x, y = rng.randint(0, W), rng.randint(0, H)
        bd.ellipse((x - r, y - r, x + r, y + r), fill=(255, 255, 255, rng.randint(18, 45)))
    img.paste(blobs.filter(ImageFilter.GaussianBlur(18)), (0, 0), blobs.filter(ImageFilter.GaussianBlur(18)))

    d = ImageDraw.Draw(img)
    skin = rng.choice(SKIN)
    hair = rng.choice(HAIR)
    shirt = hsl(hue + 0.5 + rng.uniform(-0.1, 0.1), 0.5, rng.uniform(0.25, 0.55))
    cx = W // 2 + rng.randint(-20, 20)
    long_hair = rng.random() < 0.5

    if long_hair:  # hair behind the head
        d.rounded_rectangle((cx - 165, 190, cx + 165, 560), radius=150, fill=hair)
    # shoulders + neck
    d.ellipse((cx - 250, 560, cx + 250, 1000), fill=shirt)
    d.rectangle((cx - 45, 440, cx + 45, 600), fill=skin)
    d.ellipse((cx - 70, 540, cx + 70, 620), fill=shirt)
    # head
    d.ellipse((cx - 130, 180, cx + 130, 500), fill=skin)
    # hair on top
    d.chord((cx - 140, 160, cx + 140, 420), 180, 360, fill=hair)
    if rng.random() < 0.5:
        d.ellipse((cx - 150, 190, cx - 40, 300), fill=hair)
    # eyes, brows, mouth
    ey = 340 + rng.randint(-10, 10)
    for dx in (-50, 50):
        d.ellipse((cx + dx - 11, ey - 11, cx + dx + 11, ey + 11), fill='#2a2320')
        d.ellipse((cx + dx - 4, ey - 7, cx + dx + 2, ey - 1), fill='white')
        d.line((cx + dx - 22, ey - 30, cx + dx + 22, ey - 34 + rng.randint(-4, 6)), fill=hair, width=7)
    d.arc((cx - 40, ey + 40, cx + 40, ey + 95), 20, 160, fill='#9c3d3d', width=7)
    blush = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(blush).ellipse((cx - 100, ey + 25, cx - 55, ey + 55), fill=(255, 100, 110, 60))
    ImageDraw.Draw(blush).ellipse((cx + 55, ey + 25, cx + 100, ey + 55), fill=(255, 100, 110, 60))
    blush = blush.filter(ImageFilter.GaussianBlur(8))
    img.paste(blush, (0, 0), blush)
    if rng.random() < 0.3:  # glasses
        for dx in (-50, 50):
            d.ellipse((cx + dx - 32, ey - 28, cx + dx + 32, ey + 28), outline='#222', width=6)
        d.line((cx - 18, ey, cx + 18, ey), fill='#222', width=6)
    return img


def main():
    out = Path(__file__).resolve().parent.parent / 'photos'
    rng = random.Random(42)
    for i, name in enumerate(NAMES):
        portrait(rng, i * 0.618034 + rng.uniform(-0.05, 0.05)).save(out / f'{name}.jpg', quality=85)
    print(f'Wrote {len(NAMES)} placeholder portraits to {out}')


if __name__ == '__main__':
    main()
