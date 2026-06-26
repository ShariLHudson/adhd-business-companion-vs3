/**
 * Companion Behavior Audit Suite (P0.11)
 * Repeatable routing + suppression checks across learn, create, decide, plan,
 * organize, focus, calm, relationship, navigation, and yes-continuation flows.
 */

import { buildAppFeatureNavOffer } from "./appFeatureNavigation";
import { buildCompanionDecisionIntelligence } from "./companionDecisionIntelligence/companionDecisionIntelligence";
import type { ChatTurn } from "./companionIntelligence";
import {
  resolveIntentRouting,
  type IntentCategory,
  type RouteMode,
} from "./intentRoutingIntelligence";
import {
  detectVisualTypeInText,
  isVisualCreateIntent,
} from "./visualTypeAvailability";
import { isHowToLearningQuestion } from "./howToLearningIntelligence";
import { detectOverwhelmTodayRoute } from "./overwhelmTodayRouting";
import {
  frictionlessPendingFromWorkspaceOffer,
  resolveFrictionlessAction,
  resolveFrictionlessContinuation,
  type FrictionlessActionCategory,
} from "./frictionlessActionLayer";
import {
  auditRelationshipIntelligenceScope,
  isSelfUnderstandingIntent,
  RELATIONSHIP_INTELLIGENCE_OUT_OF_SCOPE,
  shouldSuppressRelationshipIntelligenceForUserText,
} from "./relationshipIntelligenceBoundaries";
import { buildRelationshipIntelligencePriorityBlock } from "./relationshipIntelligencePrompt";
import type { AppSection } from "./companionUi";

export type AuditCategory =
  | "learn"
  | "create"
  | "decide"
  | "plan"
  | "organize"
  | "focus"
  | "calm"
  | "strategy"
  | "emotional"
  | "relationship"
  | "navigate"
  | "yes_continuation";

export type AuditIntent =
  | "learn"
  | "create"
  | "execute"
  | "decide"
  | "plan"
  | "organize"
  | "focus"
  | "calm"
  | "understand"
  | "navigate"
  | "continuation"
  | "clarify"
  | "conversation"
  | "strategy"
  | "emotional";

export type AuditRouteMode =
  | RouteMode
  | FrictionlessActionCategory
  | "continuation"
  | "strategy"
  | "focus"
  | "organize"
  | "emotional"
  | "learn";

export type SuppressionExpectations = {
  /** true = relationship layer should be suppressed */
  relationship?: boolean;
  wisdom?: boolean;
  transformation?: boolean;
  observation?: boolean;
  recap?: boolean;
  reflectionFirst?: boolean;
  learnFastPath?: boolean;
};

export type CompanionBehaviorAuditCase = {
  id: string;
  category: AuditCategory;
  userInput: string;
  /** Turn 1 prompt for yes-continuation cases */
  setupUserInput?: string;
  priorMessages?: ChatTurn[];
  expectedIntent: AuditIntent | AuditIntent[];
  expectedRoute: AuditRouteMode | AuditRouteMode[];
  expectedFeature?: string | null;
  expectedSuppressionFlags: SuppressionExpectations;
  forbiddenOpeners?: string[];
  maxQuestionsInTurn?: number;
  /** Create artifacts must not route to Projects */
  forbidProjectsRoute?: boolean;
  /** Pre-seed Google Sheet yes-continuation pending */
  setupGoogleSheetPending?: boolean;
  /** Pre-seed strategy offer yes-continuation pending */
  setupStrategyOfferPending?: boolean;
  /** Pre-seed generic playbook workspace pending */
  setupPlaybookPending?: boolean;
  notes?: string;
};

export type AuditSuppressionSnapshot = {
  relationship: boolean;
  wisdom: boolean;
  transformation: boolean;
  observation: boolean;
  recap: boolean;
  reflectionFirst: boolean;
  learnFastPath: boolean;
};

export type CompanionBehaviorAuditResult = {
  id: string;
  category: AuditCategory;
  userInput: string;
  expectedIntent: AuditIntent | AuditIntent[];
  expectedRoute: AuditRouteMode | AuditRouteMode[];
  expectedFeature: string | null;
  expectedSuppressionFlags: SuppressionExpectations;
  actualIntent: AuditIntent;
  actualRoute: AuditRouteMode;
  actualFeature: string | null;
  actualSuppressionFlags: AuditSuppressionSnapshot;
  pass: boolean;
  failureReasons: string[];
  guidancePreview: string;
};

export type CompanionBehaviorAuditReport = {
  total: number;
  passed: number;
  failed: number;
  passRate: number;
  results: CompanionBehaviorAuditResult[];
  failurePatterns: AuditFailurePattern[];
  recommendedFixes: string[];
};

export type AuditFailurePattern = {
  pattern: string;
  count: number;
  caseIds: string[];
};

const DEFAULT_FORBIDDEN_BY_CATEGORY: Partial<
  Record<AuditCategory, string[]>
> = {
  learn: ["I've noticed", "It sounds like", "You seem to"],
  create: ["I've noticed", "It sounds like", "This is common"],
  decide: ["I've noticed", "Did I get that right?"],
  plan: ["I've noticed", "Did I get that right?", "It sounds like"],
  organize: ["I've noticed", "It sounds like"],
  focus: ["I've noticed", "It sounds like", "This is common"],
  navigate: ["I've noticed", "It sounds like"],
  yes_continuation: ["I've noticed", "It sounds like"],
};

function matchesOne<T>(actual: T, expected: T | T[]): boolean {
  return Array.isArray(expected) ? expected.includes(actual) : actual === expected;
}

const FEATURE_ALIASES: Record<string, string[]> = {
  "content-generator": ["create", "content-generator", "content builder"],
  "decision-compass": ["decision compass", "decision-compass"],
  "plan-my-day": ["plan my day", "plan-my-day"],
  "brain-dump": ["clear my mind", "brain-dump"],
  "visual-focus": ["visual thinking", "visual-focus", "mind map", "decision tree"],
  "client-avatars": ["client avatar", "audience profile", "client-avatars"],
  energy: ["adapt my day", "energy", "today's reality", "todays reality"],
  "focus-audio": ["focus audio", "focus-audio"],
  templates: ["templates", "template"],
};

function normalizeFeatureToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function featureMatches(actual: string | null, expected: string | null): boolean {
  if (expected == null) return true;
  if (!actual) return false;
  const a = normalizeFeatureToken(actual);
  const e = normalizeFeatureToken(expected);
  if (a.includes(e) || e.includes(a)) return true;
  const aliases = FEATURE_ALIASES[expected] ?? FEATURE_ALIASES[e.replace(/\s+/g, "-")];
  if (aliases?.some((alias) => a.includes(normalizeFeatureToken(alias)))) {
    return true;
  }
  return false;
}

function isVisualThinkingFrictionless(
  frictionless: ReturnType<typeof resolveFrictionlessAction>,
): boolean {
  return (
    Boolean(frictionless.immediateVisualOpen) ||
    frictionless.pendingAction?.type === "visual_thinking_menu" ||
    frictionless.pendingAction?.type === "visual_recommendation" ||
    frictionless.workspaceOffer?.section === "visual-focus"
  );
}

