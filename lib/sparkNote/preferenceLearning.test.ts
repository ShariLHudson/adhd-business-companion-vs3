import { describe, expect, it, beforeEach } from "vitest";
import { SPARK_NOTE_CATALOG } from "./catalog";
import { resolveMySparksCollection } from "./mySparksCollection";
import {
  pickAffinityWeightedFromPool,
  scoreEntryAffinity,
  topAffinityTopics,
} from "./preferenceLearning";
import {
  recordSparkNoteReaction,
  recordSparkNoteViewed,
  resetSparkNoteStoreForTests,
  toggleSparkNoteFavorite,
} from "./persistence";

describe("preferenceLearning", () => {
  beforeEach(() => {
    resetSparkNoteStoreForTests();
  });

  it("boosts affinity score after loved reaction", () => {
    const entry = SPARK_NOTE_CATALOG.find((e) => e.id === "SPARK-INV-001")!;
    const before = scoreEntryAffinity(entry);
    recordSparkNoteReaction("SPARK-INV-001", "loved", "invention", ["invention"]);
    const after = scoreEntryAffinity(entry);
    expect(after).toBeGreaterThan(before);
  });

  it("save reaction adds to favorites and collection", () => {
    recordSparkNoteReaction("SPARK-QUOTE-001", "save", "quote");
    expect(resolveMySparksCollection().some((s) => s.id === "SPARK-QUOTE-001")).toBe(
      true,
    );
  });

  it("topAffinityTopics surfaces learned categories", () => {
    recordSparkNoteReaction("SPARK-BIZ-004", "loved", "business");
    recordSparkNoteReaction("SPARK-ENT-001", "smile", "entrepreneur");
    const topics = topAffinityTopics(2);
    expect(topics.length).toBeGreaterThan(0);
  });

  it("affinity score ranks loved category above others", () => {
    recordSparkNoteReaction("SPARK-INV-001", "loved", "invention");
    const inv = SPARK_NOTE_CATALOG.find((e) => e.id === "SPARK-INV-001")!;
    const ent = SPARK_NOTE_CATALOG.find((e) => e.id === "SPARK-ENT-001")!;
    expect(scoreEntryAffinity(inv)).toBeGreaterThan(scoreEntryAffinity(ent));
  });

  it("pass reaction lowers affinity for that category", () => {
    const entry = SPARK_NOTE_CATALOG.find((e) => e.id === "SPARK-FACT-006")!;
    const before = scoreEntryAffinity(entry);
    recordSparkNoteReaction("SPARK-FACT-006", "pass", "fun_fact");
    const after = scoreEntryAffinity(entry);
    expect(after).toBeLessThan(before);
  });

  it("toggleSparkNoteFavorite still works alongside reactions", () => {
    toggleSparkNoteFavorite("SPARK-GRO-009");
    expect(resolveMySparksCollection().some((s) => s.id === "SPARK-GRO-009")).toBe(
      true,
    );
  });

  it("viewed sparks gently boost same-category affinity", () => {
    const entry = SPARK_NOTE_CATALOG.find((e) => e.id === "SPARK-INV-002")!;
    const before = scoreEntryAffinity(entry);
    recordSparkNoteViewed("SPARK-INV-001");
    const after = scoreEntryAffinity(entry);
    expect(after).toBeGreaterThan(before);
    expect(after - before).toBeLessThanOrEqual(1);
  });

  it("saved sparks are a stronger signal than a single view", () => {
    const invention = SPARK_NOTE_CATALOG.find((e) => e.id === "SPARK-INV-001")!;
    const business = SPARK_NOTE_CATALOG.find((e) => e.id === "SPARK-BIZ-004")!;

    recordSparkNoteViewed("SPARK-INV-002");
    const viewedOnly = scoreEntryAffinity(invention);

    resetSparkNoteStoreForTests();
    recordSparkNoteReaction("SPARK-INV-001", "save", "invention");
    const savedBoost = scoreEntryAffinity(invention);

    expect(savedBoost).toBeGreaterThan(viewedOnly);
    expect(scoreEntryAffinity(business)).toBeLessThan(savedBoost);
  });
});
