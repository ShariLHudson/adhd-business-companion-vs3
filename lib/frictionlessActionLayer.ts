/**
 * Frictionless Companion Action Layer (P0.9)
 * Chat is the front door — act, ask one question, or open the right tool.
 * Runs before relationship reflection.
 */

import { detectAudioRequest } from "./audioSuggestions";
import {
  adhdEmotionalFrictionHintForChat,
  buildAdhdEmotionalFrictionReply,
  isAdhdEmotionalFrictionTurn,
} from "./adhdEmotionalFrictionIntelligence";
import { isSelfUnderstandingIntent } from "./relationshipIntelligenceBoundaries";
import type { ToolSuggestion } from "./companionToolSuggestions";
import type { AppSection } from "./companionUi";
import {
  buildRegistryArtifactOfferLine,
  isRegistryArtifactExecution,
  type RegistryArtifactKind,
} from "./artifactRegistry";
import {
  inferCreateItemTypeFromText,
  logCreatePendingAction,
} from "./createPendingAction";
import { isDecisionCompassOfferSignal } from "./decisionCompassRouting";
import {
  detectArtifactRequest,
  resolveIntentRouting,
  type IntentRoutingDecision,
} from "./intentRoutingIntelligence";
import { shouldSuppressRelationshipIntelligenceForUserText } from "./relationshipIntelligenceBoundaries";
import {
  containsVisualStructurePhrase,
  resolveVisualStructureRoute,
  resolveVisualStructureWorkspaceOffer,
} from "./visualStructureRouting";
import { shouldSuppressVisualThinkingForLearn } from "./visualLearnBoundary";
import {
  buildOverwhelmTodayOffers,
  detectOverwhelmTodayRoute,
} from "./overwhelmTodayRouting";
import {
  buildStrategyOfferPendingFromRecommendation,
  isStrategyIntelligenceOfferMessage,
  shouldSkipStrategyOfferForUserText,
} from "./strategyOfferContinuation";
import { recommendStrategyFromUserText } from "./strategyIntelligence";
import {
  resolveUnavailableVisualTypeReply,
} from "./visualTypeAvailability";
import { clearVisualRecommendationPending } from "./visualThinkingContinuation";
import { isVisualThinkingMenuOfferMessage } from "./visualThinkingContinuation";
import {
  isActivationProblem,
  isMotivationProblem,
  isOverwhelmProblem,
  isRelationshipQuestion,
  isStrategyProblem,
  shouldSuppressVisualRecommendation,
} from "./visualThinkingGuards";
import {
  buildVisualRecommendationReply,
  recommendVisualStructures,
  shouldOfferVisualRecommendation,
  visualRecommendationPendingFromReply,
} from "./visualRecommendationEngine";
import { shouldBlockVisualThinking } from "./visualThinkingOverreach";
import {
  detectConversionTargetView,
  detectExplicitVisualView,
  immediateVisualOpenAck,
  isVisualConversionRequest,
  shouldRouteBusinessStrategyToCreate,
  type VisualThinkingViewId,
} from "./visualThinkingStudio";
import {
  detectSheetIntent,
  shouldExcludeSheetOffer,
  startGoogleSheetIntake,
  type GoogleSheetIntakeSession,
  type GoogleSheetTypeId,
} from "./googleSheetsIntelligence";
import { welcomeRoomWorkspaceOffer } from "./welcomeRoom";
import type { WorkspaceOffer } from "./workspaceMode";
import type { TimeBlock } from "./companionStore";
import {
  reminderHintForChat,
  resolveReminderTurn,
  type ReminderDraft,
} from "./reminderIntelligence";
import type { ReminderIntakeSession } from "./reminderStore";
import {
  buildVisualSourceAskReply,
  validateVisualSourceContent,
} from "./visualSourceContentValidation";

export type FrictionlessActionCategory =
  | "direct_action"
  | "tool_open"
  | "emotional_regulation"
  | "adhd_emotional_friction"
  | "focus_support"
  | "decision_support"
  | "strategy"
  | "google_sheet"
  | "reminder"
  | "none";

export type FrictionlessPendingAction = {
  type:
    | "open_tool"
    | "open_workspace"
    | "create_google_sheet"
    | "strategy_offer"
    | "visual_thinking_menu"
    | "visual_recommendation";
  target: AppSection | "focus-audio" | "breathe" | "focus-timer" | "brain-dump" | "google-workspace";
  label?: string;
  context: string;
  artifactType?: string;
  initialPrompt?: string;
  visualFocusMode?: import("./visualFocus/types").VisualFocusMode;
  viewId?: VisualThinkingViewId;
  viewTitle?: string;
  menuOffer?: import("./visualThinkingStudio").VisualThinkingMenuOffer;
  recommendations?: import("./visualRecommendationEngine").VisualRecommendationItem[];
  sourceText?: string;
  focusAudioCategory?: string;
  sheetType?: GoogleSheetTypeId;
  sheetTitle?: string;
  sheetCsv?: string;
  sheetColumns?: string[];
  strategyId?: string;
  strategyTitle?: string;
  offeredAtTurn: number;
  offerSummary: string;
};

