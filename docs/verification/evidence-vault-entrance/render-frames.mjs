import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assets = path.join(__dirname, "assets");
const out = __dirname;
const W = 1535;
const H = 1024;
const PORTAL = { left: 390, top: 200, right: 1075, bottom: 910 };

async function composeClosed({ unlock = false, outfile }) {
  const portalW = PORTAL.right - PORTAL.left;
  const portalH = PORTAL.bottom - PORTAL.top;
  const writingPortal = await sharp(path.join(assets, "writing-room-background.png"))
    .resize(portalW, portalH, { fit: "cover", position: "centre" })
    .toBuffer();
  const leftDoor = await sharp(
    path.join(assets, "evidence-vault-door-left.png"),
  ).toBuffer();
  const rightDoor = await sharp(
    path.join(assets, "evidence-vault-door-right.png"),
  ).toBuffer();

  const keyX = unlock ? 720 : 950;
  const keyY = unlock ? 470 : 410;
  const rot = unlock ? 90 : 0;
  const keySvg = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgb(255,220,150)" stop-opacity="0.75"/>
      <stop offset="100%" stop-color="rgb(255,220,150)" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="745" cy="530" r="40" fill="url(#g)"/>
  ${
    unlock
      ? '<circle cx="745" cy="530" r="56" fill="rgb(255,245,200)" fill-opacity="0.5"/>'
      : ""
  }
  <g transform="translate(${keyX},${keyY}) rotate(${rot} 20 40)">
    <ellipse cx="20" cy="18" rx="12" ry="14" fill="none" stroke="#c9a46b" stroke-width="4"/>
    <rect x="16" y="30" width="8" height="52" rx="2" fill="#c9a46b"/>
    <rect x="24" y="62" width="12" height="6" fill="#c9a46b"/>
    <rect x="24" y="74" width="14" height="6" fill="#c9a46b"/>
  </g>
</svg>`);

  await sharp(path.join(assets, "evidence-vault-room-static.png"))
    .composite([
      { input: writingPortal, top: PORTAL.top, left: PORTAL.left },
      { input: leftDoor, top: PORTAL.top, left: PORTAL.left },
      { input: rightDoor, top: PORTAL.top, left: 745 },
      { input: keySvg, top: 0, left: 0 },
    ])
    .png()
    .toFile(path.join(out, outfile));
  console.log("wrote", outfile);
}

await composeClosed({ outfile: "01-arrival-closed.png" });
await composeClosed({ unlock: true, outfile: "02-unlocking.png" });
console.log("done");
