import {
  ADAPTIVE_COMPANION_CHANGE_EVENT,
  ADAPTIVE_COMPANION_PREFS_KEY,
  type AdaptiveChoiceLoad,
  type AdaptiveCompanionExplicitPrefs,
  type AdaptiveComparisonStyle,
  type AdaptiveExamplePreference,
  type AdaptiveInstructionPacing,
  type AdaptiveParagraphLength,
  type AdaptiveResumeDepth,
  type AdaptiveStructureLevel,
} from "./types";

export const DEFAULT_ADAPTIVE_EXPLICIT_PREFS: AdaptiveCompanionExplicitPrefs = {
  summaryFirst: true,
  paragraphLength: "short",
  instructionPacing: "one_at_a_time",
  choiceLoad: null,
  examplePreference: "neutral",
  resumeSummaryPreference: "standard",
  comparisonStyle: "plain_tradeoffs",
  structureLevel: "balanced",
  showProgressPreference: true,
  plainLanguagePreference: true,
  version: 1,
  updatedAt: new Date(0).toISOString(),
};

const memory: { prefs: AdaptiveCompanionExplicitPrefs | null } = { prefs: null };

function isChoiceLoad(v: unknown): v is AdaptiveChoiceLoad {
  return v === "one" || v === "two" || v === "three" || v === "ask";
}

function normalize(
  raw: Partial<AdaptiveCompanionExplicitPrefs> | null | undefined,
): AdaptiveCompanionExplicitPrefs {
  const base = { ...DEFAULT_ADAPTIVE_EXPLICIT_PREFS };
  if (!raw || typeof raw !== "object") return base;
  return {
    summaryFirst: Boolean(raw.summaryFirst ?? base.summaryFirst),
    paragraphLength:
      raw.paragraphLength === "standard" || raw.paragraphLength === "short"
        ? (raw.paragraphLength as AdaptiveParagraphLength)
        : base.paragraphLength,
    instructionPacing:
      raw.instructionPacing === "overview_ok" ||
      raw.instructionPacing === "one_at_a_time"
        ? (raw.instructionPacing as AdaptiveInstructionPacing)
        : base.instructionPacing,
    choiceLoad: isChoiceLoad(raw.choiceLoad) ? raw.choiceLoad : null,
    examplePreference:
      raw.examplePreference === "prefer" ||
      raw.examplePreference === "minimize" ||
      raw.examplePreference === "neutral"
        ? (raw.examplePreference as AdaptiveExamplePreference)
        : base.examplePreference,
    resumeSummaryPreference:
      raw.resumeSummaryPreference === "brief" ||
      raw.resumeSummaryPreference === "detailed" ||
      raw.resumeSummaryPreference === "standard"
        ? (raw.resumeSummaryPreference as AdaptiveResumeDepth)
        : base.resumeSummaryPreference,
    comparisonStyle:
      raw.comparisonStyle === "side_by_side" ||
      raw.comparisonStyle === "one_criterion" ||
      raw.comparisonStyle === "plain_tradeoffs"
        ? (raw.comparisonStyle as AdaptiveComparisonStyle)
        : base.comparisonStyle,
    structureLevel:
      raw.structureLevel === "minimal" ||
      raw.structureLevel === "visible" ||
      raw.structureLevel === "balanced"
        ? (raw.structureLevel as AdaptiveStructureLevel)
        : base.structureLevel,
    showProgressPreference: Boolean(
      raw.showProgressPreference ?? base.showProgressPreference,
    ),
    plainLanguagePreference: Boolean(
      raw.plainLanguagePreference ?? base.plainLanguagePreference,
    ),
    version: typeof raw.version === "number" ? raw.version : base.version,
    updatedAt:
      typeof raw.updatedAt === "string" ? raw.updatedAt : base.updatedAt,
  };
}

export function getAdaptiveCompanionExplicitPrefs(): AdaptiveCompanionExplicitPrefs {
  if (typeof window === "undefined") {
    return memory.prefs ? normalize(memory.prefs) : { ...DEFAULT_ADAPTIVE_EXPLICIT_PREFS };
  }
  try {
    const raw = window.localStorage.getItem(ADAPTIVE_COMPANION_PREFS_KEY);
    if (!raw) return { ...DEFAULT_ADAPTIVE_EXPLICIT_PREFS };
    return normalize(JSON.parse(raw) as Partial<AdaptiveCompanionExplicitPrefs>);
  } catch {
    return { ...DEFAULT_ADAPTIVE_EXPLICIT_PREFS };
  }
}

export function patchAdaptiveCompanionExplicitPrefs(
  patch: Partial<AdaptiveCompanionExplicitPrefs>,
): AdaptiveCompanionExplicitPrefs {
  const next = normalize({
    ...getAdaptiveCompanionExplicitPrefs(),
    ...patch,
    updatedAt: new Date().toISOString(),
    version: 1,
  });
  if (typeof window === "undefined") {
    memory.prefs = next;
    return next;
  }
  try {
    window.localStorage.setItem(ADAPTIVE_COMPANION_PREFS_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(ADAPTIVE_COMPANION_CHANGE_EVENT));
  } catch {
    /* ignore */
  }
  return next;
}

export function resetAdaptiveCompanionExplicitPrefs(): AdaptiveCompanionExplicitPrefs {
  const next = {
    ...DEFAULT_ADAPTIVE_EXPLICIT_PREFS,
    updatedAt: new Date().toISOString(),
  };
  if (typeof window === "undefined") {
    memory.prefs = next;
    return next;
  }
  try {
    window.localStorage.setItem(ADAPTIVE_COMPANION_PREFS_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(ADAPTIVE_COMPANION_CHANGE_EVENT));
  } catch {
    /* ignore */
  }
  return next;
}

/** Test helper */
export function __resetAdaptiveCompanionExplicitPrefsForTests(): void {
  memory.prefs = null;
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ADAPTIVE_COMPANION_PREFS_KEY);
}
