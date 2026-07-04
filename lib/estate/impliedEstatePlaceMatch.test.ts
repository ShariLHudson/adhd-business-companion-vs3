import { describe, expect, it } from "vitest";
import { classifyCompanionIntent } from "@/lib/companionTurn/classifyCompanionIntent";
import { resolveEstateAction } from "./decisionKernel/resolveEstateAction";
import { evaluateEstatePlaceTurn } from "./estatePlaceNavigation";
import { shouldRouteThroughEstateKernel } from "./estateKernelGate";
import {
  formatImpliedEstateNavigationAck,
  formatImpliedWarmNavigationLine,
  matchImpliedEstatePlace,
  mayAutoRouteImpliedEstatePlace,
} from "./impliedEstatePlaceMatch";
import { evaluateImpliedNeed } from "@/lib/intentAwareConversation/impliedNeed";
import { resolveFrictionlessAction } from "@/lib/frictionlessActionLayer";

const IMPLIED_PHRASES: ReadonlyArray<{
  text: string;
  placeId: string;
  warmIncludes?: string;
}> = [
  {
    text: "I could use a cup of coffee.",
    placeId: "coffee-house",
    warmIncludes: "Coffee House sounds perfect",
  },
  { text: "I need coffee.", placeId: "coffee-house" },
  { text: "I want some tea.", placeId: "tea-room" },
  { text: "I need to clear my head.", placeId: "clear-my-mind" },
  { text: "I feel overwhelmed.", placeId: "clear-my-mind" },
  { text: "I need to write this down.", placeId: "journal" },
  { text: "I need to plan.", placeId: "strategy-studio" },
  { text: "I have a big decision to make.", placeId: "round-table" },
  { text: "I did it — big win today.", placeId: "gardens" },
  { text: "I need to rest.", placeId: "lakeside-hammock" },
  { text: "I want to swim.", placeId: "summer-terrace" },
  { text: "I need a song.", placeId: "music-room" },
  { text: "I need some fresh air.", placeId: "estate-gardens" },
  { text: "I need proof of what I've done.", placeId: "evidence-vault" },
];

describe("impliedEstatePlaceMatch", () => {
  it.each(IMPLIED_PHRASES)(
    "still detects implied phrase → $placeId",
    ({ text, placeId }) => {
      const match = matchImpliedEstatePlace(text);
      expect(match?.placeId).toBe(placeId);
    },
  );

  it("never auto-routes — IMPLIED_NEED layer owns navigation", () => {
    const match = matchImpliedEstatePlace("I could use a cup of coffee.");
    expect(mayAutoRouteImpliedEstatePlace(match)).toBe(false);
  });

  it("coffee warm copy still available for explicit navigation ack", () => {
    const text = "I could use a cup of coffee.";
    const match = matchImpliedEstatePlace(text);
    expect(match).not.toBeNull();
    expect(formatImpliedWarmNavigationLine(match!)).toContain(
      "Coffee House sounds perfect",
    );
    expect(formatImpliedEstateNavigationAck(match!)).toContain(
      "I'll take you there",
    );
  });

  it("does not steal explicit navigation or business coaching turns", () => {
    expect(matchImpliedEstatePlace("Take me to the Coffee House.")).toBeNull();
    expect(
      matchImpliedEstatePlace("How do I write a proposal for a client?"),
    ).toBeNull();
    expect(matchImpliedEstatePlace("I want music")).toBeNull();
    expect(matchImpliedEstatePlace("Help me write a proposal")).toBeNull();
  });

  it("implied phrases stay in chat — kernel does not auto-navigate", () => {
    const hostPausePhrases = [
      "I could use a cup of coffee.",
      "I need coffee.",
      "I need some fresh air.",
      "I need a minute.",
      "I need a break.",
      "I need to clear my head.",
    ];
    for (const text of hostPausePhrases) {
      expect(shouldRouteThroughEstateKernel(text), text).toBe(false);
      const classified = classifyCompanionIntent({
        userText: text,
        lastAssistantText: null,
        currentPlaceId: null,
      });
      expect(classified.kind, text).toBe("CHAT");
    }
  });

  it("evaluateEstatePlaceTurn does not navigate implied coffee", () => {
    const turn = evaluateEstatePlaceTurn({
      userText: "I could use a cup of coffee.",
    });
    expect(turn.type).not.toBe("navigate");
  });

  it("frictionless IMPLIED_NEED offers choices for coffee", () => {
    const decision = resolveFrictionlessAction({
      userText: "I need a cup of coffee.",
      currentTurn: 1,
    });
    expect(decision.category).toBe("implied_need");
    expect(decision.localReply).toMatch(/Coffee House/i);
    expect(decision.localReply).toMatch(/1\./);
    expect(decision.impliedNeedEvaluation?.intentCategory).toBe("IMPLIED_NEED");
    expect(decision.impliedNeedEvaluation?.suggestedPaths).toContain(
      "estate_place",
    );
  });

  it("resolveEstateAction stays in chat for implied coffee", () => {
    const decision = resolveEstateAction({
      userText: "I could use a cup of coffee.",
    });
    expect(decision.action).not.toBe("NAVIGATE");
  });

  it("evaluateImpliedNeed aligns with estate place match", () => {
    const evaluation = evaluateImpliedNeed("I need a cup of coffee.");
    expect(evaluation?.primaryPlaceId).toBe("coffee-house");
    expect(evaluation?.matchKey).toBe("coffee-need");
  });
});
