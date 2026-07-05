/**
 * Spark Restoration Intelligence tests
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveRestorationStore } from "@/lib/estateRestoration/store";
import {
  buildEnergyRestorationOffer,
  classifySparkEnergy,
  evaluateSparkRestoration,
  formatEnergyRestorationReply,
  formatAdventureWheelLine,
  pickAdventureEntry,
  SPARK_ENERGY_REGISTRY,
} from "./index";

describe("sparkRestorationIntelligence", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    saveRestorationStore({
      version: 1,
      readSpreadIds: [],
      favoriteSpreadIds: [],
      declinedAtTurns: [],
      lastOfferAtTurn: null,
      lastOfferAt: null,
    });
  });

  it("classifies mental fatigue as mental energy", () => {
    const result = classifySparkEnergy({
      userText: "my brain is fried from all these decisions",
    });
    expect(result?.energyType).toBe("mental");
  });

  it("classifies extended work signals toward play and curiosity", () => {
    const result = classifySparkEnergy({
      userText: "I've been at this for hours and need something different",
      focusedMinutes: 90,
    });
    expect(result?.energyType).toMatch(/play|curiosity/);
  });

  it("classifies emotional discouragement", () => {
    const result = classifySparkEnergy({
      userText: "I feel discouraged — what's the use",
    });
    expect(result?.energyType).toBe("emotional");
  });

  it("evaluates restoration without break language", () => {
    const eval_ = evaluateSparkRestoration({
      userText: "I keep revising this and nothing is working",
      currentTurn: 20,
    });
    expect(eval_).not.toBeNull();
    expect(eval_!.primary.label).toBeTruthy();
    const offer = buildEnergyRestorationOffer(eval_!);
    const reply = formatEnergyRestorationReply(offer);
    expect(reply).not.toMatch(/take a break|you should rest/i);
    expect(offer.responseHint).toMatch(/SPARK RESTORATION INTELLIGENCE/i);
  });

  it("formats adventure wheel as estate reinforcement", () => {
    const entry = pickAdventureEntry(42);
    const line = formatAdventureWheelLine(entry);
    expect(line).toMatch(/Today's Adventure/i);
    expect(line).not.toMatch(/points|win/i);
  });

  it("registers seven energy types", () => {
    expect(Object.keys(SPARK_ENERGY_REGISTRY)).toHaveLength(7);
    expect(SPARK_ENERGY_REGISTRY.play.recommendations[0]?.label).toBe(
      "Today's Adventure",
    );
  });

  it("blocks forward-task messages from restoration", () => {
    expect(
      evaluateSparkRestoration({
        userText: "help me write an email",
        currentTurn: 10,
      }),
    ).toBeNull();
  });
});
