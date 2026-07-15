"""
Rebuild Leadership + Momentum Chamber member cards from available source art.
One-time asset repair — not imported by the app.
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "momentum-chamber-members"
PC_TEMPLATE = OUT / "people-culture-chamber-member.png"
LEAD_ONESHEET = ROOT / "public" / "momemtum chamber members one sheets" / "leadership onesheet.png"
MOM_EXISTING = OUT / "momentum-chamber-member.png"


def load_font(size: int, bold: bool = False) -> ImageFont.ImageFont:
    candidates = [
        "C:/Windows/Fonts/georgia.ttf" if not bold else "C:/Windows/Fonts/georgiab.ttf",
        "C:/Windows/Fonts/times.ttf",
        "C:/Windows/Fonts/arial.ttf",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size=size)
        except OSError:
            continue
    return ImageFont.load_default()


def wrap_text(
    draw: ImageDraw.ImageDraw,
    text: str,
    font: ImageFont.ImageFont,
    max_width: int,
) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        trial = f"{current} {word}".strip()
        if draw.textlength(trial, font=font) <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_right_panel(
    card: Image.Image,
    *,
    title: str,
    tagline: str,
    body: str,
    specialties: list[str],
    ask_label: str,
    accent: tuple[int, int, int],
) -> None:
    w, h = card.size
    left_w = int(w * 0.48)
    draw = ImageDraw.Draw(card)
    cream = (250, 246, 236)
    gold = (184, 149, 74)
    draw.rectangle((left_w, 0, w, h - 70), fill=cream)

    title_font = load_font(54, bold=True)
    role_font = load_font(18, bold=True)
    tag_font = load_font(26, bold=True)
    body_font = load_font(18)
    spec_head = load_font(18, bold=True)
    spec_font = load_font(17)
    ask_font = load_font(22, bold=True)

    pad_x = left_w + 36
    max_text = w - pad_x - 36
    y = 48

    # logo circle
    cx, cy, r = left_w + (w - left_w) // 2, y + 28, 28
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), outline=gold, width=3)
    y = cy + r + 28

    # title centered
    tw = draw.textlength(title, font=title_font)
    draw.text(((left_w + w) / 2 - tw / 2, y), title, font=title_font, fill=accent)
    y += 70

    # role
    role = "COUNCIL MEMBER"
    rw = draw.textlength(role, font=role_font)
    line_y = y + 10
    draw.line((pad_x, line_y, (left_w + w) / 2 - rw / 2 - 12, line_y), fill=gold, width=2)
    draw.line(((left_w + w) / 2 + rw / 2 + 12, line_y, w - 36, line_y), fill=gold, width=2)
    draw.text(((left_w + w) / 2 - rw / 2, y), role, font=role_font, fill=gold)
    y += 48

    for line in wrap_text(draw, tagline, tag_font, max_text):
        draw.text((pad_x, y), line, font=tag_font, fill=accent)
        y += 32
    y += 8

    for line in wrap_text(draw, body, body_font, max_text):
        draw.text((pad_x, y), line, font=body_font, fill=(40, 55, 70))
        y += 24
    y += 18

    draw.text((pad_x, y), "SPECIALIZES IN", font=spec_head, fill=gold)
    y += 30
    for item in specialties:
        draw.ellipse((pad_x, y + 7, pad_x + 8, y + 15), fill=gold)
        draw.text((pad_x + 16, y), item, font=spec_font, fill=(40, 55, 70))
        y += 26
        if y > h - 110:
            break

    # ask bar
    draw.rectangle((0, h - 70, w, h), fill=accent)
    draw.text((48, h - 48), ask_label, font=ask_font, fill=gold)


def compose_card(
    *,
    portrait: Image.Image,
    title: str,
    tagline: str,
    body: str,
    specialties: list[str],
    ask_label: str,
    accent: tuple[int, int, int],
    out_path: Path,
) -> None:
    template = Image.open(PC_TEMPLATE).convert("RGB")
    w, h = template.size
    left_w = int(w * 0.48)
    card = Image.new("RGB", (w, h), (250, 246, 236))

    # Fit portrait into left column (above ask bar)
    portrait_h = h - 70
    src = portrait.convert("RGB")
    # cover-fit
    scale = max(left_w / src.width, portrait_h / src.height)
    nw, nh = int(src.width * scale), int(src.height * scale)
    src = src.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - left_w) // 2
    top = (nh - portrait_h) // 2
    src = src.crop((left, top, left + left_w, top + portrait_h))
    card.paste(src, (0, 0))

    # gold frame on portrait
    draw = ImageDraw.Draw(card)
    draw.rectangle((2, 2, left_w - 3, portrait_h - 3), outline=(184, 149, 74), width=3)

    draw_right_panel(
        card,
        title=title,
        tagline=tagline,
        body=body,
        specialties=specialties,
        ask_label=ask_label,
        accent=accent,
    )
    card.save(out_path, format="PNG", optimize=True)
    print(f"Wrote {out_path} ({card.size[0]}x{card.size[1]})")


def main() -> None:
    # Leadership portrait from onesheet (photographic inset only)
    onesheet = Image.open(LEAD_ONESHEET)
    # Photo band is roughly x=40..375, y=80..585 on the 1024x1536 onesheet
    leadership_portrait = onesheet.crop((40, 80, 375, 585))

    compose_card(
        portrait=leadership_portrait,
        title="Leadership",
        tagline="I PROTECT YOUR LEADERSHIP.",
        body=(
            "I help you lead with clarity when ADHD makes decisions, people, "
            "and priorities feel heavy — so you can guide with steadiness and grace."
        ),
        specialties=[
            "Decision clarity",
            "Team direction",
            "Priority setting",
            "Boundary setting",
            "Confidence under pressure",
            "Delegation",
            "Leadership rhythms",
            "ADHD-friendly leading",
            "Conflict & conversations",
            "Vision to action",
            "Sustainable pace",
            "Protecting focus",
        ],
        ask_label="ASK LEADERSHIP",
        accent=(26, 61, 92),
        out_path=OUT / "leadership-chamber-member.png",
    )

    # Momentum: keep photographic left half; rebuild branded right panel
    mom = Image.open(MOM_EXISTING).convert("RGB")
    mw, mh = mom.size
    left_w = int(mw * 0.48)
    momentum_portrait = mom.crop((0, 0, left_w, mh - 70))

    compose_card(
        portrait=momentum_portrait,
        title="Momentum",
        tagline="I GET YOU MOVING FORWARD.",
        body=(
            "I help you turn intention into sustainable movement by finding the "
            "smallest honest next step and protecting it from friction."
        ),
        specialties=[
            "Getting unstuck",
            "Restarting after interruption",
            "Reducing friction",
            "Maintaining progress",
            "Taking the first step",
            "ADHD-friendly planning",
            "Prioritization",
            "Breaking down projects",
            "Focus & follow-through",
            "Overcoming procrastination",
            "Building habits",
            "Celebrating progress",
        ],
        ask_label="ASK MOMENTUM",
        accent=(20, 70, 62),
        out_path=OUT / "momentum-chamber-member.png",
    )


if __name__ == "__main__":
    main()
