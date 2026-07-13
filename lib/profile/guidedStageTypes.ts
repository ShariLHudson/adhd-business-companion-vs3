/**
 * Staged Guidance model — reduce decision fatigue.
 * Completion is derived from existing saved fields. No second storage system.
 */

export type GuidedStagePriority = "quick_start" | "standard" | "deeper";

export type GuidedEntryMode = "quick_start" | "guided_setup" | "browse";

export type GuidedStageStatus =
  | "ready_to_begin"
  | "started"
  | "explored"
  | "saved"
  | "ready_when_you_are"
  | "enough_for_now";

export type GuidedStageAreaId =
  | "identity"
  | "offers"
  | "brand"
  | "direction"
  | "work-style"
  | "tools"
  | "people-i-help";

export type GuidedStageDefinition = {
  id: string;
  areaId: GuidedStageAreaId;
  title: string;
  description: string;
  /** Primary question field paths — max 4. May include synthetic paths like people-i-help.link */
  fieldPaths: readonly string[];
  priority: GuidedStagePriority;
  completionMessage: string;
  /** Optional / visually secondary stage */
  optional?: boolean;
  /** Conditional field paths shown only when related answers exist */
  conditionalFieldPaths?: readonly string[];
};

export type GuidedAreaStages = {
  areaId: GuidedStageAreaId;
  title: string;
  stages: readonly GuidedStageDefinition[];
  quickStartFieldPaths: readonly string[];
  quickStartMessage: string;
};

/** Calm status copy — never Incomplete / Missing / Required / Behind / Failed */
export const GUIDED_STAGE_STATUS_LABEL: Record<GuidedStageStatus, string> = {
  ready_to_begin: "Ready to Begin",
  started: "Started",
  explored: "Explored",
  saved: "Saved",
  ready_when_you_are: "Ready When You Are",
  enough_for_now: "Enough for Now",
};

export const GUIDED_STAGE_COMPLETION_PROMPT =
  "This is enough for Shari to begin helping with this area.";

export const GUIDED_QUICK_START_DONE_MESSAGE =
  "You've shared enough for Shari to begin personalizing help here. You can add more whenever it feels useful.";

/** Contract — stages never auto-save or auto-navigate */
export const GUIDED_STAGES_MAY_AUTO_SAVE = false as const;
export const GUIDED_STAGES_MAY_AUTO_NAVIGATE = false as const;

export const MAX_PRIMARY_QUESTIONS_PER_STAGE = 4;
