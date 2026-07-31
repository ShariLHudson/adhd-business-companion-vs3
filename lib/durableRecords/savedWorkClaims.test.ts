import { describe, expect, it } from "vitest";
import type { SavedWorkItem } from "@/lib/savedWorkStore";
import { durableRecordFail, durableRecordOk } from "./types";
import type { MemberRecord } from "./types";
import {
  mayClaimSaved,
  resolveSavedWorkClaim,
} from "./savedWorkClaims";

function okReceipt() {
  const record: MemberRecord<SavedWorkItem> = {
    userId: "u1",
    domain: "saved_work",
    recordId: "sw-1",
    status: "active",
    schemaVersion: 1,
    version: 1,
    payload: {} as SavedWorkItem,
    createdAt: "2026-07-31T00:00:00.000Z",
    updatedAt: "2026-07-31T00:00:00.000Z",
  };
  return durableRecordOk(record);
}

describe("saved_work completion-integrity claims", () => {
  it("says saved ONLY when ok && durable", () => {
    const claim = resolveSavedWorkClaim(okReceipt(), "create");
    expect(claim.status).toBe("durably_saved");
    expect(claim.durable).toBe(true);
    expect(claim.message).toBe("Saved to My Work.");
    expect(mayClaimSaved(okReceipt())).toBe(true);
  });

  it("a retryable failure is retained, offers retry, uses calm receipt copy", () => {
    const receipt = durableRecordFail(
      "DB_WRITE_FAILED",
      "That didn't finish saving securely. Your work is still on screen — Retry.",
      true,
      "pg: connection reset", // technical cause
    );
    const claim = resolveSavedWorkClaim(receipt, "save");
    expect(claim.status).toBe("retained_for_retry");
    expect(claim.durable).toBe(false);
    expect(claim.retryable).toBe(true);
    expect(claim.message).toContain("still on screen");
    // Technical cause must never reach member-facing copy.
    expect(claim.message).not.toContain("connection reset");
    expect(mayClaimSaved(receipt)).toBe(false);
  });

  it("a non-retryable failure does not offer retry", () => {
    const receipt = durableRecordFail(
      "INVALID_PAYLOAD",
      "Something about this couldn't be saved safely. Your work is still on screen.",
      false,
    );
    const claim = resolveSavedWorkClaim(receipt, "create");
    expect(claim.status).toBe("failed");
    expect(claim.retryable).toBe(false);
    expect(mayClaimSaved(receipt)).toBe(false);
  });

  it("distinct calm copy per action", () => {
    expect(resolveSavedWorkClaim(okReceipt(), "delete").message).toBe(
      "Removed from My Work.",
    );
    expect(resolveSavedWorkClaim(okReceipt(), "archive").message).toBe(
      "Moved to your archive.",
    );
  });
});
