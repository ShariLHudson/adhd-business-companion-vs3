import {
  detectEmotionalState,
  detectObstacle,
  PRESENCE_LINES,
} from "../lib/companionEmotions.ts";

const cases = [
  ["Pricing", "I've been circling my pricing page for weeks. I know I'm undercharging but I can't bring myself to raise rates."],
  ["Financial T1", "My income this month is scary and unpredictable — I'm panicking about bills."],
  ["Inbox shame", "I have 847 unread emails and I can't open my inbox without a shame spiral starting."],
  ["Rejection T1", "Got a no on a proposal yesterday and now I can't send anything else out."],
  ["Comparison", "Everyone in my niche seems years ahead of me. I scroll LinkedIn and feel sick comparing myself."],
];

for (const [label, text] of cases) {
  const e = detectEmotionalState(text);
  const o = detectObstacle(text);
  console.log(`${label}: emotion=${e} obstacle=${o ?? "—"} presence="${PRESENCE_LINES[e]}"`);
}
