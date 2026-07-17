/**
 * CB-022 addendum — intent-first classification + strategy entry modes.
 * Call once per user turn before Continuity UC resume and CREATE fast path.
 */

import {
  parseStrategyDisambiguationChoice,
  strategyDisambiguationMessage,
} from "@/lib/strategyRouting";
import {
  getIntentWorkflow,
  saveIntentWorkflow,
} from "./intentWorkflowStore";
import type {
  IntentWorkflowState,
  RequestedArtifactType,
  StrategyClassificationStatus,
  StrategyContextSnapshot,
  StrategyEntryMode,
  StrategyLibraryOpenView,
  WorkflowResumeDecision,
} from "./intentWorkflowTypes";
import {
  isDocumentWorkflowRejection,
  isExplicitDocumentContinue,
  isExplicitStrategyContinue,
  resolveWorkflowResumeDecision,
} from "./workflowResumeDecision";
import type { ConversationOwner } from "@/lib/conversationContinuity/types";
import type { UniversalCreationSession } from "@/lib/universalCreation/types";

const STRATEGY_WORD_RE = /\bstrateg(?:y|ies|ic)\b/i;
const CREATE_STRATEGY_RE =
  /\b(?:create|build|write|develop|draft|make|need)\b[\s\S]{0,48}\bstrateg(?:y|ies)\b|\b(?:a|an|my|our|the|new)\s+(?:\w+\s+){0,4}strateg(?:y|ies)\b[\s\S]{0,48}\b(?:for|to|about|around|that)\b|\bi need (?:to )?(?:create|build|make)\b[\s\S]{0,40}\bstrateg/i;
const BROWSE_STRATEGY_RE =
  /\b(?:show me|browse|look at|see|open|list)\b[\s\S]{0,48}\bstrateg(?:y|ies)\b/i;
const APPLY_STRATEGY_RE =
  /\b(?:help me use|use|apply|try)\b[\s\S]{0,36}\bstrateg(?:y|ies)\b|\bhelp me (?:get started|start|focus)\b.*\bstrateg/i;
const ADHD_ADAPT_RE =
  /\b(?:adhd|with my adhd|works? (?:with|for) (?:my )?adhd|adhd[- ]aware)\b/i;
const BUSINESS_SIGNAL_RE =
  /\b(?:business|marketing|sales|launch|content|product|visibility|client|va|virtual assistant|communications?|communication)\b/i;
const EXPLICIT_LETTER_DOC_RE =
  /\b(?:create|write|draft|compose)\b[\s\S]{0,36}\b(?:letter|proposal|email|newsletter|sop|document)\b/i;
const REMINDER_RE =
  /\b(?:actually|instead)?[\s\S]{0,24}\b(?:create|set|make)\s+(?:a\s+)?reminder\b|\bhelp me create a reminder\b/i;
const PEOPLE_RE =
  /\b(?:my|our)\s+(va|virtual assistant|assistant|team|clients?|employees?)\b/i;

function newGoalIdSeed(turn: number): string {
  return `iw-${turn}-${Date.now().toString(36)}`;
}

export function classifyRequestedArtifactType(
  userText: string,
): RequestedArtifactType {
  const t = userText.trim();
  if (!t) return "unknown";
  if (REMINDER_RE.test(t)) return "reminder";
  if (STRATEGY_WORD_RE.test(t) && !EXPLICIT_LETTER_DOC_RE.test(t)) {
    return "strategy";
  }
  if (/\b(?:create|write|draft)\b[\s\S]{0,36}\b(?:an?\s+)?e-?mail\b/i.test(t)) {
    return "email";
  }
  if (/\b(?:create|write|draft)\b[\s\S]{0,36}\bletter\b/i.test(t)) {
    return "document";
  }
  if (/\b(?:create|set|make)\s+(?:a\s+)?reminder\b/i.test(t)) return "reminder";
  if (/\b(?:create|start)\s+(?:a\s+)?project\b/i.test(t)) return "project";
  if (EXPLICIT_LETTER_DOC_RE.test(t)) return "document";
  return "unknown";
}

