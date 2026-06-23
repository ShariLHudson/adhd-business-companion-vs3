import type { DayState } from "./companionStore";
import {
  formatDayEnergyDisplay,
  formatDayMotivationDisplay,
  formatDaySnapshotTime,
  formatDayVibeDisplay,
} from "./adjustMyDay";

export function isDayStateFromToday(state: DayState | null): boolean {
  if (!state?.setAt) return false;
  const updated = new Date(state.setAt);
  const now = new Date();
  return updated.toDateString() === now.toDateString();
}

export function formatTodaysRealityLines(state: DayState): {
  energy: string;
  motivation: string;
  emotion: string;
  physical: string;
  updatedAt: string;
} {
  return {
    energy: formatDayEnergyDisplay(state),
    motivation: formatDayMotivationDisplay(state),
    emotion: formatDayVibeDisplay(state) || "—",
    physical: state.note?.trim() || "—",
    updatedAt: formatDaySnapshotTime(state) || "—",
  };
}
