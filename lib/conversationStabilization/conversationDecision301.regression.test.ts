/**
 * Permanent production-path regressions from 301 Single Conversation Decision Process.
 * Asserts decision permissions + scenic/breathe/TF thin behavior on real failure wording.
 */
import { afterEach, describe, expect, it } from "vitest";
import { mayOfferScenicPlaceSuggestions } from "@/lib/estate/scenicPlaceSuggestionPolicy";
import { resolveEstateNavigationIntent } from "@/lib/estateNavigationIntelligence";
import { classifyCompanionIntent } from "@/lib/companionTurn";
import { isBreatheUniversalRequest } from "@/lib/universalAccess/breatheUniversalAccess";
import { detectUniversalCapabilityRequest } from "@/lib/universalAccess";
import { techFutureHintForChat } from "@/lib/technologyFutureIntelligence";
import {
  clearPendingChoice,
  hasActivePendingChoice,
  loadPendingChoice,
  registerPendingChoiceFromNavigation,
  resolvePendingChoiceTurn,
} from "@/lib/pendingChoice";
import {
  authorizeBreatheAutoOpen,
  authorizeScenicPlaceMenu,
  beginTurnDecision,
  buildConversationDecision,
  endTurnDecision,
} from "./index";

const COGNITIVE = "I have too much on my brain to remember it all.";
const BARE_OVERWHELM = "I'm overwhelmed today.";
const PROJECT_OVERWHELM = "I'm overwhelmed trying to finish this project.";
const OPEN_BREATHE = "Open the breathing exercise.";
const READING_NOOK = "Take me to the Reading Nook.";
const SOMEWHERE_PEACEFUL = "Take me somewhere peaceful.";
const THREE_CALMING = "Show me 3 calming places.";
const SWITCH_CRM = "Should I switch CRMs?";
const CASUAL = "The appointment went well today.";
const LAUNDRY =
  "i have to fold and put away some laundry but its still in the dryer from this morning";

afterEach(() => {
  endTurnDecision();
  clearPendingChoice();
});

