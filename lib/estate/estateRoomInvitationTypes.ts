/**
 * Estate room invitation types — concierge suggestions, not menus.
 */

import type { AppSection } from "@/lib/companionUi";
import type { StablesExperienceId } from "@/lib/stables/types";

export type EstateRoomInvitationAction =
  | { kind: "conversation" }
  | { kind: "presence" }
  | { kind: "estate-map" }
  | { kind: "companion-continue" }
  | { kind: "plan-my-day" }
  | { kind: "show-suggestions" }
  | { kind: "return-home" }
  | { kind: "section"; section: AppSection }
  | { kind: "stables-experience"; experienceId: StablesExperienceId }
  | { kind: "institute-browse" }
  | { kind: "brain-dump-engage" }
  /** Evidence Vault — show a random reminder in chat (place stays visible). */
  | { kind: "evidence-reminder" }
  /** Evidence Vault — open capture form only after this choice. */
  | { kind: "evidence-add" }
  /** Evidence Vault — browse existing proof without the form. */
  | { kind: "evidence-browse" }
  /** Evidence Vault — help find forgotten proof in conversation. */
  | { kind: "evidence-find-proof" }
  /** Evidence Vault — open today's discovery capture. */
  | { kind: "evidence-today" }
  /** Evidence Vault — search preserved discoveries in conversation. */
  | { kind: "evidence-search" }
  /** Evidence Vault — view vault insights in conversation. */
  | { kind: "evidence-insights" }
  /** Evidence Vault — print or export discoveries. */
  | { kind: "evidence-print" };

export type EstateRoomInvitationTier = "dynamic" | "primary" | "universal";

export type EstateRoomInvitationItem = {
  id: string;
  emoji: string;
  label: string;
  action: EstateRoomInvitationAction;
  tier: EstateRoomInvitationTier;
  /** Optional context line — e.g. apprenticeship minutes remaining */
  detail?: string;
};

export type EstateRoomInvitationSet = {
  lead: string;
  preamble: string;
  /** Ordered: dynamic → primary → universal */
  items: EstateRoomInvitationItem[];
  /** Index after which to show the gentle divider (end of dynamic+primary) */
  primaryEndIndex: number;
};
