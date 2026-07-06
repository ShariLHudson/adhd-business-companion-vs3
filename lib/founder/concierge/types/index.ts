/** Executive Concierge™ — orchestration types (no AI). */

import type { FounderWorkspaceId } from "../../types/workspace";

export type ConciergeEstatePlaceId =
  | "round-table"
  | "greenhouse"
  | "library"
  | "observatory"
  | "coffee-house"
  | "music-room";

export type ExecutiveConciergeMessage = {
  id: string;
  text: string;
  href?: string;
  hrefLabel?: string;
};

export type ExecutiveAgendaPriority = {
  id: string;
  title: string;
  summary: string;
};

export type ExecutiveWatchItem = {
  id: string;
  title: string;
  note: string;
};

export type ExecutiveOpportunity = {
  id: string;
  title: string;
  summary: string;
};

export type ExecutiveConciergeRecommendation = {
  id: string;
  title: string;
  summary: string;
  href?: string;
  hrefLabel?: string;
};

export type ExecutiveAgenda = {
  priorities: ExecutiveAgendaPriority[];
  watchItems: ExecutiveWatchItem[];
  opportunity: ExecutiveOpportunity | null;
  recommendation: ExecutiveConciergeRecommendation | null;
};

export type WorkspaceSuggestion = {
  workspaceId: FounderWorkspaceId | "executive-strategy";
  title: string;
  reason: string;
  href: string;
};

export type ThinkingSpaceSuggestion = {
  placeId: ConciergeEstatePlaceId;
  label: string;
  reason: string;
  href: string;
};

export type ExecutiveReminderKind =
  | "pending-decision"
  | "strategy-session"
  | "idea-revisit"
  | "workshop-approval";

export type ExecutiveReminder = {
  id: string;
  kind: ExecutiveReminderKind;
  title: string;
  note: string;
  href?: string;
};

export type ConciergeQuickWin = {
  id: string;
  title: string;
  summary: string;
};

export type ConciergeDrawerLink = {
  id: string;
  label: string;
  meta?: string;
  href: string;
};

export type ConciergeDrawerSection = {
  id: string;
  title: string;
  items: ConciergeDrawerLink[];
};

export type PreparedOffice = {
  greeting: string;
  primaryMessage: ExecutiveConciergeMessage;
  agenda: ExecutiveAgenda;
  workspaceSuggestion: WorkspaceSuggestion;
  thinkingSpace: ThinkingSpaceSuggestion;
  reminders: ExecutiveReminder[];
  quickWins: ConciergeQuickWin[];
  watchItems: ExecutiveWatchItem[];
  drawer: ConciergeDrawerSection[];
  preparedAt: string;
};