export type FrictionlessActionInput = {
  userText: string;
  lastAssistantText?: string;
  currentTurn?: number;
  emotionalState?: string;
  overwhelmed?: boolean;
  workspace?: AppSection | null;
  timeBlocks?: TimeBlock[];
  reminderDraft?: ReminderDraft | null;
};

export type FrictionlessActionDecision = {
  category: FrictionlessActionCategory;
  suppressRelationship: boolean;
  suppressRecap: boolean;
  suppressReflectionFirst: boolean;
  responseHint: string | null;
  localReply: string | null;
  pendingAction: FrictionlessPendingAction | null;
  toolSuggestion: ToolSuggestion | null;
  workspaceOffer: WorkspaceOffer | null;
  intentRouting: IntentRoutingDecision | null;
  googleSheetIntake?: GoogleSheetIntakeSession;
  reminderIntake?: ReminderIntakeSession | null;
  immediateVisualOpen?: {
    mode: import("./visualFocus/types").VisualFocusMode;
    viewId: VisualThinkingViewId;
    viewTitle: string;
    purposeAnswer?: string;
    ack: string;
  };
};

const STORAGE_KEY = "companion-frictionless-pending-v1";
const PENDING_TURN_LIMIT = 3;

const FOCUS_SUPPORT_RE =
  /\b(?:need to focus|help me focus|help me concentrate|can'?t concentrate|trouble concentrating|stay focused|hard to focus|lose focus|losing focus|can'?t stay on task|stay on task)\b/i;

const EMOTIONAL_REGULATION_RE =
  /\b(?:can'?t catch (?:my )?breath|breathless|panicking|panic attack|having a panic|need to calm down|calm me down|help me calm|feel(?:ing)? anxious|i am anxious|i'?m anxious)\b/i;

const PRODUCTIVITY_FRAMING_RE =
  /\b(?:plan my day|marketing plan|launch|revenue|clients?|business|productivity|get more done|prioritize my day)\b/i;

const AFFIRMATION_RE =
  /^(?:yes|yep|yeah|yup|sure|ok(?:ay)?|please|do that|open it|do it|go ahead|let'?s do it|use it|let'?s use it|sounds good|that works|perfect|great)\.?$/i;

export function isFrictionlessAffirmation(text: string): boolean {
  return AFFIRMATION_RE.test(text.trim());
}

export function saveFrictionlessPending(
  action: FrictionlessPendingAction | null,
): void {
  if (typeof window === "undefined") return;
  if (!action) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(action));
}

export function loadFrictionlessPending(): FrictionlessPendingAction | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FrictionlessPendingAction;
  } catch {
    return null;
  }
}

export function clearFrictionlessPending(): void {
  saveFrictionlessPending(null);
}

export function isFrictionlessPendingExpired(
  action: FrictionlessPendingAction,
  currentTurn: number,
): boolean {
  return currentTurn - action.offeredAtTurn > PENDING_TURN_LIMIT;
}

export function frictionlessPendingAck(action: FrictionlessPendingAction): string {
  if (action.target === "focus-audio") {
    return action.context
      ? `Opening **Focus Audio** for ${action.context}.`
      : "Opening **Focus Audio**.";
  }
  if (action.target === "breathe") {
    return "Opening **Breathe & Reset** — follow along on screen.";
  }
  if (action.target === "content-generator") {
    return "Opening Create.";
  }
  if (action.target === "decision-compass") {
    return "Opening Decision Compass.";
  }
  if (action.target === "visual-focus") {
    const title = action.viewTitle?.trim();
    return title
      ? `Opening **${title}** in Visual Thinking.`
      : "Opening Visual Thinking.";
  }
  if (
    (action.type === "visual_thinking_menu" ||
      action.type === "visual_recommendation") &&
    action.viewTitle
  ) {
    return `Opening **${action.viewTitle}** in Visual Thinking.`;
  }
  if (action.target === "brain-dump") {
    return "Opening **Clear My Mind**.";
  }
  if (action.target === "plan-my-day") {
    return "Opening **Plan My Day**.";
  }
  if (action.type === "create_google_sheet") {
    return "Creating your Google Sheet.";
  }
  if (action.type === "strategy_offer") {
    const title = action.strategyTitle?.trim();
    return title ? `Opening **${title}**.` : "Opening that strategy.";
  }
  if (action.target === "playbook") {
    return "Opening Strategies.";
  }
  return "On it.";
}

