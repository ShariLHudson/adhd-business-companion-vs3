/**
 * P0.13 — Companion response speed profiler + route budgets.
 * Right amount of intelligence per request — fast when simple, deep when reflective.
 */

import { isKnowledgeQuestion } from "./knowledgeIntelligence";
import {
  isFrictionlessAffirmation,
  resolveFrictionlessAction,
} from "./frictionlessActionLayer";
import type { FrictionlessActionDecision } from "./frictionlessActionLayer";
import {
  resolveIntentRouting,
  type IntentRoutingDecision,
} from "./intentRoutingIntelligence";
import { isAppHowToQuestion } from "./appFeatureKnowledge";
import { isCompanionFirstQuestion } from "./companionFirstWorkflow";

export type ResponseRouteClass = "instant" | "fast" | "deep";

export type CompanionLayerSkipFlags = {
  relationshipObservation: boolean;
  adhdOS: boolean;
  wisdom: boolean;
  transformation: boolean;
  ecosystem: boolean;
  responseContract: boolean;
  phaseObservers: boolean;
  ecosystemSnapshots: boolean;
  heavyPhaseHints: boolean;
  presenceDelay: boolean;
};

export type CompanionSpeedProfile = {
  routeClass: ResponseRouteClass;
  routeReason: string;
  budgetMs: number;
  skipHeavyLayers: boolean;
  useLocalReplyOnly: boolean;
  skipLayers: CompanionLayerSkipFlags;
};

export type LatencyMarkName =
  | "totalTurn"
  | "intentRouting"
  | "frictionlessAction"
  | "knowledgeDetection"
  | "relationshipConfidence"
  | "observationEngine"
  | "adhdOSIntelligence"
  | "wisdomIntelligence"
  | "transformationIntelligence"
  | "ecosystemIntelligence"
  | "promptConstruction"
  | "apiModel"
  | "responseEnforcement"
  | "uiRender";

export type PromptBlockAudit = {
  finalPromptLength: number;
  blockCount: number;
  activeBlocks: string[];
  skippedBlocks: string[];
};

export type CompanionLatencyTurnReport = {
  turnId: number;
  userText: string;
  routeClass: ResponseRouteClass;
  routeReason: string;
  budgetMs: number;
  skipHeavyLayers: boolean;
  usedLocalReply: boolean;
  calledApi: boolean;
  timingsMs: Partial<Record<LatencyMarkName, number>>;
  preApiMs: number;
  promptAudit: PromptBlockAudit | null;
};

const ROUTE_BUDGET_MS: Record<ResponseRouteClass, number> = {
  instant: 500,
  fast: 1500,
  deep: 8000,
};

const DEEP_PATH_RE =
  /\b(?:why do i|what patterns|patterns have you noticed|how have i changed|self[- ]understanding|transformation|wisdom|diagnos|strategy|long[- ]term|business diagnosis|why am i|what have you noticed|how do i usually|my pattern|biggest strength|keep starting but not finishing|starting but not finishing)\b/i;

const STRATEGY_DEEP_RE =
  /\b(?:business strategy|diagnose my business|whole business|operating system|why does this keep happening)\b/i;

function instantSkipLayers(): CompanionLayerSkipFlags {
  return {
    relationshipObservation: true,
    adhdOS: true,
    wisdom: true,
    transformation: true,
    ecosystem: true,
    responseContract: true,
    phaseObservers: true,
    ecosystemSnapshots: true,
    heavyPhaseHints: true,
    presenceDelay: true,
  };
}

function fastSkipLayers(): CompanionLayerSkipFlags {
  return {
    relationshipObservation: true,
    adhdOS: true,
    wisdom: true,
    transformation: true,
    ecosystem: true,
    responseContract: true,
    phaseObservers: true,
    ecosystemSnapshots: true,
    heavyPhaseHints: true,
    presenceDelay: true,
  };
}

