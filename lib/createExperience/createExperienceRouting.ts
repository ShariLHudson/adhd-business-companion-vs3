/**
 * Create Experience™ — estate creation routing (not legacy workspace offers).
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

const PROJECT_CREATE_RE =
  /\b(?:create|start|new|add)\s+(?:a\s+)?(?:new\s+)?project\b/i;

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
  if (t === "sop") {
    return "I've opened a new SOP. What process are we documenting today?";
  }
  if (t === "email") {
    return "I've opened a new email. Who is it for, and what's the main point?";
  }
  if (t.includes("newsletter")) {
    return "I've opened a newsletter draft. What's this one about?";
  }
  if (t.includes("mind map") || t === "mind map") {
    return "Mind map is ready. What should we map first?";
  }
  if (t.includes("flowchart") || t.includes("process map")) {
    return "Flowchart is open. What's the process we're laying out?";
  }
  if (t.includes("checklist")) {
    return "Checklist is ready. What are we checking off?";
  }
  if (t.includes("proposal")) {
    return "Proposal draft is open. Who is it for?";
  }
  if (t.includes("funnel") || t.includes("sales funnel")) {
    return "Funnel workspace is open. What are we building this funnel for?";
  }
  return `I've opened a new ${itemType}. What should we make first?`;
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
  estatePlaceId: typeof CREATE_ESTATE_PLACE_ID;
  toolSection: "projects";
  followUpLine: string;
};

export function isProjectCreationIntent(userText: string): boolean {
  return PROJECT_CREATE_RE.test(userText.trim());
}

export function resolveImmediateCreateProjectAction(
  userText: string,
): ImmediateCreateProjectOpenPayload | null {
  const text = userText.trim();
  if (!isProjectCreationIntent(text)) return null;
  const arrival = "Let's bring that project to life.";
  const followUp = "What should we call it?";
  return {
    userText: text,
    experienceId: "create",
    estatePlaceId: CREATE_ESTATE_PLACE_ID,
    toolSection: "projects",
    followUpLine: `${arrival}\n\n${followUp}`,
  };
}

export type ImmediateMomentumOpenPayload = {
  userText: string;
  estatePlaceId: typeof MOMENTUM_ESTATE_PLACE_ID;
  section: "projects";
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
    section: "projects",
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
