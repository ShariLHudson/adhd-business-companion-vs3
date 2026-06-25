/**
 * My Thoughts™ — living thought & collection types.
 * Collections are many-to-many overlays, not folders.
 * @see lib/intelligence/INTELLIGENCE_REGISTRY.md
 */

import type {
  EcosystemObjectKind,
  IntelligenceEngineId,
} from "@/lib/intelligence/intelligenceReadyTypes";

export type ThoughtCollection = {
  id: string;
  label: string;
  createdAt: string;
  updatedAt?: string;
  /** User created vs AI-suggested (user still decides) */
  userCreated: boolean;
  suggestedByAi?: boolean;
  /** Merged collection ids (for LIG lineage) */
  mergedFrom?: string[];
  /** Companion Box™ identity */
  icon?: string;
  /** Distinct color slot — see collectionColors.ts */
  colorId?: string;
  /** LIG edges when collections connect to themes/projects */
  connectionIds?: string[];
  /** Per-engine enrichments — internal only */
  intelligenceMeta?: Partial<Record<IntelligenceEngineId, unknown>>;
  originatedFromId?: string;
  originatedFromKind?: EcosystemObjectKind;
};

export type ThoughtRetentionPolicy =
  | "today"
  | "week"
  | "until-done"
  | "indefinite"
  | "ask-later";

/** Future view layers — V1 uses collection only. */
export type MyThoughtsViewMode =
  | "collection"
  | "connection"
  | "growth"
  | "landscape";

export type ThoughtConnectionKind =
  | "thought"
  | "project"
  | "person"
  | "goal"
  | "content"
  | "event";

/** Living Intelligence Graph™ — meaningful links only (future). */
export type ThoughtConnection = {
  id: string;
  fromThoughtId: string;
  toKind: ThoughtConnectionKind;
  toId: string;
  label?: string;
  createdAt: string;
  userCreated: boolean;
};

export type ThoughtGrowthStage =
  | "captured"
  | "organized"
  | "project"
  | "completed";

/** Mind Landscape™ signals (future) — stored for LIG consumption. */
export type ThoughtLandscapeSignals = {
  thoughtCount: number;
  recentCaptureCount: number;
  connectionCount: number;
  momentum: number;
  lastActiveAt: string | null;
};
