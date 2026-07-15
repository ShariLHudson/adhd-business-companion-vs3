/**
 * Shared Chamber exit — active member conversation must never follow the user
 * to another destination. Saved history ≠ active conversation.
 */

import { clearActiveChamberMember } from "./chamberMemberActivation";
import { stripChamberMemberActivationMessages } from "./chamberMemberActivation";

export type DismissActiveChamberConversationInput = {
  /** Destination being opened. Chamber stays active only when staying in Chamber. */
  destinationId?: string | null;
  /** Current active Chamber member id (React state / ref). */
  activeMemberId: string | null | undefined;
  /** Previous Estate section (for leave detection). */
  previousSection?: string | null;
  /** Next Estate section when known. */
  nextSection?: string | null;
};

export type DismissActiveChamberConversationPlan = {
  /** True when an active Chamber member session must be torn down. */
  shouldDismiss: boolean;
  /** Abort in-flight companion-chat stream. */
  abortStream: boolean;
  /** Clear sessionStorage + React active member id. */
  clearActiveMember: boolean;
  /** Hide Chamber room chat chrome. */
  hideChat: boolean;
  /**
   * Trim visible messages back to the pre-Chamber snapshot index.
   * Null means leave messages untouched (no active session / no snapshot).
   */
  restoreMessageIndex: number | null;
  /** Strip Chamber join system lines when restoring without a snapshot. */
  stripActivationMessages: boolean;
};

/**
 * Pure planner — CompanionPageClient applies the plan via React setters.
 * Never deletes persisted Chamber history records.
 */
export function planDismissActiveChamberConversation(
  input: DismissActiveChamberConversationInput & {
    chamberThreadStartIndex?: number | null;
  },
): DismissActiveChamberConversationPlan {
  const stayingInChamber =
    input.destinationId === "chamber-of-momentum" ||
    input.nextSection === "chamber-of-momentum";

  const leavingChamber =
    input.previousSection === "chamber-of-momentum" &&
    Boolean(input.nextSection) &&
    input.nextSection !== "chamber-of-momentum";

  const hasActiveMember = Boolean(input.activeMemberId);
  const shouldDismiss =
    hasActiveMember && (!stayingInChamber || leavingChamber);

  if (!shouldDismiss) {
    return {
      shouldDismiss: false,
      abortStream: false,
      clearActiveMember: false,
      hideChat: false,
      restoreMessageIndex: null,
      stripActivationMessages: false,
    };
  }

  const start = input.chamberThreadStartIndex;
  const hasSnapshot = typeof start === "number" && start >= 0;

  return {
    shouldDismiss: true,
    abortStream: true,
    clearActiveMember: true,
    hideChat: true,
    restoreMessageIndex: hasSnapshot ? start : null,
    stripActivationMessages: !hasSnapshot,
  };
}

/** Clear sticky Chamber member session storage. */
export function dismissActiveChamberConversationStorage(): void {
  clearActiveChamberMember();
}

/** Remove Chamber join banners from a visible message list. */
export function filterDismissedChamberMessages<
  T extends { role: string; content: string },
>(messages: readonly T[], restoreIndex: number | null): T[] {
  if (restoreIndex != null && restoreIndex >= 0) {
    return messages.slice(0, restoreIndex);
  }
  return stripChamberMemberActivationMessages(messages);
}

/**
 * True when destination switch should tear down Chamber.
 * Used by Welcome Home destination-switch planning.
 */
export function shouldClearChamberOnDestination(destinationId: string): boolean {
  return destinationId !== "chamber-of-momentum";
}
