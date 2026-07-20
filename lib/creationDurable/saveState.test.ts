/** @vitest-environment jsdom */
import { describe, expect, it, beforeEach } from "vitest";
import {
  labelForCreationSaveState,
  resolveCreationSaveState,
} from "./saveState";
import {
  clearFocusRecoveryBuffer,
  FOCUS_RECOVERY_BUFFER_KEY,
  hasFocusRecoveryBuffer,
  readFocusRecoveryBuffer,
  writeFocusRecoveryBuffer,
} from "./focusRecoveryBuffer";

describe("076/077 Creation save state", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("never labels local-only as Saved", () => {
    for (const state of ["local_only", "dirty", "failed"] as const) {
      const label = labelForCreationSaveState(state);
      expect(label.startsWith("Saved")).toBe(false);
      expect(label).not.toBe("Saved");
    }
    expect(labelForCreationSaveState("saved")).toBe("Saved securely");
  });

  it("resolve prefers failure over saving", () => {
    expect(
      resolveCreationSaveState({
        submitting: true,
        failureMessage: "That didn’t finish saving securely.",
      }),
    ).toBe("retrying");
    expect(
      resolveCreationSaveState({
        submitting: false,
        failureMessage: "That didn’t finish saving securely.",
      }),
    ).toBe("failed");
  });

  it("resolve shows saved only after durable ack and clean draft", () => {
    expect(
      resolveCreationSaveState({
        lastDurableOk: true,
        dirty: false,
        submitting: false,
      }),
    ).toBe("saved");
    expect(
      resolveCreationSaveState({
        lastDurableOk: true,
        dirty: true,
      }),
    ).toBe("dirty");
  });

  it("recovery buffer restores text and never implies durable", () => {
    writeFocusRecoveryBuffer({
      creationId: "ws-1",
      focusId: "section:purpose",
      text: "Deepen trust",
    });
    expect(readFocusRecoveryBuffer("ws-1", "section:purpose")).toBe(
      "Deepen trust",
    );
    expect(hasFocusRecoveryBuffer("ws-1", "section:purpose")).toBe(true);
    expect(localStorage.getItem(FOCUS_RECOVERY_BUFFER_KEY)).toBeTruthy();
    clearFocusRecoveryBuffer("ws-1", "section:purpose");
    expect(readFocusRecoveryBuffer("ws-1", "section:purpose")).toBeNull();
  });
});
