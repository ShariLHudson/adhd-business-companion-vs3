/**
 * Companion Governor — single authority for turn outcomes (Companion OS Phase 2).
 * Subordinate to docs-companion-intelligence/21_Companion_Constitution.md
 */

import type { AppSection } from "./companionUi";
import {
  appFeatureKnowledgeHintForChat,
  isAppHowToQuestion,
} from "./appFeatureKnowledge";
import { arbitrateCompanionTurn, type TurnArbitration } from "./companionTurnArbiter";
import { isAssistantAwaitingUserAnswer } from "./conversationIntervention";
import { userGrantedDraftPermission } from "./draftPermissionGate";
import {
  teachingModeActive,
  teachingModeHintForChat,
} from "./teachingMode";
import {
  companionGuidanceHintForChat,
  learningToDoingHint,
  toolTeachingHint,
} from "./companionGuidanceSystem";
import {
  companionFirstWorkflowHintForChat,
  isCompanionFirstQuestion,
} from "./companionFirstWorkflow";
import { detectOpenSectionRequest } from "./pendingAction";
import {
  classifyConversationalMode,
  isGenuineEmotionalDistress,
  shouldStayConversationalOnly,
  shouldSuppressCreatePending,
} from "./messageClassification";
import {
  isExplicitBuildTemplateRequest,
  isExplicitTemplateCreateOpen,
  isTemplateDiscoveryRequest,
  templateDiscoveryHintForChat,
} from "./templateIntent";
import { hasActiveCreateSession } from "./createSessionStore";
import {
  activeWorkflowConceptHintForChat,
  isWorkflowConceptQuestion,
  resolveActiveWorkflowContext,
  type ActiveWorkflowContextInput,
} from "./activeWorkflowContextLock";
import type { ResolvedIntent } from "./intentStabilizer";
import type { WorkspaceOpenSnapshot } from "./workspaceExecution";
import {
  enforceConversationOnlyTurnSurface,
  isChatConversationOnlyMode,
} from "./chatConversationOnly";
import { observeGovernorTurnSurface } from "@/lib/intelligence-layer/governorTrustSignals";

export type TurnOutcome =
  | "chat_only"
  | "pending_offer"
  | "active_workflow"
  | "workspace_open"
  | "tool_open";

export type TurnSurface = {
  outcome: TurnOutcome;
  /** Block Create, artifact handoff, and auto workspace routing. */
  suppressWorkspaceRouting: boolean;
  /** Block activation cards, tool suggestions, workspace offers. */
  suppressCards: boolean;
  /** Block post-reply artifact extraction / draft sync. */
  suppressArtifactHandoff: boolean;
  /** Block restore / resume unless explicit consent path. */
  suppressRestore: boolean;
  targetSection?: AppSection;
  targetTool?: "games";
  pendingOfferSection?: AppSection;
  promptHints: string[];
  lane: string;
  arbitration: TurnArbitration;
};

export type CompanionGovernorInput = {
  userText: string;
  lastAssistantText?: string;
  workspacePanel: AppSection | null;
  workspaceSnap: WorkspaceOpenSnapshot;
  resolvedIntent: ResolvedIntent;
  strategyApplyActive?: boolean;
  createBuilderActive?: boolean;
  businessStrategyActive?: boolean;
  dayDesignerActive?: boolean;
  /** User deleted draft this session — do not restore. */
  draftDeleted?: boolean;
  /** Active guided workflow metadata for in-context concept answers. */
  workflowContext?: ActiveWorkflowContextInput;
};

const RESUME_DRAFT_RE =
  /\b(?:resume my draft|continue my draft|open my draft|pick up (?:my|the) draft)\b/i;

const DELETE_DRAFT_RE =
  /\b(?:delete (?:the |my )?draft|remove (?:the |my )?draft|clear (?:the |my )?draft)\b/i;

const OPEN_GAMES_RE =
  /\bopen (?:the )?momentum games?\b/i;

function detectExplicitToolOpen(text: string): "games" | null {
  if (OPEN_GAMES_RE.test(text.trim())) return "games";
  return null;
}

function laneLabel(text: string): string {
  const mode = classifyConversationalMode(text);
  if (isAppHowToQuestion(text)) return "learn_app";
  if (mode === "brainstorming") return "brainstorm";
  if (mode === "prioritizing") return "prioritize";
  if (mode === "deciding") return "decide";
  if (mode === "creating") return "create";
  if (isGenuineEmotionalDistress(text)) return "emotional_support";
  return mode;
}

