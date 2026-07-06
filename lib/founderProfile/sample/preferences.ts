import type { FounderPreference } from "../types";

export const SAMPLE_FOUNDER_PREFERENCES: FounderPreference[] = [
  {
    id: "pref-morning-hours",
    area: "working_hours",
    noticedPhrase: "I've noticed your strongest executive hours are usually before noon.",
    detail: "Strategy, brief review, and one decision before lunch.",
    confidence: 82,
    evolving: true,
  },
  {
    id: "pref-outline-before-video",
    area: "workflow_preference",
    noticedPhrase: "I've noticed outlining before video creation works better for you.",
    detail: "Outline → record → edit — not record-first.",
    confidence: 71,
    evolving: true,
  },
  {
    id: "pref-brief-before-planning",
    area: "planning_habit",
    noticedPhrase: "I've noticed planning lands better after the Executive Brief.",
    detail: "Brief first, then mission planning — not the reverse.",
    confidence: 80,
    evolving: true,
  },
  {
    id: "pref-avoid-long-afternoon-writing",
    area: "workflow_avoidance",
    noticedPhrase: "I've noticed long writing sessions after lunch often stall.",
    detail: "Prefer morning drafts or shorter afternoon edits.",
    confidence: 74,
    evolving: true,
  },
  {
    id: "pref-minimal-meetings-morning",
    area: "meeting_preference",
    noticedPhrase: "I've noticed mornings stay calmer with fewer meetings.",
    detail: "Protect morning for thinking — meetings later when possible.",
    confidence: 70,
    evolving: true,
  },
];
