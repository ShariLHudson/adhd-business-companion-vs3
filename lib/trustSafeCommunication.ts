/**
 * Trust-Safe Improvement Communication™
 *
 * Internal transparency: track everything.
 * External transparency: communicate only what improves the user experience.
 *
 * Users experience a companion that keeps getting better —
 * not a system that continuously reports its mistakes.
 */

import type { MisunderstandingType } from "./companionMistakeRecovery";
import type { FounderWarning } from "./founderEarlyWarning";

// ─── Communication categories ─────────────────────────────────────────────────

export type CommunicationCategory =
  | "internal_only"
  | "user_experienced_problem"
  | "meaningful_improvement";

export type TrustCommunicationLevel = "minimal" | "standard" | "warm";

export type UserTrustCommunicationProfile = {
  level: TrustCommunicationLevel;
  trustScore: number;
  recentCorrections: number;
  recentRecoveries: number;
  prefersMinimalExplanation: boolean;
  surveillanceRisk: boolean;
  evaluatedAt: string;
};

export type CommunicationDecision = {
  shouldCommunicate: boolean;
  category: CommunicationCategory;
  userBenefit: string | null;
  reason: string;
  trustImpact: "positive" | "neutral" | "negative";
  surveillanceRisk: boolean;
  invasiveRisk: boolean;
};

export type RecoveryMessageInput = {
  problemAcknowledged?: boolean;
  informationPreserved?: boolean;
  readyToContinue?: boolean;
  contextLabel?: string;
};

export type RecoveryMessage = {
  headline: string;
  body: string;
  continuation: string;
  category: "user_experienced_problem";
};

export type ImprovementArea =
  | "conversation_continuity"
  | "project_memory"
  | "follow_through"
  | "decision_support"
  | "companion_understanding"
  | "personalized_recommendations"
  | "workspace_transitions"
  | "trust_repair";

export type InternalImprovement = {
  id: string;
  internalSummary: string;
  area: ImprovementArea;
  userExperiencedImpact: boolean;
  recoveryNeeded: boolean;
  releasedAt: string;
};

export type WhatsNewItem = {
  benefit: string;
  area: ImprovementArea;
};

export type WhatsNewSummary = {
  title: string;
  items: WhatsNewItem[];
  tone: "benefit_focused";
  generatedAt: string;
};

export type RecentlyImprovedSummary = {
  heading: string;
  items: string[];
  generatedAt: string;
};

// ─── Internal-only topics (never user-facing) ───────────────────────────────

const INTERNAL_ONLY_PATTERNS: RegExp[] = [
  /\b(?:routing|routing defect|wrong routing)\b/i,
  /\b(?:intervention weight|weighting|ranking|scoring|scorecard)\b/i,
  /\b(?:analytics|telemetry|tracking engine|event tracker)\b/i,
  /\b(?:trust calculation|behavioral model|model tuning|prompt improvement)\b/i,
  /\b(?:algorithm|defect|bug fix|synchronization failure|sync fail)\b/i,
  /\b(?:founder intelligence|internal diagnostic|dashboard slice)\b/i,
  /\b(?:misread|dismissed rate|adaptive weight)\b/i,
];

