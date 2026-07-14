/**
 * Rebuild room-static (open portal) + interior-reveal plates from the approved closed source.
 * Door leaf crops are left untouched.
 */
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "public", "backgrounds");
const SRC = path.join(ROOT, "evidence-vault-background.png");
const W = 1535;
const H = 1024;
const L = 390;
const T = 200;
const R = 1075;
const B = 910;
const PW = R - L;
const PH = B - T;

async function main() {
  const base = await sharp(SRC).ensureAlpha().png().toBuffer();

  const portalSvg = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${PW}" height="${PH}" viewBox="0 0 ${PW} ${PH}">
  <defs>
    <radialGradient id="void" cx="50%" cy="42%" r="68%">
      <stop offset="0%" stop-color="#2a1c12"/>
      <stop offset="45%" stop-color="#140e0a"/>
      <stop offset="100%" stop-color="#070504"/>
    </radialGradient>
    <linearGradient id="edge" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#000" stop-opacity="0.55"/>
      <stop offset="12%" stop-color="#000" stop-opacity="0"/>
      <stop offset="88%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.55"/>
    </linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="70%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#1a120c" stop-opacity="0.65"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#void)"/>
  <rect width="100%" height="100%" fill="url(#edge)"/>
  <rect width="100%" height="100%" fill="url(#floor)"/>
  <ellipse cx="${PW * 0.5}" cy="${PH * 0.38}" rx="${PW * 0.18}" ry="${PH * 0.12}" fill="#c9a46a" opacity="0.08"/>
</svg>`);

  const portal = await sharp(portalSvg).png().toBuffer();

  await sharp(base)
    .composite([{ input: portal, left: L, top: T }])
    .png()
    .toFile(path.join(ROOT, "evidence-vault-room-static.png"));

  const interiorSvg = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="room" cx="48.5%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#3d2a1a"/>
      <stop offset="35%" stop-color="#1c130e"/>
      <stop offset="100%" stop-color="#050302"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#room)"/>
  <ellipse cx="745" cy="420" rx="160" ry="220" fill="#e8c98a" opacity="0.06"/>
  <ellipse cx="745" cy="520" rx="90" ry="40" fill="#d4b07a" opacity="0.05"/>
</svg>`);

  await sharp(interiorSvg)
    .png()
    .toFile(path.join(ROOT, "evidence-vault-interior-reveal.png"));

  const { data, info } = await sharp(
    path.join(ROOT, "evidence-vault-room-static.png"),
  )
    .extract({ left: L + 80, top: T + 80, width: 200, height: 200 })
    .raw()
    .toBuffer({ resolveWithObject: true });
  let r = 0;
  let g = 0;
  let b = 0;
  const n = info.width * info.height;
  for (let i = 0; i < data.length; i += info.channels) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }
  console.log(
    "room-static portal sample mean",
    (r / n) | 0,
    (g / n) | 0,
    (b / n) | 0,
  );
  console.log("wrote room-static + interior-reveal");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
