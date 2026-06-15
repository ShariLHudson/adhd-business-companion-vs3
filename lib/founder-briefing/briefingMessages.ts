/**
 * Plain-language morning briefing copy — skimmable, ADHD-readable.
 */

import type { BriefingOverallStatus, FounderBriefing } from "./types";
import type { IntelligenceAggregate } from "./briefingInsights";
import { statusLabel } from "./briefingPriorities";

export function buildGreeting(now = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return "Good Morning, Shari.";
  if (hour < 17) return "Good Afternoon, Shari.";
  return "Good Evening, Shari.";
}

export function buildSummaryLines(
  status: BriefingOverallStatus,
  agg: IntelligenceAggregate,
): string[] {
  const lines: string[] = [];
  lines.push(`Today looks ${statusLabel(status)}.`);

  if (agg.cognitiveLoad.overloadedUsers > 0) {
    lines.push("A few users are carrying high cognitive load.");
  } else if (agg.cognitiveLoad.sampleSize > 0) {
    lines.push("Cognitive load looks manageable.");
  }

  if (agg.momentumWeekEvents >= 3 || agg.userHealth.recoveringCount > 0) {
    lines.push("Momentum is improving.");
  } else if (agg.activation.stuckOrFrozenCount > 0) {
    lines.push("Some users are stuck — activation support may help.");
  }

  if (agg.recovery.burnoutRiskCount > 0) {
    lines.push("Burnout indicators need watching.");
  } else {
    lines.push("Burnout indicators remain stable.");
  }

  if (agg.recognition.upcomingBirthdays > 0) {
    lines.push("Upcoming birthdays or milestones on the radar.");
  }

  return lines.slice(0, 5);
}

export function attachNarrative(briefing: FounderBriefing): FounderBriefing {
  return briefing;
}
