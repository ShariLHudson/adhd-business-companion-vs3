/**
 * Universal Blueprint Health evaluator (100).
 * Advisory only — never mutates the blueprint.
 */

import type { BlueprintDefinition, BlueprintSectionDef } from "../types";
import { evaluateDomainHealthFindings } from "./intelligencePackages";
import { filterVisibleHealthFindings } from "./suggestionDispositions";
import type {
  BlueprintHealthFinding,
  BlueprintHealthOverall,
  BlueprintHealthSnapshot,
} from "./intelligenceTypes";

function activeSections(bp: BlueprintDefinition): BlueprintSectionDef[] {
  return bp.sections.filter((s) => !s.softDeleted && s.role !== "hidden_system");
}

function fingerprint(parts: readonly string[]): string {
  return parts.join("|");
}

function finding(
  partial: Omit<BlueprintHealthFinding, "evidenceFingerprint"> & {
    evidenceFingerprint?: string;
  },
): BlueprintHealthFinding {
  return {
    ...partial,
    evidenceFingerprint:
      partial.evidenceFingerprint ??
      fingerprint([partial.id, partial.title, partial.sectionId ?? ""]),
  };
}

export function evaluateBlueprintHealthRaw(
  blueprint: BlueprintDefinition,
): BlueprintHealthFinding[] {
  const findings: BlueprintHealthFinding[] = [];
  const sections = activeSections(blueprint);

  if (!blueprint.description?.trim() && !blueprint.intendedUse?.trim()) {
    findings.push(
      finding({
        id: "purpose-missing",
        kind: "purpose",
        severity: "attention",
        title: "Purpose is unclear",
        why: "A short purpose helps you reuse this blueprint without rethinking it each time.",
        affectsExistingWorks: false,
        createsNewVersion: true,
      }),
    );
  } else {
    findings.push(
      finding({
        id: "purpose-clear",
        kind: "purpose",
        severity: "ok",
        title: "Clear purpose",
        why: "This blueprint explains what it is for.",
        affectsExistingWorks: false,
        createsNewVersion: false,
      }),
    );
  }

  if (sections.length === 0) {
    findings.push(
      finding({
        id: "structure-empty",
        kind: "structure",
        severity: "attention",
        title: "No sections yet",
        why: "A blueprint needs at least one section before it can guide future Work.",
        affectsExistingWorks: false,
        createsNewVersion: true,
      }),
    );
  }

  const ids = new Set<string>();
  for (const s of sections) {
    if (ids.has(s.id)) {
      findings.push(
        finding({
          id: `duplicate-id-${s.id}`,
          kind: "duplicate",
          severity: "attention",
          title: `Duplicate section id “${s.id}”`,
          why: "Stable section identity is required so content and links stay attached to the right place.",
          sectionId: s.id,
          affectsExistingWorks: true,
          createsNewVersion: true,
          evidenceFingerprint: fingerprint(["dup-id", s.id]),
        }),
      );
    }
    ids.add(s.id);
  }

  const titleCounts = new Map<string, string[]>();
  for (const s of sections) {
    const key = s.title.trim().toLowerCase();
    if (!key) continue;
    const list = titleCounts.get(key) ?? [];
    list.push(s.id);
    titleCounts.set(key, list);
  }
  for (const [title, sectionIds] of titleCounts) {
    if (sectionIds.length < 2) continue;
    findings.push(
      finding({
        id: `duplicate-title-${title}`,
        kind: "duplicate",
        severity: "advisory",
        title: `Overlapping sections named “${sections.find((s) => s.id === sectionIds[0])?.title}”`,
        why: "Similar names can make it hard to know where to write. Merging or renaming may help.",
        sectionId: sectionIds[0],
        affectsExistingWorks: false,
        createsNewVersion: true,
        evidenceFingerprint: fingerprint(["dup-title", title, ...sectionIds]),
      }),
    );
  }

  const broad = sections.filter((s) => {
    const t = s.title.toLowerCase();
    return (
      t === "marketing" ||
      t === "everything" ||
      t === "misc" ||
      t === "other" ||
      t === "general"
    );
  });
  for (const s of broad) {
    findings.push(
      finding({
        id: `broad-${s.id}`,
        kind: "broad_section",
        severity: "advisory",
        title: `“${s.title}” may be too broad`,
        why: "Broad sections often become catch-alls. Splitting them can make the next step clearer.",
        sectionId: s.id,
        expectedImpact: "Easier focus while writing; may create a new blueprint version.",
        affectsExistingWorks: false,
        createsNewVersion: true,
      }),
    );
  }

  const requiredMissingOutput = sections.filter(
    (s) =>
      (s.required || s.role === "required") &&
      !s.outputHeading?.trim() &&
      !s.starterPrompt?.trim(),
  );
  if (requiredMissingOutput.length === 0 && sections.length > 0) {
    findings.push(
      finding({
        id: "outputs-ok",
        kind: "output",
        severity: "ok",
        title: "Required outputs defined",
        why: "Required sections have enough guidance to produce something useful.",
        affectsExistingWorks: false,
        createsNewVersion: false,
      }),
    );
  } else {
    for (const s of requiredMissingOutput.slice(0, 5)) {
      findings.push(
        finding({
          id: `output-missing-${s.id}`,
          kind: "output",
          severity: "advisory",
          title: `“${s.title}” could use clearer output guidance`,
          why: "A short output heading or starter prompt reduces blank-page friction.",
          sectionId: s.id,
          affectsExistingWorks: false,
          createsNewVersion: true,
        }),
      );
    }
  }

  const unclearLabels = sections.filter(
    (s) => !s.title.trim() || s.title.trim().length < 2 || /^section\s*\d+$/i.test(s.title),
  );
  for (const s of unclearLabels) {
    findings.push(
      finding({
        id: `label-${s.id}`,
        kind: "accessibility",
        severity: "attention",
        title: "A section label is unclear",
        why: "Readable labels help you recognize where you are without re-reading everything.",
        sectionId: s.id,
        affectsExistingWorks: false,
        createsNewVersion: true,
      }),
    );
  }

  if (blueprint.groups?.length) {
    const sectionSet = new Set(sections.map((s) => s.id));
    for (const g of blueprint.groups) {
      const live = g.sectionIds.filter((id) => sectionSet.has(id));
      if (live.length === 0) {
        findings.push(
          finding({
            id: `orphan-group-${g.groupId}`,
            kind: "orphan_group",
            severity: "advisory",
            title: `Group “${g.title}” has no sections`,
            why: "Empty groups add noise on the map. Add a section or remove the group when you are ready.",
            groupId: g.groupId,
            affectsExistingWorks: false,
            createsNewVersion: true,
          }),
        );
      }
    }
    findings.push(
      finding({
        id: "order-grouped",
        kind: "order",
        severity: "ok",
        title: "Logical section order",
        why: "Sections are organized in groups that follow a natural flow.",
        affectsExistingWorks: false,
        createsNewVersion: false,
      }),
    );
  } else if (sections.length >= 2) {
    findings.push(
      finding({
        id: "order-flat",
        kind: "order",
        severity: "ok",
        title: "Logical section order",
        why: "Sections follow the order defined on this blueprint.",
        affectsExistingWorks: false,
        createsNewVersion: false,
      }),
    );
  }

  findings.push(...evaluateDomainHealthFindings(blueprint));

  return findings;
}