const SURVEILLANCE_RISK_PATTERNS: RegExp[] = [
  /\bwe (?:tracked|track|monitor|observed|observe|detected|detect|analyzed|analyze) (?:you|your)\b/i,
  /\bwe(?:'ve| have) (?:tracked|monitored|observed|detected|analyzed) your (?:behavior|actions)\b/i,
  /\byour behavior (?:was|has been) (?:tracked|monitored|analyzed)\b/i,
  /\bwe noticed you\b/i,
  /\bwe are watching\b/i,
  /\bscored your\b/i,
  /\bbehavioral scoring\b/i,
];

const TECHNICAL_LANGUAGE_PATTERNS: RegExp[] = [
  /\b(?:defect|failure|error code|exception|stack trace)\b/i,
  /\b(?:routing|routing defect|synchronization|sync fail)\b/i,
  /\b(?:algorithm|weighting|scoring issue|behavioral model)\b/i,
  /\b(?:bug|hotfix|patch|regression)\b/i,
  /\b(?:misunderstanding type|intervention id)\b/i,
];

const TRUST_SAFE_ALTERNATIVES: [RegExp, string][] = [
  [/\bwe tracked your behavior\b/gi, "Based on your experience"],
  [/\bwe analyzed your actions\b/gi, "From what seems to work best for you"],
  [/\bwe detected you\b/gi, "From previous conversations"],
  [/\bwe observed you\b/gi, "Using what you've shared"],
  [/\bwe monitored you\b/gi, "Based on your experience"],
  [/\bA routing defect was detected\b/gi, "Something didn't work as expected"],
  [/\bA behavioral scoring issue occurred\b/gi, "We've adjusted how the companion supports you"],
  [/\bA synchronization failure happened\b/gi, "We've corrected the issue"],
  [/\bWe fixed a bug\b/gi, "The companion should work more smoothly now"],
  [/\bWe changed (?:a |the )?scoring algorithm\b/gi, "Recommendations are becoming more personalized"],
  [/\bWe improved behavioral weighting\b/gi, "The companion is getting better at understanding what you need"],
];

const IMPROVEMENT_BENEFIT_COPY: Record<ImprovementArea, string> = {
  conversation_continuity:
    "Conversations should feel more seamless when continuing ongoing work.",
  project_memory:
    "The companion is getting better at remembering where you left off.",
  follow_through:
    "You may notice smoother follow-through on what you start.",
  decision_support: "Decision support should feel clearer and more helpful.",
  companion_understanding:
    "The companion is getting better at understanding what you need.",
  personalized_recommendations:
    "Recommendations are becoming more personalized over time.",
  workspace_transitions: "Moving between tools should feel faster and smoother.",
  trust_repair: "Your experience is protected — we're here to pick up where you left off.",
};

const INTERNAL_TO_AREA: { pattern: RegExp; area: ImprovementArea }[] = [
  { pattern: /\bconversation continuity\b/i, area: "conversation_continuity" },
  { pattern: /\bproject memory|memory persistence\b/i, area: "project_memory" },
  { pattern: /\bfollow[- ]?through\b/i, area: "follow_through" },
  { pattern: /\bdecision (?:compass|support)\b/i, area: "decision_support" },
  { pattern: /\bcompanion understanding|intuitive awareness\b/i, area: "companion_understanding" },
  { pattern: /\brecommendation|personaliz\b/i, area: "personalized_recommendations" },
  { pattern: /\bworkspace transition\b/i, area: "workspace_transitions" },
  { pattern: /\btrust repair|mistake recovery\b/i, area: "trust_repair" },
];

const RECENTLY_IMPROVED_DEFAULTS = [
  "Better conversation continuity",
  "Improved project memory",
  "Smarter follow-through",
  "More personalized recommendations",
  "Faster workspace transitions",
];

const RECENT_IMPROVEMENTS_KEY = "trust-safe-recent-improvements-v1";

function readRecentImprovements(): InternalImprovement[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_IMPROVEMENTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as InternalImprovement[];
  } catch {
    return [];
  }
}

function writeRecentImprovements(items: InternalImprovement[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(RECENT_IMPROVEMENTS_KEY, JSON.stringify(items.slice(0, 50)));
  } catch {
    /* storage full */
  }
}

// ─── Surveillance & technical language ──────────────────────────────────────

export function detectSurveillanceRisk(text: string): boolean {
  return SURVEILLANCE_RISK_PATTERNS.some((re) => re.test(text));
}

export function detectTechnicalLanguage(text: string): boolean {
  return TECHNICAL_LANGUAGE_PATTERNS.some((re) => re.test(text));
}

export function isInternalOnlyTopic(text: string): boolean {
  return INTERNAL_ONLY_PATTERNS.some((re) => re.test(text));
}

export function sanitizeUserFacingMessage(text: string): string {
  let result = text;
  for (const [pattern, replacement] of TRUST_SAFE_ALTERNATIVES) {
    result = result.replace(pattern, replacement);
  }
  return result.trim();
}

export function assertTrustSafeMessage(text: string): {
  safe: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  if (detectSurveillanceRisk(text)) issues.push("surveillance_risk");
  if (detectTechnicalLanguage(text)) issues.push("technical_language");
  if (isInternalOnlyTopic(text) && detectTechnicalLanguage(text)) {
    issues.push("internal_topic_exposed");
  }
  return { safe: issues.length === 0, issues };
}

// ─── User trust profile ───────────────────────────────────────────────────────

