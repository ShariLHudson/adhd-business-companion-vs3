import { getPrefs, savePrefs } from "@/lib/companionStore";
import { legacySupportStyleFromId, supportStyleIdFromLegacy } from "./legacyBridge";
import {
  SUPPORT_STYLE_CHANGE_EVENT,
  SUPPORT_STYLE_PREFS_KEY,
  type SupportStyleCustomSettings,
  type SupportStyleId,
  type SupportStylePreference,
} from "./types";

export const DEFAULT_SUPPORT_STYLE_PREFERENCE: SupportStylePreference = {
  styleId: "adaptive",
  useMostOfTheTime: true,
  savedAt: new Date(0).toISOString(),
  version: 1,
};

const STYLE_IDS: SupportStyleId[] = [
  "gentle-first",
  "practical-first",
  "talk-it-through",
  "step-by-step",
  "give-me-choices",
  "adaptive",
  "custom",
];

function isStyleId(value: unknown): value is SupportStyleId {
  return typeof value === "string" && STYLE_IDS.includes(value as SupportStyleId);
}

function normalizeCustom(
  raw: SupportStyleCustomSettings | null | undefined,
): SupportStyleCustomSettings | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const next: SupportStyleCustomSettings = {};
  if (typeof raw.overwhelmedStart === "string") {
    next.overwhelmedStart = raw.overwhelmedStart;
  }
  if (Array.isArray(raw.stuckHelp)) {
    next.stuckHelp = raw.stuckHelp.filter(Boolean) as SupportStyleCustomSettings["stuckHelp"];
  }
  if (Array.isArray(raw.discouragedHelp)) {
    next.discouragedHelp = raw.discouragedHelp.filter(
      Boolean,
    ) as SupportStyleCustomSettings["discouragedHelp"];
  }
  if (typeof raw.choiceCount === "string") {
    next.choiceCount = raw.choiceCount as SupportStyleCustomSettings["choiceCount"];
  }
  if (typeof raw.encouragementLevel === "string") {
    next.encouragementLevel =
      raw.encouragementLevel as SupportStyleCustomSettings["encouragementLevel"];
  }
  return Object.keys(next).length > 0 ? next : undefined;
}

export function normalizeSupportStylePreference(
  raw: Partial<SupportStylePreference> | null | undefined,
): SupportStylePreference {
  const base = { ...DEFAULT_SUPPORT_STYLE_PREFERENCE };
  if (!raw || typeof raw !== "object") return base;
  return {
    styleId: isStyleId(raw.styleId) ? raw.styleId : base.styleId,
    customSettings: normalizeCustom(raw.customSettings),
    useMostOfTheTime:
      typeof raw.useMostOfTheTime === "boolean"
        ? raw.useMostOfTheTime
        : base.useMostOfTheTime,
    savedAt:
      typeof raw.savedAt === "string" && raw.savedAt
        ? raw.savedAt
        : base.savedAt,
    version:
      typeof raw.version === "number" && raw.version >= 1
        ? Math.floor(raw.version)
        : base.version,
  };
}

export function getSupportStylePreference(): SupportStylePreference {
  if (typeof window === "undefined") {
    return { ...DEFAULT_SUPPORT_STYLE_PREFERENCE };
  }
  try {
    const raw = window.localStorage.getItem(SUPPORT_STYLE_PREFS_KEY);
    if (raw) {
      return normalizeSupportStylePreference(
        JSON.parse(raw) as Partial<SupportStylePreference>,
      );
    }
  } catch {
    /* fall through */
  }
  try {
    const migrated = normalizeSupportStylePreference({
      styleId: supportStyleIdFromLegacy(getPrefs().supportStyle),
      useMostOfTheTime: true,
      savedAt: new Date().toISOString(),
      version: 1,
    });
    window.localStorage.setItem(
      SUPPORT_STYLE_PREFS_KEY,
      JSON.stringify(migrated),
    );
    return migrated;
  } catch {
    return { ...DEFAULT_SUPPORT_STYLE_PREFERENCE };
  }
}

export type SaveSupportStyleResult =
  | { ok: true; preference: SupportStylePreference }
  | { ok: false; preference: SupportStylePreference; reason: "storage" | "stale" };

export function saveSupportStylePreference(
  patch: Partial<SupportStylePreference>,
): SaveSupportStyleResult {
  const current = getSupportStylePreference();
  if (
    typeof patch.version === "number" &&
    patch.version > 0 &&
    patch.version < current.version
  ) {
    return { ok: false, preference: current, reason: "stale" };
  }

  const next = normalizeSupportStylePreference({
    ...current,
    ...patch,
    customSettings:
      patch.customSettings !== undefined
        ? patch.customSettings
        : current.customSettings,
    version: current.version + 1,
    savedAt: new Date().toISOString(),
  });

  if (typeof window === "undefined") {
    return { ok: false, preference: current, reason: "storage" };
  }

  try {
    window.localStorage.setItem(SUPPORT_STYLE_PREFS_KEY, JSON.stringify(next));
    // Keep legacy companion-prefs field in sync for older readers.
    savePrefs({ supportStyle: legacySupportStyleFromId(next.styleId) });
    window.dispatchEvent(
      new CustomEvent(SUPPORT_STYLE_CHANGE_EVENT, { detail: next }),
    );
    return { ok: true, preference: next };
  } catch {
    return { ok: false, preference: current, reason: "storage" };
  }
}

export function subscribeSupportStyle(listener: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const onStorage = (event: StorageEvent) => {
    if (
      event.key === SUPPORT_STYLE_PREFS_KEY ||
      event.key === "companion-prefs-v1"
    ) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(SUPPORT_STYLE_CHANGE_EVENT, listener);
  window.addEventListener("companion-prefs-updated", listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SUPPORT_STYLE_CHANGE_EVENT, listener);
    window.removeEventListener("companion-prefs-updated", listener);
  };
}

export function getActiveSupportStyleId(): SupportStyleId {
  return getSupportStylePreference().styleId;
}
