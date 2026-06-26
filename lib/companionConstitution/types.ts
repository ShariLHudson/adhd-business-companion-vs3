/**
 * Companion Constitution™ — permanent architectural hierarchy.
 *
 * User → Conversation Intelligence → Companion Intelligence →
 * Specialized Intelligence Layer → Environment Intelligence →
 * Presence Intelligence → Scene Render Contract → Living Border → Workspace UI
 *
 * A lower layer may NEVER override a decision made by a higher layer.
 * Companion Intelligence™ is the only orchestration authority.
 */

export const COMPANION_CONSTITUTION_VERSION = "2.0" as const;

export const CONSTITUTIONAL_HIERARCHY = [
  "conversation-intelligence",
  "companion-intelligence",
  "specialized-intelligence-layer",
  "environment-intelligence",
  "presence-intelligence",
  "scene-render-contract",
  "living-border",
  "workspace-ui",
] as const;

export type ConstitutionalLayerId = (typeof CONSTITUTIONAL_HIERARCHY)[number];

export const CONSTITUTIONAL_RULE =
  "A lower architectural layer may never override a decision made by a higher layer." as const;

export const ORCHESTRATION_RULE =
  "Companion Intelligence™ is the only orchestration authority. The user never interacts with individual intelligences." as const;

export const SPECIALIZATION_RULE =
  "Every intelligence answers exactly one category of questions. No intelligence may duplicate another." as const;
