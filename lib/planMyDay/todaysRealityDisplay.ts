import type { DayState } from "../companionStore";
import {
  formatDayMotivationDisplay,
  formatDayVibeDisplay,
  migrateLegacyDayState,
} from "../adjustMyDay";

function stripLeadingEmoji(label: string): string {
  const trimmed = label.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+/u, "").trim();
  return trimmed || label;
}

export function simplifiedEnergyLabel(state: DayState): string {
  const s = migrateLegacyDayState(state);
  if (s.energy === "low") return "Low";
  if (s.energy === "high") return "High";
  return "Medium";
}

export function focusLabelFromState(state: DayState): string {
  const s = migrateLegacyDayState(state);
  const vibe = formatDayVibeDisplay(s);
  if (vibe && vibe !== "—") {
    return stripLeadingEmoji(vibe);
  }
  const motivation = formatDayMotivationDisplay(s);
  if (motivation && motivation !== "—") {
    return stripLeadingEmoji(motivation);
  }
  return "—";
}

export function capacityLabelFromState(state: DayState): string {
  const s = migrateLegacyDayState(state);
  const id = s.energyLevel;
  if (
    id === "running-on-fumes" ||
    id === "need-recharge" ||
    s.energy === "low"
  ) {
    return "Light";
  }
  if (id === "full-tank" || id === "off-charts" || s.energy === "high") {
    return "Full";
  }
  return "Moderate";
}

export function todaysRealityCardLines(state: DayState): {
  energy: string;
  focus: string;
  capacity: string;
} {
  return {
    energy: simplifiedEnergyLabel(state),
    focus: focusLabelFromState(state),
    capacity: capacityLabelFromState(state),
  };
}
