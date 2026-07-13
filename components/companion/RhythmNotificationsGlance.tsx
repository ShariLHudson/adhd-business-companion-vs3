"use client";

import { useEffect, useState } from "react";
import {
  collectDueDeliverables,
  completeRhythmOccurrence,
  snoozeRhythm,
  skipRhythmOccurrence,
  type Deliverable,
} from "@/lib/rhythms";
import { snoozeReminder, completeReminder } from "@/lib/reminderStore";

/**
 * Lightweight notifications glance — not an inbox.
 * Open from the top bar, act, close.
 */
export function RhythmNotificationsGlance({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [items, setItems] = useState<Deliverable[]>([]);

  function refresh() {
    setItems(collectDueDeliverables());
  }

  useEffect(() => {
    if (!open) return;
    refresh();
    const id = window.setInterval(refresh, 15_000);
    return () => window.clearInterval(id);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed right-4 top-16 z-[220] w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-[#e7dfd4] bg-[#faf7f2]/95 p-4 shadow-lg backdrop-blur-md"
      role="dialog"
      aria-label="Gentle reminders"
      data-testid="rhythm-notifications-glance"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-base font-semibold text-[#1f1c19]">For you right now</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-sm text-[#6b635a] hover:bg-[#ebe4da]"
        >
          Close
        </button>
      </div>
      <p className="mt-1 text-sm text-[#6b635a]">
        A quick glance — not another place to catch up.
      </p>

      {items.length === 0 ? (
        <p className="mt-4 text-base text-[#6b635a]">Nothing waiting right now.</p>
      ) : (
        <ul className="mt-3 flex max-h-[50vh] flex-col gap-3 overflow-y-auto">
          {items.slice(0, 5).map((item) => (
            <li
              key={`${item.kind}-${item.id}`}
              className="rounded-xl border border-[#e7dfd4] bg-white/80 p-3"
            >
              <p className="font-medium text-[#1f1c19]">{item.title}</p>
              <p className="mt-1 text-sm text-[#6b635a]">{item.body}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-[#1e4f4f] px-2.5 py-1 text-sm font-semibold text-white"
                  onClick={() => {
                    if (item.kind === "rhythm" && item.rhythmId) {
                      completeRhythmOccurrence(item.rhythmId);
                    } else if (item.reminderId) {
                      completeReminder(item.reminderId);
                    }
                    refresh();
                  }}
                >
                  Done
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-[#d4cdc3] px-2.5 py-1 text-sm"
                  onClick={() => {
                    if (item.kind === "rhythm" && item.rhythmId) {
                      snoozeRhythm(item.rhythmId, 30);
                    } else if (item.reminderId) {
                      const until = new Date(Date.now() + 30 * 60_000).toISOString();
                      snoozeReminder(item.reminderId, until);
                    }
                    refresh();
                  }}
                >
                  30 min
                </button>
                {item.kind === "rhythm" && item.rhythmId ? (
                  <button
                    type="button"
                    className="rounded-lg px-2.5 py-1 text-sm text-[#6b635a]"
                    onClick={() => {
                      skipRhythmOccurrence(item.rhythmId!);
                      refresh();
                    }}
                  >
                    Skip today
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
