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
  | { kind: "brain-dump-engage" };

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
