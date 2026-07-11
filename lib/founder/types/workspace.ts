/** Workspace Orchestrator — intention-based executive workspaces */

import type { FounderLabelTone } from "./index";

export type FounderWorkspaceId =
  | "start"
  | "build"
  | "grow"
  | "discover"
  | "team"
  | "simplify";

export type FounderImpactStars = 1 | 2 | 3 | 4 | 5;

export type FounderExecutiveRecommendation = {
  id: string;
  title: string;
  summary: string;
  impactStars: FounderImpactStars;
  tone?: FounderLabelTone;
};

export type FounderWorkspaceItem = {
  id: string;
  title: string;
  summary?: string;
  meta?: string;
  tone?: FounderLabelTone;
};

export type FounderWorkspaceSection = {
  id: string;
  title: string;
  subtitle?: string;
  items: FounderWorkspaceItem[];
  /** Surface sections show on entry; deep sections unfold on demand. */
  depth: "surface" | "deep";
};

export type FounderWorkspace = {
  id: FounderWorkspaceId;
  icon: string;
  title: string;
  purpose: string;
  recommendation: FounderExecutiveRecommendation;
  priorities: FounderWorkspaceItem[];
  actions: FounderWorkspaceItem[];
  sections: FounderWorkspaceSection[];
  /** Internal — rooms that power this workspace. Not shown in UI. */
  roomIds: readonly string[];
};

export type FounderWorkspaceMeta = {
  id: FounderWorkspaceId;
  icon: string;
  title: string;
  purpose: string;
  href: string;
  accent: "gold" | "teal" | "aqua" | "bronze" | "purple";
};

type ScoreInput = {
  confidence?: number;
  impact?: number;
  urgency?: number;
};

export function scoreToImpactStars(score?: ScoreInput): FounderImpactStars {
  const raw = score?.impact ?? score?.confidence ?? score?.urgency ?? 0.7;
  const stars = Math.round(raw * 5);
  return Math.min(5, Math.max(1, stars)) as FounderImpactStars;
}
