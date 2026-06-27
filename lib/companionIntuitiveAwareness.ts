/**
 * Intuitive Awareness — sense what is happening beneath the surface.
 * Surface Intent vs Actual Need. Not memory, not routing — subtext sensing.
 */

import type { ChatTurn } from "./companionIntelligence";
import type { EmotionalState } from "./companionEmotions";
import type { AdhdNativeAnalysis } from "./adhdNativeIntelligence";
import type { MultiTurnPatternAnalysis } from "./adhdMultiTurnPatterns";
import { tallyThreadSignals } from "./adhdMultiTurnPatterns";
import type { SalesJourneyStage } from "./companionSalesIntelligence";
import {
  analyzeSalesIntelligence,
  mergeSalesIntoIntuitive,
} from "./companionSalesIntelligence";
import {
  analyzeVisibilityIntelligence,
  mergeVisibilityIntoIntuitive,
} from "./companionVisibilityIntelligence";
import {
  analyzeMoneyIntelligence,
  mergeMoneyIntoIntuitive,
} from "./companionMoneyIntelligence";
import {
  analyzeDelegationIntelligence,
  mergeDelegationIntoIntuitive,
} from "./companionDelegationIntelligence";
import {
  analyzeLaunchIntelligence,
  mergeLaunchIntoIntuitive,
} from "./companionLaunchIntelligence";
import {
  mergeAtlasIntoIntuitive,
  resolveSituation,
} from "./adhdEntrepreneurSituationAtlas";
import type { ActionBiasAnalysis } from "./companionActionBias";

export type IntuitiveSignal =
  | "resistance"
  | "hesitation"
  | "drift"
  | "discouragement"
  | "momentum"
  | "avoidance";

export type ActualNeed =
  | "launch_move"
  | "start_execution"
  | "reconnect_goal"
  | "reduce_complexity"
  | "protect_flow"
  | "build_confidence"
  | "make_decision"
  | "clarify_direction";

export type IntuitiveAwarenessAnalysis = {
  surfaceIntent: string;
  actualNeed: ActualNeed | null;
  primarySignal: IntuitiveSignal | null;
  signals: IntuitiveSignal[];
  confidence: "low" | "medium" | "high";
  gapDetected: boolean;
  threadAnchor: string | null;
  companionMove: string;
  situationId?: string | null;
  situationName?: string | null;
};

export type AnalyzeIntuitiveAwarenessInput = {
  messages: ChatTurn[];
  userText: string;
  emotionalState: EmotionalState;
  adhdNative?: AdhdNativeAnalysis | null;
  multiTurn?: MultiTurnPatternAnalysis | null;
  actionBias?: ActionBiasAnalysis | null;
};

const LAUNCH_ANCHOR_RE =
  /\b(?:launch|ship|publish|go live|release|record (?:my )?(?:video|sales)|post (?:my )?offer|start selling|open (?:cart|enrollment))\b/i;

const GOAL_ANCHOR_RE =
  /\b(?:my goal|trying to|need to|want to|working on|focus on|get (?:this|it) (?:done|out|live))\b/i;

const HESITATION_RE =
  /\b(?:maybe|probably should|i guess|not (?:totally )?sure|might need|kind of|sort of|i think i should|need to think)\b/i;

const RESISTANCE_RE =
  /\b(?:don'?t want to|hard to (?:start|do|face|get back)|can'?t make myself|keep putting off|dreading|scared to|afraid to|afraid they|never do|keep saying)\b/i;

const AVOIDANCE_SURFACE_RE =
  /\b(?:just need to|first i (?:need|should|have to)|before i can|before i (?:email|send|start)|tweak|fix(?:ing)?|update(?:ing)?|organize|clean|rearrang|sort|set up (?:my )?system|map out .+ before|redo .+ first)\b/i;

const DISCOURAGEMENT_RE =
  /\b(?:nobody will|not good at|why did i think|give up|what'?s the point|i always mess|useless|won'?t work)\b/i;

const DRIFT_RE =
  /\b(?:or maybe|what about|instead|another idea|different direction|switch to|actually maybe)\b/i;

