import fs from "fs";
const p = "lib/assistedActionBridge.ts";
let t = fs.readFileSync(p, "utf8");
t = t.replace(/\bemoji: "([^"]+)"/g, (match, emoji) => {
  const map = {
    "📄": "templates",
    "✉️": "email-generator",
    "📱": "create",
    "📋": "templates",
    "📞": "messages",
    "🧠": "clear-my-mind",
    "📁": "projects",
    "📅": "calendar",
  };
  return `objectId: "${map[emoji] ?? "create"}"`;
});
fs.writeFileSync(p, t);
