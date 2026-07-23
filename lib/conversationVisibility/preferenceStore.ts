import { getExperienceControlPrefs } from "@/lib/estate/experienceControlPrefs";
import { productDefaultVisibility } from "./destinationPolicy";
import {
  CONVERSATION_DISPLAY_CHANGE_EVENT,
  CONVERSATION_DISPLAY_PREFS_KEY,
  type CompanionVisibility,
  type ConversationDisplayPreference,
} from "./types";

const memory: { prefs: ConversationDisplayPreference | null } = { prefs: null };

function nowIso(): string {
  return new Date().toISOString();
}

function defaultPrefs(): ConversationDisplayPreference {
  // Migrate legacy Experience Controls conversationVisibility once.
  let globalDefault: CompanionVisibility = "on";
  try {
    const legacy = getExperienceControlPrefs().conversationVisibility;
    if (legacy === "hidden") globalDefault = "off";
  } catch {
    /* ignore */
  }
  return {
    globalDefault,
    destinationOverrides: {},
    updatedAt: nowIso(),
    version: 1,
  };
}

function normalize(
  raw: Partial<ConversationDisplayPreference> | null | undefined,
): ConversationDisplayPreference {
  const base = defaultPrefs();
  if (!raw || typeof raw !== "object") return base;
  const overrides: Record<string, CompanionVisibility> = {};
  if (raw.destinationOverrides && typeof raw.destinationOverrides === "object") {
    for (const [key, value] of Object.entries(raw.destinationOverrides)) {
      if (value === "on" || value === "off") overrides[key] = value;
    }
  }
  return {
    globalDefault: raw.globalDefault === "off" ? "off" : "on",
    destinationOverrides: overrides,
    updatedAt:
      typeof raw.updatedAt === "string" ? raw.updatedAt : base.updatedAt,
    version: 1,
  };
}

function read(): ConversationDisplayPreference {
  if (typeof window === "undefined") {
    return memory.prefs ? normalize(memory.prefs) : defaultPrefs();
  }
  try {
    const raw = window.localStorage.getItem(CONVERSATION_DISPLAY_PREFS_KEY);
    if (!raw) {
      const migrated = defaultPrefs();
      write(migrated);
      return migrated;
    }
    return normalize(JSON.parse(raw) as Partial<ConversationDisplayPreference>);
  } catch {
    return defaultPrefs();
  }
}

function write(prefs: ConversationDisplayPreference): void {
  if (typeof window === "undefined") {
    memory.prefs = prefs;
    return;
  }
  try {
    window.localStorage.setItem(
      CONVERSATION_DISPLAY_PREFS_KEY,
      JSON.stringify(prefs),
    );
    window.dispatchEvent(new CustomEvent(CONVERSATION_DISPLAY_CHANGE_EVENT));
  } catch {
    /* ignore */
  }
}

export function getConversationDisplayPreference(): ConversationDisplayPreference {
  return read();
}

export function patchConversationDisplayPreference(
  patch: Partial<
    Pick<ConversationDisplayPreference, "globalDefault" | "destinationOverrides">
  >,
): ConversationDisplayPreference {
  const prev = read();
  const next: ConversationDisplayPreference = {
    ...prev,
    globalDefault: patch.globalDefault ?? prev.globalDefault,
    destinationOverrides:
      patch.destinationOverrides !== undefined
        ? { ...patch.destinationOverrides }
        : prev.destinationOverrides,
    updatedAt: nowIso(),
    version: 1,
  };
  write(next);
  return next;
}

export function setDestinationCompanionVisibility(
  destinationId: string,
  visibility: CompanionVisibility,
): ConversationDisplayPreference {
  const prev = read();
  return patchConversationDisplayPreference({
    destinationOverrides: {
      ...prev.destinationOverrides,
      [destinationId]: visibility,
    },
  });
}

export function setGlobalCompanionDefault(
  visibility: CompanionVisibility,
): ConversationDisplayPreference {
  return patchConversationDisplayPreference({ globalDefault: visibility });
}

export function resetDestinationCompanionPreferences(): ConversationDisplayPreference {
  return patchConversationDisplayPreference({ destinationOverrides: {} });
}

/**
 * Resolve effective visibility for a destination.
 * Member destination override → product quiet default → global default.
 */
export function resolveCompanionVisibility(
  destinationId: string | null | undefined,
): CompanionVisibility {
  const prefs = read();
  if (destinationId && prefs.destinationOverrides[destinationId]) {
    return prefs.destinationOverrides[destinationId]!;
  }
  const product = productDefaultVisibility(destinationId);
  if (product === "off") return "off";
  return prefs.globalDefault;
}

export function isCompanionVisible(
  destinationId: string | null | undefined,
): boolean {
  return resolveCompanionVisibility(destinationId) === "on";
}

export function subscribeConversationDisplayPreference(
  listener: () => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CONVERSATION_DISPLAY_CHANGE_EVENT, listener);
  return () =>
    window.removeEventListener(CONVERSATION_DISPLAY_CHANGE_EVENT, listener);
}

/** Test helper */
export function __resetConversationDisplayPrefsForTests(): void {
  memory.prefs = null;
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CONVERSATION_DISPLAY_PREFS_KEY);
}