function summarizeOverall(
  findings: readonly BlueprintHealthFinding[],
): { overall: BlueprintHealthOverall; summaryLine: string } {
  const attention = findings.filter((f) => f.severity === "attention");
  const advisory = findings.filter((f) => f.severity === "advisory");
  if (attention.some((f) => f.kind === "structure" || f.kind === "duplicate")) {
    return { overall: "incomplete", summaryLine: "Needs a little more structure" };
  }
  if (attention.length > 0) {
    return { overall: "needs_attention", summaryLine: "Needs a little attention" };
  }
  if (advisory.length > 0) {
    return { overall: "good", summaryLine: "Good overall" };
  }
  return { overall: "good", summaryLine: "Good overall" };
}

/** Full evaluation including ok markers (for certification / details). */
export function evaluateBlueprintHealth(
  blueprint: BlueprintDefinition,
  options?: { includeHiddenDispositions?: boolean },
): BlueprintHealthSnapshot {
  const raw = evaluateBlueprintHealthRaw(blueprint);
  const visible = options?.includeHiddenDispositions
    ? raw
    : filterVisibleHealthFindings(blueprint.blueprintId, raw);
  const { overall, summaryLine } = summarizeOverall(
    visible.filter((f) => f.severity !== "ok"),
  );
  return {
    evaluatedAt: new Date().toISOString(),
    overall: visible.length === 0 ? "good" : overall,
    summaryLine,
    findings: visible,
  };
}

/** Health checks never alter the blueprint — identity guard for tests. */
export function assertHealthDoesNotMutate(
  before: BlueprintDefinition,
  after: BlueprintDefinition,
): boolean {
  return JSON.stringify(before) === JSON.stringify(after);
}
