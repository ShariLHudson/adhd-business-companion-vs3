import { describe, expect, it } from "vitest";
import {
  SPARK_RELEASE_CERTIFICATION_GATES,
  SPARK_SIMPLICITY_AUDIT_QUESTIONS,
  SPARK_SIMPLICITY_RULES,
} from "./types";

describe("Spec 128 — Simplicity & Cognitive Load Constitution constants", () => {
  it("defines fifteen simplicity rules", () => {
    expect(SPARK_SIMPLICITY_RULES).toHaveLength(15);
  });

  it("defines ten simplicity audit questions", () => {
    expect(SPARK_SIMPLICITY_AUDIT_QUESTIONS).toHaveLength(10);
  });

  it("requires simplicity, cognitive load, and ADHD experience certification gates", () => {
    expect(SPARK_RELEASE_CERTIFICATION_GATES).toEqual([
      "functional",
      "accessibility",
      "performance",
      "conversation",
      "simplicity",
      "cognitive_load",
      "adhd_experience",
    ]);
  });
});
