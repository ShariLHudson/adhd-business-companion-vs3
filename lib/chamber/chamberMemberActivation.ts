/**
 * Chamber Member activation — persist the active member + invite copy.
 * Visible thread isolation (fresh vs add-to-conversation) is owned by
 * `planChamberMemberInvite` / CompanionPageClient — not this storage helper.
 */

import { clearChamberCertifiedRuntime } from "./chamberCertifiedState";
import {
  getChamberMemberById,
  type ChamberMember,
  type ChamberMemberId,
} from "./chamberMemberRegistry";

export const CHAMBER_ACTIVE_MEMBER_STORAGE_KEY =
  "spark-chamber-active-member-v1" as const;

export type ActiveChamberMemberState = {
  id: ChamberMemberId;
  displayName: string;
  specialty: string;
  cardImagePath: string;
  activatedAt: string;
};

export type ChamberMemberInviteMessages = {
  system: string;
  assistant: string;
};

export function buildChamberMemberInviteMessages(
  member: ChamberMember,
): ChamberMemberInviteMessages {
  return {
    system: `**${member.displayName}** has joined your conversation. Your current work and context stay exactly where they are.`,
    assistant: member.activationOpener,
  };
}

const CHAMBER_JOIN_SYSTEM_RE =
  /\*\*.+\*\* has joined your conversation\. Your current work and context stay exactly where they are\./;

/** Remove prior Chamber member join lines before activating another member. */
export function stripChamberMemberActivationMessages<
  T extends { role: string; content: string },
>(messages: readonly T[]): T[] {
  return messages.filter((message) => {
    if (message.role === "system" && CHAMBER_JOIN_SYSTEM_RE.test(message.content)) {
      return false;
    }
    return true;
  });
}

export function readActiveChamberMember(): ActiveChamberMemberState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CHAMBER_ACTIVE_MEMBER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActiveChamberMemberState;
    const member = parsed?.id ? getChamberMemberById(parsed.id) : undefined;
    if (!member) return null;
    // Always refresh portrait/name from the canonical registry — never trust
    // stale session paths from older image filenames.
    return {
      id: member.id,
      displayName: member.displayName,
      specialty: member.specialty,
      cardImagePath: member.cardImagePath,
      activatedAt: parsed.activatedAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function activateChamberMember(
  memberId: ChamberMemberId,
): { member: ChamberMember; messages: ChamberMemberInviteMessages } | null {
  const member = getChamberMemberById(memberId);
  if (!member) return null;

  // Fresh member → fresh Topic Anchor / CIE certification state
  clearChamberCertifiedRuntime();

  const state: ActiveChamberMemberState = {
    id: member.id,
    displayName: member.displayName,
    specialty: member.specialty,
    cardImagePath: member.cardImagePath,
    activatedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    sessionStorage.setItem(
      CHAMBER_ACTIVE_MEMBER_STORAGE_KEY,
      JSON.stringify(state),
    );
  }

  return {
    member,
    messages: buildChamberMemberInviteMessages(member),
  };
}

export function clearActiveChamberMember(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CHAMBER_ACTIVE_MEMBER_STORAGE_KEY);
}
