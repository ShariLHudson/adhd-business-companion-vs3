import fs from "fs";
import path from "path";

const emojiRe =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}\u{200D}]/gu;
const roots = ["app", "components", "lib"];
const skipDirs = new Set(["node_modules", ".next", ".git"]);
const byFile = {};

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (!skipDirs.has(ent.name)) walk(p);
      continue;
    }
    if (!/\.(tsx?|jsx?|css)$/.test(ent.name)) continue;
    if (/\.test\.(tsx?)$/.test(ent.name)) continue;
    const text = fs.readFileSync(p, "utf8");
    const lines = text.split(/\n/);
    const hits = [];
    lines.forEach((ln, i) => {
      const em = [...ln.matchAll(emojiRe)];
      if (!em.length) return;
      hits.push({
        line: i + 1,
        emojis: [...new Set(em.map((x) => x[0]))],
        snippet: ln.trim().slice(0, 100),
      });
    });
    if (hits.length) byFile[p.replace(/\\/g, "/")] = hits;
  }
}

roots.forEach(walk);
const emojiCounts = {};
for (const hits of Object.values(byFile)) {
  for (const h of hits) {
    for (const e of h.emojis) {
      emojiCounts[e] = (emojiCounts[e] ?? 0) + 1;
    }
  }
}
const summary = {
  scannedAt: new Date().toISOString(),
  fileCount: Object.keys(byFile).length,
  uniqueEmojiCount: Object.keys(emojiCounts).length,
  topEmojis: Object.entries(emojiCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40),
  filesByHitCount: Object.entries(byFile)
    .map(([f, h]) => ({ file: f, hitLines: h.length }))
    .sort((a, b) => b.hitLines - a.hitLines),
};
fs.mkdirSync("docs/companion-object-library", { recursive: true });
fs.writeFileSync(
  "docs/companion-object-library/emoji-audit.json",
  JSON.stringify({ summary, files: byFile }, null, 2),
);
console.log(JSON.stringify(summary, null, 2));
