import { describe, expect, it } from "vitest";

import { evaluateEstateTurn } from "./estateTurn";
import { resolvePlaceId } from "./placeIdAliases";

describe("evaluateEstateTurn — phrase matrix (Phase 1)", () => {
  it('"I want to write" → express → invite → journal', () => {
    const turn = evaluateEstateTurn("I want to write");
    expect(turn.needId).toBe("express");
    expect(turn.mode).toBe("invite");
    expect(turn.primaryPlaceId).toBe("journal");
    expect(turn.placeIds).toContain("journal");
    expect(turn.primaryMount?.experienceTier).toBe("immersive");
    expect(turn.primaryMount?.shellComponent).toBe("JournalGazeboExperience");
    expect(turn.matchedRuleId).toBe("express-write");
  });

  it('"I need somewhere peaceful" → restore → suggest → physical peaceful places', () => {
    const turn = evaluateEstateTurn("I need somewhere peaceful");
    expect(turn.needId).toBe("restore");
    expect(turn.mode).toBe("suggest");
    expect(turn.placeIds.length).toBeLessThanOrEqual(3);
    expect(turn.placeIds).toContain("greenhouse");
    expect(turn.placeIds).toContain("seat-at-pond");
    expect(turn.placeIds).not.toContain("peaceful-places");
    expect(turn.matchedRuleId).toBe("restore-somewhere-peaceful");
  });

  it('"Let\'s go swimming" → play → invite → game-room (interim)', () => {
    const turn = evaluateEstateTurn("Let's go swimming");
    expect(turn.needId).toBe("play");
    expect(turn.mode).toBe("invite");
    expect(turn.primaryPlaceId).toBe("game-room");
    expect(turn.matchedRuleId).toBe("play-swimming");
  });

  it('"I finished my course" → celebrate → celebration-room + library', () => {
    const turn = evaluateEstateTurn("I finished my course");
    expect(turn.needId).toBe("celebrate");
    expect(turn.mode).toBe("invite");
    expect(turn.primaryPlaceId).toBe("celebration-room");
    expect(turn.placeIds).toContain("library");
    expect(turn.matchedRuleId).toBe("celebrate-finished-course");
  });

  it('"I don\'t want to forget today" → capture → suggest → journal + evidence', () => {
    const turn = evaluateEstateTurn("I don't want to forget today");
    expect(turn.needId).toBe("capture");
    expect(turn.mode).toBe("suggest");
    expect(turn.placeIds).toContain("journal");
    expect(turn.placeIds).toContain("evidence-vault");
    expect(turn.matchedRuleId).toBe("capture-dont-forget");
  });

  it('"I need proof I can do hard things" → prove → evidence-vault', () => {
    const turn = evaluateEstateTurn("I need proof I can do hard things");
    expect(turn.needId).toBe("prove");
    expect(turn.mode).toBe("invite");
    expect(turn.primaryPlaceId).toBe("evidence-vault");
    expect(turn.primaryMount?.collectionRoomId).toBe("evidence-vault");
    expect(turn.matchedRuleId).toBe("prove-hard-things");
  });
});

describe("PLACE_ID_ALIASES — additive resolution", () => {
  it("resolves growth-journal → journal", () => {
    expect(resolvePlaceId("growth-journal")).toBe("journal");
  });

  it("resolves evidence-bank → evidence-vault", () => {
    expect(resolvePlaceId("evidence-bank")).toBe("evidence-vault");
  });

  it("resolves achievement-library → library", () => {
    expect(resolvePlaceId("achievement-library")).toBe("library");
  });

  it("resolves swimming-pool → game-room (interim)", () => {
    expect(resolvePlaceId("swimming-pool")).toBe("game-room");
  });

  it("preserves P0 celebration-garden → celebration-room", () => {
    expect(resolvePlaceId("celebration-garden")).toBe("celebration-room");
  });
});