export function frictionlessPendingFromWorkspaceOffer(
  offer: WorkspaceOffer,
  offeredAtTurn: number,
  opts?: { userText?: string; artifactKind?: RegistryArtifactKind | null },
): FrictionlessPendingAction {
  if (offer.section === "content-generator" && opts?.userText?.trim()) {
    return buildCreateFrictionlessPending({
      target: offer.section,
      userText: opts.userText,
      offeredAtTurn,
      artifactKind: opts.artifactKind,
      offerSummary: offer.buttonLabel,
    });
  }
  const view =
    opts?.userText?.trim() && offer.visualFocusMode
      ? detectExplicitVisualView(opts.userText) ??
        detectConversionTargetView(opts.userText)
      : null;
  return {
    type: "open_workspace",
    target: offer.section,
    context: offer.line,
    offeredAtTurn,
    offerSummary: offer.buttonLabel,
    initialPrompt: opts?.userText?.trim(),
    visualFocusMode: offer.visualFocusMode,
    viewId: view?.id,
    viewTitle: view?.title,
  };
}

export function frictionlessPendingFromToolOffer(
  suggestion: ToolSuggestion,
  offeredAtTurn: number,
): FrictionlessPendingAction {
  const tool =
    suggestion.action.type === "tool" ? suggestion.action.tool : "focus-audio";
  const target = (
    tool === "focus-audio" ||
    tool === "breathe" ||
    tool === "focus-timer" ||
    tool === "brain-dump"
      ? tool
      : "focus-audio"
  ) satisfies FrictionlessPendingAction["target"];
  return {
    type: "open_tool",
    target,
    context: suggestion.line,
    focusAudioCategory: tool === "focus-audio" ? "calm-brain" : undefined,
    offeredAtTurn,
    offerSummary: suggestion.toolLabel,
  };
}

export function frictionlessToToolSuggestion(
  action: FrictionlessPendingAction,
): ToolSuggestion {
  const tool =
    action.target === "focus-audio"
      ? "focus-audio"
      : action.target === "breathe"
        ? "breathe"
        : action.target === "focus-timer"
          ? "focus-timer"
          : action.target === "brain-dump"
            ? "brain-dump"
            : "focus-audio";
  return {
    kind: tool === "focus-audio" ? "focus-session" : "breathe",
    line: action.context,
    toolLabel:
      tool === "focus-audio"
        ? "Open Focus Audio"
        : tool === "breathe"
          ? "Breathe & Reset"
          : "Open tool",
    toolObjectId: tool === "focus-audio" ? "focus-audio" : "breathing",
    keepTalkingLabel: "Keep Talking",
    action: { type: "tool", tool },
  };
}

function buildAudioPending(
  userText: string,
  currentTurn: number,
): FrictionlessActionDecision | null {
  const audio = detectAudioRequest(userText);
  if (!audio.isAudio) return null;

  const context = /\bcalm/i.test(userText)
    ? "calming music"
    : /\bmotivat/i.test(userText)
      ? "motivation"
      : /\bfocus/i.test(userText)
        ? "focus"
        : "background audio";

  const localReply = `I can open Focus Audio for ${context}. Want me to open it?`;

  return {
    category: "tool_open",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint:
      "FOCUS AUDIO REQUEST: Offer to open Focus Audio directly. Do NOT lead with relationship observations.",
    localReply,
    pendingAction: {
      type: "open_tool",
      target: "focus-audio",
      context,
      focusAudioCategory: audio.categoryId,
      offeredAtTurn: currentTurn,
      offerSummary: `Focus Audio — ${context}`,
    },
    toolSuggestion: {
      kind: "focus-session",
      line: localReply,
      toolLabel: "Open Focus Audio",
      toolObjectId: "focus-audio",
      keepTalkingLabel: "Keep Talking",
      action: { type: "tool", tool: "focus-audio" },
    },
    workspaceOffer: null,
    intentRouting: null,
  };
}

function buildAdhdEmotionalFrictionDecision(
  userText: string,
  currentTurn: number,
): FrictionlessActionDecision {
  return {
    category: "adhd_emotional_friction",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint: adhdEmotionalFrictionHintForChat(userText),
    localReply: buildAdhdEmotionalFrictionReply(userText),
    pendingAction: null,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: null,
  };
}

