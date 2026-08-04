/**
 * P0.40 — Growth Center hub: two primary dropdowns (Growth Vault™, Outcome Goals™).
 */

import { getEvidenceEntries } from "./evidenceBankStore";
import { getSavedGrowthWins } from "./growthWinsStore";
import { listOutcomeGoals } from "./goals/outcomeGoals";
import { getJourneyEntries } from "./myJourneyStore";
import { getPortfolioEntries } from "./portfolioStore";

export type GrowthHubPrimaryId = "growth-vault" | "outcome-goals";

export type GrowthVaultSectionId =
  | "wins-this-week"
  | "evidence-bank"
  | "portfolio"
  | "my-journey";

export type OutcomeGoalsTabId = "goals" | "activity" | "insights";

/** @deprecated Use activity */
export type LegacyOutcomeGoalsTabId = "progress" | "reports";

/** @deprecated Use GrowthVaultSectionId — kept for Quick Save open targets */
export type GrowthHubSectionId = GrowthVaultSectionId | "outcome-goals";

export const GROWTH_HUB_PRIMARY_ORDER: GrowthHubPrimaryId[] = [
  "growth-vault",
  "outcome-goals",
];

export const GROWTH_VAULT_SECTION_ORDER: GrowthVaultSectionId[] = [
  "wins-this-week",
  "evidence-bank",
  "portfolio",
  "my-journey",
];

export const OUTCOME_GOALS_TAB_ORDER: OutcomeGoalsTabId[] = [
  "goals",
  "activity",
  "insights",
];

export const GROWTH_HUB_PRIMARY_META: Record<
  GrowthHubPrimaryId,
  { title: string; emoji: string; description: string }
> = {
  "growth-vault": {
    emoji: "🏛",
    title: "Growth Vault™",
    description: "Wins, proof, portfolio, and journey.",
  },
  "outcome-goals": {
    emoji: "🎯",
    title: "Outcome Goals™",
    description: "Goals, activity, and insights.",
  },
};

export const GROWTH_VAULT_SECTION_META: Record<
  GrowthVaultSectionId,
  { title: string; emoji: string; description: string; emptyMessage: string }
> = {
  "wins-this-week": {
    emoji: "🏆",
    title: "My Wins™",
    description: "Successes, accomplishments, and progress.",
    emptyMessage: "No wins yet.",
  },
  "evidence-bank": {
    emoji: "📈",
    title: "Evidence Bank™",
    description: "Proof of impact and results.",
    emptyMessage: "No evidence saved yet.",
  },
  portfolio: {
    emoji: "📦",
    title: "Portfolio™",
    description: "Things created, completed, or built.",
    emptyMessage: "No portfolio items yet.",
  },
  "my-journey": {
    emoji: "🌿",
    title: "My Journey™",
    description: "Journal, reflections, lessons, and decisions.",
    emptyMessage: "No journey entries yet.",
  },
};

export const OUTCOME_GOALS_TAB_META: Record<
  OutcomeGoalsTabId,
  { title: string; description: string }
> = {
  goals: {
    title: "Goals",
    description: "What you're working toward — create goals and record progress.",
  },
  activity: {
    title: "Activity",
    description: "Everything you've done toward your goals — a clean timeline.",
  },
  insights: {
    title: "Insights",
    description: "What is working — your business growth dashboard.",
  },
};

const PRIMARY_STORAGE_KEY = "companion-growth-hub-open-primary-v1";
const VAULT_SECTION_STORAGE_KEY = "companion-growth-hub-open-vault-section-v1";
const OUTCOME_TAB_STORAGE_KEY = "companion-growth-hub-open-outcome-tab-v1";
const LEGACY_STORAGE_KEY = "companion-growth-hub-open-section-v1";

