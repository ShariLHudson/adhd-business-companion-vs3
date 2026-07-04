/**
 * Warm estate transition invitations — Shari voice, not software menus.
 */

export const ESTATE_TRANSITION_INVITE_CLOSER = "Want to go there together?";

export function estateTransitionInviteForRoom(roomLabel: string): string {
  return `${roomLabel} might be the right place for this. ${ESTATE_TRANSITION_INVITE_CLOSER}`;
}

export function estateCreativeStudioInvite(): string {
  return "Let's head to Create.";
}

export function estateClearMyMindInvite(): string {
  return `Clear My Mind may help unload what's crowding your head. ${ESTATE_TRANSITION_INVITE_CLOSER}`;
}

export function estateGenericTransitionInvite(): string {
  return ESTATE_TRANSITION_INVITE_CLOSER;
}