function deepSkipLayers(): CompanionLayerSkipFlags {
  return {
    relationshipObservation: false,
    adhdOS: false,
    wisdom: false,
    transformation: false,
    ecosystem: false,
    responseContract: false,
    phaseObservers: false,
    ecosystemSnapshots: false,
    heavyPhaseHints: false,
    presenceDelay: false,
  };
}

export function isDeepReflectionRequest(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;
  if (DEEP_PATH_RE.test(t)) return true;
  if (STRATEGY_DEEP_RE.test(t)) return true;
  return false;
}

export type ResolveCompanionResponseRouteInput = {
  userText: string;
  routing: IntentRoutingDecision;
  frictionless: FrictionlessActionDecision;
  isYesContinuation?: boolean;
  hasPendingFrictionless?: boolean;
  isMenuContinuation?: boolean;
};

export function resolveCompanionResponseRoute(
  input: ResolveCompanionResponseRouteInput,
): CompanionSpeedProfile {
  const t = input.userText.trim();

  if (input.isMenuContinuation) {
    return {
      routeClass: "instant",
      routeReason: "menu_continuation",
      budgetMs: ROUTE_BUDGET_MS.instant,
      skipHeavyLayers: true,
      useLocalReplyOnly: false,
      skipLayers: instantSkipLayers(),
    };
  }

  if (input.isYesContinuation || (input.hasPendingFrictionless && isFrictionlessAffirmation(t))) {
    return {
      routeClass: "instant",
      routeReason: "yes_continuation_or_pending_accept",
      budgetMs: ROUTE_BUDGET_MS.instant,
      skipHeavyLayers: true,
      useLocalReplyOnly: true,
      skipLayers: instantSkipLayers(),
    };
  }

  if (input.frictionless.localReply) {
    const reason =
      input.frictionless.category === "tool_open"
        ? "local_tool_offer"
        : input.frictionless.category === "emotional_regulation"
          ? "local_calm_support"
          : input.frictionless.category === "adhd_emotional_friction"
            ? "local_adhd_emotional_friction"
            : input.frictionless.category === "reminder"
              ? "local_reminder"
              : input.frictionless.category === "focus_support"
            ? "local_focus_support"
            : input.frictionless.category === "direct_action"
              ? "local_create_offer"
              : "local_frictionless_reply";
    return {
      routeClass: "instant",
      routeReason: reason,
      budgetMs: ROUTE_BUDGET_MS.instant,
      skipHeavyLayers: true,
      useLocalReplyOnly: true,
      skipLayers: instantSkipLayers(),
    };
  }

  if (isDeepReflectionRequest(t) || input.routing.category === "understand") {
    return {
      routeClass: "deep",
      routeReason:
        input.routing.category === "understand"
          ? "understand_intent"
          : "deep_reflection_phrasing",
      budgetMs: ROUTE_BUDGET_MS.deep,
      skipHeavyLayers: false,
      useLocalReplyOnly: false,
      skipLayers: deepSkipLayers(),
    };
  }

  if (
    input.routing.learnFastPath ||
    input.routing.category === "learn" ||
    isKnowledgeQuestion(t)
  ) {
    return {
      routeClass: "fast",
      routeReason: "learn_knowledge",
      budgetMs: ROUTE_BUDGET_MS.fast,
      skipHeavyLayers: true,
      useLocalReplyOnly: false,
      skipLayers: fastSkipLayers(),
    };
  }

  if (
    input.routing.category === "build" ||
    input.routing.category === "execute" ||
    input.frictionless.category === "direct_action"
  ) {
    return {
      routeClass: "fast",
      routeReason: "create_execute",
      budgetMs: ROUTE_BUDGET_MS.fast,
      skipHeavyLayers: true,
      useLocalReplyOnly: false,
      skipLayers: fastSkipLayers(),
    };
  }

  if (
    input.frictionless.category === "focus_support" ||
    input.frictionless.category === "emotional_regulation" ||
    input.frictionless.category === "adhd_emotional_friction" ||
    input.frictionless.category === "reminder" ||
    input.frictionless.category === "tool_open"
  ) {
    return {
      routeClass: "fast",
      routeReason: "focus_calm_tool",
      budgetMs: ROUTE_BUDGET_MS.fast,
      skipHeavyLayers: true,
      useLocalReplyOnly: input.frictionless.category === "tool_open",
      skipLayers: fastSkipLayers(),
    };
  }

  if (
    isAppHowToQuestion(t) ||
    isCompanionFirstQuestion(t) ||
    input.routing.category === "clarify"
  ) {
    return {
      routeClass: "fast",
      routeReason: "feature_navigation",
      budgetMs: ROUTE_BUDGET_MS.fast,
      skipHeavyLayers: true,
      useLocalReplyOnly: false,
      skipLayers: fastSkipLayers(),
    };
  }

  if (input.routing.category === "decide") {
    return {
      routeClass: "fast",
      routeReason: "decision_support",
      budgetMs: ROUTE_BUDGET_MS.fast,
      skipHeavyLayers: true,
      useLocalReplyOnly: false,
      skipLayers: fastSkipLayers(),
    };
  }

  return {
    routeClass: "deep",
    routeReason: "default_conversation",
    budgetMs: ROUTE_BUDGET_MS.deep,
    skipHeavyLayers: false,
    useLocalReplyOnly: false,
    skipLayers: deepSkipLayers(),
  };
}

