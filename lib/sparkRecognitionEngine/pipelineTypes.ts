/**
 * Recognition lifecycle pipeline — Estate Recognition Engine.
 *
 * Conversation → Recognition → Evidence Vault → Celebration (optional)
 * → Legacy Studio → Hall (optional) → Rediscovery
 *
 * Never routes discoveries to Create unless the member explicitly asks to build.
 */

import type {
  RecognitionExperiencePath,
  RecognitionFastPathOption,
  RecognitionFlowKind,
  RecognitionLifecycleStatus,
  RecognitionRecord,
  RecognitionRecordType,
  RecognitionRoomId,
  RecognitionTone,
  RecognitionTriggerMatch,
} from "./types";

/** Member-facing pipeline stages (not internal lifecycle labels). */
export const RECOGNITION_PIPELINE_STAGES = [
  "conversation",
  "recognition",
  "evidence_vault",
  "celebration",
  "legacy_studio",
  "hall",
  "rediscovery",
] as const;

export type RecognitionPipelineStage =
  (typeof RECOGNITION_PIPELINE_STAGES)[number];

export type RecognitionMemberChoice =
  | "preserve_it"
  | "celebrate_it"
  | "quiet_moment"
  | "joyful_celebration"
  | "help_me_decide"
  | "tell_the_story"
  | "mark_hall_candidate"
  | "induct_into_hall"
  | "not_now"
  | "remind_me_later"
  | "revisit";

export type RecognitionLifecycleOffer = {
  stage: RecognitionPipelineStage;
  /** Internal lifecycle status after accepting the primary path */
  nextLifecycleStatus: RecognitionLifecycleStatus;
  suggestedRoomId: RecognitionRoomId | null;
  flowKind: RecognitionFlowKind | null;
  path: RecognitionExperiencePath;
  memberPrompt: string;
  options: readonly RecognitionMemberChoice[];
  /** Soft adapter — never Create unless explicitBuildRequested */
  blockCreate: true;
  preserveFirst: boolean;
  reason: string;
};

export type RecognitionLifecycleTurnResult = {
  /** True when recognition owns this turn */
  ownsTurn: boolean;
  trigger: RecognitionTriggerMatch;
  offer: RecognitionLifecycleOffer | null;
  /** Prompt hint for companion (invisible) */
  companionPromptHint: string | null;
  /** Speak line for Spark */
  speak: string | null;
  /** Explicit Create was requested — Create may proceed */
  allowCreate: boolean;
};

export type AdvanceRecognitionLifecycleInput = {
  choice: RecognitionMemberChoice;
  recordId?: string;
  /** Source conversation text when preserving a new discovery */
  sourceText?: string;
  tone?: RecognitionTone;
  path?: RecognitionExperiencePath;
};

export type AdvanceRecognitionLifecycleResult = {
  ok: boolean;
  stage: RecognitionPipelineStage;
  lifecycleStatus: RecognitionLifecycleStatus | null;
  recordType: RecognitionRecordType | null;
  suggestedRoomId: RecognitionRoomId | null;
  flowKind: RecognitionFlowKind | null;
  memberPrompt: string;
  options: readonly RecognitionMemberChoice[];
  record?: RecognitionRecord;
  error?: string;
};

/** Map internal lifecycle → pipeline stage for UI/routing. */
export function pipelineStageForLifecycle(
  status: RecognitionLifecycleStatus,
): RecognitionPipelineStage {
  switch (status) {
    case "captured":
      return "recognition";
    case "preserved":
    case "recognized":
      return "evidence_vault";
    case "celebrated_quiet":
    case "celebrated_festive":
      return "celebration";
    case "chronicled":
      return "legacy_studio";
    case "hall_candidate":
    case "hall_exhibit":
      return "hall";
    case "archived":
      return "rediscovery";
    default:
      return "conversation";
  }
}

export function flowKindForStage(
  stage: RecognitionPipelineStage,
  tone?: RecognitionTone,
): RecognitionFlowKind | null {
  switch (stage) {
    case "evidence_vault":
    case "recognition":
      return "preserve_discovery";
    case "celebration":
      if (
        tone === "joyful" ||
        tone === "exciting" ||
        tone === "triumphant" ||
        tone === "festive" ||
        tone === "proud" ||
        tone === "energizing" ||
        tone === "celebratory"
      ) {
        return "festive_celebration";
      }
      return "quiet_celebration";
    case "legacy_studio":
      return "legacy_story";
    case "hall":
      return "hall_exhibit";
    default:
      return null;
  }
}

export function roomForPipelineStage(
  stage: RecognitionPipelineStage,
  tone?: RecognitionTone,
): RecognitionRoomId | null {
  switch (stage) {
    case "evidence_vault":
    case "recognition":
      return "evidence-vault";
    case "celebration":
      if (
        tone === "joyful" ||
        tone === "exciting" ||
        tone === "triumphant" ||
        tone === "festive" ||
        tone === "proud" ||
        tone === "energizing" ||
        tone === "celebratory"
      ) {
        return "celebration-room";
      }
      return "gardens";
    case "legacy_studio":
      return "legacy-studio";
    case "hall":
      return "portfolio";
    default:
      return null;
  }
}

/** Convert fast-path option ids used in routing → member choices. */
export function memberChoiceFromFastPath(
  option: RecognitionFastPathOption,
): RecognitionMemberChoice {
  switch (option) {
    case "preserve_it":
      return "preserve_it";
    case "celebrate_it":
      return "celebrate_it";
    case "quiet_moment":
      return "quiet_moment";
    case "joyful_celebration":
      return "joyful_celebration";
    case "help_me_decide":
      return "help_me_decide";
    case "not_now":
      return "not_now";
    case "add_more_first":
      return "preserve_it";
    default:
      return "not_now";
  }
}
