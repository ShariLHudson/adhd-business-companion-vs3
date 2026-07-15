/**
 * Adaptive Clear My Mind next steps — by count and relatedness, not a fixed menu.
 */

import type { BrainDumpEntry } from "@/lib/companionStore";

export type AdaptiveNextStepId =
  | "make-next-step"
  | "keep-adding"
  | "save-for-later"
  | "help-me-choose"
  | "keep-separate"
  | "turn-into-project"
  | "keep-loose-list"
  | "help-decide-attention"
  | "help-make-sense"
  | "organize-life-area"
  | "choose-different-view"
  | "keep-flat-list"
  | "start-with-this"
  | "show-another"
  | "return-welcome"
  | "stay-here";

export type AdaptiveNextStep = {
  id: AdaptiveNextStepId;
  label: string;
  explanation?: string;
  primary?: boolean;
};

export type AdaptiveNextStepModel = {
  kind:
    | "one"
    | "two-unrelated"
    | "several-related"
    | "several-mixed";
  headline: string;
  body: string;
  primary: AdaptiveNextStep[];
  moreWays: AdaptiveNextStep[];
};

const RELATED_HINTS =
  /\b(project|launch|event|client|proposal|website|course|workshop|webinar|hiring|sales)\b/i;

function textsLookRelated(texts: string[]): boolean {
  if (texts.length < 3) return false;
  const hits = texts.filter((t) => RELATED_HINTS.test(t)).length;
  if (hits >= Math.ceil(texts.length * 0.5)) return true;
  // Shared leading verb / noun stem across majority
  const stems = texts
    .map((t) => t.trim().toLowerCase().split(/\s+/)[0] ?? "")
    .filter((s) => s.length >= 4);
  if (stems.length < 3) return false;
  const counts = new Map<string, number>();
  for (const s of stems) counts.set(s, (counts.get(s) ?? 0) + 1);
  const top = Math.max(...counts.values());
  return top >= Math.ceil(texts.length * 0.5);
}

export function buildAdaptiveNextSteps(
  entries: BrainDumpEntry[],
): AdaptiveNextStepModel {
  const texts = entries
    .map((e) => (e.originalText ?? e.text).trim())
    .filter(Boolean);
  const count = texts.length;

  const moreWays: AdaptiveNextStep[] = [
    { id: "keep-adding", label: "Keep Adding Thoughts" },
    { id: "organize-life-area", label: "Group Similar Thoughts" },
    { id: "turn-into-project", label: "Turn Selected Thoughts Into Projects" },
  ];

  if (count <= 1) {
    return {
      kind: "one",
      headline: "What would help most right now?",
      body: "There’s one thought here. You can make it your next step, keep adding, or save it for later.",
      primary: [
        {
          id: "make-next-step",
          label: "Make This My Next Step",
          primary: true,
        },
        { id: "keep-adding", label: "Keep Adding Thoughts" },
        { id: "save-for-later", label: "Save for Later" },
      ],
      moreWays,
    };
  }

  if (count === 2 && !textsLookRelated(texts)) {
    return {
      kind: "two-unrelated",
      headline: "What would help most right now?",
      body: "These look like separate thoughts. We can choose one to focus on, keep them separate, or save them for later.",
      primary: [
        {
          id: "help-me-choose",
          label: "Help Me Choose",
          primary: true,
        },
        { id: "keep-separate", label: "Keep Them Separate" },
        { id: "save-for-later", label: "Save for Later" },
      ],
      moreWays,
    };
  }

  if (count >= 3 && textsLookRelated(texts)) {
    return {
      kind: "several-related",
      headline: "These may belong together",
      body: "These may be parts of the same project. Would you like me to help set them up together?",
      primary: [
        {
          id: "turn-into-project",
          label: "Turn These Into a Project",
          primary: true,
        },
        { id: "keep-loose-list", label: "Keep as a Loose List" },
        { id: "save-for-later", label: "Save for Later" },
      ],
      moreWays,
    };
  }

  return {
    kind: "several-mixed",
    headline: "What Would Help Most Right Now?",
    body: "Everything is safely out of your head. Choose one helpful next step — or save everything without deciding more.",
    primary: [
      {
        id: "help-decide-attention",
        label: "Help Me Decide What Deserves Attention First",
        explanation:
          "Help me find one useful place to begin without organizing everything.",
        primary: true,
      },
      {
        id: "help-make-sense",
        label: "Help Me Make Sense of These",
        explanation: "Organize or explore the thoughts in a useful way.",
      },
      {
        id: "save-for-later",
        label: "Save These for Later",
        explanation:
          "Keep everything safely captured without making another decision right now.",
      },
    ],
    moreWays,
  };
}
