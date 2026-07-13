/**
 * Build and persist advisory context packets (not profile storage).
 */

import { getPrimaryAvatar, getAvatars } from "@/lib/companionStore";
import { collectApprovedBusinessEstateContext } from "@/lib/profile/guidedFieldHelp";
import type {
  AdvisoryContext,
  AdvisoryInviteChamberDetail,
  AdvisorySourceType,
  SavedAdvisoryAdvice,
  AdvisorySuggestedChange,
  AdvisoryHelpMode,
} from "@/lib/profile/advisoryHelpTypes";
import {
  ADVISORY_ADVICE_STORAGE_KEY,
  ADVISORY_CONTEXT_SESSION_KEY,
  ADVISORY_HELP_MAY_AUTO_UPDATE_PROFILE,
  ADVISORY_HELP_MAY_AUTO_NAVIGATE_BOARDROOM,
  ADVISORY_HELP_MAY_AUTO_OPEN_CHAMBER_HOME,
  ADVISORY_INVITE_CHAMBER_EVENT,
  ADVISORY_PROMPT_SESSION_KEY,
} from "@/lib/profile/advisoryHelpTypes";
import type { ChamberMemberId } from "@/lib/chamber/chamberMemberRegistry";
import { getChamberMemberById } from "@/lib/chamber/chamberMemberRegistry";
import { BUSINESS_PROFILE_STORAGE_KEY } from "@/lib/profile/businessEstateResearch";

export function buildAdvisoryContext(input: {
  sourceType: AdvisorySourceType;
  areaId: string;
  stageId?: string;
  avatarId?: string;
  fieldId?: string;
  userQuestion?: string;
  draftContext?: Record<string, unknown>;
}): AdvisoryContext {
  const approved = collectApprovedBusinessEstateContext();
  const approvedContext: Record<string, unknown> = { ...approved };

  const avatarId =
    input.avatarId ??
    (input.sourceType === "people_i_help"
      ? getPrimaryAvatar()?.id
      : undefined);

  if (avatarId) {
    const avatar =
      getAvatars().find((a) => a.id === avatarId) ?? getPrimaryAvatar();
    if (avatar) {
      approvedContext["people-i-help.avatarId"] = avatar.id;
      approvedContext["people-i-help.name"] = avatar.name;
      approvedContext["people-i-help.who"] = avatar.who;
      approvedContext["people-i-help.painPoints"] = avatar.painPoints;
      approvedContext["people-i-help.goals"] = avatar.goals;
    }
  }

  const draftMarked: Record<string, unknown> | undefined = input.draftContext
    ? Object.fromEntries(
        Object.entries(input.draftContext).map(([k, v]) => [
          `draft:${k}`,
          v,
        ]),
      )
    : undefined;

  return {
    sourceType: input.sourceType,
    areaId: input.areaId,
    stageId: input.stageId,
    avatarId,
    fieldId: input.fieldId,
    userQuestion: input.userQuestion,
    approvedContext,
    draftContext: draftMarked,
    returnDestination: {
      areaId: input.areaId,
      stageId: input.stageId,
      avatarId,
    },
  };
}

export function writeAdvisorySession(context: AdvisoryContext): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      ADVISORY_CONTEXT_SESSION_KEY,
      JSON.stringify(context),
    );
  } catch {
    /* ignore */
  }
}

export function readAdvisorySession(): AdvisoryContext | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ADVISORY_CONTEXT_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdvisoryContext;
  } catch {
    return null;
  }
}