function buildReminderDecision(
  userText: string,
  currentTurn: number,
  input: FrictionlessActionInput,
): FrictionlessActionDecision | null {
  const outcome = resolveReminderTurn({
    userText,
    draft: input.reminderDraft ?? null,
    timeBlocks: input.timeBlocks ?? [],
  });
  if (outcome.kind === "not_reminder") return null;

  const base: FrictionlessActionDecision = {
    category: "reminder",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint: reminderHintForChat(),
    localReply: outcome.reply,
    pendingAction: null,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: null,
    reminderIntake: null,
  };

  if (outcome.kind === "ask") {
    return {
      ...base,
      reminderIntake: {
        phase: "collecting",
        draft: outcome.draft,
        startedAtTurn: currentTurn,
      },
    };
  }

  return base;
}

function buildFocusSupportDecision(
  currentTurn: number,
): FrictionlessActionDecision {
  return {
    category: "focus_support",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint:
      "FOCUS SUPPORT (P0.9): Help pick ONE focus thread. Offer Focus Mode or Focus Audio if helpful. No relationship observations. No recap.",
    localReply:
      "Let's choose one focus thread. What needs your attention most right now?\n\nIf it helps, we can also use **Focus Mode** or **Focus Audio** — want either of those?",
    pendingAction: null,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: null,
  };
}

function buildEmotionalRegulationDecision(
  currentTurn: number,
): FrictionlessActionDecision {
  return {
    category: "emotional_regulation",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint:
      "EMOTIONAL REGULATION (P0.9): Support first, tool second. No productivity framing. No relationship observations. No business coaching.",
    localReply:
      "Let's slow this down. Take one gentle breath with me — inhale softly, then exhale a little longer than you inhale.\n\nWould you like calming audio, a breathing reset, or to stay here with me?",
    pendingAction: {
      type: "open_tool",
      target: "focus-audio",
      context: "calming support",
      focusAudioCategory: "calm-brain",
      offeredAtTurn: currentTurn,
      offerSummary: "Focus Audio — calming support",
    },
    toolSuggestion: {
      kind: "breathe",
      line: "Would calming audio or a breathing reset help?",
      toolLabel: "Open Focus Audio",
      toolObjectId: "focus-audio",
      keepTalkingLabel: "Stay here with me",
      action: { type: "tool", tool: "focus-audio" },
    },
    workspaceOffer: null,
    intentRouting: null,
  };
}

function buildGoogleSheetsIntakeDecision(
  sheetType: GoogleSheetTypeId,
  userText: string,
  currentTurn: number,
): FrictionlessActionDecision {
  const started = startGoogleSheetIntake(sheetType, userText);
  if (started.outcome !== "ask") {
    return {
      category: "google_sheet",
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint:
        "GOOGLE SHEETS INTELLIGENCE (P0.18): One intake question at a time. Offer Google Sheet when ready — not Create.",
      localReply: "What's the first detail to capture?",
      pendingAction: null,
      toolSuggestion: null,
      workspaceOffer: null,
      intentRouting: null,
      googleSheetIntake: undefined,
    };
  }
  return {
    category: "google_sheet",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint:
      "GOOGLE SHEETS INTELLIGENCE (P0.18): One intake question at a time. Offer Google Sheet when ready — not Create.",
    localReply: started.reply,
    pendingAction: null,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: null,
    googleSheetIntake: started.session,
  };
}

function buildDecisionSupportDecision(
  routing: IntentRoutingDecision,
  currentTurn: number,
): FrictionlessActionDecision {
  return {
    category: "decision_support",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint:
      "DECISION SUPPORT (P0.9): Offer Decision Compass or one clarifying question. No relationship lead paragraph.",
    localReply: null,
    pendingAction: routing.workspaceOffer
      ? {
          type: "open_tool",
          target: "decision-compass",
          context: "decision support",
          offeredAtTurn: currentTurn,
          offerSummary: "Decision Compass",
        }
      : null,
    toolSuggestion: null,
    workspaceOffer: routing.workspaceOffer,
    intentRouting: routing,
  };
}

function buildCreateFrictionlessPending(input: {
  target: AppSection;
  userText: string;
  offeredAtTurn: number;
  artifactKind?: RegistryArtifactKind | null;
  offerSummary?: string;
}): FrictionlessPendingAction {
  const artifactType = inferCreateItemTypeFromText(
    input.userText,
    input.artifactKind,
  );
  const pending: FrictionlessPendingAction = {
    type: "open_workspace",
    target: input.target,
    label: "Create",
    context: input.artifactKind ?? artifactType ?? "create",
    artifactType,
    initialPrompt: input.userText.trim(),
    offeredAtTurn: input.offeredAtTurn,
    offerSummary: input.offerSummary ?? "Open Create",
  };
  logCreatePendingAction("saved pending action", {
    target: pending.target,
    artifactType: pending.artifactType,
    initialPrompt: pending.initialPrompt,
  });
  return pending;
}

