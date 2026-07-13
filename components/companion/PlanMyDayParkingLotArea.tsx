"use client";

import { useEffect, useState } from "react";
import {
  PLAN_MY_DAY_UPDATED,
  bringParkingLotItemToToday,
  deleteDeferredPlanItem,
  readPlanningParkingLotItems,
  updateDeferredPlanItem,
  type PlanDayItem,
} from "@/lib/planMyDay";
import { PLANNING_CENTER_AREA_META } from "@/lib/planMyDay/planningCenter";
import {
  createReminderFromContent,
  createRhythmFromContent,
  defaultReminderScheduledAt,
  sourceRefFromParkingLot,
} from "@/lib/rhythms";

const FIELD =
  "mt-1 w-full rounded-lg border border-[#d4cdc3] bg-white px-3 py-2 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]";

type Props = {
  onBroughtToToday?: (items: PlanDayItem[]) => void;
  onGoToToday?: () => void;
};

/**
 * Temporary intentional set-aside — not an archive.
 */
export function PlanMyDayParkingLotArea({
  onBroughtToToday,
  onGoToToday,
}: Props) {
  const [items, setItems] = useState<PlanDayItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  function refresh() {
    setItems(readPlanningParkingLotItems());
  }

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener(PLAN_MY_DAY_UPDATED, onUpdate);
    return () => window.removeEventListener(PLAN_MY_DAY_UPDATED, onUpdate);
  }, []);

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 3500);
  }

  function startEdit(item: PlanDayItem) {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditNotes(item.notes ?? "");
  }

  function saveEdit() {
    if (!editingId) return;
    const trimmed = editTitle.trim();
    if (!trimmed) return;
    updateDeferredPlanItem(editingId, {
      title: trimmed,
      notes: editNotes.trim() || undefined,
    });
    setEditingId(null);
    refresh();
  }

  return (
    <div
      className="mt-4 flex flex-col gap-5"
      data-testid="plan-area-parking-lot-panel"
    >
      <div>
        <h2 className="text-xl font-semibold text-[#1f1c19]">
          {PLANNING_CENTER_AREA_META["parking-lot"].label}
        </h2>
        <p className="mt-1 text-base text-[#6b635a]">
          {PLANNING_CENTER_AREA_META["parking-lot"].purpose} Not today. Good
          idea, wrong time. You can bring anything back when you&apos;re ready.
        </p>
        {notice ? (
          <p
            className="mt-2 text-sm italic text-[#1e4f4f]"
            data-testid="parking-lot-notice"
            role="status"
          >
            {notice}
          </p>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#d4cdc3] bg-white/70 px-4 py-6 text-base text-[#6b635a]">
          Parking Lot is empty. From Today, use More… → Move to Parking Lot when
          something should wait without a date.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-[#e7dfd4] bg-white p-4"
            >
              {editingId === item.id ? (
                <div className="flex flex-col gap-2">
                  <input
                    className={FIELD}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    aria-label="Title"
                  />
                  <textarea
                    className={`${FIELD} min-h-[4rem]`}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    aria-label="Notes"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={saveEdit}
                      className="companion-btn-primary rounded-xl px-3 py-2 text-sm font-semibold"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-xl border border-[#d4cdc3] px-3 py-2 text-sm font-semibold text-[#4b463f]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-base font-semibold text-[#1f1c19]">
                    {item.title}
                  </p>
                  {item.notes ? (
                    <p className="mt-1 text-sm text-[#6b635a]">{item.notes}</p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="companion-btn-primary rounded-xl px-3 py-1.5 text-sm font-semibold"
                      onClick={() => {
                        const next = bringParkingLotItemToToday(item.id);
                        onBroughtToToday?.(next);
                        refresh();
                        onGoToToday?.();
                      }}
                      data-testid="parking-restore-today"
                    >
                      Restore to Today
                    </button>
                    <button
                      type="button"
                      className="rounded-xl border border-[#d4cdc3] px-3 py-1.5 text-sm font-semibold text-[#4b463f]"
                      onClick={() => startEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="rounded-xl border border-[#d4cdc3] px-3 py-1.5 text-sm font-semibold text-[#4b463f]"
                      onClick={() => {
                        const result = createReminderFromContent({
                          title: item.title,
                          message: item.notes || item.title,
                          scheduledAt: defaultReminderScheduledAt(),
                          source: "parking_lot",
                          sourceRef: sourceRefFromParkingLot(
                            item.id,
                            item.title,
                          ),
                        });
                        if (result.ok && result.duplicate) {
                          flash(
                            `You already have a reminder like “${result.reminder.title}.” Parking Lot item kept.`,
                          );
                        } else if (result.ok) {
                          flash(
                            `Reminder set for tomorrow. “${item.title}” stays in Parking Lot.`,
                          );
                        }
                      }}
                    >
                      Create Reminder
                    </button>
                    <button
                      type="button"
                      className="rounded-xl border border-[#d4cdc3] px-3 py-1.5 text-sm font-semibold text-[#4b463f]"
                      onClick={() => {
                        const result = createRhythmFromContent({
                          title: item.title,
                          details: item.notes,
                          cadence: "weekly",
                          source: "parking_lot",
                          sourceRef: sourceRefFromParkingLot(
                            item.id,
                            item.title,
                          ),
                        });
                        if (result.ok && result.duplicate) {
                          flash(
                            `You already have a rhythm for “${result.rhythm.title}.” Parking Lot item kept.`,
                          );
                        } else if (result.ok) {
                          flash(
                            `Weekly rhythm created. “${item.title}” stays in Parking Lot.`,
                          );
                        }
                      }}
                    >
                      Create Rhythm
                    </button>
                    <button
                      type="button"
                      className="rounded-xl border border-[#d4cdc3] px-3 py-1.5 text-sm font-semibold text-[#8a4a3a]"
                      onClick={() => {
                        deleteDeferredPlanItem(item.id);
                        refresh();
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
