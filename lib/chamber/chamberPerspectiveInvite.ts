/**
 * Soft Chamber invite — acknowledge the right member without claiming a hard handoff.
 * Full routing can follow after the member says yes.
 */

import {
  chamberMemberShortLabel,
  resolveChamberMemberFromText,
} from "@/lib/chamber/chamberMemberAliases";
import type { ChamberMemberId } from "@/lib/chamber/chamberMemberRegistry";

function withIntelligenceSuffix(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) return "Chamber";
  if (/intelligence$/i.test(trimmed)) return trimmed;
  return `${trimmed} Intelligence`;
}

export function buildChamberPerspectiveInvite(input: {
  memberId?: ChamberMemberId | null;
  /** Override display label (e.g. Legal & Risk when soft-mapped). */
  displayLabel?: string | null;
  userText?: string;
}): string {
  let label = input.displayLabel?.trim() || "";
  if (!label && input.memberId) {
    label = chamberMemberShortLabel(input.memberId);
  }
  if (!label && input.userText) {
    const resolved = resolveChamberMemberFromText(input.userText);
    if (resolved.kind === "match") {
      label = chamberMemberShortLabel(resolved.match.memberId);
    }
  }
  const named = withIntelligenceSuffix(label || "Chamber");
  return `That sounds like something our ${named} member can help with. Would you like me to bring that perspective into this conversation?`;
}

/** Legal / risk soft invite — acknowledge even when no dedicated member card exists yet. */
export const LEGAL_RISK_CHAMBER_INVITE =
  "That sounds like something our Legal & Risk Intelligence member can help with. Would you like me to bring that perspective into this conversation?" as const;
