import { FOUNDER_STUDIO_BASE } from "@/lib/founderStudio/founderConfig";

import type { FounderWorkspaceId, FounderWorkspaceMeta } from "../types/workspace";

export const FOUNDER_WORKSPACE_IDS: readonly FounderWorkspaceId[] = [
  "start",
  "build",
  "grow",
  "discover",
  "team",
  "simplify",
] as const;

export const FOUNDER_WORKSPACE_META: readonly FounderWorkspaceMeta[] = [
  {
    id: "start",
    icon: "🌅",
    title: "Start My Day",
    purpose: "Morning orientation — brief, alerts, priorities, and pulse in one calm view.",
    href: `${FOUNDER_STUDIO_BASE}/workspace/start`,
    accent: "gold",
  },
  {
    id: "build",
    icon: "🏗",
    title: "Build",
    purpose: "Everything related to creating and improving Spark products.",
    href: `${FOUNDER_STUDIO_BASE}/workspace/build`,
    accent: "bronze",
  },
  {
    id: "grow",
    icon: "📈",
    title: "Grow",
    purpose: "Revenue, offers, content, and business opportunities.",
    href: `${FOUNDER_STUDIO_BASE}/workspace/grow`,
    accent: "teal",
  },
  {
    id: "discover",
    icon: "🧠",
    title: "Discover",
    purpose: "Learning, research, FIRE reports, and intelligence.",
    href: `${FOUNDER_STUDIO_BASE}/workspace/discover`,
    accent: "purple",
  },
  {
    id: "team",
    icon: "👥",
    title: "Team",
    purpose: "Execution — projects, approvals, Izna, and publishing.",
    href: `${FOUNDER_STUDIO_BASE}/workspace/team`,
    accent: "aqua",
  },
  {
    id: "simplify",
    icon: "🌿",
    title: "Simplify Today",
    purpose: "Reduce overwhelm — only what matters right now.",
    href: `${FOUNDER_STUDIO_BASE}/workspace/simplify`,
    accent: "gold",
  },
];

export function isFounderWorkspaceId(id: string): id is FounderWorkspaceId {
  return FOUNDER_WORKSPACE_IDS.includes(id as FounderWorkspaceId);
}

export function getWorkspaceMeta(
  id: FounderWorkspaceId,
): FounderWorkspaceMeta | undefined {
  return FOUNDER_WORKSPACE_META.find((workspace) => workspace.id === id);
}

export function workspaceHref(id: FounderWorkspaceId): string {
  return `${FOUNDER_STUDIO_BASE}/workspace/${id}`;
}
