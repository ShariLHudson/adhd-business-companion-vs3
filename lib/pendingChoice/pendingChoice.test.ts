import { describe, expect, it, beforeEach, vi } from "vitest";
import { recommendCapabilitiesForGoal } from "@/lib/estateCapabilityRegistry/goalRecommendations";
import { formatRecommendationLine } from "@/lib/estateCapabilityRegistry/goalRecommendations";
import {
  saveUniversalCreationSession,
  clearUniversalCreationSession,
} from "@/lib/universalCreation/orchestrator";
import {
  clearPendingChoice,
  loadPendingChoice,
  parsePendingChoiceSelection,
  registerPendingChoiceFromConcierge,
  registerPendingChoiceFromPlaceIds,
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

describe("pendingChoice manager", () => {
  beforeEach(() => {
    installBrowserStorageForTests();
    clearPendingChoice();
    clearUniversalCreationSession();
  });

  function registerFocusMenu() {
    const rec = recommendCapabilitiesForGoal("I need to focus");
    expect(rec).not.toBeNull();
    const menuText = formatRecommendationLine(rec!.goalSummary, rec!.options);
    registerPendingChoiceFromConcierge({
      goalSummary: rec!.goalSummary,
      options: rec!.options,
      menuText,
    });
    return { rec: rec!, menuText };
  }

  it('resolves "2" to Quiet Music for focus menu', () => {
    registerFocusMenu();
    const result = resolvePendingChoiceTurn("2");
    expect(result.kind).toBe("resolved");
    if (result.kind === "resolved") {
      expect(result.choice.capability).toBe("focus.music");
      expect(result.action.kind).toBe("open_focus_audio");
    }
    expect(loadPendingChoice()).toBeNull();
  });

  it('resolves "the coffee one" to Coffee House', () => {
    registerFocusMenu();
    const result = resolvePendingChoiceTurn("the coffee one");
    expect(result.kind).toBe("resolved");
    if (result.kind === "resolved") {
      expect(result.choice.capability).toBe("place.coffee-house");
      expect(result.action.placeId).toBe("coffee-house");
    }
  });

  it('resolves "first" to Time Block', () => {
    registerFocusMenu();
    const result = resolvePendingChoiceTurn("first");
    expect(result.kind).toBe("resolved");
    if (result.kind === "resolved") {
      expect(result.choice.capability).toBe("focus.timer");
    }
  });

  it('clears pending on "actually never mind"', () => {
    registerFocusMenu();
    const result = resolvePendingChoiceTurn("actually never mind");
    expect(result.kind).toBe("cancelled");
    expect(loadPendingChoice()).toBeNull();
  });

  it("clears pending and yields topic change for new CREATE workflow", () => {
    registerFocusMenu();
    const text = "I need help writing an SOP";
    const result = resolvePendingChoiceTurn(text);
    expect(result.kind).toBe("topic_change");
    expect(loadPendingChoice()).toBeNull();
  });

  it('does not hijack explicit navigation while coffee menu is pending', () => {
    registerPendingChoiceFromPlaceIds({
      placeIds: ["coffee-house", "tea-room", "dining-room"],
      menuText:
        "1. Coffee House\n2. Tea Room\n3. Dining Room\nJust tell me which one.",
    });
    const result = resolvePendingChoiceTurn("Take me to the Music Room");
    expect(result.kind).toBe("topic_change");
    expect(loadPendingChoice()).toBeNull();
  });

  it("re-shows menu on unrecognized short reply", () => {
    const { menuText } = registerFocusMenu();
    const result = resolvePendingChoiceTurn("maybe purple");
    expect(result.kind).toBe("unrecognized");
    if (result.kind === "unrecognized") {
      expect(result.reply).toMatch(/not sure which option/i);
      expect(result.menuText).toContain("1.");
    }
    expect(loadPendingChoice()).not.toBeNull();
    expect(menuText).toMatch(/Time Block|Quiet Music/i);
  });
});

describe("pendingChoice — meta questions and false ordinals", () => {
  beforeEach(() => {
    installBrowserStorageForTests();
    clearPendingChoice();
  });

  const choices = [
    {
      id: "coffee-house",
      label: "Coffee House",
      destination: "coffee-house",
      callback: { kind: "navigate_place" as const, placeId: "coffee-house" },
    },
    {
      id: "library",
      label: "Library",
      destination: "library",
      callback: { kind: "navigate_place" as const, placeId: "library" },
    },
    {
      id: "observatory",
      label: "Observatory",
      destination: "observatory",
      callback: { kind: "navigate_place" as const, placeId: "observatory" },
    },
  ];

  it.each([
    "are these the only three places?",
    "are these the only 3 places?",
    "what are the three places?",
  ])('does not treat "%s" as option 3', (text) => {
    expect(parsePendingChoiceSelection(text, choices)).toBeNull();
    registerPendingChoiceFromPlaceIds({
      placeIds: ["coffee-house", "library", "observatory"],
      menuText: "1. Coffee House\n2. Library\n3. Observatory",
    });
    const result = resolvePendingChoiceTurn(text);
    expect(result.kind).toBe("continued");
    if (result.kind === "continued") {
      expect(result.reply).toMatch(/many places|starting sample|whole map/i);
    }
    expect(loadPendingChoice()).not.toBeNull();
  });
});

describe("pendingChoice — valid numeric selection preserved", () => {
  beforeEach(() => {
    installBrowserStorageForTests();
    clearPendingChoice();
  });

  function registerThreePlaceMenu() {
    registerPendingChoiceFromPlaceIds({
      placeIds: ["coffee-house", "library", "observatory"],
      menuText: "1. Coffee House\n2. Library\n3. Observatory",
    });
  }

  it('resolves bare "3" to Observatory', () => {
    registerThreePlaceMenu();
    const result = resolvePendingChoiceTurn("3");
    expect(result.kind).toBe("resolved");
    if (result.kind === "resolved") {
      expect(result.action.placeId).toBe("observatory");
    }
  });

  it('resolves "number 3" to Observatory', () => {
    registerThreePlaceMenu();
    const result = resolvePendingChoiceTurn("number 3");
    expect(result.kind).toBe("resolved");
    if (result.kind === "resolved") {
      expect(result.action.placeId).toBe("observatory");
    }
  });
});

describe("pendingChoice — affirmations and expansion", () => {
  beforeEach(() => {
    installBrowserStorageForTests();
    clearPendingChoice();
  });

  it('"yes those spaces" continues the list conversation', () => {
    registerPendingChoiceFromPlaceIds({
      placeIds: ["coffee-house", "library", "observatory"],
      menuText: "1. Coffee House\n2. Library\n3. Observatory",
    });
    const result = resolvePendingChoiceTurn("yes those spaces");
    expect(result.kind).toBe("continued");
    if (result.kind === "continued") {
      expect(result.reply).toMatch(/which one feels right/i);
      expect(result.reply).not.toMatch(/not sure which option/i);
    }
    expect(loadPendingChoice()).not.toBeNull();
  });

  it('"tell me more places" expands instead of repeating the same three', () => {
    registerPendingChoiceFromPlaceIds({
      placeIds: ["coffee-house", "library", "observatory"],
      menuText: "1. Coffee House\n2. Library\n3. Observatory",
    });
    const result = resolvePendingChoiceTurn("tell me more places");
    expect(result.kind).toBe("expanded");
    if (result.kind === "expanded") {
      expect(result.menuText).not.toMatch(/1\. Coffee House[\s\S]*2\. Library[\s\S]*3\. Observatory/);
      expect(result.menuText).toMatch(/1\./);
    }
    const pending = loadPendingChoice();
    expect(pending?.choices.map((c) => c.destination)).not.toEqual([
      "coffee-house",
      "library",
      "observatory",
    ]);
  });

  it('"what other places do you have" expands the estate place menu', () => {
    registerPendingChoiceFromPlaceIds({
      placeIds: ["coffee-house", "library", "observatory"],
      menuText: "1. Coffee House\n2. Library\n3. Observatory",
    });
    const result = resolvePendingChoiceTurn("what other places do you have");
    expect(result.kind).toBe("expanded");
  });
});

describe("pendingChoice — create workflow continuation", () => {
  beforeEach(() => {
    installBrowserStorageForTests();
    clearPendingChoice();
    clearUniversalCreationSession();
  });

  function stubUniversalCreationSession() {
    saveUniversalCreationSession({
      documentType: "email",
      phase: "discover",
      originalUserText: "help me write an email",
      answers: {},
      confidence: {
        score: 0.2,
        what: true,
        why: false,
        who: false,
        success: false,
      },
      questionIndex: 0,
      startedAtTurn: 1,
      preparationReady: false,
      pendingEnhancements: [],
    });
  }

  it.each(["yes add more", "add more", "continue"])(
    '"%s" yields topic change when universal creation session is active',
    (text) => {
      registerPendingChoiceFromPlaceIds({
        placeIds: ["coffee-house", "library", "observatory"],
        menuText: "1. Coffee House\n2. Library\n3. Observatory",
      });
      stubUniversalCreationSession();
      const result = resolvePendingChoiceTurn(text);
      expect(result.kind).toBe("topic_change");
      expect(loadPendingChoice()).toBeNull();
    },
  );
});
