/**
 * Projects Continue Your Work — sync localStorage only.
 * Zero Create / registryCore / dynamic import edges (Vercel/Turbopack safe).
 */

import type { ActiveWorkCardModel } from "@/lib/projects/activeWork/types";

/** Same key as Active Workspace Registry — duplicated to avoid Create graph. */
const REGISTRY_KEY = "spark.activeWorkspaceRegistry.v1";

type LiteEntry = {
  workspaceId: string;
  creationType?: string;
  title?: string;
  currentFocusTitle?: string | null;
  progressLabel?: string;
  lastActivityAt?: string;
  hasDraft?: boolean;
  draftState?: string;
  eventRecordId?: string | null;
  projectHomeId?: string | null;
  runtimeCreationRecordId?: string;
  status?: string;
};

type Store = {
  byId: Record<string, LiteEntry>;
  mostRecentId: string | null;
};

function readStore(): Store {
  if (typeof window === "undefined") return { byId: {}, mostRecentId: null };
  try {
    const raw = window.localStorage.getItem(REGISTRY_KEY);
    if (!raw) return { byId: {}, mostRecentId: null };
    const parsed = JSON.parse(raw) as Store;
    if (!parsed?.byId || typeof parsed.byId !== "object") {
      return { byId: {}, mostRecentId: null };
    }
    return {
      byId: parsed.byId,
      mostRecentId: parsed.mostRecentId ?? null,
    };
  } catch {
    return { byId: {}, mostRecentId: null };
  }
}

function writeStore(store: Store): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(REGISTRY_KEY, JSON.stringify(store));
  } catch {
    /* ignore quota */
  }
}

function statusLabel(entry: LiteEntry): string {
  if (entry.hasDraft || entry.draftState === "ready") return "Draft Ready";
  if (/draft ready/i.test(entry.progressLabel || "")) return "Draft Ready";
  if (/\d+ of \d+/i.test(entry.progressLabel || "")) return "In Progress";
  if (/getting started/i.test(entry.progressLabel || "")) return "Getting Started";
  return entry.progressLabel?.trim() || "In Progress";
}

function toCard(entry: LiteEntry): ActiveWorkCardModel {
  const status = statusLabel(entry);
  const focus = entry.currentFocusTitle?.trim();
  return {
    id: `workspace:${entry.workspaceId}`,
    name: entry.title?.trim() || `Untitled ${entry.creationType || "work"}`,
    creationType: entry.creationType?.trim() || "Creation",
    statusLabel: status,
    phaseLabel: status,
    currentFocus: focus
      ? `Next step: ${focus}`
      : "Continue where you left off",
    progressPercent: null,
    nextRecommendedStep: focus ? `Next step: ${focus}` : "Continue",
    lastWorkedAt: entry.lastActivityAt || new Date().toISOString(),
    waitingItems: [],
    sourceKind: "creation_workspace",
    eventRecordId: entry.eventRecordId || entry.workspaceId,
    projectHomeRecordId: entry.projectHomeId ?? null,
    companionProjectId: null,
  };
}

export function listLiteActiveWorkCards(
  memberHomes: readonly {
    id: string;
    name: string;
    status: string;
    currentFocus?: string | null;
    nextSuggestedStep?: string | null;
    lastWorkedAt: string;
    archived?: boolean;
    isSample?: boolean;
    companionProjectId?: string | null;
  }[] = [],
): ActiveWorkCardModel[] {
  const store = readStore();
  const fromWorkspaces = Object.values(store.byId)
    .filter((e) => e.status === "active" && e.workspaceId)
    .sort((a, b) =>
      (b.lastActivityAt || "").localeCompare(a.lastActivityAt || ""),
    )
    .map(toCard);

  const linkedHomeIds = new Set(
    fromWorkspaces
      .map((w) => w.projectHomeRecordId)
      .filter((id): id is string => Boolean(id)),
  );

  const STATUS: Record<string, string> = {
    dreaming: "Dreaming",
    shaping: "Shaping",
    building: "Building",
    launching: "Launching",
    complete: "Complete",
    paused: "Paused",
  };

  const fromHomes = memberHomes
    .filter((h) => !h.archived && !h.isSample)
    .filter((h) => !linkedHomeIds.has(h.id))
    .map(
      (home): ActiveWorkCardModel => ({
        id: `project:${home.id}`,
        name: home.name,
        creationType: "Project",
        statusLabel: STATUS[home.status] ?? "In motion",
        phaseLabel: STATUS[home.status] ?? "In motion",
        currentFocus: home.currentFocus?.trim() || "Continue this work",
        progressPercent: null,
        nextRecommendedStep:
          home.nextSuggestedStep?.trim() || "Open and continue",
        lastWorkedAt: home.lastWorkedAt,
        waitingItems: [],
        sourceKind: "member_project",
        eventRecordId: null,
        projectHomeRecordId: home.id,
        companionProjectId: home.companionProjectId ?? null,
      }),
    );

  return [...fromWorkspaces, ...fromHomes].sort(
    (a, b) =>
      new Date(b.lastWorkedAt).getTime() - new Date(a.lastWorkedAt).getTime(),
  );
}

export function listLiteRecoverableWorkspaces(): Array<{
  workspaceId: string;
  title: string;
  creationType: string;
  status: string;
  lastActivityAt: string;
}> {
  return Object.values(readStore().byId)
    .filter((e) => e.status === "archived" || e.status === "trashed")
    .sort((a, b) =>
      (b.lastActivityAt || "").localeCompare(a.lastActivityAt || ""),
    )
    .map((e) => ({
      workspaceId: e.workspaceId,
      title: e.title?.trim() || "Untitled work",
      creationType: e.creationType?.trim() || "Creation",
      status: e.status || "archived",
      lastActivityAt: e.lastActivityAt || new Date().toISOString(),
    }));
}

export function archiveLiteActiveWorkspace(workspaceId: string): void {
  const id = workspaceId.replace(/^workspace:/, "").trim();
  if (!id) return;
  const store = readStore();
  const prev = store.byId[id];
  if (!prev) return;
  store.byId[id] = {
    ...prev,
    status: "archived",
    lastActivityAt: new Date().toISOString(),
  };
  if (store.mostRecentId === id) store.mostRecentId = null;
  writeStore(store);
}

export function restoreLiteActiveWorkspace(workspaceId: string): void {
  const id = workspaceId.replace(/^workspace:/, "").trim();
  if (!id) return;
  const store = readStore();
  const prev = store.byId[id];
  if (!prev || prev.status === "deleted") return;
  store.byId[id] = {
    ...prev,
    status: "active",
    lastActivityAt: new Date().toISOString(),
  };
  store.mostRecentId = id;
  writeStore(store);
}
