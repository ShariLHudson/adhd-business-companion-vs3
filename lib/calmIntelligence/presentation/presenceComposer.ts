import type { DisclosureLayer, ExecutivePresence, ProgressiveDisclosure } from "../types";
import { EXECUTIVE_PRESENCE_QUALITIES } from "../sample";

export function buildProgressiveDisclosure(
  summary: string,
  detail?: string,
  evidence?: string[],
  history?: string[],
  requestedLayer: DisclosureLayer = "summary",
): ProgressiveDisclosure {
  const layers: DisclosureLayer[] = ["summary", "detail", "evidence", "history"];
  const maxIndex = layers.indexOf(requestedLayer);

  return {
    summary,
    detail: maxIndex >= 1 ? detail : undefined,
    evidence: maxIndex >= 2 ? evidence : undefined,
    history: maxIndex >= 3 ? history : undefined,
    layer: requestedLayer,
  };
}

export function composeExecutivePresence(headline: string, subhead: string): ExecutivePresence {
  void EXECUTIVE_PRESENCE_QUALITIES;
  return {
    tone: "quietly_confident",
    headline,
    subhead,
    neverUrgentWithoutReason: true,
  };
}
