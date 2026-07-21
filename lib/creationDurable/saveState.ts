/**
 * 076_017 / 077_005 — Creation save states.
 * “Saved” is reserved for verified durable writes only.
 */

export type CreationSaveState =
  | "clean"
  | "dirty"
  | "saving"
  | "saved"
  | "retrying"
  | "failed"
  | "conflict"
  /** Local recovery buffer only — never shown as Saved. */
  | "local_only";

export type CreationSaveStateInput = {
  submitting?: boolean;
  failureMessage?: string | null;
  /** True only after persistCreation* returned ok + durable. */
  lastDurableOk?: boolean | null;
  /** Member has typed since last durable ack. */
  dirty?: boolean;
  /** Recovery buffer holds text not yet verified durable. */
  hasLocalRecovery?: boolean;
  offline?: boolean;
};

/** Resolve the single UI save state (most severe / informative wins). */
export function resolveCreationSaveState(
  input: CreationSaveStateInput,
): CreationSaveState {
  if (input.failureMessage?.trim()) {
    return input.submitting ? "retrying" : "failed";
  }
  if (input.submitting) return "saving";
  if (input.dirty || input.hasLocalRecovery) {
    return input.offline || input.lastDurableOk === false
      ? "local_only"
      : "dirty";
  }
  if (input.lastDurableOk === true) return "saved";
  return "clean";
}

/**
 * Member-facing labels (127 req 23).
 * Never show “Unsaved Changes” unless resolveCreationSaveState returned dirty.
 * Never label local-only as Saved.
 */
export function labelForCreationSaveState(state: CreationSaveState): string {
  switch (state) {
    case "clean":
      return "";
    case "dirty":
      return "Unsaved Changes";
    case "saving":
      return "Saving…";
    case "saved":
      return "Saved";
    case "retrying":
      return "Trying again…";
    case "failed":
      return "Not saved yet";
    case "conflict":
      return "Save conflict — both versions kept";
    case "local_only":
      return "Draft Saved";
    default:
      return "";
  }
}

export function creationSaveStateTone(
  state: CreationSaveState,
): "neutral" | "progress" | "success" | "caution" {
  switch (state) {
    case "saving":
    case "retrying":
      return "progress";
    case "saved":
      return "success";
    case "failed":
    case "conflict":
    case "local_only":
    case "dirty":
      return "caution";
    default:
      return "neutral";
  }
}