function buildVisualStructureDecision(
  offer: WorkspaceOffer,
  userText: string,
  currentTurn: number,
  routing: IntentRoutingDecision,
  route: ReturnType<typeof resolveVisualStructureRoute>,
): FrictionlessActionDecision {
  const view =
    route?.viewId != null
      ? detectExplicitVisualView(userText) ?? detectConversionTargetView(userText)
      : null;

  if (route?.immediate && view) {
    const purpose = isVisualConversionRequest(userText)
      ? userText
      : userText.trim();
    return {
      category: "direct_action",
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint:
        "VISUAL THINKING STUDIO (P0.20 Path B): Open Visual Thinking immediately — never Create.",
      localReply: immediateVisualOpenAck(view),
      pendingAction: null,
      immediateVisualOpen: {
        mode: view.mode,
        viewId: view.id,
        viewTitle: view.title,
        purposeAnswer: purpose,
        ack: immediateVisualOpenAck(view),
      },
      toolSuggestion: null,
      workspaceOffer: offer,
      intentRouting: routing,
    };
  }

  return {
    category: "direct_action",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint:
      "VISUAL STRUCTURE (P0.17.2): Route to Visual Thinking or Decision Compass — never Create.",
    localReply: offer.line,
    pendingAction: frictionlessPendingFromWorkspaceOffer(offer, currentTurn, {
      userText,
    }),
    toolSuggestion: null,
    workspaceOffer: offer,
    intentRouting: routing,
  };
}

function buildMotivationSupportDecision(
  currentTurn: number,
): FrictionlessActionDecision {
  return {
    category: "focus_support",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint:
      "MOTIVATION SUPPORT (P0.20.3): One small step first — not Visual Thinking. Offer Focus Mode or Focus Audio if helpful.",
    localReply:
      "Let's find one small step forward. What's the smallest piece you could touch right now?\n\nIf it helps, we can use **Focus Mode** or **Focus Audio** — want either?",
    pendingAction: null,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: null,
  };
}

function buildSimpleOverwhelmOrganizeDecision(
  userText: string,
  currentTurn: number,
  routing: IntentRoutingDecision,
): FrictionlessActionDecision {
  const offer = {
    section: "brain-dump" as const,
    buttonLabel: "Open Clear My Mind",
    line: "Clear My Mind may help unload what's crowding your head. Would you like to open it?",
  };
  return {
    category: "direct_action",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint:
      "OVERWHELM (P0.20.3): Route to Clear My Mind — never Visual Thinking.",
    localReply: offer.line,
    pendingAction: frictionlessPendingFromWorkspaceOffer(offer, currentTurn, {
      userText,
    }),
    toolSuggestion: null,
    workspaceOffer: offer,
    intentRouting: routing,
  };
}

function buildOverwhelmFrictionlessDecision(
  userText: string,
  currentTurn: number,
  routing: IntentRoutingDecision,
): FrictionlessActionDecision | null {
  const route = detectOverwhelmTodayRoute(userText);
  if (!route) return null;
  const offers = buildOverwhelmTodayOffers(userText, route);
  const offer = offers.primary;
  return {
    category: "direct_action",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint:
      "OVERWHELM (P0.20.3): Route to Plan My Day / Clear My Mind — never Visual Thinking.",
    localReply: offer.line,
    pendingAction: frictionlessPendingFromWorkspaceOffer(offer, currentTurn, {
      userText,
    }),
    toolSuggestion: null,
    workspaceOffer: offer,
    intentRouting: routing,
  };
}

function buildStrategyFrictionlessDecision(
  userText: string,
  currentTurn: number,
  routing: IntentRoutingDecision,
): FrictionlessActionDecision | null {
  if (shouldSkipStrategyOfferForUserText(userText)) return null;
  if (isSelfUnderstandingIntent(userText)) return null;
  if (!isStrategyProblem(userText) && !isActivationProblem(userText)) {
    return null;
  }
  const rec = recommendStrategyFromUserText(userText);
  if (!rec || rec.confidence === "low") return null;
  const pending = buildStrategyOfferPendingFromRecommendation(
    rec,
    userText,
    currentTurn,
  );
  return {
    category: "strategy",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint:
      "STRATEGY INTELLIGENCE (P0.20.3): Offer matching strategy before Visual Thinking.",
    localReply: rec.offerMessage,
    pendingAction: pending,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: routing,
  };
}

