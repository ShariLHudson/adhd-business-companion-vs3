/**
 * 233–236 Blueprint Createability — schema, audit, and master reports.
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
  buildBlueprintCreateabilityAudit,
  certifyBlueprintCreateability,
  inferOutputType,
  makeOutputId,
  renderCertificationDashboardMarkdown,
  renderGapRegisterMarkdown,
  renderMasterOutputRegistryMarkdown,
  renderRemediationBacklogMarkdown,
  resolveCreateabilityManifest,
  seedCreateabilityManifestFromDeliverables,
  validateCreateabilityManifest,
} from "./index";

function registerAllBlueprints(): void {
  ensureEventPlanWorkTypeRegistered();
  ensureEventBlueprintsRegistered();
  ensureMarketingPlanWorkTypeRegistered();
  ensureMarketingPlanBlueprintsRegistered();
  ensureBusinessPlanWorkTypeRegistered();
  ensureBusinessPlanBlueprintsRegistered();
}

describe("Blueprint createability (233–236)", () => {
  beforeEach(() => {
    clearBlueprintRegistryForTests();
    clearWorkTypePackageRegistryForTests();
    resetBlueprintAuditForTests();
    registerAllBlueprints();
  });

  it("seeds a blocked provisional manifest from deliverables", () => {
    const bp = listBlueprints().find((b) => b.blueprintId === "event.workshop");
    expect(bp).toBeTruthy();
    const manifest = seedCreateabilityManifestFromDeliverables(bp!);
    expect(manifest.outputs.length).toBe(bp!.deliverables.length);
    expect(manifest.outputs.every((o) => o.provisional && o.status === "blocked")).toBe(
      true,
    );
    expect(validateCreateabilityManifest(manifest)).toEqual([]);
  });

  it("infers output types for common deliverable names", () => {
    expect(inferOutputType("Day-of checklist")).toBe("checklist");
    expect(inferOutputType("Pricing model")).toBe("financial_model");
    expect(inferOutputType("Product photography")).toBe("visual_asset");
    expect(makeOutputId("business.etsy", "Shop About")).toContain("business.etsy");
  });

  it("createability certification blocks all provisional Blueprints", () => {
    const blueprints = listBlueprints();
    expect(blueprints.length).toBeGreaterThanOrEqual(23);
    for (const bp of blueprints) {
      const cert = certifyBlueprintCreateability(bp);
      expect(["blocked", "fail"]).toContain(cert.result);
      expect(cert.provisionalCount).toBeGreaterThan(0);
    }
  });

  it("builds master audit covering every registered deliverable", () => {
    const blueprints = listBlueprints();
    const audit = buildBlueprintCreateabilityAudit(blueprints);
    const promised = blueprints.reduce((n, b) => n + b.deliverables.length, 0);
    expect(audit.registryRows.length).toBe(promised);
    expect(audit.gaps.length).toBe(promised);
    expect(audit.certifications.length).toBe(blueprints.length);
    expect(
      audit.certifications.every(
        (c) => c.result === "blocked" || c.result === "fail",
      ),
    ).toBe(true);
  });

  it("writes repository-derived createability master docs", () => {
    const blueprints = listBlueprints();
    const audit = buildBlueprintCreateabilityAudit(blueprints);
    const generatedAt = "2026-07-21";
    const dir = join(process.cwd(), "docs", "create-experience");
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "233_236_MASTER_BLUEPRINT_OUTPUT_REGISTRY.md"),
      renderMasterOutputRegistryMarkdown(audit, generatedAt),
      "utf8",
    );
    writeFileSync(
      join(dir, "233_236_MASTER_CREATEABILITY_GAP_REGISTER.md"),
      renderGapRegisterMarkdown(audit, generatedAt),
      "utf8",
    );
    writeFileSync(
      join(dir, "233_236_BLUEPRINT_REMEDIATION_BACKLOG.md"),
      renderRemediationBacklogMarkdown(audit, generatedAt),
      "utf8",
    );
    writeFileSync(
      join(dir, "233_236_BLUEPRINT_CERTIFICATION_DASHBOARD.md"),
      renderCertificationDashboardMarkdown(audit, generatedAt),
      "utf8",
    );

    for (const bp of blueprints) {
      const manifest = resolveCreateabilityManifest(bp);
      expect(manifest.outputs.length).toBe(bp.deliverables.length);
    }
  });
});
