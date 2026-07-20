/**
 * 059 — Discovery → Workspace transition for Events (reference implementation).
 * Current Focus comes from 060 Intelligent Recommendation Engine — never independent logic.
 */

import {
  establishedFactsFromRecord,
} from "@/lib/eventCreationWorkspace/buildEventWorkspace";
import { nextFoundationQuestion } from "@/lib/eventsIntelligence/lifecycle";
import type { EventRecord } from "@/lib/eventsIntelligence/types";
import { recommendForEventWorkspace } from "@/lib/intelligentRecommendation";
import {
  buildUniversalCreationStateSnapshot,
  UNIVERSAL_CREATION_STATE_LABEL,
} from "@/lib/universalCreationStateMachine";
import type {
  DiscoveryConfidence,
  DiscoveryTransitionSnapshot,
  WhatWeKnowRow,
  WorkspaceCurrentFocus,
} from "./types";

export const BANNED_BLANK_WORKSPACE_OPENERS = [
  "What would you like to create first?",
  "What would you like to create?",
  "What do you want to create first?",
  "What do you want to create?",
] as const;

function filled(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

/**
 * 059 — Minimum foundation to open a Workspace (workshop reference).
 * Venue / budget / full dates belong to progressive discovery later.
 */
export function hasEventMinimumFoundation(record: EventRecord): boolean {
  return (
    Boolean(record.eventType) &&
    filled(record.purpose) &&
    filled(record.audience) &&
    filled(record.outcomes)
  );
}

export function assessEventDiscoveryConfidence(
  record: EventRecord,
): DiscoveryConfidence {
  const hasType = Boolean(record.eventType);
  const hasPurpose = filled(record.purpose);
  const hasAudience = filled(record.audience);
  const hasOutcome = filled(record.outcomes);
  const hasDuration =
    filled(record.dates) ||
    /\b(\d+\s*-?\s*\d*\s*hours?|half[- ]day|full[- ]day|weekend)\b/i.test(
      `${record.purpose} ${record.conversationContext} ${record.dates}`,
    );
  const score =
    Number(hasType) +
    Number(hasPurpose) +
    Number(hasAudience) +
    Number(hasOutcome) +
    Number(hasDuration);

  if (hasEventMinimumFoundation(record) && hasDuration) return "very_high";
  if (hasEventMinimumFoundation(record)) return "high";
  if (score >= 2) return "medium";
  return "low";
}

/** Ready to leave Discovery and open the Workspace with a recommendation. */
export function isEventFoundationReady(record: EventRecord): boolean {
  return hasEventMinimumFoundation(record);
}

export function buildWhatWeKnowRows(record: EventRecord): WhatWeKnowRow[] {
  const rows: WhatWeKnowRow[] = [];
  if (record.eventTypeLabel) {
    rows.push({ label: "Type", value: record.eventTypeLabel });
  }
  if (filled(record.audience)) {
    rows.push({ label: "Audience", value: record.audience.trim() });
  }
  if (filled(record.purpose)) {
    rows.push({ label: "Purpose", value: record.purpose.trim() });
  }
  if (filled(record.outcomes)) {
    rows.push({ label: "Primary outcome", value: record.outcomes.trim() });
  }
  if (record.format !== "unspecified") {
    rows.push({
      label: "Format",
      value:
        record.format === "in_person"
          ? "In person"
          : record.format === "virtual"
            ? "Virtual"
            : "Hybrid",
    });
  }
  if (filled(record.dates)) {
    rows.push({ label: "Timing", value: record.dates.trim() });
  }
  if (filled(record.venue)) {
    rows.push({ label: "Venue", value: record.venue.trim() });
  }
  return rows;
}

export function buildWorkspaceCurrentFocus(
  record: EventRecord,
): WorkspaceCurrentFocus {
  const pack = recommendForEventWorkspace(record);
  const primary = pack.primary;
  return {
    title: primary.title,
    reason: primary.reason,
    actionLabel: primary.actionLabel,
    estimatedEffort: primary.estimatedEffort,
    assetTypeId: primary.assetTypeId ?? null,
    sectionId: primary.sectionId ?? null,
  };
}

export function buildDiscoveryTransitionReply(record: EventRecord): string {
  const rows = buildWhatWeKnowRows(record);
  const pack = recommendForEventWorkspace(record);
  const foundationReady = isEventFoundationReady(record);

  if (!foundationReady) {
    const nextQ = nextFoundationQuestion(record);
    const known =
      rows.length > 0
        ? `I've noted: ${rows
            .slice(0, 3)
            .map((r) => `${r.label.toLowerCase()} — ${r.value}`)
            .join("; ")}.`
        : "I'm building the foundation with you.";
    return `${known}\n\n${nextQ?.prompt ?? "What else should I understand before we begin?"}`;
  }

  const kind =
    record.eventTypeLabel?.trim().toLowerCase() ||
    record.eventType ||
    "event";
  const focusLine =
    pack.primary.conversationLine?.trim() ||
    "I'd recommend creating your agenda next — it becomes the backbone for almost everything else.";

  // Conversational handoff — never checklists or software status language
  return (
    `Wonderful.\n\n` +
    `Your ${kind} has a home now. We've already done the hardest part — getting started.\n\n` +
    `I know enough to keep going. I've gathered what we've discussed so far in your workspace.\n\n` +
    `${focusLine}`
  );
}

export function buildEventDiscoveryTransition(
  record: EventRecord,
): DiscoveryTransitionSnapshot {
  const confidence = assessEventDiscoveryConfidence(record);
  const foundationReady = isEventFoundationReady(record);
  const whatWeKnow = buildWhatWeKnowRows(record);
  const pack = recommendForEventWorkspace(record);
  const currentFocus = buildWorkspaceCurrentFocus(record);
  const stateSnap = buildUniversalCreationStateSnapshot(record);
  const phaseLabel =
    stateSnap.state === "foundation"
      ? "Foundation ready"
      : UNIVERSAL_CREATION_STATE_LABEL[stateSnap.state];

  return {
    confidence,
    foundationReady,
    whatWeKnow,
    knownFactLines: establishedFactsFromRecord(record),
    currentFocus,
    phaseLabel,
    conversationReply: buildDiscoveryTransitionReply(record),
    bannedBlankOpeners: BANNED_BLANK_WORKSPACE_OPENERS,
    secondaryRecommendations: pack.secondary.slice(0, 3).map((s) => ({
      title: s.title,
      reason: s.reason,
    })),
    universalCreationState: stateSnap.state,
  };
}

/** True when a reply would violate 059 (blank / re-ask create). */
export function isBannedBlankWorkspaceOpener(text: string): boolean {
  const t = text.trim().toLowerCase();
  return BANNED_BLANK_WORKSPACE_OPENERS.some(
    (banned) => t === banned.toLowerCase() || t.includes(banned.toLowerCase()),
  );
}
