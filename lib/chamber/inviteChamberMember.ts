/**
 * Chamber member invite planning — fresh conversation by default.
 * Prior member threads never follow into a newly selected member unless
 * another member is explicitly adding someone into the same conversation.
 */

export type ChamberInviteMode = "fresh" | "add" | "same";

export type PlanChamberMemberInviteInput = {
  previousMemberId: string | null | undefined;
  nextMemberId: string;
  /** Keep the visible thread and append a join — only for intentional co-consult. */
  addToConversation?: boolean;
};

export type PlanChamberMemberInviteResult = {
  mode: ChamberInviteMode;
  /** Drop all visible messages before activating the new member. */
  clearMessages: boolean;
  /** Drop prior member topic ownership so stale domain fallbacks cannot fire. */
  clearActiveTopic: boolean;
  /** Abort in-flight chat for the prior member. */
  abortInFlight: boolean;
  /** Reset chamberThreadStartIndex to 0 (fresh snapshot). */
  resetThreadSnapshot: boolean;
};

export function planChamberMemberInvite(
  input: PlanChamberMemberInviteInput,
): PlanChamberMemberInviteResult {
  const previous = input.previousMemberId?.trim() || null;
  const next = input.nextMemberId.trim();
  if (!next) {
    return {
      mode: "fresh",
      clearMessages: true,
      clearActiveTopic: true,
      abortInFlight: true,
      resetThreadSnapshot: true,
    };
  }

  if (previous && previous === next) {
    return {
      mode: "same",
      clearMessages: false,
      clearActiveTopic: false,
      abortInFlight: false,
      resetThreadSnapshot: false,
    };
  }

  if (previous && input.addToConversation) {
    return {
      mode: "add",
      clearMessages: false,
      clearActiveTopic: false,
      abortInFlight: true,
      resetThreadSnapshot: false,
    };
  }

  return {
    mode: "fresh",
    clearMessages: true,
    clearActiveTopic: true,
    abortInFlight: true,
    resetThreadSnapshot: true,
  };
}