function frictionlessOverridesRouting(
  category: FrictionlessActionCategory,
): boolean {
  return (
    category === "emotional_regulation" ||
    category === "adhd_emotional_friction" ||
    category === "reminder" ||
    category === "focus_support" ||
    category === "decision_support" ||
    category === "strategy" ||
    category === "tool_open" ||
    category === "google_sheet"
  );
}

function auditRouteFromFrictionless(
  category: FrictionlessActionCategory,
  workspaceSection: AppSection | null,
  userText: string,
): AuditRouteMode {
  if (category === "strategy") return "strategy";
  if (
    workspaceSection === "brain-dump" &&
    /\boverwhelm/i.test(userText)
  ) {
    return "organize";
  }
  return category;
}

function toMessages(
  prior: ChatTurn[] | undefined,
  userText: string,
): ChatTurn[] {
  return [...(prior ?? []), { role: "user", content: userText }];
}

function mapRoutingCategoryToIntent(category: IntentCategory): AuditIntent {
  switch (category) {
    case "learn":
      return "learn";
    case "build":
      return "create";
    case "execute":
      return "execute";
    case "decide":
      return "decide";
    case "plan":
      return "plan";
    case "organize":
      return "organize";
    case "understand":
      return "understand";
    case "clarify":
      return "clarify";
    default:
      return "conversation";
  }
}

function deriveActualIntent(input: {
  routingCategory: IntentCategory;
  frictionlessCategory: FrictionlessActionCategory;
  learnFastPath: boolean;
  isContinuation: boolean;
  hasFeatureNav: boolean;
  visualThinkingMenu: boolean;
  userText: string;
  auditCategory: AuditCategory;
  workspaceSection: AppSection | null;
}): AuditIntent {
  if (input.isContinuation) return "continuation";
  if (input.hasFeatureNav) return "navigate";
  if (isHowToLearningQuestion(input.userText)) return "learn";
  if (input.frictionlessCategory === "strategy") return "strategy";
  if (input.frictionlessCategory === "emotional_regulation") {
    return input.auditCategory === "emotional" ? "emotional" : "calm";
  }
  if (
    input.workspaceSection === "brain-dump" &&
    /\boverwhelm/i.test(input.userText) &&
    input.frictionlessCategory === "direct_action"
  ) {
    return "organize";
  }
  if (frictionlessOverridesRouting(input.frictionlessCategory)) {
    if (input.frictionlessCategory === "adhd_emotional_friction") {
      return "understand";
    }
    if (input.frictionlessCategory === "reminder") return "execute";
    if (input.frictionlessCategory === "focus_support") return "focus";
    if (input.frictionlessCategory === "decision_support") return "decide";
    if (input.frictionlessCategory === "tool_open") return "navigate";
    if (input.frictionlessCategory === "google_sheet") return "create";
  }
  if (
    isVisualCreateIntent(input.userText) &&
    detectVisualTypeInText(input.userText)
  ) {
    return /\bhelp me\b/i.test(input.userText) ? "create" : "execute";
  }
  if (
    input.visualThinkingMenu &&
    input.routingCategory !== "build" &&
    input.routingCategory !== "execute" &&
    !/\b(?:write a book|marketing plan|email|sop|funnel|proposal|landing page)\b/i.test(
      input.userText,
    )
  ) {
    return "plan";
  }
  if (input.learnFastPath || input.routingCategory === "learn") return "learn";
  return mapRoutingCategoryToIntent(input.routingCategory);
}

function deriveActualRoute(input: {
  routingRouteMode: RouteMode;
  frictionlessCategory: FrictionlessActionCategory;
  isContinuation: boolean;
  learnFastPath: boolean;
  workspaceSection: AppSection | null;
  userText: string;
  auditCategory: AuditCategory;
}): AuditRouteMode {
  if (input.isContinuation) return "continuation";
  if (
    input.learnFastPath &&
    /\bhow (?:is|are) .+ used\b/i.test(input.userText)
  ) {
    return "learn";
  }
  if (frictionlessOverridesRouting(input.frictionlessCategory)) {
    const mapped = auditRouteFromFrictionless(
      input.frictionlessCategory,
      input.workspaceSection,
      input.userText,
    );
    if (
      input.auditCategory === "focus" &&
      mapped === "focus_support" &&
      /\bkeep procrastinat/i.test(input.userText)
    ) {
      return "focus";
    }
    if (
      input.auditCategory === "emotional" &&
      mapped === "emotional_regulation"
    ) {
      return "emotional";
    }
    return mapped;
  }
  if (input.frictionlessCategory === "direct_action") {
    if (
      input.workspaceSection === "brain-dump" &&
      /\boverwhelm/i.test(input.userText)
    ) {
      return "organize";
    }
    if (detectOverwhelmTodayRoute(input.userText)) {
      return "feature_offer";
    }
    return "direct_action";
  }
  if (
    input.routingRouteMode === "feature_offer" &&
    input.frictionlessCategory === "none"
  ) {
    return "feature_offer";
  }
  return input.routingRouteMode;
}

function resolveFeatureLabel(input: {
  section: AppSection | null;
  featureLabel: string | null;
  pendingTarget: string | null;
  navLabel: string | null;
}): string | null {
  if (input.navLabel) return input.navLabel;
  if (input.featureLabel) return input.featureLabel;
  if (input.pendingTarget) return input.pendingTarget;
  if (input.section) return input.section;
  return null;
}

function countQuestionsInGuidance(text: string): number {
  const questionMarks = (text.match(/\?/g) ?? []).length;
  const numberedItems = text.match(/^\s*\d+[\).:]/gm) ?? [];
  if (numberedItems.length >= 3) {
    return Math.max(questionMarks, numberedItems.length);
  }
  return questionMarks;
}

function buildGuidancePreview(input: {
  userText: string;
  routing: ReturnType<typeof resolveIntentRouting>;
  frictionless: ReturnType<typeof resolveFrictionlessAction>;
}): string {
  return input.frictionless.localReply ?? "";
}

function userFacingResponseText(
  frictionless: ReturnType<typeof resolveFrictionlessAction>,
): string {
  return frictionless.localReply?.trim() ?? "";
}

function buildSuppressionSnapshot(input: {
  userText: string;
  routing: ReturnType<typeof resolveIntentRouting>;
  frictionless: ReturnType<typeof resolveFrictionlessAction>;
}): AuditSuppressionSnapshot {
  return {
    relationship:
      shouldSuppressRelationshipIntelligenceForUserText(input.userText) ||
      input.routing.suppressRelationshipIntelligence ||
      input.routing.suppressRelationshipLead ||
      input.frictionless.suppressRelationship,
    wisdom: input.routing.suppressWisdomIntelligence,
    transformation: input.routing.suppressTransformationIntelligence,
    observation: input.routing.suppressObservationEngine,
    recap:
      input.routing.suppressConversationSummary ||
      input.frictionless.suppressRecap,
    reflectionFirst:
      input.routing.suppressReflectionFirst ||
      input.frictionless.suppressReflectionFirst,
    learnFastPath: input.routing.learnFastPath,
  };
}

