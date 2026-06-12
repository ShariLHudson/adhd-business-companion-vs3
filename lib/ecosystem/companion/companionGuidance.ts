// Founder Ecosystem — Phase 13 Shari guidance layer.
//
// Turns CompanionProfile into prompt hints and policies for personalized
// recommendations and proactive check-ins. Consumed by companionPrompt,
// Command Center, and Action Engine — never shown raw to the founder.

import type { CompanionProfile } from "./companionTypes";
import { getMomentumPatterns, getOverwhelmPatterns, profileContext } from "./companionProfile";
import { adaptResponse, adaptBriefingEmphasis } from "./adaptiveResponseEngine";

export type RecommendationPolicy = {
  maxSuggestions: number;
  leadWith: "next-step" | "options" | "reflection" | "structure";
  avoid: string[];
  emphasize: string[];
};

export type CheckInPolicy = {
  enabled: boolean;
  maxPerDay: number;
  preferredKinds: string[];
  tone: string;
};

/** System-prompt block — how Shari should adapt for this founder. */
export function companionPromptHints(profile: CompanionProfile): string {
  const ctx = profileContext(profile);
  const adaptation = adaptResponse(profile);
  const briefing = adaptBriefingEmphasis(profile);
  const momentum = getMomentumPatterns(profile);
  const overwhelm = getOverwhelmPatterns(profile);

  const lines = [
    "ADAPTIVE COMPANION PROFILE (learned patterns — observational only):",
    `• Work style: ${profile.workStyles.map((w) => w.value).join(", ")}`,
    `• Support style: ${profile.supportStyle.value} (${adaptation.tone} tone)`,
    `• Focus habits: ${profile.focusStyle.value}`,
    `• Decision style: ${profile.decisionStyle.value}`,
    `• Planning: ${profile.planningStyle.value}`,
    `• Recommendations: ${profile.preferences.recommendationDensity} density — one thing at a time when minimal.`,
    adaptation.giveNextStepFast
      ? "• Give the next step FIRST, then context."
      : "• Ask one clarifying question before suggesting.",
    adaptation.followUpMore
      ? "• Offer gentle accountability follow-up when appropriate."
      : null,
    briefing.note,
    momentum.bestTimeOfDay
      ? `• Best momentum time: ${momentum.bestTimeOfDay}.`
      : null,
    momentum.bestProject
      ? `• Strongest project pull: ${momentum.bestProject.label}.`
      : null,
    overwhelm.triggers[0]
      ? `• Overwhelm watch: ${overwhelm.triggers[0].trigger} — suggest: ${overwhelm.triggers[0].recoveryMethods.slice(0, 2).join(", ")}.`
      : null,
    profile.observations.length
      ? `• Patterns: ${profile.observations.slice(0, 3).join(" ")}`
      : null,
    "• Never nag, guilt, or pressure. Invitations only.",
  ];

  return lines.filter(Boolean).join("\n");
}

/** How many recommendations to surface and in what shape. */
export function personalizedRecommendationPolicy(
  profile: CompanionProfile,
): RecommendationPolicy {
  const adaptation = adaptResponse(profile);
  const density = profile.preferences.recommendationDensity;

  const maxSuggestions =
    density === "minimal" ? 1 : density === "balanced" ? 2 : 3;

  const leadWith = adaptation.giveNextStepFast
    ? "next-step"
    : adaptation.askMoreQuestions
      ? "options"
      : profile.planningStyle.value === "planner"
        ? "structure"
        : "reflection";

  const avoid: string[] = [];
  if (density === "minimal") avoid.push("long lists", "multiple competing priorities");
  if (profile.decisionStyle.value === "avoidant") avoid.push("open-ended decisions without a default");
  if (getOverwhelmPatterns(profile).triggers.length)
    avoid.push("adding more without trimming first");

  const emphasize: string[] = [];
  const momentum = getMomentumPatterns(profile);
  if (momentum.bestProject) emphasize.push(momentum.bestProject.label);
  if (profile.focusStyle.value === "morning") emphasize.push("morning focus blocks");
  if (profile.preferences.defaultWorkspaceBias)
    emphasize.push(`open ${profile.preferences.defaultWorkspaceBias} beside chat`);

  return { maxSuggestions, leadWith, avoid, emphasize };
}

/** When and how Shari may proactively check in. */
export function proactiveCheckInPolicy(profile: CompanionProfile): CheckInPolicy {
  const behavior = profile.checkInBehavior;
  return {
    enabled: profile.preferences.proactiveCheckIns,
    maxPerDay: behavior.maxPerDay,
    preferredKinds: behavior.responsiveKinds.length
      ? behavior.responsiveKinds
      : ["momentum", "re-engage"],
    tone: "supportive invitation — okay to decline",
  };
}
