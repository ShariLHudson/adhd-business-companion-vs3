/**
 * Required natural-language examples for Anywhere-Origin routing (103).
 * Each resolves through Universal Launch Contract → UWE registry identity.
 */

import type { AnywhereOriginResolution, UniversalLaunchContract } from "./types";
import { resolveAnywhereOriginWork } from "./resolveAnywhereOriginWork";

export type AnywhereNlExample = {
  id: string;
  message: string;
  /** Partial contract overlays (origin, related work, etc.). */
  contract: Omit<UniversalLaunchContract, "originalUserMessage"> & {
    originalUserMessage?: string | null;
  };
  expect: {
    decision?: AnywhereOriginResolution["decision"] | AnywhereOriginResolution["decision"][];
    blueprintId?: string | null;
    openUniversalInterface?: boolean;
    talkOnly?: boolean;
    awaitingApproval?: boolean;
    preventedDuplicate?: boolean;
    hasWorkId?: boolean;
  };
};

export const ANYWHERE_ORIGIN_NL_EXAMPLES: readonly AnywhereNlExample[] = [
  {
    id: "business_luncheon",
    message: "Help me plan a business luncheon.",
    contract: { origin: "conversation" },
    expect: {
      decision: ["create_new", "continue_existing", "clarify"],
      blueprintId: "bp-event-business-luncheon",
      openUniversalInterface: true,
    },
  },
  {
    id: "online_workshop",
    message: "I need to organize an online workshop.",
    contract: { origin: "create" },
    expect: {
      decision: ["create_new", "continue_existing", "clarify"],
      blueprintId: "bp-event-online-workshop",
      openUniversalInterface: true,
    },
  },
  {
    id: "three_day_retreat",
    message: "Let us work on my three-day retreat.",
    contract: { origin: "welcome_home" },
    expect: {
      decision: ["create_new", "continue_existing", "clarify"],
      blueprintId: "bp-event-three-day-retreat",
      openUniversalInterface: true,
    },
  },
  {
    id: "project_to_book_signing",
    message: "Turn this Project into a book-signing plan.",
    contract: {
      origin: "projects",
      projectId: "proj-launch-1",
      candidateBlueprintId: "bp-event-book-signing",
    },
    expect: {
      decision: ["create_new", "connect_existing", "continue_existing", "clarify"],
      blueprintId: "bp-event-book-signing",
      openUniversalInterface: true,
    },
  },
  {
    id: "use_retreat_blueprint",
    message: "Use the retreat Blueprint.",
    contract: {
      origin: "blueprints",
      candidateBlueprintId: "bp-event-three-day-retreat",
    },
    expect: {
      decision: ["create_new", "continue_existing", "clarify"],
      blueprintId: "bp-event-three-day-retreat",
      openUniversalInterface: true,
    },
  },
  {
    id: "continue_workshop",
    message: "Continue the workshop I started.",
    contract: {
      origin: "welcome_home",
      // relatedWorkId supplied by caller after seed in tests
    },
    expect: {
      decision: ["continue_existing", "clarify", "create_new"],
      openUniversalInterface: true,
    },
  },
  {
    id: "body_double_agenda",
    message: "Body double with me while I work on the event agenda.",
    contract: {
      origin: "body_doubling",
      sectionId: "agenda",
      bodyDoublingSessionId: "bd-session-1",
    },
    expect: {
      decision: [
        "continue_existing",
        "create_new",
        "connect_existing",
        "clarify",
      ],
      openUniversalInterface: true,
    },
  },
  {
    id: "chamber_help_event",
    message: "Ask the Chamber to help improve this event.",
    contract: {
      origin: "chamber",
      chamberMemberId: "events",
      applyApproved: false,
    },
    expect: {
      decision: ["awaiting_approval", "continue_existing", "clarify", "create_new"],
      awaitingApproval: true,
    },
  },
  {
    id: "board_review_budget",
    message: "Have the Board review this event budget.",
    contract: {
      origin: "board",
      sectionId: "budget",
      boardReviewId: "br-budget-1",
      applyApproved: false,
    },
    expect: {
      decision: ["awaiting_approval", "continue_existing", "clarify"],
      awaitingApproval: true,
    },
  },
  {
    id: "research_venues",
    message: "Research venues for this retreat.",
    contract: {
      origin: "research",
      candidateBlueprintId: "bp-event-three-day-retreat",
      applyApproved: false,
    },
    expect: {
      decision: ["awaiting_approval", "continue_existing", "clarify"],
      awaitingApproval: true,
    },
  },
  {
    id: "cmm_to_event",
    message: "This thought from Clear My Mind should become an event.",
    contract: {
      origin: "clear_my_mind",
      clearMyMindThoughtId: "cmm-thought-1",
      candidateWorkTypeId: "event_plan",
      candidateBlueprintId: "bp-event-business-luncheon",
    },
    expect: {
      decision: ["create_new", "continue_existing", "clarify"],
      hasWorkId: true,
      openUniversalInterface: true,
    },
  },
  {
    id: "show_in_cartography",
    message: "Show this event in Cartography.",
    contract: {
      origin: "cartography",
      cartographyNodeId: "node-event-1",
    },
    expect: {
      decision: [
        "continue_existing",
        "connect_existing",
        "create_new",
        "clarify",
      ],
      openUniversalInterface: true,
    },
  },
];

export function resolveNlExample(
  example: AnywhereNlExample,
  overlay?: Partial<UniversalLaunchContract>,
): AnywhereOriginResolution {
  return resolveAnywhereOriginWork({
    ...example.contract,
    ...overlay,
    origin: overlay?.origin ?? example.contract.origin,
    originalUserMessage: example.message,
  });
}