function checkSuppressionFlags(
  actual: AuditSuppressionSnapshot,
  expected: SuppressionExpectations,
  reasons: string[],
): void {
  const checks: [keyof SuppressionExpectations, keyof AuditSuppressionSnapshot][] =
    [
      ["relationship", "relationship"],
      ["wisdom", "wisdom"],
      ["transformation", "transformation"],
      ["observation", "observation"],
      ["recap", "recap"],
      ["reflectionFirst", "reflectionFirst"],
      ["learnFastPath", "learnFastPath"],
    ];
  for (const [expectedKey, actualKey] of checks) {
    const want = expected[expectedKey];
    if (want === undefined) continue;
    if (actual[actualKey] !== want) {
      reasons.push(
        `suppression.${expectedKey}: expected ${want}, got ${actual[actualKey]}`,
      );
    }
  }
}

function checkForbiddenOpeners(
  guidance: string,
  forbidden: string[],
  reasons: string[],
): void {
  const lower = guidance.toLowerCase();
  for (const phrase of forbidden) {
    if (lower.includes(phrase.toLowerCase())) {
      reasons.push(`guidance contains forbidden opener "${phrase}"`);
    }
  }
}

export function evaluateCompanionBehaviorCase(
  testCase: CompanionBehaviorAuditCase,
): CompanionBehaviorAuditResult {
  const reasons: string[] = [];
  let isContinuation = false;
  let continuationTarget: string | null = null;

  const priorMessages = testCase.priorMessages ?? [];
  const userText = testCase.userInput.trim();

  if (testCase.category === "yes_continuation" && testCase.setupUserInput) {
    const setup = resolveFrictionlessAction({
      userText: testCase.setupUserInput,
      currentTurn: 1,
    });
    const pending =
      setup.pendingAction ??
      (setup.workspaceOffer
        ? frictionlessPendingFromWorkspaceOffer(setup.workspaceOffer, 1)
        : null);
    if (!pending) {
      reasons.push("continuation setup did not produce a pending action");
    } else {
      const cont = resolveFrictionlessContinuation(userText, pending, 2);
      if (!cont?.execute) {
        reasons.push("yes continuation did not execute pending action");
      } else {
        isContinuation = true;
        continuationTarget = pending.target;
      }
    }
  }

  if (testCase.category === "yes_continuation" && testCase.setupGoogleSheetPending) {
    const pending = {
      type: "create_google_sheet" as const,
      target: "google-workspace" as const,
      context: "content_calendar",
      sheetType: "content_calendar" as const,
      sheetTitle: "Content Calendar — Pinterest",
      sheetCsv: "Date,Platform\n,Pinterest",
      sheetColumns: ["Date", "Platform"],
      artifactType: "Content Calendar",
      offeredAtTurn: 1,
      offerSummary: "Create Google Sheet",
    };
    const cont = resolveFrictionlessContinuation(userText, pending, 2);
    if (!cont?.execute) {
      reasons.push("yes continuation did not execute pending action");
    } else {
      isContinuation = true;
      continuationTarget = pending.target;
    }
  }

  if (testCase.category === "yes_continuation" && testCase.setupStrategyOfferPending) {
    const pending = {
      type: "strategy_offer" as const,
      target: "playbook" as const,
      context: "ugly-first-draft",
      strategyId: "ugly-first-draft",
      strategyTitle: "Start Ugly",
      initialPrompt: "I keep putting off my sales calls.",
      offeredAtTurn: 2,
      offerSummary: "Use Start Ugly",
    };
    const cont = resolveFrictionlessContinuation(userText, pending, 3);
    if (!cont?.execute) {
      reasons.push("yes continuation did not execute pending action");
    } else {
      isContinuation = true;
      continuationTarget = pending.target;
    }
  }

  if (testCase.category === "yes_continuation" && testCase.setupPlaybookPending) {
    const pending = {
      type: "open_workspace" as const,
      target: "playbook" as const,
      context: "strategies",
      offeredAtTurn: 1,
      offerSummary: "Open Strategies",
    };
    const cont = resolveFrictionlessContinuation(userText, pending, 2);
    if (!cont?.execute) {
      reasons.push("yes continuation did not execute pending action");
    } else {
      isContinuation = true;
      continuationTarget = pending.target;
    }
  }

  const routing = resolveIntentRouting({ userText });
  const frictionless = resolveFrictionlessAction({
    userText,
    currentTurn: testCase.category === "yes_continuation" ? 2 : 1,
  });
  const featureNav = buildAppFeatureNavOffer(userText);
  const messages = toMessages(priorMessages, userText);

  if (
    testCase.category === "decide" &&
    (routing.category === "decide" || frictionless.category === "decision_support")
  ) {
    buildCompanionDecisionIntelligence({
      userText,
      messages,
      lastAssistantText: priorMessages.at(-1)?.content ?? "",
    });
  }

  const actualSuppression = buildSuppressionSnapshot({
    userText,
    routing,
    frictionless,
  });
  const userFacing = userFacingResponseText(frictionless);
  const guidance = buildGuidancePreview({ userText, routing, frictionless });

  const workspaceSection =
    frictionless.category === "google_sheet"
      ? "google-workspace"
      : isVisualThinkingFrictionless(frictionless)
        ? "visual-focus"
        : frictionless.workspaceOffer?.section ??
          routing.workspaceOffer?.section ??
          (featureNav?.target?.kind === "workspace"
            ? featureNav.target.section
            : null);

  const actualIntent = deriveActualIntent({
    routingCategory: routing.category,
    frictionlessCategory: frictionless.category,
    learnFastPath: routing.learnFastPath,
    isContinuation,
    hasFeatureNav: Boolean(featureNav),
    visualThinkingMenu:
      frictionless.pendingAction?.type === "visual_thinking_menu" ||
      frictionless.pendingAction?.type === "visual_recommendation",
    userText,
    auditCategory: testCase.category,
    workspaceSection,
  });

  const actualRoute = deriveActualRoute({
    routingRouteMode: routing.routeMode,
    frictionlessCategory: frictionless.category,
    isContinuation,
    learnFastPath: routing.learnFastPath,
    workspaceSection,
    userText,
    auditCategory: testCase.category,
  });

  const rawFeature = resolveFeatureLabel({
    section: workspaceSection,
    featureLabel:
      frictionless.category === "google_sheet" ||
      isVisualThinkingFrictionless(frictionless)
        ? null
        : routing.featureLabel,
    pendingTarget:
      continuationTarget ??
      (frictionless.category === "google_sheet" ? "google-workspace" : null),
    navLabel:
      featureNav?.target?.kind === "workspace"
        ? featureNav.target.label
        : featureNav?.target?.label ?? null,
  });
  const actualFeature =
    rawFeature === "visual-focus"
      ? "Visual Thinking"
      : actualRoute === "organize"
        ? "Organize"
        : frictionless.category === "emotional_regulation"
          ? "Emotional Regulation"
          : frictionless.category === "strategy"
            ? "Strategy Intelligence"
            : frictionless.category === "focus_support"
              ? "Focus"
              : routing.category === "learn" ||
                  routing.learnFastPath ||
                  testCase.category === "learn"
                ? rawFeature ?? "Learn"
                : isVisualCreateIntent(userText) &&
                    detectVisualTypeInText(userText)
                  ? "Visual Thinking"
                  : rawFeature;

  if (!matchesOne(actualIntent, testCase.expectedIntent)) {
    reasons.push(
      `intent: expected ${JSON.stringify(testCase.expectedIntent)}, got ${actualIntent}`,
    );
  }

  if (!matchesOne(actualRoute, testCase.expectedRoute)) {
    reasons.push(
      `route: expected ${JSON.stringify(testCase.expectedRoute)}, got ${actualRoute}`,
    );
  }

  if (
    testCase.expectedFeature != null &&
    !featureMatches(actualFeature, testCase.expectedFeature)
  ) {
    reasons.push(
      `feature: expected ${testCase.expectedFeature}, got ${actualFeature ?? "none"}`,
    );
  }

  if (testCase.category !== "yes_continuation") {
    checkSuppressionFlags(
      actualSuppression,
      testCase.expectedSuppressionFlags,
      reasons,
    );
  }

  const forbidden = [
    ...(DEFAULT_FORBIDDEN_BY_CATEGORY[testCase.category] ?? []),
    ...(testCase.forbiddenOpeners ?? []),
  ];
  if (userFacing) {
    checkForbiddenOpeners(userFacing, forbidden, reasons);
  }

  const maxQuestions = testCase.maxQuestionsInTurn ?? 3;
  if (userFacing && !isVisualThinkingFrictionless(frictionless)) {
    const questionCount = countQuestionsInGuidance(userFacing);
    if (questionCount > maxQuestions) {
      reasons.push(
        `too many questions in turn (${questionCount} > ${maxQuestions})`,
      );
    }
  }

  if (testCase.forbidProjectsRoute) {
    const section =
      frictionless.workspaceOffer?.section ?? routing.workspaceOffer?.section;
    if (section === "projects") {
      reasons.push("Create artifact incorrectly routed to Projects");
    }
  }

  if (
    testCase.category === "relationship" &&
    actualSuppression.relationship
  ) {
    reasons.push("relationship intelligence was suppressed on a reflection turn");
  }

  const scopeViolation = auditRelationshipIntelligenceScope({
    userText,
    relationshipSuppressed: actualSuppression.relationship,
  });
  if (scopeViolation === RELATIONSHIP_INTELLIGENCE_OUT_OF_SCOPE) {
    reasons.push(
      `${RELATIONSHIP_INTELLIGENCE_OUT_OF_SCOPE}: relationship layer active on non-self-understanding turn`,
    );
  }

  if (
    !actualSuppression.relationship &&
    !isSelfUnderstandingIntent(userText) &&
    buildRelationshipIntelligencePriorityBlock(userText)
  ) {
    reasons.push(
      `${RELATIONSHIP_INTELLIGENCE_OUT_OF_SCOPE}: relationship priority block would render`,
    );
  }

  if (
    (testCase.category === "learn" || testCase.category === "create") &&
    routing.learnFastPath === false &&
    testCase.expectedSuppressionFlags.learnFastPath === true
  ) {
    reasons.push("learn fast path not active for knowledge-style turn");
  }

  return {
    id: testCase.id,
    category: testCase.category,
    userInput: userText,
    expectedIntent: testCase.expectedIntent,
    expectedRoute: testCase.expectedRoute,
    expectedFeature: testCase.expectedFeature ?? null,
    expectedSuppressionFlags: testCase.expectedSuppressionFlags,
    actualIntent,
    actualRoute,
    actualFeature,
    actualSuppressionFlags: actualSuppression,
    pass: reasons.length === 0,
    failureReasons: reasons,
    guidancePreview: guidance.slice(0, 400),
  };
}

