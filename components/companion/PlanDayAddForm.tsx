"use client";

import { useState } from "react";
import { OutcomeGoalLinkPicker } from "@/components/companion/OutcomeGoalLinkPicker";
import { PlanPullFromClearMyMind } from "@/components/companion/PlanPullFromClearMyMind";
import {
  PLAN_CATEGORY_OPTIONS,
  type PlanItemPriority,
  type PlanLifeDomain,
  type QuickPlanItemInput,
} from "@/lib/planMyDay";

const FIELD =
  "rounded-xl border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]";

type QuickChip = "task" | "call" | "reminder" | "idea";

type Props = {
  onAdd: (input: QuickPlanItemInput) => void;
  onOpenReminderBuilder?: () => void;
  compact?: boolean;
  showHeading?: boolean;
};

export function PlanDayAddForm({
  onAdd,
  onOpenReminderBuilder,
  compact = false,
  showHeading = true,
}: Props) {
  const [title, setTitle] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [category, setCategory] = useState<PlanLifeDomain | "auto">("auto");
  const [hasTime, setHasTime] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [outcomeGoalId, setOutcomeGoalId] = useState<string | undefined>();
  const [pendingCategory, setPendingCategory] = useState<PlanLifeDomain | "auto">(
    "auto",
  );
  const [pendingPriority, setPendingPriority] = useState<
    PlanItemPriority | undefined
  >();

  function reset() {
    setTitle("");
    setCategory("auto");
    setHasTime(false);
    setStartTime("09:00");
    setOutcomeGoalId(undefined);
    setPendingCategory("auto");
    setPendingPriority(undefined);
    setShowMore(false);
  }

  function submit(overrideTitle?: string) {
    const trimmed = (overrideTitle ?? title).trim();
    if (!trimmed) return;
    onAdd({
      title: trimmed,
      category: showMore ? category : pendingCategory,
      priority: pendingPriority,
      startTime: showMore && hasTime ? startTime : undefined,
      outcomeGoalId: showMore ? outcomeGoalId : undefined,
    });
    reset();
  }

  function applyChip(chip: QuickChip) {
    if (chip === "reminder") {
      onOpenReminderBuilder?.();
      return;
    }
    if (chip === "task") {
      setPendingCategory("personal");
      setPendingPriority(undefined);
      return;
    }
    if (chip === "call") {
      setPendingCategory("personal");
      setTitle((prev) => {
        const t = prev.trim();
        if (!t || /^call\b/i.test(t)) return prev;
        return t ? `Call ${t}` : "Call ";
      });
      return;
    }
    if (chip === "idea") {
      setPendingCategory("learning");
      setPendingPriority("low");
      return;
    }
  }

  function handlePullFromClearMyMind(titles: string[]) {
    for (const t of titles) {
      onAdd({ title: t, category: "auto" });
    }
  }

  const chipClass =
    "rounded-full border border-[#e7dfd4] bg-white px-3 py-1.5 text-xs font-semibold text-[#1f1c19] hover:border-[#1e4f4f]/40 hover:bg-[#faf7f2]";

  return (
    <div className="flex flex-col gap-3">
      {showHeading && !compact ? (
        <p className="text-base font-semibold text-[#1f1c19]">
          What needs attention today?
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Type a task and press Enter..."
          aria-label="What needs attention today?"
          className={`${FIELD} w-full flex-1 text-base py-2.5`}
          data-testid="plan-capture-input"
        />
        <button
          type="button"
          onClick={() => submit()}
          className="shrink-0 rounded-xl bg-[#1e4f4f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163c3c] sm:self-stretch"
          data-testid="plan-capture-add"
        >
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2" data-testid="plan-quick-chips">
        {(
          [
            ["task", "Task"],
            ["call", "Call"],
            ["reminder", "Reminder"],
            ["idea", "Idea"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => applyChip(id)}
            className={chipClass}
          >
            {label}
          </button>
        ))}
      </div>

      <PlanPullFromClearMyMind onAddSelected={handlePullFromClearMyMind} />

      <div className="rounded-xl border border-[#e7dfd4] bg-[#faf7f2]/60 p-4">
        {showMore ? (
          <div className="flex flex-col gap-3">
            <label className="flex min-w-0 flex-1 items-center gap-2 text-sm font-semibold text-[#6b635a]">
              <span className="shrink-0">Category</span>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as PlanLifeDomain | "auto")
                }
                className={`${FIELD} min-w-0 flex-1 py-2 text-sm`}
                aria-label="Category"
              >
                {PLAN_CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 text-sm font-semibold text-[#6b635a]">
              <input
                type="checkbox"
                checked={hasTime}
                onChange={(e) => setHasTime(e.target.checked)}
                className="h-4 w-4 accent-[#1e4f4f]"
              />
              Specific time
            </label>

            {hasTime ? (
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={FIELD}
                aria-label="Time"
              />
            ) : null}

            <OutcomeGoalLinkPicker
              value={outcomeGoalId}
              onChange={setOutcomeGoalId}
              label="Link to goal"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowMore(true)}
            className="flex w-full items-center justify-between text-sm font-semibold text-[#1e4f4f] hover:underline"
            data-testid="plan-more-options"
          >
            <span>Add Time, Goal, Category</span>
            <span aria-hidden>▼</span>
          </button>
        )}
      </div>
    </div>
  );
}