function buildVisualRecommendationDecision(
  userText: string,
  currentTurn: number,
  routing: IntentRoutingDecision,
  lastAssistantText?: string,
): FrictionlessActionDecision {
  const pending = visualRecommendationPendingFromReply({
    userText,
    context: { lastAssistantText },
    offeredAtTurn: currentTurn,
  });
  const reply = buildVisualRecommendationReply(
    recommendVisualStructures({
      userText,
      context: { lastAssistantText },
    }),
  );
  return {
    category: "direct_action",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint:
      "VISUAL RECOMMENDATION ENGINE (P0.20 Path B): Recommend 2–3 structures with reasons — never for ADHD friction.",
    localReply: reply,
    pendingAction: pending,
    toolSuggestion: null,
    workspaceOffer: {
      section: "visual-focus",
      buttonLabel: "Open Visual Thinking",
      line: reply,
    },
    intentRouting: routing,
  };
}

function buildDirectActionDecision(
  routing: IntentRoutingDecision,
  userText: string,
  currentTurn: number,
): FrictionlessActionDecision {
  const execCategory = routing.category === "build" ? "build" : "execute";
  const localReply =
    routing.navigationLine ??
    (routing.artifactKind
      ? buildRegistryArtifactOfferLine(routing.artifactKind, execCategory)
      : "I can help build that. Would you like to open Create?");
  return {
    category: "direct_action",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint:
      "DIRECT ACTION (P0.9): Start the work or ask ONE needed detail. No relationship observations.",
    localReply,
    pendingAction:
      routing.workspaceOffer?.section === "content-generator"
        ? buildCreateFrictionlessPending({
            target: "content-generator",
            userText,
            offeredAtTurn: currentTurn,
            artifactKind: routing.artifactKind,
            offerSummary: routing.featureLabel ?? "Create",
          })
        : routing.workspaceOffer
          ? {
              type: "open_workspace",
              target: routing.workspaceOffer.section,
              context: routing.artifactKind ?? "create",
              offeredAtTurn: currentTurn,
              offerSummary: routing.featureLabel ?? "Create",
            }
          : null,
    toolSuggestion: null,
    workspaceOffer: routing.workspaceOffer,
    intentRouting: routing,
  };
}

