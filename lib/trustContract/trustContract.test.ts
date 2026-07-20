import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  HONEST_PROMISE_ALTERNATIVES,
  TRUST_CONTRACT_AUDIT_FINDINGS,
  TRUST_CONTRACT_STANDARD_ID,
  detectConversationalPromises,
  hasUnverifiedPromise,
  listOpenTrustViolations,
  scrubUnverifiedPromises,
  trustContractSatisfied,
} from "./index";

describe("067 — Trust Contract", () => {
  it("standard document exists", () => {
    expect(
      existsSync(
        resolve(
          process.cwd(),
          "docs/create-experience/standards/067_TRUST_CONTRACT_STANDARD.md",
        ),
      ),
    ).toBe(true);
    expect(TRUST_CONTRACT_STANDARD_ID).toBe("067");
  });

  it("detects and scrubs false save claims", () => {
    const claim = "Got it — I saved that with your other thoughts.";
    expect(detectConversationalPromises(claim).some((p) => p.kind === "saved")).toBe(
      true,
    );
    expect(hasUnverifiedPromise(claim, {})).toBe(true);
    const scrubbed = scrubUnverifiedPromises(claim, {});
    expect(scrubbed).toBe(HONEST_PROMISE_ALTERNATIVES.saved);
    expect(scrubbed).not.toMatch(/I saved/i);
  });

  it("allows save claim only with persist evidence", () => {
    const claim = "Got it — I saved that with your other thoughts.";
    expect(
      scrubUnverifiedPromises(claim, { persistSucceeded: true }),
    ).toMatch(/I saved/i);
  });

  it("strips UI mechanics always", () => {
    const scrubbed = scrubUnverifiedPromises(
      "Your workspace is open — edit sections on the right.",
      { workspaceVerified: true },
    );
    expect(scrubbed).not.toMatch(/on the right/i);
  });

  it("audit findings track Sprint 4 work honestly", () => {
    expect(TRUST_CONTRACT_AUDIT_FINDINGS.length).toBeGreaterThan(3);
    expect(
      TRUST_CONTRACT_AUDIT_FINDINGS.some(
        (f) => f.kind === "saved" && f.status === "fixed",
      ),
    ).toBe(true);
    // Remembered patterns still open — contract not fully satisfied
    expect(listOpenTrustViolations().length).toBeGreaterThan(0);
    expect(trustContractSatisfied()).toBe(false);
  });
});
