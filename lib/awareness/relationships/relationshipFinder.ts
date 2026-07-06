import type {
  AwarenessException,
  AwarenessObservation,
  AwarenessRelationship,
} from "../types";
import { isUnexpectedChange } from "../detectors/changeDetector";
import type { AwarenessChange } from "../types";

export function findRelationships(observations: AwarenessObservation[]): AwarenessRelationship[] {
  const relationships: AwarenessRelationship[] = [];

  for (let i = 0; i < observations.length; i++) {
    for (let j = i + 1; j < observations.length; j++) {
      const a = observations[i];
      const b = observations[j];
      if (a.domain === b.domain) {
        relationships.push({
          id: `rel-${a.id}-${b.id}`,
          fromObservationId: a.id,
          toObservationId: b.id,
          kind: "correlates",
          summary: `Both relate to ${a.domain.replace(/_/g, " ")}.`,
        });
      }
      if (a.shouldAct && b.shouldWatch) {
        relationships.push({
          id: `rel-act-${a.id}-${b.id}`,
          fromObservationId: a.id,
          toObservationId: b.id,
          kind: "supports",
          summary: "Action candidate supported by a watch signal.",
        });
      }
      if (
        (a.domain === "founder_behavior" && b.domain === "operational_bottleneck") ||
        (b.domain === "founder_behavior" && a.domain === "operational_bottleneck")
      ) {
        relationships.push({
          id: `rel-founder-ops-${a.id}-${b.id}`,
          fromObservationId: a.id,
          toObservationId: b.id,
          kind: "extends",
          summary: "Founder friction may connect to operational bottleneck.",
        });
      }
    }
  }

  return relationships.slice(0, 8);
}

export function detectExceptions(
  changes: AwarenessChange[],
  observations: AwarenessObservation[],
): AwarenessException[] {
  return changes
    .filter(isUnexpectedChange)
    .map((change) => {
      const obs = observations.find((o) => o.signalId === change.signalId);
      return {
        id: `exc-${change.id}`,
        title: change.title,
        summary: change.summary,
        unexpectedBecause: obs?.whyNoticed ?? "Not present in prior baseline.",
        confidence: change.confidence,
      };
    })
    .slice(0, 3);
}
