import type { AppSection } from "@/lib/companionUi";

export const PENDING_CHOICE_TIMEOUT_MS = 10 * 60 * 1000;

export type PendingChoiceType =
  | "estate_place"
  | "estate_navigation"
  | "capability_concierge"
  | "coaching_menu"
  | "implied_need"
  | "friction_barrier"
  | "knowledge_menu"
  | "generic";

export type PendingChoiceActionKind =
  | "navigate_place"
  | "open_section"
  | "open_focus_audio"
  | "start_discovery"
  | "open_journal"
  | "coaching_open"
  | "stay_in_chat";

export type PendingChoiceAction = {
  kind: PendingChoiceActionKind;
  placeId?: string;
  section?: AppSection;
  capabilityId?: string;
  focusAudioCategory?: string;
  discoveryTopic?: string;
  coachingPrescriptionId?: string;
  launchDiscovery?: boolean;
};

export type PendingChoiceItem = {
  id: string;
  label: string;
  description?: string;
  destination?: string;
  capability?: string;
  workflow?: string;
  callback: PendingChoiceAction;
  confidence?: "high" | "medium" | "low";
};

export type PendingChoiceState = {
  pendingChoiceId: string;
  pendingChoiceType: PendingChoiceType;
  choices: PendingChoiceItem[];
  conversationId?: string;
  timestamp: number;
  activeIntent?: string;
  activeRole?: string;
  activeWorkflow?: string;
  /** Full menu text to re-show on unrecognized selection */
  menuText?: string;
  offeredAtTurn?: number;
};

export type PendingChoiceResolveResult =
  | { kind: "none" }
  | { kind: "cancelled"; reply?: string }
  | { kind: "topic_change" }
  | { kind: "unrecognized"; reply: string; menuText: string }
  | { kind: "continued"; reply: string; menuText?: string }
  | { kind: "expanded"; reply: string; menuText: string }
  | {
      kind: "resolved";
      choice: PendingChoiceItem;
      action: PendingChoiceAction;
      reply: string;
    };
