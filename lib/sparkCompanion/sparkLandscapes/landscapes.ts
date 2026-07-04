import type { SparkLandscapeId } from "./types";
import {
  SPARK_LANDSCAPE_CORE_RULE,
  SPARK_LANDSCAPE_FORBIDDEN,
  SPARK_LANDSCAPE_QUESTION,
} from "./types";

export const SPARK_LANDSCAPES: Readonly<
  Record<
    SparkLandscapeId,
    {
      emoji: string;
      name: string;
      represents: readonly string[];
      sparkResponse: readonly string[];
      helpFocus: string;
      gentleMetaphor: string;
      estateHints: readonly string[];
    }
  >
> = {
  fog: {
    emoji: "🌫",
    name: "The Fog",
    represents: [
      "mental overload",
      "brain fog",
      "fatigue",
      "too much information",
      "difficulty concentrating",
    ],
    sparkResponse: [
      "Reduce pressure",
      "Simplify",
      "One next step",
      "Rest if appropriate",
    ],
    helpFocus: "Simplify",
    gentleMetaphor: "I'm wondering if today feels a little like being in the Fog.",
    estateHints: ["peaceful-places", "focus-audio", "pool"],
  },
  backpack: {
    emoji: "🎒",
    name: "The Backpack",
    represents: [
      "emotional weight",
      "fear",
      "perfectionism",
      "guilt",
      "shame",
      "expectations",
    ],
    sparkResponse: [
      "Identify what can be put down",
      "Reduce emotional load",
      "Normalize",
      "Avoid productivity first",
    ],
    helpFocus: "Reduce emotional load",
    gentleMetaphor: "It sounds like today you're carrying a heavy Backpack.",
    estateHints: ["journal-gazebo", "pond"],
  },
  crossroads: {
    emoji: "🌳",
    name: "The Crossroads",
    represents: [
      "too many choices",
      "decision fatigue",
      "uncertainty",
      "competing priorities",
    ],
    sparkResponse: [
      "Eliminate options",
      "Compare choices",
      "Do not create more options",
    ],
    helpFocus: "Reduce decisions",
    gentleMetaphor: "I think today we're standing at a crossroads.",
    estateHints: ["round-table", "decision-compass"],
  },
  maze: {
    emoji: "🌾",
    name: "The Maze",
    represents: [
      "confusion",
      "lack of clarity",
      "difficulty organizing thoughts",
    ],
    sparkResponse: [
      "Zoom out",
      "Organize ideas",
      "Clarify before solving",
    ],
    helpFocus: "Clarify before solving",
    gentleMetaphor: "It sounds like the thoughts might feel a bit tangled right now.",
    estateHints: ["clear-my-mind", "library"],
  },
  bridge: {
    emoji: "🌉",
    name: "The Bridge",
    represents: [
      "project feels too large",
      "difficulty starting",
      "executive function friction",
    ],
    sparkResponse: [
      "Next plank only",
      "One tiny action",
      "Celebrate starting not finishing",
    ],
    helpFocus: "Reduce task size",
    gentleMetaphor: "We don't need the whole bridge today — only the next plank.",
    estateHints: ["momentum-room", "creative-studio"],
  },
  mirror_pond: {
    emoji: "🪞",
    name: "The Mirror Pond",
    represents: [
      "loss of confidence",
      "negative self-talk",
      "forgetting past success",
    ],
    sparkResponse: [
      "Show evidence",
      "Remind of wins",
      "Never generic encouragement",
    ],
    helpFocus: "Restore perspective",
    gentleMetaphor: "Sometimes the Mirror Pond shows a harsher reflection than the truth.",
    estateHints: ["hall-of-accomplishments", "celebration-garden"],
  },
  mountain: {
    emoji: "⛰",
    name: "The Mountain",
    represents: ["long-term goals", "slow progress", "large projects"],
    sparkResponse: [
      "Reduce pressure",
      "Highlight progress made",
      "Encourage patience",
    ],
    helpFocus: "Encourage persistence",
    gentleMetaphor: "The Mountain is still there — and so is how far you've already climbed.",
    estateHints: ["greenhouse", "momentum-room"],
  },
  river: {
    emoji: "🌊",
    name: "The River",
    represents: ["life transitions", "uncertainty", "change"],
    sparkResponse: [
      "Next stepping stone",
      "Avoid overwhelming long-term planning",
    ],
    helpFocus: "Find the next step",
    gentleMetaphor: "Transitions can feel like standing in the River — we only need the next stone.",
    estateHints: ["pond", "journal-gazebo"],
  },
  seed: {
    emoji: "🌱",
    name: "The Seed",
    represents: [
      "progress not yet visible",
      "building foundations",
      "early-stage growth",
    ],
    sparkResponse: [
      "Growth before visible results",
      "Encourage persistence",
    ],
    helpFocus: "Encourage persistence",
    gentleMetaphor: "Important growth often happens before anything looks different above ground.",
    estateHints: ["greenhouse"],
  },
  campfire: {
    emoji: "🔥",
    name: "The Campfire",
    represents: ["reflection", "processing", "connection", "restoration"],
    sparkResponse: [
      "Stay present",
      "Listen more than solve",
      "Do not rush to action",
    ],
    helpFocus: "Stay present",
    gentleMetaphor: "Maybe today is more Campfire than construction — and that's valid.",
    estateHints: ["coffee-house", "pond", "journal-gazebo"],
  },
};

export const SPARK_LANDSCAPES_PROMPT_BLOCK = `# SPARK LANDSCAPES™ (today's weather — not identity)

**Rule:** ${SPARK_LANDSCAPE_CORE_RULE}

**Internal only:** "${SPARK_LANDSCAPE_QUESTION}" — member NEVER chooses a landscape.

**NOT diagnoses · NOT personality types · NOT ADHD categories.** Temporary conditions only. Several landscapes in one week or one day is normal.

**Landscapes:** 🌫 Fog · 🎒 Backpack · 🌳 Crossroads · 🌾 Maze · 🌉 Bridge · 🪞 Mirror Pond · ⛰ Mountain · 🌊 River · 🌱 Seed · 🔥 Campfire

**Influences (invisibly):** conversation style · recommendations · Estate routing · follow-up · encouragement · tools

**Metaphor language — sparingly, never scripted:** "wonder if today feels a little foggy" · "carrying a heavy backpack" · "next plank not whole bridge"

**FORBIDDEN:** ${SPARK_LANDSCAPE_FORBIDDEN.join(" · ")}

**Success:** Members may naturally say "I'm in the Fog today" — shared compassionate language, not a system to learn.

Landscapes quietly influence reasoning — almost invisible to the member.`;

export function landscapeEstatePlaceForLandscape(
  id: SparkLandscapeId,
): string | null {
  const hints = SPARK_LANDSCAPES[id].estateHints;
  return hints[0] ?? null;
}
