/**
 * My Work Hub V1 — unified visibility layer across the ecosystem.
 * Reads existing stores only; no new persistence.
 */

import type { AppSection, SidebarNavId } from "./companionUi";
import {
  buildContinuityManifest,
  HOME_RESUME_CONTINUITY_TYPES,
  type ContinuityItemType,
  type ContinuityManifestItem,
} from "./continuityManifest";
import {
  getAvatars,
  getBrainDumps,
  getProjects,
  getProjectItems,
  type IdealClientAvatar,
  type Project,
} from "./companionStore";
import { loadDecisionCompassSession } from "./decisionCompassSessionStore";
import { buildWeeklyWins } from "./weeklyWins";
import { loadStrategyApplySession } from "./strategyApplySessionStore";
import { loadWorkflowRecord } from "./createWorkflowRecordStore";
import { getActiveSavedWork, type SavedWorkItem } from "./savedWorkStore";
import { getUserStrategies, type UserStrategy } from "./userStrategies";
import {
  listAllUnifiedFiles,
  type ProjectFileCategory,
  type UnifiedProjectFile,
} from "./projectFiles";
import { continuityToHomeResume } from "./myWorkHubResume";

export type MyWorkHubItemKind =
  | "saved-work"
  | "create-draft"
  | "project"
  | "decision"
  | "strategy"
  | "client-avatar"
  | "brain-dump"
  | "file"
  | "workspace-sop";

export type MyWorkHubStatus =
  | "draft"
  | "in-progress"
  | "saved"
  | "exported"
  | "complete"
  | "paused";

export type MyWorkHubOpenTarget =
  | { kind: "section"; section: AppSection; nav?: SidebarNavId }
  | { kind: "project"; projectId: string }
  | { kind: "saved-work"; savedWorkId: string }
  | { kind: "url"; url: string }
  | {
      kind: "resume";
      continuityType: ContinuityItemType;
      itemId: string;
      projectId?: string;
      avatarId?: string;
      strategyId?: string;
    };

export type MyWorkHubItem = {
  id: string;
  kind: MyWorkHubItemKind;
  title: string;
  typeLabel: string;
  status: MyWorkHubStatus;
  date: string;
  lastActivity?: string;
  nextStep?: string;
  progress?: number;
  projectId?: string;
  projectName?: string;
  savedWorkId?: string;
  url?: string;
  openTarget: MyWorkHubOpenTarget;
  searchText: string;
  /** Human label: Today, Yesterday, etc. */
  relativeDate?: string;
};

export type MyWorkHubProjectRow = {
  id: string;
  name: string;
  status: Project["status"];
  statusLabel: string;
  openTasks: number;
  totalTasks: number;
  completionPercent: number;
  fileCount: number;
  lastActivity: string;
  nextAction?: string;
  openTarget: MyWorkHubOpenTarget;
};

export type MyWorkHubActiveProjects = {
  activeFocus: MyWorkHubProjectRow[];
  inProgress: MyWorkHubProjectRow[];
  paused: MyWorkHubProjectRow[];
};

export type MyWorkHubRecentGroup = {
  dateLabel: string;
  items: MyWorkHubItem[];
};

export type MyWorkHubIdeasSummary = {
  unsorted: number;
  linkedToProjects: number;
  needingReview: number;
  total: number;
};

export type MyWorkHubAvatarRow = {
  id: string;
  name: string;
  tagline?: string;
  isPrimary: boolean;
  updatedAt: string;
  openTarget: MyWorkHubOpenTarget;
};

export type MyWorkHubStrategyRow = {
  id: string;
  title: string;
  source: UserStrategy["source"] | "active-session";
  category: string;
  updatedAt: string;
  isActiveSession: boolean;
  openTarget: MyWorkHubOpenTarget;
};

export type MyWorkHubFileItem = {
  id: string;
  title: string;
  category: ProjectFileCategory;
  projectId?: string;
  projectName?: string;
  source: string;
  date: string;
  url?: string;
  icon: string;
  openTarget: MyWorkHubOpenTarget;
};