export function auditPromptBlocks(input: {
  blocks: Array<{ name: string; text: string | null | undefined }>;
  skippedBlockNames?: string[];
}): PromptBlockAudit {
  const activeBlocks: string[] = [];
  let finalPromptLength = 0;
  for (const block of input.blocks) {
    if (!block.text?.trim()) continue;
    activeBlocks.push(block.name);
    finalPromptLength += block.text.length;
  }
  return {
    finalPromptLength,
    blockCount: activeBlocks.length,
    activeBlocks,
    skippedBlocks: input.skippedBlockNames ?? [],
  };
}

export class CompanionLatencyProfiler {
  private readonly startMs = performance.now();
  private readonly marks = new Map<string, number>();
  private readonly timingsMs: Partial<Record<LatencyMarkName, number>> = {};
  readonly turnId: number;
  readonly userText: string;
  routeClass: ResponseRouteClass = "fast";
  routeReason = "";
  budgetMs = ROUTE_BUDGET_MS.fast;
  skipHeavyLayers = false;
  usedLocalReply = false;
  calledApi = false;
  promptAudit: PromptBlockAudit | null = null;

  constructor(turnId: number, userText: string) {
    this.turnId = turnId;
    this.userText = userText;
  }

  applySpeedProfile(profile: CompanionSpeedProfile): void {
    this.routeClass = profile.routeClass;
    this.routeReason = profile.routeReason;
    this.budgetMs = profile.budgetMs;
    this.skipHeavyLayers = profile.skipHeavyLayers;
  }

  mark(name: LatencyMarkName): void {
    this.marks.set(name, performance.now());
  }

  measure(name: LatencyMarkName, from?: LatencyMarkName): number {
    const end = performance.now();
    const start = this.marks.get(from ?? name) ?? this.startMs;
    const ms = Math.round(end - start);
    this.timingsMs[name] = ms;
    return ms;
  }

  recordTiming(name: LatencyMarkName, ms: number): void {
    this.timingsMs[name] = ms;
  }

  setPromptAudit(audit: PromptBlockAudit): void {
    this.promptAudit = audit;
  }

  preApiMs(): number {
    return Math.round(performance.now() - this.startMs);
  }

  report(): CompanionLatencyTurnReport {
    this.timingsMs.totalTurn = Math.round(performance.now() - this.startMs);
    return {
      turnId: this.turnId,
      userText: this.userText,
      routeClass: this.routeClass,
      routeReason: this.routeReason,
      budgetMs: this.budgetMs,
      skipHeavyLayers: this.skipHeavyLayers,
      usedLocalReply: this.usedLocalReply,
      calledApi: this.calledApi,
      timingsMs: { ...this.timingsMs },
      preApiMs: this.preApiMs(),
      promptAudit: this.promptAudit,
    };
  }
}