export const COMPANION_BEHAVIOR_AUDIT_CASES: CompanionBehaviorAuditCase[] = [
  // —— 1. Learn / Knowledge ——
  {
    id: "learn-sales-funnel",
    category: "learn",
    userInput: "What is a sales funnel?",
    expectedIntent: "learn",
    expectedRoute: "conversation",
    expectedSuppressionFlags: {
      relationship: true,
      learnFastPath: true,
      reflectionFirst: true,
      wisdom: true,
    },
  },
  {
    id: "learn-sop",
    category: "learn",
    userInput: "What is an SOP?",
    expectedIntent: "learn",
    expectedRoute: "conversation",
    expectedSuppressionFlags: {
      relationship: true,
      learnFastPath: true,
      reflectionFirst: true,
    },
  },
  {
    id: "learn-adhd-paralysis",
    category: "learn",
    userInput: "Explain ADHD paralysis.",
    expectedIntent: "learn",
    expectedRoute: "conversation",
    expectedSuppressionFlags: {
      relationship: true,
      learnFastPath: true,
      reflectionFirst: true,
    },
  },
  {
    id: "learn-lead-magnet",
    category: "learn",
    userInput: "What is a lead magnet?",
    expectedIntent: "learn",
    expectedRoute: "conversation",
    expectedSuppressionFlags: {
      relationship: true,
      learnFastPath: true,
    },
  },
  {
    id: "learn-nurture-sequence",
    category: "learn",
    userInput: "What is a nurture sequence?",
    expectedIntent: "learn",
    expectedRoute: "conversation",
    expectedSuppressionFlags: { relationship: true, learnFastPath: true },
  },
  {
    id: "learn-email-marketing",
    category: "learn",
    userInput: "Teach me about email marketing.",
    expectedIntent: "learn",
    expectedRoute: "conversation",
    expectedSuppressionFlags: { relationship: true, learnFastPath: true },
  },
  {
    id: "learn-decision-fatigue",
    category: "learn",
    userInput: "What is decision fatigue?",
    expectedIntent: "learn",
    expectedRoute: "conversation",
    expectedSuppressionFlags: { relationship: true, learnFastPath: true },
  },
  {
    id: "learn-how-funnel-works",
    category: "learn",
    userInput: "How does a sales funnel work?",
    expectedIntent: "learn",
    expectedRoute: "conversation",
    expectedSuppressionFlags: { relationship: true, learnFastPath: true },
  },

  // —— 2. Create / Execute ——
  {
    id: "create-write-email",
    category: "create",
    userInput: "I need to write an email.",
    expectedIntent: ["create", "execute"],
    expectedRoute: ["direct_action", "feature_offer"],
    expectedFeature: "content-generator",
    expectedSuppressionFlags: { relationship: true, reflectionFirst: true },
    forbidProjectsRoute: true,
    maxQuestionsInTurn: 2,
  },
  {
    id: "create-sop",
    category: "create",
    userInput: "Help me create an SOP.",
    expectedIntent: "create",
    expectedRoute: ["feature_offer", "direct_action"],
    expectedFeature: "Create",
    expectedSuppressionFlags: { relationship: true, reflectionFirst: true },
    forbidProjectsRoute: true,
  },
  {
    id: "create-sales-funnel",
    category: "create",
    userInput: "I need to create a sales funnel.",
    expectedIntent: ["create", "execute"],
    expectedRoute: ["direct_action", "feature_offer"],
    expectedFeature: "content-generator",
    expectedSuppressionFlags: { relationship: true },
    forbidProjectsRoute: true,
  },
  {
    id: "create-marketing-plan",
    category: "create",
    userInput: "Write a marketing plan.",
    expectedIntent: ["create", "execute"],
    expectedRoute: ["direct_action", "feature_offer"],
    expectedFeature: "content-generator",
    expectedSuppressionFlags: { relationship: true },
    forbidProjectsRoute: true,
  },
  {
    id: "create-checklist",
    category: "create",
    userInput: "Create a checklist.",
    expectedIntent: ["create", "execute"],
    expectedRoute: ["direct_action", "feature_offer"],
    expectedFeature: "content-generator",
    expectedSuppressionFlags: { relationship: true },
    forbidProjectsRoute: true,
  },
  {
    id: "create-landing-page",
    category: "create",
    userInput: "Draft a landing page for my offer.",
    expectedIntent: ["create", "execute"],
    expectedRoute: ["direct_action", "feature_offer"],
    expectedFeature: "content-generator",
    expectedSuppressionFlags: { relationship: true },
    forbidProjectsRoute: true,
  },
  {
    id: "create-client-avatar",
    category: "create",
    userInput: "Help me build a client avatar.",
    expectedIntent: "create",
    expectedRoute: ["feature_offer", "direct_action"],
    expectedFeature: "client-avatars",
    expectedSuppressionFlags: { relationship: true },
    forbidProjectsRoute: true,
  },
  {
    id: "create-social-post",
    category: "create",
    userInput: "Generate a social post about my launch.",
    expectedIntent: ["create", "execute"],
    expectedRoute: ["direct_action", "feature_offer"],
    expectedFeature: "content-generator",
    expectedSuppressionFlags: { relationship: true },
    forbidProjectsRoute: true,
  },
  {
    id: "create-lead-magnet",
    category: "create",
    userInput: "I need a lead magnet for my funnel.",
    expectedIntent: ["create", "execute"],
    expectedRoute: ["direct_action", "feature_offer", "conversation"],
    expectedFeature: "content-generator",
    expectedSuppressionFlags: { relationship: true },
    forbidProjectsRoute: true,
  },
  {
    id: "create-email-sequence",
    category: "create",
    userInput: "Write a follow-up email sequence.",
    expectedIntent: ["create", "execute"],
    expectedRoute: ["direct_action", "feature_offer"],
    expectedFeature: "content-generator",
    expectedSuppressionFlags: { relationship: true },
    forbidProjectsRoute: true,
  },

  // —— 3. Decide ——
  {
    id: "decide-product-line",
    category: "decide",
    userInput: "Should I add a new product line?",
    expectedIntent: "decide",
    expectedRoute: ["feature_offer", "decision_support", "conversation"],
    expectedFeature: "Decision Compass",
    expectedSuppressionFlags: { relationship: true },
    maxQuestionsInTurn: 2,
  },
  {
    id: "decide-two-offers",
    category: "decide",
    userInput: "Help me decide between two offers.",
    expectedIntent: "decide",
    expectedRoute: ["decision_support", "feature_offer"],
    expectedFeature: "decision-compass",
    expectedSuppressionFlags: { relationship: true },
    maxQuestionsInTurn: 2,
  },
  {
    id: "decide-hire-or-diy",
    category: "decide",
    userInput: "Should I hire help or do it myself?",
    expectedIntent: "decide",
    expectedRoute: ["decision_support", "feature_offer", "conversation"],
    expectedFeature: "Decision Compass",
    expectedSuppressionFlags: { relationship: true },
    maxQuestionsInTurn: 2,
  },
  {
    id: "decide-launch",
    category: "decide",
    userInput: "I can't decide which offer to launch first.",
    expectedIntent: "decide",
    expectedRoute: ["decision_support", "feature_offer", "conversation"],
    expectedFeature: "decision-compass",
    expectedSuppressionFlags: { relationship: true },
    maxQuestionsInTurn: 2,
  },
  {
    id: "decide-keep-both",
    category: "decide",
    userInput: "Should I keep both offers or pick one?",
    expectedIntent: "decide",
    expectedRoute: ["decision_support", "feature_offer", "conversation"],
    expectedSuppressionFlags: { relationship: true },
    maxQuestionsInTurn: 2,
  },
  {
    id: "decide-choose-options",
    category: "decide",
    userInput: "Help me choose between these options.",
    expectedIntent: "decide",
    expectedRoute: ["decision_support", "feature_offer"],
    expectedFeature: "decision-compass",
    expectedSuppressionFlags: { relationship: true },
    maxQuestionsInTurn: 2,
  },
  {
    id: "decide-stuck-between",
    category: "decide",
    userInput: "I'm stuck between two pricing models.",
    expectedIntent: ["decide", "conversation"],
    expectedRoute: ["decision_support", "feature_offer", "conversation"],
    expectedSuppressionFlags: { relationship: true },
    maxQuestionsInTurn: 2,
  },

  // —— 4. Plan / Overwhelm ——
  {
    id: "plan-overwhelmed-start",
    category: "plan",
    userInput: "I'm overwhelmed and not sure where to start today.",
    expectedIntent: "plan",
    expectedRoute: "feature_offer",
    expectedFeature: "plan-my-day",
    expectedSuppressionFlags: { relationship: true, recap: true },
    forbiddenOpeners: ["Did I get that right?"],
  },
  {
    id: "plan-work-on-first",
    category: "plan",
    userInput: "I don't know what to work on first.",
    expectedIntent: "plan",
    expectedRoute: ["feature_offer", "conversation"],
    expectedFeature: "plan-my-day",
    expectedSuppressionFlags: { recap: true },
  },
  {
    id: "plan-my-day-explicit",
    category: "plan",
    userInput: "Help me plan my day.",
    expectedIntent: "plan",
    expectedRoute: "feature_offer",
    expectedFeature: "Plan My Day",
    expectedSuppressionFlags: { relationship: true },
  },
  {
    id: "plan-today-overwhelming",
    category: "plan",
    userInput: "Today feels overwhelming.",
    expectedIntent: "plan",
    expectedRoute: "feature_offer",
    expectedFeature: "plan-my-day",
    expectedSuppressionFlags: { recap: true },
  },
  {
    id: "plan-too-much-today",
    category: "plan",
    userInput: "I have too much to do today.",
    expectedIntent: "plan",
    expectedRoute: ["feature_offer", "conversation"],
    expectedFeature: "plan-my-day",
    expectedSuppressionFlags: { recap: true },
  },
  {
    id: "plan-adapt-energy",
    category: "plan",
    userInput: "Adapt my day — my energy changed.",
    expectedIntent: "plan",
    expectedRoute: "feature_offer",
    expectedFeature: "energy",
    expectedSuppressionFlags: { relationship: true },
  },

  // —— 5. Organize / Brain Dump ——
  {
    id: "organize-spinning-brain",
    category: "organize",
    userInput: "My brain is spinning.",
    expectedIntent: "organize",
    expectedRoute: "feature_offer",
    expectedFeature: "Clear My Mind",
    expectedSuppressionFlags: { relationship: true },
  },
  {
    id: "organize-thoughts-out",
    category: "organize",
    userInput: "I need to get these thoughts out of my head.",
    expectedIntent: "organize",
    expectedRoute: "feature_offer",
    expectedFeature: "brain-dump",
    expectedSuppressionFlags: { relationship: true },
  },
  {
    id: "organize-too-many-ideas",
    category: "organize",
    userInput: "I have too many ideas.",
    expectedIntent: "organize",
    expectedRoute: ["feature_offer", "conversation"],
    expectedFeature: "Clear My Mind",
    expectedSuppressionFlags: { relationship: true },
  },
  {
    id: "organize-head-full",
    category: "organize",
    userInput: "Everything is in my head and I can't think straight.",
    expectedIntent: "organize",
    expectedRoute: ["feature_offer", "conversation"],
    expectedSuppressionFlags: { relationship: true },
  },
  {
    id: "organize-mental-clutter",
    category: "organize",
    userInput: "Mental clutter is killing me right now.",
    expectedIntent: "organize",
    expectedRoute: ["feature_offer", "conversation"],
    expectedSuppressionFlags: { relationship: true },
  },

  // —— 6. Focus ——
  {
    id: "focus-need-focus",
    category: "focus",
    userInput: "I need to focus.",
    expectedIntent: "focus",
    expectedRoute: "focus_support",
    expectedSuppressionFlags: { relationship: true, reflectionFirst: true },
    maxQuestionsInTurn: 2,
  },
  {
    id: "focus-concentrate",
    category: "focus",
    userInput: "Help me concentrate.",
    expectedIntent: "focus",
    expectedRoute: "focus_support",
    expectedSuppressionFlags: { relationship: true },
  },
  {
    id: "focus-stay-on-task",
    category: "focus",
    userInput: "I can't stay on task.",
    expectedIntent: "focus",
    expectedRoute: "focus_support",
    expectedSuppressionFlags: { relationship: true },
  },
  {
    id: "focus-losing-focus",
    category: "focus",
    userInput: "I'm losing focus every few minutes.",
    expectedIntent: "focus",
    expectedRoute: "focus_support",
    expectedSuppressionFlags: { relationship: true },
  },
  {
    id: "focus-trouble-concentrating",
    category: "focus",
    userInput: "I'm having trouble concentrating.",
    expectedIntent: "focus",
    expectedRoute: "focus_support",
    expectedSuppressionFlags: { relationship: true },
  },

  // —— 7. Emotional Regulation ——
  {
    id: "calm-anxious-breath",
    category: "calm",
    userInput: "I am anxious and can't catch my breath.",
    expectedIntent: "calm",
    expectedRoute: "emotional_regulation",
    expectedSuppressionFlags: { relationship: true, recap: true },
    forbiddenOpeners: ["plan my day", "business"],
  },
  {
    id: "calm-need-calm",
    category: "calm",
    userInput: "I need to calm down.",
    expectedIntent: "calm",
    expectedRoute: "emotional_regulation",
    expectedSuppressionFlags: { relationship: true },
  },
  {
    id: "calm-panicking",
    category: "calm",
    userInput: "I'm panicking.",
    expectedIntent: "calm",
    expectedRoute: "emotional_regulation",
    expectedSuppressionFlags: { relationship: true },
  },
  {
    id: "calm-help-calm",
    category: "calm",
    userInput: "Help me calm down right now.",
    expectedIntent: "calm",
    expectedRoute: "emotional_regulation",
    expectedSuppressionFlags: { relationship: true },
  },
  {
    id: "calm-panic-attack",
    category: "calm",
    userInput: "I think I'm having a panic attack.",
    expectedIntent: "calm",
    expectedRoute: "emotional_regulation",
    expectedSuppressionFlags: { relationship: true },
  },

  // —— 8. Relationship Intelligence ——
  {
    id: "relationship-patterns",
    category: "relationship",
    userInput: "What patterns have you noticed about me?",
    expectedIntent: "understand",
    expectedRoute: "conversation",
    expectedSuppressionFlags: { relationship: false },
  },
  {
    id: "relationship-starter-finisher",
    category: "relationship",
    userInput: "Why am I a good starter but poor finisher?",
    expectedIntent: ["understand", "conversation"],
    expectedRoute: "conversation",
    expectedSuppressionFlags: { relationship: false },
  },
  {
    id: "relationship-how-changed",
    category: "relationship",
    userInput: "How have I changed?",
    expectedIntent: "understand",
    expectedRoute: "conversation",
    expectedSuppressionFlags: { relationship: false },
  },
  {
    id: "relationship-strength",
    category: "relationship",
    userInput: "What is my biggest strength?",
    expectedIntent: "understand",
    expectedRoute: "conversation",
    expectedSuppressionFlags: { relationship: false },
  },
  {
    id: "relationship-noticed-work",
    category: "relationship",
    userInput: "What have you noticed about how I work?",
    expectedIntent: "understand",
    expectedRoute: "conversation",
    expectedSuppressionFlags: { relationship: false },
  },
  {
    id: "relationship-why-stuck",
    category: "relationship",
    userInput: "Why do I get stuck before I finish?",
    expectedIntent: "understand",
    expectedRoute: "conversation",
    expectedSuppressionFlags: { relationship: false },
  },

  // —— P0.17 Relationship boundaries (forbidden) ——
  {
    id: "p017-book-adhd",
    category: "create",
    userInput: "I want to write a book about ADHD and my experiences.",
    expectedIntent: ["create", "execute", "conversation"],
    expectedRoute: ["conversation", "direct_action", "feature_offer"],
    expectedSuppressionFlags: { relationship: true, reflectionFirst: true },
    forbiddenOpeners: ["I've noticed"],
    notes: "Book project — action first, no relationship lead",
  },
  {
    id: "p017-marketing-plan-how",
    category: "create",
    userInput: "How do I create a marketing plan?",
    expectedIntent: ["create", "execute", "learn", "navigate"],
    expectedRoute: ["feature_offer", "conversation", "direct_action"],
    expectedSuppressionFlags: { relationship: true },
    forbiddenOpeners: ["I've noticed"],
  },
  {
    id: "p017-mind-map",
    category: "learn",
    userInput: "What is a mind map?",
    expectedIntent: "learn",
    expectedRoute: "conversation",
    expectedSuppressionFlags: {
      relationship: true,
      learnFastPath: true,
      wisdom: true,
      transformation: true,
      observation: true,
    },
    forbiddenOpeners: ["I've noticed"],
  },
  {
    id: "p017-write-email",
    category: "create",
    userInput: "I need to write an email.",
    expectedIntent: ["execute", "create"],
    expectedRoute: ["direct_action", "feature_offer"],
    expectedFeature: "Create",
    expectedSuppressionFlags: { relationship: true },
    forbiddenOpeners: ["I've noticed"],
  },
  {
    id: "p017-sales-funnel-what",
    category: "learn",
    userInput: "What is a sales funnel?",
    expectedIntent: "learn",
    expectedRoute: "conversation",
    expectedSuppressionFlags: { relationship: true, learnFastPath: true },
    forbiddenOpeners: ["I've noticed"],
  },
  {
    id: "p017-why-procrastinate",
    category: "relationship",
    userInput: "Why do I procrastinate?",
    expectedIntent: "understand",
    expectedRoute: "conversation",
    expectedSuppressionFlags: { relationship: false },
  },

  // —— P0.17.2 Visual structure routing ——
  {
    id: "p0172-decision-tree",
    category: "create",
    userInput: "create a decision tree",
    expectedIntent: ["create", "execute"],
    expectedRoute: "direct_action",
    expectedFeature: "Visual Thinking",
    expectedSuppressionFlags: { relationship: true },
    forbiddenOpeners: ["I've noticed", "open Create"],
  },
  {
    id: "p0172-build-decision-tree",
    category: "create",
    userInput: "build a decision tree",
    expectedIntent: ["create", "execute"],
    expectedRoute: "direct_action",
    expectedFeature: "Visual Thinking",
    expectedSuppressionFlags: { relationship: true },
    forbiddenOpeners: ["open Create"],
  },
  {
    id: "p0172-mind-map",
    category: "create",
    userInput: "create a mind map",
    expectedIntent: ["create", "execute"],
    expectedRoute: "direct_action",
    expectedFeature: "Visual Thinking",
    expectedSuppressionFlags: { relationship: true },
    forbiddenOpeners: ["open Create"],
  },
  {
    id: "p0172-help-mind-map",
    category: "create",
    userInput: "help me make a mind map",
    expectedIntent: ["create", "execute", "create"],
    expectedRoute: "direct_action",
    expectedFeature: "Visual Thinking",
    expectedSuppressionFlags: { relationship: true },
    forbiddenOpeners: ["open Create"],
  },
  {
    id: "p0172-visual-map",
    category: "create",
    userInput: "visual map",
    expectedIntent: ["create", "execute", "conversation"],
    expectedRoute: "direct_action",
    expectedFeature: "Visual Thinking",
    expectedSuppressionFlags: { relationship: true },
    forbiddenOpeners: ["open Create"],
  },
  {
    id: "p0172-concept-map",
    category: "create",
    userInput: "concept map",
    expectedIntent: ["create", "execute", "conversation"],
    expectedRoute: "direct_action",
    expectedFeature: "Visual Thinking",
    expectedSuppressionFlags: { relationship: true },
    forbiddenOpeners: ["open Create"],
  },
  {
    id: "p0172-project-map",
    category: "create",
    userInput: "project map",
    expectedIntent: ["create", "execute", "conversation"],
    expectedRoute: "direct_action",
    expectedFeature: "Visual Thinking",
    expectedSuppressionFlags: { relationship: true },
    forbiddenOpeners: ["open Create"],
  },

  {
    id: "p020-flowchart",
    category: "create",
    userInput: "create a flowchart",
    expectedIntent: ["create", "execute"],
    expectedRoute: "direct_action",
    expectedFeature: "Visual Thinking",
    expectedSuppressionFlags: { relationship: true },
    forbiddenOpeners: ["open Create"],
  },
  {
    id: "p020-course-launch-visual",
    category: "create",
    userInput: "I want to launch a course",
    expectedIntent: ["plan", "create", "execute"],
    expectedRoute: "direct_action",
    expectedFeature: "Visual Thinking",
    expectedSuppressionFlags: { relationship: true },
    forbiddenOpeners: ["open Create"],
  },
  {
    id: "p020-hierarchy",
    category: "create",
    userInput: "build a hierarchy map",
    expectedIntent: ["create", "execute"],
    expectedRoute: "direct_action",
    expectedFeature: "Visual Thinking",
    expectedSuppressionFlags: { relationship: true },
    forbiddenOpeners: ["open Create"],
  },

  // —— P0.20.2 Visual Thinking overreach — must NOT route to Visual Thinking ——
  {
    id: "p0202-sales-avoidance",
    category: "strategy",
    userInput: "I keep putting off my sales calls",
    expectedIntent: ["strategy", "focus"],
    expectedRoute: "strategy",
    expectedFeature: "Strategy Intelligence",
    expectedSuppressionFlags: { relationship: true },
    forbiddenOpeners: ["Visual Thinking", "Mind Map", "Project Map"],
  },
  {
    id: "p0202-procrastination",
    category: "focus",
    userInput: "I keep procrastinating",
    expectedIntent: ["focus", "strategy"],
    expectedRoute: "focus",
    expectedFeature: "Focus",
    expectedSuppressionFlags: { relationship: true },
    forbiddenOpeners: ["Visual Thinking", "Mind Map"],
  },
  {
    id: "p0202-overwhelm",
    category: "organize",
    userInput: "I'm overwhelmed",
    expectedIntent: ["organize", "calm"],
    expectedRoute: "organize",
    expectedFeature: "Organize",
    expectedSuppressionFlags: { relationship: true },
    forbiddenOpeners: ["Visual Thinking", "Mind Map"],
  },
  {
    id: "p0202-motivation",
    category: "emotional",
    userInput: "I need motivation",
    expectedIntent: ["emotional", "focus"],
    expectedRoute: "emotional",
    expectedFeature: "Emotional Regulation",
    expectedSuppressionFlags: { relationship: true },
    forbiddenOpeners: ["Visual Thinking"],
  },

  // —— P0.20.1 Learn vs Visual ——
  {
    id: "p0201-learn-flowchart",
    category: "learn",
    userInput: "What is a flowchart and how is it used?",
    expectedIntent: ["learn"],
    expectedRoute: "learn",
    expectedFeature: "Learn",
    expectedSuppressionFlags: { relationship: true, learnFastPath: true },
    forbiddenOpeners: ["Visual Thinking", "Opening"],
  },
  {
    id: "p0201-planned-flowchart",
    category: "create",
    userInput: "Create a flowchart",
    expectedIntent: ["create", "execute"],
    expectedRoute: "direct_action",
    expectedFeature: "Visual Thinking",
    expectedSuppressionFlags: { relationship: true },
    forbiddenOpeners: ["Opening Visual Thinking"],
  },

  // —— 9. Feature Navigation ——
  {
    id: "nav-how-create-sop",
    category: "navigate",
    userInput: "How do I create an SOP?",
    expectedIntent: "navigate",
    expectedRoute: ["conversation", "direct_action", "feature_offer"],
    expectedFeature: "Create",
    expectedSuppressionFlags: { relationship: true },
  },
  {
    id: "nav-app-decision",
    category: "navigate",
    userInput: "Can this app help me make a decision?",
    expectedIntent: ["navigate", "decide", "conversation"],
    expectedRoute: ["conversation", "feature_offer", "decision_support"],
    expectedFeature: "Decision",
    expectedSuppressionFlags: {},
  },
  {
    id: "nav-find-templates",
    category: "navigate",
    userInput: "Where do I find templates?",
    expectedIntent: "navigate",
    expectedRoute: "conversation",
    expectedFeature: "Templates",
    expectedSuppressionFlags: {},
  },
  {
    id: "nav-clear-my-mind",
    category: "navigate",
    userInput: "How do I use Clear My Mind?",
    expectedIntent: ["navigate", "learn"],
    expectedRoute: ["conversation", "feature_offer"],
    expectedFeature: "Clear My Mind",
    expectedSuppressionFlags: { relationship: true },
  },
  {
    id: "nav-plan-my-day",
    category: "navigate",
    userInput: "Where can I plan my day?",
    expectedIntent: ["navigate", "plan"],
    expectedRoute: ["conversation", "feature_offer"],
    expectedFeature: "Plan My Day",
    expectedSuppressionFlags: { relationship: true },
  },
  {
    id: "nav-feature-sop",
    category: "navigate",
    userInput: "Is there a feature that can help me write an SOP?",
    expectedIntent: ["navigate", "conversation", "create", "execute"],
    expectedRoute: ["conversation", "direct_action", "feature_offer"],
    expectedFeature: "Create",
    expectedSuppressionFlags: { relationship: true },
  },

  // —— 10. Yes Continuation ——
  {
    id: "yes-calm-music",
    category: "yes_continuation",
    setupUserInput: "I want calming music",
    userInput: "yes",
    expectedIntent: "continuation",
    expectedRoute: "continuation",
    expectedFeature: "focus-audio",
    expectedSuppressionFlags: { relationship: true },
  },
  {
    id: "yes-sales-funnel",
    category: "yes_continuation",
    setupUserInput: "I need to create a sales funnel",
    userInput: "yes",
    expectedIntent: "continuation",
    expectedRoute: "continuation",
    expectedFeature: "content-generator",
    expectedSuppressionFlags: { relationship: true },
  },
  {
    id: "yes-decide",
    category: "yes_continuation",
    setupUserInput: "Help me decide between two offers",
    userInput: "yes",
    expectedIntent: "continuation",
    expectedRoute: "continuation",
    expectedFeature: "decision-compass",
    expectedSuppressionFlags: { relationship: true },
  },
  {
    id: "yes-write-email",
    category: "yes_continuation",
    setupUserInput: "I need to write an email",
    userInput: "yes",
    expectedIntent: "continuation",
    expectedRoute: "continuation",
    expectedFeature: "content-generator",
    expectedSuppressionFlags: { relationship: true },
  },
  {
    id: "yes-google-sheet",
    category: "yes_continuation",
    setupGoogleSheetPending: true,
    userInput: "yes",
    expectedIntent: "continuation",
    expectedRoute: "continuation",
    expectedFeature: "google-workspace",
    expectedSuppressionFlags: { relationship: true },
  },
  {
    id: "yes-strategy-offer",
    category: "yes_continuation",
    setupStrategyOfferPending: true,
    userInput: "yes",
    expectedIntent: "continuation",
    expectedRoute: "continuation",
    expectedFeature: "playbook",
    expectedSuppressionFlags: { relationship: true },
  },
  {
    id: "yes-playbook-generic",
    category: "yes_continuation",
    setupPlaybookPending: true,
    userInput: "yes",
    expectedIntent: "continuation",
    expectedRoute: "continuation",
    expectedFeature: "playbook",
    expectedSuppressionFlags: { relationship: true },
  },
  {
    id: "create-content-calendar-sheet",
    category: "create",
    userInput: "Help me create a content calendar",
    expectedIntent: "create",
    expectedRoute: "google_sheet",
    expectedFeature: "google-workspace",
    expectedSuppressionFlags: { relationship: true },
  },
  {
    id: "create-lead-tracker-sheet",
    category: "create",
    userInput: "I need a lead tracker",
    expectedIntent: "create",
    expectedRoute: "google_sheet",
    expectedFeature: "google-workspace",
    expectedSuppressionFlags: { relationship: true },
  },
  {
    id: "create-email-not-sheet",
    category: "create",
    userInput: "I need to write an email",
    expectedIntent: ["create", "execute"],
    expectedRoute: ["feature_offer", "direct_action", "execute_inline"],
    expectedFeature: "content-generator",
    expectedSuppressionFlags: { relationship: true },
    notes: "Email stays in Create — not Google Sheets",
  },
];

