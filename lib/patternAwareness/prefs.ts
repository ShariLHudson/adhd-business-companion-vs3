import { getPrefs, savePrefs, type PatternAwareness } from "@/lib/companionStore";
import {
  PATTERN_AWARENESS_CHANGE_EVENT,
  PATTERN_AWARENESS_PREFS_KEY,
  type PatternAwarenessControlPrefs,
} from "./types";

export const DEFAULT_PATTERN_AWARENESS_CONTROL_PREFS: PatternAwarenessControlPrefs =
  {
    noticeNewPatterns: true,
    useSavedPatterns: true,
    updatedAt: new Date(0).toISOString(),
    version: 1,
  };

function normalize(
  raw: Partial<PatternAwarenessControlPrefs> | null | undefined,
): PatternAwarenessControlPrefs {
  const base = { ...DEFAULT_PATTERN_AWARENESS_CONTROL_PREFS };
  if (!raw || typeof raw !== "object") return base;
  return {
    noticeNewPatterns:
      typeof raw.noticeNewPatterns === "boolean"
        ? raw.noticeNewPatterns
        : base.noticeNewPatterns,
    useSavedPatterns:
      typeof raw.useSavedPatterns === "boolean"
        ? raw.useSavedPatterns
        : base.useSavedPatterns,
    updatedAt:
      typeof raw.updatedAt === "string" && raw.updatedAt
        ? raw.updatedAt
        : base.updatedAt,
    version:
      typeof raw.version === "number" && raw.version >= 1
        ? Math.floor(raw.version)
        : base.version,
  };
}

/** Map legacy intensity enum → control prefs when dedicated prefs missing. */
export function controlPrefsFromLegacyPatternAwareness(
  value: PatternAwareness,
): Pick<
  PatternAwarenessControlPrefs,
  "noticeNewPatterns" | "useSavedPatterns"
> {
  if (value === "off") {
    return { noticeNewPatterns: false, useSavedPatterns: false };
  }
  return { noticeNewPatterns: true, useSavedPatterns: true };
}

export function legacyPatternAwarenessFromControls(
  prefs: PatternAwarenessControlPrefs,
): PatternAwareness {
  if (!prefs.noticeNewPatterns && !prefs.useSavedPatterns) return "off";
  if (prefs.noticeNewPatterns && prefs.useSavedPatterns) return "light";
  if (prefs.useSavedPatterns) return "guided";
  return "active";
}

export function getPatternAwarenessControlPrefs(): PatternAwarenessControlPrefs {
  if (typeof window === "undefined") {
    return { ...DEFAULT_PATTERN_AWARENESS_CONTROL_PREFS };
  }
  try {
    const raw = window.localStorage.getItem(PATTERN_AWARENESS_PREFS_KEY);
    if (raw) {
      return normalize(
        JSON.parse(raw) as Partial<PatternAwarenessControlPrefs>,
      );
    }
  } catch {
    /* fall through */
  }
  // Migrate once from companion-prefs patternAwareness
  try {
    const legacy = getPrefs().patternAwareness;
    const migrated = normalize({
      ...DEFAULT_PATTERN_AWARENESS_CONTROL_PREFS,
      ...controlPrefsFromLegacyPatternAwareness(legacy),
      updatedAt: new Date().toISOString(),
      version: 1,
    });
    window.localStorage.setItem(
      PATTERN_AWARENESS_PREFS_KEY,
      JSON.stringify(migrated),
    );
    return migrated;
  } catch {
    return { ...DEFAULT_PATTERN_AWARENESS_CONTROL_PREFS };
  }
}

export function savePatternAwarenessControlPrefs(
  patch: Partial<PatternAwarenessControlPrefs>,
): PatternAwarenessControlPrefs {
  const current = getPatternAwarenessControlPrefs();
  if (
    typeof patch.version === "number" &&
    patch.version > 0 &&
    patch.version < current.version
  ) {
    return current;
  }
  const next = normalize({
    ...current,
    ...patch,
    version: current.version + 1,
    updatedAt: new Date().toISOString(),
  });
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(
        PATTERN_AWARENESS_PREFS_KEY,
        JSON.stringify(next),
      );
      // Keep legacy enum in sync for older readers
      savePrefs({
        patternAwareness: legacyPatternAwarenessFromControls(next),
      });
      window.dispatchEvent(
        new CustomEvent(PATTERN_AWARENESS_CHANGE_EVENT, { detail: next }),
      );
    } catch {
      /* storage unavailable */
    }
  }
  return next;
}

export function subscribePatternAwareness(
  listener: () => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;
  const onStorage = (event: StorageEvent) => {
    if (
      event.key === PATTERN_AWARENESS_PREFS_KEY ||
      event.key === "companion-prefs-v1"
    ) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(PATTERN_AWARENESS_CHANGE_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(PATTERN_AWARENESS_CHANGE_EVENT, listener);
  };
}

export function canNoticeNewPatterns(): boolean {
  return getPatternAwarenessControlPrefs().noticeNewPatterns;
}

export function canUseSavedPatterns(): boolean {
  return getPatternAwarenessControlPrefs().useSavedPatterns;
}
