import {
  detectEmotionalState,
  detectObstacle,
} from "../lib/companionEmotions.ts";

const cases = [
  {
    label: "Pricing",
    text: "I have no idea what to charge. What if I price it too high and nobody buys?",
    expect: { obstacle: "self_doubt" },
  },
  {
    label: "Financial panic",
    text: "Income is feast or famine and I'm panicking about bills.",
    expect: { emotion: "emotional", obstacle: "scarcity_fear" },
  },
  {
    label: "Inbox shame",
    text: "I have hundreds of unread emails and I can't open my inbox.",
    expect: { emotion: "stuck", obstacle: "shame" },
  },
  {
    label: "Rejection",
    text: "I got a no and now I don't want to try again.",
    expect: { obstacle: "rejection_fear" },
  },
  {
    label: "Comparison",
    text: "Everyone in my niche seems years ahead of me.",
    expect: { obstacle: "comparison" },
  },
];

let failed = 0;
for (const { label, text, expect } of cases) {
  const emotion = detectEmotionalState(text);
  const obstacle = detectObstacle(text);
  const ok =
    (!expect.emotion || emotion === expect.emotion) &&
    (!expect.obstacle || obstacle === expect.obstacle);
  if (!ok) {
    failed++;
    console.log(`FAIL ${label}`);
    console.log(`  got: emotion=${emotion} obstacle=${obstacle ?? "—"}`);
    console.log(`  want: emotion=${expect.emotion ?? "*"} obstacle=${expect.obstacle ?? "*"}`);
  } else {
    console.log(`PASS ${label}: emotion=${emotion} obstacle=${obstacle ?? "—"}`);
  }
}

if (failed) {
  console.log(`\n${failed} failed`);
  process.exit(1);
}
console.log("\nAll validation cases passed.");
