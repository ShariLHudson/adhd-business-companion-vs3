/**
 * Visual Thinking Studio — request-first foundation tests (Build 1).
 * @vitest-environment jsdom
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import {
  CARTOGRAPHERS_STUDIO_BACKGROUND,
} from "@/lib/cartographersStudio/media";
import {
  VISUAL_THINKING_STUDIO_TITLE,
  applyHelpDepth,
  applyRequestText,
  applyUserControl,
  clearVisualThinkingRequestDraft,
  confirmRecommendation,
  createVisualThinkingRequest,
  detectHelpDepth,
  detectRequestedOutput,
  detectsDeclinesMap,
  detectsUserLedVisual,
  detectsWantsVisualAlso,
  recommendOutputs,
  shouldShowRequestFirstExperience,
  visibleDepthChoices,
} from "@/lib/cartographersStudio/visualThinkingRequest";
import {
  __resetAdaptiveCompanionExplicitPrefsForTests,
  patchAdaptiveCompanionExplicitPrefs,
} from "@/lib/adaptiveCompanionIntelligence";

describe("Visual Thinking Studio request-first foundation", () => {
  beforeEach(() => {
    clearVisualThinkingRequestDraft();
    __resetAdaptiveCompanionExplicitPrefsForTests();
  });

  it("opens with the new request-first experience when no active item", () => {
    expect(
      shouldShowRequestFirstExperience({
        hasActiveMap: false,
        hasPendingMapOverlay: false,
      }),
    ).toBe(true);
    expect(
      shouldShowRequestFirstExperience({
        hasActiveMap: true,
        hasPendingMapOverlay: false,
      }),
    ).toBe(false);
    expect(VISUAL_THINKING_STUDIO_TITLE).toBe("Visual Thinking Studio");
  });

  it("keeps the current Cartography background image", () => {
    expect(CARTOGRAPHERS_STUDIO_BACKGROUND).toBe(
      "/backgrounds/cartoghraphers-studio-background.png",
    );
    const panel = readFileSync(
      join(
        process.cwd(),
        "components/companion/cartographersStudio/VisualThinkingRequestPanel.tsx",
      ),
      "utf8",
    );
    expect(panel).toContain("CARTOGRAPHERS_STUDIO_BACKGROUND");
    const room = readFileSync(
      join(
        process.cwd(),
        "components/companion/cartographersStudio/CartographersStudioRoom.tsx",
      ),
      "utf8",
    );
    expect(room).toContain("CARTOGRAPHERS_STUDIO_BACKGROUND");
  });

  it("lets a user describe a request in ordinary language", () => {
    const req = applyRequestText(
      createVisualThinkingRequest({}),
      "Show me how to make a Loom video.",
    );
    expect(req.rawRequest).toMatch(/Loom video/i);
    expect(req.provisionalIntent).toBe("create_process");
    expect(req.status === "preview" || req.status === "awaiting_depth").toBe(
      true,
    );
  });

  it("recognizes explicit detail requests without asking again", () => {
    expect(
      detectHelpDepth("Show me how to create a Loom video. I need every step."),
    ).toBe("detailed");
    const req = applyRequestText(
      createVisualThinkingRequest({}),
      "Show me how to create a Loom video. I need every step.",
    );
    expect(req.requestedDepth).toBe("detailed");
    expect(req.status).toBe("preview");
  });

  it("asks one simple depth question when detail level is unclear", () => {
    // Ambiguous ask without authorizing create/teach/research language.
    const req = applyRequestText(
      createVisualThinkingRequest({}),
      "Something about small businesses and options.",
    );
    expect(req.requestedDepth).toBe("unspecified");
    expect(req.status).toBe("awaiting_depth");
    const withDepth = applyHelpDepth(req, "guided");
    expect(withDepth.status).toBe("preview");
    expect(withDepth.recommendationSummary.length).toBeGreaterThan(10);
  });

  it("generate-first: clear research request infers depth and skips depth screen", () => {
    const req = applyRequestText(
      createVisualThinkingRequest({}),
      "Research artificial intelligence for small businesses.",
    );
    expect(req.status).toBe("preview");
    expect(req.requestedDepth).not.toBe("unspecified");
  });

  it("honors explicit output requests", () => {
    expect(detectRequestedOutput("I need a report, not a map.")).toBe("report");
    const req = applyRequestText(
      createVisualThinkingRequest({}),
      "I need a report, not a map.",
    );
    expect(req.requestedOutput).toBe("report");
    expect(req.recommendedPrimaryOutput).toBe("report");
  });

  it("lets a user decline a map", () => {
    expect(detectsDeclinesMap("I need a report, not a map.")).toBe(true);
    const req = applyRequestText(
      createVisualThinkingRequest({}),
      "I need a report, not a map.",
    );
    expect(req.declinesMap).toBe(true);
    expect(req.recommendedPrimaryOutput).not.toBe("visual_thinking_map");
    expect(req.recommendedSupportingOutputs).not.toContain(
      "visual_thinking_map",
    );
  });

  it("lets a user request a visual in addition to a written result", () => {
    expect(
      detectsWantsVisualAlso("Give me a guide and show it visually too."),
    ).toBe(true);
    const req = applyRequestText(
      createVisualThinkingRequest({}),
      "Give me a step-by-step guide and show it visually too.",
    );
    expect(req.wantsVisualAlso).toBe(true);
    expect(
      req.recommendedSupportingOutputs.includes("process_flow") ||
        req.recommendedPrimaryOutput === "process_flow" ||
        req.recommendedPrimaryOutput === "visual_thinking_map",
    ).toBe(true);
  });

  it("recommends an appropriate initial form when no format is requested", () => {
    const loom = recommendOutputs({
      rawRequest: "Show me how to create a Loom video. I need every step.",
      provisionalIntent: "create_process",
      requestedDepth: "detailed",
      requestedOutput: null,
      declinesMap: false,
      wantsVisualAlso: false,
    });
    expect(loom.primary).toBe("step_by_step_guide");
    expect(loom.supporting).toEqual(
      expect.arrayContaining(["process_flow", "checklist"]),
    );

    const unsure = applyRequestText(
      createVisualThinkingRequest({}),
      "I don't know what would be best.",
    );
    expect(unsure.recommendedPrimaryOutput).toBeTruthy();
    expect(unsure.recommendationSummary.length).toBeGreaterThan(12);
  });

  it("requires confirmation before major generation", () => {
    const req = applyRequestText(
      createVisualThinkingRequest({}),
      "Show me how to create a Loom video. I need every step.",
    );
    expect(req.userConfirmed).toBe(false);
    expect(req.status).toBe("preview");
    const confirmed = confirmRecommendation(req);
    expect(confirmed.userConfirmed).toBe(true);
    expect(confirmed.status).toBe("confirmed");
  });

  it("can make the planned result simpler without restarting intake", () => {
    const req = applyRequestText(
      createVisualThinkingRequest({}),
      "Show me how to create a Loom video. I need every step.",
    );
    const simpler = applyUserControl(req, "simplify");
    expect(simpler.requestedDepth).toBe("essentials");
    expect(simpler.status).toBe("preview");
    expect(simpler.rawRequest).toBe(req.rawRequest);
    expect(simpler.recommendationSummary).toMatch(/essential/i);
  });

  it("can request more detail without restarting intake", () => {
    const req = applyHelpDepth(
      applyRequestText(
        createVisualThinkingRequest({}),
        "Help me understand my marketing process.",
      ),
      "guided",
    );
    const deeper = applyUserControl(req, "add_detail");
    expect(deeper.requestedDepth).toBe("detailed");
    expect(deeper.status).toBe("preview");
    expect(deeper.rawRequest).toBe(req.rawRequest);
  });

  it("preserves distinct Create My Own Visual and Research entry paths", () => {
    expect(detectsUserLedVisual("I want to make my own map of my business.")).toBe(
      true,
    );
    const own = createVisualThinkingRequest({
      rawRequest: "I want to make my own map of my business.",
      entryPath: "user_led_visual",
    });
    expect(own.entryPath).toBe("user_led_visual");
    expect(own.status).toBe("user_led");
    expect(own.provisionalIntent).toBe("user_led_map");

    const research = createVisualThinkingRequest({
      rawRequest: "",
      entryPath: "research_assisted",
    });
    expect(research.entryPath).toBe("research_assisted");
    expect(research.status).toBe("research_intake");

    const fromWords = applyRequestText(
      createVisualThinkingRequest({}),
      "I want to make my own map of my business.",
    );
    expect(fromWords.entryPath).toBe("user_led_visual");
    expect(fromWords.status).toBe("user_led");
  });

  it("reduced-choice presentation does not reduce requested depth quality", () => {
    patchAdaptiveCompanionExplicitPrefs({ choiceLoad: "one" });
    const choices = visibleDepthChoices();
    expect(choices.visible.length).toBeLessThanOrEqual(3);
    expect(choices.fullDetailAvailable).toBe(true);

    const detailed = applyRequestText(
      createVisualThinkingRequest({}),
      "Research this deeply and give me an expert-level report.",
    );
    expect(detailed.requestedDepth).toBe("detailed");
    expect(detailed.recommendedPrimaryOutput).toBe("report");
  });

  it("does not modify existing map or research record modules", () => {
    const store = readFileSync(
      join(process.cwd(), "lib/visualFocus/store.ts"),
      "utf8",
    );
    expect(store).toContain("companion-visual-focus-maps-v1");
    const requestModule = readFileSync(
      join(
        process.cwd(),
        "lib/cartographersStudio/visualThinkingRequest.ts",
      ),
      "utf8",
    );
    expect(requestModule).not.toContain("companion-visual-focus-maps-v1");
    expect(requestModule).toContain(
      "companion-visual-thinking-request-draft-v1",
    );
  });
});

describe("Browser validation scenarios A–E (logic)", () => {
  it("A — Loom every step: no depth question; detailed step-by-step + supporting", () => {
    const req = applyRequestText(
      createVisualThinkingRequest({}),
      "Show me how to create a Loom video. I need every step.",
    );
    expect(req.status).toBe("preview");
    expect(req.requestedDepth).toBe("detailed");
    expect(req.recommendedPrimaryOutput).toBe("step_by_step_guide");
    expect(req.recommendedSupportingOutputs).toEqual(
      expect.arrayContaining(["process_flow", "checklist"]),
    );
  });

  it("B — Research AI: generate-first skips depth; research result recommended", () => {
    const req = applyRequestText(
      createVisualThinkingRequest({}),
      "Research artificial intelligence for small businesses.",
    );
    expect(req.status).toBe("preview");
    expect(req.provisionalIntent).toBe("research_topic");
    expect(req.recommendedPrimaryOutput).toBe("report");
  });

  it("C — Own map: user-led path; no research; no map-type choice required", () => {
    const req = applyRequestText(
      createVisualThinkingRequest({}),
      "I want to make my own map of my business.",
    );
    expect(req.status).toBe("user_led");
    expect(req.entryPath).toBe("user_led_visual");
    expect(req.provisionalIntent).toBe("user_led_map");
  });

  it("D — Report not map: honor report; map not required", () => {
    const req = applyRequestText(
      createVisualThinkingRequest({}),
      "I need a report, not a map.",
    );
    expect(req.requestedOutput).toBe("report");
    expect(req.declinesMap).toBe(true);
    expect(req.recommendedPrimaryOutput).toBe("report");
  });

  it("E — Don't know: recommend one primary form with a brief why", () => {
    const req = applyRequestText(
      createVisualThinkingRequest({}),
      "I don't know what would be best.",
    );
    expect(req.recommendedPrimaryOutput).toBeTruthy();
    expect(req.recommendationSummary.length).toBeGreaterThan(16);
  });
});
