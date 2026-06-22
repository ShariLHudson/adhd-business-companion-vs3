import { describe, expect, it } from "vitest";
import { validateCompanionSignalInput } from "./signalValidation";

describe("signalValidation", () => {
  const valid = {
    domain: "emotional" as const,
    category: "overwhelm",
    source: "chat",
    emitter: "test.emitter",
  };

  it("accepts valid minimal input", () => {
    const result = validateCompanionSignalInput(valid);
    expect(result.ok).toBe(true);
  });

  it("rejects invalid category format", () => {
    const result = validateCompanionSignalInput({
      ...valid,
      category: "Bad-Category",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("validation_failed");
  });

  it("rejects forbidden meta keys", () => {
    const result = validateCompanionSignalInput({
      ...valid,
      meta: { message: "secret text" },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("pii_rejected");
  });

  it("rejects oversized source", () => {
    const result = validateCompanionSignalInput({
      ...valid,
      source: "x".repeat(300),
    });
    expect(result.ok).toBe(false);
  });

  it("rejects empty emitter", () => {
    const result = validateCompanionSignalInput({
      ...valid,
      emitter: "",
    });
    expect(result.ok).toBe(false);
  });
});
