/**
 * Frictionless Companion Action Layer™ (P0.9)
 * Chat is the front door — act, ask one question, or open the right tool.
 * Runs before relationship reflection.
 */

import { detectAudioRequest } from "./audioSuggestions";
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
import type { WorkspaceOffer } from "./workspaceMode";

export type FrictionlessActionCategory =
  | "direct_action"
  | "tool_open"
  | "emotional_regulation"
  | "focus_support"
  | "decision_support"
  | "none";

export type FrictionlessPendingAction = {
  type: "open_tool" | "open_workspace";
  target: AppSection | "focus-audio" | "breathe" | "focus-timer" | "brain-dump";
  label?: string;
  context: string;
  artifactType?: string;
  initialPrompt?: string;
  focusAudioCategory?: string;
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
  /^(?:yes|yep|yeah|yup|sure|ok(?:ay)?|please|do that|open it|do it|go ahead|let'?s do it|sounds good|that works|perfect|great)\.?$/i;

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
    return "Opening **Create**.";
  }
  if (action.target === "decision-compass") {
    return "Opening **Decision Compass**.";
  }
  if (action.target === "brain-dump") {
    return "Opening **Clear My Mind**.";
  }
  if (action.target === "plan-my-day") {
    return "Opening **Plan My Day**.";
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
  return {
    type: "open_workspace",
    target: offer.section,
    context: offer.line,
    offeredAtTurn,
    offerSummary: offer.buttonLabel,
  };
}

export function frictionlessPendingFromToolOffer(
  suggestion: ToolSuggestion,
  offeredAtTurn: number,
): FrictionlessPendingAction {
  const tool =
    suggestion.action.type === "tool" ? suggestion.action.tool : "focus-audio";
  return {
    type: "open_tool",
    target: tool,
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
    toolEmoji: tool === "focus-audio" ? "🎧" : "🌿",
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
      toolEmoji: "🎧",
      keepTalkingLabel: "Keep Talking",
      action: { type: "tool", tool: "focus-audio" },
    },
    workspaceOffer: null,
    intentRouting: null,
  };
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
      toolEmoji: "🎧",
      keepTalkingLabel: "Stay here with me",
      action: { type: "tool", tool: "focus-audio" },
    },
    workspaceOffer: null,
    intentRouting: null,
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
    suppressRelationship: false,
    suppressRecap: false,
    suppressReflectionFirst: false,
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

  const audio = buildAudioPending(userText, currentTurn);
  if (audio) return audio;

  if (
    EMOTIONAL_REGULATION_RE.test(userText) &&
    !PRODUCTIVITY_FRAMING_RE.test(userText)
  ) {
    return buildEmotionalRegulationDecision(currentTurn);
  }

  if (FOCUS_SUPPORT_RE.test(userText) && !/\boverwhelm/i.test(userText)) {
    return buildFocusSupportDecision(currentTurn);
  }

  if (
    isDecisionCompassOfferSignal(userText) ||
    /\bhelp me decide\b/i.test(userText)
  ) {
    return buildDecisionSupportDecision(routing, currentTurn);
  }

  if (routing.learnFastPath) {
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

  if (routing.suppressRelationshipIntelligence) {
    return {
      ...none,
      category: "direct_action",
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint: routing.suppressRelationshipIntelligence
        ? "EXECUTE OVERRIDE: direct action only — no relationship lead."
        : null,
      workspaceOffer: routing.workspaceOffer,
      intentRouting: routing,
    };
  }

  return none;
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
  if (decision.category === "focus_support") {
    lines.push("Ask what needs attention OR offer Focus Mode / Focus Audio.");
  }
  return lines.join("\n");
}

export function resolveFrictionlessContinuation(
  userText: string,
  pending: FrictionlessPendingAction,
  currentTurn: number,
): { execute: boolean; ack: string } | null {
  if (!isFrictionlessAffirmation(userText)) return null;
  if (isFrictionlessPendingExpired(pending, currentTurn)) return null;
  if (pending.target === "content-generator") {
    logCreatePendingAction("accepted pending action", {
      target: pending.target,
      artifactType: pending.artifactType,
      initialPrompt: pending.initialPrompt,
    });
  }
  return { execute: true, ack: frictionlessPendingAck(pending) };
}

export function resetFrictionlessPendingForTests(): void {
  clearFrictionlessPending();
}
