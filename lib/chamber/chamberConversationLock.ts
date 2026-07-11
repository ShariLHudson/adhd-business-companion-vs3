/** True when a Chamber member conversation is in progress — block room exits from chat routing. */
export function isChamberMemberConversationActive(input: {
  activeSection: string | null | undefined;
  activeMemberId: string | null | undefined;
}): boolean {
  return (
    input.activeSection === "chamber-of-momentum" && Boolean(input.activeMemberId)
  );
}
