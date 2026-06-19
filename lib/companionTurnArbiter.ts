/**
 * Single turn arbiter — decides routing precedence after every user message.
 * Order: workspace → workspace query → active workflow → triage → create intent
 * → discovery gate → conversation.
 */

import type { AppSection } from "./companionUi";
import { matchCatalogFromText } from "./createCatalog";
import { hasCreateIntent, type ResolvedIntent } from "./intentStabilizer";
import {
  classifyConversationalMode,
  classifyUserMessage,
  conversationModeHintForChat,
  isExplicitCreationRequest,
  shouldRunEmotionalTriage,
  shouldStayConversationalOnly,
} from "./messageClassification";
import {
  isExplicitWorkspaceSwitchRequest,
} from "./workspaceContextLock";
import type { WorkspaceOpenSnapshot } from "./workspaceExecution";
import {
  isAnyWorkspaceOpen,
  isWorkspaceBesideChat,
} from "./workspaceExecution";

export type TurnArbiterDecision =
  | "active_workflow"
  | "workspace_first"
  | "triage"
  | "discovery"
  | "explicit_create"
  | "conversation";

export type ActiveWorkflowKind =
  | "strategy_apply"
  | "create_builder"
  | "business_strategy"
  | "day_designer"
  | null;

export type TurnArbitration = {
  decision: TurnArbiterDecision;
  activeWorkflow: ActiveWorkflowKind;
  workspacePanel: AppSection | null;
  workspaceLocked: boolean;
  workspaceBesideChat: boolean;
  blockAutoOpenDocument: boolean;
  blockAutoRouteAsset: boolean;
  blockIntentMake: boolean;
  blockIntentStabilize: boolean;
  blockIntentEditDraft: boolean;
  hintForChat?: string;
};

export type TurnArbiterInput = {
  userText: string;
  workspacePanel: AppSection | null;
  workspaceSnap: WorkspaceOpenSnapshot;
  resolvedIntent: ResolvedIntent;
  distressed?: boolean;
  overwhelmed?: boolean;
  askingHow?: boolean;
  stayInConversation?: boolean;
  strategyApplyActive?: boolean;
  createBuilderActive?: boolean;
  businessStrategyActive?: boolean;
  dayDesignerActive?: boolean;
};

/** Re-export for existing callers. */
export function isExplicitCreateRequest(text: string): boolean {
  return isExplicitCreationRequest(text);
}

/** First mention of a deliverable — discovery before Create. */
const CONTENT_ITEM_RE =
  /\b(linkedin|profile|email|e-?mail|proposal|sales page|landing page|newsletter|blog post|video script|sop|workshop|strategy doc|business plan|marketing plan|caption|social post|intake form|spreadsheet|document|script)\b/i;

const STRATEGY_IN_WORKSPACE_RE =
  /\b(?:strateg|procrastinat|overwhelm|focus|stuck|start ugly|body double|shrink|perfect|which one|recommend|help me with|what would help|apply)\b/i;

const PROJECT_IN_WORKSPACE_RE =
  /\b(?:project|outcome|goal|task|next step|milestone|workshop|proposal|focus on|this project|current project)\b/i;

const BRAIN_DUMP_CAPTURE_RE =
  /\b(?:save|saved|capture|captured|remember|store|write down|add to|put in clear my mind|brain dump)\b/i;

export function mentionsCreateableContent(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (CONTENT_ITEM_RE.test(t)) return true;
  if (matchCatalogFromText(t)) return true;
  return hasCreateIntent(t);
}

export function needsDiscoveryBeforeCreate(text: string): boolean {
  if (isExplicitCreateRequest(text)) return false;
  return mentionsCreateableContent(text);
}

function needsEmotionalTriage(input: TurnArbiterInput): boolean {
  if (classifyUserMessage(input.userText) === "practical_task") return false;
  if (classifyUserMessage(input.userText) === "mixed_emotional_task") {
    return false;
  }
  if (input.distressed && shouldRunEmotionalTriage(input.userText)) return true;
  if (
    shouldRunEmotionalTriage(input.userText) &&
    !isExplicitCreateRequest(input.userText)
  ) {
    return true;
  }
  return false;
}

function isWorkspaceLocked(
  panel: AppSection | null,
  snap: WorkspaceOpenSnapshot,
  userText: string,
): boolean {
  if (!panel) return false;
  if (!isWorkspaceBesideChat(snap) || snap.panel !== panel) return false;
  return !isExplicitWorkspaceSwitchRequest(userText, undefined);
}

