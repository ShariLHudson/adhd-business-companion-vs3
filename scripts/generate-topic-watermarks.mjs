import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "../public/images/journal-gazebo/topic-watermarks");
fs.mkdirSync(dir, { recursive: true });

function svg(inner) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320" fill="none">
  <defs>
    <radialGradient id="fade" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#6b5540" stop-opacity="0.42"/>
      <stop offset="70%" stop-color="#6b5540" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#6b5540" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="160" cy="160" r="150" fill="url(#fade)"/>
  ${inner}
</svg>
`;
}

function textMark(lines, size = 28) {
  const start = 160 - ((lines.length - 1) * (size * 1.15)) / 2;
  return lines
    .map(
      (t, i) =>
        `<text x="160" y="${start + i * size * 1.15}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${size}" font-style="italic" fill="#5a4634" fill-opacity="0.55">${t}</text>`,
    )
    .join("\n  ");
}

const marks = {
  "prayer-be-still": textMark(["Be still"], 36),
  "prayer-peace": textMark(["Peace"], 40),
  "prayer-faith": textMark(["Faith"], 40),
  "prayer-light":
    `<circle cx="160" cy="130" r="28" stroke="#5a4634" stroke-opacity="0.4" stroke-width="2" fill="none"/>
  <path d="M160 70 V250 M145 95 H175" stroke="#5a4634" stroke-opacity="0.4" stroke-width="2.5"/>`,
  "gratitude-enough": textMark(["enough"], 34),
  "gratitude-bloom":
    `<path d="M160 200 C140 160 120 130 160 90 C200 130 180 160 160 200 Z" stroke="#5a4634" stroke-opacity="0.45" fill="#5a4634" fill-opacity="0.08" stroke-width="2"/>
  <path d="M160 200 V250" stroke="#5a4634" stroke-opacity="0.35" stroke-width="2"/>`,
  "gratitude-sun":
    `<circle cx="160" cy="160" r="36" stroke="#5a4634" stroke-opacity="0.4" stroke-width="2" fill="none"/>
  <line x1="160" y1="100" x2="160" y2="80" stroke="#5a4634" stroke-opacity="0.35" stroke-width="2"/>
  <line x1="160" y1="240" x2="160" y2="220" stroke="#5a4634" stroke-opacity="0.35" stroke-width="2"/>
  <line x1="100" y1="160" x2="80" y2="160" stroke="#5a4634" stroke-opacity="0.35" stroke-width="2"/>
  <line x1="240" y1="160" x2="220" y2="160" stroke="#5a4634" stroke-opacity="0.35" stroke-width="2"/>`,
  "gratitude-heart":
    `<path d="M160 220 C120 190 95 155 115 125 C130 105 150 115 160 135 C170 115 190 105 205 125 C225 155 200 190 160 220 Z" stroke="#5a4634" stroke-opacity="0.42" fill="#5a4634" fill-opacity="0.07" stroke-width="2"/>`,
  "health-leaf":
    `<path d="M160 250 C110 200 100 140 160 80 C220 140 210 200 160 250 Z" stroke="#5a4634" stroke-opacity="0.42" fill="#5a4634" fill-opacity="0.07" stroke-width="2"/>
  <path d="M160 250 V110" stroke="#5a4634" stroke-opacity="0.3" stroke-width="1.5"/>`,
  "health-rest": textMark(["rest"], 38),
  "health-water":
    `<path d="M160 80 C160 80 100 170 100 210 C100 245 128 270 160 270 C192 270 220 245 220 210 C220 170 160 80 160 80 Z" stroke="#5a4634" stroke-opacity="0.42" fill="#5a4634" fill-opacity="0.07" stroke-width="2"/>`,
  "health-breath": textMark(["breathe"], 32),
  "creative-ink":
    `<path d="M120 240 C140 180 150 120 160 90 C170 120 180 180 200 240" stroke="#5a4634" stroke-opacity="0.4" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="160" cy="250" r="10" fill="#5a4634" fill-opacity="0.25"/>`,
  "creative-spark":
    `<path d="M160 70 L172 140 L240 152 L172 164 L160 250 L148 164 L80 152 L148 140 Z" stroke="#5a4634" stroke-opacity="0.4" fill="#5a4634" fill-opacity="0.08" stroke-width="2"/>`,
  "creative-brush":
    `<path d="M200 90 L130 210" stroke="#5a4634" stroke-opacity="0.4" stroke-width="4" stroke-linecap="round"/>
  <path d="M118 220 C110 235 125 250 145 240" stroke="#5a4634" stroke-opacity="0.4" stroke-width="3" fill="none"/>`,
  "creative-star": textMark(["create"], 34),
  "business-compass":
    `<circle cx="160" cy="160" r="70" stroke="#5a4634" stroke-opacity="0.4" stroke-width="2" fill="none"/>
  <circle cx="160" cy="160" r="6" fill="#5a4634" fill-opacity="0.35"/>
  <path d="M160 100 L172 160 L160 220 L148 160 Z" fill="#5a4634" fill-opacity="0.2" stroke="#5a4634" stroke-opacity="0.4" stroke-width="1.5"/>`,
  "business-clarity": textMark(["clarity"], 32),
  "business-quill":
    `<path d="M210 85 C180 120 150 170 130 230" stroke="#5a4634" stroke-opacity="0.42" stroke-width="2.5" fill="none"/>
  <path d="M210 85 C195 95 185 110 178 125" stroke="#5a4634" stroke-opacity="0.35" stroke-width="1.5" fill="none"/>`,
  "business-path": textMark(["forward"], 30),
  "journey-path":
    `<path d="M90 230 C130 200 140 180 160 150 C180 120 200 100 240 90" stroke="#5a4634" stroke-opacity="0.4" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="240" cy="90" r="5" fill="#5a4634" fill-opacity="0.35"/>`,
  "journey-dawn":
    `<path d="M70 190 Q160 120 250 190" stroke="#5a4634" stroke-opacity="0.4" stroke-width="2" fill="none"/>
  <circle cx="160" cy="150" r="22" stroke="#5a4634" stroke-opacity="0.4" stroke-width="2" fill="#5a4634" fill-opacity="0.08"/>`,
  "journey-open": textMark(["begin"], 36),
  "journey-page": textMark(["this page"], 28),
};

for (const [name, inner] of Object.entries(marks)) {
  fs.writeFileSync(path.join(dir, `${name}.svg`), svg(inner));
}

console.log(`wrote ${Object.keys(marks).length} topic watermarks to ${dir}`);
