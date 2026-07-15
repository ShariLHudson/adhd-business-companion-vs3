"""
Extract Compact Gallery Card (layout A only) from Board design sheets.
Output: public/board-of-directors/{directorId}-gallery-portrait.png
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "board-of-directors"
DOCS = ROOT / "docs" / "design-references" / "board-of-directors"
PUBLIC = ROOT / "public" / "board-of-directors"

# Relative crop of layout A on typical 3-panel sheets (left Compact Gallery Card).
# Stop ABOVE the painted Core/Meet buttons — those are decorative in the art.
# Real interactive controls (Core/Optional, Meet, Add to Review) live in HTML
# so every card shows a complete, unclipped action footer.
# Tuned across 1536×1024 sheets (painted Core/Meet begin ~y 548).
FRAC = (28 / 1536, 55 / 1024, 495 / 1536, 540 / 1024)

# 1402×1122 sheets — painted buttons begin ~y 575.
_FRAC_1402 = (28 / 1536, 55 / 1024, 495 / 1536, 568 / 1122)

# Sheets with different aspect ratios need their own content-end fraction.
FRAC_OVERRIDES: dict[str, tuple[float, float, float, float]] = {
    # Maya sheet is shorter — keep Decision Lens, avoid layout C.
    "technology-future": (28 / 1536, 55 / 1024, 495 / 1536, 520 / 1024),
    "founder-advocate": _FRAC_1402,
    "strategy-director": _FRAC_1402,
    "growth-opportunity": _FRAC_1402,
    "risk-resilience": _FRAC_1402,
    "values-trust": _FRAC_1402,
    "devils-advocate": _FRAC_1402,
}

# Prefer docs when art matches live registry names; else public role sheets.
SHEETS: dict[str, Path] = {
    "board-chair": PUBLIC / "thomas-ellison-chairman-of-the-board.png",
    "vice-chair": PUBLIC / "shari-menon-vice-chair.png",
    "founder-advocate": PUBLIC / "david-kim-founder-advocate-director.png",
    "strategy-director": PUBLIC / "victoria-hayes-strategy-director.png",
    "financial-stewardship": PUBLIC
    / "melissa-grant-financial-stewardship-director.png",
    "operations-capacity": PUBLIC
    / "marcus-whitaker-operations-and-capacity-director.png",
    "customer-market": PUBLIC / "sofia-ramirez-customer-and-market-director.png",
    "growth-opportunity": PUBLIC
    / "james-holloway-growth-and-opportunity-director.png",
    "risk-resilience": PUBLIC / "laura-bennett-risk-and-resilence-director.png",
    "technology-future": DOCS / "maya-chen-technology-and-future-director.png",
    "values-trust": DOCS / "carlos-rivera-values-and-trust-director.png",
    "devils-advocate": PUBLIC / "mateo-vargas-devils-advocate-director.png",
}


def extract(director_id: str, sheet: Path) -> Path:
    if not sheet.exists():
        raise FileNotFoundError(sheet)
    im = Image.open(sheet).convert("RGBA")
    w, h = im.size
    left, top, right, bottom = FRAC_OVERRIDES.get(director_id, FRAC)
    box = (
        int(left * w),
        int(top * h),
        int(right * w),
        int(bottom * h),
    )
    card = im.crop(box)
    out = OUT / f"{director_id}-gallery-portrait.png"
    card.save(out, format="PNG", optimize=True)
    print(f"{director_id}: {sheet.name} {im.size} -> {out.name} {card.size}")
    return out


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for director_id, sheet in SHEETS.items():
        extract(director_id, sheet)


if __name__ == "__main__":
    main()
