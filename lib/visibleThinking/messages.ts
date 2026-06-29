import type { VisibleThinkingKind, VisibleThinkingTier } from "./types";

type MessagePools = Record<VisibleThinkingTier, readonly string[]>;

const GENERAL: MessagePools = {
  early: [
    "Give me just a second...",
    "One moment...",
    "I'm thinking about what you've shared...",
  ],
  mid: [
    "Connecting a few dots...",
    "Looking at this from a few angles...",
    "There's a better answer than the obvious one...",
  ],
  late: [
    "I want to answer this well...",
    "I want to make sure this is actually helpful.",
    "I think this deserves a little more thought...",
  ],
  extended: [
    "Still with you. I'm checking one more thing.",
    "Almost there — I want this to land well.",
    "Still here — putting the last piece together.",
  ],
};

const GENTLE: MessagePools = {
  early: [
    "I'm here.",
    "Take a breath with me...",
    "I want to be thoughtful here.",
  ],
  mid: [
    "I don't want to rush this.",
    "I want to be thoughtful here.",
    "Let me take a moment with you.",
  ],
  late: [
    "Still with you — no rush.",
    "I'm staying right here while I think this through.",
    "We can take our time with this.",
  ],
  extended: [
    "Still with you. I'm checking one more thing.",
    "Almost ready — I want this to feel right.",
    "I'm still here.",
  ],
};

const RELATIONSHIP: MessagePools = {
  early: ["Thinking about what I know about you..."],
  mid: ["Holding what you've shared in mind..."],
  late: ["I want this to feel personal, not generic."],
  extended: ["Still with you — making sure this fits you."],
};

const MEMORY: MessagePools = {
  early: ["Looking back at what we've talked about before..."],
  mid: ["Connecting this to what I remember..."],
  late: ["Pulling together the thread we've been on..."],
  extended: ["Still with you — one more connection to check."],
};

const PLANNING: MessagePools = {
  early: ["Sorting through today's possibilities..."],
  mid: ["Seeing what could actually fit today..."],
  late: ["I want the plan to feel doable, not perfect."],
  extended: ["Still with you — shaping something realistic."],
};

const BUSINESS: MessagePools = {
  early: ["Thinking about your business as a whole..."],
  mid: ["Looking at how the pieces connect..."],
  late: ["I want this to be useful, not just smart."],
  extended: ["Still with you — checking one more angle."],
};

const DECISION: MessagePools = {
  early: ["Comparing a few options..."],
  mid: ["Weighing what matters most here..."],
  late: ["I want you to have a clear next step."],
  extended: ["Still with you — narrowing this down."],
};

const CREATIVE: MessagePools = {
  early: ["Exploring a few ideas..."],
  mid: ["Letting a few directions take shape..."],
  late: ["I want something you'll actually want to use."],
  extended: ["Still with you — shaping the draft."],
};

const RESEARCH: MessagePools = {
  early: ["Looking up the latest information..."],
  mid: ["Checking what's current on this..."],
  late: ["I want to give you something fresh, not stale."],
  extended: ["Still with you — verifying one more source."],
};

const ENVIRONMENT: MessagePools = {
  early: ["Getting our workspace ready..."],
  mid: ["Setting things up so we can work together..."],
  late: ["Almost ready on my side..."],
  extended: ["Still with you — finishing the setup."],
};

const WORKSPACE_BESIDE: MessagePools = {
  early: [
    "Getting one small workspace ready.",
    "Finding the simplest place to begin.",
    "Preparing a space where we can focus on one thing at a time.",
  ],
  mid: ["Setting things up so we can work together..."],
  late: ["Almost ready on my side..."],
  extended: ["Still with you — finishing the setup."],
};

const WORKSPACE_SOLO: MessagePools = {
  early: ["Getting that ready for you..."],
  mid: ["Opening the right space..."],
  late: ["Bringing everything together..."],
  extended: ["Almost ready..."],
};

const MULTIPLE: MessagePools = {
  early: ["Putting a few pieces together..."],
  mid: ["Connecting a few dots..."],
  late: ["I want to answer this well..."],
  extended: ["Still with you. I'm checking one more thing."],
};

export const VISIBLE_THINKING_REVEAL_MS = 300;

export const VISIBLE_THINKING_TIER_MS: Record<VisibleThinkingTier, number> = {
  early: 2000,
  mid: 5000,
  late: 8000,
  extended: Number.POSITIVE_INFINITY,
};

export function tierForElapsedMs(elapsedMs: number): VisibleThinkingTier {
  if (elapsedMs < VISIBLE_THINKING_TIER_MS.early) return "early";
  if (elapsedMs < VISIBLE_THINKING_TIER_MS.mid) return "mid";
  if (elapsedMs < VISIBLE_THINKING_TIER_MS.late) return "late";
  return "extended";
}

export function messagePoolsForKind(
  kind: VisibleThinkingKind,
  opts?: { workspaceBeside?: boolean },
): MessagePools {
  if (kind === "gentle") return GENTLE;
  if (kind === "workspace") {
    return opts?.workspaceBeside ? WORKSPACE_BESIDE : WORKSPACE_SOLO;
  }
  switch (kind) {
    case "relationship":
      return RELATIONSHIP;
    case "memory":
      return MEMORY;
    case "planning":
      return PLANNING;
    case "business":
      return BUSINESS;
    case "decision":
      return DECISION;
    case "creative":
      return CREATIVE;
    case "research":
      return RESEARCH;
    case "environment":
      return ENVIRONMENT;
    case "multiple":
      return MULTIPLE;
    default:
      return GENERAL;
  }
}