function migrateLegacySection(): {
  primary: GrowthHubPrimaryId | null;
  vaultSection: GrowthVaultSectionId | null;
  outcomeTab: OutcomeGoalsTabId | null;
} {
  if (typeof window === "undefined") {
    return { primary: null, vaultSection: null, outcomeTab: null };
  }
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return { primary: null, vaultSection: null, outcomeTab: null };
    localStorage.removeItem(LEGACY_STORAGE_KEY);

    if (raw === "outcome-goals") {
      return { primary: "outcome-goals", vaultSection: null, outcomeTab: "goals" };
    }
    if (raw === "growth-report") {
      return { primary: "outcome-goals", vaultSection: null, outcomeTab: "insights" };
    }
    if (
      raw === "decision-log" ||
      raw === "lessons-learned"
    ) {
      return { primary: "growth-vault", vaultSection: "my-journey", outcomeTab: null };
    }
    if (GROWTH_VAULT_SECTION_ORDER.includes(raw as GrowthVaultSectionId)) {
      return {
        primary: "growth-vault",
        vaultSection: raw as GrowthVaultSectionId,
        outcomeTab: null,
      };
    }
  } catch {
    /* noop */
  }
  return { primary: null, vaultSection: null, outcomeTab: null };
}

export function loadGrowthHubOpenPrimary(): GrowthHubPrimaryId | null {
  if (typeof window === "undefined") return null;
  try {
    const migrated = migrateLegacySection();
    if (migrated.primary) {
      saveGrowthHubOpenPrimary(migrated.primary);
      if (migrated.vaultSection) saveGrowthHubOpenVaultSection(migrated.vaultSection);
      if (migrated.outcomeTab) saveGrowthHubOpenOutcomeTab(migrated.outcomeTab);
      return migrated.primary;
    }
    const raw = localStorage.getItem(PRIMARY_STORAGE_KEY);
    if (raw && GROWTH_HUB_PRIMARY_ORDER.includes(raw as GrowthHubPrimaryId)) {
      return raw as GrowthHubPrimaryId;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveGrowthHubOpenPrimary(id: GrowthHubPrimaryId | null): void {
  if (typeof window === "undefined") return;
  try {
    if (id) {
      localStorage.setItem(PRIMARY_STORAGE_KEY, id);
    } else {
      localStorage.removeItem(PRIMARY_STORAGE_KEY);
    }
  } catch {
    /* noop */
  }
}

export function loadGrowthHubOpenVaultSection(): GrowthVaultSectionId | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(VAULT_SECTION_STORAGE_KEY);
    if (raw && GROWTH_VAULT_SECTION_ORDER.includes(raw as GrowthVaultSectionId)) {
      return raw as GrowthVaultSectionId;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveGrowthHubOpenVaultSection(id: GrowthVaultSectionId | null): void {
  if (typeof window === "undefined") return;
  try {
    if (id) {
      localStorage.setItem(VAULT_SECTION_STORAGE_KEY, id);
    } else {
      localStorage.removeItem(VAULT_SECTION_STORAGE_KEY);
    }
  } catch {
    /* noop */
  }
}

export function migrateOutcomeGoalsTabId(
  raw: string | null,
): OutcomeGoalsTabId | null {
  if (raw === "progress") return "activity";
  if (raw === "reports") return "insights";
  if (raw && OUTCOME_GOALS_TAB_ORDER.includes(raw as OutcomeGoalsTabId)) {
    return raw as OutcomeGoalsTabId;
  }
  return null;
}

export function loadGrowthHubOpenOutcomeTab(): OutcomeGoalsTabId | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(OUTCOME_TAB_STORAGE_KEY);
    return migrateOutcomeGoalsTabId(raw);
  } catch {
    return null;
  }
}

export function saveGrowthHubOpenOutcomeTab(id: OutcomeGoalsTabId | null): void {
  if (typeof window === "undefined") return;
  try {
    if (id) {
      localStorage.setItem(OUTCOME_TAB_STORAGE_KEY, id);
    } else {
      localStorage.removeItem(OUTCOME_TAB_STORAGE_KEY);
    }
  } catch {
    /* noop */
  }
}

export function toggleGrowthHubPrimary(
  current: GrowthHubPrimaryId | null,
  id: GrowthHubPrimaryId,
): GrowthHubPrimaryId | null {
  const next = current === id ? null : id;
  saveGrowthHubOpenPrimary(next);
  return next;
}

export function toggleGrowthVaultSection(
  current: GrowthVaultSectionId | null,
  id: GrowthVaultSectionId,
): GrowthVaultSectionId | null {
  const next = current === id ? null : id;
  saveGrowthHubOpenVaultSection(next);
  return next;
}

export function toggleOutcomeGoalsTab(
  current: OutcomeGoalsTabId | null,
  id: OutcomeGoalsTabId,
): OutcomeGoalsTabId | null {
  const next = current === id ? null : id;
  saveGrowthHubOpenOutcomeTab(next);
  return next;
}

export function closeAllGrowthHubSections(): void {
  saveGrowthHubOpenPrimary(null);
  saveGrowthHubOpenVaultSection(null);
  saveGrowthHubOpenOutcomeTab(null);
}

/** Map vault hub id to workspace section. */
export function growthHubPrimaryWorkspaceSection(
  id: GrowthHubPrimaryId,
): import("./companionUi").AppSection {
  return id === "growth-vault" ? "growth-vault" : "outcome-goals";
}

/** Map vault sections to full workspace panels for "Open" actions. */
export function growthVaultWorkspaceSection(
  id: GrowthVaultSectionId,
): import("./companionUi").AppSection {
  return id;
}

/** @deprecated Use growthVaultWorkspaceSection */
export function growthHubWorkspaceSection(
  id: GrowthHubSectionId,
): import("./companionUi").AppSection {
  if (id === "outcome-goals") return "outcome-goals";
  return growthVaultWorkspaceSection(id);
}

export function growthVaultSectionCount(id: GrowthVaultSectionId): number {
  if (typeof window === "undefined") return 0;

  switch (id) {
    case "wins-this-week":
      return getSavedGrowthWins().length;
    case "evidence-bank":
      return getEvidenceEntries().length;
    case "portfolio":
      return getPortfolioEntries().length;
    case "my-journey":
      return getJourneyEntries().length;
  }
}

/** @deprecated */
export function growthHubSectionCount(id: GrowthHubSectionId): number {
  if (id === "outcome-goals") return listOutcomeGoals().length;
  return growthVaultSectionCount(id);
}

/** Open a vault section from Quick Save — expands Growth Vault + section. */
export function openGrowthVaultHubSection(id: GrowthVaultSectionId): {
  primary: GrowthHubPrimaryId;
  vaultSection: GrowthVaultSectionId;
} {
  saveGrowthHubOpenPrimary("growth-vault");
  saveGrowthHubOpenVaultSection(id);
  return { primary: "growth-vault", vaultSection: id };
}

/** Open Outcome Goals tab from Quick Save. */
export function openOutcomeGoalsHubTab(tab: OutcomeGoalsTabId): {
  primary: GrowthHubPrimaryId;
  outcomeTab: OutcomeGoalsTabId;
} {
  saveGrowthHubOpenPrimary("outcome-goals");
  saveGrowthHubOpenOutcomeTab(tab);
  return { primary: "outcome-goals", outcomeTab: tab };
}

// Legacy accordion helpers — redirect to primary toggle
export function loadGrowthHubOpenSection(): GrowthVaultSectionId | null {
  return loadGrowthHubOpenVaultSection();
}

export function saveGrowthHubOpenSection(id: GrowthVaultSectionId | null): void {
  saveGrowthHubOpenVaultSection(id);
}

export function toggleGrowthHubSection(
  current: GrowthVaultSectionId | null,
  id: GrowthVaultSectionId,
): GrowthVaultSectionId | null {
  return toggleGrowthVaultSection(current, id);
}