export function detectStrategyEntryMode(
  userText: string,
): StrategyEntryMode | null {
  const t = userText.trim();
  if (!STRATEGY_WORD_RE.test(t) && !isExplicitStrategyContinue(t)) return null;
  if (isExplicitStrategyContinue(t)) return "resume";
  // Apply / browse win over create (e.g. "use a strategy for getting started").
  if (
    !/\b(?:create|build|draft|develop|need to create)\b/i.test(t) &&
    (APPLY_STRATEGY_RE.test(t) || /\bhelp me use a strategy\b/i.test(t))
  ) {
    return "apply";
  }
  if (BROWSE_STRATEGY_RE.test(t) && !/\b(?:create|build|need to create)\b/i.test(t)) {
    return "browse";
  }
  if (CREATE_STRATEGY_RE.test(t) || /\bnew strategy\b/i.test(t)) return "create";
  return null;
}

function extractStrategyContext(userText: string): StrategyContextSnapshot {
  const t = userText.trim();
  const people: string[] = [];
  const peopleMatch = t.match(PEOPLE_RE);
  if (peopleMatch?.[1]) people.push(peopleMatch[1]);

  let topic: string | undefined;
  const topicMatch = t.match(
    /\b(?:for|about|around|on)\s+((?:better\s+)?communications?(?:\s+with\s+(?:my\s+)?[\w\s]+)?|getting started|procrastination|focus)[\w\s]*/i,
  );
  if (topicMatch?.[1]) {
    topic = topicMatch[1].trim().replace(/\s+/g, " ").slice(0, 120);
  } else if (/\bcommunications?\b/i.test(t)) {
    topic = "communication";
  } else if (/\bprocrastinat/i.test(t)) {
    topic = "procrastination";
  } else if (/\bgetting started\b/i.test(t)) {
    topic = "getting started";
  }

  return {
    topic,
    businessContext: BUSINESS_SIGNAL_RE.test(t) ? "business" : undefined,
    adhdAdaptation: ADHD_ADAPT_RE.test(t),
    peopleInvolved: people.length ? people : undefined,
    desiredOutcome: topic,
  };
}

/**
 * Intent-first: resolve ADHD vs Business without asking when evidence is enough.
 */
export function resolveStrategyClassification(input: {
  userText: string;
  prior?: IntentWorkflowState | null;
}): {
  status: StrategyClassificationStatus;
  askUser: boolean;
  inferredCombined: boolean;
} {
  const t = input.userText.trim();
  const prior = input.prior;

  // Persist prior resolution unless contradicted.
  if (
    prior &&
    (prior.classificationStatus === "adhd_apply" ||
      prior.classificationStatus === "business_create" ||
      prior.classificationStatus === "adhd_aware_business") &&
    prior.status === "active" &&
    STRATEGY_WORD_RE.test(t) &&
    !REMINDER_RE.test(t)
  ) {
    return {
      status: prior.classificationStatus,
      askUser: false,
      inferredCombined: prior.classificationStatus === "adhd_aware_business",
    };
  }

  // Pending choice answer.
  if (prior?.classificationStatus === "awaiting_user") {
    const choice = parseStrategyDisambiguationChoice(t);
    if (choice === "adhd_apply") {
      return { status: "adhd_apply", askUser: false, inferredCombined: false };
    }
    if (choice === "business_create") {
      return {
        status: "business_create",
        askUser: false,
        inferredCombined: false,
      };
    }
  }

  const mode = detectStrategyEntryMode(t);
  const hasStrategy = STRATEGY_WORD_RE.test(t) || mode !== null;
  if (!hasStrategy) {
    return { status: "not_applicable", askUser: false, inferredCombined: false };
  }

  const adhd = ADHD_ADAPT_RE.test(t);
  const business = BUSINESS_SIGNAL_RE.test(t) || mode === "create";

  // Combined: business strategy adapted for ADHD — never force category ask.
  if (adhd && business && (mode === "create" || CREATE_STRATEGY_RE.test(t))) {
    return {
      status: "adhd_aware_business",
      askUser: false,
      inferredCombined: true,
    };
  }

  if (mode === "browse" || mode === "apply") {
    return {
      status: adhd || /\bprocrastinat|getting started|focus|overwhelm/i.test(t)
        ? "adhd_apply"
        : "adhd_apply",
      askUser: false,
      inferredCombined: false,
    };
  }

  if (mode === "create" || CREATE_STRATEGY_RE.test(t)) {
    // Clear custom strategy create (topic/people present) → business create path.
    if (business || extractStrategyContext(t).topic || extractStrategyContext(t).peopleInvolved) {
      return {
        status: adhd ? "adhd_aware_business" : "business_create",
        askUser: false,
        inferredCombined: adhd,
      };
    }
    // Bare "create a strategy" with no signals — ask once.
    return { status: "awaiting_user", askUser: true, inferredCombined: false };
  }

  if (mode === "resume") {
    if (
      prior?.classificationStatus === "business_create" ||
      prior?.classificationStatus === "adhd_aware_business" ||
      prior?.classificationStatus === "adhd_apply"
    ) {
      return {
        status: prior.classificationStatus,
        askUser: false,
        inferredCombined: prior.classificationStatus === "adhd_aware_business",
      };
    }
    return {
      status: "business_create",
      askUser: false,
      inferredCombined: false,
    };
  }

  return { status: "unresolved", askUser: false, inferredCombined: false };
}