function workspaceHint(
  panel: AppSection,
  userText: string,
): string {
  const title = panel === "playbook" ? "Strategies" : panel;
  if (panel === "playbook") {
    return (
      `TURN ARBITER — STRATEGIES LOCK: **Strategies** is open. ` +
      `Recommend ADHD strategies from the library or coach apply mode. ` +
      `Do NOT open Create or start document drafts unless the user explicitly says create/draft/open Create. ` +
      `User said: "${userText.slice(0, 100)}"`
    );
  }
  if (panel === "projects") {
    return (
      `TURN ARBITER — PROJECTS LOCK: **Projects** is open. ` +
      `Reference the selected project and visible fields. ` +
      `Do NOT open Create or unrelated workspaces. ` +
      `User said: "${userText.slice(0, 100)}"`
    );
  }
  if (panel === "brain-dump") {
    const captureNote = BRAIN_DUMP_CAPTURE_RE.test(userText)
      ? "User may want items saved — remind them each thought is saved as its own card in the Clear My Mind panel on the right, not in chat text alone."
      : "Items are only saved when entered in the Clear My Mind panel (one card per thought). Chat discussion alone does not save to the library.";
    return (
      `TURN ARBITER — CLEAR MY MIND LOCK: Panel is open. ${captureNote} ` +
      `Do NOT open Create. User said: "${userText.slice(0, 100)}"`
    );
  }
  if (panel === "content-generator") {
    return (
      `TURN ARBITER — CREATE LOCK: **Create** is open. ` +
      `Absorb answers into the shared workflow on the right before the next question. ` +
      `Do NOT open a different workspace. User said: "${userText.slice(0, 100)}"`
    );
  }
  return (
    `TURN ARBITER — WORKSPACE LOCK: **${title}** is open beside chat. ` +
    `Stay in this workspace. User said: "${userText.slice(0, 100)}"`
  );
}

function discoveryHint(userText: string): string {
  return (
    `TURN ARBITER — DISCOVERY FIRST: User mentioned something to build ("${userText.slice(0, 100)}") ` +
    `but did NOT explicitly ask to create/draft/open Create. ` +
    `Ask 1–2 clarifying questions (goal, audience, rewrite vs update) before opening any workspace or drafting. ` +
    `Do NOT open Create. Do NOT generate a draft in chat.`
  );
}

function triageHint(userText: string): string {
  return (
    `TURN ARBITER — TRIAGE FIRST: User signaled distress/overwhelm ("${userText.slice(0, 80)}"). ` +
    `Validate briefly. Ask ONE clarifying question. ` +
    `Do NOT open Create, Projects, Clear My Mind, Timer, or Spin on this turn.`
  );
}

function blockAllAuto(): Pick<
  TurnArbitration,
  | "blockAutoOpenDocument"
  | "blockAutoRouteAsset"
  | "blockIntentMake"
  | "blockIntentStabilize"
  | "blockIntentEditDraft"
> {
  return {
    blockAutoOpenDocument: true,
    blockAutoRouteAsset: true,
    blockIntentMake: true,
    blockIntentStabilize: true,
    blockIntentEditDraft: true,
  };
}

