/**
 * 295–300 Master Shared Object Library — schema, audit, authority honesty, masters.
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it } from "vitest";
import { mkdirSync, writeFileSync } from "node:fs";
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
  authorityFromCreateabilityState,
  buildBlueprintSharedObjectAudit,
  certifyBlueprintSharedObjects,
  mapLabelToSharedObject,
  MASTER_OBJECT_TYPES,
  NON_DUPLICATION_OBJECT_TYPES,
  renderBlueprintObjectDependencyMatrixMarkdown,
  renderDuplicateObjectAuditMarkdown,
  renderExtensionRegistryMarkdown,
  renderExternalMappingRegistryMarkdown,
  renderMasterFieldRegistryMarkdown,
  renderMasterObjectTypeRegistryMarkdown,
  renderMasterRelationshipRegistryMarkdown,
  renderMigrationPlanMarkdown,
  renderPermissionRegistryMarkdown,
  renderSharedObjectCertificationDashboardMarkdown,
  renderSharedObjectGapRegisterMarkdown,
  renderValidationRegistryMarkdown,
  resolveSharedObjectManifest,
  seedSharedObjectManifestFromBlueprint,
  validateSharedObjectManifest,
} from "./index";

function registerAllBlueprints(): void {
  ensureEventPlanWorkTypeRegistered();
  ensureEventBlueprintsRegistered();
  ensureMarketingPlanWorkTypeRegistered();
  ensureMarketingPlanBlueprintsRegistered();
  ensureBusinessPlanWorkTypeRegistered();
  ensureBusinessPlanBlueprintsRegistered();
}

describe("Master Shared Object Library (295–300)", () => {
  beforeEach(() => {
    clearBlueprintRegistryForTests();
    clearWorkTypePackageRegistryForTests();
    resetBlueprintAuditForTests();
    registerAllBlueprints();
  });

  it("registers canonical object types with required identity fields", () => {
    expect(MASTER_OBJECT_TYPES.length).toBeGreaterThan(40);
    for (const o of MASTER_OBJECT_TYPES) {
      expect(o.identityField).toBeTruthy();
      expect(o.requiredFields.length).toBeGreaterThan(0);
      expect(o.defaultAuthority).toBeTruthy();
    }
    expect(NON_DUPLICATION_OBJECT_TYPES).toContain("person");
    expect(NON_DUPLICATION_OBJECT_TYPES).toContain("create_artifact");
  });

  it("maps labels to create / prepare / user_provided / completed_elsewhere", () => {
    expect(mapLabelToSharedObject("Retail Business Snapshot").creationAuthority).toBe(
      "fully_create",
    );
    expect(mapLabelToSharedObject("Pricing Model").creationAuthority).toBe("prepare");
    expect(mapLabelToSharedObject("Customer Journey Map").objectTypeId).toBe(
      "client_avatar",
    );
    expect(mapLabelToSharedObject("Payment receipt").creationAuthority).toBe(
      "completed_elsewhere",
    );
    expect(authorityFromCreateabilityState("draft_only")).toBe("prepare");
    expect(authorityFromCreateabilityState("connected")).toBe("completed_elsewhere");
  });

  it("seeds blocked provisional manifests with required system objects", () => {
    const bp = listBlueprints().find((b) => b.blueprintId === "business.ecommerce");
    expect(bp).toBeTruthy();
    const manifest = seedSharedObjectManifestFromBlueprint(bp!);
    expect(validateSharedObjectManifest(manifest)).toEqual([]);
    const types = new Set(manifest.dependencies.map((d) => d.objectTypeId));
    expect(types.has("business")).toBe(true);
    expect(types.has("universal_work")).toBe(true);
    expect(types.has("create_artifact")).toBe(true);
    expect(types.has("project")).toBe(true);
    expect(manifest.dependencies.every((d) => d.status === "blocked")).toBe(true);
    expect(
      manifest.dependencies.some((d) => d.creationAuthority === "user_provided"),
    ).toBe(true);
    expect(
      manifest.dependencies.some((d) => d.creationAuthority === "completed_elsewhere"),
    ).toBe(true);
  });

  it("shared object certification blocks all provisional Blueprints", () => {
    const blueprints = listBlueprints();
    expect(blueprints.length).toBeGreaterThanOrEqual(31);
    for (const bp of blueprints) {
      const cert = certifyBlueprintSharedObjects(bp);
      expect(["blocked", "fail"]).toContain(cert.result);
      expect(cert.provisionalCount).toBeGreaterThan(0);
      expect(
        cert.authorityCounts.fully_create +
          cert.authorityCounts.prepare +
          cert.authorityCounts.user_provided +
          cert.authorityCounts.completed_elsewhere,
      ).toBe(cert.dependencyCount);
    }
  });

  it("builds audit covering object types, relationships, and duplicates", () => {
    const blueprints = listBlueprints();
    const audit = buildBlueprintSharedObjectAudit(blueprints);
    expect(audit.certifications.length).toBe(blueprints.length);
    expect(audit.dependencyRows.length).toBeGreaterThan(blueprints.length);
    expect(audit.duplicates.length).toBe(NON_DUPLICATION_OBJECT_TYPES.length);
    expect(audit.relationships.some((r) => r.relationshipTypeId === "create_to_project")).toBe(
      true,
    );
  });

  it("writes repository-derived shared object master docs", () => {
    const blueprints = listBlueprints();
    const audit = buildBlueprintSharedObjectAudit(blueprints);
    const generatedAt = "2026-07-21";
    const dir = join(process.cwd(), "docs", "create-experience");
    mkdirSync(dir, { recursive: true });

    const writes: Array<[string, string]> = [
      [
        "295_300_MASTER_OBJECT_TYPE_REGISTRY.md",
        renderMasterObjectTypeRegistryMarkdown(audit, generatedAt),
      ],
      [
        "295_300_MASTER_FIELD_REGISTRY.md",
        renderMasterFieldRegistryMarkdown(audit, generatedAt),
      ],
      [
        "295_300_MASTER_RELATIONSHIP_REGISTRY.md",
        renderMasterRelationshipRegistryMarkdown(audit, generatedAt),
      ],
      [
        "295_300_BLUEPRINT_OBJECT_DEPENDENCY_MATRIX.md",
        renderBlueprintObjectDependencyMatrixMarkdown(audit, generatedAt),
      ],
      [
        "295_300_EXTENSION_REGISTRY.md",
        renderExtensionRegistryMarkdown(generatedAt),
      ],
      [
        "295_300_DUPLICATE_OBJECT_AUDIT.md",
        renderDuplicateObjectAuditMarkdown(audit, generatedAt),
      ],
      ["295_300_MIGRATION_PLAN.md", renderMigrationPlanMarkdown(audit, generatedAt)],
      [
        "295_300_VALIDATION_REGISTRY.md",
        renderValidationRegistryMarkdown(audit, generatedAt),
      ],
      [
        "295_300_PERMISSION_REGISTRY.md",
        renderPermissionRegistryMarkdown(generatedAt),
      ],
      [
        "295_300_EXTERNAL_MAPPING_REGISTRY.md",
        renderExternalMappingRegistryMarkdown(generatedAt),
      ],
      [
        "295_300_SHARED_OBJECT_GAP_REGISTER.md",
        renderSharedObjectGapRegisterMarkdown(audit, generatedAt),
      ],
      [
        "295_300_CERTIFICATION_DASHBOARD.md",
        renderSharedObjectCertificationDashboardMarkdown(audit, generatedAt),
      ],
    ];

    for (const [name, body] of writes) {
      writeFileSync(join(dir, name), body, "utf8");
    }

    for (const bp of blueprints) {
      expect(resolveSharedObjectManifest(bp).dependencies.length).toBeGreaterThan(0);
    }
  });
});
