import { MASTER_CANONICAL_FIELDS } from "./canonicalFields";
import type { BlueprintProfileContextAuditBundle } from "./buildMasterRegistry";

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

export function renderMasterContextRegistryMarkdown(
  audit: BlueprintProfileContextAuditBundle,
  generatedAt: string,
): string {
  const lines = [
    "# Master Blueprint Context Registry",
    "",
    "**Standard:** 273–278 Blueprint Profile Context Connection",
    `**Generated:** ${generatedAt}`,
    "**Source:** Universal Blueprint registry + knownContextKeys seed",
    "",
    "Provisional rows remain **blocked** until Business Estate load/prefill/sync is certified.",
    "",
    "| Blueprint | Version | Work Types | Key | Canonical field | Entity | Status | Provisional |",
    "|---|---|---|---|---|---|---|---|",
  ];
  for (const r of audit.registryRows) {
    lines.push(
      `| \`${r.blueprintId}\` | ${r.blueprintVersion} | ${r.workTypeIds.join(", ")} | ${r.knownContextKey} | \`${r.canonicalFieldId}\` | ${r.entity} | ${r.status} | ${r.provisional ? "yes" : "no"} |`,
    );
  }
  lines.push("", `**Total dependencies:** ${audit.registryRows.length}`, "");
  return lines.join("\n");
}

export function renderMasterCanonicalFieldRegistryMarkdown(
  generatedAt: string,
): string {
  const lines = [
    "# Master Canonical Field Registry",
    "",
    "**Standard:** 274 Canonical Business Context Schema",
    `**Generated:** ${generatedAt}`,
    "",
    "Maps to existing Business Estate / DNA / avatar / offer stores — not a second profile database.",
    "",
    "| Field ID | Entity | Name | Required | Source of truth |",
    "|---|---|---|---|---|",
  ];
  for (const f of MASTER_CANONICAL_FIELDS) {
    lines.push(
      `| \`${f.fieldId}\` | ${f.entity} | ${f.name} | ${f.required ? "yes" : "no"} | ${f.sourceOfTruth} |`,
    );
  }
  lines.push("", `**Total fields:** ${MASTER_CANONICAL_FIELDS.length}`, "");
  return lines.join("\n");
}

export function renderDependencyMatrixMarkdown(
  audit: BlueprintProfileContextAuditBundle,
  generatedAt: string,
): string {
  const lines = [
    "# Blueprint-to-Profile Dependency Matrix",
    "",
    "**Standard:** 277 Retroactive Audit",
    `**Generated:** ${generatedAt}`,
    "",
    "| Blueprint | Known context key | Canonical field | Entity | Status |",
    "|---|---|---|---|---|",
  ];
  for (const r of audit.registryRows) {
    lines.push(
      `| \`${r.blueprintId}\` | ${r.knownContextKey} | \`${r.canonicalFieldId}\` | ${r.entity} | ${r.status} |`,
    );
  }
  lines.push("", `**Rows:** ${audit.registryRows.length}`, "");
  return lines.join("\n");
}

export function renderContextSyncGapRegisterMarkdown(
  audit: BlueprintProfileContextAuditBundle,
  generatedAt: string,
): string {
  const gaps = [...audit.gaps].sort(
    (a, b) =>
      severityRank(a.severity) - severityRank(b.severity) ||
      a.blueprintId.localeCompare(b.blueprintId),
  );
  const lines = [
    "# Context Sync Gap Register",
    "",
    "**Standard:** 277 Retroactive Audit",
    `**Generated:** ${generatedAt}`,
    "",
    "| Severity | Blueprint | Key | Canonical field | Gap | Remediation |",
    "|---|---|---|---|---|---|",
  ];
  for (const g of gaps) {
    lines.push(
      `| ${g.severity} | \`${g.blueprintId}\` | ${g.knownContextKey} | \`${g.canonicalFieldId}\` | ${g.gap.replace(/\|/g, "/")} | ${g.remediation} |`,
    );
  }
  lines.push("", `**Open gaps:** ${gaps.length}`, "");
  return lines.join("\n");
}

