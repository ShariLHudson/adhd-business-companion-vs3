import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { CompanionBrain } from "@/lib/companionBrain";
import { mapFixtureToCompanionMemory } from "@/lib/planMyDay/companionBrainClient/mapFixtureToMemory";
import { CELEBRATION, LOW_ENERGY, NORMAL_TUESDAY } from "@/lib/planMyDay/dailyCompanionCycle/fixtures/simulations";
import {
  formatInvitation,
  formatSingleShariMessage,
  partitionLivingBoard,
  presentPlanDayOrientation,
} from "@/lib/planMyDay/companionBrainClient/presentJudgment";
import {
  markPlanDayLiving,
  readPlanDaySession,
  resetPlanDaySessionForTests,
} from "@/lib/planMyDay/companionBrainClient/planDaySession";
import { materializeConfirmedProposals } from "@/lib/planMyDay/companionBrainClient/materializeProposals";
import type { PlanDayItem } from "@/lib/planMyDay/types";

const lsStore: Record<string, string> = {};

describe("presentPlanDayOrientation", () => {
  it("uses human shari observation and protected invitation wording", () => {
    const memory = mapFixtureToCompanionMemory(NORMAL_TUESDAY);
    const { judgment } = CompanionBrain.runReasoningCycle(memory);
    const presentation = presentPlanDayOrientation(judgment);

    expect(presentation.morningPresence.lines.length).toBeGreaterThan(0);
    expect(presentation.shariMessage).toBeTruthy();
    expect(presentation.shariMessage).not.toMatch(
      /here'?s today — .+ energy, .+ motivation/i,
    );
    expect(presentation.invitation).toMatch(/I think there are \d+ things worth your attention today/i);
    expect(presentation.invitation).toMatch(/\bthink\b/i);
    expect(presentation.invitation).toMatch(/\battention\b/i);
    expect(presentation.proposalPreview.length).toBeGreaterThan(0);
    expect(presentation.proposalPreview.length).toBeLessThanOrEqual(3);
    expect(presentation.confirmPrompt).toBe("Does this feel right for today?");
    expect(presentation.primaryConfirmLabel).toBe("✓ Yes — This feels right");
    expect(presentation.adjustTogetherLabel).toBe("↺ Let's adjust it together");
    expect(presentation.deferLabel).toBe("Not right now");
    expect(presentation.willMaterialize).toBe(true);
  });

  it("uses gentle invitation for survival", () => {
    const memory = mapFixtureToCompanionMemory(LOW_ENERGY);
    const { judgment } = CompanionBrain.runReasoningCycle(memory);
    expect(formatInvitation(judgment)).toMatch(/gentle/i);
  });

  it("celebration is minimal with no materialize", () => {
    const memory = mapFixtureToCompanionMemory(CELEBRATION);
    const { judgment } = CompanionBrain.runReasoningCycle(memory);
    const presentation = presentPlanDayOrientation(judgment);
    expect(presentation.minimalSurface).toBe(true);
    expect(presentation.willMaterialize).toBe(false);
    expect(presentation.invitation).toMatch(/whole story/i);
  });

  it("falls back when judgment predates morning presence", () => {
    const memory = mapFixtureToCompanionMemory(NORMAL_TUESDAY);
    const { judgment } = CompanionBrain.runReasoningCycle(memory);
    const stale = { ...judgment, morningPresence: undefined } as typeof judgment;
    const presentation = presentPlanDayOrientation(stale);

    expect(presentation.morningPresence.lines.length).toBeGreaterThan(0);
    expect(presentation.shariMessage).toBeTruthy();
  });
});

describe("partitionLivingBoard", () => {
  it("groups focus and ready columns", () => {
    const items: PlanDayItem[] = [
      {
        id: "1",
        title: "Anchor task",
        column: "today",
        done: false,
      },
      {
        id: "2",
        title: "Later idea",
        column: "ready",
        done: false,
      },
    ];
    const partition = partitionLivingBoard(items, "Anchor task");
    expect(partition.focus).toHaveLength(1);
    expect(partition.ready).toHaveLength(1);
    expect(partition.focus[0]?.title).toBe("Anchor task");
    expect(partition.holdingCount).toBe(0);
  });

  it("counts parked items as holding", () => {
    const items: PlanDayItem[] = [
      { id: "1", title: "Visible", column: "today", done: false },
      { id: "2", title: "Held", column: "parked", done: false },
      { id: "3", title: "Also held", column: "parked", done: false },
    ];
    const partition = partitionLivingBoard(items, null);
    expect(partition.holdingCount).toBe(2);
    expect(partition.holding).toHaveLength(2);
    expect(partition.focus).toHaveLength(1);
  });
});

