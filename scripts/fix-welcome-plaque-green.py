"""Restore left welcome plaque — remove cream patch and green/dark bar."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
TARGETS = [
    ROOT / "public/backgrounds/welcome-to-the-journal-gazebo.png",
    ROOT / "public/images/welcome-to-the-journal-gazebo.png",
]

# Right-plaque interior tone (no separate bar).
PLAQUE_INTERIOR = (37, 38, 33)


def is_gold_line(r: int, g: int, b: int) -> bool:
    return r > 88 and g > 62 and b < 92 and r >= g >= b


def fix_image(path: Path) -> int:
    im = Image.open(path).convert("RGB")
    w, h = im.size
    pixels = im.load()
    changed = 0

    y_min = int(h * 0.867)
    y_max = int(h * 0.912)
    x_min = int(w * 0.058)
    x_max = int(w * 0.482)

    for y in range(y_min, y_max):
        for x in range(x_min, x_max):
            r, g, b = pixels[x, y]
            if is_gold_line(r, g, b):
                continue
            # Cream patch, green bar, or dark bar → uniform plaque interior
            pixels[x, y] = PLAQUE_INTERIOR
            changed += 1

    im.save(path, optimize=True)
    return changed


def main() -> None:
    for path in TARGETS:
        if not path.exists():
            print(f"missing: {path}")
            continue
        n = fix_image(path)
        print(f"fixed {path.name}: {n} pixels")


if __name__ == "__main__":
    main()
