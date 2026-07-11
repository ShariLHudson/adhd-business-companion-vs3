import { describe, expect, it } from "vitest";
import {
  CANONICAL_LANGUAGE_CODE,
  LANGUAGE_DEVELOPMENT_RULES,
  resolveSparkOwnedText,
  shouldAutoTranslateMemberContent,
  sparkContentTranslationCacheKey,
  SPARK_BRAND_NAMES,
} from "./index";

describe("ARCH-011 language architecture", () => {
  it("uses English as canonical language", () => {
    expect(CANONICAL_LANGUAGE_CODE).toBe("en");
  });

  it("preserves brand names without localization", () => {
    expect(SPARK_BRAND_NAMES.sparkEstate).toBe("Spark Estate");
    expect(SPARK_BRAND_NAMES.visualSparkStudios).toBe("Visual Spark Studios");
  });

  it("falls back to English for Spark-owned content", () => {
    expect(
      resolveSparkOwnedText("Welcome home.", "es", { es: "Bienvenido a casa." }),
    ).toBe("Bienvenido a casa.");
    expect(resolveSparkOwnedText("Welcome home.", "es")).toBe("Welcome home.");
    expect(resolveSparkOwnedText("Welcome home.", "en")).toBe("Welcome home.");
  });

  it("never auto-translates member content", () => {
    expect(shouldAutoTranslateMemberContent()).toBe(false);
  });

  it("builds stable translation cache keys", () => {
    expect(sparkContentTranslationCacheKey("SPARK-INV-001", "es")).toBe(
      "spark:translation:SPARK-INV-001:es:v1",
    );
  });

  it("documents development rules for review", () => {
    expect(LANGUAGE_DEVELOPMENT_RULES.must).toContain(
      "store one canonical English version of Spark-owned content",
    );
    expect(LANGUAGE_DEVELOPMENT_RULES.mustNot).toContain(
      "auto-translate member-owned journals, evidence, or brain dumps",
    );
  });
});
