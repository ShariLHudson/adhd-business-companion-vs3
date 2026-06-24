import { describe, expect, it } from "vitest";
import {
  companionEntryLayerHintForChat,
  shouldDeferKeywordWorkspaceOffer,
  createPurposeAnchor,
  purposeQuestionForMode,
  formatExplainFirstOfferMessage,
  explainFirstOfferForVisualMode,
  isBusinessCanvasSituationSignal,
  formatBusinessCanvasCompanionOffer,
} from "./index";

describe("companionEntry entry layer gate", () => {
  it("defers keyword workspace offers for overwhelmed", () => {
    expect(shouldDeferKeywordWorkspaceOffer("I'm overwhelmed")).toBe(true);
    expect(
      shouldDeferKeywordWorkspaceOffer(
        "I'm overwhelmed and not sure where to start today.",
      ),
    ).toBe(false);
    expect(companionEntryLayerHintForChat("I'm overwhelmed")).toMatch(
      /UNDERSTAND BEFORE SUGGESTING/i,
    );
  });

  it("defers keyword workspace offers for many ideas", () => {
    expect(shouldDeferKeywordWorkspaceOffer("I have 15 ideas")).toBe(true);
  });

  it("defers keyword workspace offers for hiring VA", () => {
    expect(
      shouldDeferKeywordWorkspaceOffer("I'm thinking about hiring a VA"),
    ).toBe(true);
  });

  it("defers keyword workspace offers for product expansion", () => {
    expect(
      shouldDeferKeywordWorkspaceOffer("I want to add a new product line"),
    ).toBe(true);
    expect(
      companionEntryLayerHintForChat("I want to add a new product line"),
    ).toMatch(/PROGRESSIVE DISCOVERY/i);
  });

  it("allows specific practical requests", () => {
    expect(
      shouldDeferKeywordWorkspaceOffer("help me write a newsletter draft"),
    ).toBe(false);
  });
});

describe("purpose anchor", () => {
  it("uses mode-specific questions", () => {
    expect(purposeQuestionForMode("mind-map")).toMatch(/figure out/i);
    expect(purposeQuestionForMode("decision-tree")).toMatch(/decision/i);
  });

  it("creates anchor with captured answer", () => {
    const anchor = createPurposeAnchor("strategy-map", "Grow revenue");
    expect(anchor.userAnswer).toBe("Grow revenue");
    expect(anchor.mode).toBe("strategy-map");
    expect(anchor.capturedAt).toBeTruthy();
  });
});

describe("explain-first offers", () => {
  it("formats outcomes for mind map", () => {
    const msg = formatExplainFirstOfferMessage(
      explainFirstOfferForVisualMode("mind-map"),
    );
    expect(msg).toMatch(/Visual map/i);
    expect(msg).toMatch(/Would you like/i);
  });

  it("business canvas offer uses Business Canvas™ not framework names", () => {
    expect(isBusinessCanvasSituationSignal("why are sales so slow")).toBe(true);
    const msg = formatBusinessCanvasCompanionOffer(
      "I want to understand why sales are slow",
    );
    expect(msg).toMatch(/Business Canvas™/i);
    expect(msg).not.toMatch(/Business Model Canvas/i);
    expect(msg).toMatch(/Would you like to try it/i);
  });

  it("routes slow sales to business canvas entry hint", () => {
    const hint = companionEntryLayerHintForChat(
      "I want to understand why sales are slow",
    );
    expect(hint).toMatch(/BUSINESS CANVAS™ ENTRY/i);
    expect(hint).toMatch(/NOT framework names/i);
  });
});
