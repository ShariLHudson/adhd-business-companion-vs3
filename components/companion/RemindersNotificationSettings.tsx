"use client";

import { useEffect, useState } from "react";
import {
  getPrefs,
  savePrefs,
} from "@/lib/companionStore";
import { playChime, unlockChime } from "@/lib/chime";

type NotifPerm = NotificationPermission | "unsupported";

function readPerm(): NotifPerm {
  if (typeof Notification === "undefined") return "unsupported";
  return Notification.permission;
}

const CARD =
  "rounded-2xl border px-4 py-3 text-left transition-colors hover:border-[#1e4f4f]/40";

/**
 * Secondary notification toggles — reused on Reminders room (bottom) and Settings.
 */
export function RemindersNotificationSettings() {
  const [alerts, setAlerts] = useState(true);
  const [desktop, setDesktop] = useState(false);
  const [perm, setPerm] = useState<NotifPerm>("default");

  useEffect(() => {
    const p = getPrefs();
    setAlerts(p.timeBlockAlerts);
    setDesktop(Boolean(p.desktopNotifications));
    setPerm(readPerm());
  }, []);

  function chooseDesktop(wantOn: boolean) {
    if (wantOn && perm === "default" && typeof Notification !== "undefined") {
      void Notification.requestPermission().then((result) => {
        setPerm(result);
        const on = result === "granted";
        setDesktop(on);
        savePrefs({ desktopNotifications: on });
      });
      return;
    }
    setDesktop(wantOn);
    savePrefs({ desktopNotifications: wantOn });
  }

  const desktopOn = desktop && perm === "granted";

  return (
    <div
      className="mt-2 flex flex-col gap-2.5"
      data-testid="reminders-notification-settings"
    >
      <h2 className="text-lg font-semibold text-[#1f1c19]">
        Notification Settings
      </h2>
      <p className="text-sm text-[#6b635a]">
        Optional alerts — these do not create reminders.
      </p>

      <button
        type="button"
        onClick={() => {
          const on = !alerts;
          setAlerts(on);
          savePrefs({ timeBlockAlerts: on });
        }}
        className={`${CARD} ${alerts ? "border-[#1e4f4f] bg-[#1e4f4f]/[0.06]" : "border-[#d4cdc3]"}`}
        data-testid="reminders-setting-time-block-alerts"
      >
        <span className="flex items-center justify-between">
          <span className="font-semibold text-[#2a2520]">Time block alerts</span>
          <span className="text-[#1e4f4f]">{alerts ? "On ✓" : "Off"}</span>
        </span>
        <span className="mt-0.5 block text-sm text-[#6b635a]">
          Popup + chime at start, and 15 min before.
        </span>
      </button>

      <button
        type="button"
        disabled={perm === "denied" || perm === "unsupported"}
        onClick={() => chooseDesktop(!desktopOn)}
        className={`${CARD} disabled:opacity-50 ${desktopOn ? "border-[#1e4f4f] bg-[#1e4f4f]/[0.06]" : "border-[#d4cdc3]"}`}
        data-testid="reminders-setting-desktop"
      >
        <span className="flex items-center justify-between">
          <span className="font-semibold text-[#2a2520]">
            Desktop notifications
          </span>
          <span className="text-[#1e4f4f]">{desktopOn ? "On ✓" : "Off"}</span>
        </span>
        <span className="mt-0.5 block text-sm text-[#6b635a]">
          System banners in the background.
        </span>
      </button>

      {perm === "denied" ? (
        <p className="text-sm text-[#a85c4a]">
          Blocked by your browser — allow Notifications for this page in site
          settings. In-app alerts + chime still work.
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => {
          unlockChime();
          playChime();
        }}
        className="mt-1 self-start rounded-xl border-2 border-[#1e4f4f] bg-white px-5 py-2.5 text-base font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
        data-testid="reminders-setting-test-sound"
      >
        🔔 Test sound
      </button>
    </div>
  );
}
