/**
 * Unified Signal Registry — authoritative domain:category definitions.
 * Sprint 1: merged from signalMapping + UIE + ingest domain rules.
 */

import type { IntelligenceSignalValence } from "./types";
import {
  listMappedSignalCategories,
  resolveSignalTraitMapping,
} from "./signalMapping";
import type { SignalDomain } from "./signalBusTypes";

export type RegistryEntry = {
  domain: SignalDomain;
  category: string;
  defaultWeight: number;
  defaultValence?: IntelligenceSignalValence;
  traitPaths: string[];
  expectedEmitters?: string[];
  deprecated?: boolean;
};

/** Static domain assignment per category key (signalMapping + ingest rules). */
const CATEGORY_DOMAIN: Record<string, SignalDomain> = {
  // Struggles (ingest.struggleToDomain)
  overwhelm: "emotional",
  prioritization: "conversation",
  focus: "conversation",
  follow_through: "conversation",
  decision_making: "conversation",
  perfectionism: "conversation",
  marketing: "business",
  content_creation: "business",
  // Questions
  what_should_i_work_on: "conversation",
  help_me_prioritize: "conversation",
  im_overwhelmed: "conversation",
  dont_know_where_to_start: "conversation",
  // Emotions
  frustrated: "emotional",
  stuck: "emotional",
  confused: "emotional",
  excited: "emotional",
  hopeful: "emotional",
  // Energy
  high_energy: "energy",
  low_energy: "energy",
  morning_productive: "energy",
  afternoon_productive: "energy",
  evening_productive: "energy",
  // Creation
  content_created: "creation",
  draft_saved: "creation",
  export_completed: "creation",
  // Business
  marketing_activity: "business",
  offer_work: "business",
  lead_generation: "business",
  sales_activity: "business",
  client_acquisition: "business",
  // Project
  project_created: "project",
  project_progress: "project",
  task_completed: "project",
  // Workspace
  workspace_opened: "workspace",
  field_completed: "workspace",
  task_broken_down: "workspace",
  // Action / trust (recordTrustSignal legacy action domain)
  suggestion_accepted: "action",
  suggestion_ignored: "action",
  suggestion_dismissed: "trust",
  intervention_started: "trust",
  intervention_completed: "trust",
  intervention_abandoned: "trust",
  offer_suppressed: "trust",
  offer_blocked: "trust",
  offer_rendered: "trust",
  tool_used: "action",
  recovery_taken: "action",
  brain_dump: "action",
  accountability_engaged: "action",
  voice_used: "action",
  recovery_rest: "action",
  recovery_walk: "action",
  // Learning
  asked_for_example: "conversation",
  asked_for_steps: "conversation",
};

const DEFAULT_VALENCE: Partial<
  Record<string, IntelligenceSignalValence>
> = {
  overwhelm: "negative",
  frustrated: "negative",
  stuck: "negative",
  confused: "neutral",
  excited: "positive",
  hopeful: "positive",
  high_energy: "positive",
  low_energy: "negative",
  morning_productive: "positive",
  afternoon_productive: "positive",
  evening_productive: "positive",
  content_created: "positive",
  suggestion_accepted: "positive",
  suggestion_dismissed: "negative",
  suggestion_ignored: "neutral",
  intervention_completed: "positive",
  intervention_abandoned: "negative",
  im_overwhelmed: "negative",
};

function registryKey(domain: SignalDomain, category: string): string {
  return `${domain}:${category}`;
}

function buildEntry(
  category: string,
  domain: SignalDomain,
): RegistryEntry {
  const mapping = resolveSignalTraitMapping(category);
  return {
    domain,
    category,
    defaultWeight: mapping?.weight ?? 6,
    defaultValence: DEFAULT_VALENCE[category],
    traitPaths: mapping?.paths ?? [],
  };
}

function buildRegistry(): Record<string, RegistryEntry> {
  const registry: Record<string, RegistryEntry> = {};

  for (const category of listMappedSignalCategories()) {
    const domain = CATEGORY_DOMAIN[category];
    if (!domain) continue;
    registry[registryKey(domain, category)] = buildEntry(category, domain);
  }

  // UIE struggle categories not in signalMapping MAP
  for (const category of ["marketing", "content_creation"] as const) {
    const domain = CATEGORY_DOMAIN[category];
    registry[registryKey(domain, category)] = buildEntry(category, domain);
  }

  // Sprint 1 registered emitters (future / mirror paths)
  const extra: Array<[SignalDomain, string]> = [
    ["creation", "draft_saved"],
    ["creation", "export_completed"],
    ["project", "project_created"],
    ["workspace", "field_completed"],
    ["action", "tool_used"],
    ["action", "recovery_taken"],
  ];
  for (const [domain, category] of extra) {
    const key = registryKey(domain, category);
    if (!registry[key]) {
      registry[key] = buildEntry(category, domain);
    }
  }

  const trustCategories = [
    "suggestion_accepted",
    "suggestion_dismissed",
    "suggestion_ignored",
    "intervention_started",
    "intervention_completed",
    "intervention_abandoned",
    "offer_suppressed",
    "offer_blocked",
    "offer_rendered",
  ] as const;
  for (const category of trustCategories) {
    registry[registryKey("trust", category)] = buildEntry(category, "trust");
  }

  return registry;
}

export const SIGNAL_REGISTRY: Record<string, RegistryEntry> = buildRegistry();

export function lookupRegistryEntry(
  domain: SignalDomain,
  category: string,
): RegistryEntry | null {
  return SIGNAL_REGISTRY[registryKey(domain, category)] ?? null;
}

export function listAllRegistryKeys(): string[] {
  return Object.keys(SIGNAL_REGISTRY);
}

export function inferDomainForCategory(category: string): SignalDomain {
  return CATEGORY_DOMAIN[category] ?? "conversation";
}

export type RegistryCoverageReport = {
  totalMappingCategories: number;
  registeredCategories: number;
  missingCategories: string[];
  coveragePercent: number;
};

/** Assert 100% signalMapping categories have a registry domain assignment. */
export function getRegistryCoverageReport(): RegistryCoverageReport {
  const mappingCats = listMappedSignalCategories();
  const missing: string[] = [];

  for (const category of mappingCats) {
    const domain = CATEGORY_DOMAIN[category];
    if (!domain) {
      missing.push(category);
      continue;
    }
    if (!lookupRegistryEntry(domain, category)) {
      missing.push(category);
    }
  }

  const registered = mappingCats.length - missing.length;
  return {
    totalMappingCategories: mappingCats.length,
    registeredCategories: registered,
    missingCategories: missing,
    coveragePercent:
      mappingCats.length === 0
        ? 100
        : Math.round((registered / mappingCats.length) * 100),
  };
}
