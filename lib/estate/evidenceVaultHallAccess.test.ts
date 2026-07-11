import { describe, expect, it } from "vitest";
import { resolveEstatePlace } from "./resolveEstatePlace";
import { resolveEstatePlaceIdFromUserText } from "./estateRoomAliasRegistry";
import { goToPlace } from "./goToPlace";
import {
  detectsEncouragementNeed,
  detectsWinSaveRequest,
  handleWinSaveRequest,
  preferredWinSaveDestination,
} from "./winSavePending";
import { buildWinSaveOffer, parseWinSaveChoice } from "./winSaveOffer";

describe("Evidence Vault + Hall of Accomplishments access", () => {
  const vaultPhrases = [
    "Open my Evidence Vault.",
    "Show my Evidence Vault",
    "Open Evidence Vault",
    "I need encouragement",
    "Remind me what I've done",
    "Show me proof I can do this",
  ];

  const hallPhrases = [
    "Open Hall of Accomplishments",
    "Show my Hall of Accomplishments",
    "Show my accomplishments",
    "Open my Hall of Accomplishments",
  ];

  it.each(vaultPhrases)("routes vault phrase → evidence-vault: %s", (text) => {
    const resolution = resolveEstatePlace(text);
    expect(resolution.placeId).toBe("evidence-vault");
    expect(resolution.placeId).not.toBe("gardens");
    expect(resolution.placeId).not.toBe("gallery-of-firsts");
    expect(resolution.placeId).not.toBe("portfolio");
  });

  it.each(hallPhrases)("routes hall phrase → portfolio (Hall): %s", (text) => {
    const resolution = resolveEstatePlace(text);
    expect(resolution.placeId).toBe("portfolio");
    expect(resolution.placeId).not.toBe("gallery-of-firsts");
    expect(resolution.placeId).not.toBe("evidence-vault");
  });

  it("does not route Hall to Portfolio label confusion — goToPlace opens growth-portfolio", () => {
    const outcome = goToPlace({ placeId: "portfolio" });
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.placeId).toBe("portfolio");
    expect(outcome.section).toBe("growth-portfolio");
  });

  it("does not route Evidence Vault to gardens / gallery", () => {
    const outcome = goToPlace({ placeId: "evidence-vault" });
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.placeId).toBe("evidence-vault");
    expect(outcome.section).toBe("evidence-bank");
  });

  it("my wins still goes to Celebration Garden, not Vault", () => {
    expect(resolveEstatePlace("show me my wins").placeId).toBe("gardens");
  });

  it("gallery phrases stay on Gallery, not Hall", () => {
    expect(resolveEstatePlaceIdFromUserText("gallery of firsts")).toBe(
      "gallery-of-firsts",
    );
    expect(resolveEstatePlaceIdFromUserText("the gallery")).toBe(
      "gallery-of-firsts",
    );
  });
});

describe("save-this-win + encouragement", () => {
  it("detects save this win and offers destinations", () => {
    expect(detectsWinSaveRequest("Save this win.")).toBe(true);
    const offer = buildWinSaveOffer("Closed the deal");
    expect(offer.prompt).toBe("Would you like to save this?");
    expect(offer.options.map((o) => o.id)).toEqual([
      "evidence-vault",
      "hall-of-accomplishments",
      "both",
      "not-now",
    ]);
    expect(offer.options.map((o) => o.label)).toEqual([
      "Evidence Vault",
      "Hall of Accomplishments",
      "Both",
      "Not now",
    ]);
  });

  it("Add this to my Hall of Accomplishments saves directly to Hall", () => {
    expect(
      preferredWinSaveDestination("Add this to my Hall of Accomplishments"),
    ).toBe("hall-of-accomplishments");
    const result = handleWinSaveRequest({
      userText: "Add this to my Hall of Accomplishments",
      seedText: "Launched the new offer",
      offeredAtTurn: 1,
    });
    expect(result?.kind).toBe("saved");
    if (result?.kind === "saved") {
      expect(result.openPlaceId).toBe("portfolio");
    }
  });

  it("Save this win opens the choice menu", () => {
    const result = handleWinSaveRequest({
      userText: "Save this win.",
      seedText: "I finished the proposal",
      offeredAtTurn: 1,
    });
    expect(result?.kind).toBe("offer");
    if (result?.kind === "offer") {
      expect(result.message).toMatch(/Would you like to save this/);
      expect(result.message).toMatch(/Evidence Vault/);
      expect(result.message).toMatch(/Hall of Accomplishments/);
    }
  });

  it("parses save choices", () => {
    expect(parseWinSaveChoice("Save to Evidence Vault")).toBe("evidence-vault");
    expect(parseWinSaveChoice("Add to Hall of Accomplishments")).toBe(
      "hall-of-accomplishments",
    );
    expect(parseWinSaveChoice("Save to Both")).toBe("both");
    expect(parseWinSaveChoice("Not Now")).toBe("not-now");
  });

  it("detects encouragement need for Evidence Vault", () => {
    expect(detectsEncouragementNeed("I need encouragement")).toBe(true);
    expect(detectsEncouragementNeed("Show me proof I can do this")).toBe(true);
  });
});
