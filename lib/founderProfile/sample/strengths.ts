import type { FounderStrength } from "../types";

export const SAMPLE_FOUNDER_STRENGTHS: FounderStrength[] = [
  {
    id: "str-listening-rooms-momentum",
    title: "Listening Rooms momentum",
    noticedPhrase: "I've noticed Listening Rooms work consistently builds momentum.",
    outcomes: ["momentum", "finished_projects", "customer_delight"],
    repeatability: 85,
    evidence: ["obs-listening-rooms-focus", "pat-listening-rooms"],
  },
  {
    id: "str-morning-strategy",
    title: "Morning strategy clarity",
    noticedPhrase: "I've noticed morning strategy sessions produce clearer decisions.",
    outcomes: ["founder_confidence", "momentum", "revenue"],
    repeatability: 82,
    evidence: ["obs-strategy-morning", "pat-morning-strategy"],
  },
  {
    id: "str-tuesday-research",
    title: "Tuesday research synthesis",
    noticedPhrase: "I've noticed Tuesday research blocks produce strong synthesis.",
    outcomes: ["momentum", "finished_projects"],
    repeatability: 78,
    evidence: ["obs-research-tuesday", "pat-tuesday-research"],
  },
  {
    id: "str-short-session-finish",
    title: "Focused session completion",
    noticedPhrase: "I've noticed shorter sessions reliably finish implementation work.",
    outcomes: ["finished_projects", "energy", "founder_confidence"],
    repeatability: 81,
    evidence: ["obs-short-sessions", "pat-short-sessions"],
  },
];
