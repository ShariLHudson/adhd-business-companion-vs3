"use client";

import { useEffect, useState } from "react";
import {
  SettingsDropdown,
  SettingsHelpAccordion,
  SettingsSaveStatus,
  SettingsSection,
  SettingsSlider,
  SETTINGS_SAVED_MESSAGE,
  SETTINGS_TEXT,
} from "@/components/companion/settings";
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
  /** Entrance sounds view — one shared Learn more instead of per-family accordions. */
  compactAbout?: boolean;
};

const NONE_VALUE = "__none__";

export function NotificationSoundPreferences({
  className = "",
  compactAbout = false,
}: Props) {
  const [prefs, setPrefs] = useState<NotificationSoundPreferences>(() =>
    getNotificationSoundPrefs(),
  );
  const [savedVisible, setSavedVisible] = useState(false);

  useEffect(() => subscribeNotificationSoundPrefs(setPrefs), []);

  function flashSaved() {
    setSavedVisible(true);
    window.setTimeout(() => setSavedVisible(false), 2400);
  }

  function selectOption(
    prefKey: (typeof NOTIFICATION_SOUND_FAMILIES)[number]["prefKey"],
    rawValue: string,
  ) {
    const optionId =
      rawValue === NONE_VALUE
        ? null
        : (rawValue as NotificationSoundOptionId);
    const next = saveNotificationSoundPrefs({ [prefKey]: optionId });
    setPrefs(next);
    flashSaved();
  }

  function previewSelected(optionId: NotificationSoundOptionId | null) {
    if (!optionId) return;
    unlockNotificationSounds();
    stopNotificationSoundPreview();
    playNotificationSoundOption(optionId, {
      preview: true,
      volumeOverride: prefs.masterNotificationVolume,
    });
  }

  // Reminder, Rhythm, and Priority Alert are routed to real events (time
  // blocks, chat reminders/rhythms, critical-priority reminders). Shari
  // Check-In and Attention Needed describe features that do not exist yet
  // anywhere in the app (no proactive check-in trigger, no overdue/conflict
  // detection) — showing their dropdowns would promise a sound that can
  // never play, so they stay hidden until a real trigger exists.
  const visibleFamilies = NOTIFICATION_SOUND_FAMILIES.filter(
    (family) =>
      family.id === "reminder" ||
      family.id === "rhythm" ||
      family.id === "priority-alert",
  );

  return (
    <section
      className={`notification-sound-prefs ${className}`.trim()}
      data-testid="notification-sound-preferences"
      aria-label="Notification Sounds"
    >
      <SettingsSection
        title="Notification Sounds"
        explanation="Optional sound families help you recognize the kind of event — without dozens of tones. Every category supports None."
        testId="notification-sounds-section"
      >
        <div className="flex flex-col gap-5">
          <SettingsSlider
            id="notification-volume"
            label="Notification volume"
            value={Math.round(prefs.masterNotificationVolume * 100)}
            min={0}
            max={100}
            valueLabel={`${Math.round(prefs.masterNotificationVolume * 100)}%`}
            onChange={(value) => {
              const next = saveNotificationSoundPrefs({
                masterNotificationVolume: value / 100,
              });
              setPrefs(next);
            }}
            testId="notification-volume-slider"
          />

          <p className={`text-sm leading-relaxed ${SETTINGS_TEXT.helper}`}>
            Celebration sounds follow your Celebrations preference (Quiet /
            Simple / Full) — not a separate control here.
          </p>

          {visibleFamilies.map((family) => {
            const selected = prefs[family.prefKey];
            const dropdownValue = selected ?? NONE_VALUE;
            const options = [
              {
                value: NONE_VALUE,
                label: "None",
                description:
                  "No sound for this category. Visual notices still appear.",
              },
              ...family.options.map((option) => ({
                value: option.id,
                label: option.label,
                description: option.description,
              })),
            ];

            return (
              <div
                key={family.id}
                data-testid={`notification-sound-family-${family.id}`}
                className="border-t border-[#e5dfd6] pt-4 first:border-t-0 first:pt-0"
              >
                <SettingsDropdown
                  id={`sound-family-${family.id}`}
                  label={family.label}
                  value={dropdownValue}
                  options={options}
                  onChange={(value) => selectOption(family.prefKey, value)}
                  testId={`notification-sound-dropdown-${family.id}`}
                />
                {!compactAbout ? (
                  <SettingsHelpAccordion
                    title="Learn more"
                    testId={`notification-sound-help-${family.id}`}
                  >
                    {family.description}
                  </SettingsHelpAccordion>
                ) : null}
                <button
                  type="button"
                  className="mt-3 min-h-11 rounded-lg border border-[#1e4f4f]/40 px-3 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f] disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`Test ${family.label}`}
                  disabled={selected === null}
                  data-testid={`notification-sound-test-${family.id}`}
                  onClick={() => previewSelected(selected)}
                >
                  Test sound
                </button>
              </div>
            );
          })}

          {compactAbout ? (
            <SettingsHelpAccordion
              title="About notification sounds"
              testId="notification-sound-help-compact"
            >
              <ul className="list-disc space-y-2 pl-5">
                {visibleFamilies.map((family) => (
                  <li key={family.id}>
                    <span className="font-semibold text-[#1f1c19]">
                      {family.label}:
                    </span>{" "}
                    {family.description}
                  </li>
                ))}
              </ul>
            </SettingsHelpAccordion>
          ) : null}
        </div>
      </SettingsSection>

      <SettingsSaveStatus
        visible={savedVisible}
        message={SETTINGS_SAVED_MESSAGE}
        testId="notification-sound-save-status"
      />
    </section>
  );
}
