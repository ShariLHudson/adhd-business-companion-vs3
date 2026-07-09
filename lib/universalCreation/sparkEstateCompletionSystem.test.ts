import { beforeEach, describe, expect, it, vi } from "vitest";

import { pluginById } from "./documentRegistry";
import { formatCompletionMenu } from "./phases";
import { formatPostDraftReviewPrompt } from "./guidedCreationFlow";
import {
  buildSparkEstateCompletionMetadata,
  chamberProjectCompletionMatchesEstateSystem,
  connectionTargetsForArchetype,
  formatSparkEstateCompletionReport,
  formatSparkEstateOutputMenu,
  formatSparkEstateReviewPrompt,
  getSparkEstateReviewHistory,
  mapUniversalPhaseToCompletionStep,
  recordSparkEstateReviewVersion,
  SPARK_ESTATE_COMPLETION_ADHD_RULES,
  SPARK_ESTATE_COMPLETION_JOURNEY_HEADLINE,
  SPARK_ESTATE_COMPLETION_PRINCIPLE,
  SPARK_ESTATE_COMPLETION_STEPS,
  SPARK_ESTATE_OUTPUT_OPTIONS,
  SPARK_ESTATE_REVIEW_QUESTIONS,
  SPARK_ESTATE_UNIVERSAL_ROOM_COMPLETION_EXAMPLES,
  sparkEstateCompletionCompanionHint,
  verifySparkEstateCompletionSystem,
} from "./sparkEstateCompletionSystem";
import { completeChamberProject, createChamberProject } from "@/lib/estate/chamberProjectEngine";

function seedLocalStorage() {
  const mem = new Map<string, string>();
  const storage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => {
      mem.set(k, v);
    },
    removeItem: (k: string) => {
      mem.delete(k);
    },
    clear: () => {
      mem.clear();
    },
  };
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("window", {
    dispatchEvent: vi.fn(),
    localStorage: storage,
  });
}

describe("sparkEstateCompletionSystem", () => {
  it("defines the completion journey after creation", () => {
    const verification = verifySparkEstateCompletionSystem();
    expect(verification.stepCount).toBe(6);
    expect(verification.hasRememberStep).toBe(true);
    expect(verification.outputOptionCount).toBe(5);
    expect(verification.reviewQuestionsReady).toBe(true);
    expect(verification.connectionRulesReady).toBe(true);
    expect(verification.universalRoomRuleReady).toBe(true);
    expect(SPARK_ESTATE_COMPLETION_PRINCIPLE).toContain("journey");
    expect(SPARK_ESTATE_COMPLETION_JOURNEY_HEADLINE).toContain("Remember");
    expect(SPARK_ESTATE_COMPLETION_STEPS.map((step) => step.id)).toEqual([
      "create",
      "review",
      "improve",
      "finalize",
      "output",
      "remember",
    ]);
    expect(chamberProjectCompletionMatchesEstateSystem()).toBe(true);
  });

  it("maps universal creation phases to completion steps", () => {
    expect(mapUniversalPhaseToCompletionStep("review")).toBe("review");
    expect(mapUniversalPhaseToCompletionStep("revision")).toBe("improve");
    expect(mapUniversalPhaseToCompletionStep("approval")).toBe("finalize");
    expect(mapUniversalPhaseToCompletionStep("completion")).toBe("output");
  });

  it("formats review prompts and output menus with connection rules", () => {
    expect(formatSparkEstateReviewPrompt()).toContain(
      "Does this accomplish what you wanted?",
    );
    expect(formatPostDraftReviewPrompt()).toContain("sound like you");

    const menu = formatSparkEstateOutputMenu({ archetype: "email" });
    expect(menu).toContain("Save");
    expect(menu).toContain("Share");
    expect(menu).toContain("campaign");

    const plugin = pluginById("email")!;
    const pluginMenu = formatCompletionMenu(plugin);
    expect(pluginMenu).toContain("Copy text");
    expect(pluginMenu).toContain("Export");
    expect(connectionTargetsForArchetype("funnel")).toContain("strategy");
  });

  it("records review history and completion metadata", () => {
    seedLocalStorage();
    localStorage.clear();

    const metadata = buildSparkEstateCompletionMetadata({
      title: "Launch Workshop",
      purpose: "Help ADHD entrepreneurs move forward",
      archetype: "project",
      version: 2,
    });
    expect(metadata.version).toBe(2);
    expect(metadata.title).toBe("Launch Workshop");

    const entry = recordSparkEstateReviewVersion({
      creationId: "project-1",
      title: "Launch Workshop",
      archetype: "project",
      summary: "Defined the workshop purpose",
      changeNote: "Clarified audience",
    });
    expect(entry.version).toBe(1);

    const history = getSparkEstateReviewHistory("project-1");
    expect(history?.entries[0]?.summary).toContain("Defined the workshop purpose");
  });

  it("documents ADHD-friendly completion rules and output options", () => {
    expect(SPARK_ESTATE_REVIEW_QUESTIONS.length).toBeGreaterThanOrEqual(4);
    expect(SPARK_ESTATE_OUTPUT_OPTIONS.map((option) => option.id)).toEqual([
      "save",
      "export",
      "print",
      "share",
      "continue",
    ]);
    expect(SPARK_ESTATE_COMPLETION_ADHD_RULES.length).toBeGreaterThanOrEqual(4);
    expect(SPARK_ESTATE_UNIVERSAL_ROOM_COMPLETION_EXAMPLES).toHaveLength(3);
  });

  it("formats a completion report and companion hint", () => {
    const report = formatSparkEstateCompletionReport();
    expect(report).toContain("Completion steps");
    expect(report).toContain("Universal room examples");
    expect(report).toContain("Integration checks");

    const hint = sparkEstateCompletionCompanionHint({
      text: "I think this is ready to save",
    });
    expect(hint).toContain("COMPLETION");
    expect(hint).toContain("save");
  });
});

describe("chamber completion integration", () => {
  beforeEach(() => {
    seedLocalStorage();
    localStorage.clear();
  });

  it("captures project completion into estate review history", () => {
    const project = createChamberProject({
      name: "Workshop",
      desiredOutcome: "Create a workshop",
      nextAction: "Define workshop purpose",
    });

    completeChamberProject(
      project.id,
      "Defined the workshop purpose",
      "Clarified the audience",
    );

    const history = getSparkEstateReviewHistory(project.id);
    expect(history?.entries[0]?.summary).toBe("Defined the workshop purpose");
    expect(history?.entries[0]?.changeNote).toBe("Clarified the audience");
  });
});
