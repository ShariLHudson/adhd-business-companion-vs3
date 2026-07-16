"use client";

import { useEffect, useState } from "react";
import { NOTIFICATION_SOUND_FAMILIES } from "@/lib/notifications/notificationSoundCatalog";
import {
  getNotificationSoundPrefs,
  saveNotificationSoundPrefs,
  subscribeNotificationSoundPrefs,
} from "@/lib/notifications/notificationSoundPrefs";
import {
  playNotificationSoundOption,
  stopNotificationSoundPreview,
  unlockNotificationSounds,
} from "@/lib/notifications/playNotificationSound";
import type {
  NotificationSoundOptionId,
  NotificationSoundPreferences,
} from "@/lib/notifications/notificationSoundTypes";

type Props = {
  className?: string;
};

export function NotificationSoundPreferences({ className = "" }: Props) {
  const [prefs, setPrefs] = useState<NotificationSoundPreferences>(() =>
    getNotificationSoundPrefs(),
  );
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => subscribeNotificationSoundPrefs(setPrefs), []);

  function selectOption(
    prefKey: (typeof NOTIFICATION_SOUND_FAMILIES)[number]["prefKey"],
    optionId: NotificationSoundOptionId | null,
  ) {
    const next = saveNotificationSoundPrefs({ [prefKey]: optionId });
    setPrefs(next);
    setStatus("Saved. I'll use this for future notifications.");
    window.setTimeout(() => setStatus(null), 2400);
  }

  function preview(optionId: NotificationSoundOptionId) {
    unlockNotificationSounds();
    stopNotificationSoundPreview();
    playNotificationSoundOption(optionId, {
      preview: true,
      volumeOverride: prefs.masterNotificationVolume,
    });
  }

  return (
    <section
      className={`notification-sound-prefs ${className}`.trim()}
      data-testid="notification-sound-preferences"
      aria-label="Notification Sounds"
    >
      <header className="mb-3">
        <h3 className="text-base font-semibold text-[#2c2620]">
          Notification Sounds
        </h3>
        <p className="mt-1 text-sm text-[#6b635a]">
          Optional sound families help you recognize the kind of event — without
          dozens of tones. Every category supports None. Desktop notifications
          can stay on with sound off.
        </p>
      </header>

      <label className="mb-4 flex flex-col gap-1.5 rounded-xl border border-[#d4cdc3] bg-white/80 px-3.5 py-3">
        <span className="text-sm font-semibold text-[#2c2620]">
          Notification volume
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(prefs.masterNotificationVolume * 100)}
          aria-label="Notification volume"
          onChange={(event) => {
            const next = saveNotificationSoundPrefs({
              masterNotificationVolume: Number(event.target.value) / 100,
            });
            setPrefs(next);
          }}
          className="w-full accent-[#1e4f4f]"
        />
      </label>

      <label className="mb-4 flex items-start gap-2.5 rounded-xl border border-[#d4cdc3] bg-white/80 px-3.5 py-3">
        <input
          type="checkbox"
          className="mt-1 accent-[#1e4f4f]"
          checked={prefs.attentionNeededEnabled}
          onChange={(event) => {
            const next = saveNotificationSoundPrefs({
              attentionNeededEnabled: event.target.checked,
            });
            setPrefs(next);
            setStatus("Saved.");
            window.setTimeout(() => setStatus(null), 2000);
          }}
        />
        <span>
          <span className="block text-sm font-semibold text-[#2c2620]">
            Allow Attention Needed sounds
          </span>
          <span className="mt-0.5 block text-sm text-[#6b635a]">
            Only for overdue or conflicting items — never for routine reminders.
          </span>
        </span>
      </label>

      <p className="mb-3 rounded-xl border border-[#d4cdc3]/80 bg-[#f7f3ec] px-3.5 py-2.5 text-sm text-[#6b635a]">
        Celebration sounds follow your Celebrations preference (Quiet / Simple /
        Full) — not a separate intensity control here.
      </p>

      <div className="flex flex-col gap-4">
        {NOTIFICATION_SOUND_FAMILIES.map((family) => {
          const selected = prefs[family.prefKey];
          return (
            <fieldset
              key={family.id}
              className="rounded-xl border border-[#d4cdc3] bg-white/80 px-3.5 py-3"
              data-testid={`notification-sound-family-${family.id}`}
            >
              <legend className="px-1 text-sm font-semibold text-[#2c2620]">
                {family.label}
              </legend>
              <p className="mb-2.5 text-sm text-[#6b635a]">{family.description}</p>
              <ul className="flex flex-col gap-1.5">
                {family.options.map((option) => {
                  const isSelected = selected === option.id;
                  return (
                    <li
                      key={option.id}
                      className="flex items-center gap-2 rounded-lg px-1 py-1"
                    >
                      <button
                        type="button"
                        className={`min-h-11 flex-1 rounded-lg border px-3 py-2 text-left text-sm ${
                          isSelected
                            ? "border-[#1e4f4f] bg-[#1e4f4f]/[0.06] font-semibold text-[#1e4f4f]"
                            : "border-transparent text-[#2c2620] hover:bg-[#f5f1ea]"
                        }`}
                        aria-pressed={isSelected}
                        aria-label={`${option.label}${isSelected ? " selected" : ""}`}
                        onClick={() => selectOption(family.prefKey, option.id)}
                      >
                        {option.label}
                        {isSelected ? " ✓" : ""}
                        <span className="mt-0.5 block text-xs font-normal text-[#6b635a]">
                          {option.description}
                        </span>
                      </button>
                      <button
                        type="button"
                        className="min-h-11 min-w-11 rounded-lg border border-[#1e4f4f]/40 px-2 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
                        aria-label={`Play ${option.label} preview`}
                        onClick={() => preview(option.id)}
                      >
                        Play
                      </button>
                    </li>
                  );
                })}
                <li className="flex items-center gap-2 rounded-lg px-1 py-1">
                  <button
                    type="button"
                    className={`min-h-11 flex-1 rounded-lg border px-3 py-2 text-left text-sm ${
                      selected === null
                        ? "border-[#1e4f4f] bg-[#1e4f4f]/[0.06] font-semibold text-[#1e4f4f]"
                        : "border-transparent text-[#2c2620] hover:bg-[#f5f1ea]"
                    }`}
                    aria-pressed={selected === null}
                    aria-label={`Select no ${family.label.toLowerCase()}`}
                    onClick={() => selectOption(family.prefKey, null)}
                  >
                    None{selected === null ? " ✓" : ""}
                    <span className="mt-0.5 block text-xs font-normal text-[#6b635a]">
                      No sound for this category. Visual notices still appear.
                    </span>
                  </button>
                </li>
              </ul>
            </fieldset>
          );
        })}
      </div>

      {status ? (
        <p
          className="mt-3 text-sm text-[#1e4f4f]"
          role="status"
          data-testid="notification-sound-save-status"
        >
          {status}
        </p>
      ) : null}
    </section>
  );
}
