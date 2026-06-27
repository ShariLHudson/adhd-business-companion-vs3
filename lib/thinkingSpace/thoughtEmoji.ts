/**
 * Natural-language emoji for Companion Boxes — not categories.
 */

const RULES: { pattern: RegExp; emoji: string }[] = [
  { pattern: /\b(call|phone|dr\.|doctor|appointment)\b/i, emoji: "📞" },
  { pattern: /\b(email|inbox|reply|message)\b/i, emoji: "✉️" },
  { pattern: /\b(meet|meeting|calendar|schedule)\b/i, emoji: "📅" },
  { pattern: /\b(project|build|code|ecosystem|app|website)\b/i, emoji: "💻" },
  { pattern: /\b(connect|linkedin|network|follow up|reach out)\b/i, emoji: "🤝" },
  { pattern: /\b(money|invoice|pay|budget|revenue)\b/i, emoji: "💰" },
  { pattern: /\b(write|blog|content|post|newsletter)\b/i, emoji: "✍️" },
  { pattern: /\b(idea|brainstorm|think)\b/i, emoji: "💡" },
  { pattern: /\b(worry|anxious|stress|overwhelm)\b/i, emoji: "🌿" },
  { pattern: /\b(family|kids|partner|mom|dad)\b/i, emoji: "🏠" },
  { pattern: /\b(health|exercise|sleep|walk)\b/i, emoji: "🌱" },
];

export function thoughtDisplayEmoji(text: string): string {
  const t = text.trim();
  for (const { pattern, emoji } of RULES) {
    if (pattern.test(t)) return emoji;
  }
  return "💭";
}