export function buildStrategyCreateOpener(
  context: StrategyContextSnapshot,
  classification: StrategyClassificationStatus,
): string {
  const topic = context.topic || "this";
  const people =
    context.peopleInvolved && context.peopleInvolved.length
      ? ` with your ${context.peopleInvolved[0]}`
      : "";
  if (classification === "adhd_aware_business") {
    return `Let's build a ${topic} strategy${people} that works for your business and your ADHD — I'll keep what you already shared and we'll shape it together.`;
  }
  return `Let's build a ${topic} strategy${people}. I'll keep what you already shared and ask only what we still need.`;
}

export function buildStrategyBrowseOpener(topic?: string): string {
  const label = topic?.trim() || "this";
  return `Here are strategies in the Strategy Library for ${label}. Browse what fits — or tell me if you'd rather build a custom one.`;
}

export function buildStrategyApplyOpener(topic?: string): string {
  const label = topic?.trim() || "getting started";
  return `Let's use a strategy for ${label} — I'll walk you through one step at a time.`;
}

export function buildStrategyResumeOpener(priorGoal?: string): string {
  if (priorGoal?.trim()) {
    return `Picking up the strategy we were building: ${priorGoal.trim()}. Where do you want to continue?`;
  }
  return `Let's continue the strategy we were building. Where do you want to pick up?`;
}

export type StrategyTurnAction = {
  mode: StrategyEntryMode;
  openLibrary: boolean;
  openView?: StrategyLibraryOpenView;
  startBusinessBuilder: boolean;
  builderLabel?: string;
  startApplyCoach: boolean;
  applyHint?: string;
  reply: string;
  /** Classification ask — only when askUser */
  needsClassificationAsk: boolean;
};

export type ProcessIntentWorkflowTurnInput = {
  userText: string;
  turn: number;
  activeOwner: ConversationOwner | null;
  ucSession?: UniversalCreationSession | null;
  /** True when a matching in-progress strategy session exists. */
  hasActiveStrategySession?: boolean;
};

export type ProcessIntentWorkflowTurnResult = {
  state: IntentWorkflowState | null;
  artifactType: RequestedArtifactType;
  resumeDecision: WorkflowResumeDecision;
  /** Clear sticky UC / Continuity create owner before routing. */
  invalidateStaleDocumentWorkflow: boolean;
  /** Do not enter CREATE fast path this turn. */
  blockCreateFastPath: boolean;
  strategyAction: StrategyTurnAction | null;
  /** Explicit document create — allow UC. */
  allowDocumentCreate: boolean;
  responseOwner: "shari";
};

