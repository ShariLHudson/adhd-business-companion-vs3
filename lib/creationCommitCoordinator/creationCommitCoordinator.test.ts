import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  authorizeSuccessMessage,
  emptyCompletionReceipt,
  receiptAfterRecordOnly,
} from "./index";

describe("068 — Creation Commit Coordinator", () => {
  it("architecture docs exist", () => {
    expect(
      existsSync(
        resolve(
          process.cwd(),
          "docs/create-experience/ARCHITECTURE_CREATION_COMMIT_COORDINATOR.md",
        ),
      ),
    ).toBe(true);
    expect(
      existsSync(
        resolve(
          process.cwd(),
          "docs/create-experience/standards/068_CREATION_COMMIT_COORDINATOR_STANDARD.md",
        ),
      ),
    ).toBe(true);
  });

  it("denies opened claim when only Event Record exists (today's CPC race)", () => {
    const result = authorizeSuccessMessage({
      claimKind: "opened",
      receipt: receiptAfterRecordOnly("evt-1"),
      proposedMessage: "I've opened your workshop workspace.",
    });
    expect(result.allowed).toBe(false);
    expect(result.missing).toContain("eventRecordBoundToSession");
    expect(result.missing).toContain("createEstateMounted");
    expect(result.honestRecoveryMessage.length).toBeGreaterThan(10);
  });

  it("allows opened claim only with record + bind + estate mount", () => {
    const result = authorizeSuccessMessage({
      claimKind: "opened",
      receipt: {
        ...emptyCompletionReceipt(),
        eventRecordId: "evt-1",
        eventRecordBoundToSession: true,
        createEstateMounted: true,
        persistSucceeded: true,
      },
    });
    expect(result.allowed).toBe(true);
    expect(result.missing).toEqual([]);
  });

  it("never treats split-workspace verify as sufficient for opened", () => {
    const result = authorizeSuccessMessage({
      claimKind: "opened",
      receipt: {
        ...emptyCompletionReceipt(),
        eventRecordId: "evt-1",
        splitWorkspaceVerified: true,
      },
    });
    expect(result.allowed).toBe(false);
  });

  it("denies saved without persistSucceeded", () => {
    const result = authorizeSuccessMessage({
      claimKind: "saved",
      receipt: emptyCompletionReceipt(),
    });
    expect(result.allowed).toBe(false);
    expect(result.missing).toContain("persistSucceeded");
  });

  it("does not perform work — pure function", () => {
    const receipt = receiptAfterRecordOnly("evt-x");
    authorizeSuccessMessage({ claimKind: "created", receipt });
    expect(receipt.eventRecordId).toBe("evt-x");
    expect(receipt.createEstateMounted).toBe(false);
  });
});
