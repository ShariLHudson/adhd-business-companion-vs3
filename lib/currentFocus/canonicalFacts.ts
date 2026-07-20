/**
 * Standard 072 — Canonical known-fact identity (stable IDs, dedupe).
 */

import type { CreateTemplateSection } from "@/lib/createTemplates";

export const WORKSPACE_SCHEMA_VERSION = "072.1";

export type CanonicalKnownFact = {
  id: string;
  sectionId: string;
  label: string;
  value: string;
};

export function canonicalFactId(sectionId: string): string {
  return `fact:${sectionId.trim().toLowerCase()}`;
}

export function normalizeFactLabelKey(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeFactValueKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .slice(0, 240);
}

export function buildCanonicalKnownFacts(
  sectionContent: Record<string, string>,
  sections: CreateTemplateSection[],
): CanonicalKnownFact[] {
  const labelById = new Map(sections.map((s) => [s.id, s.label]));
  const out: CanonicalKnownFact[] = [];
  const seenIds = new Set<string>();
  const seenValues = new Set<string>();
  for (const [sectionId, raw] of Object.entries(sectionContent)) {
    const value = raw?.trim();
    if (!value || !sectionId.trim()) continue;
    const id = canonicalFactId(sectionId);
    if (seenIds.has(id)) continue;
    const valueKey = normalizeFactValueKey(value);
    // Same text under Overview + Purpose (or any pair) → keep first only.
    if (valueKey && seenValues.has(valueKey)) continue;
    seenIds.add(id);
    if (valueKey) seenValues.add(valueKey);
    out.push({
      id,
      sectionId,
      label: labelById.get(sectionId) ?? sectionId,
      value: value.slice(0, 240),
    });
  }
  return out;
}

export function knownFactDisplayLines(facts: CanonicalKnownFact[]): string[] {
  const seenLines = new Set<string>();
  const seenValues = new Set<string>();
  const out: string[] = [];
  for (const f of facts) {
    const line = `${f.label}: ${f.value}`;
    const lineKey = line.trim().toLowerCase();
    const valueKey = normalizeFactValueKey(f.value);
    if (seenLines.has(lineKey)) continue;
    if (valueKey && seenValues.has(valueKey)) continue;
    seenLines.add(lineKey);
    if (valueKey) seenValues.add(valueKey);
    out.push(line);
  }
  return out;
}

export function migrateLegacyKnownFacts(
  legacy: string[] | undefined,
  sectionContent: Record<string, string>,
  sections: CreateTemplateSection[],
): CanonicalKnownFact[] {
  const fromSections = buildCanonicalKnownFacts(sectionContent, sections);
  const byId = new Map(fromSections.map((f) => [f.id, f]));
  const byLabel = new Map(
    fromSections.map((f) => [normalizeFactLabelKey(f.label), f]),
  );

  for (const line of legacy ?? []) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const colon = trimmed.indexOf(":");
    if (colon <= 0) continue;
    const label = trimmed.slice(0, colon).trim();
    const value = trimmed.slice(colon + 1).trim();
    if (!value) continue;
    const labelKey = normalizeFactLabelKey(label);
    const sectionMatch =
      sections.find((s) => normalizeFactLabelKey(s.label) === labelKey) ??
      sections.find((s) => s.id === label || s.id === labelKey);
    if (sectionMatch) {
      const id = canonicalFactId(sectionMatch.id);
      const existing = byId.get(id);
      if (!existing || value.length > existing.value.length) {
        const next: CanonicalKnownFact = {
          id,
          sectionId: sectionMatch.id,
          label: sectionMatch.label,
          value: value.slice(0, 240),
        };
        byId.set(id, next);
        byLabel.set(labelKey, next);
      }
      continue;
    }
    const synthId = `fact:legacy:${labelKey}`;
    if (!byId.has(synthId) && !byLabel.has(labelKey)) {
      const next: CanonicalKnownFact = {
        id: synthId,
        sectionId: synthId,
        label,
        value: value.slice(0, 240),
      };
      byId.set(synthId, next);
      byLabel.set(labelKey, next);
    }
  }

  return Array.from(byId.values());
}
