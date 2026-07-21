/**
 * Sprint T1 — Trust Kernel sole-egress proofs (T1-01 … T1-10).
 */

import { describe, expect, it, beforeEach } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  authorizeCreationEgress,
  beginCreationOperation,
  clearCreationOperationLocks,
  emptyCreationEvidence,
  endCreationOperation,
  isCreationResultApplicable,
  proposedMessageNeedsCreationAuthorization,
  CREATION_PENDING_LANGUAGE,
} from "./index";

function evidence(
  overrides: Parameters<typeof emptyCreationEvidence>[0],
) {
  return emptyCreationEvidence({
    actionId: "a1",
    requestId: "r1",
    turnId: "t1",
    creationId: "evt-1",
    creationType: "Workshop",
    operation: "open",
    intentRecognized: true,
    contextVersion: 1,
    ...overrides,
  });
}

describe("Sprint T1 — Trust Kernel sole egress", () => {
  beforeEach(() => {
    clearCreationOperationLocks();
  });

  it("T1-01 — Creation success cannot emit before record persistence", () => {
    const result = authorizeCreationEgress({
      claim: "created",
      proposedMessage: "I've created your workshop.",
      evidence: evidence({
        recordCreated: true,
        recordPersisted: false,
        failureState: "persist_failed",
      }),
    });
    expect(result.authorized).toBe(false);
    expect(result.text).not.toMatch(/I've created/i);
    expect(result.text).toMatch(/couldn't finish saving|still here|received that/i);
  });

  it("T1-02 — Workspace-open claim cannot emit before mount confirmation", () => {
    const result = authorizeCreationEgress({
      claim: "opened",
      proposedMessage: "I've opened your workshop workspace.",
      evidence: evidence({
        recordPersisted: true,
        workspaceBound: true,
        workspaceMounted: false,
        memberVisible: false,
        failureState: "mount_failed",
      }),
    });
    expect(result.authorized).toBe(false);
    expect(result.text).not.toMatch(/I've opened/i);
    expect(result.text).toBe(CREATION_PENDING_LANGUAGE.mountFailed);
  });

  it("T1-03 — Resume claim cannot emit without exact creationId indexing", () => {
    const result = authorizeCreationEgress({
      claim: "continue",
      proposedMessage: "We can continue where you left off.",
      evidence: evidence({
        recordPersisted: true,
        workspaceBound: true,
        workspaceMounted: true,
        memberVisible: true,
        resumeIndexed: false,
        creationId: "evt-1",
      }),
    });
    expect(result.authorized).toBe(false);
    expect(result.text).not.toMatch(/continue where you left off/i);
  });

  it("T1-04 — Local Create replies cannot bypass Trust Kernel (needs auth helper)", () => {
    expect(
      proposedMessageNeedsCreationAuthorization(
        "I've opened your Event workspace — we'll keep going.",
      ),
    ).toBe(true);
    expect(
      proposedMessageNeedsCreationAuthorization(
        "What is the primary outcome?",
      ),
    ).toBe(false);
  });

  it("T1-05 — Stale async response cannot overwrite active creation", () => {
    expect(
      isCreationResultApplicable({
        resultRequestId: "r-old",
        activeRequestId: "r-new",
        resultContextVersion: 1,
        activeContextVersion: 2,
        resultCreationId: "evt-1",
        activeCreationId: "evt-1",
      }),
    ).toBe(false);
    expect(
      isCreationResultApplicable({
        resultRequestId: "r1",
        activeRequestId: "r1",
        resultContextVersion: 2,
        activeContextVersion: 2,
        resultCreationId: "evt-other",
        activeCreationId: "evt-1",
      }),
    ).toBe(false);
    expect(
      isCreationResultApplicable({
        resultRequestId: "r1",
        activeRequestId: "r1",
        resultContextVersion: 2,
        activeContextVersion: 2,
        resultCreationId: "evt-1",
        activeCreationId: "evt-1",
      }),
    ).toBe(true);
  });

  it("T1-06 — Failed operation produces truthful recovery language", () => {
    const result = authorizeCreationEgress({
      claim: "opened",
      proposedMessage: "I've opened your workshop.",
      evidence: evidence({
        recordPersisted: true,
        workspaceBound: false,
        workspaceMounted: false,
        memberVisible: false,
        failureState: "mount_failed",
        recoveryAvailable: true,
      }),
    });
    expect(result.authorized).toBe(false);
    expect(result.claimDelivered).toMatch(/pending|recovery/);
    expect(result.text).toBe(CREATION_PENDING_LANGUAGE.mountFailed);
  });

  it("T1-07 — No Creation path reopens permanent chat-over-workspace (066)", () => {
    const client = readFileSync(
      resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    // openUniversalCreationFromText must coerce workspace-focus and hide chat when authorized
    expect(client).toContain("authorizeCreationEgress");
    expect(client).toContain('coerceLayoutForWorkspaceOpen("create", "workspace-focus")');
    const fnStart = client.indexOf("function openUniversalCreationFromText");
    const fnSlice = client.slice(fnStart, fnStart + 9000);
    expect(fnSlice).toContain("setEstateRoomChatVisible(false)");
    // Must not open Create via chatLayoutMode split inside that function
    expect(fnSlice).not.toMatch(/chatLayoutMode:\s*"split"/);
    expect(fnSlice).not.toMatch(/applyChatLayoutMode\(\s*"split"/);
  });

  it("T1-08 — Same user action produces one receipt and one member-visible claim lock", () => {
    expect(beginCreationOperation("open:workshop", "a1")).toBe(true);
    expect(beginCreationOperation("open:workshop", "a2")).toBe(false);
    endCreationOperation("open:workshop", "a1");
    expect(beginCreationOperation("open:workshop", "a2")).toBe(true);

    const once = authorizeCreationEgress({
      claim: "opened",
      proposedMessage: "Let's work on your workshop together.",
      evidence: evidence({
        recordPersisted: true,
        workspaceBound: true,
        workspaceMounted: true,
        memberVisible: true,
        resumeIndexed: true,
        currentFocusAvailable: true,
      }),
    });
    expect(once.authorized).toBe(true);
    expect(once.receipt.creationId).toBe("evt-1");
    expect(once.receipt.stage).toMatch(/member_visible|resume_available/);
  });

  it("T1-09 — No internal diagnostic / UI mechanics reach the member", () => {
    const result = authorizeCreationEgress({
      claim: "opened",
      proposedMessage:
        "I've opened your workshop beside chat in the split view panel on the right.",
      evidence: evidence({
        recordPersisted: true,
        workspaceBound: true,
        workspaceMounted: true,
        memberVisible: true,
        resumeIndexed: true,
      }),
    });
    expect(result.text).not.toMatch(/beside chat|split view|panel on the right/i);
    expect(result.text).not.toMatch(/Failed to fetch|webpack|AbortError/i);
  });

  it("T1-10 — Member message remains available after downstream Creation failure", () => {
    // Contract: egress never clears user text; recovery language preserves work
    const result = authorizeCreationEgress({
      claim: "opened",
      proposedMessage: "I've opened your workshop.",
      evidence: evidence({
        recordPersisted: true,
        workspaceBound: false,
        memberVisible: false,
        failureState: "mount_failed",
        recoveryAvailable: true,
      }),
    });
    expect(result.authorized).toBe(false);
    expect(result.text).toMatch(/details are safe|still here|getting your workshop ready/i);
    // CPC wiring: user message set before assistant — proven by source order
    const client = readFileSync(
      resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    const fnStart = client.indexOf("function openUniversalCreationFromText");
    const fnSlice = client.slice(fnStart, fnStart + 9000);
    const userIdx = fnSlice.indexOf('role: "user", content: text');
    const egressIdx = fnSlice.indexOf("authorizeCreationEgress");
    expect(userIdx).toBeGreaterThan(-1);
    expect(egressIdx).toBeGreaterThan(userIdx);
  });

  it("docs: Sprint T1 hardening report exists", () => {
    expect(
      existsSync(
        resolve(
          process.cwd(),
          "docs/create-experience/HARDENING_SPRINT_T1_TRUST_KERNEL_EGRESS.md",
        ),
      ),
    ).toBe(true);
  });
});
