import { describe, expect, it } from "vitest";
import {
  isExplicitScenicPlaceRequest,
  mayOfferScenicPlaceSuggestions,
  scenicPlaceAutoSuggestionsEnabled,
  scenicPlaceSuggestionCount,
} from "./scenicPlaceSuggestionPolicy";
import {
  detectCanonicalSuggestionProfile,
  suggestCanonicalPlaceIds,
} from "./canonicalPlaceSuggestions";
import { resolveEstateIntent } from "./estateIntentBridge";
import { resolveEstatePlace } from "./resolveEstatePlace";
import {
  evaluateEstateJudgment,
  isEstateJudgmentQuery,
} from "@/lib/estateIntelligence/judgment";
import {
  isEstateGuideQuestion,
  resolveEstateGuideTurn,
  formatEstateGuideReply,
} from "@/lib/sparkKnowledge/estateGuide";
import { shouldBlockScenicOverwhelmMenu } from "@/lib/conversation/overwhelmNeedClassifier";

const COGNITIVE = "I have too much on my brain to remember it all.";
const TASK =
  "I have a huge project due tomorrow and do not know where to start.";
const PANICKY = "I feel panicky and need to calm down.";
const PEACEFUL = "Take me somewhere peaceful.";
const THREE_CALMING = "Show me three calming places.";

function expectNoScenicMenu(text: string) {
  expect(scenicPlaceAutoSuggestionsEnabled).toBe(false);
  expect(mayOfferScenicPlaceSuggestions(text)).toBe(false);
  expect(suggestCanonicalPlaceIds(text)).toEqual([]);
  expect(detectCanonicalSuggestionProfile(text)).toBeNull();
  expect(resolveEstateIntent({ text }).suggestedPlaceIds).toEqual([]);
  expect(resolveEstatePlace(text).kind).not.toBe("suggestion");
  expect(isEstateJudgmentQuery(text)).toBe(false);
  expect(evaluateEstateJudgment({ userText: text }).handled).toBe(false);
  expect(isEstateGuideQuestion(text)).toBe(false);
  const guide = formatEstateGuideReply(resolveEstateGuideTurn(text));
  expect(guide).not.toMatch(/Lakeside Hammock|Ocean Conservatory|Peaceful Places|wander there together|gentle option/i);
}

describe("scenicPlaceSuggestionPolicy — unsolicited OFF", () => {
  it("keeps auto-suggestions disabled by default", () => {
    expect(scenicPlaceAutoSuggestionsEnabled).toBe(false);
  });

  it("cognitive overload → conversation path, no scenic list", () => {
    expect(shouldBlockScenicOverwhelmMenu(COGNITIVE)).toBe(true);
    expectNoScenicMenu(COGNITIVE);
  });

  it("task breakdown → no scenic list", () => {
    expect(shouldBlockScenicOverwhelmMenu(TASK)).toBe(true);
    expectNoScenicMenu(TASK);
  });

  it("panicky calm-down → no scenic list unless place asked", () => {
    expect(shouldBlockScenicOverwhelmMenu(PANICKY)).toBe(true);
    expectNoScenicMenu(PANICKY);
  });

  it("bare overwhelm / stress keywords never open scenic menus", () => {
    for (const text of [
      "I'm overwhelmed",
      "I feel overwhelmed",
      "today i am really stressed",
      "my brain won't stop",
    ]) {
      expect(mayOfferScenicPlaceSuggestions(text)).toBe(false);
      expect(suggestCanonicalPlaceIds(text)).toEqual([]);
      expect(isEstateJudgmentQuery(text)).toBe(false);
      expect(isEstateGuideQuestion(text)).toBe(false);
    }
  });
});

describe("scenicPlaceSuggestionPolicy — explicit place asks still work", () => {
  it("Take me somewhere peaceful → one place suggestion path", () => {
    expect(isExplicitScenicPlaceRequest(PEACEFUL)).toBe(true);
    expect(mayOfferScenicPlaceSuggestions(PEACEFUL)).toBe(true);
    expect(scenicPlaceSuggestionCount(PEACEFUL)).toBe(1);
    const ids = suggestCanonicalPlaceIds(PEACEFUL);
    expect(ids.length).toBe(1);
    const intent = resolveEstateIntent({ text: PEACEFUL });
    expect(intent.suggestedPlaceIds.length).toBeGreaterThanOrEqual(1);
    expect(intent.suggestedPlaceIds.length).toBeLessThanOrEqual(3);
  });

  it("Show me three calming places → up to three options", () => {
    expect(isExplicitScenicPlaceRequest(THREE_CALMING)).toBe(true);
    expect(mayOfferScenicPlaceSuggestions(THREE_CALMING)).toBe(true);
    expect(scenicPlaceSuggestionCount(THREE_CALMING)).toBe(3);
    const ids = suggestCanonicalPlaceIds(THREE_CALMING);
    expect(ids.length).toBeGreaterThanOrEqual(1);
    expect(ids.length).toBeLessThanOrEqual(3);
  });

  it("I need somewhere quiet → quiet place suggestions allowed", () => {
    const text = "I need somewhere quiet";
    expect(mayOfferScenicPlaceSuggestions(text)).toBe(true);
    expect(detectCanonicalSuggestionProfile(text)).toBe("quiet");
    expect(suggestCanonicalPlaceIds(text).length).toBeGreaterThan(0);
  });
});