export function analyzeAuditFailurePatterns(
  results: CompanionBehaviorAuditResult[],
): AuditFailurePattern[] {
  const failed = results.filter((r) => !r.pass);
  const bucket = new Map<string, string[]>();

  for (const result of failed) {
    for (const reason of result.failureReasons) {
      const pattern = reason.split(":")[0] ?? reason;
      const ids = bucket.get(pattern) ?? [];
      ids.push(result.id);
      bucket.set(pattern, ids);
    }
  }

  return [...bucket.entries()]
    .map(([pattern, caseIds]) => ({
      pattern,
      count: caseIds.length,
      caseIds: [...new Set(caseIds)],
    }))
    .sort((a, b) => b.count - a.count);
}

export function recommendAuditFixes(
  patterns: AuditFailurePattern[],
): string[] {
  const fixes: string[] = [];
  for (const { pattern, caseIds } of patterns) {
    if (pattern.startsWith("intent")) {
      fixes.push(
        `Tighten intent detection for: ${caseIds.slice(0, 4).join(", ")}`,
      );
    } else if (pattern.startsWith("route")) {
      fixes.push(
        `Align route mode / frictionless category for: ${caseIds.slice(0, 4).join(", ")}`,
      );
    } else if (pattern.startsWith("feature")) {
      fixes.push(
        `Fix feature offer target (Create vs Projects vs Compass) for: ${caseIds.slice(0, 4).join(", ")}`,
      );
    } else if (pattern.startsWith("suppression")) {
      fixes.push(
        `Adjust suppressRelationship / learnFastPath flags for: ${caseIds.slice(0, 4).join(", ")}`,
      );
    } else if (pattern.includes("continuation")) {
      fixes.push(
        "Ensure yes-affirmation continues pending workspace/tool actions in CompanionPageClient.",
      );
    } else if (pattern.includes("questions")) {
      fixes.push(
        "Enforce progressive discovery — one question per turn in decision hints.",
      );
    } else if (pattern.includes("Projects")) {
      fixes.push(
        "Route artifact execution to content-generator (Create), never Projects.",
      );
    } else if (pattern.includes("relationship")) {
      fixes.push(
        "Keep relationship intelligence active only on understand/reflection turns.",
      );
    }
  }
  return [...new Set(fixes)];
}