export function renderRepeatedQuestionRegisterMarkdown(
  audit: BlueprintProfileContextAuditBundle,
  generatedAt: string,
): string {
  const lines = [
    "# Repeated-Question Register",
    "",
    "**Standard:** 278 Repeated-question test",
    `**Generated:** ${generatedAt}`,
    "",
    "Questions that declare knownContextKeys while Context Connection is uncertified risk re-asking.",
    "",
    "| Risk | Blueprint | Question | Known keys | Reason |",
    "|---|---|---|---|---|",
  ];
  for (const r of audit.repeatedQuestionRisks) {
    lines.push(
      `| ${r.risk} | \`${r.blueprintId}\` | \`${r.questionId}\` | ${r.knownContextKeys.join(", ")} | ${r.reason.replace(/\|/g, "/")} |`,
    );
  }
  lines.push("", `**At-risk questions:** ${audit.repeatedQuestionRisks.length}`, "");
  return lines.join("\n");
}

export function renderIsolationTestReportMarkdown(
  audit: BlueprintProfileContextAuditBundle,
  generatedAt: string,
): string {
  const blocked = audit.certifications.filter(
    (c) => c.result === "blocked" || c.result === "fail",
  ).length;
  return [
    "# Cross-Business Isolation Test Report",
    "",
    "**Standard:** 278 Gate 15",
    `**Generated:** ${generatedAt}`,
    "",
    "## Verdict",
    "",
    "**NOT PROVEN** — Context Connection remains provisional/blocked for registered Blueprints.",
    "",
    "Isolation tests (no leak across businesses, avatars, users, or sessions) require a live Business Estate context envelope. Until then, Gate 15 fails closed.",
    "",
    `| Blueprints audited | ${audit.certifications.length} |`,
    `| Blocked or failed | ${blocked} |`,
    "",
    "## Required cases (pending live wire)",
    "",
    "- one business / one avatar",
    "- multiple businesses",
    "- archived business / avatar",
    "- session override does not mutate other businesses",
    "- Project handoff preserves business_id provenance",
    "",
  ].join("\n");
}

export function renderContextRetrofitBacklogMarkdown(
  audit: BlueprintProfileContextAuditBundle,
  generatedAt: string,
): string {
  const priority = ["critical", "high", "moderate", "low"] as const;
  const lines = [
    "# Context Retrofit Backlog",
    "",
    "**Standard:** 277",
    `**Generated:** ${generatedAt}`,
    "",
  ];
  for (const sev of priority) {
    const items = audit.gaps.filter((g) => g.severity === sev);
    lines.push(`## ${sev}`, "");
    if (items.length === 0) {
      lines.push("_None._", "");
      continue;
    }
    for (const g of items.slice(0, 40)) {
      lines.push(
        `- \`${g.blueprintId}\` · ${g.knownContextKey} → \`${g.canonicalFieldId}\` · ${g.remediation}`,
      );
    }
    if (items.length > 40) {
      lines.push(`- …and ${items.length - 40} more`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

export function renderContextCertificationDashboardMarkdown(
  audit: BlueprintProfileContextAuditBundle,
  generatedAt: string,
): string {
  const lines = [
    "# Context Certification Dashboard",
    "",
    "**Standard:** 278 Blueprint Context Connection Certification",
    `**Generated:** ${generatedAt}`,
    "",
    "| Blueprint | Version | Result | Dependencies | Connected | Blocked/Missing | Provisional | Issues |",
    "|---|---|---|---|---|---|---|---|",
  ];
  for (const c of audit.certifications) {
    lines.push(
      `| \`${c.blueprintId}\` | ${c.blueprintVersion} | **${c.result}** | ${c.dependencyCount} | ${c.connectedCount} | ${c.blockedOrMissingCount} | ${c.provisionalCount} | ${c.issues.length} |`,
    );
  }
  const pass = audit.certifications.filter((c) => c.result === "pass").length;
  const blocked = audit.certifications.filter(
    (c) => c.result === "blocked",
  ).length;
  lines.push(
    "",
    `**Pass:** ${pass} · **Blocked:** ${blocked} · **Total:** ${audit.certifications.length}`,
    "",
    "Production rule: Createability **and** Context Connection must both pass.",
    "",
  );
  return lines.join("\n");
}