export function resolveFrictionlessAction(
  input: FrictionlessActionInput,
): FrictionlessActionDecision {
  const userText = input.userText.trim();
  const currentTurn = input.currentTurn ?? 0;
  const none: FrictionlessActionDecision = {
    category: "none",
    suppressRelationship: shouldSuppressRelationshipIntelligenceForUserText(userText),
    suppressRecap: false,
    suppressReflectionFirst: shouldSuppressRelationshipIntelligenceForUserText(userText),
    responseHint: null,
    localReply: null,
    pendingAction: null,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: null,
  };

  if (!userText) return none;

  const routing = resolveIntentRouting({
    userText,
    workspace: input.workspace,
    emotionalState: input.emotionalState,
    overwhelmed: input.overwhelmed,
  });

  if (routing.learnFastPath || shouldSuppressVisualThinkingForLearn(userText)) {
    clearVisualRecommendationPending();
    return {
      ...none,
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint:
        "LEARN FAST PATH (P0.20.1): Answer the concept directly — no Visual Thinking open.",
      intentRouting: routing,
    };
  }

  const welcomeOffer = welcomeRoomWorkspaceOffer(userText);
  if (welcomeOffer) {
    return {
      category: "direct_action",
      suppressRelationship: false,
      suppressRecap: false,
      suppressReflectionFirst: false,
      responseHint:
        "WELCOME ROOM: Offer the Welcome Room invitation — never force navigation or read an About page.",
      localReply: welcomeOffer.line,
      pendingAction: frictionlessPendingFromWorkspaceOffer(welcomeOffer, currentTurn, {
        userText,
      }),
      toolSuggestion: null,
      workspaceOffer: welcomeOffer,
      intentRouting: routing,
    };
  }

  const plannedVisualReply = resolveUnavailableVisualTypeReply(userText, {
    priorContent: input.lastAssistantText,
  });
  if (plannedVisualReply) {
    return {
      category: "direct_action",
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint:
        "PLANNED VISUAL TYPE (P0.20.4): Not built yet — draft outline in chat; optional Mind Map offer. Never Create.",
      localReply: plannedVisualReply,
      pendingAction: null,
      toolSuggestion: null,
      workspaceOffer: null,
      intentRouting: routing,
    };
  }

  const visualRoute = resolveVisualStructureRoute(userText);
  const visualOffer = resolveVisualStructureWorkspaceOffer(userText);
  if (
    visualOffer?.section === "visual-focus" &&
    !shouldBlockVisualThinking(userText)
  ) {
    if (isVisualConversionRequest(userText) && input.lastAssistantText?.trim()) {
      const view = detectConversionTargetView(userText);
      if (view) {
        const sourceValidation = validateVisualSourceContent({
          userText,
          sourceContent: input.lastAssistantText,
          currentTurn,
        });
        if (!sourceValidation.ok) {
          return {
            category: "direct_action",
            suppressRelationship: true,
            suppressRecap: true,
            suppressReflectionFirst: true,
            responseHint:
              "VISUAL SOURCE VALIDATION (P0.20.5): Prior content failed validation — ask for source instead of converting.",
            localReply: buildVisualSourceAskReply(userText, sourceValidation),
            pendingAction: null,
            toolSuggestion: null,
            workspaceOffer: null,
            intentRouting: routing,
          };
        }
        return {
          category: "direct_action",
          suppressRelationship: true,
          suppressRecap: true,
          suppressReflectionFirst: true,
          responseHint:
            "VISUAL CONVERSION (P0.20): Reuse chat content; open Visual Thinking immediately.",
          localReply: immediateVisualOpenAck(view),
          pendingAction: null,
          immediateVisualOpen: {
            mode: view.mode,
            viewId: view.id,
            viewTitle: view.title,
            purposeAnswer: input.lastAssistantText.trim(),
            ack: immediateVisualOpenAck(view),
          },
          toolSuggestion: null,
          workspaceOffer: visualOffer,
          intentRouting: routing,
        };
      }
    }
    return buildVisualStructureDecision(
      visualOffer,
      userText,
      currentTurn,
      routing,
      visualRoute,
    );
  }

  const sheetType = detectSheetIntent(userText);
  if (sheetType && !shouldExcludeSheetOffer(userText)) {
    return buildGoogleSheetsIntakeDecision(sheetType, userText, currentTurn);
  }

  const artifact = detectArtifactRequest(userText);
  if (artifact && isRegistryArtifactExecution(userText)) {
    return buildDirectActionDecision(
      {
        ...routing,
        suppressRelationshipIntelligence: true,
      },
      userText,
      currentTurn,
    );
  }

  const reminderDecision = buildReminderDecision(userText, currentTurn, input);
  if (reminderDecision) return reminderDecision;

  if (isOverwhelmProblem(userText)) {
    const overwhelm = buildOverwhelmFrictionlessDecision(
      userText,
      currentTurn,
      routing,
    );
    if (overwhelm) return overwhelm;
    return buildSimpleOverwhelmOrganizeDecision(userText, currentTurn, routing);
  }

  if (/\bkeep procrastinat/i.test(userText)) {
    return buildFocusSupportDecision(currentTurn);
  }

  const strategyDecision = buildStrategyFrictionlessDecision(
    userText,
    currentTurn,
    routing,
  );
  if (strategyDecision) return strategyDecision;

  if (isMotivationProblem(userText) && !isSelfUnderstandingIntent(userText)) {
    return buildEmotionalRegulationDecision(currentTurn);
  }

  if (
    EMOTIONAL_REGULATION_RE.test(userText) &&
    !PRODUCTIVITY_FRAMING_RE.test(userText)
  ) {
    return buildEmotionalRegulationDecision(currentTurn);
  }

  if (isAdhdEmotionalFrictionTurn(userText)) {
    return buildAdhdEmotionalFrictionDecision(userText, currentTurn);
  }

  const audio = buildAudioPending(userText, currentTurn);
  if (audio) return audio;

  if (FOCUS_SUPPORT_RE.test(userText) && !/\boverwhelm/i.test(userText)) {
    return buildFocusSupportDecision(currentTurn);
  }

  if (routing.learnFastPath) {
    clearVisualRecommendationPending();
    return {
      ...none,
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint:
        "LEARN FAST PATH (P0.10): Answer the concept directly — no relationship layer.",
      intentRouting: routing,
    };
  }

  if (
    isDecisionCompassOfferSignal(userText) ||
    /\bhelp me decide\b/i.test(userText)
  ) {
    return buildDecisionSupportDecision(routing, currentTurn);
  }

  if (
    !shouldRouteBusinessStrategyToCreate(userText) &&
    routing.category !== "learn" &&
    !routing.learnFastPath &&
    !shouldSuppressVisualRecommendation(userText) &&
    shouldOfferVisualRecommendation(userText)
  ) {
    return buildVisualRecommendationDecision(
      userText,
      currentTurn,
      routing,
      input.lastAssistantText,
    );
  }

  return {
    ...none,
    suppressRelationship:
      none.suppressRelationship || routing.suppressRelationshipIntelligence,
    suppressReflectionFirst:
      none.suppressReflectionFirst || routing.suppressReflectionFirst,
    suppressRecap: none.suppressRecap || routing.suppressConversationSummary,
    intentRouting: routing,
  };
}

