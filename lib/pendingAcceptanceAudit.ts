/**
 * Trust Sprint #1 — Phase D.1: acceptance path inventory.
 */

import type { PendingAcceptanceKind } from "./pendingAcceptanceAuthority";

export type AcceptanceAuditRow = {
  source: string;
  action: string;
  currentBehavior: string;
  confidence: "high" | "medium" | "low";
  kind: PendingAcceptanceKind;
};

export const ACCEPTANCE_PATH_AUDIT: readonly AcceptanceAuditRow[] = [
  {
    source: "Workspace offer card",
    action: "Open workspace section",
    currentBehavior: "resolvePendingAcceptance → acceptWorkspaceOffer",
    confidence: "high",
    kind: "workspace",
  },
  {
    source: "Create consent offer (Phase C)",
    action: "Open Create",
    currentBehavior: "resolvePendingAcceptance → requestCreateOpen",
    confidence: "high",
    kind: "create_consent",
  },
  {
    source: "Draft switch offer",
    action: "Switch / continue draft",
    currentBehavior: "resolvePendingAcceptance → requestCreateOpen",
    confidence: "high",
    kind: "draft_switch",
  },
  {
    source: "Artifact export offer",
    action: "Save / export draft",
    currentBehavior: "resolvePendingAcceptance → executePendingAction",
    confidence: "high",
    kind: "artifact_export",
  },
  {
    source: "Assisted action card",
    action: "Open assisted workspace",
    currentBehavior: "resolvePendingAcceptance → acceptAssistedAction",
    confidence: "high",
    kind: "assisted",
  },
  {
    source: "Do it now offer",
    action: "Launch quick action",
    currentBehavior: "resolvePendingAcceptance only (no bare yes fallback)",
    confidence: "medium",
    kind: "do_it_now",
  },
  {
    source: "Tool suggestion card",
    action: "Open tool",
    currentBehavior: "resolvePendingAcceptance → executePendingAction",
    confidence: "high",
    kind: "tool",
  },
  {
    source: "Action bridge",
    action: "Cross-workspace bridge",
    currentBehavior: "resolvePendingAcceptance → executePendingAction",
    confidence: "high",
    kind: "action_bridge",
  },
  {
    source: "Strategy chat selection",
    action: "Apply strategy",
    currentBehavior: "Explicit strategy phrases (not generic yes)",
    confidence: "medium",
    kind: "strategy_selection",
  },
  {
    source: "Decision compass offer",
    action: "Open Decision Compass",
    currentBehavior: "Explicit request or valid pending record",
    confidence: "medium",
    kind: "decision_flow",
  },
  {
    source: "Home resume / continuity",
    action: "Resume workspace",
    currentBehavior: "Explicit resume intent (not generic yes)",
    confidence: "high",
    kind: "resume",
  },
  {
    source: "Legacy bare yes block",
    action: "doItNow / assisted guess",
    currentBehavior: "Removed — conversation only without pending",
    confidence: "high",
    kind: "assisted",
  },
];
