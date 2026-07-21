/**
 * 104 — Anywhere-Origin Work Certification suite.
 */

import { describe, expect, it } from "vitest";
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { runAnywhereOriginCertification } from "./runAnywhereOriginCertification";

function gitCommit(): string {
  try {
    return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

describe("104 Anywhere-Origin certification", () => {
  it("certifies Event Work Type across origins and Blueprints", () => {
    const result = runAnywhereOriginCertification({
      commitUnderTest: gitCommit(),
      writeArtifacts: true,
    });

    expect(result.schemaVersion).toBe("104.1");
    expect(result.workTypeId).toBe("event_plan");
    expect(result.totals.originsCovered).toBe(14);
    expect(result.totals.blueprintsCovered).toBe(7);
    expect(result.coreScenarios).toHaveLength(14);
    expect(result.releaseBlockers).toEqual([]);
    expect(result.levels.L1_architecture.status).toBe("pass");
    expect(result.levels.L2_automated.status).toBe("pass");
    expect(result.levels.L4_adhd.status).toBe("pass");
    expect(result.levels.L5_domain.status).toBe("pass");
    expect(result.levels.L6_production.status).toBe("pass");
    expect(result.verdict).toBe("WORK TYPE PRODUCTION CERTIFIED");

    for (const scenario of result.coreScenarios) {
      expect(scenario.passed, scenario.origin).toBe(true);
      expect(scenario.workId).toBeTruthy();
    }

    const evidence = join(
      process.cwd(),
      "docs/create-experience/evidence/104_ANYWHERE_ORIGIN_CERTIFICATION_RESULTS.json",
    );
    expect(existsSync(evidence)).toBe(true);
    const written = JSON.parse(readFileSync(evidence, "utf8"));
    expect(written.verdict).toBe("WORK TYPE PRODUCTION CERTIFIED");
  });
});
