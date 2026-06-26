/**
 * Ten Human Reality Test™ fixtures + Day After Launch (recommended).
 * @see docs/plan-my-day/COMPANION_JUDGMENT_REPORT.md
 */

import type { CompanionJudgmentFixture } from "./types";

const CATCH_UP = /\b(catch up|make up for|yesterday's incomplete)\b/i;
const PUSH_THROUGH = /\b(push through|power through|just do it)\b/i;
const NEXT_PHASE_NOW = /\b(next step|next phase|strike while)\b/i;
const GENERIC_HYPE = /\b(you've got this|crush it|let's go)\b/i;

export const NORMAL_TUESDAY: CompanionJudgmentFixture = {
  id: "normal-tuesday",
  title: "Normal Tuesday",
  description: "Realistic working day — moderate load, one unlock anchor.",
  input: {
    dayKey: "2026-06-10",
    persona: "alex",
    adaptMyDay: {
      energy: "medium",
      motivation: "steady",
      vibe: "focused",
      fresh: true,
    },
    cmmThoughtCount: 6,
    yesterdayOutcome: "3/4 completed; momentum anchor (client follow-up) succeeded",
    brainPredictionAccuracyEwma: 0.72,
    calendarHighlights: ["client call 2pm"],
    projectFocus: ["Newsletter Launch", "Payment Setup"],
    mustNotSurface: [
      "website rebuild backlog",
      "guilt about incomplete newsletter",
      "duplicate call-doctor captures",
      "Q2 revenue dashboard metrics",
    ],
  },
  expected: {
    dayMode: "normal",
    cycleState: "orienting",
    orientationType: "full",
    orientationOnly: false,
    permissionDisplay: "collapsedSummary",
    proposalCount: { min: 2, max: 4 },
    momentum: "anchorRequired",
    confidence: "pairedWithMomentum",
    reflection: {
      shouldEmitSignals: true,
      allowedSignalKinds: ["prediction-accuracy", "momentum-success"],
      judgmentMayChange: true,
      mustNotCompensateTomorrow: true,
    },
  },
  prohibitedBehaviors: [
    "auto-materialize proposals without confirmation",
    "surface full CMM list",
    "modify user goals",
    "more than one invitation question",
  ],
  prohibitedCopyPatterns: [CATCH_UP, GENERIC_HYPE],
};

export const HIGH_ENERGY_LAUNCH: CompanionJudgmentFixture = {
  id: "high-energy-launch",
  title: "High Energy Launch Day",
  description: "Excited, many opportunities — guard against overcommit.",
  input: {
    dayKey: "2026-06-12",
    persona: "alex",
    adaptMyDay: {
      energy: "high",
      motivation: "scattered",
      vibe: "scattered",
      fresh: true,
    },
    yesterdayOutcome: "high completion; user overrode 2 exclusions",
    brainPredictionAccuracyEwma: 0.68,
    projectFocus: ["Launch"],
    mustNotSurface: [
      "entire launch checklist as today plan",
      "seven launch tasks at once",
    ],
  },
  expected: {
    dayMode: "normal",
    cycleState: "orienting",
    orientationType: "full",
    orientationOnly: false,
    permissionDisplay: "collapsedSummary",
    proposalCount: { min: 2, max: 4 },
    momentum: "anchorRequired",
    confidence: "evidenceEncouragement",
    reflection: {
      shouldEmitSignals: true,
      allowedSignalKinds: ["permission-accuracy", "prediction-accuracy"],
      judgmentMayChange: true,
      mustNotCompensateTomorrow: false,
    },
  },
  prohibitedBehaviors: [
    "treat excitement as unlimited capacity",
    "refuse user swap without offering alternative",
    "stack all launch tasks",
    "nag after user override",
  ],
  prohibitedCopyPatterns: [GENERIC_HYPE],
};

export const LOW_ENERGY: CompanionJudgmentFixture = {
  id: "low-energy",
  title: "Low Energy Day",
  description: "Poor sleep, brain fog — reduced capacity.",
  input: {
    dayKey: "2026-06-11",
    persona: "alex",
    adaptMyDay: {
      energy: "low",
      motivation: "low",
      vibe: "foggy",
      fresh: true,
    },
    yesterdayOutcome: "normal day completed well",
    mustNotSurface: [
      "full tuesday-style business plan",
      "marketing catch-up framing",
    ],
  },
  expected: {
    dayMode: "survival",
    cycleState: "orienting",
    orientationType: "short",
    orientationOnly: false,
    permissionDisplay: "collapsedSummary",
    proposalCount: { min: 0, max: 2 },
    momentum: "anchorOptional",
    confidence: "boundaryHonor",
    reflection: {
      shouldEmitSignals: true,
      allowedSignalKinds: ["confidence-growth", "overwhelm-reduction"],
      judgmentMayChange: true,
      mustNotCompensateTomorrow: true,
    },
    survivalCooldownActive: true,
  },
  prohibitedBehaviors: [
    "tasks over 20 min cognitive load by default",
    "ignore explicit survival declaration",
    "follow-up prompts for 24h after survival",
    "kanban as default view",
  ],
  prohibitedCopyPatterns: [PUSH_THROUGH, CATCH_UP],
};

export const OVERWHELM: CompanionJudgmentFixture = {
  id: "overwhelm",
  title: "Overwhelm Day",
  description: "Decision paralysis — seventeen competing thoughts.",
  input: {
    dayKey: "2026-06-13",
    persona: "alex",
    adaptMyDay: {
      energy: "medium",
      motivation: "overwhelmed",
      fresh: true,
    },
    cmmThoughtCount: 17,
    mustNotSurface: [
      "list all 17 thoughts in orientation",
      "12-item proposal board",
    ],
  },
  expected: {
    dayMode: "normal",
    cycleState: "orienting",
    orientationType: "orientationOnly",
    orientationOnly: true,
    permissionDisplay: "collapsedSummary",
    proposalCount: { min: 0, max: 1 },
    momentum: "anchorOptional",
    confidence: "orientationOnly",
    reflection: {
      shouldEmitSignals: true,
      allowedSignalKinds: ["overwhelm-reduction", "planning-confidence"],
      judgmentMayChange: true,
      mustNotCompensateTomorrow: true,
    },
  },
  prohibitedBehaviors: [
    "long orientation with full backlog",
    "expanded permission drawer by default",
    "force materialization",
    "multiple questions per turn",
  ],
  prohibitedCopyPatterns: [CATCH_UP],
};

export const HYPERFOCUS: CompanionJudgmentFixture = {
  id: "hyperfocus",
  title: "Hyperfocus Day",
  description: "Deep work flowing — interruptions are costly.",
  input: {
    dayKey: "2026-06-14",
    persona: "alex",
    adaptMyDay: {
      energy: "high",
      motivation: "focused",
      vibe: "focused",
      fresh: true,
    },
    hyperfocusSessionActive: true,
    hyperfocusMinutes: 90,
    mustNotSurface: ["replanning UI", "new proposals mid-flow"],
  },
  expected: {
    dayMode: "hyperfocus",
    cycleState: "protected",
    orientationType: "minimal",
    orientationOnly: false,
    permissionDisplay: "none",
    proposalCount: { min: 0, max: 0 },
    momentum: "anchorNone",
    confidence: "none",
    reflection: {
      shouldEmitSignals: true,
      allowedSignalKinds: ["momentum-success", "capability-growth"],
      judgmentMayChange: true,
      mustNotCompensateTomorrow: true,
      mustNotMentionIncomplete: true,
    },
  },
  prohibitedBehaviors: [
    "interrupt flow with replan",
    "surface permission brief",
    "register missed anchor as failure",
    "proposals while protected",
  ],
};

export const RECOVERY: CompanionJudgmentFixture = {
  id: "recovery",
  title: "Recovery Day",
  description: "Yesterday went badly — guilt, needs orientation not pressure.",
  input: {
    dayKey: "2026-06-15",
    persona: "alex",
    adaptMyDay: {
      energy: "medium",
      motivation: "low",
      fresh: true,
    },
    yesterdayOutcome: "launch override; 1/4 completed; afternoon abandoned",
    mustNotSurface: [
      "yesterday incomplete list as today load",
      "catch up framing",
    ],
  },
  expected: {
    dayMode: "recovery",
    cycleState: "orienting",
    orientationType: "short",
    orientationOnly: false,
    permissionDisplay: "collapsedSummary",
    proposalCount: { min: 0, max: 1 },
    momentum: "anchorNone",
    confidence: "orientationOnly",
    reflection: {
      shouldEmitSignals: true,
      allowedSignalKinds: ["recovery-speed", "capability-growth", "confidence-growth"],
      judgmentMayChange: true,
      mustNotCompensateTomorrow: true,
      mustNotMentionIncomplete: true,
    },
    survivalCooldownActive: true,
  },
  prohibitedBehaviors: [
    "replay scorecard",
    "carry forward yesterday items",
    "enlarge user self-selected small task",
    "compensate tomorrow load",
  ],
  prohibitedCopyPatterns: [CATCH_UP, /\bincomplete\b/i],
};

export const HEALTH: CompanionJudgmentFixture = {
  id: "health",
  title: "Health Day",
  description: "Migraine, appointment — health is the plan.",
  input: {
    dayKey: "2026-06-16",
    persona: "alex",
    adaptMyDay: {
      energy: "low",
      motivation: "low",
      healthNote: "migraine",
      fresh: true,
    },
    calendarHighlights: ["doctor appointment 11am"],
    mustNotSurface: ["business build stack", "push through messaging"],
  },
  expected: {
    dayMode: "health",
    cycleState: "orienting",
    orientationType: "short",
    orientationOnly: false,
    permissionDisplay: "collapsedSummary",
    proposalCount: { min: 1, max: 2 },
    momentum: "anchorRequired",
    confidence: "boundaryHonor",
    reflection: {
      shouldEmitSignals: true,
      allowedSignalKinds: ["permission-accuracy"],
      judgmentMayChange: true,
      mustNotCompensateTomorrow: true,
    },
  },
  prohibitedBehaviors: [
    "business proposals alongside health crisis",
    "implicit guilt for cancelled work",
    "stack business backlog tomorrow",
  ],
  prohibitedCopyPatterns: [PUSH_THROUGH],
};

export const FAMILY_FIRST: CompanionJudgmentFixture = {
  id: "family-first",
  title: "Family First Day",
  description: "Kid sick — family priority, minimal professional courtesy.",
  input: {
    dayKey: "2026-06-17",
    persona: "alex",
    adaptMyDay: {
      energy: "medium",
      motivation: "steady",
      fresh: true,
    },
    cmmRecentCaptures: ["kid sick, staying home"],
    calendarHighlights: ["client call conflict"],
    mustNotSurface: ["business-as-usual plan", "guilt about cancelled work"],
  },
  expected: {
    dayMode: "family",
    cycleState: "orienting",
    orientationType: "short",
    orientationOnly: false,
    permissionDisplay: "collapsedSummary",
    proposalCount: { min: 1, max: 1 },
    momentum: "anchorRequired",
    confidence: "boundaryHonor",
    reflection: {
      shouldEmitSignals: true,
      judgmentMayChange: true,
      mustNotCompensateTomorrow: true,
    },
  },
  prohibitedBehaviors: [
    "auto-cancel calendar without user",
    "label family mode in UI copy",
    "more than one business item",
  ],
};

export const CREATIVE: CompanionJudgmentFixture = {
  id: "creative",
  title: "Creative Day",
  description: "Many ideas — exploration without immediate obligation.",
  input: {
    dayKey: "2026-06-18",
    persona: "alex",
    adaptMyDay: {
      energy: "medium-high",
      motivation: "scattered",
      vibe: "creative",
      fresh: true,
    },
    cmmThoughtCount: 5,
    cmmRecentCaptures: ["workshop idea", "new offer angle", "podcast concept"],
    mustNotSurface: ["five build commitments", "structure-heavy kanban default"],
  },
  expected: {
    dayMode: "creative",
    cycleState: "orienting",
    orientationType: "full",
    orientationOnly: false,
    permissionDisplay: "collapsedSummary",
    proposalCount: { min: 1, max: 2 },
    momentum: "explorationBlock",
    confidence: "boundaryHonor",
    reflection: {
      shouldEmitSignals: true,
      allowedSignalKinds: ["capability-growth"],
      judgmentMayChange: true,
      mustNotCompensateTomorrow: true,
    },
  },
  prohibitedBehaviors: [
    "convert every idea to task",
    "execute-before-explore ordering without user consent",
    "forbid user-added build after exploration",
  ],
};

export const CELEBRATION: CompanionJudgmentFixture = {
  id: "celebration",
  title: "Celebration Day",
  description: "Major accomplishment — recognize without next-task pivot.",
  input: {
    dayKey: "2026-06-19",
    persona: "alex",
    adaptMyDay: {
      energy: "high",
      motivation: "excited",
      fresh: true,
    },
    yesterdayOutcome: "launch went live successfully",
    cmmRecentCaptures: ["we did it!!"],
    mustNotSurface: ["next launch phase", "strike while iron is hot tasks"],
  },
  expected: {
    dayMode: "celebration",
    cycleState: "orienting",
    orientationType: "short",
    orientationOnly: false,
    permissionDisplay: "none",
    proposalCount: { min: 0, max: 0 },
    momentum: "anchorNone",
    confidence: "evidenceEncouragement",
    reflection: {
      shouldEmitSignals: true,
      allowedSignalKinds: ["confidence-growth"],
      judgmentMayChange: true,
      mustNotCompensateTomorrow: true,
    },
    celebrationCooldownActive: true,
  },
  prohibitedBehaviors: [
    "forward-looking business tasks",
    "evening ready-for-tomorrow push",
    "generic motivation without evidence",
    "inflate confidence from single win",
  ],
  prohibitedCopyPatterns: [NEXT_PHASE_NOW, GENERIC_HYPE],
};

export const DAY_AFTER_LAUNCH: CompanionJudgmentFixture = {
  id: "day-after-launch",
  title: "Day After Launch",
  description: "Post-milestone — avoid productivity pressure and backlog compensation.",
  input: {
    dayKey: "2026-06-20",
    persona: "alex",
    adaptMyDay: {
      energy: "low",
      motivation: "low",
      vibe: "foggy",
      fresh: true,
    },
    yesterdayOutcome: "celebration day; afternoon off",
    activeCooldowns: ["celebration"],
    brainPredictionAccuracyEwma: 0.7,
    mustNotSurface: [
      "launch backlog dump",
      "compensate for time off",
      "high proposal count",
    ],
  },
  expected: {
    dayMode: "recovery",
    cycleState: "orienting",
    orientationType: "short",
    orientationOnly: false,
    permissionDisplay: "collapsedSummary",
    proposalCount: { min: 0, max: 2 },
    momentum: "anchorOptional",
    confidence: "orientationOnly",
    reflection: {
      shouldEmitSignals: true,
      allowedSignalKinds: ["recovery-speed", "planning-confidence"],
      judgmentMayChange: true,
      mustNotCompensateTomorrow: true,
    },
    celebrationCooldownActive: true,
  },
  prohibitedBehaviors: [
    "backlog compensation",
    "assume crash requires heroic catch-up",
    "more than two low-friction proposals without user ask",
    "ignore celebrationCooldown",
  ],
  prohibitedCopyPatterns: [CATCH_UP, NEXT_PHASE_NOW],
};

export const ALL_SIMULATION_FIXTURES: CompanionJudgmentFixture[] = [
  NORMAL_TUESDAY,
  HIGH_ENERGY_LAUNCH,
  LOW_ENERGY,
  OVERWHELM,
  HYPERFOCUS,
  RECOVERY,
  HEALTH,
  FAMILY_FIRST,
  CREATIVE,
  CELEBRATION,
  DAY_AFTER_LAUNCH,
];

export const SIMULATION_FIXTURES_BY_ID: Record<
  CompanionJudgmentFixture["id"],
  CompanionJudgmentFixture
> = Object.fromEntries(
  ALL_SIMULATION_FIXTURES.map((f) => [f.id, f]),
) as Record<CompanionJudgmentFixture["id"], CompanionJudgmentFixture>;
