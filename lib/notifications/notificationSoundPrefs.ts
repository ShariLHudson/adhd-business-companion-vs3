import {
  NOTIFICATION_SOUND_PREFS_CHANGE_EVENT,
  NOTIFICATION_SOUND_PREFS_KEY,
  type NotificationSoundOptionId,
  type NotificationSoundPreferences,
} from "./notificationSoundTypes";

export const DEFAULT_NOTIFICATION_SOUND_PREFS: NotificationSoundPreferences = {
  reminderSoundId: "soft-bell",
  rhythmSoundId: "wind-chime",
  priorityAlertSoundId: "priority-soft",
  shariCheckInSoundId: null,
  attentionNeededSoundId: "soft-alert",
  masterNotificationVolume: 0.7,
  attentionNeededEnabled: true,
  updatedAt: new Date(0).toISOString(),
  version: 1,
};

function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_NOTIFICATION_SOUND_PREFS.masterNotificationVolume;
  return Math.min(1, Math.max(0, value));
}

function isOptionId(value: unknown): value is NotificationSoundOptionId {
  return typeof value === "string" && value.length > 0;
}

function normalize(
  raw: Partial<NotificationSoundPreferences> | null | undefined,
): NotificationSoundPreferences {
  const base = { ...DEFAULT_NOTIFICATION_SOUND_PREFS };
  if (!raw || typeof raw !== "object") return base;

  const pick = (
    key: keyof Pick<
      NotificationSoundPreferences,
      | "reminderSoundId"
      | "rhythmSoundId"
      | "priorityAlertSoundId"
      | "shariCheckInSoundId"
      | "attentionNeededSoundId"
    >,
  ): NotificationSoundOptionId | null => {
    if (raw[key] === null) return null;
    if (isOptionId(raw[key])) return raw[key] as NotificationSoundOptionId;
    return base[key];
  };

  return {
    reminderSoundId: pick("reminderSoundId"),
    rhythmSoundId: pick("rhythmSoundId"),
    priorityAlertSoundId: pick("priorityAlertSoundId"),
    shariCheckInSoundId: pick("shariCheckInSoundId"),
    attentionNeededSoundId: pick("attentionNeededSoundId"),
    masterNotificationVolume: clampVolume(
      typeof raw.masterNotificationVolume === "number"
        ? raw.masterNotificationVolume
        : base.masterNotificationVolume,
    ),
    attentionNeededEnabled:
      typeof raw.attentionNeededEnabled === "boolean"
        ? raw.attentionNeededEnabled
        : base.attentionNeededEnabled,
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

export function getNotificationSoundPrefs(): NotificationSoundPreferences {
  if (typeof window === "undefined") {
    return { ...DEFAULT_NOTIFICATION_SOUND_PREFS };
  }
  try {
    const raw = window.localStorage.getItem(NOTIFICATION_SOUND_PREFS_KEY);
    if (!raw) return { ...DEFAULT_NOTIFICATION_SOUND_PREFS };
    return normalize(JSON.parse(raw) as Partial<NotificationSoundPreferences>);
  } catch {
    return { ...DEFAULT_NOTIFICATION_SOUND_PREFS };
  }
}

/**
 * Immediate save. Rejects stale writes when incoming version is older than stored.
 */
export function saveNotificationSoundPrefs(
  patch: Partial<NotificationSoundPreferences>,
): NotificationSoundPreferences {
  const current = getNotificationSoundPrefs();
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
        NOTIFICATION_SOUND_PREFS_KEY,
        JSON.stringify(next),
      );
      window.dispatchEvent(
        new CustomEvent(NOTIFICATION_SOUND_PREFS_CHANGE_EVENT, {
          detail: next,
        }),
      );
    } catch {
      /* storage unavailable — return intended next for UI optimism */
    }
  }
  return next;
}

export function subscribeNotificationSoundPrefs(
  listener: (prefs: NotificationSoundPreferences) => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;
  const onStorage = (event: StorageEvent) => {
    if (event.key !== NOTIFICATION_SOUND_PREFS_KEY) return;
    listener(getNotificationSoundPrefs());
  };
  const onCustom = () => listener(getNotificationSoundPrefs());
  window.addEventListener("storage", onStorage);
  window.addEventListener(NOTIFICATION_SOUND_PREFS_CHANGE_EVENT, onCustom);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(NOTIFICATION_SOUND_PREFS_CHANGE_EVENT, onCustom);
  };
}
