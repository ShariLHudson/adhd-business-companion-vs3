import { describe, expect, it } from "vitest";
import type { EvidenceEntry } from "@/lib/evidenceBankStore";
import { durableRecordFail, durableRecordOk } from "./types";
import type { MemberRecord } from "./types";
import {
  mayClaimEvidenceSaved,
  resolveEvidenceVaultClaim,
} from "./evidenceVaultClaims";

function okReceipt() {
  const record: MemberRecord<EvidenceEntry> = {
    userId: "u1",
    domain: "evidence_vault",
    recordId: "ev-1",
    status: "active",
    schemaVersion: 1,
    version: 1,
    payload: {} as EvidenceEntry,
    createdAt: "2026-07-31T00:00:00.000Z",
    updatedAt: "2026-07-31T00:00:00.000Z",
  };
  return durableRecordOk(record);
}

describe("evidence_vault completion-integrity claims", () => {
  it("says saved ONLY when ok && durable", () => {
    const claim = resolveEvidenceVaultClaim(okReceipt(), "create");
    expect(claim.status).toBe("durably_saved");
    expect(claim.durable).toBe(true);
    expect(claim.message).toBe("Saved to your Evidence Vault.");
    expect(mayClaimEvidenceSaved(okReceipt())).toBe(true);
  });

  it("a retryable failure is retained, offers retry, uses calm receipt copy", () => {
    const receipt = durableRecordFail(
      "DB_WRITE_FAILED",
      "That didn't finish saving securely. Your evidence is still on screen — Retry.",
      true,
      "pg: connection reset", // technical cause
    );
    const claim = resolveEvidenceVaultClaim(receipt, "save");
    expect(claim.status).toBe("retained_for_retry");
    expect(claim.durable).toBe(false);
    expect(claim.retryable).toBe(true);
    expect(claim.message).toContain("still on screen");
    expect(claim.message).not.toContain("connection reset");
    expect(mayClaimEvidenceSaved(receipt)).toBe(false);
  });

  it("a non-retryable failure does not offer retry", () => {
    const receipt = durableRecordFail(
      "INVALID_PAYLOAD",
      "Something about this couldn't be saved safely. Your evidence is still on screen.",
      false,
    );
    const claim = resolveEvidenceVaultClaim(receipt, "create");
    expect(claim.status).toBe("failed");
    expect(claim.retryable).toBe(false);
    expect(mayClaimEvidenceSaved(receipt)).toBe(false);
  });

  it("distinct calm copy per action", () => {
    expect(resolveEvidenceVaultClaim(okReceipt(), "delete").message).toBe(
      "Removed from your Evidence Vault.",
    );
    expect(resolveEvidenceVaultClaim(okReceipt(), "update").message).toBe(
      "Saved.",
    );
  });
});
