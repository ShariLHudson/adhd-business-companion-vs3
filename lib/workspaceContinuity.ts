/**
 * Workspace Awareness Intelligence™ (P0.42)
 * When the user is already inside a workspace, continue work — never re-offer navigation.
 */

import type { RegistryArtifactKind } from "./artifactRegistry";
import { registryArtifactLabel } from "./artifactRegistry";
import type { AppSection } from "./companionUi";
import type { WorkspaceOffer } from "./workspaceMode";
import { workspaceTitle } from "./workspaceMode";
import type { FrictionlessActionDecision } from "./frictionlessActionLayer";
import type { IntentRoutingDecision } from "./intentRoutingIntelligence";

const OPEN_WORKSPACE_RE =
  /\b(?:would you like (?:me )?to |shall i |let'?s |want (?:me )?to )?open\b/i;

/** True when the active panel matches the navigation target. */
export function isTargetWorkspaceOpen(
  currentWorkspace: AppSection | null | undefined,
  targetSection: AppSection,
): boolean {
  if (!currentWorkspace) return false;
  return currentWorkspace === targetSection;
}

/** Continuation copy when the user is already in the target workspace. */
export function buildWorkspaceContinuationLine(
  section: AppSection,
  userText?: string,
  artifactKind?: RegistryArtifactKind | null,
): string {
  const t = userText?.trim() ?? "";
  const label = workspaceTitle(section);

  if (section === "content-generator") {
    if (artifactKind) {
      const artifact = registryArtifactLabel(artifactKind);
      return `You're already in Create — let's keep building your ${artifact}. What part should we work on next?`;
    }
    if (/\b(?:spreadsheet|google sheet|sheet|calendar|tracker)\b/i.test(t)) {
      return "You're already in Create — let's map out your spreadsheet structure. What columns or categories do you need?";
    }
    if (/\b(?:write|draft|introduction|section|paragraph|outline)\b/i.test(t)) {
      return "Create is already open beside us — tell me what you're working on and we'll build it together.";
    }
    return "You're already in Create — what should we work on next?";
  }

  if (section === "projects") {
    return "Projects is already open — let's keep going. What field or step should we tackle next?";
  }
  if (section === "playbook") {
    return "Strategies is already open — which strategy or step should we focus on?";
  }
  if (section === "google-workspace" || section === "saved-work") {
    return "Documents is already open — what would you like to edit or add?";
  }
  if (section === "visual-focus") {
    return "Visual Thinking is already open — what structure should we build or refine?";
  }
  if (section === "decision-compass") {
    return "Decision Compass is already open — what's the decision you're weighing?";
  }
  if (section === "growth-vault" || section === "outcome-goals") {
    return "Growth is already open — what outcome or evidence should we work on?";
  }
  if (section === "plan-my-day") {
    return "Plan My Day is already open — what needs attention today?";
  }
  if (section === "brain-dump") {
    return "Clear My Mind is already open — dump what's on your mind and we'll sort it after.";
  }
  if (section === "focus" || section === "focus-timer") {
    return "Focus is already open — what should get your attention right now?";
  }
  if (section === "energy") {
    return "Adapt My Day is already open — how is your energy right now?";
  }

  return `${label} is already open — let's continue. What should we do next?`;
}

export function shouldSuppressWorkspaceNavigation(
  currentWorkspace: AppSection | null | undefined,
  targetSection: AppSection,
): boolean {
  return isTargetWorkspaceOpen(currentWorkspace, targetSection);
}

function stripOpenWorkspaceLanguage(text: string, section: AppSection): string {
  const label = workspaceTitle(section);
  if (!OPEN_WORKSPACE_RE.test(text)) return text;
  return buildWorkspaceContinuationLine(section);
}

/** Suppress workspace offers in intent routing when the panel is already open. */
export function applyWorkspaceOpenSuppression(
  decision: IntentRoutingDecision,
  currentWorkspace?: AppSection | null,
): IntentRoutingDecision {
  if (!currentWorkspace) return decision;

  const primaryOpen =
    decision.workspaceOffer?.section === currentWorkspace;
  const secondaryOpen =
    decision.secondaryWorkspaceOffer?.section === currentWorkspace;

  if (!primaryOpen && !secondaryOpen) return decision;

  const workspaceOffer = primaryOpen ? null : decision.workspaceOffer;
  const secondaryWorkspaceOffer = secondaryOpen
    ? null
    : decision.secondaryWorkspaceOffer;

  const stillOffers = Boolean(workspaceOffer || secondaryWorkspaceOffer);
  const continuation = buildWorkspaceContinuationLine(
    currentWorkspace,
    undefined,
    decision.artifactKind,
  );

  return {
    ...decision,
    workspaceOffer,
    secondaryWorkspaceOffer,
    surfaceOfferUi: stillOffers ? decision.surfaceOfferUi : false,
    navigationLine: continuation,
    routeMode:
      !stillOffers && decision.routeMode === "feature_offer"
        ? "inline"
        : decision.routeMode,
  };
}

/** Strip reopen offers from frictionless decisions when already in the workspace. */
export function applyWorkspaceAwareFrictionless(
  decision: FrictionlessActionDecision,
  currentWorkspace?: AppSection | null,
  userText?: string,
): FrictionlessActionDecision {
  if (!currentWorkspace || !decision.workspaceOffer) return decision;
  if (decision.workspaceOffer.section !== currentWorkspace) return decision;

  const continuation = buildWorkspaceContinuationLine(
    currentWorkspace,
    userText,
    decision.intentRouting?.artifactKind ?? null,
  );

  const localReply = decision.localReply
    ? stripOpenWorkspaceLanguage(decision.localReply, currentWorkspace)
    : continuation;

  const pendingAction =
    decision.pendingAction?.type === "open_workspace" &&
    decision.pendingAction.target === currentWorkspace
      ? null
      : decision.pendingAction;

  return {
    ...decision,
    workspaceOffer: null,
    pendingAction,
    localReply: OPEN_WORKSPACE_RE.test(localReply) ? continuation : localReply,
  };
}

export function suppressWorkspaceOfferIfOpen(
  offer: WorkspaceOffer | null,
  currentWorkspace?: AppSection | null,
): WorkspaceOffer | null {
  if (!offer || !currentWorkspace) return offer;
  if (offer.section !== currentWorkspace) return offer;
  return null;
}
