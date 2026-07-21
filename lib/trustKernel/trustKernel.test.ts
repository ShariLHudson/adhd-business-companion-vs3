import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { emptyCompletionReceipt } from "@/lib/creationCommitCoordinator";
import {
  authorizeMemberClaim,
  isContextFresh,
  TRUST_KERNEL_RULE,
} from "./index";
import type { ActionReceipt } from "./types";

function receipt(stage: ActionReceipt["stage"]): ActionReceipt {
  return {
    stage,
    creationId: "c1",
    eventRecordId: "e1",
    requestId: "r1",
    turnId: "t1",
    conversationThreadId: "th1",
    contextVersion: 1,
    at: new Date().toISOString(),
    creationReceipt: {
      ...emptyCompletionReceipt(),
      eventRecordId: "e1",
      eventRecordBoundToSession: stage !== "intent_recognized",
      createEstateMounted: stage === "member_visible",
      persistSucceeded: true,
      factsPresentOnRecord: true,
    },
  };
}

describe("069 — Trust Kernel", () => {
  it("docs and rule exist", () => {
    expect(TRUST_KERNEL_RULE.isCreationEngine).toBe(false);
    expect(
      existsSync(
        resolve(
          process.cwd(),
          "docs/create-experience/TRUST_ROOT_CAUSE_AUDIT.md",
        ),
      ),
    ).toBe(true);
    expect(
      existsSync(
        resolve(
          process.cwd(),
          "docs/create-experience/standards/069_TRUST_KERNEL_STANDARD.md",
        ),
      ),
    ).toBe(true);
  });

  it("denies opened without member_visible receipt", () => {
    const d = authorizeMemberClaim("opened", receipt("creation_persisted"));
    expect(d.allowed).toBe(false);
    expect(d.missing.some((m) => m.includes("member_visible") || m.includes("creation:"))).toBe(
      true,
    );
  });

  it("allows opened when member_visible + creation receipt complete", () => {
    const d = authorizeMemberClaim("opened", receipt("member_visible"));
    expect(d.allowed).toBe(true);
  });

  it("rejects stale context versions", () => {
    expect(
      isContextFresh({
        resultContextVersion: 1,
        activeContextVersion: 2,
        resultRequestId: "r1",
        activeRequestId: "r1",
      }),
    ).toBe(false);
    expect(
      isContextFresh({
        resultContextVersion: 2,
        activeContextVersion: 2,
        resultRequestId: "r-old",
        activeRequestId: "r-new",
      }),
    ).toBe(false);
    expect(
      isContextFresh({
        resultContextVersion: 2,
        activeContextVersion: 2,
        resultRequestId: "r1",
        activeRequestId: "r1",
      }),
    ).toBe(true);
  });
});
