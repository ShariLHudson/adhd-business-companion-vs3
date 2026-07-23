import {
  resolveAdaptivePresentation,
  toAdaptivePresentationContext,
} from "@/lib/adaptiveCompanionIntelligence";
import type { AppSection } from "@/lib/companionUi";
import {
  assertApproved,
  buildBoardBriefing,
  buildChamberBrief,
  buildProjectHandoff,
  type TalkItOutStrategyContext,
} from "./connectionContracts";
import {
  addStrategyConnection,
  getStrategyWorkItem,
  updateStrategyWorkItem,
} from "./strategyWorkItemStore";
import {
  setPendingStrategyHandoff,
  type StrategyPendingHandoff,
} from "./pendingHandoffStore";
import type {
  ContinueJourneyDestinationId,
  StrategyConnectionEntityType,
  StrategyWorkItem,
} from "./types";

export type StrategyHandoffResult = {
  ok: true;
  destinationId: ContinueJourneyDestinationId;
  section: AppSection | null;
  seedAsk: string | null;
  connectionId: string;
  handoff: StrategyPendingHandoff;
};

const SECTION_MAP: Partial<
  Record<ContinueJourneyDestinationId, AppSection>
> = {
  talk_it_out: "talk-it-out",
  chamber_member: "chamber-of-momentum",
  board: "boardroom",
  create: "content-generator",
  project: "projects",
  plan_my_day: "plan-my-day",
  calendar: "calendar",
  journal: "journal",
  evidence_vault: "evidence-bank",
  business_estate: "profile",
  rhythm: "rhythms",
  reminder: "rhythms",
};

const ENTITY_MAP: Partial<
  Record<ContinueJourneyDestinationId, StrategyConnectionEntityType>
> = {
  talk_it_out: "talk_it_out_session",
  chamber_member: "chamber_conversation",
  board: "board_session",
  create: "creation",
  project: "project",
  plan_my_day: "plan_my_day_item",
  calendar: "calendar_event",
  journal: "journal_entry",
  evidence_vault: "evidence_item",
  business_estate: "business_estate_record",
  rhythm: "rhythm",
  reminder: "reminder",
};

/**
 * Member click = approval. Records connection, stores pending context, never
 * auto-mutates the destination’s domain records.
 */
export function executeApprovedStrategyHandoff(input: {
  strategyWorkItemId: string;
  destinationId: ContinueJourneyDestinationId;
}): StrategyHandoffResult {
  assertApproved({ memberApproved: true });
  const item = getStrategyWorkItem(input.strategyWorkItemId);
  if (!item) {
    throw new Error("Strategy work item not found for handoff.");
  }

  const presentation = toAdaptivePresentationContext(
    resolveAdaptivePresentation({ destinationHint: "strategy_chamber" }),
  );
  const entityType = ENTITY_MAP[input.destinationId] ?? "decision_record";
  const connectedEntityId = `pending_${input.destinationId}_${Date.now().toString(36)}`;

  const connection = addStrategyConnection({
    strategyWorkItemId: item.id,
    connectedEntityType: entityType,
    connectedEntityId,
    connectionType: "handed_off",
    relationshipSummary: `Approved handoff to ${input.destinationId.replace(/_/g, " ")}`,
    syncDirection: "to_destination",
    memberApproved: true,
  });

  const handoff = buildPendingHandoff(item, input.destinationId, presentation);
  setPendingStrategyHandoff(handoff);

  updateStrategyWorkItem(item.id, {
    status: "handed_off",
    recommendedNextDestination: input.destinationId,
  });

  const section = SECTION_MAP[input.destinationId] ?? null;
  const seedAsk = seedAskFor(item, input.destinationId);

  return {
    ok: true,
    destinationId: input.destinationId,
    section,
    seedAsk,
    connectionId: connection.id,
    handoff,
  };
}

function buildPendingHandoff(
  item: StrategyWorkItem,
  destinationId: ContinueJourneyDestinationId,
  presentationContext: StrategyPendingHandoff["presentationContext"],
): StrategyPendingHandoff {
  const base: StrategyPendingHandoff = {
    strategyWorkItemId: item.id,
    destinationId,
    title: item.title,
    plainLanguageSummary: item.plainLanguageSummary,
    centralQuestion: item.decisionStatement || item.title,
    chosenDirection: item.chosenDirection,
    presentationContext,
    memberApproved: true,
    createdAt: new Date().toISOString(),
  };

  if (destinationId === "talk_it_out") {
    const soft: TalkItOutStrategyContext = {
      strategyWorkItemId: item.id,
      plainLanguageSummary: item.plainLanguageSummary,
      whatFeelsTangled: item.currentReality || item.decisionStatement,
    };
    return {
      ...base,
      softContext: soft.whatFeelsTangled || soft.plainLanguageSummary,
    };
  }

  if (destinationId === "board") {
    const briefing = buildBoardBriefing(item);
    return {
      ...base,
      boardBriefing: {
        decision: briefing.decision,
        whyItMatters: briefing.whyItMatters,
        options: briefing.options,
        risks: briefing.risks,
        questionsForBoard: briefing.questionsForBoard,
      },
    };
  }

  if (destinationId === "create") {
    return {
      ...base,
      createHandoff: {
        suggestedArtifact: "Strategy decision summary",
        decisionSummary:
          item.chosenDirection ||
          item.decisionStatement ||
          item.plainLanguageSummary,
      },
    };
  }

  if (destinationId === "project") {
    const project = buildProjectHandoff(item);
    return {
      ...base,
      projectHandoff: {
        chosenDirection: project.chosenDirection,
        risks: project.risks,
        guardrails: project.guardrails,
      },
    };
  }

  if (destinationId === "chamber_member") {
    const brief = buildChamberBrief(
      item,
      "Help me think about the next strategic choice without deciding for me.",
    );
    return {
      ...base,
      softContext: `${brief.title}: ${brief.currentQuestion}`,
    };
  }

  return base;
}

function seedAskFor(
  item: StrategyWorkItem,
  destinationId: ContinueJourneyDestinationId,
): string | null {
  if (destinationId === "talk_it_out") {
    return null; // Talk It Out panel consumes pending handoff directly
  }
  if (destinationId === "board") {
    return `I'm bringing a decision from the Strategy Chamber: ${item.decisionStatement || item.title}. I'd like the Board's perspectives.`;
  }
  if (destinationId === "chamber_member") {
    return `I'm in the Strategy Chamber working on: ${item.decisionStatement || item.title}. I'd like a Chamber member's lens.`;
  }
  return null;
}

/** Destinations considered complete enough to mark live in Continue Your Journey. */
export const STRATEGY_HANDOFF_LIVE_DESTINATIONS: ReadonlySet<ContinueJourneyDestinationId> =
  new Set([
    "talk_it_out",
    "board",
    "chamber_member",
    "create",
    "project",
    "plan_my_day",
    "calendar",
    "journal",
    "evidence_vault",
    "business_estate",
    "rhythm",
    "reminder",
  ]);
