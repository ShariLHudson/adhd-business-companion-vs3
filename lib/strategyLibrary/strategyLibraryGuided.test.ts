/**
 * 128–132 — Strategy Library guided entrance, detail, create, connections.
 */

import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  STRATEGY_LIBRARY_HOW_DO_I,
  STRATEGY_LIBRARY_MODE_CHOICES,
  recommendStrategyLibraryMode,
} from "./estateCopy";
import {
  buildStrategyDetailViewModel,
  shouldOfferBoardReview,
  shouldOfferVisualThinking,
} from "./strategyDetailTemplate";
import {
  GUIDED_CREATE_STAGES,
  buildGuidedStrategyDraft,
  canAdvanceGuidedCreate,
  nextGuidedCreateStage,
  EMPTY_GUIDED_CREATE,
} from "./guidedCreate";
import { questionsForStrategy } from "@/lib/strategyApplyCoach";
import { STRATEGIES } from "@/lib/strategySystem";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function read(pathFromRoot: string): string {
  return readFileSync(resolve(process.cwd(), pathFromRoot), "utf8");
}

describe("Strategy Library guided entrance (128)", () => {
  it("uses plain-language mode labels with explanations", () => {
    expect(STRATEGY_LIBRARY_MODE_CHOICES.map((m) => m.id)).toEqual([
      "apply",
      "browse",
      "create",
      "resume",
    ]);
    expect(STRATEGY_LIBRARY_MODE_CHOICES[0]!.label).toMatch(/Problem/i);
    expect(STRATEGY_LIBRARY_MODE_CHOICES[1]!.label).toMatch(/Explore/i);
    expect(STRATEGY_LIBRARY_MODE_CHOICES[2]!.label).toMatch(/Build/i);
    expect(STRATEGY_LIBRARY_MODE_CHOICES[3]!.label).toMatch(/Continue/i);
    for (const mode of STRATEGY_LIBRARY_MODE_CHOICES) {
      expect(mode.description.length).toBeGreaterThan(40);
    }
    expect(STRATEGY_LIBRARY_HOW_DO_I).toMatch(/Problem and Need Help/i);
    expect(STRATEGY_LIBRARY_HOW_DO_I).toMatch(/Explore Ideas/i);
  });

  it("recommends a path from wording", () => {
    expect(recommendStrategyLibraryMode(null).recommendedMode).toBe("apply");
    expect(recommendStrategyLibraryMode("browse strategies").recommendedMode).toBe(
      "browse",
    );
    expect(
      recommendStrategyLibraryMode("build my own strategy").recommendedMode,
    ).toBe("create");
    expect(
      recommendStrategyLibraryMode("continue where I left off").recommendedMode,
    ).toBe("resume");
  });
});

describe("Strategy detail template (128)", () => {
  it("includes required sections for a catalog strategy", () => {
    const s = STRATEGIES[0]!;
    const vm = buildStrategyDetailViewModel(s);
    expect(vm.helpsWith).toBeTruthy();
    expect(vm.whenToUse).toBeTruthy();
    expect(vm.whenNotToUse).toBeTruthy();
    expect(vm.whyItWorks).toBeTruthy();
    expect(vm.situationApplication).toMatch(/first/i);
    expect(vm.firstStep).toBeTruthy();
    expect(vm.steps.length).toBeGreaterThan(0);
    expect(vm.chamber.length).toBeGreaterThan(0);
    expect(vm.commonProblems).toBeTruthy();
    expect(vm.howToAdapt).toBeTruthy();
    expect(vm.howToKnowWorking).toBeTruthy();
  });

  it("offers Board / Visual when useful", () => {
    const pricing = STRATEGIES.find((s) => s.categoryId === "pricing");
    if (pricing) {
      expect(shouldOfferBoardReview(pricing)).toBe(true);
    }
    const long = STRATEGIES.find((s) => s.steps.length >= 4);
    if (long) {
      expect(shouldOfferVisualThinking(long)).toBe(true);
    }
  });

  it("renders detail template and scroll owners in panel", () => {
    const panel = read("components/companion/StrategiesPanel.tsx");
    expect(panel).toContain("strategy-detail-template");
    expect(panel).toContain("What This Strategy Helps With");
    expect(panel).toContain("When Not to Use It");
    expect(panel).toContain("strategy-chamber-contribution");
    expect(panel).toContain("StrategyExecutionConnections");
    expect(panel).toContain("StrategyGuidedCreatePanel");
    expect(panel).toContain("overflow-y-auto");
  });
});

describe("Guided create stages (128)", () => {
  it("covers progressive create stages without a blank form start", () => {
    expect(GUIDED_CREATE_STAGES.map((s) => s.id)).toEqual([
      "problem",
      "success",
      "constraints",
      "knowledge",
      "options",
      "chamber",
      "board",
      "visual",
      "build",
      "connect",
      "review",
    ]);
    const create = read("components/companion/StrategyGuidedCreatePanel.tsx");
    expect(create).toContain("No blank form");
    expect(create).toContain("strategy-guided-create");
  });

  it("advances and builds a draft", () => {
    let answers = {
      ...EMPTY_GUIDED_CREATE,
      happening: "I keep avoiding client follow-up",
      outcome: "Send one clear next message",
      approachChoice: "Smallest first step",
      title: "Follow-up without dread",
      steps: "Open the thread\nWrite three lines\nSend",
      boardChoice: "skip" as const,
      visualChoice: "skip" as const,
    };
    expect(canAdvanceGuidedCreate("problem", answers)).toBe(true);
    expect(nextGuidedCreateStage("problem", answers)).toBe("success");
    const draft = buildGuidedStrategyDraft(answers);
    expect(draft.title).toMatch(/Follow-up/);
    expect(draft.steps.length).toBe(3);
  });
});

describe("Apply personalization (128)", () => {
  it("prepends situation questions before strategy steps", () => {
    const s = STRATEGIES[0]!;
    const qs = questionsForStrategy(s);
    expect(qs[0]!.id).toBe("confirm-problem");
    expect(qs[1]!.id).toBe("desired-outcome");
    expect(qs[2]!.id).toBe("constraints");
    expect(qs.length).toBeGreaterThan(3);
  });
});

describe("Execution connections (128)", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    });
  });

  it("exposes Plan My Day, Project, Reminder, Rhythm actions in UI", () => {
    const ui = read("components/companion/StrategyExecutionConnections.tsx");
    expect(ui).toContain("Add to Plan My Day");
    expect(ui).toContain("Connect to Project");
    expect(ui).toContain("Create Reminder");
    expect(ui).toContain("Create Rhythm");
    expect(ui).toContain("Review with Board");
    expect(ui).toContain("Visualize This");
  });
});
