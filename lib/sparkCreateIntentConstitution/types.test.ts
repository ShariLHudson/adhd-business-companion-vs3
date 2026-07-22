import { describe, expect, it } from "vitest";
import {
  SPARK_CREATE_INTENT_CATEGORIES,
  SPARK_CREATE_INTENT_CERTIFICATION_GATES,
  SPARK_CREATE_INTENT_CONFIDENCE_BANDS,
  SPARK_CREATE_INTENT_MEMORY_STATUS,
  SPARK_CREATE_INTENT_RULES,
  SPARK_CREATE_MORE_WAYS_MAX_DECISION_LAYERS,
} from "./types";

describe("Spec 131 — Create Intelligence & Intent Constitution constants", () => {
  it("defines fifteen intent rules", () => {
    expect(SPARK_CREATE_INTENT_RULES).toHaveLength(15);
  });

  it("defines nine intent categories", () => {
    expect(SPARK_CREATE_INTENT_CATEGORIES).toHaveLength(9);
    expect(SPARK_CREATE_INTENT_CATEGORIES).toContain("deliverable");
    expect(SPARK_CREATE_INTENT_CATEGORIES).toContain("event");
  });

  it("defines confidence bands including very_high and medium alternatives", () => {
    expect(SPARK_CREATE_INTENT_CONFIDENCE_BANDS).toEqual([
      "very_high",
      "high",
      "medium",
      "low",
    ]);
  });

  it("requires fifteen Create Intent certification gates", () => {
    expect(SPARK_CREATE_INTENT_CERTIFICATION_GATES).toHaveLength(15);
    expect(SPARK_CREATE_INTENT_CERTIFICATION_GATES).toContain(
      "intent_before_artifact",
    );
    expect(SPARK_CREATE_INTENT_CERTIFICATION_GATES).toContain(
      "continue_hidden_when_empty",
    );
    expect(SPARK_CREATE_INTENT_CERTIFICATION_GATES).toContain(
      "confidence_bands_no_silent_create",
    );
  });

  it("caps More Ways decision layers at three", () => {
    expect(SPARK_CREATE_MORE_WAYS_MAX_DECISION_LAYERS).toBe(3);
  });

  it("marks Intent Memory as future capability", () => {
    expect(SPARK_CREATE_INTENT_MEMORY_STATUS).toBe("future_capability");
  });
});
