/**
 * Production-path regressions for scenic suggestion gate + destination selection.
 * Exact live failure wording from production verification.
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  classifyOverwhelmNeed,
  shouldBlockScenicOverwhelmMenu,
} from "@/lib/conversation/overwhelmNeedClassifier";
import { resolveEstateRecommendation } from "@/lib/estateRecommendationIntelligence";
import { resolveEstateNavigationIntent } from "@/lib/estateNavigationIntelligence";
import { evaluateEstateJudgment } from "@/lib/estateIntelligence/judgment";
import {
  formatEstateGuideReply,
  isEstateGuideQuestion,
  resolveEstateGuideTurn,
} from "@/lib/sparkKnowledge/estateGuide";
import { detectUniversalCapabilityRequest } from "@/lib/universalAccess/detectUniversalCapabilityRequest";
import { isBreatheUniversalRequest } from "@/lib/universalAccess/breatheUniversalAccess";
import {
  clearPendingChoice,
  registerPendingChoiceFromNavigation,
  resolvePendingChoiceTurn,
} from "@/lib/pendingChoice";
import {
  mayOfferScenicPlaceSuggestions,
  scenicPlaceAutoSuggestionsEnabled,
} from "./scenicPlaceSuggestionPolicy";
import { suggestCanonicalPlaceIds } from "./canonicalPlaceSuggestions";

const SCENIC_FAILURE_RE =
  /Since you're feeling overwhelmed, a few places come to mind|There are a few places I think might fit|I think Peaceful Places might be a wonderful fit|Lakeside Hammock is another gentle option|The Ocean Conservatory is another gentle option|If one of those sounds good, we can wander there together|Peaceful Places|Lakeside Hammock|Ocean Conservatory/i;

const COGNITIVE = "I have too much on my brain to remember it all.";
const BARE_OVERWHELM = "I'm overwhelmed today.";
const PROJECT_OVERWHELM = "I'm overwhelmed trying to finish this project.";
const SOMEWHERE_PEACEFUL = "Take me somewhere peaceful.";
const THREE_CALMING = "Show me 3 calming places.";

describe("production path — scenic suggestion guard + destination selection", () => {
  beforeEach(() => {
    clearPendingChoice();
  });

  it("Failure 1 — cognitive overload never produces scenic room lists", () => {
    expect(scenicPlaceAutoSuggestionsEnabled).toBe(false);
    expect(classifyOverwhelmNeed(COGNITIVE)).toBe("cognitive_overload");
    expect(shouldBlockScenicOverwhelmMenu(COGNITIVE)).toBe(true);
    expect(mayOfferScenicPlaceSuggestions(COGNITIVE)).toBe(false);
    expect(suggestCanonicalPlaceIds(COGNITIVE)).toEqual([]);
    expect(evaluateEstateJudgment({ userText: COGNITIVE }).handled).toBe(false);
    expect(isEstateGuideQuestion(COGNITIVE)).toBe(false);
    expect(formatEstateGuideReply(resolveEstateGuideTurn(COGNITIVE))).not.toMatch(
      SCENIC_FAILURE_RE,
    );

    const recommendation = resolveEstateRecommendation(COGNITIVE);
    expect(recommendation.kind).toBe("invitation");
    expect(recommendation.primary?.locationId).toBe("clear-my-mind");
    expect(recommendation.alternatives ?? []).toEqual([]);
    expect(recommendation.memberFacingInvitation ?? "").not.toMatch(SCENIC_FAILURE_RE);
    expect(recommendation.memberFacingInvitation ?? "").not.toMatch(
      /conservatory|reflection pond|hammock/i,
    );
  });

  it("Failure 2 — bare overwhelm never auto-launches Breathe / I'll bring that up", () => {
    expect(isBreatheUniversalRequest(BARE_OVERWHELM)).toBe(false);
    expect(detectUniversalCapabilityRequest(BARE_OVERWHELM)).toBeNull();
    expect(mayOfferScenicPlaceSuggestions(BARE_OVERWHELM)).toBe(false);
    expect(resolveEstateRecommendation(BARE_OVERWHELM).kind).toBe("unresolved");
    expect(evaluateEstateJudgment({ userText: BARE_OVERWHELM }).handled).toBe(
      false,
    );
    expect(resolveEstateNavigationIntent(BARE_OVERWHELM).kind).toBe("unresolved");
  });

  it("Failure 3 — project overwhelm stays task-help, not breathing/scenic", () => {
    expect(classifyOverwhelmNeed(PROJECT_OVERWHELM)).toBe("task_breakdown");
    expect(shouldBlockScenicOverwhelmMenu(PROJECT_OVERWHELM)).toBe(true);
    expect(isBreatheUniversalRequest(PROJECT_OVERWHELM)).toBe(false);
    expect(detectUniversalCapabilityRequest(PROJECT_OVERWHELM)).toBeNull();
    expect(mayOfferScenicPlaceSuggestions(PROJECT_OVERWHELM)).toBe(false);
    expect(resolveEstateRecommendation(PROJECT_OVERWHELM).kind).toBe("unresolved");
    expect(evaluateEstateJudgment({ userText: PROJECT_OVERWHELM }).handled).toBe(
      false,
    );
    expect(resolveEstateNavigationIntent(PROJECT_OVERWHELM).kind).toBe(
      "unresolved",
    );
  });

  it("Failure 4 — numbered destination selection resolves 3 and place name", () => {
    expect(mayOfferScenicPlaceSuggestions(SOMEWHERE_PEACEFUL)).toBe(true);
    const decision = resolveEstateNavigationIntent(SOMEWHERE_PEACEFUL);
    expect(decision.kind).toBe("offer_choices");
    expect(decision.choices?.length).toBeGreaterThanOrEqual(2);
    expect(decision.choices?.length).toBeLessThanOrEqual(3);
    expect(decision.memberFacingPrompt).toMatch(/\b1\./);
    expect(decision.memberFacingPrompt).toMatch(/\b2\./);

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

    const byNumber = resolvePendingChoiceTurn("3");
    expect(byNumber.kind).toBe("resolved");
    if (byNumber.kind === "resolved") {
      expect(byNumber.choice.destination).toBe(choices[2]!.destinationId);
      expect(byNumber.reply).not.toMatch(/not sure which option/i);
    }

    registerPendingChoiceFromNavigation({
      choices,
      menuText: decision.memberFacingPrompt ?? "",
      queryPhrase: SOMEWHERE_PEACEFUL,
    });
    const byName = resolvePendingChoiceTurn(choices[1]!.displayName);
    expect(byName.kind).toBe("resolved");
    if (byName.kind === "resolved") {
      expect(byName.choice.destination).toBe(choices[1]!.destinationId);
    }

    // Named place alias outside menu still leaves pending (topic change → navigate).
    registerPendingChoiceFromNavigation({
      choices,
      menuText: decision.memberFacingPrompt ?? "",
      queryPhrase: SOMEWHERE_PEACEFUL,
    });
    const teaRoom = resolvePendingChoiceTurn("tea room");
    expect(teaRoom.kind).toBe("topic_change");
  });

  it("Failure 5 — show me 3 calming places offers ≤3 immediately, no clarification", () => {
    expect(mayOfferScenicPlaceSuggestions(THREE_CALMING)).toBe(true);
    const decision = resolveEstateNavigationIntent(THREE_CALMING);
    expect(decision.kind).toBe("offer_choices");
    expect(decision.choices?.length).toBeGreaterThanOrEqual(1);
    expect(decision.choices?.length).toBeLessThanOrEqual(3);
    expect(decision.kind).not.toBe("need_clarification");
    expect(decision.memberFacingPrompt ?? "").not.toMatch(
      /what kind of space are you looking for/i,
    );
    expect(decision.memberFacingPrompt).toMatch(/\b1\./);

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
      queryPhrase: THREE_CALMING,
    });
    const pick = resolvePendingChoiceTurn("1");
    expect(pick.kind).toBe("resolved");
  });
});