const MOMENTUM_RE =
  /\b(?:on a roll|in the flow|just (?:finished|wrote|built|sent)|made progress|got it done|keep going|don'?t interrupt)\b/i;

const PRICING_PARALYSIS_RE =
  /\b(?:think about pricing|pricing more|what to charge|pick a price|price my offer|not sure what to charge|before i decide)\b/i;

const BURNOUT_RE =
  /\b(?:burned out|burnt out|behind on everything|so tired|exhausted|ashamed|everything feels like too much)\b/i;

const OFFER_CONFUSION_RE =
  /\b(?:can'?t explain my offer|not sure who it'?s for|unclear offer|don'?t know who it'?s for|not totally sure who)\b/i;

const REENTRY_RE =
  /\b(?:i'?m back|sorry i disappeared|disappeared for a few)\b/i;

const MONDAY_START_RE =
  /\b(?:monday|start the week|where to begin|can'?t make myself start|can'?t start)\b/i;

const DELAY_RE =
  /\b(?:putting off|keep putting off|been delaying|delaying it|avoiding the reply|haven'?t started)\b/i;

const REDESIGN_BEFORE_LAUNCH_RE =
  /\b(?:redesign|tweak|fix).*(?:website|site).*(?:before|launch)|before i can launch\b/i;

const SURFACE_EXTRACT_RE =
  /^(?:i (?:just )?need to|first i should|maybe i should|let me) ([^.!?]{4,80})/i;

function userTurns(messages: ChatTurn[]): string[] {
  return messages.filter((m) => m.role === "user").map((m) => m.content.trim());
}

function inferThreadAnchor(messages: ChatTurn[]): string | null {
  for (const text of userTurns(messages)) {
    if (LAUNCH_ANCHOR_RE.test(text)) return text.slice(0, 120);
    if (GOAL_ANCHOR_RE.test(text)) return text.slice(0, 120);
  }
  return null;
}

function extractSurfaceIntent(userText: string): string {
  const trimmed = userText.trim();
  const match = SURFACE_EXTRACT_RE.exec(trimmed);
  if (match?.[1]) return match[1].trim().slice(0, 100);
  const firstSentence = trimmed.split(/[.!?]/)[0]?.trim();
  return (firstSentence || trimmed).slice(0, 100);
}

function countIdeaSwitches(messages: ChatTurn[]): number {
  return userTurns(messages).filter((t) => DRIFT_RE.test(t)).length;
}

function detectSignals(input: {
  userText: string;
  messages: ChatTurn[];
  adhdNative?: AdhdNativeAnalysis | null;
  multiTurn?: MultiTurnPatternAnalysis | null;
  actionBias?: ActionBiasAnalysis | null;
  threadAnchor: string | null;
}): IntuitiveSignal[] {
  const signals = new Set<IntuitiveSignal>();
  const t = input.userText.trim();
  const threadSignals = tallyThreadSignals(userTurns(input.messages));

  if (
    input.actionBias?.momentumActive ||
    MOMENTUM_RE.test(t) ||
    input.adhdNative?.protectionMode === "momentum"
  ) {
    signals.add("momentum");
  }

  if (
    AVOIDANCE_SURFACE_RE.test(t) ||
    (threadSignals.avoidance_shift ?? 0) >= 1 ||
    input.multiTurn?.primary?.pattern === "avoidance_as_productivity" ||
    input.adhdNative?.thinkingPattern === "avoidance_as_productivity"
  ) {
    signals.add("avoidance");
  }

  if (
    input.multiTurn?.primary?.pattern === "planning_addiction" ||
    input.multiTurn?.primary?.pattern === "perfectionism_as_preparation" ||
    input.adhdNative?.thinkingPattern === "planning_addiction" ||
    input.adhdNative?.thinkingPattern === "perfectionism_as_preparation" ||
    (threadSignals.planning_language ?? 0) >= 2
  ) {
    signals.add("avoidance");
  }

  if (HESITATION_RE.test(t) || (threadSignals.uncertainty ?? 0) >= 2) {
    signals.add("hesitation");
  }

  if (OFFER_CONFUSION_RE.test(t)) {
    signals.add("hesitation");
  }

  if (RESISTANCE_RE.test(t) || input.adhdNative?.frictions.includes("emotional_resistance")) {
    signals.add("resistance");
  }

  if (
    countIdeaSwitches(input.messages) >= 2 ||
    input.multiTurn?.primary?.pattern === "idea_explosion" ||
    input.adhdNative?.thinkingPattern === "idea_explosion"
  ) {
    signals.add("drift");
  }

  if (
    DISCOURAGEMENT_RE.test(t) ||
    (threadSignals.self_criticism ?? 0) >= 2 ||
    input.multiTurn?.primary?.pattern === "confidence_collapse"
  ) {
    signals.add("discouragement");
  }

  if (DELAY_RE.test(t)) {
    signals.add("avoidance");
    signals.add("resistance");
  }

  if (REDESIGN_BEFORE_LAUNCH_RE.test(t)) {
    signals.add("avoidance");
  }

  if (
    input.threadAnchor &&
    LAUNCH_ANCHOR_RE.test(input.threadAnchor) &&
    AVOIDANCE_SURFACE_RE.test(t) &&
    !LAUNCH_ANCHOR_RE.test(t)
  ) {
    signals.add("avoidance");
  }

  return [...signals];
}

function inferActualNeed(input: {
  signals: IntuitiveSignal[];
  userText: string;
  messages: ChatTurn[];
  adhdNative?: AdhdNativeAnalysis | null;
  multiTurn?: MultiTurnPatternAnalysis | null;
  actionBias?: ActionBiasAnalysis | null;
  threadAnchor: string | null;
}): ActualNeed | null {
  const pattern = input.multiTurn?.primary?.pattern ?? input.adhdNative?.thinkingPattern;

  if (input.signals.includes("momentum") || input.actionBias?.hyperfocusActive) {
    return "protect_flow";
  }

  if (
    BURNOUT_RE.test(input.userText) ||
    userTurns(input.messages).some((line) => BURNOUT_RE.test(line))
  ) {
    return "reduce_complexity";
  }

  if (
    PRICING_PARALYSIS_RE.test(input.userText) ||
    userTurns(input.messages).some((line) => PRICING_PARALYSIS_RE.test(line))
  ) {
    return "make_decision";
  }

  if (
    OFFER_CONFUSION_RE.test(input.userText) ||
    userTurns(input.messages).some((line) => OFFER_CONFUSION_RE.test(line))
  ) {
    return "clarify_direction";
  }

  if (
    REENTRY_RE.test(input.userText) &&
    userTurns(input.messages).some((line) => /\b(?:yes|let'?s do it|sounds good)\b/i.test(line))
  ) {
    return "start_execution";
  }

  if (
    MONDAY_START_RE.test(input.userText) ||
    userTurns(input.messages).some((line) => MONDAY_START_RE.test(line))
  ) {
    return "clarify_direction";
  }

  if (
    LAUNCH_ANCHOR_RE.test(input.userText) &&
    (input.signals.includes("resistance") || DELAY_RE.test(input.userText))
  ) {
    return "launch_move";
  }

  if (pattern === "overwhelm_from_volume" || input.adhdNative?.primaryFriction === "overwhelm") {
    return "reduce_complexity";
  }

  if (pattern === "idea_explosion" || input.signals.includes("drift")) {
    return "reconnect_goal";
  }

  if (
    pattern === "planning_addiction" ||
    pattern === "perfectionism_as_preparation" ||
    (tallyThreadSignals(userTurns(input.messages)).planning_language ?? 0) >= 2
  ) {
    return "start_execution";
  }

  if (
    pattern === "confidence_collapse" ||
    input.signals.includes("discouragement")
  ) {
    return "build_confidence";
  }

  if (
    input.signals.includes("avoidance") ||
    pattern === "avoidance_as_productivity"
  ) {
    if (input.threadAnchor && LAUNCH_ANCHOR_RE.test(input.threadAnchor)) {
      return "launch_move";
    }
    return "start_execution";
  }

  if (
    input.adhdNative?.frictions.includes("decision_fatigue") ||
    input.actionBias?.decisionAcceleration
  ) {
    return "make_decision";
  }

  if (input.signals.includes("hesitation") || input.signals.includes("resistance")) {
    return "clarify_direction";
  }

  return null;
}

function inferConfidence(signals: IntuitiveSignal[], actualNeed: ActualNeed | null): "low" | "medium" | "high" {
  if (signals.length >= 2 && actualNeed) return "high";
  if (signals.length >= 1 && actualNeed) return "medium";
  if (signals.length >= 1) return "low";
  return "low";
}

function companionMoveFor(actualNeed: ActualNeed | null, gapDetected: boolean): string {
  if (!actualNeed) {
    return "Listen for what they are not saying. Reflect simply before advising.";
  }
  const moves: Record<ActualNeed, string> = {
    launch_move:
      "Name possible avoidance gently. Help touch the launch step — not another prep task.",
    start_execution:
      "Stop adding plans or systems. Help start the smallest meaningful action now.",
    reconnect_goal:
      "Stop generating directions. Reconnect to the original goal and choose ONE.",
    reduce_complexity:
      "Reduce choices and volume. Do not add more options or information.",
    protect_flow:
      "Protect momentum. Minimal words. No redirects, frameworks, or extra questions.",
    build_confidence:
      "Warmth without therapy. One small win or evidence-based progress — not cheerleading.",
    make_decision:
      "Enough context likely exists. Help decide — do not gather more input.",
    clarify_direction:
      "One useful question only — the one that most improves forward movement.",
  };
  const base = moves[actualNeed];
  return gapDetected
    ? `Surface request may not be the real need. ${base}`
    : base;
}

export function analyzeIntuitiveAwareness(
  input: AnalyzeIntuitiveAwarenessInput,
): IntuitiveAwarenessAnalysis {
  const threadAnchor = inferThreadAnchor(input.messages);
  const surfaceIntent = extractSurfaceIntent(input.userText);
  const signals = detectSignals({
    userText: input.userText,
    messages: input.messages,
    adhdNative: input.adhdNative,
    multiTurn: input.multiTurn,
    actionBias: input.actionBias,
    threadAnchor,
  });
  const actualNeed = inferActualNeed({
    signals,
    userText: input.userText,
    messages: input.messages,
    adhdNative: input.adhdNative,
    multiTurn: input.multiTurn,
    actionBias: input.actionBias,
    threadAnchor,
  });

  const sales = analyzeSalesIntelligence({
    userText: input.userText,
    messages: input.messages,
  });
  let finalSignals = signals;
  let finalActualNeed = actualNeed;
  let companionMove = companionMoveFor(actualNeed, false);

  if (sales && (sales.primaryPattern || sales.stage || sales.patterns.length > 0)) {
    const merged = mergeSalesIntoIntuitive({
      sales,
      existingSignals: signals,
      existingActualNeed: actualNeed,
    });
    finalSignals = merged.signals;
    if (sales.actualNeed) finalActualNeed = sales.actualNeed;
    companionMove = merged.companionMove;
  }

  const visibility = analyzeVisibilityIntelligence({
    userText: input.userText,
    messages: input.messages,
  });
  if (
    visibility &&
    !sales?.inSalesContext &&
    (visibility.primaryPattern || visibility.patterns.length > 0)
  ) {
    const merged = mergeVisibilityIntoIntuitive({
      visibility,
      existingSignals: finalSignals,
    });
    finalSignals = merged.signals;
    if (visibility.actualNeed) finalActualNeed = merged.actualNeed;
    companionMove = merged.companionMove;
  }

  const money = analyzeMoneyIntelligence({
    userText: input.userText,
    messages: input.messages,
  });
  if (money && (money.primaryPattern || money.patterns.length > 0) && !sales?.inSalesContext) {
    const merged = mergeMoneyIntoIntuitive({
      money,
      existingSignals: finalSignals,
      existingActualNeed: finalActualNeed,
    });
    finalSignals = merged.signals;
    if (money.actualNeed) finalActualNeed = merged.actualNeed;
    companionMove = merged.companionMove;
  }

  const delegation = analyzeDelegationIntelligence({
    userText: input.userText,
    messages: input.messages,
  });
  if (delegation && (delegation.primaryPattern || delegation.patterns.length > 0)) {
    const merged = mergeDelegationIntoIntuitive({
      delegation,
      existingSignals: finalSignals,
      existingActualNeed: finalActualNeed,
    });
    finalSignals = merged.signals;
    if (delegation.actualNeed) finalActualNeed = merged.actualNeed;
    companionMove = merged.companionMove;
  }

  const launch = analyzeLaunchIntelligence({
    userText: input.userText,
    messages: input.messages,
  });
  if (
    launch &&
    (launch.primaryPattern || launch.patterns.length > 0) &&
    !visibility?.inVisibilityContext
  ) {
    const merged = mergeLaunchIntoIntuitive({
      launch,
      existingSignals: finalSignals,
      existingActualNeed: finalActualNeed,
    });
    finalSignals = merged.signals;
    if (launch.actualNeed) finalActualNeed = merged.actualNeed;
    companionMove = merged.companionMove;
  }

  const launchResolved = Boolean(
    launch?.primaryPattern && (launch.inLaunchContext || launch.actualNeed),
  );
  const visibilityResolved = Boolean(
    visibility?.primaryPattern && visibility.inVisibilityContext,
  );
  const moneyResolved = Boolean(money?.primaryPattern && money.inMoneyContext);
  const delegationResolved = Boolean(
    delegation?.primaryPattern && delegation.inDelegationContext,
  );
  const salesResolved = Boolean(sales?.primaryPattern || sales?.stage);

  const atlasResolution = resolveSituation({
    userText: input.userText,
    messages: input.messages,
  });
  const domainIntelligenceLocked =
    salesResolved || visibilityResolved || moneyResolved || delegationResolved || launchResolved;

  if (
    atlasResolution.matched &&
    atlasResolution.primary &&
    !domainIntelligenceLocked &&
    (atlasResolution.primary.confidence === "high" ||
      atlasResolution.primary.confidence === "medium")
  ) {
    const atlasMerged = mergeAtlasIntoIntuitive({
      resolution: atlasResolution,
      existingSignals: finalSignals,
      existingActualNeed: finalActualNeed,
      existingMove: companionMove,
    });
    finalSignals = atlasMerged.signals;
    if (atlasMerged.actualNeed) finalActualNeed = atlasMerged.actualNeed;
    companionMove = atlasMerged.companionMove;
  }

  let situationId: string | null = null;
  let situationName: string | null = null;
  if (atlasResolution.matched && !domainIntelligenceLocked) {
    situationId = atlasResolution.situationId;
    situationName = atlasResolution.situationName;
  }

  const confidence = inferConfidence(finalSignals, finalActualNeed);
  const gapDetected = Boolean(
    finalActualNeed &&
      surfaceIntent &&
      (sales?.inSalesContext ||
        visibility?.inVisibilityContext ||
        money?.inMoneyContext ||
        delegation?.inDelegationContext ||
        launch?.inLaunchContext ||
        !surfaceIntent.toLowerCase().includes(finalActualNeed.replace(/_/g, " ").slice(0, 8))),
  );

  if (
    gapDetected &&
    !sales &&
    !visibility?.inVisibilityContext &&
    !money?.inMoneyContext &&
    !delegation?.inDelegationContext &&
    !launch?.inLaunchContext
  ) {
    companionMove = companionMoveFor(finalActualNeed, true);
  }

  return {
    surfaceIntent,
    actualNeed: finalActualNeed,
    primarySignal: finalSignals[0] ?? null,
    signals: finalSignals,
    confidence,
    gapDetected,
    threadAnchor,
    companionMove,
    situationId,
    situationName,
  };
}

/** Injected into companion-chat — subtext sensing without exposing internals. */
export function intuitiveAwarenessHintForChat(
  analysis: IntuitiveAwarenessAnalysis,
): string | undefined {
  if (analysis.confidence === "low" && !analysis.gapDetected) return undefined;

  const parts: string[] = [
    "INTUITIVE AWARENESS (mandatory — sense beneath the surface):",
    "What the user says is often NOT the real thing. Sense resistance, hesitation, drift, discouragement, momentum, and avoidance without needing explicit statements.",
    "SURFACE INTENT vs ACTUAL NEED: respond to the actual need, not only the literal request.",
  ];

  if (analysis.gapDetected) {
    parts.push(
      `Gap detected: surface ("${analysis.surfaceIntent}") may mask a deeper need.`,
    );
  }

  if (analysis.threadAnchor) {
    parts.push(`Thread anchor: "${analysis.threadAnchor}" — protect continuity with this goal.`);
  }

  if (analysis.primarySignal) {
    parts.push(
      `Primary subtext signal: ${analysis.primarySignal.replace(/_/g, " ")}.`,
    );
  }

  if (analysis.actualNeed) {
    parts.push(`Likely actual need: ${analysis.actualNeed.replace(/_/g, " ")}.`);
    parts.push(`Move: ${analysis.companionMove}`);
  }

  if (analysis.situationName) {
    parts.push(
      `Situation recognized: ${analysis.situationName} — respond to the human situation, not only keywords.`,
    );
  }

  parts.push(
    "Do not force analysis. Do not ask what they already showed you indirectly.",
    "Help them move forward from what is really happening.",
  );

  return parts.join("\n");
}
