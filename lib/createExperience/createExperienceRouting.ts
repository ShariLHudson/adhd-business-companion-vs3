/**
 * Create Experience — estate creation routing (not legacy workspace offers).
 * Intent → Create → open tool → continue conversation.
 */

import {
  detectRegistryArtifact,
  registryArtifactKindToCreateItemType,
  type RegistryArtifactKind,
} from "@/lib/artifactRegistry";
import { inferCreateItemTypeFromText } from "@/lib/createPendingAction";
import { blankScaffoldForType, type ResolvedArtifact } from "@/lib/createInitialization";
import { normalizeArtifactType, shouldLockArtifactType } from "@/lib/artifactType";
import { matchCatalogFromText } from "@/lib/createCatalog";
import { containsVisualStructurePhrase } from "@/lib/visualStructureRouting";
import {
  estateExperienceArrivalPrompt,
  estateExperienceDefaultSpace,
} from "@/lib/estateExperiences/registry";
import {
  isConversationSessionSpineEnabled,
  loadConversationSession,
  sessionAwareFollowUpLine,
  resolvedArtifactFromSessionContext,
} from "@/lib/conversationSession";
import type { UniversalCreationSession } from "@/lib/universalCreation/types";
import { isProjectCreationIntent } from "./projectCreationIntent";

export { isProjectCreationIntent } from "./projectCreationIntent";

export const CREATE_EXPERIENCE_ARRIVAL_PROMPT =
  estateExperienceArrivalPrompt("create");

export const MOMENTUM_EXPERIENCE_ARRIVAL_PROMPT =
  estateExperienceArrivalPrompt("momentum");

export const CREATE_ESTATE_PLACE_ID = "creative-studio" as const;

export type ImmediateCreateOpenPayload = {
  userText: string;
  artifact: ResolvedArtifact;
  estatePlaceId: typeof CREATE_ESTATE_PLACE_ID;
  /** Shown after navigation + tool open */
  followUpLine: string;
  /** Member sees this first */
  arrivalLine: string;
};

/** Explicit go/open/show Projects — never multi-place soft invites. */
const PROJECTS_NAVIGATION_RE =
  /\b(?:go to|take me to|bring me to|head to|open|show(?:\s+me)?)\s+(?:the\s+|my\s+)?(?:goals\s*(?:&|and)\s*)?projects?\b|\b(?:open|show)\s+project\s+homes?\b|\bproject\s+homes?\b/i;

const MOMENTUM_PLANNING_RE =
  /\b(?:marketing strategy|business plan(?:ning)?|weekly plan(?:ning)?|quarterly plan(?:ning)?|action plan|roadmap|milestone|goal tracking|move .* forward)\b/i;

export type ImmediateCreateContext = {
  universalCreationSession?: UniversalCreationSession | null;
};

function followUpForItemType(
  itemType: string,
  context?: ImmediateCreateContext | null,
): string {
  if (isConversationSessionSpineEnabled()) {
    const sessionAware = sessionAwareFollowUpLine(
      itemType,
      loadConversationSession(),
    );
    if (sessionAware) return sessionAware;
  }

  const t = itemType.toLowerCase();
  // 067 — invite into work; do not claim "opened" before verify
  if (t === "sop") {
    return "Let's shape your SOP. What process are we documenting today?";
  }
  if (t === "email") {
    return "Let's shape your email. Who is it for, and what's the main point?";
  }
  if (t.includes("newsletter")) {
    return "Let's shape your newsletter. What's this one about?";
  }
  if (t.includes("mind map") || t === "mind map") {
    return "Let's start your mind map. What should we map first?";
  }
  if (t.includes("flowchart") || t.includes("process map")) {
    return "Let's lay out your flowchart. What's the process?";
  }
  if (t.includes("checklist")) {
    return "Let's build your checklist. What are we checking off?";
  }
  if (t.includes("proposal")) {
    return "Let's shape your proposal. Who is it for?";
  }
  if (t.includes("funnel") || t.includes("sales funnel")) {
    return "Let's shape your funnel. What are we building this for?";
  }
  return `Let's shape your ${itemType}. What should we make first?`;
}

function arrivalLineForIntent(userText: string): string {
  if (/\bhelp me\b/i.test(userText)) {
    return "Let's head over to Create.";
  }
  if (/\b(?:write|draft|create|build|make|need|want)\b/i.test(userText)) {
    return "On it — Create is the right place for this.";
  }
  return "Let's head to Create.";
}

function resolvedArtifactForItemType(
  itemType: string,
  userText: string,
): ResolvedArtifact {
  const normalized = normalizeArtifactType(itemType);
  const scaffold = blankScaffoldForType(normalized);
  return {
    itemType: normalized,
    title: `New ${normalized}`,
    draftContent: scaffold,
    source: "blank",
    artifactTypeLocked: shouldLockArtifactType(normalized),
  };
}