/** Single entry — exactly one terminal outcome per turn. */
export function evaluateCompanionTurn(input: CompanionGovernorInput): TurnSurface {
  const surface = enforceConversationOnlyTurnSurface(
    evaluateCompanionTurnCore(input),
  );
  try {
    observeGovernorTurnSurface(surface, input);
  } catch {
    /* observational only — must not affect governor outcomes */
  }
  return surface;
}

function evaluateCompanionTurnCore(input: CompanionGovernorInput): TurnSurface {
  const text = input.userText.trim();
  const lastAssistant = input.lastAssistantText?.trim() ?? "";
  const hints: string[] = [];

  const arbitration = arbitrateCompanionTurn({
    userText: text,
    workspacePanel: input.workspacePanel,
    workspaceSnap: input.workspaceSnap,
    resolvedIntent: input.resolvedIntent,
    distressed: isGenuineEmotionalDistress(text),
    overwhelmed:
      isGenuineEmotionalDistress(text) &&
      /\boverwhelm/i.test(text),
    askingHow: isAppHowToQuestion(text),
    stayInConversation: shouldStayConversationalOnly(text),
    strategyApplyActive: input.strategyApplyActive,
    createBuilderActive: input.createBuilderActive,
    businessStrategyActive: input.businessStrategyActive,
    dayDesignerActive: input.dayDesignerActive,
  });

  const shariAwaitingAnswer =
    lastAssistant.length > 0 &&
    isAssistantAwaitingUserAnswer([
      { role: "assistant", content: lastAssistant },
    ]);
  const baseSuppressCards = shariAwaitingAnswer;

  const workflowCtx = resolveActiveWorkflowContext({
    strategyApplyActive: input.strategyApplyActive,
    strategyApplySession: input.workflowContext?.strategyApplySession,
    createBuilderActive: input.createBuilderActive,
    createBuilderSession: input.workflowContext?.createBuilderSession,
    businessStrategyActive: input.businessStrategyActive,
    businessStrategySession: input.workflowContext?.businessStrategySession,
    dayDesignerActive: input.dayDesignerActive,
    workspaceCoachActive: input.workflowContext?.workspaceCoachActive,
    workspacePanel: input.workspacePanel,
    workspaceSession: input.workflowContext?.workspaceSession,
    lastAssistantText: lastAssistant,
  });

  // Active workflows own the turn.
  if (
    input.strategyApplyActive ||
    input.createBuilderActive ||
    input.businessStrategyActive ||
    input.dayDesignerActive ||
    input.workflowContext?.workspaceCoachActive ||
    arbitration.decision === "active_workflow"
  ) {
    if (workflowCtx && isWorkflowConceptQuestion(text)) {
      hints.push(
        activeWorkflowConceptHintForChat({
          userText: text,
          workflow: workflowCtx,
        }),
      );
    }
    return {
      outcome: "active_workflow",
      suppressWorkspaceRouting: true,
      suppressCards: true,
      suppressArtifactHandoff: true,
      suppressRestore: true,
      promptHints: hints,
      lane: "active_workflow",
      arbitration,
    };
  }

  // Concept teaching — coach one step at a time, not article dumps.
  if (
    teachingModeActive(text, lastAssistant, {
      activeWorkflowLocked: Boolean(workflowCtx),
    })
  ) {
    hints.push(teachingModeHintForChat(text, lastAssistant));
    const bridge = learningToDoingHint(text, lastAssistant);
    if (bridge) hints.push(bridge);
    hints.push(
      companionGuidanceHintForChat({
        workspacePanel: input.workspacePanel,
        userText: text,
        lastAssistantText: lastAssistant,
        teachingActive: true,
      }),
    );
    return {
      outcome: "chat_only",
      suppressWorkspaceRouting: true,
      suppressCards: true,
      suppressArtifactHandoff: true,
      suppressRestore: true,
      promptHints: hints,
      lane: "teaching",
      arbitration: {
        ...arbitration,
        blockAutoOpenDocument: true,
        blockAutoRouteAsset: true,
        blockIntentMake: true,
        blockIntentStabilize: true,
        blockIntentEditDraft: true,
      },
    };
  }

  // Delete draft — remember only; no restore this turn.
  if (DELETE_DRAFT_RE.test(text)) {
    return {
      outcome: "chat_only",
      suppressWorkspaceRouting: true,
      suppressCards: true,
      suppressArtifactHandoff: true,
      suppressRestore: true,
      promptHints: [
        "DRAFT DELETED: Acknowledge removal. Do not reopen Create or restore draft content.",
      ],
      lane: "resume",
      arbitration,
    };
  }

  // App how-to — brief answer + offer workspace/tool beside chat (companion first).
  if (isAppHowToQuestion(text) || isCompanionFirstQuestion(text)) {
    const appHint = appFeatureKnowledgeHintForChat(text);
    if (appHint) hints.push(appHint);
    const toolHint = toolTeachingHint(text);
    if (toolHint) hints.push(toolHint);
    hints.push(companionFirstWorkflowHintForChat(text, input.workspacePanel));
    return {
      outcome: "chat_only",
      suppressWorkspaceRouting: true,
      suppressCards: false,
      suppressArtifactHandoff: true,
      suppressRestore: true,
      promptHints: hints,
      lane: "companion_first",
      arbitration: {
        ...arbitration,
        blockAutoOpenDocument: true,
        blockAutoRouteAsset: true,
        blockIntentMake: true,
        blockIntentEditDraft: true,
      },
    };
  }

  // Genuine distress — chat first turn; no tool cards (before generic conversation-only).
  if (isGenuineEmotionalDistress(text)) {
    return {
      outcome: "chat_only",
      suppressWorkspaceRouting: true,
      suppressCards: true,
      suppressArtifactHandoff: true,
      suppressRestore: true,
      promptHints: hints,
      lane: "emotional_support",
      arbitration: {
        ...arbitration,
        blockAutoOpenDocument: true,
        blockAutoRouteAsset: true,
        blockIntentMake: true,
        blockIntentStabilize: true,
        blockIntentEditDraft: true,
      },
    };
  }

  // Conversation-only lanes (brainstorm, prioritize, plan, decide, research).
  if (shouldStayConversationalOnly(text) || shouldSuppressCreatePending(text)) {
    return {
      outcome: "chat_only",
      suppressWorkspaceRouting: true,
      suppressCards: baseSuppressCards,
      suppressArtifactHandoff: true,
      suppressRestore: true,
      promptHints: hints,
      lane: laneLabel(text),
      arbitration: {
        ...arbitration,
        blockAutoOpenDocument: true,
        blockAutoRouteAsset: true,
        blockIntentMake: true,
        blockIntentStabilize: true,
        blockIntentEditDraft: true,
      },
    };
  }

  // Template discovery — chat first; no auto Create.
  if (isTemplateDiscoveryRequest(text)) {
    hints.push(templateDiscoveryHintForChat(text));
    return {
      outcome: "chat_only",
      suppressWorkspaceRouting: true,
      suppressCards: true,
      suppressArtifactHandoff: true,
      suppressRestore: true,
      promptHints: hints,
      lane: "templates",
      arbitration: {
        ...arbitration,
        blockAutoOpenDocument: true,
        blockAutoRouteAsset: true,
        blockIntentMake: true,
        blockIntentStabilize: true,
        blockIntentEditDraft: true,
      },
    };
  }

  // Build this template — chat/consent lane unless explicit Create open.
  if (isExplicitBuildTemplateRequest(text) && !isExplicitTemplateCreateOpen(text)) {
    hints.push(
      "TEMPLATE BUILD: User wants to work from a template. Stay in chat or offer consent before opening Create — do not auto-open workspaces.",
    );
    return {
      outcome: "chat_only",
      suppressWorkspaceRouting: true,
      suppressCards: baseSuppressCards,
      suppressArtifactHandoff: true,
      suppressRestore: true,
      promptHints: hints,
      lane: "templates",
      arbitration: {
        ...arbitration,
        blockAutoOpenDocument: true,
        blockAutoRouteAsset: true,
        blockIntentMake: true,
        blockIntentStabilize: true,
        blockIntentEditDraft: true,
      },
    };
  }

  // Explicit tool open — Momentum Games.
  const tool = detectExplicitToolOpen(text);
  if (tool) {
    return {
      outcome: "tool_open",
      targetTool: tool,
      suppressWorkspaceRouting: false,
      suppressCards: true,
      suppressArtifactHandoff: true,
      suppressRestore: true,
      promptHints: hints,
      lane: "focus",
      arbitration,
    };
  }

  // Explicit workspace open (Create, Projects, Time Block, etc.).
  const explicitSection = detectOpenSectionRequest(text);
  if (explicitSection) {
    return {
      outcome: "workspace_open",
      targetSection: explicitSection,
      suppressWorkspaceRouting: false,
      suppressCards: true,
      suppressArtifactHandoff: true,
      suppressRestore: true,
      promptHints: hints,
      lane: "explicit_open",
      arbitration,
    };
  }

  // Resume draft — only when saved draft exists and not deleted.
  if (RESUME_DRAFT_RE.test(text)) {
    const canRestore = hasActiveCreateSession() && !input.draftDeleted;
    if (canRestore) {
      return {
        outcome: "workspace_open",
        targetSection: "content-generator",
        suppressWorkspaceRouting: false,
        suppressCards: true,
        suppressArtifactHandoff: true,
        suppressRestore: false,
        promptHints: hints,
        lane: "resume",
        arbitration,
      };
    }
    return {
      outcome: "chat_only",
      suppressWorkspaceRouting: true,
      suppressCards: true,
      suppressArtifactHandoff: true,
      suppressRestore: true,
      promptHints: [
        "NO SAVED DRAFT: User asked to resume but nothing is saved. Say so honestly — do not open Create.",
      ],
      lane: "resume",
      arbitration,
    };
  }

  // Draft permission granted — Create may open.
  if (userGrantedDraftPermission(text, lastAssistant)) {
    return {
      outcome: "workspace_open",
      targetSection: "content-generator",
      suppressWorkspaceRouting: false,
      suppressCards: true,
      suppressArtifactHandoff: false,
      suppressRestore: true,
      promptHints: hints,
      lane: "create",
      arbitration: {
        ...arbitration,
        blockAutoOpenDocument: false,
        blockIntentMake: false,
        blockIntentEditDraft: false,
      },
    };
  }

  // Default — conversation only.
  return {
    outcome: "chat_only",
    suppressWorkspaceRouting: true,
    suppressCards: baseSuppressCards,
    suppressArtifactHandoff: true,
    suppressRestore: true,
    promptHints: hints,
    lane: laneLabel(text),
    arbitration: {
      ...arbitration,
      blockAutoOpenDocument: true,
      blockAutoRouteAsset: true,
      blockIntentMake: true,
      blockIntentStabilize: true,
      blockIntentEditDraft: true,
    },
  };
}

