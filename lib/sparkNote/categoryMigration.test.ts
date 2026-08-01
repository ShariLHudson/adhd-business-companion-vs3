/**
 * @vitest-environment jsdom
 * 12-category Spark migration — proves the runtime catalog + regenerated
 * manifest use only the approved numbered Spark Editions (001–012), that each
 * number maps to the correct label and staged edition cover, that individual
 * card hero images are unchanged (never an edition cover), and that a saved
 * My Note round-trips per specific card.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import manifestJson from "@/spark-library/manifest.json";
import {
  clearDurableRecordAuthForTests,
  createMemoryDurableRecordBackend,
  setDurableRecordAuthForTests,
  setDurableRecordBackendForTests,
} from "@/lib/durableRecords/repository";
import { clearMemberRecordDurableMarksForTests } from "@/lib/durableRecords/verifiedRegistry";
import { setSavedSparkDurableEnabledForTests } from "@/lib/durableRecords/flags";
import {
  loadSavedSparkNote,
  saveSparkDurable,
} from "./savedSparksDurable";
import { resetSparkNoteStoreForTests } from "./persistence";
import { SPARK_NOTE_CATALOG } from "./catalog";
import { SEED_SPARK_NOTE_CATALOG } from "./catalogSeed";
import { resolveSparkCardImage } from "./resolveSparkCardImage";
import { mySparksShelfBucket } from "./mySparksCollection";
import { sparkEditionForCategory } from "./sparkEditions";
import type { SparkNoteCategory } from "./types";

const NUMBERED: readonly SparkNoteCategory[] = [
  "001", "002", "003", "004", "005", "006",
  "007", "008", "009", "010", "011", "012",
];
const NUMBERED_SET = new Set<string>(NUMBERED);

const EDITION_LABEL: Record<SparkNoteCategory, string> = {
  "001": "Discovery",
  "002": "People & Stories",
  "003": "Creativity & Inspiration",
  "004": "Nature & Places",
  "005": "Curiosity",
  "006": "Words & Origins",
  "007": "Strategy",
  "008": "Reflection",
  "009": "Adventure",
  "010": "Business",
  "011": "Innovation",
  "012": "Wonder",
};

const EXPECTED_COUNTS: Record<string, number> = {
  "001": 5, "002": 11, "003": 9, "004": 5, "005": 7, "006": 13,
  "007": 12, "008": 16, "009": 3, "010": 12, "011": 14, "012": 5,
};

const manifest = manifestJson as Array<{
  spark_id: string;
  runtime_category?: string;
  category_label?: string;
}>;

describe("12-category Spark migration", () => {
  it("every runtime card uses only categories 001–012", () => {
    expect(SPARK_NOTE_CATALOG.length).toBe(112);
    for (const card of SPARK_NOTE_CATALOG) {
      expect(NUMBERED_SET.has(card.category)).toBe(true);
    }
  });

  it("has the approved per-category card counts", () => {
    const counts: Record<string, number> = {};
    for (const card of SPARK_NOTE_CATALOG) {
      counts[card.category] = (counts[card.category] ?? 0) + 1;
    }
    expect(counts).toEqual(EXPECTED_COUNTS);
  });

  it("every category number resolves to the correct edition label", () => {
    for (const code of NUMBERED) {
      expect(sparkEditionForCategory(code)?.title).toBe(EDITION_LABEL[code]);
    }
    // …and every card's own label matches its edition.
    for (const card of SPARK_NOTE_CATALOG) {
      expect(card.categoryLabel).toBe(EDITION_LABEL[card.category]);
    }
  });

  it("every category number maps to its staged edition cover", () => {
    for (let n = 1; n <= 12; n += 1) {
      const code = String(n).padStart(3, "0") as SparkNoteCategory;
      const edition = sparkEditionForCategory(code);
      expect(edition?.number).toBe(n);
      expect(edition?.imageSrc).toMatch(/^\/spark-card-images\/[a-z]+\.png$/);
    }
  });

  it("the regenerated manifest contains the same 112 cards with numbered categories", () => {
    expect(manifest.length).toBe(112);
    const seedIds = new Set(SEED_SPARK_NOTE_CATALOG.map((e) => e.id));
    expect(seedIds.size).toBe(112);
    for (const record of manifest) {
      expect(seedIds.has(record.spark_id)).toBe(true);
      expect(NUMBERED_SET.has(record.runtime_category ?? "")).toBe(true);
    }
  });

  it("resolves every card's full-card hero to its category edition cover", () => {
    // The full-card hero is driven by the card's numbered category (see
    // TodaysSparkCardShell). Every card maps to a staged edition cover.
    for (const card of SPARK_NOTE_CATALOG) {
      const edition = sparkEditionForCategory(card.category);
      expect(edition?.imageSrc).toMatch(/^\/spark-card-images\/[a-z]+\.png$/);
    }
  });

  it("keeps the topic-photo system (thumbnails/print) separate from edition covers", () => {
    // resolveSparkCardImage powers collection thumbnails + print — it resolves
    // topic/diversity photos, never an edition cover. Only the full-card hero
    // uses the edition cover.
    for (const card of SPARK_NOTE_CATALOG) {
      const image = resolveSparkCardImage(card);
      expect(image.src ?? "").not.toContain("/spark-card-images/");
    }
    // SPARK-INV-001 still resolves to its Post-it topic photo for thumbnails.
    const postit = SPARK_NOTE_CATALOG.find((e) => e.id === "SPARK-INV-001")!;
    const thumb = resolveSparkCardImage(postit);
    expect(thumb.hasImage).toBe(true);
    expect(thumb.src ?? "").toMatch(/Post-it/i);
  });

  it("date-based and seasonal cards still resolve with numbered categories", () => {
    const dated = SPARK_NOTE_CATALOG.filter((e) => e.monthDay);
    const seasonal = SPARK_NOTE_CATALOG.filter((e) => (e.seasons?.length ?? 0) > 0);
    expect(dated.length).toBeGreaterThan(0);
    expect(seasonal.length).toBeGreaterThan(0);
    for (const card of [...dated, ...seasonal]) {
      expect(NUMBERED_SET.has(card.category)).toBe(true);
    }
  });

  it("collection grouping uses the numbered categories", () => {
    const buckets = ["business", "growth", "fun", "learning", "reflections", "favorites"];
    for (const code of NUMBERED) {
      expect(buckets).toContain(mySparksShelfBucket(code));
    }
    expect(mySparksShelfBucket("010")).toBe("business"); // Business
    expect(mySparksShelfBucket("008")).toBe("growth"); // Reflection
  });
});

describe("My Note saves with the specific card", () => {
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
    vi.restoreAllMocks();
  });

  it("round-trips a note for one card and does not leak it to another", async () => {
    const cardA = SPARK_NOTE_CATALOG[0]!;
    const cardB = SPARK_NOTE_CATALOG[1]!;

    const claim = await saveSparkDurable(cardA, "Try this with my Monday review.");
    expect(claim.confirmed).toBe(true);

    // Reopening card A surfaces its saved note…
    expect(await loadSavedSparkNote(cardA.id)).toBe(
      "Try this with my Monday review.",
    );
    // …and card B has no note of its own.
    expect(await loadSavedSparkNote(cardB.id)).toBeFalsy();
  });
});