export function logCompanionLatency(report: CompanionLatencyTurnReport): void {
  if (process.env.NODE_ENV === "production") return;
  const budgetOk =
    report.calledApi === false
      ? report.preApiMs <= report.budgetMs
      : report.preApiMs <= report.budgetMs;
  // eslint-disable-next-line no-console
  console.info("[companion-latency]", {
    turn: report.turnId,
    route: report.routeClass,
    reason: report.routeReason,
    budgetMs: report.budgetMs,
    preApiMs: report.preApiMs,
    budgetOk,
    localReply: report.usedLocalReply,
    api: report.calledApi,
    skipHeavy: report.skipHeavyLayers,
    timingsMs: report.timingsMs,
    prompt: report.promptAudit,
    user: report.userText.slice(0, 80),
  });
}

export type QaLatencyReportRow = {
  case: string;
  userText: string;
  routeClass: ResponseRouteClass;
  budgetMs: number;
  skipHeavyLayers: boolean;
  useLocalReplyOnly: boolean;
  skippedLayers: string[];
};

export type QaLatencyCaseInput = {
  label: string;
  userText: string;
  isYesContinuation?: boolean;
  hasPendingFrictionless?: boolean;
  lastAssistantText?: string;
};

/** Dev/CI summary for P0.13 QA cases — route class + budget per prompt. */
export function buildCompanionQaLatencyReport(
  cases: QaLatencyCaseInput[],
): QaLatencyReportRow[] {
  return cases.map((qa) => {
    const routing = resolveIntentRouting({ userText: qa.userText });
    const frictionless = resolveFrictionlessAction({
      userText: qa.userText,
      currentTurn: 2,
      lastAssistantText: qa.lastAssistantText ?? "",
    });
    const profile = resolveCompanionResponseRoute({
      userText: qa.userText,
      routing,
      frictionless,
      isYesContinuation: qa.isYesContinuation,
      hasPendingFrictionless: qa.hasPendingFrictionless,
    });
    const skippedLayers = (
      Object.entries(profile.skipLayers) as Array<[string, boolean]>
    )
      .filter(([, skip]) => skip)
      .map(([name]) => name);
    return {
      case: qa.label,
      userText: qa.userText,
      routeClass: profile.routeClass,
      budgetMs: profile.budgetMs,
      skipHeavyLayers: profile.skipHeavyLayers,
      useLocalReplyOnly: profile.useLocalReplyOnly,
      skippedLayers,
    };
  });
}

export const COMPANION_QA_LATENCY_CASES: QaLatencyCaseInput[] = [
  { label: "learn", userText: "What is a sales funnel?" },
  { label: "create", userText: "I need to write an email" },
  {
    label: "yes-create",
    userText: "yes",
    isYesContinuation: true,
    hasPendingFrictionless: true,
    lastAssistantText: "Want me to open Create for that email?",
  },
  { label: "calm-music", userText: "I would like calming music" },
  {
    label: "yes-focus-audio",
    userText: "yes",
    isYesContinuation: true,
    hasPendingFrictionless: true,
    lastAssistantText: "I can open Focus Audio for calming music. Want me to open it?",
  },
  {
    label: "deep-why",
    userText: "Why do I keep starting but not finishing?",
  },
  {
    label: "deep-patterns",
    userText: "What patterns have you noticed about me?",
  },
];

export function logCompanionQaLatencyReport(): void {
  const rows = buildCompanionQaLatencyReport(COMPANION_QA_LATENCY_CASES);
  // eslint-disable-next-line no-console
  console.info("[companion-latency] qa-report", {
    generatedAt: new Date().toISOString(),
    budgets: ROUTE_BUDGET_MS,
    rows,
  });
}

export function measureKnowledgeDetection(userText: string): {
  isKnowledge: boolean;
  ms: number;
} {
  const start = performance.now();
  const isKnowledge = isKnowledgeQuestion(userText);
  return { isKnowledge, ms: Math.round(performance.now() - start) };
}
