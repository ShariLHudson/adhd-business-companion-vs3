import type { BlueprintCreateabilityAuditBundle } from "./buildMasterRegistry";

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

export function renderMasterOutputRegistryMarkdown(
  audit: BlueprintCreateabilityAuditBundle,
  generatedAt: string,
): string {
  const lines = [
    "# Master Blueprint Output Registry",
    "",
    "**Standard:** 233–236 Blueprint Createability",
    `**Generated:** ${generatedAt}`,
    "**Source:** Universal Blueprint registry + createability seed/manifest",
    "",
    "Provisional rows are seeded from `deliverables[]` and remain **blocked** until hand-authored manifests pass certification.",
    "",
    "| Blueprint | Version | Work Types | Output | Type | Creation state | Status | Destination | Provisional |",
    "|---|---|---|---|---|---|---|---|---|",
  ];
  for (const r of audit.registryRows) {
    lines.push(
      `| \`${r.blueprintId}\` | ${r.blueprintVersion} | ${r.workTypeIds.join(", ")} | ${r.outputName.replace(/\|/g, "/")} | ${r.outputType} | ${r.creationState} | ${r.status} | ${r.destination.replace(/\|/g, "/")} | ${r.provisional ? "yes" : "no"} |`,
    );
  }
  lines.push("", `**Total outputs:** ${audit.registryRows.length}`, "");
  return lines.join("\n");
}

export function renderGapRegisterMarkdown(
  audit: BlueprintCreateabilityAuditBundle,
  generatedAt: string,
): string {
  const gaps = [...audit.gaps].sort(
    (a, b) =>
      severityRank(a.severity) - severityRank(b.severity) ||
      a.blueprintId.localeCompare(b.blueprintId),
  );
  const lines = [
    "# Master Createability Gap Register",
    "",
    "**Standard:** 235 Retroactive Audit",
    `**Generated:** ${generatedAt}`,
    "",
    "Every gap must be remediated or the production promise removed.",
    "",
    "| Severity | Blueprint | Output | Gap | Remediation |",
    "|---|---|---|---|---|",
  ];
  for (const g of gaps) {
    lines.push(
      `| ${g.severity} | \`${g.blueprintId}\` | ${g.outputName.replace(/\|/g, "/")} | ${g.gap.replace(/\|/g, "/")} | ${g.remediation} |`,
    );
  }
  lines.push("", `**Open gaps:** ${gaps.length}`, "");
  return lines.join("\n");
}

export function renderRemediationBacklogMarkdown(
  audit: BlueprintCreateabilityAuditBundle,
  generatedAt: string,
): string {
  const priority = [
    "critical",
    "high",
    "moderate",
    "low",
  ] as const;
  const lines = [
    "# Blueprint Remediation Backlog",
    "",
    "**Standard:** 235 Priority Rules",
    `**Generated:** ${generatedAt}`,
    "",
    "Fix first: user-visible outputs · purpose-central · shared · Project handoff · calculations · export · connected destinations.",
    "",
  ];
  for (const sev of priority) {
    const items = audit.gaps.filter((g) => g.severity === sev);
    lines.push(`## ${sev}`, "");
    if (!items.length) {
      lines.push("_None._", "");
      continue;
    }
    for (const g of items) {
      lines.push(
        `- [ ] \`${g.blueprintId}\` — **${g.outputName}** → ${g.remediation}`,
      );
    }
    lines.push("");
  }
  return lines.join("\n");
}

export function renderCertificationDashboardMarkdown(
  audit: BlueprintCreateabilityAuditBundle,
  generatedAt: string,
): string {
  const lines = [
    "# Blueprint Createability Certification Dashboard",
    "",
    "**Certification:** `certification.blueprint.createability` (236)",
    `**Generated:** ${generatedAt}`,
    "",
    "Foundation / Work-Type certification is **necessary but not sufficient**. Production “fully available” requires createability `pass` or `pass_with_declared_limits`.",
    "",
    "| Blueprint | Version | Result | Outputs | Available | Blocked/Future | Provisional | Blocking issues |",
    "|---|---|---|---:|---:|---:|---:|---:|",
  ];
  for (const c of audit.certifications) {
    const blocking = c.issues.filter((i) => i.blocking).length;
    lines.push(
      `| \`${c.blueprintId}\` | ${c.blueprintVersion} | **${c.result}** | ${c.outputCount} | ${c.availableCount} | ${c.blockedOrFutureCount} | ${c.provisionalCount} | ${blocking} |`,
    );
  }
  const passed = audit.certifications.filter(
    (c) => c.result === "pass" || c.result === "pass_with_declared_limits",
  ).length;
  lines.push(
    "",
    `**Createability-certified:** ${passed} / ${audit.certifications.length}`,
    "",
    "## Release rule",
    "",
    "A Blueprint with `fail` or `blocked` must not be presented as fully available for every promised output.",
    "",
  );
  return lines.join("\n");
}
