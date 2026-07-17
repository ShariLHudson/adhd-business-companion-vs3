/**
 * CB-022 — Shared Chamber navigate gate.
 * Bare topic aliases inside domain questions must not NAVIGATE.
 * Explicit member requests, menu picks, and destination commands may.
 */

import {
  chamberMemberShortLabel,
  resolveChamberMemberFromText,
  stripChamberNavigationPhrases,
  type ChamberMemberResolveResult,
} from "@/lib/chamber/chamberMemberAliases";
import type { ChamberMemberId } from "@/lib/chamber/chamberMemberRegistry";

/** Explicit navigation / destination phrasing (not bare “help with …”). */
const EXPLICIT_CHAMBER_NAV_RE =
  /\b(?:take me to|bring me to|go to|open|show(?:\s+me)?|talk to|ask|let(?:'s| us) (?:talk to|ask|see|visit)|i (?:want|need) (?:to )?(?:talk to|see|ask|visit)|visit)\b/i;

export type ChamberNavigateGateInput = {
  userText: string;
  /** Pending-choice / menu resolved to this member. */
  menuSelectedMemberId?: string | null;
  /** Caller already verified an explicit destination command. */
  explicitDestinationCommand?: boolean;
};

export type ChamberNavigateGateResult =
  | {
      allow: true;
      reason:
        | "explicit_member_request"
        | "menu_selection"
        | "explicit_destination"
        | "bare_member_name";
      memberId: ChamberMemberId;
      resolved: ChamberMemberResolveResult;
    }
  | {
      allow: false;
      reason:
        | "no_member"
        | "domain_question_alias"
        | "ambiguous_needs_clarify";
      memberId?: ChamberMemberId;
      resolved: ChamberMemberResolveResult;
    };

/**
 * Stricter than legacy `isChamberMemberRequest` for auto-NAVIGATE:
 * does not treat “help with invoicing/pricing” as Chamber navigation.
 */
export function isExplicitChamberNavigationRequest(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;
  const resolved = resolveChamberMemberFromText(t);
  if (resolved.kind === "none") return false;

  if (EXPLICIT_CHAMBER_NAV_RE.test(t)) {
    return resolved.kind === "match" || resolved.kind === "ambiguous";
  }

  // Bare member name / short label only (e.g. "Finance", "Client Relationships").
  // Must use the original utterance length — do not treat “I need help with pricing”
  // as bare “pricing” after stripping help phrases.
  if (resolved.kind !== "match") return false;
  const originalWords = t.split(/\s+/).filter(Boolean);
  if (originalWords.length === 0 || originalWords.length > 4) return false;
  const stripped = stripChamberNavigationPhrases(t).trim();
  const normalized = (stripped || t).toLowerCase();
  const alias = resolved.match.matchedAlias.toLowerCase();
  if (normalized === alias) return true;
  if (normalized.length <= alias.length + 8 && normalized.includes(alias)) {
    return true;
  }
  const label = chamberMemberShortLabel(resolved.match.memberId).toLowerCase();
  if (normalized === label || normalized === `${label} intelligence`) {
    return true;
  }
  return false;
}

export function mayNavigateToChamberMember(
  input: ChamberNavigateGateInput,
): ChamberNavigateGateResult {
  const userText = input.userText.trim();
  const resolved = resolveChamberMemberFromText(userText);

  if (input.menuSelectedMemberId) {
    return {
      allow: true,
      reason: "menu_selection",
      memberId: input.menuSelectedMemberId as ChamberMemberId,
      resolved:
        resolved.kind === "match"
          ? resolved
          : {
              kind: "match",
              match: {
                memberId: input.menuSelectedMemberId as ChamberMemberId,
                matchedAlias: input.menuSelectedMemberId,
                confidence: "high",
              },
            },
    };
  }

  if (input.explicitDestinationCommand && resolved.kind === "match") {
    return {
      allow: true,
      reason: "explicit_destination",
      memberId: resolved.match.memberId,
      resolved,
    };
  }

  if (resolved.kind === "none") {
    return { allow: false, reason: "no_member", resolved };
  }

  if (resolved.kind === "ambiguous") {
    // Clarify in chat — not a navigate
    return {
      allow: false,
      reason: "ambiguous_needs_clarify",
      resolved,
    };
  }

  if (isExplicitChamberNavigationRequest(userText)) {
    const reason = EXPLICIT_CHAMBER_NAV_RE.test(userText)
      ? "explicit_member_request"
      : "bare_member_name";
    return {
      allow: true,
      reason,
      memberId: resolved.match.memberId,
      resolved,
    };
  }

  return {
    allow: false,
    reason: "domain_question_alias",
    memberId: resolved.match.memberId,
    resolved,
  };
}

/** One Shari-owned line for explicit Chamber navigation (not specialist intro). */
export function buildChamberNavigateShariLine(memberId: ChamberMemberId): string {
  const label = chamberMemberShortLabel(memberId);
  return `We're with ${label} in the Chamber.`;
}

export function isChamberSpecialistIntroText(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (/^I'm\s+.+\s+Intelligence\b/i.test(t)) return true;
  if (/^Of course — here's\s+/i.test(t)) return true;
  if (t === "What would help you move forward today?") return true;
  return false;
}
