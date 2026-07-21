/**
 * Sole durable save contract owner for Create.
 * Local caches / drafts / bookmarks must never claim “Saved” (member label).
 */

import {
  creationSaveStateTone,
  labelForCreationSaveState,
  resolveCreationSaveState,
  type CreationSaveState,
  type CreationSaveStateInput,
} from "./saveState";

/** Prompt 093 vocabulary — maps onto CreationSaveState. */
export type DurableSavePipelineState =
  | "editing_locally"
  | "saving"
  | "saved_securely"
  | "save_failed"
  | "recovery_available"
  | "conflict_detected"
  | "clean";

export function toDurableSavePipelineState(
  state: CreationSaveState,
): DurableSavePipelineState {
  switch (state) {
    case "dirty":
      return "editing_locally";
    case "local_only":
      return "recovery_available";
    case "saving":
    case "retrying":
      return "saving";
    case "saved":
      return "saved_securely";
    case "failed":
      return "save_failed";
    case "conflict":
      return "conflict_detected";
    case "clean":
    default:
      return "clean";
  }
}

export type SavePipelineInput = CreationSaveStateInput & {
  /** Explicit multi-tab / stale-write conflict. */
  conflictDetected?: boolean;
  /** Expected durable version from last ack (stale write detection). */
  expectedDurableVersion?: number | null;
  /** Version observed on server/last write. */
  observedDurableVersion?: number | null;
};

/**
 * Resolve authoritative save UI state for any Create surface.
 */
export function resolveDurableSavePipeline(
  input: SavePipelineInput,
): {
  state: CreationSaveState;
  pipeline: DurableSavePipelineState;
  label: string;
  tone: ReturnType<typeof creationSaveStateTone>;
} {
  const staleConflict =
    input.conflictDetected === true ||
    (typeof input.expectedDurableVersion === "number" &&
      typeof input.observedDurableVersion === "number" &&
      input.observedDurableVersion > input.expectedDurableVersion);

  if (staleConflict) {
    const state: CreationSaveState = "conflict";
    return {
      state,
      pipeline: "conflict_detected",
      label: labelForCreationSaveState(state),
      tone: creationSaveStateTone(state),
    };
  }

  const state = resolveCreationSaveState(input);
  return {
    state,
    pipeline: toDurableSavePipelineState(state),
    label: labelForCreationSaveState(state),
    tone: creationSaveStateTone(state),
  };
}

/** True only when member-facing copy may say Saved (durable ack). */
export function isDurableSaveAcknowledged(input: SavePipelineInput): boolean {
  return resolveDurableSavePipeline(input).pipeline === "saved_securely";
}

/** Classify a secondary store so UI never pretends it is durable. */
export type LocalCreateStoreClass =
  | "durable_pipeline"
  | "local_recovery_only"
  | "local_bookmark_only"
  | "domain_projection";

export function classifyCreatePersistencePath(
  path:
    | "creationDurable"
    | "focusRecoveryBuffer"
    | "runtimeRecords"
    | "workflowBookmark"
    | "draftLibrary"
    | "eventRecordLs"
    | "blueprintTemplate",
): LocalCreateStoreClass {
  switch (path) {
    case "creationDurable":
      return "durable_pipeline";
    case "focusRecoveryBuffer":
    case "runtimeRecords":
      return "local_recovery_only";
    case "workflowBookmark":
    case "draftLibrary":
    case "blueprintTemplate":
      return "local_bookmark_only";
    case "eventRecordLs":
      return "domain_projection";
    default:
      return "local_recovery_only";
  }
}