describe("301 permanent conversation regressions", () => {
  it("Cognitive overload — no scenic list, no auto breathe, optional-help mode", () => {
    const d = buildConversationDecision({ userText: COGNITIVE });
    expect(d.emotionalCondition).toBe("cognitive_overload");
    expect(d.responseMode).toBe("offer_optional_help");
    expect(authorizeScenicPlaceMenu(COGNITIVE)).toBe(false);
    expect(mayOfferScenicPlaceSuggestions(COGNITIVE)).toBe(false);
    expect(resolveEstateNavigationIntent(COGNITIVE).kind).toBe("unresolved");
    expect(isBreatheUniversalRequest(COGNITIVE)).toBe(false);
    expect(detectUniversalCapabilityRequest(COGNITIVE)).toBeNull();
  });

  it("Bare overwhelm — natural path, no breathe auto, no scenic, no room", () => {
    const d = buildConversationDecision({ userText: BARE_OVERWHELM });
    expect(d.responseMode).toBe("natural_conversation");
    expect(authorizeScenicPlaceMenu(BARE_OVERWHELM)).toBe(false);
    expect(authorizeBreatheAutoOpen(BARE_OVERWHELM)).toBe(false);
    expect(detectUniversalCapabilityRequest(BARE_OVERWHELM)).toBeNull();
    expect(resolveEstateNavigationIntent(BARE_OVERWHELM).kind).toBe(
      "unresolved",
    );
  });

  it("Project overwhelm — task intent owns turn; scenic/breathe denied", () => {
    const d = buildConversationDecision({ userText: PROJECT_OVERWHELM });
    expect(d.emotionalCondition).toBe("task_breakdown");
    expect(d.responseMode).toBe("ask_one_needed_question");
    expect(d.scenicMenuPermission).toBe("denied");
    expect(authorizeBreatheAutoOpen(PROJECT_OVERWHELM)).toBe(false);
    expect(
      classifyCompanionIntent({ userText: PROJECT_OVERWHELM }).plan.type,
    ).not.toBe("place-menu");
  });

  it("Direct breathing request — breathe auto-open allowed", () => {
    const d = buildConversationDecision({ userText: OPEN_BREATHE });
    expect(d.breatheAutoOpenPermission).toBe("allowed");
    expect(authorizeBreatheAutoOpen(OPEN_BREATHE)).toBe(true);
    expect(isBreatheUniversalRequest(OPEN_BREATHE)).toBe(true);
    expect(detectUniversalCapabilityRequest(OPEN_BREATHE)?.capabilityId).toBe(
      "breathe",
    );
  });

  it("Direct destination — Reading Nook navigates explicitly", () => {
    const d = buildConversationDecision({ userText: READING_NOOK });
    expect(d.responseMode).toBe("navigate_explicitly");
    expect(d.navigationPermission).toBe("allowed");
    const nav = resolveEstateNavigationIntent(READING_NOOK);
    expect(nav.kind).toBe("navigate_direct");
    if (nav.kind === "navigate_direct") {
      expect(nav.placeId).toBe("reading-nook");
    }
  });

  it("Laundry start friction — no scenic hijack", () => {
    expect(authorizeScenicPlaceMenu(LAUNDRY)).toBe(false);
    expect(mayOfferScenicPlaceSuggestions(LAUNDRY)).toBe(false);
    expect(resolveEstateNavigationIntent(LAUNDRY).kind).toBe("unresolved");
    expect(
      classifyCompanionIntent({ userText: LAUNDRY }).plan.type,
    ).not.toBe("place-menu");
  });

  it("Explicit three calming places — menu ≤3, scenic allowed", () => {
    expect(authorizeScenicPlaceMenu(THREE_CALMING)).toBe(true);
    const decision = resolveEstateNavigationIntent(THREE_CALMING);
    expect(decision.kind).toBe("offer_choices");
    expect(decision.choices?.length).toBeLessThanOrEqual(3);
    expect(decision.memberFacingPrompt).toMatch(/\b1\./);
  });

  it("Pending selection — 3 / Tea Room / the third one resolve and consume", () => {
    clearPendingChoice();
    registerPendingChoiceFromNavigation({
      choices: [
        {
          label: "1",
          destinationId: "library",
          displayName: "Library",
          shortDescription: "Quiet shelves",
          confidence: "medium",
          reasonMatched: "test",
        },
        {
          label: "2",
          destinationId: "observatory",
          displayName: "Observatory",
          shortDescription: "Wide view",
          confidence: "medium",
          reasonMatched: "test",
        },
        {
          label: "3",
          destinationId: "tea-room",
          displayName: "Tea Room",
          shortDescription: "Warm pause",
          confidence: "medium",
          reasonMatched: "test",
        },
      ],
      menuText: "1. Library\n2. Observatory\n3. Tea Room",
      queryPhrase: SOMEWHERE_PEACEFUL,
    });

    const state = loadPendingChoice();
    expect(state?.choices).toHaveLength(3);
    expect(state?.choices[2]?.destination ?? state?.choices[2]?.callback.placeId).toBeTruthy();
    expect(state?.menuText).toMatch(/Tea Room/);

    const byNumber = resolvePendingChoiceTurn("3");
    expect(byNumber.kind).toBe("resolved");
    if (byNumber.kind === "resolved") {
      expect(byNumber.choice.label.toLowerCase()).toMatch(/tea|3/);
      expect(
        byNumber.action.placeId === "tea-room" ||
          byNumber.choice.destination === "tea-room" ||
          /tea/i.test(byNumber.choice.label),
      ).toBe(true);
    }
    expect(hasActivePendingChoice()).toBe(false);

    // Re-register for name + ordinal cases.
    registerPendingChoiceFromNavigation({
      choices: [
        {
          label: "1",
          destinationId: "library",
          displayName: "Library",
          confidence: "medium",
          reasonMatched: "test",
        },
        {
          label: "2",
          destinationId: "observatory",
          displayName: "Observatory",
          confidence: "medium",
          reasonMatched: "test",
        },
        {
          label: "3",
          destinationId: "tea-room",
          displayName: "Tea Room",
          confidence: "medium",
          reasonMatched: "test",
        },
      ],
      menuText: "1. Library\n2. Observatory\n3. Tea Room",
      queryPhrase: SOMEWHERE_PEACEFUL,
    });
    const byName = resolvePendingChoiceTurn("Tea Room");
    expect(byName.kind).toBe("resolved");
    expect(hasActivePendingChoice()).toBe(false);

    registerPendingChoiceFromNavigation({
      choices: [
        {
          label: "1",
          destinationId: "library",
          displayName: "Library",
          confidence: "medium",
          reasonMatched: "test",
        },
        {
          label: "2",
          destinationId: "observatory",
          displayName: "Observatory",
          confidence: "medium",
          reasonMatched: "test",
        },
        {
          label: "3",
          destinationId: "tea-room",
          displayName: "Tea Room",
          confidence: "medium",
          reasonMatched: "test",
        },
      ],
      menuText: "1. Library\n2. Observatory\n3. Tea Room",
      queryPhrase: SOMEWHERE_PEACEFUL,
    });
    const byOrdinal = resolvePendingChoiceTurn("the third one");
    expect(byOrdinal.kind).toBe("resolved");
    expect(hasActivePendingChoice()).toBe(false);
  });

  it("Pending selection active → decision denies new scenic/breathe", () => {
    registerPendingChoiceFromNavigation({
      choices: [
        {
          label: "1",
          destinationId: "library",
          displayName: "Library",
          confidence: "medium",
          reasonMatched: "test",
        },
      ],
      menuText: "1. Library",
      queryPhrase: "places",
    });
    const d = buildConversationDecision({
      userText: "3",
      pendingSelectionActive: true,
    });
    beginTurnDecision("turn-pending", d);
    expect(d.primaryIntent).toBe("pending_selection");
    expect(d.scenicMenuPermission).toBe("denied");
    expect(d.breatheAutoOpenPermission).toBe("denied");
    expect(d.navigationPermission).toBe("allowed");
    expect(authorizeScenicPlaceMenu("Take me somewhere peaceful.")).toBe(false);
  });

  it("Direct navigation Tea Room intent is explicit navigate mode", () => {
    const text = "Take me to the Tea Room.";
    const d = buildConversationDecision({ userText: text });
    expect(d.responseMode).toBe("navigate_explicitly");
    expect(d.navigationPermission).toBe("allowed");
  });

  it("Somewhere peaceful — scenic allowed under turn decision", () => {
    const d = buildConversationDecision({ userText: SOMEWHERE_PEACEFUL });
    beginTurnDecision("turn-peaceful", d);
    expect(authorizeScenicPlaceMenu(SOMEWHERE_PEACEFUL)).toBe(true);
    expect(resolveEstateNavigationIntent(SOMEWHERE_PEACEFUL).kind).toBe(
      "offer_choices",
    );
  });

  it("Technology decision — thin TF hint, no chapter dump", () => {
    const hint = techFutureHintForChat(SWITCH_CRM);
    expect(hint).toBeTruthy();
    expect(hint).toMatch(/TF-007/);
    expect(hint).toMatch(/Do not automatically recommend buying/);
    const d = buildConversationDecision({ userText: SWITCH_CRM });
    expect(d.scenicMenuPermission).toBe("denied");
    expect(d.responseMode).not.toBe("navigate_explicitly");
  });

  it("Casual update — no scenic, natural conversation", () => {
    const d = buildConversationDecision({ userText: CASUAL });
    expect(d.responseMode).toBe("natural_conversation");
    expect(authorizeScenicPlaceMenu(CASUAL)).toBe(false);
    expect(techFutureHintForChat(CASUAL)).toBeNull();
    expect(resolveEstateNavigationIntent(CASUAL).kind).toBe("unresolved");
  });
});