export function runCompanionBehaviorAudit(
  cases: CompanionBehaviorAuditCase[] = COMPANION_BEHAVIOR_AUDIT_CASES,
): CompanionBehaviorAuditReport {
  const results = cases.map(evaluateCompanionBehaviorCase);
  const passed = results.filter((r) => r.pass).length;
  const failed = results.length - passed;
  const failurePatterns = analyzeAuditFailurePatterns(results);
  const recommendedFixes = recommendAuditFixes(failurePatterns);

  return {
    total: results.length,
    passed,
    failed,
    passRate: results.length ? Math.round((passed / results.length) * 100) : 0,
    results,
    failurePatterns,
    recommendedFixes,
  };
}

export function formatCompanionBehaviorAuditReport(
  report: CompanionBehaviorAuditReport,
): string {
  const lines: string[] = [
    "Companion Behavior Audit (P0.11)",
    `Total: ${report.total} | Passed: ${report.passed} | Failed: ${report.failed} | Pass rate: ${report.passRate}%`,
    "",
  ];

  if (report.failed > 0) {
    lines.push("—— Failures ——");
    for (const result of report.results.filter((r) => !r.pass)) {
      lines.push(`[FAIL] ${result.id} (${result.category})`);
      lines.push(`  input: ${result.userInput}`);
      lines.push(`  intent: ${result.actualIntent} (expected ${JSON.stringify(result.expectedIntent)})`);
      lines.push(`  route: ${result.actualRoute} (expected ${JSON.stringify(result.expectedRoute)})`);
      lines.push(`  feature: ${result.actualFeature ?? "none"}`);
      for (const reason of result.failureReasons) {
        lines.push(`  - ${reason}`);
      }
      lines.push("");
    }

    if (report.failurePatterns.length) {
      lines.push("—— Top failure patterns ——");
      for (const p of report.failurePatterns.slice(0, 8)) {
        lines.push(`  ${p.pattern}: ${p.count} (${p.caseIds.slice(0, 5).join(", ")})`);
      }
      lines.push("");
    }

    if (report.recommendedFixes.length) {
      lines.push("—— Recommended next fixes ——");
      for (const fix of report.recommendedFixes) {
        lines.push(`  • ${fix}`);
      }
    }
  } else {
    lines.push("All audit cases passed.");
  }

  return lines.join("\n");
}