export const MOMENTUM_ESTATE_PLACE_ID =
  estateExperienceDefaultSpace("momentum");

export type ImmediateCreateProjectOpenPayload = {
  userText: string;
  experienceId: "create";
  /**
   * 057 — New work begins in Create (conversational entry).
   * Projects continues Active Work; it never opens a Project Home creation screen.
   */
  estatePlaceId: typeof CREATE_ESTATE_PLACE_ID;
  toolSection: "create";
  followUpLine: string;
};

/** Member asked to go to / open Projects — route directly, no soft invites. */
export function isExplicitProjectsNavigationIntent(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;
  if (isProjectCreationIntent(t)) return false;
  return PROJECTS_NAVIGATION_RE.test(t);
}

/** Clear project command — navigate or create — never multi-destination menus. */
export function isExplicitProjectsCommandIntent(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;
  return isProjectCreationIntent(t) || isExplicitProjectsNavigationIntent(t);
}

export function resolveImmediateCreateProjectAction(
  userText: string,
): ImmediateCreateProjectOpenPayload | null {
  const text = userText.trim();
  if (!isProjectCreationIntent(text)) return null;
  const arrival = "Let's bring that to life.";
  const followUp =
    "Tell me what you want to create — we'll shape it together in the workspace.";
  return {
    userText: text,
    experienceId: "create",
    estatePlaceId: CREATE_ESTATE_PLACE_ID,
    toolSection: "create",
    followUpLine: `${arrival}\n\n${followUp}`,
  };
}

export type ImmediateMomentumOpenPayload = {
  userText: string;
  estatePlaceId: typeof MOMENTUM_ESTATE_PLACE_ID;
  /** Active project work lands in Project Homes — not legacy split projects. */
  section: "project-homes";
  followUpLine: string;
};

export function resolveImmediateMomentumAction(
  userText: string,
): ImmediateMomentumOpenPayload | null {
  const text = userText.trim();
  if (!text || !isMomentumForwardIntent(text)) return null;
  const arrival = "Momentum is the right place for this.";
  const followUp = "What's the first piece you want to tackle?";
  return {
    userText: text,
    estatePlaceId: MOMENTUM_ESTATE_PLACE_ID,
    section: "project-homes",
    followUpLine: `${arrival}\n\n${followUp}`,
  };
}

/** Forward motion — not new project creation (that belongs in Create). */
export function isMomentumForwardIntent(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;
  if (isProjectCreationIntent(t)) return false;
  if (MOMENTUM_PLANNING_RE.test(t) && !detectRegistryArtifact(t)) return true;
  return false;
}

/**
 * High-confidence create intent → immediate navigation payload.
 * Returns null when destination is ambiguous or belongs in Momentum.
 */
export function resolveImmediateCreateAction(
  userText: string,
  artifactKind?: RegistryArtifactKind | null,
  context?: ImmediateCreateContext | null,
): ImmediateCreateOpenPayload | null {
  const text = userText.trim();
  if (!text) return null;
  if (isMomentumForwardIntent(text)) return null;

  const kind = artifactKind ?? detectRegistryArtifact(text);
  let itemType: string | undefined;

  if (kind) {
    itemType = registryArtifactKindToCreateItemType(kind);
  } else if (containsVisualStructurePhrase(text)) {
    const catalog = matchCatalogFromText(text);
    itemType = catalog?.type;
  } else {
    itemType = inferCreateItemTypeFromText(text, kind);
  }

  if (!itemType) return null;

  const session = isConversationSessionSpineEnabled()
    ? loadConversationSession()
    : null;
  const artifact =
    isConversationSessionSpineEnabled()
      ? resolvedArtifactFromSessionContext(
          itemType,
          text,
          session,
          context?.universalCreationSession,
        )
      : resolvedArtifactForItemType(itemType, text);
  const arrivalLine = arrivalLineForIntent(text);
  const followUpLine = followUpForItemType(artifact.itemType, context);

  return {
    userText: text,
    artifact,
    estatePlaceId: CREATE_ESTATE_PLACE_ID,
    arrivalLine,
    followUpLine: `${arrivalLine}\n\n${followUpLine}`,
  };
}

export function buildCreateExperienceArrivalLine(
  kind: RegistryArtifactKind,
  _category: "build" | "execute",
): string {
  const itemType = registryArtifactKindToCreateItemType(kind);
  const arrival = arrivalLineForIntent(`create ${kind}`);
  const followUp = followUpForItemType(itemType);
  return `${arrival}\n\n${followUp}`;
}

/** Back-compat alias for artifact registry consumers */
export const buildRegistryArtifactOfferLine = buildCreateExperienceArrivalLine;
