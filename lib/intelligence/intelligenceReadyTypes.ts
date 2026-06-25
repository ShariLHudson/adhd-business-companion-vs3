/**
 * Intelligence-Ready Architecture™
 * Shared hooks for every living object in the ADHD Business Ecosystem™.
 *
 * Users never see intelligenceMeta or bulk connection graphs in V1.
 * Engines enrich quietly; the surface stays calm.
 *
 * @see lib/intelligence/INTELLIGENCE_REGISTRY.md
 */

/** Canonical object kinds — extend when adding new domain types. */
export type EcosystemObjectKind =
  | "thought"
  | "collection"
  | "project"
  | "project-item"
  | "time-block"
  | "conversation"
  | "conversation-turn"
  | "client-avatar"
  | "business-profile"
  | "template"
  | "snippet"
  | "content-draft"
  | "decision"
  | "opportunity"
  | "relationship"
  | "reminder"
  | "calendar-event"
  | "document"
  | "voice-session"
  | "journal-entry"
  | "momentum-event"
  | "day-state"
  | "capture-session"
  | "founder-event"
  | "intelligence-signal";

/** Engines that may enrich objects over time — registry keys. */
export type IntelligenceEngineId =
  | "living-intelligence-graph"
  | "narrative"
  | "arrival"
  | "companion-presence"
  | "founder"
  | "decision"
  | "opportunity"
  | "business"
  | "growth"
  | "recovery"
  | "pattern"
  | "relationship"
  | "content"
  | "learning"
  | "automation"
  | "project"
  | "calendar"
  | "audience"
  | "offer"
  | "environment"
  | "momentum"
  | "loop"
  | "clear-my-mind"
  | "ecosystem"
  | "trust"
  | "unknown";

/**
 * Optional hooks every new object type should support from day one.
 * Domain types extend or intersect this — never duplicate lineage elsewhere.
 */
export type IntelligenceReadyHooks = {
  id: string;
  createdAt: string;
  updatedAt?: string;
  /** Same object evolved — no re-entry, no duplicate rows */
  originatedFromId?: string;
  originatedFromKind?: EcosystemObjectKind;
  /** Living Intelligence Graph™ edge ids */
  connectionIds?: string[];
  /** Per-engine enrichments — write-only from intelligence layers */
  intelligenceMeta?: Partial<Record<IntelligenceEngineId, unknown>>;
};

/** Ask before every sprint — see AGENTS.md Intelligence-Ready Architecture™ */
export const INTELLIGENCE_READY_SPRINT_QUESTIONS = [
  "What is this object?",
  "What relationships might it eventually have?",
  "Which future intelligence engines could benefit from it?",
  "What metadata should exist now even if unused?",
  "Will this still support features we have not imagined yet?",
] as const;
