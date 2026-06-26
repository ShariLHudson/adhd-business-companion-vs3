import type {
  CompanionRelationshipLearningState,
  CompanionRelationshipPreference,
  CompanionRelationshipStyle,
} from "./types";
import { DEFAULT_COMPANION_RELATIONSHIP_STYLE } from "./types";

const PREFERENCE_KEY = "companion-relationship-preference-v1";
const LEARNING_KEY = "companion-relationship-learning-v1";

let memoryPreference: CompanionRelationshipPreference | null = null;
let memoryLearning: CompanionRelationshipLearningState | null = null;

const DEFAULT_LEARNING: CompanionRelationshipLearningState = {
  quickWorkVisitCount: 0,
  lingerVisitCount: 0,
  offerShownFor: null,
  totalVisitsObserved: 0,
};

function readPreference(): CompanionRelationshipPreference {
  if (memoryPreference) return memoryPreference;
  if (typeof window === "undefined") {
    return {
      style: DEFAULT_COMPANION_RELATIONSHIP_STYLE,
      updatedAt: new Date(0).toISOString(),
    };
  }
  try {
    const raw = localStorage.getItem(PREFERENCE_KEY);
    if (!raw) {
      return {
        style: DEFAULT_COMPANION_RELATIONSHIP_STYLE,
        updatedAt: new Date(0).toISOString(),
      };
    }
    const parsed = JSON.parse(raw) as CompanionRelationshipPreference;
    if (
      parsed.style === "quiet-companion" ||
      parsed.style === "balanced-companion" ||
      parsed.style === "front-porch-companion"
    ) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return {
    style: DEFAULT_COMPANION_RELATIONSHIP_STYLE,
    updatedAt: new Date(0).toISOString(),
  };
}

function writePreference(pref: CompanionRelationshipPreference) {
  memoryPreference = pref;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFERENCE_KEY, JSON.stringify(pref));
  } catch {
    /* quota */
  }
}

function readLearning(): CompanionRelationshipLearningState {
  if (memoryLearning) return memoryLearning;
  if (typeof window === "undefined") return { ...DEFAULT_LEARNING };
  try {
    const raw = localStorage.getItem(LEARNING_KEY);
    if (!raw) return { ...DEFAULT_LEARNING };
    const parsed = JSON.parse(raw) as CompanionRelationshipLearningState;
    return {
      quickWorkVisitCount: parsed.quickWorkVisitCount ?? 0,
      lingerVisitCount: parsed.lingerVisitCount ?? 0,
      offerShownFor: parsed.offerShownFor ?? null,
      totalVisitsObserved: parsed.totalVisitsObserved ?? 0,
    };
  } catch {
    return { ...DEFAULT_LEARNING };
  }
}

function writeLearning(state: CompanionRelationshipLearningState) {
  memoryLearning = state;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LEARNING_KEY, JSON.stringify(state));
  } catch {
    /* quota */
  }
}

export function getCompanionRelationshipStyle(): CompanionRelationshipStyle {
  return readPreference().style;
}

export function setCompanionRelationshipStyle(style: CompanionRelationshipStyle): void {
  writePreference({ style, updatedAt: new Date().toISOString() });
}

export function getCompanionRelationshipLearning(): CompanionRelationshipLearningState {
  return readLearning();
}

export function recordCompanionRelationshipVisitPattern(
  pattern: "quick_work" | "linger",
): void {
  const state = readLearning();
  state.totalVisitsObserved += 1;
  if (pattern === "quick_work") {
    state.quickWorkVisitCount += 1;
    state.lingerVisitCount = 0;
  } else {
    state.lingerVisitCount += 1;
    state.quickWorkVisitCount = 0;
  }
  writeLearning(state);
}

export function markCompanionRelationshipOfferShown(
  offer: NonNullable<CompanionRelationshipLearningState["offerShownFor"]>,
): void {
  const state = readLearning();
  state.offerShownFor = offer;
  writeLearning(state);
}

/** Test helper */
export function clearCompanionRelationshipStoreForTests(): void {
  memoryPreference = null;
  memoryLearning = null;
  if (typeof window === "undefined") return;
  localStorage.removeItem(PREFERENCE_KEY);
  localStorage.removeItem(LEARNING_KEY);
}
