/**
 * Workspace intelligence registry — every workspace consumes and contributes.
 * @see docs/LIVE_REALITY_ECOSYSTEM.md
 */

import type { RealitySignalKind, RealitySignalSource } from "./types";

export type WorkspaceIntelligenceRole = "producer" | "consumer" | "both" | "wisdom";

export type WorkspaceIntelligenceEntry = {
  id: string;
  name: string;
  role: WorkspaceIntelligenceRole;
  /** What this workspace reads from Live Reality / Companion Brain */
  consumes: string[];
  /** What reality signals this workspace may publish */
  contributes: RealitySignalSource[];
  signalKinds: RealitySignalKind[];
  status: "live" | "partial" | "future";
};

/**
 * Canonical map — extend as workspaces wire into Live Reality.
 */
export const WORKSPACE_INTELLIGENCE_REGISTRY: WorkspaceIntelligenceEntry[] = [
  {
    id: "todays-reality",
    name: "Today's Reality",
    role: "producer",
    consumes: ["live-judgment-framing"],
    contributes: ["todays-reality"],
    signalKinds: ["day-state"],
    status: "live",
  },
  {
    id: "plan-my-day",
    name: "Plan My Day",
    role: "both",
    consumes: ["live-judgment", "memory", "live-reality"],
    contributes: ["plan-my-day"],
    signalKinds: ["plan-items"],
    status: "partial",
  },
  {
    id: "clear-my-mind",
    name: "Clear My Mind",
    role: "producer",
    consumes: ["live-judgment-tone"],
    contributes: ["clear-my-mind"],
    signalKinds: ["capture"],
    status: "partial",
  },
  {
    id: "my-thoughts",
    name: "My Thoughts",
    role: "producer",
    consumes: ["live-judgment"],
    contributes: ["my-thoughts"],
    signalKinds: ["capture"],
    status: "future",
  },
  {
    id: "focus",
    name: "Focus My Brain",
    role: "consumer",
    consumes: ["live-judgment", "capacity", "live-reality"],
    contributes: ["focus"],
    signalKinds: ["focus-session"],
    status: "future",
  },
  {
    id: "projects",
    name: "Projects",
    role: "consumer",
    consumes: ["live-judgment", "live-reality"],
    contributes: ["business"],
    signalKinds: ["project"],
    status: "future",
  },
  {
    id: "founder-intelligence",
    name: "Founder Intelligence",
    role: "wisdom",
    consumes: ["all-signals", "reflection", "adaptation-history"],
    contributes: [],
    signalKinds: [],
    status: "partial",
  },
  {
    id: "business-intelligence",
    name: "Business Intelligence",
    role: "consumer",
    consumes: ["live-reality", "projects", "crm", "calendar", "revenue"],
    contributes: ["business"],
    signalKinds: ["generic"],
    status: "future",
  },
  {
    id: "postcraft",
    name: "PostCraft",
    role: "consumer",
    consumes: ["live-judgment", "creative-capacity"],
    contributes: [],
    signalKinds: [],
    status: "future",
  },
  {
    id: "decision-compass",
    name: "Decision Compass",
    role: "consumer",
    consumes: ["live-judgment", "live-reality"],
    contributes: ["mood", "capacity"],
    signalKinds: ["generic"],
    status: "future",
  },
  {
    id: "relationship-intelligence",
    name: "Relationship Intelligence",
    role: "consumer",
    consumes: ["live-judgment", "emotional-signals", "live-reality"],
    contributes: ["family", "mood"],
    signalKinds: ["generic"],
    status: "future",
  },
];

export function workspaceIntelligenceFor(
  id: string,
): WorkspaceIntelligenceEntry | undefined {
  return WORKSPACE_INTELLIGENCE_REGISTRY.find((w) => w.id === id);
}
