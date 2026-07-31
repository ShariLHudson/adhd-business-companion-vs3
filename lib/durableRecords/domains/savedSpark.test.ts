/**
 * @vitest-environment jsdom
 * Saved Spark durable domain adapter — memory backend stands in for Supabase.
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  clearDurableRecordAuthForTests,
  createMemoryDurableRecordBackend,
  setDurableRecordAuthForTests,
  setDurableRecordBackendForTests,
} from "../repository";
import { clearMemberRecordDurableMarksForTests } from "../verifiedRegistry";
import {
  fetchSavedSparkDurable,
  listSavedSparkDurable,
  softDeleteSavedSparkDurable,
  upsertSavedSparkDurable,
  type SavedSparkPayload,
} from "./savedSpark";

function makePayload(
  sparkId: string,
  over: Partial<SavedSparkPayload> = {},
): SavedSparkPayload {
  return {
    sparkId,
    savedAtIso: "2026-07-31T12:00:00.000Z",
    title: `Spark ${sparkId}`,
    category: "invention",
    categoryLabel: "Inventions",
    ...over,
  };
}

describe("saved_spark durable adapter", () => {
  beforeEach(() => {
    localStorage.clear();
    clearMemberRecordDurableMarksForTests();
    clearDurableRecordAuthForTests();
    setDurableRecordBackendForTests(createMemoryDurableRecordBackend());
    setDurableRecordAuthForTests("user-a");
  });

  it("upserts a saved Spark and reads it back durably", async () => {
    const res = await upsertSavedSparkDurable(makePayload("SPARK-INV-001"));
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.recordId).toBe("SPARK-INV-001");
    expect(res.record.payload.title).toBe("Spark SPARK-INV-001");

    const back = await fetchSavedSparkDurable("SPARK-INV-001");
    expect(back?.savedAtIso).toBe("2026-07-31T12:00:00.000Z");
  });

  it("lists durable saved Sparks for the member", async () => {
    await upsertSavedSparkDurable(makePayload("SPARK-INV-001"));
    await upsertSavedSparkDurable(makePayload("SPARK-BIZ-010"));
    const list = await listSavedSparkDurable();
    expect(list.map((p) => p.sparkId).sort()).toEqual([
      "SPARK-BIZ-010",
      "SPARK-INV-001",
    ]);
  });

  it("re-saving the same Spark never duplicates", async () => {
    await upsertSavedSparkDurable(makePayload("SPARK-DUP", { title: "First" }));
    await upsertSavedSparkDurable(makePayload("SPARK-DUP", { title: "Second" }));
    const list = await listSavedSparkDurable();
    expect(list.filter((p) => p.sparkId === "SPARK-DUP")).toHaveLength(1);
    expect(list.find((p) => p.sparkId === "SPARK-DUP")?.title).toBe("Second");
  });

  it("soft-delete removes the Spark from list and fetch", async () => {
    await upsertSavedSparkDurable(makePayload("SPARK-DEL"));
    const del = await softDeleteSavedSparkDurable("SPARK-DEL");
    expect(del.ok).toBe(true);
    expect(await fetchSavedSparkDurable("SPARK-DEL")).toBeNull();
    const list = await listSavedSparkDurable();
    expect(list.some((p) => p.sparkId === "SPARK-DEL")).toBe(false);
  });

  it("scopes saved Sparks to the owning member", async () => {
    await upsertSavedSparkDurable(makePayload("SPARK-OWN"));
    setDurableRecordAuthForTests("user-b");
    expect(await listSavedSparkDurable()).toHaveLength(0);
    expect(await fetchSavedSparkDurable("SPARK-OWN")).toBeNull();
  });

  it("has no fixed cap on the number of saved Sparks", async () => {
    for (let i = 0; i < 25; i += 1) {
      await upsertSavedSparkDurable(makePayload(`SPARK-${i}`));
    }
    const list = await listSavedSparkDurable();
    expect(list).toHaveLength(25);
  });
});
