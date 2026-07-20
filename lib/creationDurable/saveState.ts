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

/** Member-facing labels — never “Saved” for local-only. */
export function labelForCreationSaveState(state: CreationSaveState): string {
  switch (state) {
    case "clean":
      return "";
    case "dirty":
      return "Unsaved changes";
    case "saving":
      return "Saving securely…";
    case "saved":
      return "Saved securely";
    case "retrying":
      return "Trying again…";
    case "failed":
      return "Not saved securely yet";
    case "conflict":
      return "Save conflict — both versions kept";
    case "local_only":
      return "On this device — not saved securely yet";
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
