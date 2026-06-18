import { describe, expect, it, vi } from "vitest";
import { applyWriteAction, workspaceFillAction } from "./writeAction";

describe("writeAction", () => {
  it("applies valid fill through onFill", () => {
    const onFill = vi.fn();
    const result = applyWriteAction(
      workspaceFillAction(
        "projects",
        "project-title",
        "Launch workshop",
        "approval",
      ),
      {
        invalidateValue: () => false,
        onFill,
      },
    );
    expect(result.applied).toBe(true);
    expect(onFill).toHaveBeenCalledWith(
      expect.objectContaining({
        field: "project-title",
        value: "Launch workshop",
      }),
    );
  });

  it("rejects invalid values without calling onFill", () => {
    const onFill = vi.fn();
    const result = applyWriteAction(
      workspaceFillAction("client-avatars", "avatar-who", "yes", "approval"),
      {
        invalidateValue: (v) => v === "yes",
        onFill,
      },
      { userText: "yes" },
    );
    expect(result.applied).toBe(false);
    expect(result.reason).toBe("invalid-value");
    expect(onFill).not.toHaveBeenCalled();
  });

  it("rejects empty content", () => {
    const onFill = vi.fn();
    const result = applyWriteAction(
      workspaceFillAction("projects", "project-goal", "  ", "coach"),
      { invalidateValue: () => false, onFill },
    );
    expect(result.applied).toBe(false);
    expect(result.reason).toBe("empty-content");
  });
});
