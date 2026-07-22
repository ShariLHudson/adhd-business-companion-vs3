import { describe, expect, it } from "vitest";
import {
  SPARK_MOMENTUM_LOSS_METRICS,
  SPARK_MOMENTUM_PROTECTION_CERTIFICATION_QUESTIONS,
  SPARK_MOMENTUM_PROTECTION_RULES,
  SPARK_MOMENTUM_SOFT_LEAVE_CONFIRM,
  SPARK_MOMENTUM_ULTIMATE_PASS,
  SPARK_TEN_SECOND_RULE,
  SPARK_TEN_SECOND_RULE_QUESTION,
} from "./types";

describe("Spec 132 — Momentum Protection Standard constants", () => {
  it("defines twelve momentum protection rules", () => {
    expect(SPARK_MOMENTUM_PROTECTION_RULES).toHaveLength(12);
    expect(SPARK_MOMENTUM_PROTECTION_RULES).toContain("intentional_navigation");
    expect(SPARK_MOMENTUM_PROTECTION_RULES).toContain(
      "final_12_10_certification",
    );
  });

  it("defines the Ten-Second Rule as a non-shipping gate when failed", () => {
    expect(SPARK_TEN_SECOND_RULE.seconds).toBe(10);
    expect(SPARK_TEN_SECOND_RULE.shipWhenFails).toBe(false);
    expect(SPARK_TEN_SECOND_RULE_QUESTION).toMatch(/ten seconds/i);
  });

  it("defines eight momentum-loss metrics", () => {
    expect(SPARK_MOMENTUM_LOSS_METRICS).toHaveLength(8);
    expect(SPARK_MOMENTUM_LOSS_METRICS).toContain("unexpected_navigation");
    expect(SPARK_MOMENTUM_LOSS_METRICS).toContain("abandoned_work");
  });

  it("defines six 12/10 certification questions", () => {
    expect(SPARK_MOMENTUM_PROTECTION_CERTIFICATION_QUESTIONS).toHaveLength(6);
    expect(SPARK_MOMENTUM_PROTECTION_CERTIFICATION_QUESTIONS).toContain(
      "thought_about_software",
    );
  });

  it("states ultimate pass language and soft-leave confirm", () => {
    expect(SPARK_MOMENTUM_ULTIMATE_PASS).toBe("I just kept working.");
    expect(SPARK_MOMENTUM_SOFT_LEAVE_CONFIRM).toMatch(/still working/i);
  });
});
