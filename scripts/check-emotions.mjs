import {
  detectEmotionalState,
  detectObstacle,
  PRESENCE_LINES,
} from "../lib/companionEmotions.ts";

const cases = [
  [
    "Imposter",
    "Who am I to charge these prices? Everyone else seems more put together than me.",
  ],
  [
    "Time blindness T1",
    "I sat down to work at 9 and suddenly it's 3pm. Where did the day go?",
  ],
  [
    "Time blindness T2",
    "I was busy all day but nothing important moved forward.",
  ],
  [
    "Emotional blend",
    "I don't even know if it's work or life anymore. It's all blended together.",
  ],
];

for (const [label, text] of cases) {
  const e = detectEmotionalState(text);
  const o = detectObstacle(text);
  console.log(
    `${label}: emotion=${e} obstacle=${o ?? "—"} presence="${PRESENCE_LINES[e]}"`,
  );
}
