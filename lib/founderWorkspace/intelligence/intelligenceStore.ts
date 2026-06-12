import type { ProjectIntelligenceStore } from "./types";

const STORAGE_KEY = "founder-project-intelligence-v1";

function emptyStore(): ProjectIntelligenceStore {
  return { issues: [], opportunities: [], links: [], activity: {} };
}

export function loadIntelligenceStore(): ProjectIntelligenceStore {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ProjectIntelligenceStore;
    return {
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
      opportunities: Array.isArray(parsed.opportunities)
        ? parsed.opportunities
        : [],
      links: Array.isArray(parsed.links) ? parsed.links : [],
      activity:
        parsed.activity && typeof parsed.activity === "object"
          ? parsed.activity
          : {},
    };
  } catch {
    return emptyStore();
  }
}

export function saveIntelligenceStore(store: ProjectIntelligenceStore): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* quota */
  }
}

export function recordProjectViewed(
  store: ProjectIntelligenceStore,
  projectId: string,
): ProjectIntelligenceStore {
  const now = new Date().toISOString();
  return {
    ...store,
    activity: {
      ...store.activity,
      [projectId]: {
        ...store.activity[projectId],
        lastViewedAt: now,
      },
    },
  };
}

export function recordProjectEdited(
  store: ProjectIntelligenceStore,
  projectId: string,
): ProjectIntelligenceStore {
  const now = new Date().toISOString();
  return {
    ...store,
    activity: {
      ...store.activity,
      [projectId]: {
        ...store.activity[projectId],
        lastEditedAt: now,
      },
    },
  };
}
