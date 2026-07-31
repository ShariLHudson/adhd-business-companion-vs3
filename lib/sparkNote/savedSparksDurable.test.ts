/**
 * @vitest-environment jsdom
 * Durable "Save This Spark" service — memory backend stands in for Supabase.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  clearDurableRecordAuthForTests,
  createMemoryDurableRecordBackend,
  setDurableRecordAuthForTests,
  setDurableRecordBackendForTests,
} from "@/lib/durableRecords/repository";
import { clearMemberRecordDurableMarksForTests } from "@/lib/durableRecords/verifiedRegistry";
import { setSavedSparkDurableEnabledForTests } from "@/lib/durableRecords/flags";
import { getFavoriteSparkIds, resetSparkNoteStoreForTests } from "./persistence";
import {
  loadMySparksCollection,
  removeSparkDurable,
  saveSparkDurable,
  SAVED_SPARK_SAVED_COPY,
} from "./savedSparksDurable";
import type { SparkNoteDailyCard } from "./types";

function card(
  id: string,
): Pick<SparkNoteDailyCard, "id" | "title" | "category" | "categoryLabel"> {
  return {
    id,
    title: `Spark ${id}`,
    category: "invention",
    categoryLabel: "Inventions",
  };
}

describe("savedSparksDurable", () => {
  beforeEach(() => {
    localStorage.clear();
    resetSparkNoteStoreForTests();
    clearMemberRecordDurableMarksForTests();
    clearDurableRecordAuthForTests();
    setDurableRecordBackendForTests(createMemoryDurableRecordBackend());
    setDurableRecordAuthForTests("user-a");
    setSavedSparkDurableEnabledForTests(true);
  });

  afterEach(() => {
    setSavedSparkDurableEnabledForTests(null);
    clearDurableRecordAuthForTests();
    setDurableRecordBackendForTests(null);
  });

  it("claims saved only after a verified durable write", async () => {
    const claim = await saveSparkDurable(card("SPARK-INV-001"));
    expect(claim.confirmed).toBe(true);
    expect(claim.durable).toBe(true);
    expect(claim.message).toBe(SAVED_SPARK_SAVED_COPY);

    const { items, source } = await loadMySparksCollection();
    expect(source).toBe("durable");
    expect(items.some((i) => i.id === "SPARK-INV-001")).toBe(true);
  });

  it("does not claim saved when signed out, but retains the local cache", async () => {
    setDurableRecordAuthForTests(null); // AUTH_REQUIRED
    const claim = await saveSparkDurable(card("SPARK-INV-002"));
    expect(claim.confirmed).toBe(false);
    expect(claim.durable).toBe(false);
    expect(claim.retryable).toBe(true);
    // Local optimistic cache retained for offline/retry — nothing is lost.
    expect(getFavoriteSparkIds()).toContain("SPARK-INV-002");
  });

  it("falls back to optimistic local save when durable is disabled", async () => {
    setSavedSparkDurableEnabledForTests(false);
    const claim = await saveSparkDurable(card("SPARK-INV-003"));
    expect(claim.confirmed).toBe(true);
    expect(claim.durable).toBe(false);
    expect(getFavoriteSparkIds()).toContain("SPARK-INV-003");
    const { source } = await loadMySparksCollection();
    expect(source).toBe("local");
  });

  it("removes a saved Spark durably and clears the local cache", async () => {
    await saveSparkDurable(card("SPARK-DEL"));
    const claim = await removeSparkDurable("SPARK-DEL");
    expect(claim.confirmed).toBe(true);
    expect(getFavoriteSparkIds()).not.toContain("SPARK-DEL");
    const { items } = await loadMySparksCollection();
    expect(items.some((i) => i.id === "SPARK-DEL")).toBe(false);
  });

  it("prevents duplicate saves of the same Spark", async () => {
    await saveSparkDurable(card("SPARK-DUP"));
    await saveSparkDurable(card("SPARK-DUP"));
    const { items } = await loadMySparksCollection();
    expect(items.filter((i) => i.id === "SPARK-DUP")).toHaveLength(1);
    expect(
      getFavoriteSparkIds().filter((id) => id === "SPARK-DUP"),
    ).toHaveLength(1);
  });

  it("does not cap saved Sparks at 20 (no silent dropping)", async () => {
    for (let i = 0; i < 25; i += 1) {
      await saveSparkDurable(card(`SPARK-${i}`));
    }
    const { items } = await loadMySparksCollection();
    expect(items.length).toBeGreaterThanOrEqual(25);
    expect(getFavoriteSparkIds().length).toBeGreaterThanOrEqual(25);
  });
});
