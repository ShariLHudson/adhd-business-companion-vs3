"use client";

import { useState } from "react";
import { logMomentum } from "@/lib/companionStore";
import {
  ACTIVITY_CATEGORIES,
  activityCategoryDropdownOptions,
  activitiesForCategory,
  type ActivityCategoryId,
  type CompanionActivity,
} from "@/lib/companionActivities";
import {
  CATEGORY_PICKER_EMPTY_LIST_HINT,
  CATEGORY_PICKER_HINT,
  NO_CATEGORY,
} from "@/lib/categoryRevealUx";
import { CategoryPickerSelect } from "@/components/companion/CategoryPickerSelect";
import type { AppSection } from "@/lib/companionUi";

type Phase = "browse" | "active" | "stopped" | "complete";

export function CompanionActivitiesPanel({
  onOpen,
  onClose,
}: {
  onOpen?: (section: AppSection) => void;
  onClose?: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("browse");
  const [categoryId, setCategoryId] = useState<ActivityCategoryId | typeof NO_CATEGORY>(
    NO_CATEGORY,
  );
  const [activity, setActivity] = useState<CompanionActivity | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  const categoryOptions = activityCategoryDropdownOptions();
  const selectedCategory = ACTIVITY_CATEGORIES.find((c) => c.id === categoryId);
  const visible =
    categoryId === NO_CATEGORY ? [] : activitiesForCategory(categoryId);

  function start(a: CompanionActivity) {
    setActivity(a);
    setStepIndex(0);
    setPhase("active");
  }

  function stop() {
    setPhase("stopped");
  }

  function finish() {
    if (activity) {
      logMomentum("reset", `Activity: ${activity.title}`);
    }
    setPhase("complete");
  }

  function backToBrowse() {
    setActivity(null);
    setStepIndex(0);
    setPhase("browse");
  }

  if (phase === "stopped") {
    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-lg flex-col items-center px-6 py-16 text-center">
        <p className="text-2xl font-semibold text-[#1f1c19]">Stopped when you needed to.</p>
        <p className="mt-2 text-base leading-relaxed text-[#6b635a]">
          That&apos;s the point — these are here when you want them, not obligations.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {activity ? (
            <button
              type="button"
              onClick={() => {
                setStepIndex(0);
                setPhase("active");
              }}
              className="rounded-xl border-2 border-[#1e4f4f] bg-white px-5 py-2.5 text-sm font-semibold text-[#1e4f4f]"
            >
              Resume {activity.title}
            </button>
          ) : null}
          <button
            type="button"
            onClick={backToBrowse}
            className="rounded-xl bg-[#1e4f4f] px-6 py-2.5 text-sm font-semibold text-white"
          >
            Back to activities
          </button>
        </div>
      </div>
    );
  }

  if (phase === "complete" && activity) {
    const cat = ACTIVITY_CATEGORIES.find((c) => c.id === activity.categoryId);
    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-lg flex-col items-center px-6 py-16 text-center">
        <p className="text-2xl font-semibold text-[#1f1c19]">You showed up for yourself.</p>
        <p className="mt-2 text-base text-[#6b635a]">
          {activity.title} — {cat?.label ?? "done"}. No scorecard. Just support.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={backToBrowse}
            className="rounded-xl bg-[#1e4f4f] px-6 py-2.5 text-sm font-semibold text-white"
          >
            Choose another
          </button>
          {activity.linkedSection && onOpen ? (
            <button
              type="button"
              onClick={() => onOpen(activity.linkedSection!)}
              className="rounded-xl border-2 border-[#1e4f4f] bg-white px-5 py-2.5 text-sm font-semibold text-[#1e4f4f]"
            >
              {activity.linkedLabel ?? "Open tool"}
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  if (phase === "active" && activity) {
    const cat = ACTIVITY_CATEGORIES.find((c) => c.id === activity.categoryId);
    const steps = activity.steps;
    const isLast = stepIndex >= steps.length - 1;
    const onLinkedStep =
      isLast && activity.linkedSection && activity.linkedLabel;

    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-lg flex-col px-6 py-8">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 text-left">
            <p className="text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
              {cat?.label}
            </p>
            <h2 className="text-xl font-semibold text-[#1f1c19]">{activity.title}</h2>
            <p className="mt-1 text-sm text-[#6b635a]">{activity.timeLabel}</p>
          </div>
          <button
            type="button"
            onClick={stop}
            className="shrink-0 rounded-lg border border-[#d4cdc3] bg-white px-3 py-1.5 text-sm font-semibold text-[#6b635a] hover:border-[#1e4f4f]/40 hover:text-[#1e4f4f]"
          >
            Stop anytime
          </button>
        </div>

        <div className="mt-6 flex-1 overflow-y-auto rounded-2xl border border-[#e7dfd4] bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
            Step {stepIndex + 1} of {steps.length}
          </p>
          <p className="mt-3 text-lg leading-relaxed text-[#1f1c19]">
            {steps[stepIndex]}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {stepIndex > 0 ? (
            <button
              type="button"
              onClick={() => setStepIndex((i) => i - 1)}
              className="rounded-xl border border-[#c9bfb0] bg-white px-4 py-2.5 text-sm font-semibold text-[#4b463f]"
            >
              Back
            </button>
          ) : null}
          {!isLast ? (
            <button
              type="button"
              onClick={() => setStepIndex((i) => i + 1)}
              className="flex-1 rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
            >
              Next step
            </button>
          ) : onLinkedStep && onOpen ? (
            <>
              <button
                type="button"
                onClick={finish}
                className="rounded-xl border border-[#1e4f4f]/40 bg-white px-4 py-2.5 text-sm font-semibold text-[#1e4f4f]"
              >
                Finish here
              </button>
              <button
                type="button"
                onClick={() => {
                  finish();
                  onOpen(activity.linkedSection!);
                }}
                className="flex-1 rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white"
              >
                {activity.linkedLabel}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={finish}
              className="flex-1 rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
            >
              Done
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-lg flex-col px-6 py-8">
      <div className="flex items-start justify-between gap-3">
        <header className="min-w-0 text-left">
          <h1 className="text-2xl font-semibold text-[#1f1c19]">Help Me Right Now</h1>
          <p className="mt-2 text-base leading-relaxed text-[#6b635a]">
            {CATEGORY_PICKER_HINT} No scoreboard — just support when you need it.
          </p>
        </header>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl text-[#6b635a] hover:bg-[#1e4f4f]/10"
          >
            ✕
          </button>
        ) : null}
      </div>

      <div className="mt-6">
        <CategoryPickerSelect
          label="What kind of help do you need?"
          value={categoryId}
          onChange={setCategoryId}
          options={categoryOptions}
          placeholder="Select…"
        />
      </div>

      {selectedCategory ? (
        <p className="mt-3 text-sm text-[#6b635a]">{selectedCategory.description}</p>
      ) : null}

      <ul className="mt-5 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-4">
        {categoryId === NO_CATEGORY ? (
          <li className="rounded-xl border border-dashed border-[#e7dfd4] px-4 py-6 text-center text-sm text-[#6b635a]">
            {CATEGORY_PICKER_EMPTY_LIST_HINT}
          </li>
        ) : (
          visible.map((a) => (
            <li key={a.id}>
              <ActivityCard activity={a} onStart={start} />
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function ActivityCard({
  activity,
  onStart,
}: {
  activity: CompanionActivity;
  onStart: (a: CompanionActivity) => void;
}) {
  return (
    <div className="rounded-2xl border border-[#e7dfd4] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 text-left">
          <h3 className="font-semibold text-[#1f1c19]">{activity.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-[#6b635a]">
            {activity.helpsWith}
          </p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-[#9a8f82]">
            {activity.timeLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onStart(activity)}
          className="shrink-0 rounded-xl bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163a3a]"
        >
          Start
        </button>
      </div>
    </div>
  );
}