function emptyState(
  goal: string,
  turn: number,
  artifact: RequestedArtifactType,
  classification: StrategyClassificationStatus,
  mode: StrategyEntryMode | undefined,
  context: StrategyContextSnapshot,
): IntentWorkflowState {
  return {
    interpretedGoal: goal,
    artifactType: artifact,
    workflowType: artifact === "strategy" ? "strategy_library" : artifact,
    strategyEntryMode: mode,
    classificationStatus: classification,
    classificationResolvedAtTurn:
      classification === "adhd_apply" ||
      classification === "business_create" ||
      classification === "adhd_aware_business"
        ? turn
        : undefined,
    context,
    responseOwner: "shari",
    status: "active",
    startedAtTurn: turn,
    updatedAtTurn: turn,
  };
}

/**
 * Authoritative per-turn intent + workflow gate.
 */
export function processIntentWorkflowOnUserTurn(
  input: ProcessIntentWorkflowTurnInput,
): ProcessIntentWorkflowTurnResult {
  const userText = input.userText.trim();
  const prior = getIntentWorkflow();
  const artifactType = classifyRequestedArtifactType(userText);

  // Document rejection while strategy intent active.
  if (isDocumentWorkflowRejection(userText)) {
    const resumeDecision = resolveWorkflowResumeDecision({
      userText,
      activeOwner: input.activeOwner,
      ucSession: input.ucSession,
      intentState: prior,
      currentArtifactType: prior?.artifactType ?? "strategy",
    });
    if (prior && prior.artifactType === "strategy") {
      const kept = {
        ...prior,
        status: "active" as const,
        updatedAtTurn: input.turn,
      };
      saveIntentWorkflow(kept);
      return {
        state: kept,
        artifactType: "strategy",
        resumeDecision,
        invalidateStaleDocumentWorkflow: true,
        blockCreateFastPath: true,
        strategyAction: null,
        allowDocumentCreate: false,
        responseOwner: "shari",
      };
    }
    return {
      state: prior,
      artifactType,
      resumeDecision,
      invalidateStaleDocumentWorkflow: true,
      blockCreateFastPath: false,
      strategyAction: null,
      allowDocumentCreate: false,
      responseOwner: "shari",
    };
  }

  // Topic change → reminder: pause strategy, do not keep strategy prompts.
  if (artifactType === "reminder") {
    const paused = prior
      ? {
          ...prior,
          status: "paused" as const,
          pausedGoal: prior.interpretedGoal,
          updatedAtTurn: input.turn,
          classificationStatus: "not_applicable" as const,
          strategyEntryMode: undefined,
          artifactType: "reminder" as const,
          interpretedGoal: userText,
        }
      : emptyState(
          userText,
          input.turn,
          "reminder",
          "not_applicable",
          undefined,
          {},
        );
    saveIntentWorkflow(paused);
    const resumeDecision = resolveWorkflowResumeDecision({
      userText,
      activeOwner: input.activeOwner,
      ucSession: input.ucSession,
      intentState: paused,
      currentArtifactType: "reminder",
    });
    return {
      state: paused,
      artifactType: "reminder",
      resumeDecision,
      invalidateStaleDocumentWorkflow: true,
      blockCreateFastPath: true,
      strategyAction: null,
      allowDocumentCreate: false,
      responseOwner: "shari",
    };
  }

  const mode = detectStrategyEntryMode(userText);
  const classification = resolveStrategyClassification({
    userText,
    prior,
  });
  const context = {
    ...(prior?.context ?? {}),
    ...extractStrategyContext(userText),
  };

  let state: IntentWorkflowState | null = prior;

  if (artifactType === "strategy" || mode) {
    state = emptyState(
      userText,
      input.turn,
      "strategy",
      classification.status,
      mode ?? prior?.strategyEntryMode ?? "create",
      context,
    );
    if (prior?.status === "active" && prior.artifactType === "strategy") {
      state.startedAtTurn = prior.startedAtTurn;
    }
    saveIntentWorkflow(state);
  } else if (artifactType === "document" || artifactType === "email") {
    state = emptyState(
      userText,
      input.turn,
      artifactType,
      "not_applicable",
      undefined,
      {},
    );
    if (prior?.artifactType === "strategy") {
      state.pausedGoal = prior.interpretedGoal;
      state.status = "active";
    }
    saveIntentWorkflow(state);
  }

  const resumeDecision = resolveWorkflowResumeDecision({
    userText,
    activeOwner: input.activeOwner,
    ucSession: input.ucSession,
    intentState: state,
    currentArtifactType: artifactType === "unknown" && state?.artifactType === "strategy"
      ? "strategy"
      : artifactType,
  });

  const invalidateStaleDocumentWorkflow =
    !resumeDecision.shouldResume &&
    (resumeDecision.reason === "new_intent" ||
      resumeDecision.reason === "workflow_conflict" ||
      resumeDecision.reason === "stale_state");

  const isStrategyTurn = artifactType === "strategy" || mode !== null;
  const blockCreateFastPath =
    isStrategyTurn ||
    artifactType === "reminder" ||
    (invalidateStaleDocumentWorkflow && state?.artifactType === "strategy");

  const allowDocumentCreate =
    (artifactType === "document" || artifactType === "email") &&
    !isStrategyTurn &&
    (isExplicitDocumentContinue(userText) ||
      EXPLICIT_LETTER_DOC_RE.test(userText));

  let strategyAction: StrategyTurnAction | null = null;

  if (isStrategyTurn && state) {
    if (classification.askUser || classification.status === "awaiting_user") {
      strategyAction = {
        mode: "create",
        openLibrary: true,
        openView: "home",
        startBusinessBuilder: false,
        startApplyCoach: false,
        reply: strategyDisambiguationMessage(),
        needsClassificationAsk: true,
      };
      state = {
        ...state,
        classificationStatus: "awaiting_user",
        updatedAtTurn: input.turn,
      };
      saveIntentWorkflow(state);
    } else {
      const resolvedMode: StrategyEntryMode =
        mode ?? state.strategyEntryMode ?? "create";

      if (resolvedMode === "browse") {
        strategyAction = {
          mode: "browse",
          openLibrary: true,
          openView: /\bprocrastinat|focus|overwhelm|getting started/i.test(
            userText,
          )
            ? "adhd"
            : "home",
          startBusinessBuilder: false,
          startApplyCoach: false,
          reply: buildStrategyBrowseOpener(context.topic),
          needsClassificationAsk: false,
        };
      } else if (resolvedMode === "apply") {
        strategyAction = {
          mode: "apply",
          openLibrary: true,
          openView: "adhd",
          startBusinessBuilder: false,
          startApplyCoach: true,
          applyHint: context.topic ?? "getting started",
          reply: buildStrategyApplyOpener(context.topic),
          needsClassificationAsk: false,
        };
      } else if (resolvedMode === "resume") {
        if (input.hasActiveStrategySession || prior?.artifactType === "strategy") {
          strategyAction = {
            mode: "resume",
            openLibrary: true,
            openView: "business",
            startBusinessBuilder: Boolean(prior?.classificationStatus !== "adhd_apply"),
            builderLabel: "Business Strategy",
            startApplyCoach: prior?.classificationStatus === "adhd_apply",
            reply: buildStrategyResumeOpener(
              prior?.interpretedGoal ?? prior?.pausedGoal,
            ),
            needsClassificationAsk: false,
          };
        } else {
          // No matching strategy — do not resume document.
          strategyAction = {
            mode: "resume",
            openLibrary: true,
            openView: "home",
            startBusinessBuilder: false,
            startApplyCoach: false,
            reply:
              "I don't have a matching strategy in progress — want to browse the Strategy Library or start a new one?",
            needsClassificationAsk: false,
          };
        }
      } else {
        // create
        strategyAction = {
          mode: "create",
          openLibrary: true,
          openView: "business",
          startBusinessBuilder: true,
          builderLabel: context.topic
            ? `${context.topic.replace(/^\w/, (c) => c.toUpperCase())} Strategy`
            : "Business Strategy",
          startApplyCoach: false,
          reply: buildStrategyCreateOpener(context, classification.status),
          needsClassificationAsk: false,
        };
      }
    }
  }

  return {
    state,
    artifactType,
    resumeDecision,
    invalidateStaleDocumentWorkflow,
    blockCreateFastPath,
    strategyAction,
    allowDocumentCreate,
    responseOwner: "shari",
  };
}

/** Pure helper for tests — avoids store side effects when needed. */
export function __testOnly_newGoalIdSeed(turn: number): string {
  return newGoalIdSeed(turn);
}