export function buildUserTrustCommunicationProfile(input?: {
  trustScore?: number;
  recentCorrections?: number;
  recentRecoveries?: number;
  explicitCorrectionJustNow?: boolean;
}): UserTrustCommunicationProfile {
  const trustScore = input?.trustScore ?? 70;
  const recentCorrections = input?.recentCorrections ?? 0;
  const recentRecoveries = input?.recentRecoveries ?? 0;
  const prefersMinimalExplanation =
    recentCorrections >= 2 || input?.explicitCorrectionJustNow === true;

  let level: TrustCommunicationLevel = "standard";
  if (prefersMinimalExplanation || trustScore < 50) level = "minimal";
  else if (trustScore >= 80 && recentCorrections === 0) level = "warm";

  return {
    level,
    trustScore,
    recentCorrections,
    recentRecoveries,
    prefersMinimalExplanation,
    surveillanceRisk: prefersMinimalExplanation,
    evaluatedAt: new Date().toISOString(),
  };
}

// ─── Communication decisions ──────────────────────────────────────────────────

export function classifyImprovement(input: {
  internalSummary: string;
  userExperiencedImpact: boolean;
  recoveryNeeded: boolean;
  clearUserValue?: boolean;
}): CommunicationDecision {
  if (isInternalOnlyTopic(input.internalSummary) && !input.userExperiencedImpact) {
    return {
      shouldCommunicate: false,
      category: "internal_only",
      userBenefit: null,
      reason: "Internal diagnostic — founder intelligence only.",
      trustImpact: "neutral",
      surveillanceRisk: false,
      invasiveRisk: false,
    };
  }

  if (input.userExperiencedImpact && input.recoveryNeeded) {
    return {
      shouldCommunicate: true,
      category: "user_experienced_problem",
      userBenefit: "User gets recovery and continuity — not technical explanation.",
      reason: "User experienced impact — recovery messaging appropriate.",
      trustImpact: "positive",
      surveillanceRisk: false,
      invasiveRisk: false,
    };
  }

  if (input.clearUserValue || input.userExperiencedImpact === false) {
    const area = inferImprovementArea(input.internalSummary);
    return {
      shouldCommunicate: true,
      category: "meaningful_improvement",
      userBenefit: IMPROVEMENT_BENEFIT_COPY[area],
      reason: "Clear user benefit without exposing internal mechanics.",
      trustImpact: "positive",
      surveillanceRisk: false,
      invasiveRisk: false,
    };
  }

  return {
    shouldCommunicate: false,
    category: "internal_only",
    userBenefit: null,
    reason: "No user-visible benefit — keep internal.",
    trustImpact: "neutral",
    surveillanceRisk: false,
    invasiveRisk: false,
  };
}

export function evaluateFounderIssueCommunication(warning: FounderWarning): CommunicationDecision {
  const userImpactMetrics = new Set([
    "offer_dismissed",
    "workspace_abandoned",
    "misunderstandings",
    "intervention_failure",
  ]);
  const userExperienced =
    (warning.metric != null && userImpactMetrics.has(warning.metric)) ||
    warning.usersAffected > 0;

  return classifyImprovement({
    internalSummary: `${warning.title}. ${warning.summary}`,
    userExperiencedImpact: userExperienced,
    recoveryNeeded: userExperienced && warning.trustImpact >= 15,
    clearUserValue: false,
  });
}

export function inferImprovementArea(text: string): ImprovementArea {
  for (const { pattern, area } of INTERNAL_TO_AREA) {
    if (pattern.test(text)) return area;
  }
  return "companion_understanding";
}

export function translateInternalToExternal(internalSummary: string): string {
  const area = inferImprovementArea(internalSummary);
  return IMPROVEMENT_BENEFIT_COPY[area];
}

// ─── Recovery Messaging Engine™ ───────────────────────────────────────────────

export function buildRecoveryMessage(
  input: RecoveryMessageInput = {},
  profile?: UserTrustCommunicationProfile,
): RecoveryMessage {
  const level = profile?.level ?? "standard";
  const preserved = input.informationPreserved !== false;
  const ready = input.readyToContinue !== false;

  const headline =
    level === "minimal"
      ? "That didn't work the way it should have."
      : "It looks like that didn't work the way it should have.";

  const bodyParts = [
    "We've corrected the issue.",
    preserved ? "Your information was preserved." : null,
  ].filter(Boolean) as string[];

  if (level === "warm" && !profile?.prefersMinimalExplanation) {
    bodyParts.unshift(
      "We noticed something didn't work as expected and have already corrected it.",
    );
  }

  const continuation = ready
    ? input.contextLabel
      ? `Everything is ready to continue with ${input.contextLabel}.`
      : "Everything is ready to continue."
    : "Let's continue where you left off.";

  return {
    headline,
    body: bodyParts.join(" "),
    continuation,
    category: "user_experienced_problem",
  };
}

