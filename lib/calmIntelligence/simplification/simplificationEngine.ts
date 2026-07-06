import type { SimplificationSuggestion } from "../types";
import type { MissionId } from "@/lib/founder/missions/types";
import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import { computeFocusScore } from "../focus/focusScore";
import { improvementService } from "@/lib/improvement";

export function buildSimplificationSuggestions(
  missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID,
): SimplificationSuggestion[] {
  const focus = computeFocusScore(missionId);
  const suggestions: SimplificationSuggestion[] = [];

  if (focus.recommendationOverload > 3) {
    suggestions.push({
      id: "simp-hide-recs",
      action: "hide_complexity",
      title: "Defer non-primary recommendations",
      reason: "Too many competing recommendations — library holds the rest.",
    });
  }

  if (focus.missionOverload > 40) {
    suggestions.push({
      id: "simp-one-mission",
      action: "collapse_related",
      title: "One mission on the desk",
      reason: "Multiple active missions increase context switching.",
    });
  }

  if (focus.decisionFatigue > 50) {
    suggestions.push({
      id: "simp-one-decision",
      action: "reduce_repetition",
      title: "One decision today",
      reason: "Open decisions are creating fatigue.",
    });
  }

  for (const opp of improvementService.prioritizeImprovements(missionId).slice(0, 2)) {
    if (opp.shouldAutomate) {
      suggestions.push({
        id: `simp-auto-${opp.id}`,
        action: "suggest_automate",
        title: opp.shouldAutomate,
        reason: opp.summary,
      });
    }
    if (opp.shouldDelegate) {
      suggestions.push({
        id: `simp-del-${opp.id}`,
        action: "suggest_delegate",
        title: opp.shouldDelegate,
        reason: opp.summary,
      });
    }
    if (opp.shouldEliminate) {
      suggestions.push({
        id: `simp-arc-${opp.id}`,
        action: "suggest_archive",
        title: opp.shouldEliminate,
        reason: opp.summary,
      });
    }
  }

  if (suggestions.length === 0) {
    suggestions.push({
      id: "simp-steady",
      action: "hide_complexity",
      title: "Protect today's focus",
      reason: "Nothing needs simplification right now — keep the surface calm.",
    });
  }

  return suggestions.slice(0, 5);
}
