/**
 * Global numbered-choice + overwhelm consent regressions.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  classifyOverwhelmNeed,
  shouldBlockScenicOverwhelmMenu,
} from "@/lib/conversation/overwhelmNeedClassifier";
import { resolveConversationPriority } from "@/lib/conversationIntelligence/priorityEngine";
import { resolveEstateNavigationDisambiguation } from "@/lib/estateExperiences/resolveEstateNavigation";
import { resolveEstateNavigationIntent } from "@/lib/estateNavigationIntelligence";
import { formatEstateNavigationChoiceMenu } from "@/lib/estateExperiences/resolveEstateNavigation";
import {
  detectUniversalCapabilityRequest,
  isVagueNavigationFallback,
} from "@/lib/universalAccess";
import { isBreatheUniversalRequest } from "@/lib/universalAccess/breatheUniversalAccess";
import {
  clearPendingChoice,
  loadPendingChoice,
  registerCognitiveOverloadPendingChoices,
  registerEmotionalRegulationPendingChoices,
  registerPendingChoiceFromExperienceMenu,
  registerPendingChoiceFromNavigation,
  resolvePendingChoiceTurn,
} from "./index";

function installBrowserStorageForTests() {
  const localStore: Record<string, string> = {};
  const sessionStore: Record<string, string> = {};
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => localStore[key] ?? null,
    setItem: (key: string, value: string) => {
      localStore[key] = value;
    },
    removeItem: (key: string) => {
      delete localStore[key];
    },
    clear: () => {
      for (const key of Object.keys(localStore)) delete localStore[key];
    },
  });
  vi.stubGlobal("sessionStorage", {
    getItem: (key: string) => sessionStore[key] ?? null,
    setItem: (key: string, value: string) => {
      sessionStore[key] = value;
    },
    removeItem: (key: string) => {
      delete sessionStore[key];
    },
    clear: () => {
      for (const key of Object.keys(sessionStore)) delete sessionStore[key];
    },
  });
  vi.stubGlobal("window", globalThis);
}

const COGNITIVE = "I have too much on my brain to remember it all.";
const BARE_OVERWHELM = "I'm overwhelmed today.";
const PROJECT_OVERWHELM = "I'm overwhelmed trying to finish this project.";
const CALM_DOWN = "I'm overwhelmed and I need help calming down.";
const SOMEWHERE_PEACEFUL = "Take me somewhere peaceful.";

describe("numbered choice resolution — global", () => {
  beforeEach(() => {
    installBrowserStorageForTests();
    clearPendingChoice();
  });

  it("resolves bare 1/2/3 against registered navigation choices", () => {
    const decision = resolveEstateNavigationIntent(SOMEWHERE_PEACEFUL);
    expect(decision.kind).toBe("offer_choices");
    const choices = (decision.choices ?? []).map((choice, index) => ({
      label: String(index + 1),
      destinationId: choice.placeId,
      displayName: choice.officialDisplayName,
      shortDescription: choice.memberFacingHint,
      confidence: "medium" as const,
      reasonMatched: "test",
    }));
    registerPendingChoiceFromNavigation({
      choices,
      menuText: decision.memberFacingPrompt ?? "",
      queryPhrase: SOMEWHERE_PEACEFUL,
    });

    for (const n of ["1", "2", "3"] as const) {
      registerPendingChoiceFromNavigation({
        choices,
        menuText: decision.memberFacingPrompt ?? "",
        queryPhrase: SOMEWHERE_PEACEFUL,
      });
      const idx = Number(n) - 1;
      if (idx >= choices.length) continue;
      const result = resolvePendingChoiceTurn(n);
      expect(result.kind).toBe("resolved");
      if (result.kind === "resolved") {
        expect(result.choice.destination).toBe(choices[idx]!.destinationId);
        expect(result.reply).not.toMatch(/not sure which option/i);
        expect(isVagueNavigationFallback(result.reply)).toBe(false);
      }
    }
  });

  it("resolves label match and 'the third one'", () => {
    const choices = [
      {
        label: "1",
        destinationId: "lakeside-hammock",
        displayName: "Lakeside Hammock",
        shortDescription: "Rest",
        confidence: "medium" as const,
        reasonMatched: "test",
      },
      {
        label: "2",
        destinationId: "tea-room",
        displayName: "Tea Room",
        shortDescription: "Warm",
        confidence: "medium" as const,
        reasonMatched: "test",
      },
      {
        label: "3",
        destinationId: "reflection-pond",
        displayName: "Reflection Pond",
        shortDescription: "Quiet",
        confidence: "medium" as const,
        reasonMatched: "test",
      },
    ];
    registerPendingChoiceFromNavigation({
      choices,
      menuText: "1. Lakeside Hammock\n2. Tea Room\n3. Reflection Pond",
    });
    const byLabel = resolvePendingChoiceTurn("tea room");
    expect(byLabel.kind).toBe("resolved");
    if (byLabel.kind === "resolved") {
      expect(byLabel.choice.destination).toBe("tea-room");
    }

    registerPendingChoiceFromNavigation({
      choices,
      menuText: "1. Lakeside Hammock\n2. Tea Room\n3. Reflection Pond",
    });
    const byOrdinal = resolvePendingChoiceTurn("the third one");
    expect(byOrdinal.kind).toBe("resolved");
    if (byOrdinal.kind === "resolved") {
      expect(byOrdinal.choice.destination).toBe("reflection-pond");
    }
  });

  it("nested menu replacement — new set replaces old; 4 selects nested option", () => {
    registerPendingChoiceFromExperienceMenu({
      choices: [
        { id: "a", label: "Possibility House", placeId: "possibility-house" },
        { id: "b", label: "Library", placeId: "library" },
        { id: "c", label: "Study Hall", placeId: "study-hall" },
      ],
      menuText: "1. Possibility House\n2. Library\n3. Study Hall",
    });
    const first = loadPendingChoice();
    expect(first?.choices).toHaveLength(3);

    registerPendingChoiceFromExperienceMenu({
      choices: [
        { id: "t1", label: "Treehouse Possibility Studio", placeId: "treehouse" },
        { id: "t2", label: "Ideas Attic", placeId: "ideas-attic" },
        { id: "t3", label: "Sketch Desk", placeId: "sketch-desk" },
        { id: "t4", label: "Possibility Porch", placeId: "possibility-porch" },
      ],
      menuText:
        "1. Treehouse Possibility Studio\n2. Ideas Attic\n3. Sketch Desk\n4. Possibility Porch",
    });
    const nested = loadPendingChoice();
    expect(nested?.choices).toHaveLength(4);
    expect(nested?.pendingChoiceId).not.toBe(first?.pendingChoiceId);

    const pick = resolvePendingChoiceTurn("4");
    expect(pick.kind).toBe("resolved");
    if (pick.kind === "resolved") {
      expect(pick.choice.label).toBe("Possibility Porch");
    }
  });

  it("correction 'Not 3, I meant 2' selects option 2", () => {
    registerCognitiveOverloadPendingChoices({
      menuText: "1. Open Clear My Mind\n2. Let's Do It Here",
    });
    const result = resolvePendingChoiceTurn("Not 3, I meant 2");
    expect(result.kind).toBe("resolved");
    if (result.kind === "resolved") {
      expect(result.choice.id).toBe("stay-in-chat");
    }
  });

  it("cancel phrases clear pending without vague fallback", () => {
    registerCognitiveOverloadPendingChoices({
      menuText: "1. Open Clear My Mind\n2. Let's Do It Here",
    });
    const result = resolvePendingChoiceTurn("none of those");
    expect(result.kind).toBe("cancelled");
    expect(loadPendingChoice()).toBeNull();
    expect(result.reply ?? "").not.toMatch(/bring that up/i);
  });

  it("estate disambiguation registers and resolves 2", () => {
    const d = resolveEstateNavigationDisambiguation("work on my business");
    expect(d).not.toBeNull();
    const menu = formatEstateNavigationChoiceMenu(d!);
    registerPendingChoiceFromExperienceMenu({
      choices: d!.choices.map((choice) => ({
        id: choice.spaceId || choice.experienceId,
        label: choice.headline,
        description: choice.detail,
        placeId: choice.spaceId,
      })),
      menuText: menu,
      queryPhrase: "work on my business",
    });
    const result = resolvePendingChoiceTurn("2");
    expect(result.kind).toBe("resolved");
    if (result.kind === "resolved") {
      expect(result.choice.label).toBe(d!.choices[1]!.headline);
    }
  });

  it("cognitive overload 2 stays in chat", () => {
    expect(classifyOverwhelmNeed(COGNITIVE)).toBe("cognitive_overload");
    registerCognitiveOverloadPendingChoices({
      menuText: `reply\n\n1. Open Clear My Mind\n2. Let's Do It Here`,
    });
    const result = resolvePendingChoiceTurn("2");
    expect(result.kind).toBe("resolved");
    if (result.kind === "resolved") {
      expect(result.action.kind).toBe("stay_in_chat");
    }
  });

  it("emotional regulation 2 opens breathe only after selection", () => {
    registerEmotionalRegulationPendingChoices({
      menuText:
        "Would you like:\n1. Calming audio\n2. A breathing reset\n3. Stay here with me",
    });
    const result = resolvePendingChoiceTurn("2");
    expect(result.kind).toBe("resolved");
    if (result.kind === "resolved") {
      expect(result.action.section).toBe("breathe");
      expect(isVagueNavigationFallback(result.reply)).toBe(false);
      expect(result.reply).toMatch(/breathe|breathing/i);
    }
  });

  it("priority engine keeps numbered selection over emotional clear", () => {
    registerEmotionalRegulationPendingChoices({
      menuText:
        "Would you like:\n1. Calming audio\n2. A breathing reset\n3. Stay here with me",
    });
    const state = loadPendingChoice();
    expect(state).not.toBeNull();
    const verdict = resolveConversationPriority({
      userText: "2",
      lastAssistantText:
        "A lot is landing at once — we can slow this down together.\n\nWould you like:\n1. Calming audio\n2. A breathing reset\n3. Stay here with me",
      currentTurn: 4,
      hasUniversalCreationSession: false,
      pendingChoiceState: state,
    });
    expect(verdict.winner).toBe("pending_choice");
    expect(verdict.deferPendingChoice).toBe(false);
  });
});

describe("overwhelm routing — no auto Breathe", () => {
  it("bare overwhelm never auto-launches Breathe or vague ack", () => {
    expect(isBreatheUniversalRequest(BARE_OVERWHELM)).toBe(false);
    expect(detectUniversalCapabilityRequest(BARE_OVERWHELM)).toBeNull();
    expect(shouldBlockScenicOverwhelmMenu(BARE_OVERWHELM)).toBe(true);
  });

  it("project overwhelm is task help, not Breathe", () => {
    expect(classifyOverwhelmNeed(PROJECT_OVERWHELM)).toBe("task_breakdown");
    expect(isBreatheUniversalRequest(PROJECT_OVERWHELM)).toBe(false);
    expect(detectUniversalCapabilityRequest(PROJECT_OVERWHELM)).toBeNull();
  });

  it("calm-down language does not auto-open Breathe (consent required)", () => {
    expect(isBreatheUniversalRequest(CALM_DOWN)).toBe(false);
    expect(detectUniversalCapabilityRequest(CALM_DOWN)).toBeNull();
    expect(detectUniversalCapabilityRequest("I need to calm down")).toBeNull();
    expect(detectUniversalCapabilityRequest("Calm me down")).toBeNull();
  });

  it("direct breathe commands still open Breathe with contextual ack", () => {
    const req = detectUniversalCapabilityRequest("Take me to Breathe");
    expect(req?.capabilityId).toBe("breathe");
    expect(isVagueNavigationFallback(req?.ack ?? "")).toBe(false);
    expect(req?.ack).toMatch(/breathe/i);

    expect(
      detectUniversalCapabilityRequest("Start a breathing exercise")
        ?.capabilityId,
    ).toBe("breathe");
    expect(
      detectUniversalCapabilityRequest("Let's do a breathing reset")
        ?.capabilityId,
    ).toBe("breathe");
  });

  it("fulfill lines never include I'll bring that up", () => {
    for (const phrase of [
      "Open Clear My Mind",
      "Take me to Breathe",
      "Open Plan My Day",
      "Open calendar",
    ]) {
      const req = detectUniversalCapabilityRequest(phrase);
      if (!req) continue;
      expect(isVagueNavigationFallback(req.ack)).toBe(false);
    }
  });
});
