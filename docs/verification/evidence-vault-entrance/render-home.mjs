import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const W = 1600;
const H = 900;

const folioSvg = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgb(42,30,20)" stop-opacity="0.82"/>
      <stop offset="100%" stop-color="rgb(22,15,10)" stop-opacity="0.72"/>
    </linearGradient>
  </defs>
  <rect x="${W - 430}" y="${H - 360}" width="390" height="320" rx="14" fill="url(#g)" stroke="rgba(201,166,107,0.45)" stroke-width="1.5"/>
  <text x="${W - 410}" y="${H - 325}" fill="rgba(201,166,107,0.95)" font-family="Segoe UI, sans-serif" font-size="11" letter-spacing="2">A PRIVATE ARCHIVE</text>
  <text x="${W - 410}" y="${H - 295}" fill="#f8f0e0" font-family="Georgia, serif" font-size="28">Evidence Vault</text>
  <foreignObject x="${W - 410}" y="${H - 280}" width="350" height="70">
    <div xmlns="http://www.w3.org/1999/xhtml" style="color:rgba(236,224,204,0.9);font:13px/1.4 Georgia,serif;">
      Preserve what happened, what you learned, problems solved, people helped, things created, growth — plus attachments, files, and links.
    </div>
  </foreignObject>
  <rect x="${W - 410}" y="${H - 200}" width="165" height="58" rx="8" fill="rgba(255,248,230,0.92)"/>
  <text x="${W - 395}" y="${H - 175}" fill="#1f1c19" font-family="Segoe UI, sans-serif" font-size="13" font-weight="700">Create Evidence</text>
  <text x="${W - 395}" y="${H - 158}" fill="#1f1c19" font-family="Segoe UI, sans-serif" font-size="11" opacity="0.7">New page</text>
  <rect x="${W - 230}" y="${H - 200}" width="165" height="58" rx="8" fill="rgba(255,248,235,0.12)" stroke="rgba(201,166,107,0.35)"/>
  <text x="${W - 215}" y="${H - 175}" fill="#f0e6d6" font-family="Segoe UI, sans-serif" font-size="13" font-weight="700">Browse Evidence</text>
  <text x="${W - 215}" y="${H - 158}" fill="#f0e6d6" font-family="Segoe UI, sans-serif" font-size="11" opacity="0.7">Archive</text>
  <rect x="${W - 410}" y="${H - 130}" width="165" height="58" rx="8" fill="rgba(255,248,235,0.12)" stroke="rgba(201,166,107,0.35)"/>
  <text x="${W - 395}" y="${H - 105}" fill="#f0e6d6" font-family="Segoe UI, sans-serif" font-size="13" font-weight="700">Add Attachment</text>
  <text x="${W - 395}" y="${H - 88}" fill="#f0e6d6" font-family="Segoe UI, sans-serif" font-size="11" opacity="0.7">File · photo</text>
  <rect x="${W - 230}" y="${H - 130}" width="165" height="58" rx="8" fill="rgba(255,248,235,0.12)" stroke="rgba(201,166,107,0.35)"/>
  <text x="${W - 215}" y="${H - 105}" fill="#f0e6d6" font-family="Segoe UI, sans-serif" font-size="13" font-weight="700">Add Link</text>
  <text x="${W - 215}" y="${H - 88}" fill="#f0e6d6" font-family="Segoe UI, sans-serif" font-size="11" opacity="0.7">Keep a link</text>
</svg>`);

await sharp(path.join(__dirname, "assets/writing-room-background.png"))
  .resize(W, H, { fit: "cover", position: "centre" })
  .composite([{ input: folioSvg, top: 0, left: 0 }])
  .png()
  .toFile(path.join(__dirname, "04-final-vault-room.png"));

console.log("wrote 04-final-vault-room.png");
