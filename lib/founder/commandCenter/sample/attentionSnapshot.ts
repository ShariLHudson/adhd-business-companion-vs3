import type { AttentionItem } from "../types";

export const SAMPLE_ATTENTION_SNAPSHOT: AttentionItem[] = [
  {
    id: "sample-att-1",
    title: "Voice Companion decision",
    summary: "Limited return voice — prepared for approval.",
    level: "now",
    source: "executive_decision",
    missionId: "listening-rooms",
    estimatedMinutes: 20,
  },
  {
    id: "sample-att-2",
    title: "Gentle Restart automation pilot",
    summary: "Drafts ready — nothing sends until you approve.",
    level: "now",
    source: "executive_orchestrator",
    missionId: "listening-rooms",
  },
];
