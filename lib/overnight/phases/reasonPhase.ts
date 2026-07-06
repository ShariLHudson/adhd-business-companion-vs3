import { executiveQuestionService } from "@/lib/executiveQuestions";

import type {
  ObservePhasePayload,
  OvernightProductAudience,
  OvernightReasoningItem,
  ReasonPhasePayload,
} from "../types";

function audiencesForObservation(kind: string): OvernightProductAudience[] {
  const base: OvernightProductAudience[] = ["ecosystem"];
  if (kind === "opportunity" || kind === "theme") {
    return [...base, "founder", "companion"];
  }
  if (kind === "risk") {
    return [...base, "founder", "team-hub"];
  }
  if (kind === "pattern") {
    return [...base, "founder", "postcraft", "members"];
  }
  return [...base, "founder"];
}

export function runReasonPhase(input: ObservePhasePayload): ReasonPhasePayload {
  const founderQuestions = executiveQuestionService.listQuestions({ product: "founder" });
  const items: OvernightReasoningItem[] = input.observations.map((obs) => {
    const affectsMission = obs.kind === "opportunity" || obs.kind === "theme" || obs.kind === "risk";
    const matters =
      obs.confidence >= 65 ||
      obs.kind === "risk" ||
      founderQuestions.some((q) => q.tags.includes(obs.kind));

    return {
      id: `reason-${obs.id}`,
      observationId: obs.id,
      matters,
      affectsMission,
      audiences: matters ? audiencesForObservation(obs.kind) : ["ecosystem"],
      rationale: matters
        ? `Executive Questions framework: ${obs.title} warrants founder attention.`
        : "Logged for pattern memory; no immediate executive action.",
      missionIds: affectsMission ? ["listening-rooms"] : [],
    };
  });

  return {
    items,
    founderRelevant: items.filter((i) => i.matters && i.audiences.includes("founder")).length,
  };
}