/** Governor authorized a chat-turn workspace or tool open (explicit or consent path). */
export function governorAuthorizedChatTurnOpen(surface: TurnSurface): boolean {
  return surface.outcome === "workspace_open" || surface.outcome === "tool_open";
}

/**
 * Block duplicate auto-routing when Governor returned chat_only.
 * UI clicks and governorAuthorizedChatTurnOpen paths are unaffected.
 */
export function governorBlocksChatTurnAutoOpen(surface: TurnSurface): boolean {
  return surface.outcome === "chat_only";
}

export function governorAllowsPreChatWorkspaceOpen(
  surface: TurnSurface,
  section: AppSection,
): boolean {
  if (governorAuthorizedChatTurnOpen(surface)) {
    if (surface.outcome === "tool_open") return false;
    return surface.targetSection === section;
  }
  if (surface.outcome === "active_workflow") return false;
  if (surface.suppressWorkspaceRouting) return false;
  return false;
}

export function governorAllowsArtifactHandoff(surface: TurnSurface): boolean {
  if (surface.suppressArtifactHandoff) return false;
  if (surface.outcome === "workspace_open" && surface.targetSection === "content-generator") {
    return true;
  }
  return false;
}

export function governorAllowsWorkspaceOffer(surface: TurnSurface): boolean {
  if (surface.suppressCards) return false;
  return surface.outcome === "pending_offer";
}

export function governorAllowsToolSuggestion(surface: TurnSurface): boolean {
  return !surface.suppressCards && surface.outcome === "chat_only";
}

/** True when governor blocks all coaching / intervention UI for this turn. */
export function governorSuppressesInterventionSurfaces(
  input: CompanionGovernorInput,
): boolean {
  return evaluateCompanionTurn(input).suppressCards;
}

export function mergeGovernorHints(
  existing: string | undefined,
  surface: TurnSurface,
): string | undefined {
  if (!surface.promptHints.length) return existing;
  const merged = [...(existing ? [existing] : []), ...surface.promptHints];
  return merged.join("\n\n");
}
