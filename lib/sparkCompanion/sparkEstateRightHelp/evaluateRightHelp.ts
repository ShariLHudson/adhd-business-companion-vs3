import { detectMemberEmotionalSignals } from "@/lib/conversation/emotionalFirstResponseSequence";
import {
  hasCreateSignals,
  hasDiscoverSignals,
  hasSupportSignals,
  hasThinkSignals,
} from "@/lib/sparkCompanion/dynamicCompanionRoles/roleSignals";
import {
  HELP_CHOICES_DISCOURAGED,
  HELP_CHOICES_EMOTIONAL,
  HELP_CHOICES_WORKING,
} from "./roles";
import type {
  HelpContextKind,
  RightHelpRoleId,
  SparkRightHelpDecision,
} from "./types";

const WHY_UNDERSTAND_RE =
  /\b(?:why do i (?:keep|always)|why can'?t i|why does this (?:keep|always)|what'?s happening|help me understand|make sense of)\b/i;

const STAY_ALONE_RE =
  /\b(?:don'?t want to be alone|feel alone|stay with me|just (?:be|stay) (?:here|with)|don'?t leave|need someone here)\b/i;

const PERMISSION_RE =
  /\b(?:burn(?:ed|out)|need (?:to )?rest|permission to (?:rest|stop|pause)|say no|simplify|change direction|begin again|push forward or rest)\b/i;

const LISTEN_VENT_RE =
  /\b(?:just (?:need to )?(?:talk|vent|listen)|think out loud|hear me out|not asking for (?:advice|answers))\b/i;

const DISCOURAGED_RE =
  /\b(?:discouraged|lost confidence|give up|not good enough|can'?t do this|what'?s the point)\b/i;

function inferContext(
  text: string,
  overwhelmed?: boolean,
  emotional?: readonly string[],
): HelpContextKind {
  if (DISCOURAGED_RE.test(text) || emotional?.includes("discouragement")) {
    return "discouraged";
  }
  if (hasCreateSignals(text) || /\bresearch\b/i.test(text)) {
    return "working";
  }
  if (
    overwhelmed ||
    (emotional && emotional.length > 0) ||
    hasSupportSignals(text, overwhelmed)
  ) {
    return "emotional";
  }
  return "general";
}

function choicesForContext(context: HelpContextKind) {
  switch (context) {
    case "emotional":
      return HELP_CHOICES_EMOTIONAL;
    case "working":
      return HELP_CHOICES_WORKING;
    case "discouraged":
      return HELP_CHOICES_DISCOURAGED;
    default:
      return HELP_CHOICES_EMOTIONAL;
  }
}

function confidenceFor(
  role: RightHelpRoleId,
  signals: {
    build: boolean;
    guide: boolean;
    understand: boolean;
    listen: boolean;
    encourage: boolean;
    permission: boolean;
    stay: boolean;
  },
): "high" | "medium" | "low" {
  const count = Object.values(signals).filter(Boolean).length;
  if (count === 1) {
    if (signals.build && role === "build") return "high";
    if (signals.stay && role === "stay_with_me") return "high";
    if (signals.listen && role === "listen") return "high";
    if (signals.permission && role === "permission") return "high";
  }
  if (count === 0) return "low";
  if (role === "build" && signals.build && !signals.listen) return "high";
  if (role === "guide" && signals.guide && !signals.build) return "high";
  if (role === "understand" && signals.understand) return "high";
  if (role === "encourage" && signals.encourage) return "high";
  return count > 2 ? "low" : "medium";
}

export function evaluateSparkRightHelp(input: {
  userText: string;
  overwhelmed?: boolean;
}): SparkRightHelpDecision {
  const text = input.userText.trim();
  const emotional = detectMemberEmotionalSignals(text);

  if (!text) {
    return {
      role: "listen",
      confidence: "low",
      context: "general",
      offerChoices: HELP_CHOICES_EMOTIONAL,
      reason: "empty — gentle listen",
    };
  }

  const context = inferContext(text, input.overwhelmed, emotional);
  const offerChoices = choicesForContext(context);

  const signals = {
    build: hasCreateSignals(text) || /\bresearch\b/i.test(text),
    guide: hasThinkSignals(text) || /\b(?:priorit|next step|which direction|compare options)\b/i.test(text),
    understand:
      WHY_UNDERSTAND_RE.test(text) ||
      hasDiscoverSignals(text) ||
      /\bwhy\b/i.test(text),
    listen:
      LISTEN_VENT_RE.test(text) ||
      (hasSupportSignals(text, input.overwhelmed) &&
        !hasCreateSignals(text) &&
        !hasThinkSignals(text)),
    encourage: DISCOURAGED_RE.test(text) || emotional.includes("discouragement"),
    permission: PERMISSION_RE.test(text) || input.overwhelmed,
    stay: STAY_ALONE_RE.test(text) || /\b(?:lonely|loneliness)\b/i.test(text),
  };

  let role: RightHelpRoleId = "guide";

  if (signals.stay) role = "stay_with_me";
  else if (signals.build && !signals.listen && !signals.stay) role = "build";
  else if (signals.permission && !signals.build) role = "permission";
  else if (signals.encourage && !signals.build) role = "encourage";
  else if (signals.listen && !signals.build) role = "listen";
  else if (signals.understand && !signals.build) role = "understand";
  else if (signals.guide) role = "guide";
  else if (signals.build) role = "build";

  const confidence = confidenceFor(role, signals);

  return {
    role,
    confidence,
    context,
    offerChoices,
    reason: `${role} (${context}) — ${confidence}`,
  };
}
