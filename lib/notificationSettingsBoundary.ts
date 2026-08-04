/**
 * P0.33 — Reminder Creation vs Notification Settings Boundary™
 */

import { isReminderRequest } from "./reminderIntelligence";

/** Opens Settings → Notifications only for preference / permission changes. */
export function isNotificationSettingsRequest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isReminderRequest(t)) return false;

  return (
    /\bnotification settings\b/i.test(t) ||
    /\bnotification preferences\b/i.test(t) ||
    /\bchange reminder sound\b/i.test(t) ||
    /\b(?:enable|disable|turn (?:on|off))(?: desktop)? notifications?\b/i.test(t) ||
    /\bdisable alerts?\b/i.test(t) ||
    /\bnotification permissions?\b/i.test(t) ||
    /\b(?:where|how).{0,40}notification (?:settings|preferences)\b/i.test(t) ||
    /\bmanage (?:my )?notifications?\b/i.test(t)
  );
}

export function notificationSettingsBrief(): string {
  return "Notification preferences are in **Settings → Notifications** — desktop alerts, sounds, and permissions.";
}
