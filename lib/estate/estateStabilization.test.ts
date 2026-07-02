import { beforeEach, describe, expect, it } from "vitest";
import { evaluateEstatePlaceTurn, savePendingEstatePlaceMenu, clearPendingEstatePlaceMenu } from "./estatePlaceNavigation";
import { ESTATE_PLACE_SUGGESTION_INTRO } from "./estatePlaceIdentityLock";
import { resolveUserIntent } from "./resolveUserIntent";
import { planUserIntentExecution } from "./executeUserIntent";
import { evaluateEstateCommand } from "@/lib/estateIntelligence/estateCommandRouter";

describe("estate stabilization acceptance", () => {
  beforeEach(() => {
    clearPendingEstatePlaceMenu();
  });

  it("Test 1: pricing help → conversation only (PATH A)", () => {
    const turn = evaluateEstatePlaceTurn({
      userText: "I need help with pricing",
    });
    expect(turn.type).toBe("none");
  });

  it("Test 2: stressed + quiet → numbered canonical places (PATH B)", () => {
    const turn = evaluateEstatePlaceTurn({
      userText: "I'm stressed, need somewhere quiet",
    });
    expect(turn.type).toBe("offer");
    if (turn.type === "offer") {
      expect(turn.line).toContain(ESTATE_PLACE_SUGGESTION_INTRO);
      expect(turn.line).toMatch(/^1\./m);
      expect(turn.line).toMatch(/Reading Nook|Greenhouse|Back Deck/i);
      expect(turn.line).toMatch(/Say a number or name and I'll take you there\./);
      expect(turn.line).not.toMatch(/oak tree|meditation|pond corner/i);
    }
  });

  it("Test 3: numbered selection → immediate goToPlace", () => {
    savePendingEstatePlaceMenu({
      placeIds: ["reading-nook", "greenhouse", "back-deck"],
    });
    const turn = evaluateEstatePlaceTurn({ userText: "2" });
    expect(turn.type).toBe("navigate");
    if (turn.type === "navigate") {
      expect(turn.command.roomId ?? turn.command.entryId).toBe("greenhouse");
      expect(turn.command.executeImmediately).toBe(true);
    }
  });

  it("Test 4: explicit take me to → immediate navigation", () => {
    const turn = evaluateEstatePlaceTurn({
      userText: "Take me to Reading Nook",
    });
    expect(turn.type).toBe("navigate");
    if (turn.type === "navigate") {
      expect(turn.command.roomId ?? turn.command.entryId).toBe("reading-nook");
    }
  });

  it("Test 5: music request → soundscape overlay only (no navigation)", () => {
    const intent = resolveUserIntent({ userText: "I want music" });
    expect(intent.kind).toBe("soundscape");
    const plan = planUserIntentExecution(intent);
    expect(plan.action).toBe("soundscape");
    expect(evaluateEstatePlaceTurn({ userText: "I want music" }).type).toBe(
      "none",
    );
  });

  it("Test 6: unsure peaceful → 2–3 canonical places only", () => {
    const turn = evaluateEstatePlaceTurn({
      userText: "I want somewhere peaceful but I'm not sure",
    });
    expect(turn.type).toBe("offer");
    if (turn.type === "offer") {
      expect(turn.placeIds.length).toBeGreaterThanOrEqual(2);
      expect(turn.placeIds.length).toBeLessThanOrEqual(3);
      expect(turn.line).toMatch(/ — /);
      expect(turn.line).not.toMatch(/would you like|which of those/i);
    }
  });

  it("learning request → conversation only (PATH A)", () => {
    expect(
      evaluateEstatePlaceTurn({ userText: "I want to learn about email marketing" })
        .type,
    ).toBe("none");
    expect(
      evaluateEstateCommand({
        userText: "I want to learn about email marketing",
        activeSection: null,
      }),
    ).toBeNull();
  });

  it("intent router does not hijack pricing chat (PATH A)", () => {
    expect(
      evaluateEstateCommand({
        userText: "I'm stuck on my pricing — can you help me think it through?",
        activeSection: null,
      }),
    ).toBeNull();
  });

  it("normal chat with stuck/pricing does not hijack navigation", () => {
    expect(
      evaluateEstatePlaceTurn({
        userText: "I'm stuck on my pricing — can you help me think it through?",
      }).type,
    ).toBe("none");
  });

  it("stressed + property suggest → instant local offer (no API)", () => {
    const turn = evaluateEstatePlaceTurn({
      userText:
        "I'm a little stressed today and I would love to find somebody somewhere on the property to go that I could be stress so what do you suggest",
    });
    expect(turn.type).toBe("offer");
    if (turn.type === "offer") {
      expect(turn.line).toContain(ESTATE_PLACE_SUGGESTION_INTRO);
      expect(turn.placeIds).toContain("reading-nook");
    }
  });

  it("numbered pick from LLM menu text → immediate navigate without saved pending", () => {
    const turn = evaluateEstatePlaceTurn({
      userText: "1",
      lastAssistantText: `These might fit:
1. Reading Nook
2. Greenhouse™
3. Garden Path
Say the number or name — or we can stay right here.`,
    });
    expect(turn.type).toBe("navigate");
    if (turn.type === "navigate") {
      expect(turn.command.roomId ?? turn.command.entryId).toBe("reading-nook");
      expect(turn.command.executeImmediately).toBe(true);
    }
  });
});
