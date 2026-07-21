import type { BlueprintSharedObjectAuditBundle } from "./buildMasterRegistry";

function severityRank(s: string): number {
  switch (s) {
    case "critical":
      return 0;
    case "high":
      return 1;
    case "moderate":
      return 2;
    default:
      return 3;
  }
}

export function renderMasterObjectTypeRegistryMarkdown(
  audit: BlueprintSharedObjectAuditBundle,
  generatedAt: string,
): string {
  const lines = [
    "# Master Object Type Registry",
    "",
    "**Standard:** 295–300 Master Shared Object Library",
    `**Generated:** ${generatedAt}`,
    "",
    "Spark must distinguish **fully create · prepare · user-provided · completed elsewhere** for every object dependency.",
    "",
    "| Object type | Name | Family | Identity | Default authority | Required fields |",
    "|---|---|---|---|---|---|",
  ];
  for (const o of audit.objectTypes) {
    lines.push(
      `| \`${o.objectTypeId}\` | ${o.name} | ${o.family} | \`${o.identityField}\` | **${o.defaultAuthority}** | ${o.requiredFields.join(", ")} |`,
    );
  }
  lines.push("", `**Total object types:** ${audit.objectTypes.length}`, "");
  return lines.join("\n");
}

export function renderMasterFieldRegistryMarkdown(
  audit: BlueprintSharedObjectAuditBundle,
  generatedAt: string,
): string {
  const lines = [
    "# Master Field Registry",
    "",
    "**Standard:** 295 / 296–299",
    `**Generated:** ${generatedAt}`,
    "",
    "| Object type | Field | Required |",
    "|---|---|---|",
  ];
  for (const o of audit.objectTypes) {
    for (const f of o.requiredFields) {
      lines.push(`| \`${o.objectTypeId}\` | \`${f}\` | yes |`);
    }
  }
  lines.push("");
  return lines.join("\n");
}

export function renderMasterRelationshipRegistryMarkdown(
  audit: BlueprintSharedObjectAuditBundle,
  generatedAt: string,
): string {
  const lines = [
    "# Master Relationship Registry",
    "",
    "**Standard:** 295–300",
    `**Generated:** ${generatedAt}`,
    "",
    "| Relationship | Source | Target | Notes |",
    "|---|---|---|---|",
  ];
  for (const r of audit.relationships) {
    lines.push(
      `| \`${r.relationshipTypeId}\` | ${r.sourceTypes.join(", ")} | ${r.targetTypes.join(", ")} | ${(r.notes ?? "").replace(/\|/g, "/")} |`,
    );
  }
  lines.push("", `**Total relationships:** ${audit.relationships.length}`, "");
  return lines.join("\n");
}

export function renderBlueprintObjectDependencyMatrixMarkdown(
  audit: BlueprintSharedObjectAuditBundle,
  generatedAt: string,
): string {
  const lines = [
    "# Blueprint Object Dependency Matrix",
    "",
    "**Standard:** 300 Phase 4",
    `**Generated:** ${generatedAt}`,
    "",
    "| Blueprint | Object | Authority | Source | Status | Label |",
    "|---|---|---|---|---|---|",
  ];
  for (const r of audit.dependencyRows) {
    lines.push(
      `| \`${r.blueprintId}\` | \`${r.objectTypeId}\` | **${r.creationAuthority}** | ${r.source} | ${r.status} | ${r.sourceLabel.replace(/\|/g, "/")} |`,
    );
  }
  lines.push("", `**Rows:** ${audit.dependencyRows.length}`, "");
  return lines.join("\n");
}

export function renderExtensionRegistryMarkdown(generatedAt: string): string {
  return [
    "# Extension Registry",
    "",
    "**Standard:** 295",
    `**Generated:** ${generatedAt}`,
    "",
    "Industry-specific behavior must use **extensions**, relationships, or additional fields — not disconnected duplicate root types.",
    "",
    "| Extension ID | Extends | Status | Notes |",
    "|---|---|---|---|",
    "| _(none registered)_ | — | pending | Hand-authored extensions land here after Collection owners declare them |",
    "",
  ].join("\n");
}

export function renderDuplicateObjectAuditMarkdown(
  audit: BlueprintSharedObjectAuditBundle,
  generatedAt: string,
): string {
  const lines = [
    "# Duplicate Object Audit",
    "",
    "**Standard:** 300 Phase 2",
    `**Generated:** ${generatedAt}`,
    "",
    "| Concept | Object type | Model class | Finding | Remediation |",
    "|---|---|---|---|---|",
  ];
  for (const d of audit.duplicates) {
    lines.push(
      `| ${d.concept} | \`${d.objectTypeId}\` | ${d.modelClass} | ${d.finding.replace(/\|/g, "/")} | ${d.remediation.replace(/\|/g, "/")} |`,
    );
  }
  lines.push("");
  return lines.join("\n");
}

