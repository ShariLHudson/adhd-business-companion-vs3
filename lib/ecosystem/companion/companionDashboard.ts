// Founder Ecosystem — Phase 13 Companion Insights dashboard.
// Brings the adaptive layer together for display: who this founder is, what
// drives/drains momentum, overwhelm triggers, recent wins, and support
// suggestions. Pure — no rendering.

import type { FounderEvent, ID } from "../events";
import { getFounderIntelligence } from "../intelligence/founderIntelligenceEngine";
import { buildCompanionProfile } from "./companionProfile";
import { detectMomentumPatterns } from "./momentumPatternEngine";
import { detectOverwhelmPatterns } from "./overwhelmPatternEngine";
import { generateCheckIns } from "./checkInEngine";
import { generateCelebrations } from "./celebrationEngine";
import { adaptResponse, adaptBriefingEmphasis } from "./adaptiveResponseEngine";
import { computeFounderSupportScore, supportPosture } from "./founderSupportScore";
import type {
  Celebration,
  CheckIn,
  CompanionProfile,
  MomentumDriver,
  OverwhelmTrigger,
} from "./companionTypes";

export type SupportSuggestion = { text: string; basis: string };

export type CompanionDashboard = {
  founderId: ID;
  generatedAt: string;
  // Companion Insights
  profileSummary: {
    workStyles: string[];
    supportStyle: string;
    focusStyle: string;
    planningStyle: string;
    observations: string[];
  };
  momentumDrivers: { positive: MomentumDriver[]; negative: MomentumDriver[]; bestTimeOfDay: string | null };
  overwhelmTriggers: OverwhelmTrigger[];
  recentWins: Celebration[];
  supportSuggestions: SupportSuggestion[];
  checkIns: CheckIn[];
  /** Internal only — present for tuning, never rendered as a grade. */
  _internalSupportScore: ReturnType<typeof computeFounderSupportScore>;
};

function buildSupportSuggestions(
  profile: CompanionProfile,
  events: FounderEvent[],
  founderId: ID,
): SupportSuggestion[] {
  const adaptation = adaptResponse(profile);
  const emphasis = adaptBriefingEmphasis(profile);
  const score = computeFounderSupportScore(events, founderId);
  const posture = supportPosture(score);

  const out: SupportSuggestion[] = [
    {
      text: adaptation.guidance[0],
      basis: `Support style: ${profile.supportStyle.value}`,
    },
    { text: emphasis.note, basis: `Briefing emphasis: ${emphasis.lead}` },
  ];
  if (posture === "protect-capacity")
    out.push({ text: "Keep suggestions small and offer a reset.", basis: "Capacity running low" });
  if (posture === "build-momentum")
    out.push({ text: "Nudge one concrete next step to restart momentum.", basis: "Momentum is quiet" });
  return out;
}

export function buildCompanionDashboard(
  events: FounderEvent[],
  founderId: ID = "founder-001",
  now: Date = new Date(),
): CompanionDashboard {
  const mine = events.filter((e) => e.founderId === founderId);
  const intel = getFounderIntelligence(mine, founderId, now.toISOString());
  const profile = buildCompanionProfile(mine, founderId, {
    intelOverride: intel,
    includePatterns: true,
  });
  const momentum = detectMomentumPatterns(mine, founderId, intel);
  const overwhelm = detectOverwhelmPatterns(mine, founderId, intel);

  return {
    founderId,
    generatedAt: now.toISOString(),
    profileSummary: {
      workStyles: profile.workStyles.map((w) => w.value),
      supportStyle: profile.supportStyle.value,
      focusStyle: profile.focusStyle.value,
      planningStyle: profile.planningStyle.value,
      observations: profile.observations,
    },
    momentumDrivers: {
      positive: momentum.positive,
      negative: momentum.negative,
      bestTimeOfDay: momentum.bestTimeOfDay,
    },
    overwhelmTriggers: overwhelm.triggers,
    recentWins: generateCelebrations(mine, founderId, { now }),
    supportSuggestions: buildSupportSuggestions(profile, mine, founderId),
    checkIns: generateCheckIns(mine, founderId, { now, intel }),
    _internalSupportScore: computeFounderSupportScore(mine, founderId, { now, intel }),
  };
}
