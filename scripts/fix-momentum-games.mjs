import fs from "fs";
const p = "lib/momentumGames.ts";
let t = fs.readFileSync(p, "utf8");
t = t.replace(/\bemoji: "[^"]+"/g, 'objectId: "games"');
fs.writeFileSync(p, t);
console.log("updated");
