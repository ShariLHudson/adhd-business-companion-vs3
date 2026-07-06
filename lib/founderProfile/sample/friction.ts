import type { FounderFrictionPattern } from "../types";

export const SAMPLE_FOUNDER_FRICTION: FounderFrictionPattern[] = [
  {
    id: "fric-context-switch",
    kind: "context_switch",
    noticedPhrase: "I've noticed repeated context switching mid-day leaves work unfinished.",
    occurrences: 8,
    reduction: "Batch similar work — one mission surface at a time.",
    lastSeenAt: "2026-07-04T13:30:00.000Z",
  },
  {
    id: "fric-approval-delay",
    kind: "delay",
    noticedPhrase: "I've noticed approval queues repeatedly delay launch momentum.",
    occurrences: 6,
    reduction: "One approval block per day — prepared packets only.",
    lastSeenAt: "2026-07-03T09:00:00.000Z",
  },
  {
    id: "fric-decision-fatigue",
    kind: "decision_fatigue",
    noticedPhrase: "I've noticed too many open decisions in one day reduces completion.",
    occurrences: 5,
    reduction: "One recommended decision on the desk — defer the rest.",
    lastSeenAt: "2026-07-05T16:00:00.000Z",
  },
  {
    id: "fric-manual-research",
    kind: "manual_work",
    noticedPhrase: "I've noticed repeated manual research before synthesis slows you down.",
    occurrences: 4,
    reduction: "Let Overnight Cycle prepare — review, don't re-search.",
    lastSeenAt: "2026-07-02T11:00:00.000Z",
  },
];
