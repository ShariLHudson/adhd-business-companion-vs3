/**
 * Estate destination ids for rhythms (Phase 4) — place language, not modules.
 */

export const RHYTHM_DESTINATIONS = [
  { id: "plan-my-day", label: "Plan My Day", experience: "Momentum" },
  { id: "brain-dump", label: "Clear My Mind", experience: "Restore" },
  { id: "focus", label: "Focus Workspace", experience: "Focus" },
  { id: "growth-journal", label: "Journal Gazebo", experience: "Journal" },
  { id: "peaceful-places", label: "Peaceful Places", experience: "Restore" },
  { id: "evidence-bank", label: "Evidence Vault", experience: "Grow" },
  { id: "wins-this-week", label: "Celebration Garden", experience: "Celebrate" },
  { id: "projects", label: "Projects", experience: "Momentum" },
  { id: "time-block", label: "Calendar", experience: "Momentum" },
  { id: "business-profile", label: "My Business Estate", experience: "Business" },
] as const;

export type RhythmDestinationId = (typeof RHYTHM_DESTINATIONS)[number]["id"];

export function labelForRhythmDestination(id?: string): string | undefined {
  if (!id) return undefined;
  return RHYTHM_DESTINATIONS.find((d) => d.id === id)?.label;
}