export function shouldSuppressRelationshipForFrictionless(
  decision: FrictionlessActionDecision,
): boolean {
  return decision.suppressRelationship;
}

export function frictionlessHintForChat(
  decision: FrictionlessActionDecision,
): string | null {
  if (!decision.responseHint) return null;
  const lines = [
    "FRICTIONLESS ACTION LAYER (P0.9 — before relationship reflection):",
    decision.responseHint,
    "FORBIDDEN: I've noticed…, behavioral analysis, recap, Did I get that right?",
  ];
  if (decision.category === "emotional_regulation") {
    lines.push("No productivity or business framing.");
  }
  if (decision.category === "adhd_emotional_friction") {
    lines.push(
      "Acknowledge first. One question only. No task planning or tools until they answer.",
    );
  }
  if (decision.category === "focus_support") {
    lines.push("Ask what needs attention OR offer Focus Mode / Focus Audio.");
  }
  if (decision.category === "google_sheet") {
    lines.push(
      "One question at a time for sheet intake. Offer Google Sheet creation when ready.",
    );
  }
  if (decision.category === "reminder") {
    lines.push("Short confirmation only. No relationship layer or tool offers.");
  }
  return lines.join("\n");
}

export function isFrictionlessPendingAlignedWithAssistant(
  pending: FrictionlessPendingAction,
  lastAssistantText: string,
  currentTurn: number,
): boolean {
  if (isFrictionlessPendingExpired(pending, currentTurn)) return false;

  const assistant = lastAssistantText.trim();
  if (!assistant) return false;

  if (pending.type === "strategy_offer") {
    return isStrategyIntelligenceOfferMessage(assistant);
  }

  if (
    pending.type === "visual_recommendation" ||
    pending.type === "visual_thinking_menu"
  ) {
    return isVisualThinkingMenuOfferMessage(assistant);
  }

  if (pending.type === "create_google_sheet") {
    return /\b(?:google sheet|spreadsheet|create (?:the |your |a )?sheet)\b/i.test(
      assistant,
    );
  }

  if (pending.target === "content-generator") {
    return (
      /\b(?:open create|create workspace|draft (?:a|an|the)|would you like (?:me )?to (?:create|draft|open))\b/i.test(
        assistant,
      ) ||
      Boolean(
        pending.artifactType &&
          assistant.toLowerCase().includes(pending.artifactType.toLowerCase()),
      )
    );
  }

  if (pending.target === "brain-dump") {
    return /\bclear my mind\b/i.test(assistant);
  }

  if (pending.target === "plan-my-day") {
    return /\bplan my day\b/i.test(assistant);
  }

  if (pending.target === "decision-compass") {
    return /\bdecision compass\b/i.test(assistant);
  }

  if (pending.target === "focus-audio") {
    return /\bfocus audio\b/i.test(assistant);
  }

  if (pending.target === "breathe") {
    return /\bbreathe\b/i.test(assistant);
  }

  if (pending.target === "playbook") {
    return (
      /\bstrateg(?:y|ies)\b/i.test(assistant) &&
      /\b(?:would you like|open)\b/i.test(assistant)
    );
  }

  if (pending.target === "visual-focus") {
    return (
      /\bvisual thinking\b/i.test(assistant) ||
      /\b(?:mind map|decision tree|flowchart|diagram)\b/i.test(assistant)
    );
  }

  const summary = pending.offerSummary?.trim();
  if (summary && summary.length >= 8) {
    const fragment = summary.slice(0, 28).toLowerCase();
    if (assistant.toLowerCase().includes(fragment)) return true;
  }

  return pending.offeredAtTurn >= currentTurn - 1;
}

export function resolveFrictionlessContinuation(
  userText: string,
  pending: FrictionlessPendingAction,
  currentTurn: number,
  lastAssistantText?: string,
): { execute: boolean; ack: string } | null {
  if (!isFrictionlessAffirmation(userText)) return null;
  if (isFrictionlessPendingExpired(pending, currentTurn)) return null;
  if (
    lastAssistantText &&
    !isFrictionlessPendingAlignedWithAssistant(
      pending,
      lastAssistantText,
      currentTurn,
    )
  ) {
    return null;
  }
  if (pending.target === "content-generator") {
    logCreatePendingAction("accepted pending action", {
      target: pending.target,
      artifactType: pending.artifactType,
      initialPrompt: pending.initialPrompt,
    });
  }
  if (pending.type === "create_google_sheet") {
    return { execute: true, ack: frictionlessPendingAck(pending) };
  }
  return { execute: true, ack: frictionlessPendingAck(pending) };
}

export function resetFrictionlessPendingForTests(): void {
  clearFrictionlessPending();
}
