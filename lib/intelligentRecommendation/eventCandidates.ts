/**
 * 060 — Event Workspace recommendation candidates (reference domain).
 * All domains feed the same rankAndLimit — no independent workspace logic.
 */

import { buildWorkspaceFocusedRecommendations } from "@/lib/eventsIntelligence/eventAssetRegistry/sectionCapabilityPanel";
import {
  inferNextAction,
  nextFoundationQuestion,
} from "@/lib/eventsIntelligence/lifecycle";
import type { EventRecord } from "@/lib/eventsIntelligence/types";
import { resolveUniversalCreationStateFromEvent } from "@/lib/universalCreationStateMachine";
import type { IntelligentRecommendation } from "./types";

function sectionFilled(record: EventRecord, id: string): boolean {
  return Boolean(
    record.sections.find((s) => s.id === id)?.content.trim(),
  );
}

/** Work that unlocks other work — dependency-aware. */
const UNLOCK_GRAPH: Record<string, string[]> = {
  agenda: ["Workbook", "Presentation", "Registration", "Run of Show", "Speaker Notes"],
  audience: ["Landing Page", "Marketing", "Registration", "Feedback"],
  purpose: ["Agenda", "Marketing", "Goals"],
};

export function collectEventRecommendationCandidates(
  record: EventRecord,
): IntelligentRecommendation[] {
  const candidates: IntelligentRecommendation[] = [];
  const kind = record.eventTypeLabel?.toLowerCase() || "event";
  const universalState = resolveUniversalCreationStateFromEvent(record);

  // 061 — never recommend building while still in idea/discovery
  if (universalState === "idea" || universalState === "discovery") {
    const nextQ = nextFoundationQuestion(record);
    candidates.push({
      id: `foundation-${nextQ?.id ?? "next"}`,
      title: nextQ
        ? `Confirm ${nextQ.sectionId.replace(/_/g, " ")}`
        : inferNextAction(record),
      category: "make_a_decision",
      confidence: "high",
      reason:
        "A little more foundation helps Spark Estate open the right workspace sections.",
      estimatedEffort: "2–5 minutes",
      impact: "high",
      unlocks: ["Workspace", "Agenda", "Planning sections"],
      actionLabel: "Continue",
      conversationLine:
        "Let's lock one more foundation detail, then we can start building.",
      source: "lifecycle",
      score: 90,
      sectionId: nextQ?.sectionId ?? null,
    });
    return candidates;
  }

  if (
    universalState === "foundation" ||
    universalState === "planning" ||
    (universalState === "building" && !sectionFilled(record, "agenda"))
  ) {
    if (!sectionFilled(record, "agenda")) {
      candidates.push({
        id: "build-agenda",
        title: "Create Agenda",
        category: "build_something",
        confidence: "very_high",
        reason:
          `Many other ${kind} assets depend on the agenda — it becomes the backbone for the experience.`,
        estimatedEffort: "20–30 minutes",
        impact: "high",
        unlocks: UNLOCK_GRAPH.agenda ?? [],
        actionLabel: "Continue",
        conversationLine:
          `You've completed your ${kind} foundation. Nice work.\n\n` +
          `I'd recommend creating your agenda next — it becomes the backbone for many of the other pieces we'll build.`,
        source: "dependency_engine",
        score: 100,
        urgent: true,
        assetTypeId: "agenda",
        sectionId: "agenda",
      });
    }
  }

  if (universalState === "review") {
    candidates.push({
      id: "review-gaps",
      title: "Review what's still missing",
      category: "review",
      confidence: "high",
      reason: "A quick readiness pass keeps execution calm.",
      estimatedEffort: "10–15 minutes",
      impact: "high",
      unlocks: ["Ready"],
      actionLabel: "Continue",
      conversationLine:
        "I'd take a short review pass next — we'll spot gaps before anything goes live.",
      source: "readiness",
      score: 95,
    });
  }

  if (universalState === "growth") {
    candidates.push({
      id: "growth-repurpose",
      title: "Explore what this could become next",
      category: "reuse",
      confidence: "high",
      reason: "Completed creations often grow into courses, memberships, or replays.",
      estimatedEffort: null,
      impact: "medium",
      unlocks: ["Course", "Membership", "Replay"],
      actionLabel: "Continue",
      conversationLine:
        "This creation has room to grow — we could turn it into a course, replay, or membership path.",
      source: "creation_engine",
      score: 85,
    });
  }

  if (sectionFilled(record, "agenda") && universalState !== "review") {
    const next = inferNextAction(record);
    if (!/^Confirm /i.test(next)) {
      candidates.push({
        id: "lifecycle-next",
        title: next,
        category: "continue_work",
        confidence: "high",
        reason: "This continues momentum from what you've already shaped.",
        estimatedEffort: null,
        impact: "medium",
        unlocks: [],
        actionLabel: "Continue",
        conversationLine: `I'd continue with: ${next}.`,
        source: "lifecycle",
        score: 70,
      });
    }
  }

  // Capability registry — only during planning/building (not discovery)
  if (
    universalState === "planning" ||
    universalState === "building" ||
    universalState === "foundation"
  ) {
    const focused = buildWorkspaceFocusedRecommendations(record, 8);
    for (const asset of focused) {
      if (asset.assetTypeId === "agenda" && !sectionFilled(record, "agenda")) {
        continue;
      }
      if (asset.band === "already_created" || asset.band === "not_applicable") {
        continue;
      }
      const confidence =
        asset.band === "required_now"
          ? ("high" as const)
          : asset.band === "recommended_now"
            ? ("high" as const)
            : asset.band === "recommended_later"
              ? ("medium" as const)
              : ("low" as const);

      candidates.push({
        id: `asset-${asset.assetTypeId}`,
        title: `Create ${asset.userFacingName}`,
        category: "build_something",
        confidence,
        reason: asset.reason,
        estimatedEffort: null,
        impact: asset.band === "required_now" ? "high" : "medium",
        unlocks: UNLOCK_GRAPH[asset.assetTypeId] ?? [],
        actionLabel: "Continue",
        conversationLine: `Another solid option is ${asset.userFacingName.toLowerCase()} — ${asset.reason}`,
        source: "capability_registry",
        score: Math.max(10, 60 - asset.priority),
        assetTypeId: asset.assetTypeId,
        sectionId: null,
      });
    }
  }

  return candidates;
}
