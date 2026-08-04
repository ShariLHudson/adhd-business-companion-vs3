/**
 * P0.35 — Clear My Mind cluster preferences (localStorage).
 */

export type CategorizationMode = "automatic" | "review" | "manual";

export type ClusterOverrides = {
  /** clusterKey → display label */
  rename: Record<string, string>;
  /** source clusterKey → target clusterKey (merge) */
  mergeInto: Record<string, string>;
};

export type PendingClassification = {
  entryId: string;
  topic?: string;
  category?: string;
  contextType?: string;
  suggestion?: string;
};

const MODE_KEY = "companion-brain-dump-categorization-mode-v1";
const OVERRIDES_KEY = "companion-brain-dump-cluster-overrides-v1";

export const CATEGORIZATION_MODE_LABEL: Record<CategorizationMode, string> = {
  automatic: "Automatic",
  review: "Review Before Saving",
  manual: "Manual",
};

export const CATEGORIZATION_MODE_HINT: Record<CategorizationMode, string> = {
  automatic: "Categories are assigned as you capture — you can change them anytime.",
  review: "You approve each category before it is saved.",
  manual: "You choose categories yourself — no auto-labeling.",
};

const EMPTY_OVERRIDES: ClusterOverrides = { rename: {}, mergeInto: {} };

export function loadCategorizationMode(): CategorizationMode {
  try {
    if (typeof localStorage === "undefined") return "automatic";
    const raw = localStorage.getItem(MODE_KEY);
    if (raw === "review" || raw === "manual" || raw === "automatic") return raw;
  } catch {
    /* ignore */
  }
  return "automatic";
}

export function saveCategorizationMode(mode: CategorizationMode): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(MODE_KEY, mode);
  } catch {
    /* ignore */
  }
}

export function loadClusterOverrides(): ClusterOverrides {
  try {
    if (typeof localStorage === "undefined") return { ...EMPTY_OVERRIDES };
    const raw = localStorage.getItem(OVERRIDES_KEY);
    if (!raw) return { ...EMPTY_OVERRIDES };
    const parsed = JSON.parse(raw) as Partial<ClusterOverrides>;
    return {
      rename: parsed.rename ?? {},
      mergeInto: parsed.mergeInto ?? {},
    };
  } catch {
    return { ...EMPTY_OVERRIDES };
  }
}

export function saveClusterOverrides(overrides: ClusterOverrides): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
  } catch {
    /* ignore */
  }
}

export function renameCluster(
  clusterKey: string,
  label: string,
): ClusterOverrides {
  const current = loadClusterOverrides();
  const next = {
    ...current,
    rename: { ...current.rename, [clusterKey]: label.trim() },
  };
  saveClusterOverrides(next);
  return next;
}

export function mergeClusters(
  sourceKey: string,
  targetKey: string,
): ClusterOverrides {
  const current = loadClusterOverrides();
  const next = {
    ...current,
    mergeInto: { ...current.mergeInto, [sourceKey]: targetKey },
  };
  saveClusterOverrides(next);
  return next;
}
