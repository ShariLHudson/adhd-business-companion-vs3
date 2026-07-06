import type { OvernightPhaseId } from "../types";

export type OvernightPhaseDefinition = {
  id: OvernightPhaseId;
  order: number;
  label: string;
  description: string;
};

export const OVERNIGHT_PHASE_TIMELINE: OvernightPhaseDefinition[] = [
  {
    id: "collect",
    order: 1,
    label: "Collect",
    description: "Gather signals from research, companion, founder, PostCraft, GHL, analytics, and more.",
  },
  {
    id: "normalize",
    order: 2,
    label: "Normalize",
    description: "Convert inputs into shared ecosystem models; dedupe and relate.",
  },
  {
    id: "observe",
    order: 3,
    label: "Observe",
    description: "SPARK notices patterns, relationships, changes, themes, problems, and risks.",
  },
  {
    id: "reason",
    order: 4,
    label: "Reason",
    description: "Executive Questions evaluate what matters and who should care.",
  },
  {
    id: "recommend",
    order: 5,
    label: "Recommend",
    description: "Prepare product, workshop, marketing, automation, and decision recommendations.",
  },
  {
    id: "prioritize",
    order: 6,
    label: "Prioritize",
    description: "Score priority, urgency, confidence, value, and mission alignment.",
  },
  {
    id: "prepare",
    order: 7,
    label: "Prepare",
    description: "Assemble tomorrow's office — brief, questions, opportunities, one first action.",
  },
];

export function listOvernightPhases(): OvernightPhaseDefinition[] {
  return [...OVERNIGHT_PHASE_TIMELINE];
}

export function getPhaseDefinition(phase: OvernightPhaseId): OvernightPhaseDefinition | undefined {
  return OVERNIGHT_PHASE_TIMELINE.find((p) => p.id === phase);
}
