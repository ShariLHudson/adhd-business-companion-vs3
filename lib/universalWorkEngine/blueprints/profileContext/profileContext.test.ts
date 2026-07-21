/**
 * 273–278 Blueprint Profile Context Connection — schema, audit, and master reports.
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it } from "vitest";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  clearBlueprintRegistryForTests,
  clearWorkTypePackageRegistryForTests,
  ensureBusinessPlanBlueprintsRegistered,
  ensureBusinessPlanWorkTypeRegistered,
  ensureEventBlueprintsRegistered,
  ensureEventPlanWorkTypeRegistered,
  ensureMarketingPlanBlueprintsRegistered,
  ensureMarketingPlanWorkTypeRegistered,
  listBlueprints,
  resetBlueprintAuditForTests,
} from "@/lib/universalWorkEngine";
import {
  buildBlueprintProfileContextAudit,
  certifyBlueprintContextConnection,
  mapKnownContextKey,
  renderContextCertificationDashboardMarkdown,
  renderContextRetrofitBacklogMarkdown,
  renderContextSyncGapRegisterMarkdown,
  renderDependencyMatrixMarkdown,
  renderIsolationTestReportMarkdown,
  renderMasterCanonicalFieldRegistryMarkdown,
  renderMasterContextRegistryMarkdown,
  renderRepeatedQuestionRegisterMarkdown,
  resolveProfileContextManifest,
  seedProfileContextManifestFromKnownContext,
  validateProfileContextManifest,
} from "./index";

function registerAllBlueprints(): void {
  ensureEventPlanWorkTypeRegistered();
  ensureEventBlueprintsRegistered();
  ensureMarketingPlanWorkTypeRegistered();
  ensureMarketingPlanBlueprintsRegistered();
  ensureBusinessPlanWorkTypeRegistered();
  ensureBusinessPlanBlueprintsRegistered();
}

describe("Blueprint profile context connection (273–278)", () => {
  beforeEach(() => {
    clearBlueprintRegistryForTests();
    clearWorkTypePackageRegistryForTests();
    resetBlueprintAuditForTests();
    registerAllBlueprints();
  });

  it("maps known context keys to canonical fields", () => {
    expect(mapKnownContextKey("audience").entity).toBe("client_avatar");
    expect(mapKnownContextKey("offers").canonicalFieldId).toBe("offer.name");
    expect(mapKnownContextKey("active_business").canonicalFieldId).toBe(
      "business.business_id",
    );
  });

  it("seeds a blocked provisional manifest including active business", () => {
    const bp = listBlueprints().find((b) => b.blueprintId === "event.workshop");
    expect(bp).toBeTruthy();
    const manifest = seedProfileContextManifestFromKnownContext(bp!);
    expect(manifest.dependencies.length).toBeGreaterThan(0);
    expect(
      manifest.dependencies.some((d) => d.knownContextKey === "active_business"),
    ).toBe(true);
    expect(manifest.dependencies.every((d) => d.status === "blocked")).toBe(
      true,
    );
    expect(validateProfileContextManifest(manifest)).toEqual([]);
  });

  it("context connection certification blocks all provisional Blueprints", () => {
    const blueprints = listBlueprints();
    expect(blueprints.length).toBeGreaterThanOrEqual(28);
    for (const bp of blueprints) {
      const cert = certifyBlueprintContextConnection(bp);
      expect(["blocked", "fail"]).toContain(cert.result);
      expect(cert.provisionalCount).toBeGreaterThan(0);
    }
  });

  it("builds master audit covering every registered Blueprint", () => {
    const blueprints = listBlueprints();
    const audit = buildBlueprintProfileContextAudit(blueprints);
    expect(audit.certifications.length).toBe(blueprints.length);
    expect(audit.registryRows.length).toBeGreaterThan(blueprints.length);
    expect(audit.gaps.length).toBeGreaterThan(0);
    expect(
      audit.certifications.every(
        (c) => c.result === "blocked" || c.result === "fail",
      ),
    ).toBe(true);
  });

  it("writes repository-derived context connection master docs", () => {
    const blueprints = listBlueprints();
    const audit = buildBlueprintProfileContextAudit(blueprints);
    const generatedAt = "2026-07-21";
    const dir = join(process.cwd(), "docs", "create-experience");
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "273_278_MASTER_BLUEPRINT_CONTEXT_REGISTRY.md"),
      renderMasterContextRegistryMarkdown(audit, generatedAt),
      "utf8",
    );
    writeFileSync(
      join(dir, "273_278_MASTER_CANONICAL_FIELD_REGISTRY.md"),
      renderMasterCanonicalFieldRegistryMarkdown(generatedAt),
      "utf8",
    );
    writeFileSync(
      join(dir, "273_278_BLUEPRINT_TO_PROFILE_DEPENDENCY_MATRIX.md"),
      renderDependencyMatrixMarkdown(audit, generatedAt),
      "utf8",
    );
    writeFileSync(
      join(dir, "273_278_CONTEXT_SYNC_GAP_REGISTER.md"),
      renderContextSyncGapRegisterMarkdown(audit, generatedAt),
      "utf8",
    );
    writeFileSync(
      join(dir, "273_278_REPEATED_QUESTION_REGISTER.md"),
      renderRepeatedQuestionRegisterMarkdown(audit, generatedAt),
      "utf8",
    );
    writeFileSync(
      join(dir, "273_278_CROSS_BUSINESS_ISOLATION_TEST_REPORT.md"),
      renderIsolationTestReportMarkdown(audit, generatedAt),
      "utf8",
    );
    writeFileSync(
      join(dir, "273_278_CONTEXT_RETROFIT_BACKLOG.md"),
      renderContextRetrofitBacklogMarkdown(audit, generatedAt),
      "utf8",
    );
    writeFileSync(
      join(dir, "273_278_CONTEXT_CERTIFICATION_DASHBOARD.md"),
      renderContextCertificationDashboardMarkdown(audit, generatedAt),
      "utf8",
    );

    for (const bp of blueprints) {
      const manifest = resolveProfileContextManifest(bp);
      expect(manifest.dependencies.length).toBeGreaterThan(0);
    }
  });
});