export type MyWorkHubMomentumStat = {
  id: string;
  label: string;
  count: number;
  icon: string;
};

export type MyWorkHubTrustIndicators = {
  projectCount: number;
  savedWorkCount: number;
  resumeItemCount: number;
  lastSaveAt: string | null;
};

export type MyWorkHubSnapshot = {
  continueWorking: MyWorkHubItem[];
  activeProjects: MyWorkHubActiveProjects;
  recentWork: MyWorkHubRecentGroup[];
  ideasWaiting: MyWorkHubIdeasSummary;
  avatars: MyWorkHubAvatarRow[];
  strategies: MyWorkHubStrategyRow[];
  files: MyWorkHubFileItem[];
  momentum: MyWorkHubMomentumStat[];
  trust: MyWorkHubTrustIndicators;
  /** @deprecated use continueWorking */
  continueItems: MyWorkHubItem[];
  /** @deprecated use activeProjects flat list */
  projects: MyWorkHubProjectRow[];
  savedWork: MyWorkHubItem[];
};

const PROJECT_STATUS_LABEL: Record<Project["status"], string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  "active-focus": "Active focus",
  paused: "Paused",
  completed: "Completed",
};

function normalizeSearch(...parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(" ").toLowerCase();
}

export function relativeDateLabel(iso: string, now = new Date()): string {
  try {
    const d = new Date(iso);
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const startOfDate = new Date(d);
    startOfDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round(
      (startOfToday.getTime() - startOfDate.getTime()) / 86400000,
    );
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function relativeTimeAgo(iso: string, now = new Date()): string {
  try {
    const ms = now.getTime() - new Date(iso).getTime();
    const hours = Math.floor(ms / 3600000);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return relativeDateLabel(iso, now);
  } catch {
    return "";
  }
}

function savedWorkToItem(w: SavedWorkItem): MyWorkHubItem {
  const status: MyWorkHubStatus =
    w.status === "draft"
      ? "draft"
      : w.status === "exported"
        ? "exported"
        : "saved";
  const kind: MyWorkHubItemKind =
    w.artifactType === "Decision" || w.tags.includes("decision-compass")
      ? "decision"
      : "saved-work";

  return {
    id: `saved-work:${w.id}`,
    kind,
    title: w.title,
    typeLabel: w.artifactType || "Saved Work",
    status,
    date: w.updatedAt,
    relativeDate: relativeDateLabel(w.updatedAt),
    lastActivity: w.savedLocation,
    nextStep:
      w.status === "draft"
        ? "Continue editing"
        : w.projectId
          ? `In ${w.projectName ?? "project"}`
          : "Open in Saved Work",
    projectId: w.projectId,
    projectName: w.projectName,
    savedWorkId: w.id,
    url: w.googleDocUrl,
    openTarget: { kind: "saved-work", savedWorkId: w.id },
    searchText: normalizeSearch(
      w.title,
      w.artifactType,
      w.typeFolder,
      w.preview,
      w.tags.join(" "),
    ),
  };
}

function continuityToHubItem(item: ContinuityManifestItem): MyWorkHubItem {
  const kindMap: Record<ContinuityItemType, MyWorkHubItemKind> = {
    "create-draft": "create-draft",
    "create-saved-for-later": "create-draft",
    project: "project",
    "client-avatar": "client-avatar",
    "workspace-sop": "workspace-sop",
    "saved-work": "saved-work",
    "decision-compass": "decision",
    "strategy-apply": "strategy",
  };

  const type = item.type;
  let openTarget: MyWorkHubOpenTarget;
  if (type === "project" || type === "workspace-sop") {
    openTarget = {
      kind: "project",
      projectId: item.projectId ?? item.id.replace(/^project:/, ""),
    };
  } else if (type === "saved-work") {
    openTarget = {
      kind: "saved-work",
      savedWorkId: item.id.replace(/^saved-work:/, ""),
    };
  } else {
    openTarget = {
      kind: "resume",
      continuityType: type,
      itemId: item.id,
      projectId: item.projectId,
      avatarId: item.avatarId,
      strategyId: item.id.replace(/^strategy-apply:/, ""),
    };
  }

  return {
    id: item.id,
    kind: kindMap[type],
    title: item.title,
    typeLabel: item.location,
    status: "in-progress",
    date: item.lastTouchedAt,
    relativeDate: relativeTimeAgo(item.lastTouchedAt),
    lastActivity: item.location,
    nextStep: item.nextStep,
    projectId: item.projectId,
    openTarget,
    searchText: normalizeSearch(item.title, item.location, item.nextStep),
  };
}

function projectTaskStats(projectId: string): {
  open: number;
  total: number;
  percent: number;
} {
  const tasks = getProjectItems(projectId).filter(
    (i) => i.kind === "task" || i.kind === "subtask",
  );
  const total = tasks.length;
  const open = tasks.filter((t) => !t.done).length;
  const done = total - open;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return { open, total, percent };
}

function projectToRow(p: Project): MyWorkHubProjectRow {
  const stats = projectTaskStats(p.id);
  const files = listAllUnifiedFiles().filter((f) => f.projectId === p.id);
  return {
    id: p.id,
    name: p.name,
    status: p.status,
    statusLabel: PROJECT_STATUS_LABEL[p.status],
    openTasks: stats.open,
    totalTasks: stats.total,
    completionPercent: stats.percent,
    fileCount: files.length,
    lastActivity: p.updatedAt,
    nextAction: p.nextAction,
    openTarget: { kind: "project", projectId: p.id },
  };
}

function buildActiveProjects(): MyWorkHubActiveProjects {
  const rows = getProjects()
    .filter((p) => p.status !== "completed" && p.status !== "not-started")
    .map(projectToRow);

  return {
    activeFocus: rows.filter((r) => r.status === "active-focus"),
    inProgress: rows.filter((r) => r.status === "in-progress"),
    paused: rows.filter((r) => r.status === "paused"),
  };
}

function buildContinueWorking(
  manifest: ReturnType<typeof buildContinuityManifest>,
): MyWorkHubItem[] {
  const fromManifest = manifest.items
    .filter((i) => HOME_RESUME_CONTINUITY_TYPES.has(i.type))
    .slice(0, 8)
    .map(continuityToHubItem);

  if (fromManifest.length > 0) return fromManifest;

  const draft = getActiveSavedWork().find((w) => w.status === "draft");
  if (draft) return [savedWorkToItem(draft)];
  return [];
}

function buildRecentGroups(items: MyWorkHubItem[]): MyWorkHubRecentGroup[] {
  const deduped = dedupeHubItems(items)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 20)
    .map((item) => ({
      ...item,
      relativeDate: relativeDateLabel(item.date),
    }));

  const groups = new Map<string, MyWorkHubItem[]>();
  for (const item of deduped) {
    const label = item.relativeDate ?? "Earlier";
    const list = groups.get(label) ?? [];
    list.push(item);
    groups.set(label, list);
  }

  return [...groups.entries()].map(([dateLabel, groupItems]) => ({
    dateLabel,
    items: groupItems,
  }));
}

function buildIdeasSummary(): MyWorkHubIdeasSummary {
  const dumps = getBrainDumps().filter((e) => !e.done);
  const unsorted = dumps.filter((e) => !e.sorted && !e.routedAction).length;
  const linkedToProjects = dumps.filter((e) => Boolean(e.projectId)).length;
  const needingReview = dumps.filter(
    (e) => e.sorted && !e.routedAction,
  ).length;
  return {
    unsorted,
    linkedToProjects,
    needingReview,
    total: dumps.length,
  };
}

function buildAvatarRows(): MyWorkHubAvatarRow[] {
  return getAvatars().map((a: IdealClientAvatar) => ({
    id: a.id,
    name: a.name,
    tagline: a.tagline,
    isPrimary: Boolean(a.isPrimary),
    updatedAt: a.updatedAt,
    openTarget: {
      kind: "section",
      section: "client-avatars",
      nav: "client-avatars",
    },
  }));
}

function buildStrategyRows(): MyWorkHubStrategyRow[] {
  const rows: MyWorkHubStrategyRow[] = [];
  const session = loadStrategyApplySession();
  if (session) {
    rows.push({
      id: `session:${session.strategyId}`,
      title: session.strategyTitle,
      source: "active-session",
      category: "In progress",
      updatedAt: session.lastTouchedAt,
      isActiveSession: true,
      openTarget: {
        kind: "section",
        section: "playbook",
        nav: "playbook",
      },
    });
  }
  for (const s of getUserStrategies()) {
    rows.push({
      id: s.id,
      title: s.title,
      source: s.source,
      category: s.category,
      updatedAt: s.updatedAt,
      isActiveSession: false,
      openTarget: {
        kind: "section",
        section: "playbook",
        nav: "playbook",
      },
    });
  }
  return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function buildMomentumStats(): MyWorkHubMomentumStat[] {
  return buildWeeklyWins().stats.map((stat) => ({
    id: stat.id,
    label: stat.label,
    count: stat.count,
    icon: stat.icon,
  }));
}

function fileFromUnified(f: UnifiedProjectFile): MyWorkHubFileItem {
  return {
    id: f.id,
    title: f.title,
    category: f.category,
    projectId: f.projectId || undefined,
    projectName: f.projectName,
    source: f.source,
    date: f.createdAt,
    url: f.url,
    icon: f.icon,
    openTarget: f.url
      ? { kind: "url", url: f.url }
      : f.projectId
        ? { kind: "project", projectId: f.projectId }
        : { kind: "section", section: "projects", nav: "projects" },
  };
}

function computeLastSaveAt(saved: SavedWorkItem[]): string | null {
  const dates = [
    ...saved.map((s) => s.updatedAt),
    ...getProjects().map((p) => p.updatedAt),
  ];
  dates.sort((a, b) => b.localeCompare(a));
  return dates[0] ?? null;
}

/** Remove duplicate hub rows by kind + title. */
export function dedupeHubItems(items: MyWorkHubItem[]): MyWorkHubItem[] {
  const byTitle = new Map<string, MyWorkHubItem>();
  for (const item of items) {
    const key = `${item.kind}:${item.title.toLowerCase().trim()}`;
    const prev = byTitle.get(key);
    if (!prev || item.date > prev.date) {
      byTitle.set(key, item);
    }
  }
  return [...byTitle.values()];
}

function collectAllRecentItems(
  manifest: ReturnType<typeof buildContinuityManifest>,
  saved: SavedWorkItem[],
): MyWorkHubItem[] {
  const savedItems = saved.map(savedWorkToItem);
  const continuityItems = manifest.items.map(continuityToHubItem);
  const strategies = getUserStrategies().map((s) => ({
    id: `strategy:${s.id}`,
    kind: "strategy" as const,
    title: s.title,
    typeLabel: "Strategy",
    status: "saved" as const,
    date: s.updatedAt,
    relativeDate: relativeDateLabel(s.updatedAt),
    openTarget: {
      kind: "section" as const,
      section: "playbook" as const,
      nav: "playbook" as const,
    },
    searchText: normalizeSearch(s.title, s.description),
  }));
  const avatars = getAvatars().map((a) => ({
    id: `avatar:${a.id}`,
    kind: "client-avatar" as const,
    title: a.name,
    typeLabel: "Client Avatar",
    status: "saved" as const,
    date: a.updatedAt,
    relativeDate: relativeDateLabel(a.updatedAt),
    openTarget: {
      kind: "section" as const,
      section: "client-avatars" as const,
      nav: "client-avatars" as const,
    },
    searchText: normalizeSearch(a.name, a.tagline),
  }));
  const projects = getProjects().map((p) => ({
    id: `project:${p.id}`,
    kind: "project" as const,
    title: p.name,
    typeLabel: "Project",
    status:
      p.status === "paused"
        ? ("paused" as const)
        : ("in-progress" as const),
    date: p.updatedAt,
    relativeDate: relativeDateLabel(p.updatedAt),
    projectId: p.id,
    openTarget: { kind: "project" as const, projectId: p.id },
    searchText: normalizeSearch(p.name, p.nextAction),
  }));

  return [
    ...savedItems,
    ...continuityItems,
    ...strategies,
    ...avatars,
    ...projects,
  ];
}

export function buildMyWorkHub(): MyWorkHubSnapshot {
  const manifest = buildContinuityManifest();
  const saved = getActiveSavedWork();
  const savedItems = saved.map(savedWorkToItem);
  const continueWorking = buildContinueWorking(manifest);
  const activeProjects = buildActiveProjects();
  const allRecent = collectAllRecentItems(manifest, saved);
  const flatProjects = [
    ...activeProjects.activeFocus,
    ...activeProjects.inProgress,
    ...activeProjects.paused,
  ];

  const trust: MyWorkHubTrustIndicators = {
    projectCount: flatProjects.length,
    savedWorkCount: saved.length,
    resumeItemCount: continueWorking.length,
    lastSaveAt: computeLastSaveAt(saved),
  };

  return {
    continueWorking,
    activeProjects,
    recentWork: buildRecentGroups(allRecent),
    ideasWaiting: buildIdeasSummary(),
    avatars: buildAvatarRows(),
    strategies: buildStrategyRows(),
    files: listAllUnifiedFiles().map(fileFromUnified),
    momentum: buildMomentumStats(),
    trust,
    continueItems: continueWorking,
    projects: flatProjects,
    savedWork: savedItems.sort((a, b) => b.date.localeCompare(a.date)),
  };
}

export type MyWorkHubSearchGroup = {
  label: string;
  items: MyWorkHubItem[];
};

export function searchMyWorkHub(
  query: string,
  snapshot?: MyWorkHubSnapshot,
): MyWorkHubSearchGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hub = snapshot ?? buildMyWorkHub();
  const pool: MyWorkHubItem[] = [
    ...hub.continueWorking,
    ...hub.savedWork,
    ...hub.recentWork.flatMap((g) => g.items),
    ...hub.projects.map((p) => ({
      id: `search-project:${p.id}`,
      kind: "project" as const,
      title: p.name,
      typeLabel: "Project",
      status: "in-progress" as const,
      date: p.lastActivity,
      openTarget: p.openTarget,
      searchText: normalizeSearch(p.name, p.nextAction),
    })),
    ...hub.files.map((f) => ({
      id: `search-file:${f.id}`,
      kind: "file" as const,
      title: f.title,
      typeLabel: f.category,
      status: "saved" as const,
      date: f.date,
      url: f.url,
      projectName: f.projectName,
      openTarget: f.openTarget,
      searchText: normalizeSearch(f.title, f.projectName, f.source, f.category),
    })),
    ...hub.avatars.map((a) => ({
      id: `search-avatar:${a.id}`,
      kind: "client-avatar" as const,
      title: a.name,
      typeLabel: "Client Avatar",
      status: "saved" as const,
      date: a.updatedAt,
      openTarget: a.openTarget,
      searchText: normalizeSearch(a.name, a.tagline),
    })),
    ...hub.strategies.map((s) => ({
      id: `search-strategy:${s.id}`,
      kind: "strategy" as const,
      title: s.title,
      typeLabel: "Strategy",
      status: "saved" as const,
      date: s.updatedAt,
      openTarget: s.openTarget,
      searchText: normalizeSearch(s.title, s.category),
    })),
  ];

  const hits = dedupeHubItems(pool).filter((i) => i.searchText.includes(q));
  const groups: Record<string, MyWorkHubItem[]> = {};
  for (const item of hits) {
    const label =
      item.kind === "file"
        ? "Files"
        : item.kind === "decision"
          ? "Decisions"
          : item.kind === "project"
            ? "Projects"
            : item.kind === "strategy"
              ? "Strategies"
              : item.kind === "client-avatar"
                ? "Client Avatars"
                : item.kind === "create-draft"
                  ? "Drafts"
                  : "Saved Work";
    groups[label] ??= [];
    groups[label]!.push(item);
  }

  return Object.entries(groups).map(([label, items]) => ({
    label,
    items: items.sort((a, b) => b.date.localeCompare(a.date)),
  }));
}

export { continuityToHomeResume };