export function renderMigrationPlanMarkdown(
  audit: BlueprintSharedObjectAuditBundle,
  generatedAt: string,
): string {
  return [
    "# Shared Object Migration Plan",
    "",
    "**Standard:** 300 Phase 5",
    `**Generated:** ${generatedAt}`,
    "",
    "## Approach",
    "",
    "1. Classify every competing model (Phase 3).",
    "2. Preserve IDs, history, provenance, relationships, and access controls.",
    "3. Migrate duplicates into canonical destinations before Shared Object cert can pass.",
    "4. Rollback and validation required for each migration slice.",
    "",
    `**Open duplicate concepts:** ${audit.duplicates.length}`,
    `**Open Blueprint gaps:** ${audit.gaps.length}`,
    "",
    "## Non-negotiable",
    "",
    "Create Artifact remains content SoT. Project links — it does not copy.",
    "",
  ].join("\n");
}

export function renderValidationRegistryMarkdown(
  audit: BlueprintSharedObjectAuditBundle,
  generatedAt: string,
): string {
  const lines = [
    "# Validation Registry",
    "",
    "**Standard:** 295",
    `**Generated:** ${generatedAt}`,
    "",
    "| Object type | Rule |",
    "|---|---|",
  ];
  for (const o of audit.objectTypes) {
    lines.push(
      `| \`${o.objectTypeId}\` | Required fields present: ${o.requiredFields.join(", ")} |`,
    );
    if (o.objectTypeId === "dashboard") {
      lines.push(
        `| \`${o.objectTypeId}\` | Must reference metric_definition_ids — not display labels alone |`,
      );
    }
    if (o.objectTypeId === "payment") {
      lines.push(
        `| \`${o.objectTypeId}\` | Status must come from sync — never fabricate |`,
      );
    }
  }
  lines.push("");
  return lines.join("\n");
}

export function renderPermissionRegistryMarkdown(generatedAt: string): string {
  return [
    "# Permission Registry",
    "",
    "**Standard:** 295 / 296 isolation",
    `**Generated:** ${generatedAt}`,
    "",
    "| Policy | Applies to | Rule |",
    "|---|---|---|",
    "| business_isolation | all shared objects | `business_id` required; no cross-business leak |",
    "| client_confidentiality | client_account, communication | authorized viewers + privacy classification |",
    "| create_project_link | create_artifact ↔ project | Project may not mutate Create content without permissioned sync |",
    "",
  ].join("\n");
}

export function renderExternalMappingRegistryMarkdown(generatedAt: string): string {
  return [
    "# External Mapping Registry",
    "",
    "**Standard:** 295 / 300 Gate 11",
    `**Generated:** ${generatedAt}`,
    "",
    "| External system | External entity | Canonical object | Sync state | Authority |",
    "|---|---|---|---|---|",
    "| _(none registered)_ | — | — | — | completed_elsewhere until mapped |",
    "",
    "Payments, bookings, and signed agreements typically map here as **completed_elsewhere**.",
    "",
  ].join("\n");
}

export function renderSharedObjectGapRegisterMarkdown(
  audit: BlueprintSharedObjectAuditBundle,
  generatedAt: string,
): string {
  const gaps = [...audit.gaps].sort(
    (a, b) =>
      severityRank(a.severity) - severityRank(b.severity) ||
      a.blueprintId.localeCompare(b.blueprintId),
  );
  const lines = [
    "# Shared Object Gap Register",
    "",
    `**Generated:** ${generatedAt}`,
    "",
    "| Severity | Blueprint | Object | Authority | Gap | Remediation |",
    "|---|---|---|---|---|---|",
  ];
  for (const g of gaps) {
    lines.push(
      `| ${g.severity} | \`${g.blueprintId}\` | \`${g.objectTypeId}\` | ${g.creationAuthority} | ${g.gap.replace(/\|/g, "/")} | ${g.remediation} |`,
    );
  }
  lines.push("", `**Open gaps:** ${gaps.length}`, "");
  return lines.join("\n");
}

export function renderSharedObjectCertificationDashboardMarkdown(
  audit: BlueprintSharedObjectAuditBundle,
  generatedAt: string,
): string {
  const lines = [
    "# Shared Object Library Certification Dashboard",
    "",
    "**Standard:** 300",
    `**Generated:** ${generatedAt}`,
    "",
    "Production triad: Createability **and** Context Connection **and** Shared Object Library.",
    "",
    "Authority legend: **fully_create** · **prepare** · **user_provided** · **completed_elsewhere**",
    "",
    "| Blueprint | Result | Deps | Connected | Blocked | Provisional | fully_create | prepare | user_provided | elsewhere | Issues |",
    "|---|---|---|---|---|---|---|---|---|---|---|",
  ];
  for (const c of audit.certifications) {
    const a = c.authorityCounts;
    lines.push(
      `| \`${c.blueprintId}\` | **${c.result}** | ${c.dependencyCount} | ${c.connectedCount} | ${c.blockedCount} | ${c.provisionalCount} | ${a.fully_create} | ${a.prepare} | ${a.user_provided} | ${a.completed_elsewhere} | ${c.issues.length} |`,
    );
  }
  const pass = audit.certifications.filter((c) => c.result === "pass").length;
  const blocked = audit.certifications.filter((c) => c.result === "blocked").length;
  lines.push(
    "",
    `**Pass:** ${pass} · **Blocked:** ${blocked} · **Total:** ${audit.certifications.length}`,
    "",
  );
  return lines.join("\n");
}
