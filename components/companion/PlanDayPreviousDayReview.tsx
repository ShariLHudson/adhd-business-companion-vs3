"use client";

import { useMemo, useState } from "react";
import { MyRhythmsSetupFlow } from "@/components/companion/MyRhythmsSetupFlow";
import { todayStr } from "@/lib/companionStore";
import {
  bringArchivedItemToToday,
  completeArchivedPlanItem,
  dateStrFromOffset,
  leaveItemWithYesterday,
  parkArchivedItemCopy,
  remindArchivedItemOnce,
  type PlanDayItem,
} from "@/lib/planMyDay";

type ActionMode =
  | "menu"
  | "remind"
  | "rhythm";

type Props = {
  sourceDate: string;
  items: PlanDayItem[];
  onItemsChange: () => void;
  onTodayItemsChange: (items: PlanDayItem[]) => void;
  onClose: () => void;
};

const ACTION_BTN =
  "w-full rounded-xl border border-[#d4cdc3] bg-white px-4 py-2.5 text-left text-base font-semibold text-[#1f1c19] hover:border-[#1e4f4f]/40 hover:bg-[#faf7f2]";

/**
 * Review items safely held from a previous day — member chooses each path.
 */
export function PlanDayPreviousDayReview({
  sourceDate,
  items,
  onItemsChange,
  onTodayItemsChange,
  onClose,
}: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mode, setMode] = useState<ActionMode>("menu");
  const [remindDate, setRemindDate] = useState(() => dateStrFromOffset(1));
  const [remindTime, setRemindTime] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const active = useMemo(
    () => items.find((i) => i.id === activeId) ?? null,
    [items, activeId],
  );

  function resetItemUi() {
    setActiveId(null);
    setMode("menu");
    setRemindDate(dateStrFromOffset(1));
    setRemindTime("");
  }

  function afterAction(message?: string) {
    if (message) setStatus(message);
    resetItemUi();
    onItemsChange();
  }

  function handleBringToToday(itemId: string) {
    const next = bringArchivedItemToToday(sourceDate, itemId);
    onTodayItemsChange(next);
    afterAction("Brought forward for today.");
  }

  function handlePark(itemId: string) {
    parkArchivedItemCopy(sourceDate, itemId);
    afterAction("Moved to Parking Lot — still here when you're ready.");
  }

  function handleComplete(itemId: string) {
    const result = completeArchivedPlanItem(sourceDate, itemId);
    afterAction(result?.toast ?? "Marked complete.");
  }

  function handleLeave(itemId: string) {
    leaveItemWithYesterday(itemId);
    afterAction("Left with yesterday.");
  }

  function handleRemindSubmit() {
    if (!activeId) return;
    const result = remindArchivedItemOnce({
      sourceDate,
      itemId: activeId,
      date: remindDate || todayStr(),
      time: remindTime.trim() || undefined,
    });
    if (!result) {
      setStatus("Something got tangled choosing that time — try again.");
      return;
    }
    afterAction("I'll hold a quiet reminder for that day.");
  }

  if (items.length === 0) {
    return (
      <div
        className="rounded-xl border border-[#e7dfd4] bg-white px-4 py-5"
        data-testid="plan-day-previous-day-review-empty"
      >
        <p className="text-lg font-semibold text-[#1f1c19]">
          You&apos;re all set with yesterday
        </p>
        <p className="mt-2 text-base text-[#6b635a]">
          Nothing left to revisit from that day right now.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 rounded-xl border border-[#c9bfb0] bg-white px-4 py-2.5 text-sm font-semibold text-[#1e4f4f]"
        >
          Back to today
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-4"
      data-testid="plan-day-previous-day-review"
      data-source-date={sourceDate}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-[#1f1c19]">
            Worth revisiting
          </p>
          <p className="mt-1 text-base text-[#6b635a]">
            Choose what feels right for each one — when you&apos;re ready.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-sm font-semibold text-[#6b635a] hover:underline"
        >
          Close
        </button>
      </div>

      {status ? (
        <p
          className="rounded-xl border border-[#c5e0e0] bg-[#f0f8f8] px-4 py-3 text-sm font-semibold text-[#1e4f4f]"
          role="status"
        >
          {status}
        </p>
      ) : null}

      {active && mode === "rhythm" ? (
        <MyRhythmsSetupFlow
          item={active}
          keepLabel="Bring a copy to today"
          removeLabel="Leave with yesterday"
          doneHint={`Rhythm saved for “${active.title}”. Bring a copy into today, or leave it with yesterday?`}
          onKeepDayItem={() => {
            const next = bringArchivedItemToToday(sourceDate, active.id);
            onTodayItemsChange(next);
            leaveItemWithYesterday(active.id);
            afterAction("Rhythm saved — and a copy is on today's plan.");
          }}
          onRemoveDayItem={() => {
            leaveItemWithYesterday(active.id);
            afterAction("Rhythm saved — left with yesterday.");
          }}
          onCancel={() => setMode("menu")}
        />
      ) : active && mode === "remind" ? (
        <div
          className="rounded-xl border border-[#e7dfd4] bg-white px-4 py-4"
          data-testid="plan-day-previous-remind-form"
        >
          <p className="text-base font-semibold text-[#1f1c19]">
            Remind me about &ldquo;{active.title}&rdquo;
          </p>
          <p className="mt-1 text-sm text-[#6b635a]">
            A one-time reminder — not a repeating rhythm.
          </p>
          <label className="mt-3 block text-xs font-bold uppercase tracking-wide text-[#6b635a]">
            Date
            <input
              type="date"
              value={remindDate}
              min={todayStr()}
              onChange={(e) => setRemindDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19]"
              data-testid="plan-day-previous-remind-date"
            />
          </label>
          <label className="mt-3 block text-xs font-bold uppercase tracking-wide text-[#6b635a]">
            Time (optional)
            <input
              type="time"
              value={remindTime}
              onChange={(e) => setRemindTime(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19]"
              data-testid="plan-day-previous-remind-time"
            />
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleRemindSubmit}
              className="rounded-xl border border-[#1e4f4f] bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white"
              data-testid="plan-day-previous-remind-save"
            >
              Save reminder
            </button>
            <button
              type="button"
              onClick={() => setMode("menu")}
              className="rounded-xl border border-[#c9bfb0] px-4 py-2.5 text-sm font-semibold text-[#4b463f]"
            >
              Back
            </button>
          </div>
        </div>
      ) : active && mode === "menu" ? (
        <div
          className="rounded-xl border border-[#e7dfd4] bg-white px-4 py-4"
          data-testid="plan-day-previous-item-actions"
        >
          <p className="text-base font-semibold text-[#1f1c19]">{active.title}</p>
          <ul className="mt-3 flex flex-col gap-2">
            <li>
              <button
                type="button"
                className={ACTION_BTN}
                onClick={() => handleBringToToday(active.id)}
                data-testid="plan-day-action-bring-today"
              >
                Bring to Today
              </button>
            </li>
            <li>
              <button
                type="button"
                className={ACTION_BTN}
                onClick={() => setMode("remind")}
                data-testid="plan-day-action-remind"
              >
                Remind Me
              </button>
            </li>
            <li>
              <button
                type="button"
                className={ACTION_BTN}
                onClick={() => setMode("rhythm")}
                data-testid="plan-day-action-rhythm"
              >
                Make This a Rhythm
              </button>
            </li>
            <li>
              <button
                type="button"
                className={ACTION_BTN}
                onClick={() => handlePark(active.id)}
                data-testid="plan-day-action-parking"
              >
                Move to Parking Lot
              </button>
            </li>
            <li>
              <button
                type="button"
                className={ACTION_BTN}
                onClick={() => handleComplete(active.id)}
                data-testid="plan-day-action-complete"
              >
                Mark Complete
              </button>
            </li>
            <li>
              <button
                type="button"
                className={ACTION_BTN}
                onClick={() => handleLeave(active.id)}
                data-testid="plan-day-action-leave-yesterday"
              >
                Leave With Yesterday
              </button>
            </li>
          </ul>
          <button
            type="button"
            onClick={resetItemUi}
            className="mt-3 text-sm font-semibold text-[#6b635a] hover:underline"
          >
            Back to list
          </button>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  setActiveId(item.id);
                  setMode("menu");
                  setStatus(null);
                }}
                className="flex w-full items-center justify-between rounded-xl border border-[#e7dfd4] bg-white px-4 py-3 text-left hover:border-[#1e4f4f]/35"
                data-testid={`plan-day-previous-item-${item.id}`}
              >
                <span className="text-base font-semibold text-[#1f1c19]">
                  {item.title}
                </span>
                <span className="text-sm text-[#9a8f82]" aria-hidden>
                  →
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
