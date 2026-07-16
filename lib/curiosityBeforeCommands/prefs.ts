import {
  CURIOSITY_BEFORE_COMMANDS_CHANGE_EVENT,
  CURIOSITY_BEFORE_COMMANDS_PREFS_KEY,
  type CuriosityBeforeCommandsMode,
  type CuriosityBeforeCommandsPreference,
} from "./types";

export const DEFAULT_CURIOSITY_BEFORE_COMMANDS_PREFERENCE: CuriosityBeforeCommandsPreference =
  {
    mode: "situational",
    savedAt: new Date(0).toISOString(),
    version: 1,
  };

function isMode(value: unknown): value is CuriosityBeforeCommandsMode {
  return (
    value === "curiosity-usually" ||
    value === "mix" ||
    value === "direct" ||
    value === "situational" ||
    value === "unsure"
  );
}

function normalize(
  raw: Partial<CuriosityBeforeCommandsPreference> | null | undefined,
): CuriosityBeforeCommandsPreference {
  const base = { ...DEFAULT_CURIOSITY_BEFORE_COMMANDS_PREFERENCE };
  if (!raw || typeof raw !== "object") return base;
  return {
    mode: isMode(raw.mode) ? raw.mode : base.mode,
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

export function getCuriosityBeforeCommandsPreference(): CuriosityBeforeCommandsPreference {
  if (typeof window === "undefined") {
    return { ...DEFAULT_CURIOSITY_BEFORE_COMMANDS_PREFERENCE };
  }
  try {
    const raw = window.localStorage.getItem(
      CURIOSITY_BEFORE_COMMANDS_PREFS_KEY,
    );
    if (!raw) return { ...DEFAULT_CURIOSITY_BEFORE_COMMANDS_PREFERENCE };
    return normalize(
      JSON.parse(raw) as Partial<CuriosityBeforeCommandsPreference>,
    );
  } catch {
    return { ...DEFAULT_CURIOSITY_BEFORE_COMMANDS_PREFERENCE };
  }
}

export type SaveCuriosityResult =
  | { ok: true; preference: CuriosityBeforeCommandsPreference }
  | { ok: false; preference: CuriosityBeforeCommandsPreference; reason: "stale" | "storage" };

export function saveCuriosityBeforeCommandsPreference(
  patch: Partial<CuriosityBeforeCommandsPreference>,
): SaveCuriosityResult {
  const current = getCuriosityBeforeCommandsPreference();
  if (
    typeof patch.version === "number" &&
    patch.version > 0 &&
    patch.version < current.version
  ) {
    return { ok: false, preference: current, reason: "stale" };
  }
  const next = normalize({
    ...current,
    ...patch,
    version: current.version + 1,
    savedAt: new Date().toISOString(),
  });
  if (typeof window === "undefined") {
    return { ok: true, preference: next };
  }
  try {
    window.localStorage.setItem(
      CURIOSITY_BEFORE_COMMANDS_PREFS_KEY,
      JSON.stringify(next),
    );
    window.dispatchEvent(
      new CustomEvent(CURIOSITY_BEFORE_COMMANDS_CHANGE_EVENT, { detail: next }),
    );
    return { ok: true, preference: next };
  } catch {
    return { ok: false, preference: current, reason: "storage" };
  }
}

export function subscribeCuriosityBeforeCommands(
  listener: () => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;
  const onStorage = (event: StorageEvent) => {
    if (event.key === CURIOSITY_BEFORE_COMMANDS_PREFS_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CURIOSITY_BEFORE_COMMANDS_CHANGE_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CURIOSITY_BEFORE_COMMANDS_CHANGE_EVENT, listener);
  };
}
