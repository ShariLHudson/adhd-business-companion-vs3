import type { AppSection } from "@/lib/companionUi";

type ActivitySlice = {
  activityId: string;
  phase: "browse" | "active" | "stopped" | "complete";
};

/** Full-bleed butterfly sanctuary — hub, focus workflows, and guided exercises opened from Focus. */
export function isFocusSanctuaryFullBleed(
  activeSection: AppSection,
  activitySession: ActivitySlice,
): boolean {
  if (activeSection === "focus") return true;
  return (
    activeSection === "guided-exercises" &&
    Boolean(activitySession.activityId) &&
    activitySession.phase !== "browse"
  );
}