/** Main entry — call once per user message before auto-routing. */
export function arbitrateCompanionTurn(
  input: TurnArbiterInput,
): TurnArbitration {
  const userText = input.userText.trim();
  const panel = input.workspacePanel;
  const locked = isWorkspaceLocked(panel, input.workspaceSnap, userText);

  const base: TurnArbitration = {
    decision: "conversation",
    activeWorkflow: null,
    workspacePanel: panel,
    workspaceLocked: locked,
    workspaceBesideChat: isAnyWorkspaceOpen(input.workspaceSnap),
    ...blockAllAuto(),
  };

  // 3 — Active workflow (handlers in page.tsx run before/after; flag for hints)
  if (input.strategyApplyActive) {
    return {
      ...base,
      decision: "active_workflow",
      activeWorkflow: "strategy_apply",
      hintForChat:
        "TURN ARBITER — STRATEGY APPLY: Walk through the open strategy one question at a time. Absorb the user's answer before the next question.",
    };
  }
  if (input.createBuilderActive) {
    return {
      ...base,
      decision: "active_workflow",
      activeWorkflow: "create_builder",
      blockIntentMake: false,
      hintForChat:
        "TURN ARBITER — CREATE BUILDER: Answers feed the shared workflow beside chat. Absorb their reply before the next discovery question.",
    };
  }
  if (input.businessStrategyActive && panel === "playbook") {
    return {
      ...base,
      decision: "active_workflow",
      activeWorkflow: "business_strategy",
      workspaceLocked: true,
      hintForChat:
        "TURN ARBITER — BUSINESS STRATEGY BUILD: Conversational marketing/plan coaching. No checklist. Update the draft on the right from what they said.",
    };
  }
  if (input.dayDesignerActive) {
    return {
      ...base,
      decision: "active_workflow",
      activeWorkflow: "day_designer",
    };
  }

  // 4 — Emotional triage (unless explicit create while overwhelmed)
  if (
    needsEmotionalTriage(input) &&
    !isExplicitCreateRequest(userText) &&
    !input.stayInConversation
  ) {
    return {
      ...base,
      decision: "triage",
      hintForChat: triageHint(userText),
    };
  }

  if (input.stayInConversation) {
    return {
      ...base,
      decision: "conversation",
      hintForChat:
        "TURN ARBITER — PRIORITY DISCUSSION: Stay in conversation. Do not open workspaces.",
    };
  }

  // 1–2 — Workspace lock
  if (locked && panel) {
    const strategyQuery =
      panel === "playbook" &&
      (STRATEGY_IN_WORKSPACE_RE.test(userText) ||
        !needsDiscoveryBeforeCreate(userText));
    const projectQuery =
      panel === "projects" &&
      (PROJECT_IN_WORKSPACE_RE.test(userText) || userText.length > 0);
    const brainDumpOpen = panel === "brain-dump";
    const createOpen = panel === "content-generator";

    if (
      strategyQuery ||
      projectQuery ||
      brainDumpOpen ||
      createOpen ||
      panel
    ) {
      const explicitCreate = isExplicitCreateRequest(userText);
      return {
        ...base,
        decision: "workspace_first",
        workspaceLocked: true,
        blockAutoOpenDocument: !explicitCreate || panel !== "playbook",
        blockAutoRouteAsset: !explicitCreate,
        blockIntentMake: !explicitCreate || panel === "playbook",
        blockIntentStabilize: !explicitCreate,
        blockIntentEditDraft: panel === "playbook" && !explicitCreate,
        hintForChat: workspaceHint(panel, userText),
      };
    }
  }

  // 5 — Explicit create
  if (isExplicitCreateRequest(userText)) {
    return {
      ...base,
      decision: "explicit_create",
      blockAutoOpenDocument: false,
      blockAutoRouteAsset: false,
      blockIntentMake: false,
      blockIntentStabilize: false,
      blockIntentEditDraft: false,
      hintForChat:
        "TURN ARBITER — EXPLICIT CREATE: User asked to create/draft/open Create. You may open Create or hand off to the panel.",
    };
  }

  // 6 — Discovery before action
  if (
    needsDiscoveryBeforeCreate(userText) &&
    !input.askingHow &&
    !locked
  ) {
    return {
      ...base,
      decision: "discovery",
      hintForChat: discoveryHint(userText),
    };
  }

  // Block silent auto-make on catalog match without explicit create
  if (
    input.resolvedIntent.action === "make" &&
    input.resolvedIntent.confidence >= 0.85 &&
    !isExplicitCreateRequest(userText)
  ) {
    return {
      ...base,
      decision: "discovery",
      hintForChat: discoveryHint(userText),
    };
  }

  // 7 — Conversation
  return {
    ...base,
    decision: "conversation",
    blockAutoOpenDocument: true,
    blockAutoRouteAsset: true,
    blockIntentMake: true,
    blockIntentStabilize: true,
    blockIntentEditDraft: !(
      input.resolvedIntent.action === "edit-draft" &&
      input.resolvedIntent.draftContent
    ),
  };
}

export function arbitrationHintForChat(arbitration: TurnArbitration): string | undefined {
  return arbitration.hintForChat;
}

export function coGuideActiveFromArbitration(
  arbitration: TurnArbitration,
  snap?: WorkspaceOpenSnapshot,
): boolean {
  if (snap) {
    return isAnyWorkspaceOpen(snap);
  }
  return arbitration.workspaceBesideChat;
}
