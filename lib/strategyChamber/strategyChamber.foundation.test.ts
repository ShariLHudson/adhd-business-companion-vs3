import { beforeEach, describe, expect, it } from "vitest";
import {
  STRATEGY_CHAMBER_HELP_ME_CHOOSE,
  STRATEGY_CHAMBER_PRIMARY_ENTRIES,
  STRATEGY_LIBRARY_TITLE,
  recommendStrategyLibraryMode,
} from "@/lib/strategyLibrary/estateCopy";
import { getUserStrategies } from "@/lib/userStrategies";
import {
  __resetStrategyChamberStoresForTests,
  addStrategyConnection,
  assertApproved,
  buildBoardBriefing,
  buildChamberBrief,
  buildContinueYourJourney,
  buildProjectHandoff,
  buildStrategyDecisionRecord,
  createStrategyWorkItem,
  decisionRecordSectionHasContent,
  getResumableStrategyWorkItem,
  getStrategyWorkItem,
  listResumableStrategyWorkItems,
  listStrategyConnections,
  listStrategyWorkItems,
  openingQuestionForEntry,
  pauseStrategyWorkItem,
  resumeStrategyWorkItem,
  updateStrategyWorkItem,
} from "@/lib/strategyChamber";

describe("Strategy Chamber foundation", () => {
  beforeEach(() => {
    __resetStrategyChamberStoresForTests();
  });

  it("uses Strategy Chamber as the member-facing title", () => {
    expect(STRATEGY_LIBRARY_TITLE).toBe("Strategy Chamber");
    expect(STRATEGY_CHAMBER_PRIMARY_ENTRIES).toHaveLength(3);
    expect(STRATEGY_CHAMBER_HELP_ME_CHOOSE.id).toBe("help_me_choose");
  });

  it("maps entry choices to the correct entry_reason values", () => {
    expect(STRATEGY_CHAMBER_PRIMARY_ENTRIES[0]!.entryReason).toBe("need_direction");
    expect(STRATEGY_CHAMBER_PRIMARY_ENTRIES[1]!.entryReason).toBe(
      "important_decision",
    );
    expect(STRATEGY_CHAMBER_PRIMARY_ENTRIES[2]!.entryReason).toBe(
      "rethink_current_direction",
    );
    expect(STRATEGY_CHAMBER_HELP_ME_CHOOSE.entryReason).toBe("unsure");
  });

  it("provides one opening question per entry reason", () => {
    for (const entry of STRATEGY_CHAMBER_PRIMARY_ENTRIES) {
      const q = openingQuestionForEntry(entry.entryReason);
      expect(q.length).toBeGreaterThan(20);
      expect(q.includes("?")).toBe(true);
    }
    expect(openingQuestionForEntry("unsure")).toMatch(/mind|brought/i);
  });

  it("recommends entry families from natural language", () => {
    expect(
      recommendStrategyLibraryMode("I need to decide between two offers")
        .recommendedEntry,
    ).toBe("important_decision");
    expect(
      recommendStrategyLibraryMode("this direction is not working")
        .recommendedEntry,
    ).toBe("rethink");
    expect(
      recommendStrategyLibraryMode("help me choose where to start")
        .recommendedEntry,
    ).toBe("help_me_choose");
  });

  it("creates, pauses, and resumes one shared work item", () => {
    const created = createStrategyWorkItem({
      entryReason: "need_direction",
      title: "Where should marketing go?",
    });
    expect(listStrategyWorkItems()).toHaveLength(1);
    expect(created.currentStage).toBe("understand_current_state");

    pauseStrategyWorkItem(created.id);
    const resumable = getResumableStrategyWorkItem();
    expect(resumable?.id).toBe(created.id);
    expect(resumable?.status).toBe("paused");

    resumeStrategyWorkItem(created.id);
    expect(getResumableStrategyWorkItem()?.status).toBe("understanding");
  });

  it("pauses prior unfinished work when starting something new", () => {
    const first = createStrategyWorkItem({
      entryReason: "need_direction",
      title: "First question",
    });
    const second = createStrategyWorkItem({
      entryReason: "important_decision",
      title: "Second question",
    });
    expect(listStrategyWorkItems()).toHaveLength(2);
    expect(getStrategyStatus(first.id)).toBe("paused");
    expect(second.status).toBe("understanding");
    const resumable = listResumableStrategyWorkItems();
    expect(resumable[0]?.id).toBe(second.id);
    expect(resumable.some((w) => w.id === first.id)).toBe(true);
  });

  it("does not create duplicate work items when connecting destinations", () => {
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    addStrategyConnection({
      strategyWorkItemId: item.id,
      connectedEntityType: "board_session",
      connectedEntityId: "board_1",
      connectionType: "briefed",
      relationshipSummary: "Board review of options",
      syncDirection: "to_destination",
      memberApproved: true,
    });
    addStrategyConnection({
      strategyWorkItemId: item.id,
      connectedEntityType: "project",
      connectedEntityId: "proj_1",
      connectionType: "handed_off",
      relationshipSummary: "Project for chosen direction",
      syncDirection: "to_destination",
      memberApproved: true,
    });
    expect(listStrategyWorkItems()).toHaveLength(1);
    expect(listStrategyConnections(item.id)).toHaveLength(2);
  });

  it("builds decision record and hides empty optional lists", () => {
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    const updated = updateStrategyWorkItem(item.id, {
      decisionStatement: "Which offer deserves focus?",
      currentReality: "Capacity is stretched across three offers",
      chosenDirection: "Focus on one offer this quarter",
      decisionRationale: "Capacity is limited",
      notChosen: ["Launch three offers at once"],
      assumptions: ["Existing clients still want this"],
      risks: ["Demand softer than expected"],
      successSignals: ["Two discovery calls booked"],
      status: "direction_chosen",
    })!;
    const record = buildStrategyDecisionRecord(updated);
    expect(record.directionYouChose).toMatch(/one offer/i);
    expect(record.whatYouAreNotChoosing).toMatch(/three offers/i);
    expect(record.whatIsHappeningNow).toMatch(/Capacity/i);
    expect(record.whatIsHappeningNow).not.toBe(record.whatYouWereDeciding);
    expect(decisionRecordSectionHasContent("assumptionsToTest", record)).toBe(
      true,
    );
    expect(decisionRecordSectionHasContent("risksToWatch", record)).toBe(true);

    const empty = buildStrategyDecisionRecord(
      createStrategyWorkItem({ entryReason: "need_direction" }),
    );
    expect(decisionRecordSectionHasContent("assumptionsToTest", empty)).toBe(
      false,
    );
    expect(decisionRecordSectionHasContent("whatIsHappeningNow", empty)).toBe(
      false,
    );

    const journey = buildContinueYourJourney(updated);
    expect(journey.recommended).toBeTruthy();
    expect(journey.secondary.length).toBeLessThanOrEqual(2);
  });

  it("does not copy the strategic question into what is happening now", () => {
    const item = createStrategyWorkItem({ entryReason: "important_decision" });
    updateStrategyWorkItem(item.id, {
      decisionStatement: "Should I raise the price of my membership?",
    });
    const record = buildStrategyDecisionRecord(getStrategyWorkItem(item.id)!);
    expect(record.whatYouWereDeciding).toMatch(/raise the price/i);
    expect(record.whatIsHappeningNow).toBe("");
    expect(
      decisionRecordSectionHasContent("whatIsHappeningNow", record),
    ).toBe(false);
  });

  it("requires approval before destination mutation helpers", () => {
    expect(() => assertApproved({ memberApproved: false })).toThrow(/approval/i);
    expect(() => assertApproved({ memberApproved: true })).not.toThrow();
  });

  it("builds handoff payloads that reference the same work item id", () => {
    const item = createStrategyWorkItem({ entryReason: "need_direction" });
    const chamber = buildChamberBrief(item, "What am I missing commercially?");
    const board = buildBoardBriefing(item);
    const project = buildProjectHandoff({
      ...item,
      chosenDirection: "Double down on workshops",
    });
    expect(chamber.strategyWorkItemId).toBe(item.id);
    expect(board.strategyWorkItemId).toBe(item.id);
    expect(project.strategyWorkItemId).toBe(item.id);
  });

  it("keeps legacy saved user strategies accessible", () => {
    expect(Array.isArray(getUserStrategies())).toBe(true);
  });
});

function getStrategyStatus(id: string) {
  return listStrategyWorkItems().find((w) => w.id === id)?.status;
}
