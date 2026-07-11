import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const dirs = ["app", "components", "lib"];
let count = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      walk(full);
      continue;
    }
    if (!/\.(ts|tsx|css)$/.test(entry.name)) continue;
    const text = fs.readFileSync(full, "utf8");
    if (!text.includes("\u2122")) continue;
    fs.writeFileSync(full, text.replaceAll("\u2122", ""), "utf8");
    count += 1;
    console.log(full);
  }
}

for (const dir of dirs) {
  walk(path.join(root, dir));
}

console.log(`Updated ${count} files.`);