describe("resolvePlanDayChapter", () => {
  it("progresses through journey subtitles", async () => {
    const { resolvePlanDayChapter, planDayChapterSubtitle } = await import(
      "@/lib/planMyDay/companionBrainClient/planDayJourney"
    );
    expect(planDayChapterSubtitle(resolvePlanDayChapter({ orienting: true, openItemId: null }))).toBe(
      "Today's Plan",
    );
    expect(
      planDayChapterSubtitle(
        resolvePlanDayChapter({ orienting: false, editingReality: true, openItemId: null }),
      ),
    ).toBe("Today's Reality");
    expect(
      planDayChapterSubtitle(
        resolvePlanDayChapter({ orienting: false, openItemId: null }),
      ),
    ).toBe("Today's Plan");
    expect(
      planDayChapterSubtitle(
        resolvePlanDayChapter({ orienting: false, openItemId: "x", detailMode: "form" }),
      ),
    ).toBe("Working Together");
  });
});

describe("curatePlanBoardForJudgment", () => {
  beforeEach(() => {
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => lsStore[k] ?? null,
      setItem: (k: string, v: string) => {
        lsStore[k] = v;
      },
      removeItem: (k: string) => {
        delete lsStore[k];
      },
    });
    Object.keys(lsStore).forEach((k) => delete lsStore[k]);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("parks excess items beyond focus and ready caps", async () => {
    const { curatePlanBoardForJudgment, FOCUS_CAP, READY_CAP } = await import(
      "@/lib/planMyDay/companionBrainClient/curateLivingBoard"
    );
    const memory = mapFixtureToCompanionMemory(NORMAL_TUESDAY);
    const { judgment } = CompanionBrain.runReasoningCycle(memory);
    const many: PlanDayItem[] = Array.from({ length: FOCUS_CAP + READY_CAP + 5 }, (_, i) => ({
      id: `item-${i}`,
      title: `Task ${i}`,
      column: "today",
      done: false,
    }));
    const curated = curatePlanBoardForJudgment(many, judgment);
    const parked = curated.filter((i) => i.column === "parked");
    expect(parked.length).toBeGreaterThanOrEqual(5);
    const visible = curated.filter((i) => i.column !== "parked" && !i.done);
    expect(visible.length).toBeLessThanOrEqual(FOCUS_CAP + READY_CAP);
  });

  it("preserves all items when under board caps", async () => {
    const { curatePlanBoardForJudgment } = await import(
      "@/lib/planMyDay/companionBrainClient/curateLivingBoard"
    );
    const memory = mapFixtureToCompanionMemory(NORMAL_TUESDAY);
    const { judgment } = CompanionBrain.runReasoningCycle(memory);
    const items: PlanDayItem[] = [
      { id: "1", title: "Call doctor", column: "ready", done: false },
      { id: "2", title: "Finish launch", column: "ready", done: false },
      { id: "3", title: "Email client", column: "ready", done: false },
    ];
    const curated = curatePlanBoardForJudgment(items, judgment);
    expect(curated).toHaveLength(3);
    expect(curated.map((i) => i.title).sort()).toEqual([
      "Call doctor",
      "Email client",
      "Finish launch",
    ]);
  });
});

describe("planDaySession", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => lsStore[k] ?? null,
      setItem: (k: string, v: string) => {
        lsStore[k] = v;
      },
      removeItem: (k: string) => {
        delete lsStore[k];
      },
    });
    resetPlanDaySessionForTests();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    Object.keys(lsStore).forEach((k) => delete lsStore[k]);
  });

  it("starts orienting for new day", () => {
    expect(readPlanDaySession("2026-06-10").phase).toBe("orienting");
  });

  it("marks living after confirmation", () => {
    markPlanDayLiving("2026-06-10");
    expect(readPlanDaySession("2026-06-10").phase).toBe("living");
  });
});

describe("materializeConfirmedProposals", () => {
  beforeEach(() => {
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => lsStore[k] ?? null,
      setItem: (k: string, v: string) => {
        lsStore[k] = v;
      },
      removeItem: (k: string) => {
        delete lsStore[k];
      },
    });
    Object.keys(lsStore).forEach((k) => delete lsStore[k]);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("adds confirmed proposals without duplicates", () => {
    const memory = mapFixtureToCompanionMemory(NORMAL_TUESDAY);
    const { judgment } = CompanionBrain.runReasoningCycle(memory);
    const next = materializeConfirmedProposals(
      [],
      judgment.proposals,
      judgment.momentum.candidateId,
    );
    expect(next.length).toBeGreaterThan(0);
    const again = materializeConfirmedProposals(
      next,
      judgment.proposals,
      judgment.momentum.candidateId,
    );
    expect(again.length).toBe(next.length);
  });
});
