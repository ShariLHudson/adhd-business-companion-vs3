import type { ClassifiedUserSignals } from "@/lib/ecosystem/userIntelligenceEngine";
import type { EmotionalState } from "@/lib/companionEmotions";

import { applySignalIncrementally } from "./profileEvolution";
import { appendIntelligenceSignal } from "./signalStore";
import type {
  IntelligenceSignal,
  IntelligenceSignalDomain,
  IntelligenceSignalValence,
} from "./types";

function struggleToDomain(category: string): IntelligenceSignalDomain {
  if (category === "content_creation" || category === "marketing") return "business";
  if (category === "overwhelm") return "emotional";
  return "conversation";
}

function emotionValence(
  category: string,
): IntelligenceSignalValence | undefined {
  if (category === "excited" || category === "hopeful") return "positive";
  if (
    category === "frustrated" ||
    category === "stuck" ||
    category === "confused"
  ) {
    return "negative";
  }
  return "neutral";
}

/** Bridge classified chat signals into the intelligence signal store. */
export function ingestClassifiedUserSignals(
  classified: ClassifiedUserSignals,
  opts: { source?: string; emotionalState?: EmotionalState | null } = {},
): IntelligenceSignal[] {
  const source = opts.source ?? "chat";
  const recorded: IntelligenceSignal[] = [];

  for (const s of classified.struggles) {
    const signal = appendIntelligenceSignal({
      domain: struggleToDomain(s),
      category: s,
      source,
      valence: s === "overwhelm" ? "negative" : "neutral",
    });
    recorded.push(signal);
    applySignalIncrementally(signal);
  }

  for (const q of classified.questions) {
    const signal = appendIntelligenceSignal({
      domain: "conversation",
      category: q,
      source,
      valence: q === "im_overwhelmed" ? "negative" : "neutral",
    });
    recorded.push(signal);
    applySignalIncrementally(signal);
  }

  for (const e of classified.emotions) {
    const signal = appendIntelligenceSignal({
      domain: "emotional",
      category: e,
      source,
      valence: emotionValence(e),
    });
    recorded.push(signal);
    applySignalIncrementally(signal);
  }

  if (opts.emotionalState) {
    const mapped = emotionalStateToSignals(opts.emotionalState, source);
    for (const input of mapped) {
      const signal = appendIntelligenceSignal(input);
      recorded.push(signal);
      applySignalIncrementally(signal);
    }
  }

  return recorded;
}

function emotionalStateToSignals(
  state: EmotionalState,
  source: string,
): Array<Omit<IntelligenceSignal, "id" | "at" | "date">> {
  switch (state) {
    case "overwhelmed":
      return [
        {
          domain: "emotional",
          category: "overwhelm",
          source,
          valence: "negative",
        },
      ];
    case "stuck":
      return [
        {
          domain: "emotional",
          category: "stuck",
          source,
          valence: "negative",
        },
      ];
    case "emotional":
      return [
        {
          domain: "emotional",
          category: "frustrated",
          source,
          valence: "negative",
        },
      ];
    case "building":
      return [
        {
          domain: "creation",
          category: "content_created",
          source,
          valence: "positive",
        },
      ];
    case "focused":
      return [
        {
          domain: "energy",
          category: "high_energy",
          source,
          valence: "positive",
        },
      ];
    default:
      return [];
  }
}

/** Record workspace, project, creation, energy, business, and action signals. */
export function recordIntelligenceSignal(
  input: Omit<IntelligenceSignal, "id" | "at" | "date">,
): IntelligenceSignal {
  const signal = appendIntelligenceSignal(input);
  applySignalIncrementally(signal);
  return signal;
}

export function recordWorkspaceSignal(
  workspaceId: string,
  category: string,
  opts?: { valence?: IntelligenceSignalValence; meta?: Record<string, string | number | boolean> },
): IntelligenceSignal {
  return recordIntelligenceSignal({
    domain: "workspace",
    category,
    source: `workspace:${workspaceId}`,
    valence: opts?.valence,
    meta: opts?.meta,
  });
}

export function recordCreationSignal(
  contentType: string,
  opts?: { valence?: IntelligenceSignalValence },
): IntelligenceSignal {
  return recordIntelligenceSignal({
    domain: "creation",
    category: "content_created",
    source: `create:${contentType}`,
    valence: opts?.valence ?? "positive",
    meta: { contentType },
  });
}

export function recordBusinessActivitySignal(
  category: string,
  source: string,
  opts?: { valence?: IntelligenceSignalValence },
): IntelligenceSignal {
  return recordIntelligenceSignal({
    domain: "business",
    category,
    source,
    valence: opts?.valence ?? "positive",
  });
}

export function recordEnergySignal(
  category: "high_energy" | "low_energy" | "morning_productive" | "afternoon_productive" | "evening_productive",
  source: string,
): IntelligenceSignal {
  return recordIntelligenceSignal({
    domain: "energy",
    category,
    source,
    valence: category === "low_energy" ? "negative" : "positive",
  });
}

export function recordTrustSignal(
  accepted: boolean,
  source: string,
): IntelligenceSignal {
  return recordIntelligenceSignal({
    domain: "action",
    category: accepted ? "suggestion_accepted" : "suggestion_ignored",
    source,
    valence: accepted ? "positive" : "neutral",
  });
}
