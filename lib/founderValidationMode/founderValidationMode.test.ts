/**
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  CERTIFY_CONFIRMATION_PHRASE,
  STATUS_CHANGE_CONFIRMATION_PHRASE,
  applyApprovedOverlay,
  buildApprovalRecord,
  buildFounderValidationDashboard,
  canApproveStatusChange,
  emptyValidationStore,
  finishJourneyRun,
  getOverlay,
  startJourneyRun,
} from "./index";

describe("Founder Validation Mode", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("evidence README exists", () => {
    expect(
      existsSync(
        resolve(process.cwd(), "docs/create-experience/evidence/README.md"),
      ),
    ).toBe(true);
  });

  it("records a run without setting CERTIFIED", () => {
    let store = emptyValidationStore();
    const started = startJourneyRun(store, "J-001");
    store = started.store;
    store = finishJourneyRun(store, started.run.id, {
      browserVerdict: "pass",
      emotionalVerdict: "pass",
      notes: "Looks good in Preview",
      screenshots: [
        {
          id: "s1",
          reference: "docs/create-experience/evidence/runs/J-001/shot.png",
          caption: "Welcome back",
          addedAt: new Date().toISOString(),
        },
      ],
      emotionalChecklist: started.run.emotionalChecklist,
      criteriaChecked: { same_record: true },
    });
    const overlay = getOverlay(store, "J-001");
    expect(overlay.browser).toBe("PASS");
    expect(overlay.emotional).toBe("PASS");
    expect(overlay.certification).not.toBe("CERTIFIED");
  });

  it("blocks CERTIFIED without exact approval phrase", () => {
    const gate = canApproveStatusChange(
      {
        journeyId: "J-001",
        toBrowser: "PASS",
        toEmotional: "PASS",
        toCertification: "CERTIFIED",
      },
      "looks good",
    );
    expect(gate.allowed).toBe(false);
    expect(gate.blockers.join(" ")).toContain(CERTIFY_CONFIRMATION_PHRASE);
  });

  it("allows CERTIFIED only with phrase + PASS browser/emotional", () => {
    const gate = canApproveStatusChange(
      {
        journeyId: "J-001",
        toBrowser: "PASS",
        toEmotional: "PASS",
        toCertification: "CERTIFIED",
      },
      CERTIFY_CONFIRMATION_PHRASE,
    );
    expect(gate.allowed).toBe(true);

    let store = emptyValidationStore();
    const from = getOverlay(store, "J-001");
    const proposed = {
      journeyId: "J-001" as const,
      toBrowser: "PASS" as const,
      toEmotional: "PASS" as const,
      toCertification: "CERTIFIED" as const,
    };
    const approval = buildApprovalRecord({
      journeyId: "J-001",
      approvedBy: "Shari",
      confirmationPhrase: CERTIFY_CONFIRMATION_PHRASE,
      from,
      to: proposed,
    });
    store = applyApprovedOverlay(store, approval, {
      ...from,
      ...proposed,
      browser: proposed.toBrowser,
      emotional: proposed.toEmotional,
      certification: proposed.toCertification,
      updatedAt: new Date().toISOString(),
    });
    expect(getOverlay(store, "J-001").certification).toBe("CERTIFIED");

    const dash = buildFounderValidationDashboard(store);
    expect(
      dash.find((r) => r.capabilityId === "J-001")?.certification,
    ).toBe("CERTIFIED");
  });

  it("requires status-change phrase for non-CERTIFIED updates", () => {
    const denied = canApproveStatusChange(
      {
        journeyId: "J-002",
        toBrowser: "PASS",
        toEmotional: "NOT_RUN",
        toCertification: "TESTING",
      },
      "",
    );
    expect(denied.allowed).toBe(false);
    const ok = canApproveStatusChange(
      {
        journeyId: "J-002",
        toBrowser: "PASS",
        toEmotional: "NOT_RUN",
        toCertification: "TESTING",
      },
      STATUS_CHANGE_CONFIRMATION_PHRASE,
    );
    expect(ok.allowed).toBe(true);
  });
});
