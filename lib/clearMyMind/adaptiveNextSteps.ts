/**
 * Adaptive Clear My Mind next steps — by count and relatedness, not a fixed menu.
 * Package 168: large lists offer Review 5 / Organize / Park Everything / Continue Tomorrow.
 */

import type { BrainDumpEntry } from "@/lib/companionStore";
import {
  CLEAR_MY_MIND_CONTINUE_TOMORROW_LABEL,
  CLEAR_MY_MIND_LET_SHARI_ORGANIZE_LABEL,
  CLEAR_MY_MIND_PARK_EVERYTHING_LABEL,
  CLEAR_MY_MIND_REVIEW_5_LABEL,
  clearMyMindLargeListMessage,
} from "@/lib/clearMyMindCopy";

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
  | "stay-here"
  | "review-batch"
  | "park-everything"
  | "continue-tomorrow";

export type AdaptiveNextStep = {
  id: AdaptiveNextStepId;
  label: string;
  explanation?: string;
  primary?: boolean;
};

export type AdaptiveNextStepModel = {
  kind:
    | "empty"
    | "one"
    | "two-unrelated"
    | "several-related"
    | "several-mixed"
    | "large-list";
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
  const stems = texts
    .map((t) => t.trim().toLowerCase().split(/\s+/)[0] ?? "")
    .filter((s) => s.length >= 4);
  if (stems.length < 3) return false;
  const counts = new Map<string, number>();
  for (const s of stems) counts.set(s, (counts.get(s) ?? 0) + 1);
  const top = Math.max(...counts.values());
  return top >= Math.ceil(texts.length * 0.5);
}

function largeListSteps(): AdaptiveNextStep[] {
  return [
    {
      id: "review-batch",
      label: CLEAR_MY_MIND_REVIEW_5_LABEL,
      explanation: "Look at five thoughts now. You can continue later.",
      primary: true,
    },
    {
      id: "help-make-sense",
      label: CLEAR_MY_MIND_LET_SHARI_ORGANIZE_LABEL,
      explanation: "Group or explore without deciding everything yourself.",
    },
    {
      id: "park-everything",
      label: CLEAR_MY_MIND_PARK_EVERYTHING_LABEL,
      explanation: "Move everything to the Parking Lot for later.",
    },
    {
      id: "continue-tomorrow",
      label: CLEAR_MY_MIND_CONTINUE_TOMORROW_LABEL,
      explanation: "Keep everything captured and return when ready.",
    },
  ];
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

  if (count === 0) {
    return {
      kind: "empty",
      headline: "Nothing was captured yet",
      body: "Go back and add a thought, or try saving again.",
      primary: [
        {
          id: "keep-adding",
          label: "Keep Adding Thoughts",
          primary: true,
        },
      ],
      moreWays: [],
    };
  }

  if (count === 1) {
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

  if (count >= 5) {
    return {
      kind: "large-list",
      headline: "They’re out of your head now.",
      body: clearMyMindLargeListMessage(count),
      primary: largeListSteps(),
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
        { id: "park-everything", label: CLEAR_MY_MIND_PARK_EVERYTHING_LABEL },
      ],
      moreWays,
    };
  }

  return {
    kind: "several-mixed",
    headline: "They’re out of your head now.",
    body: "Choose one helpful next step — or park everything without deciding more.",
    primary: [
      {
        id: "review-batch",
        label: CLEAR_MY_MIND_REVIEW_5_LABEL,
        explanation: "Look at a few thoughts now without sorting everything.",
        primary: true,
      },
      {
        id: "help-make-sense",
        label: CLEAR_MY_MIND_LET_SHARI_ORGANIZE_LABEL,
        explanation: "Organize or explore the thoughts in a useful way.",
      },
      {
        id: "park-everything",
        label: CLEAR_MY_MIND_PARK_EVERYTHING_LABEL,
        explanation:
          "Keep everything safely in the Parking Lot without making another decision right now.",
      },
    ],
    moreWays: [
      ...moreWays,
      {
        id: "continue-tomorrow",
        label: CLEAR_MY_MIND_CONTINUE_TOMORROW_LABEL,
      },
    ],
  };
}

/** Entries not yet routed — for Review 5 / Park Everything. */
export function unroutedClearMyMindEntries(
  entries: BrainDumpEntry[],
): BrainDumpEntry[] {
  return entries.filter((e) => {
    const text = (e.originalText ?? e.text).trim();
    if (!text) return false;
    if (e.routedAction === "parking-lot" || e.routedAction === "done") {
      return false;
    }
    return true;
  });
}

export function nextReviewBatch(
  entries: BrainDumpEntry[],
  offset: number,
  batchSize = 5,
): { batch: BrainDumpEntry[]; nextOffset: number; remaining: number } {
  const open = unroutedClearMyMindEntries(entries);
  const batch = open.slice(offset, offset + batchSize);
  const nextOffset = offset + batch.length;
  return {
    batch,
    nextOffset,
    remaining: Math.max(0, open.length - nextOffset),
  };
}
