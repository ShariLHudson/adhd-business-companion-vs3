import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  assessCertification,
  assessCompanionArtifacts,
  buildCertificationDashboard,
  canMarkCertified,
  CERTIFICATION_JOURNEYS,
  CERTIFICATION_SPEC_TEMPLATE_PATH,
  CROSS_ENTRY_TRACE_MATRIX,
  IMPLEMENTATION_SPEC_TEMPLATE_PATH,
  MASTER_STANDARDS_MATRIX,
  matrixHasInvalidCertificationClaims,
  platformCertificationBlockedBy,
  REQUIREMENT_TRACE_MATRIX,
  severityBlocksCertification,
} from "./index";

describe("062/063 — Implementation certification & traceability", () => {
  it("blocks CERTIFIED when browser proof or defects remain", () => {
    expect(
      canMarkCertified({
        governingStandard: "055",
        implementationSpec: null,
        unitPass: true,
        integrationPass: true,
        browserPass: false,
        accessibilityPass: true,
        typecheckPass: true,
        criticalDefects: 0,
        highDefects: 0,
        knownLimitationsDocumented: true,
        traceabilityComplete: true,
      }),
    ).toBe(false);

    expect(
      assessCertification({
        governingStandard: "055",
        implementationSpec: "spec",
        unitPass: true,
        integrationPass: true,
        browserPass: true,
        accessibilityPass: true,
        typecheckPass: true,
        criticalDefects: 1,
        highDefects: 0,
        knownLimitationsDocumented: true,
        traceabilityComplete: true,
      }).status,
    ).toBe("BLOCKED");

    expect(severityBlocksCertification("critical")).toBe(true);
    expect(severityBlocksCertification("high")).toBe(true);
    expect(severityBlocksCertification("medium")).toBe(false);
  });

  it("allows CERTIFIED only when all hard gates pass", () => {
    const decision = assessCertification({
      governingStandard: "062",
      implementationSpec: "docs/...",
      unitPass: true,
      integrationPass: true,
      browserPass: true,
      accessibilityPass: true,
      typecheckPass: true,
      criticalDefects: 0,
      highDefects: 0,
      knownLimitationsDocumented: true,
      traceabilityComplete: true,
    });
    expect(decision.allowed).toBe(true);
    expect(decision.status).toBe("CERTIFIED");
  });

  it("matrix covers published standards 045–063 and forbids invalid CERTIFIED claims", () => {
    const ids = MASTER_STANDARDS_MATRIX.map((r) => r.standardId);
    for (const id of [
      "045",
      "050",
      "051",
      "055",
      "056",
      "057",
      "058",
      "059",
      "060",
      "061",
      "062",
      "063",
      "066",
      "067",
      "068",
      "069",
    ]) {
      expect(ids).toContain(id);
    }
    expect(matrixHasInvalidCertificationClaims()).toEqual([]);
    expect(
      MASTER_STANDARDS_MATRIX.every((r) => r.certification !== "CERTIFIED"),
    ).toBe(true);
  });

  it("every matrix governing doc file exists", () => {
    for (const row of MASTER_STANDARDS_MATRIX) {
      expect(
        existsSync(resolve(process.cwd(), row.governingDoc)),
        row.governingDoc,
      ).toBe(true);
    }
  });

  it("requirement + cross-entry matrices expose real gaps (blank/NOT_RUN visible)", () => {
    expect(REQUIREMENT_TRACE_MATRIX.length).toBeGreaterThan(5);
    expect(CROSS_ENTRY_TRACE_MATRIX.some((r) => r.browserProof === "NOT_RUN")).toBe(
      true,
    );
    expect(
      REQUIREMENT_TRACE_MATRIX.some(
        (r) => r.requirementId === "062-R001" && r.status === "PASS",
      ),
    ).toBe(true);
  });

  it("missing browser validation remains visible on creation standards", () => {
    const creation = MASTER_STANDARDS_MATRIX.filter((r) =>
      ["055", "056", "059", "060", "061"].includes(r.standardId),
    );
    expect(creation.every((r) => r.browser === "NOT_RUN")).toBe(true);
  });

  it("Sprint 3 — journeys and dashboard never claim CERTIFIED without browser", () => {
    expect(CERTIFICATION_JOURNEYS.every((j) => j.browser !== "PASS")).toBe(true);
    expect(CERTIFICATION_JOURNEYS.every((j) => j.certification !== "CERTIFIED")).toBe(
      true,
    );
    expect(platformCertificationBlockedBy().length).toBeGreaterThan(0);
    const dash = buildCertificationDashboard();
    expect(dash.some((r) => r.capabilityId === "J-001")).toBe(true);
    expect(dash.every((r) => r.certification !== "CERTIFIED")).toBe(true);
    expect(CROSS_ENTRY_TRACE_MATRIX.some((r) => r.journey.startsWith("J-001"))).toBe(
      true,
    );
  });

  it("064/065 templates exist and companion artifact gate requires all four", () => {
    expect(existsSync(resolve(process.cwd(), IMPLEMENTATION_SPEC_TEMPLATE_PATH))).toBe(
      true,
    );
    expect(existsSync(resolve(process.cwd(), CERTIFICATION_SPEC_TEMPLATE_PATH))).toBe(
      true,
    );
    expect(
      MASTER_STANDARDS_MATRIX.some((r) => r.standardId === "064"),
    ).toBe(true);
    expect(
      MASTER_STANDARDS_MATRIX.some((r) => r.standardId === "065"),
    ).toBe(true);

    const incomplete = assessCompanionArtifacts({
      governingStandard: "056",
      implementationSpec: null,
      certificationSpec: null,
      traceabilityUpdated: false,
    });
    expect(incomplete.complete).toBe(false);
    expect(incomplete.missing.length).toBe(3);

    const complete = assessCompanionArtifacts({
      governingStandard: "056",
      implementationSpec:
        "docs/create-experience/specs/056_CREATE_EXPERIENCE_IMPLEMENTATION_SPECIFICATION.md",
      certificationSpec:
        "docs/create-experience/specs/056_CREATE_EXPERIENCE_CERTIFICATION_SPECIFICATION.md",
      traceabilityUpdated: true,
    });
    expect(complete.complete).toBe(true);
    expect(complete.missing).toEqual([]);
    expect(
      existsSync(
        resolve(
          process.cwd(),
          "docs/create-experience/specs/056_CREATE_EXPERIENCE_IMPLEMENTATION_SPECIFICATION.md",
        ),
      ),
    ).toBe(true);
    expect(
      existsSync(
        resolve(
          process.cwd(),
          "docs/create-experience/specs/056_CREATE_EXPERIENCE_CERTIFICATION_SPECIFICATION.md",
        ),
      ),
    ).toBe(true);
  });
});