export function formatAdvisoryChatPrompt(
  context: AdvisoryContext,
  memberIds: ChamberMemberId[],
): string {
  const members = memberIds
    .map((id) => getChamberMemberById(id))
    .filter(Boolean)
    .map((m) => `${m!.displayName} (${m!.specialty})`)
    .join("; ");

  const approvedLines = Object.entries(context.approvedContext).map(
    ([k, v]) => `- ${k}: ${String(v)}`,
  );
  const draftLines = context.draftContext
    ? Object.entries(context.draftContext).map(
        ([k, v]) => `- ${k}: ${String(v)}`,
      )
    : [];

  return [
    "ADVISORY HELP (Chamber / Board — in-context, not Chamber home navigation)",
    `Source: ${context.sourceType} · Area: ${context.areaId}${context.stageId ? ` · Stage: ${context.stageId}` : ""}`,
    context.avatarId ? `Avatar ID: ${context.avatarId}` : "",
    context.userQuestion ? `Member question: ${context.userQuestion}` : "",
    `Members invited: ${members || "(none yet)"}`,
    "Respond from specialty. Do not overwrite profile fields.",
    "Distinguish approved context from draft: values.",
    `Return destination: area=${context.returnDestination.areaId}${context.returnDestination.stageId ? ` stage=${context.returnDestination.stageId}` : ""}${context.returnDestination.avatarId ? ` avatar=${context.returnDestination.avatarId}` : ""}`,
    `Contract: autoUpdateProfile=${ADVISORY_HELP_MAY_AUTO_UPDATE_PROFILE} autoChamberHome=${ADVISORY_HELP_MAY_AUTO_OPEN_CHAMBER_HOME} autoBoardroomNav=${ADVISORY_HELP_MAY_AUTO_NAVIGATE_BOARDROOM}`,
    "",
    "Approved context:",
    ...approvedLines.slice(0, 40),
    draftLines.length ? "" : "",
    draftLines.length ? "Draft context (not approved):" : "",
    ...draftLines.slice(0, 20),
  ]
    .filter(Boolean)
    .join("\n");
}

export function writeAdvisoryPrompt(
  context: AdvisoryContext,
  memberIds: ChamberMemberId[],
): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      ADVISORY_PROMPT_SESSION_KEY,
      formatAdvisoryChatPrompt(context, memberIds),
    );
  } catch {
    /* ignore */
  }
}

export function readAdvisoryPrompt(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(ADVISORY_PROMPT_SESSION_KEY);
  } catch {
    return null;
  }
}

export function dispatchAdvisoryChamberInvite(
  detail: AdvisoryInviteChamberDetail,
): void {
  writeAdvisorySession(detail.context);
  writeAdvisoryPrompt(detail.context, detail.memberIds);
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(ADVISORY_INVITE_CHAMBER_EVENT, { detail }),
  );
}

export function saveAdvisoryAdvice(input: {
  context: AdvisoryContext;
  mode: AdvisoryHelpMode;
  chamberMemberIds?: ChamberMemberId[];
  boardMemberIds?: import("@/lib/advisory/types").AdvisoryMemberId[];
  summary: string;
  suggestedChanges?: AdvisorySuggestedChange[];
}): SavedAdvisoryAdvice {
  const note: SavedAdvisoryAdvice = {
    id: `adv-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    context: input.context,
    mode: input.mode,
    chamberMemberIds: input.chamberMemberIds ?? [],
    boardMemberIds: input.boardMemberIds ?? [],
    summary: input.summary,
    suggestedChanges: input.suggestedChanges ?? [],
    profileUpdatesApproved: false,
  };
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(ADVISORY_ADVICE_STORAGE_KEY);
      const list = raw ? (JSON.parse(raw) as SavedAdvisoryAdvice[]) : [];
      list.unshift(note);
      localStorage.setItem(
        ADVISORY_ADVICE_STORAGE_KEY,
        JSON.stringify(list.slice(0, 40)),
      );
    } catch {
      /* ignore */
    }
  }
  return note;
}

export function listSavedAdvisoryAdvice(): SavedAdvisoryAdvice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ADVISORY_ADVICE_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedAdvisoryAdvice[];
  } catch {
    return [];
  }
}

export function advisoryStorageIsSeparateFromProfile(): boolean {
  return ADVISORY_ADVICE_STORAGE_KEY !== BUSINESS_PROFILE_STORAGE_KEY;
}

/** Build suggested changes preview — never applied automatically */
export function buildSuggestedChangesFromAdvice(
  context: AdvisoryContext,
  sourceLabel: string,
): AdvisorySuggestedChange[] {
  const question = context.userQuestion?.trim() || "this topic";
  const drafts = context.draftContext ?? {};
  const keys = Object.keys(drafts).slice(0, 3);
  if (!keys.length) {
    return [
      {
        path: `${context.areaId} (review)`,
        currentValue: "(no draft fields open)",
        suggestedValue: `Consider notes from ${sourceLabel} about: ${question}`,
        reason: "Advice only until you choose to edit and Save in the area.",
        sourceLabel,
      },
    ];
  }
  return keys.map((k) => ({
    path: k.replace(/^draft:/, ""),
    currentValue: String(drafts[k] ?? ""),
    suggestedValue: `(Draft suggestion from ${sourceLabel} — edit before applying)`,
    reason: `Raised while discussing: ${question}`,
    sourceLabel,
  }));
}