export function formatRecoveryMessage(message: RecoveryMessage): string {
  return sanitizeUserFacingMessage(
    [message.headline, message.body, message.continuation].filter(Boolean).join(" "),
  );
}

export function buildRecoveryMessageForMisunderstanding(
  misunderstanding: MisunderstandingType,
  profile?: UserTrustCommunicationProfile,
): RecoveryMessage {
  const contextByType: Partial<Record<MisunderstandingType, string>> = {
    wrong_intervention: "your conversation",
    wrong_problem: "what you're working on",
    wrong_routing: "your workflow",
    wrong_timing: "this moment",
    wrong_confidence: "your next step",
  };
  return buildRecoveryMessage(
    {
      informationPreserved: true,
      readyToContinue: true,
      contextLabel: contextByType[misunderstanding],
    },
    profile,
  );
}

// ─── What's New & Recently Improved ───────────────────────────────────────────

export function registerInternalImprovement(improvement: Omit<InternalImprovement, "releasedAt">): void {
  const items = readRecentImprovements();
  items.unshift({ ...improvement, releasedAt: new Date().toISOString() });
  writeRecentImprovements(items);
}

export function generateWhatsNewSummary(
  improvements?: InternalImprovement[],
): WhatsNewSummary {
  const source = improvements ?? readRecentImprovements();
  const communicable = source
    .map((imp) => ({
      imp,
      decision: classifyImprovement({
        internalSummary: imp.internalSummary,
        userExperiencedImpact: imp.userExperiencedImpact,
        recoveryNeeded: imp.recoveryNeeded,
        clearUserValue: !imp.userExperiencedImpact,
      }),
    }))
    .filter((x) => x.decision.shouldCommunicate && x.decision.category === "meaningful_improvement");

  const items: WhatsNewItem[] =
    communicable.length > 0
      ? communicable.map(({ imp }) => ({
          benefit: translateInternalToExternal(imp.internalSummary),
          area: imp.area,
        }))
      : [
          {
            benefit: IMPROVEMENT_BENEFIT_COPY.conversation_continuity,
            area: "conversation_continuity" as ImprovementArea,
          },
          {
            benefit: IMPROVEMENT_BENEFIT_COPY.project_memory,
            area: "project_memory" as ImprovementArea,
          },
        ];

  return {
    title: "What's new",
    items: items.slice(0, 5),
    tone: "benefit_focused",
    generatedAt: new Date().toISOString(),
  };
}

export function buildRecentlyImprovedSummary(): RecentlyImprovedSummary {
  const whatsNew = generateWhatsNewSummary();
  const fromStore = whatsNew.items.map((i) => {
    const short = i.benefit.split(".")[0] ?? i.benefit;
    return short.replace(/^The companion is getting better at /i, "Improved ");
  });

  const items =
    fromStore.length >= 3
      ? fromStore
      : RECENTLY_IMPROVED_DEFAULTS;

  return {
    heading: "Recently improved",
    items: items.slice(0, 5),
    generatedAt: new Date().toISOString(),
  };
}

export function buildCompanionImprovementHint(area: ImprovementArea): string {
  const benefit = IMPROVEMENT_BENEFIT_COPY[area];
  return sanitizeUserFacingMessage(benefit);
}

// ─── Trust evaluation ─────────────────────────────────────────────────────────

export function evaluateCommunicationTrust(text: string): {
  buildsTrust: boolean;
  couldCreateConcern: boolean;
  couldFeelInvasive: boolean;
  recommendation: string;
} {
  const { safe, issues } = assertTrustSafeMessage(text);
  const invasive = detectSurveillanceRisk(text);
  const technical = detectTechnicalLanguage(text);

  return {
    buildsTrust: safe && !technical,
    couldCreateConcern: technical || issues.includes("internal_topic_exposed"),
    couldFeelInvasive: invasive,
    recommendation: invasive
      ? "Rewrite using experience-based framing — avoid monitoring language."
      : technical
        ? "Translate to user benefit — hide technical and internal details."
        : safe
          ? "Safe to communicate."
          : "Review message before showing to users.",
  };
}

export function resetTrustSafeCommunicationForTests(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(RECENT_IMPROVEMENTS_KEY);
}
