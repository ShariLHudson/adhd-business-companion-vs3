"use client";

import { useEffect, useMemo, useState } from "react";
import { getProjects } from "@/lib/companionStore";
import {
  dateStrFromOffset,
  deferPlanItemToDate,
  deletePlanItem,
  duplicatePlanItem,
  finishPlanItem,
  formatPlanDueDate,
  formatPlanItemCreated,
  movePlanItemColumn,
  nextFocusOptions,
  parkPlanItem,
  snoozePlanItemUntil,
  tomorrowStr,
  updatePlanItem,
  type PlanDayItem,
  type PlanItemColumn,
  type PlanItemPriority,
  KANBAN_COLUMNS,
} from "@/lib/planMyDay";
import {
  PLAN_PRIORITY_OPTIONS,
} from "@/lib/planMyDay/types";
import { defaultWhyTodayPlaceholder } from "@/lib/planMyDay/companionBrainClient/whyToday";
import { PlanDayLifeAreaSelector } from "@/components/companion/PlanDayLifeAreaSelector";
import { confirmLifeAreaForTask } from "@/lib/planMyDay/lifeAreaBridge";
import { migratePlanItemLifeArea } from "@/lib/planMyDay/lifeAreaBridge";
import {
  REMIND_PRESETS,
  shariRemindAcknowledgment,
} from "@/lib/planMyDay/companionBrainClient/planDayRemindMe";
import { AppBackButton } from "@/components/companion/AppBackButton";
import { MyRhythmsSetupFlow } from "@/components/companion/MyRhythmsSetupFlow";
import {
  FormVoiceEntryControl,
  applyFormVoiceTranscript,
} from "@/components/companion/FormVoiceEntryControl";

export type PlanItemDetailMode =
  | "form"
  | "mark-done"
  | "defer-day"
  | "delete-confirm"
  | "move-area"
  | "convert-rhythm";

type Props = {
  item: PlanDayItem;
  items: PlanDayItem[];
  onItemsChange: (items: PlanDayItem[]) => void;
  onClose: () => void;
  onStartNow?: (item: PlanDayItem) => void;
  onOpenProject?: (projectId: string) => void;
  onOpenNextItem?: (id: string) => void;
  onCompleted?: (message: string) => void;
  initialMode?: PlanItemDetailMode;
  onModeChange?: (mode: PlanItemDetailMode) => void;
  hideClose?: boolean;
  compact?: boolean;
};

const FIELD =
  "mt-1 w-full rounded-lg border border-[#d4cdc3] bg-white px-3 py-2 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]";
const LABEL = "block text-xs font-bold uppercase tracking-wide text-[#6b635a]";

function projectName(projectId?: string): string | null {
  if (!projectId) return null;
  return getProjects().find((p) => p.id === projectId)?.name ?? null;
}

function useItemForm(item: PlanDayItem) {
  const migrated = migratePlanItemLifeArea(item);
  const [title, setTitle] = useState(item.title);
  const [notes, setNotes] = useState(item.notes ?? "");
  const [duration, setDuration] = useState(
    item.durationMinutes?.toString() ?? "",
  );
  const [lifeAreaId, setLifeAreaId] = useState<string | null>(
    migrated.lifeAreaId ?? null,
  );
  const [priority, setPriority] = useState<PlanItemPriority>(
    item.priority ?? "medium",
  );
  const [projectId, setProjectId] = useState(item.projectId ?? "");
  const [dueDate, setDueDate] = useState(item.dueDate ?? "");
  const [startTime, setStartTime] = useState(item.startTime ?? "");

  useEffect(() => {
    const next = migratePlanItemLifeArea(item);
    setTitle(item.title);
    setNotes(item.notes ?? "");
    setDuration(item.durationMinutes?.toString() ?? "");
    setLifeAreaId(next.lifeAreaId ?? null);
    setPriority(item.priority ?? "medium");
    setProjectId(item.projectId ?? "");
    setDueDate(item.dueDate ?? "");
    setStartTime(item.startTime ?? "");
  }, [item]);

  return {
    title,
    setTitle,
    notes,
    setNotes,
    duration,
    setDuration,
    lifeAreaId,
    setLifeAreaId,
    priority,
    setPriority,
    projectId,
    setProjectId,
    dueDate,
    setDueDate,
    startTime,
    setStartTime,
  };
}

export function PlanDayItemDetail({
  item,
  items,
  onItemsChange,
  onClose,
  onStartNow,
  onOpenProject,
  onOpenNextItem,
  onCompleted,
  initialMode = "form",
  onModeChange,
  hideClose = false,
  compact = false,
}: Props) {
  const [mode, setMode] = useState<PlanItemDetailMode>(initialMode);
  const [savedFlash, setSavedFlash] = useState(false);
  const [remindOpen, setRemindOpen] = useState(false);
  const [remindAck, setRemindAck] = useState<string | null>(null);
  const [deferDate, setDeferDate] = useState(tomorrowStr());
  const [actionsOpen, setActionsOpen] = useState(false);
  const [activeFieldKey, setActiveFieldKey] = useState<string | null>(null);
  const form = useItemForm(item);

  const projects = useMemo(
    () =>
      getProjects().sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      ),
    [],
  );

  const relatedProjectName = useMemo(
    () => projectName(form.projectId || undefined),
    [form.projectId],
  );

  useEffect(() => {
    if (!savedFlash) return;
    const id = window.setTimeout(() => setSavedFlash(false), 2200);
    return () => window.clearTimeout(id);
  }, [savedFlash]);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    onModeChange?.(mode);
  }, [mode, onModeChange]);

  function setDetailMode(next: PlanItemDetailMode) {
    setMode(next);
  }

  function apply(next: PlanDayItem[]) {
    onItemsChange(next);
  }

  function buildPatch(): Partial<PlanDayItem> {
    const durationMinutes = form.duration.trim()
      ? Number.parseInt(form.duration, 10)
      : undefined;
    return {
      title: form.title.trim() || item.title,
      notes: form.notes.trim() || undefined,
      durationMinutes: Number.isFinite(durationMinutes)
        ? durationMinutes
        : undefined,
      flexible: !durationMinutes,
      lifeAreaId: form.lifeAreaId ?? undefined,
      category: undefined,
      priority: form.priority,
      projectId: form.projectId || undefined,
      dueDate: form.dueDate || undefined,
      startTime: form.startTime.trim() || undefined,
    };
  }

  function handleSave() {
    if (form.lifeAreaId && form.title.trim()) {
      confirmLifeAreaForTask(form.title.trim(), form.lifeAreaId);
    }
    apply(updatePlanItem(items, item.id, buildPatch()));
    setSavedFlash(true);
  }

  function handleStartNow() {
    apply(
      updatePlanItem(items, item.id, {
        ...buildPatch(),
        column: "doing",
        done: false,
        focusRank: Date.now(),
      }),
    );
    onStartNow?.(item);
  }

  function handleMarkDoneChoice(
    choice: "complete" | "duplicate" | "open-next",
  ) {
    const next = updatePlanItem(items, item.id, buildPatch());
    if (choice === "duplicate") {
      apply(duplicatePlanItem(next, item.id));
      onClose();
      return;
    }
    const followUp =
      choice === "open-next" ? nextFocusOptions(next, item.id)[0] : undefined;
    const result = finishPlanItem(next, item.id, { sourceWorkspace: "plan-my-day" });
    if (!result) return;
    onItemsChange(result.items);
    onCompleted?.(result.toast);
    if (followUp) {
      onOpenNextItem?.(followUp.id);
    } else {
      onClose();
    }
  }

  function handleRemindUntil(until: string) {
    const next = updatePlanItem(items, item.id, buildPatch());
    apply(snoozePlanItemUntil(next, item.id, until));
    setRemindOpen(false);
    setRemindAck(shariRemindAcknowledgment(item.title));
    window.setTimeout(() => onClose(), 1200);
  }

  function handleDefer(targetDate: string) {
    const next = updatePlanItem(items, item.id, buildPatch());
    apply(deferPlanItemToDate(next, item.id, targetDate));
    onClose();
  }

  function handleDelete() {
    apply(deletePlanItem(items, item.id));
    onClose();
  }

  function handleMoveArea(column: Extract<PlanItemColumn, "ready" | "today" | "doing">) {
    const next = updatePlanItem(items, item.id, buildPatch());
    apply(movePlanItemColumn(next, item.id, column));
    setDetailMode("form");
    setActionsOpen(false);
  }

  const shell = compact
    ? "rounded-xl border border-[#e7dfd4] bg-white"
    : "rounded-2xl border border-[#e7dfd4] bg-white shadow-sm";

  if (mode === "convert-rhythm") {
    return (
      <MyRhythmsSetupFlow
        item={{ ...item, title: form.title.trim() || item.title, notes: form.notes.trim() || item.notes }}
        onCancel={() => setDetailMode("form")}
        onKeepDayItem={() => {
          handleSave();
          onClose();
        }}
        onRemoveDayItem={() => {
          handleDelete();
        }}
      />
    );
  }

  if (mode === "move-area") {
    return (
      <div className={`${shell} px-4 py-5`} data-testid="plan-item-move-area">
        <p className="text-lg font-semibold text-[#1f1c19]">
          Move to another day area
        </p>
        <p className="mt-1 text-sm text-[#6b635a]">
          Choose where &ldquo;{form.title || item.title}&rdquo; belongs today.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          {KANBAN_COLUMNS.map((col) => (
            <button
              key={col.id}
              type="button"
              disabled={item.column === col.id}
              onClick={() =>
                handleMoveArea(
                  col.id as Extract<PlanItemColumn, "ready" | "today" | "doing">,
                )
              }
              className="rounded-xl border border-[#d4cdc3] bg-[#faf7f2] px-4 py-3 text-left text-base font-semibold text-[#1f1c19] hover:border-[#1e4f4f]/40 disabled:opacity-40"
              data-testid={`plan-item-move-${col.id}`}
            >
              {col.label}
              <span className="mt-0.5 block text-sm font-normal text-[#6b635a]">
                {col.hint}
              </span>
            </button>
          ))}
        </div>
        <AppBackButton
          destination="Manage item"
          onBack={() => setDetailMode("form")}
          size="compact"
          className="mt-4"
        />
      </div>
    );
  }

  if (mode === "mark-done") {
    return (
      <div className={`${shell} px-4 py-5`}>
        <p className="text-xl font-semibold text-[#1f1c19]">✓ Nice work!</p>
        <p className="mt-2 text-base text-[#6b635a]">
          What would you like to do?
        </p>
        <ul className="mt-4 flex flex-col gap-2" role="radiogroup">
          {(
            [
              ["complete", "Done — remove from today"],
              ["duplicate", "Duplicate it"],
              ["open-next", "Open next item"],
            ] as const
          ).map(([value, label]) => (
            <li key={value}>
              <button
                type="button"
                role="radio"
                onClick={() => handleMarkDoneChoice(value)}
                className="flex w-full items-center gap-3 rounded-xl border border-[#d4cdc3] bg-[#faf7f2] px-4 py-3 text-left text-base text-[#1f1c19] hover:border-[#1e4f4f]/40"
              >
                <span
                  className="inline-block h-4 w-4 shrink-0 rounded-full border-2 border-[#1e4f4f]"
                  aria-hidden
                />
                {label}
              </button>
            </li>
          ))}
        </ul>
        <AppBackButton
          destination="Manage item"
          onBack={() => setDetailMode("form")}
          size="compact"
          className="mt-4"
        />
      </div>
    );
  }

  if (mode === "delete-confirm") {
    return (
      <div className={`${shell} px-4 py-5`}>
        <p className="text-lg font-semibold text-[#1f1c19]">Remove from today?</p>
        <p className="mt-2 text-sm text-[#6b635a]">
          &ldquo;{form.title}&rdquo; will be removed from today&apos;s plan.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-xl bg-[#8b3a3a] px-4 py-2 text-sm font-semibold text-white"
          >
            Remove
          </button>
          <button
            type="button"
            onClick={() => setDetailMode("form")}
            className="rounded-xl border border-[#d4cdc3] px-4 py-2 text-sm font-semibold text-[#4b463f]"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (mode === "defer-day") {
    return (
      <div className={`${shell} px-4 py-5`}>
        <p className="text-lg font-semibold text-[#1f1c19]">
          Move to another day
        </p>
        <p className="mt-1 text-sm text-[#6b635a]">
          This item leaves today&apos;s plan and appears on the day you pick.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          {[
            { label: "Tomorrow", date: tomorrowStr() },
            { label: "In 3 days", date: dateStrFromOffset(3) },
            { label: "Next week", date: dateStrFromOffset(7) },
          ].map((opt) => (
            <button
              key={opt.date}
              type="button"
              onClick={() => handleDefer(opt.date)}
              className="rounded-xl border border-[#d4cdc3] bg-[#faf7f2] px-4 py-3 text-left text-base font-semibold text-[#1f1c19] hover:border-[#1e4f4f]/40"
            >
              {opt.label}
              <span className="mt-0.5 block text-sm font-normal text-[#6b635a]">
                {formatPlanDueDate(opt.date)}
              </span>
            </button>
          ))}
        </div>
        <label className={`${LABEL} mt-4`}>
          Or pick a date
          <input
            type="date"
            value={deferDate}
            min={tomorrowStr()}
            onChange={(e) => setDeferDate(e.target.value)}
            className={FIELD}
          />
        </label>
        <button
          type="button"
          onClick={() => handleDefer(deferDate)}
          disabled={!deferDate}
          className="mt-3 w-full rounded-xl border border-[#1e4f4f]/35 bg-white px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5] disabled:opacity-40"
        >
          Move to {formatPlanDueDate(deferDate)}
        </button>
        <AppBackButton
          destination="Manage item"
          onBack={() => setDetailMode("form")}
          size="compact"
          className="mt-4"
        />
      </div>
    );
  }

  return (
    <div className={`${shell} overflow-hidden`}>
        <div className="flex items-start justify-between gap-3 border-b border-[#e7dfd4] px-4 py-4">
        <div>
          <p className="text-lg font-semibold text-[#1f1c19]">Manage item</p>
          <p className="mt-0.5 text-sm text-[#6b635a]">
            Created {formatPlanItemCreated(item)}
          </p>
        </div>
        {!hideClose ? (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg px-2 py-1 text-sm font-semibold text-[#6b635a] hover:bg-[#f0f5f5]"
            aria-label="Close"
          >
            ✕
          </button>
        ) : null}
      </div>

      <div className="space-y-3 px-4 py-4">
        <label className={LABEL}>
          Title
          <input
            value={form.title}
            onChange={(e) => form.setTitle(e.target.value)}
            onFocus={() => setActiveFieldKey("title")}
            className={FIELD}
          />
        </label>

        <FormVoiceEntryControl
          activeFieldKey={activeFieldKey}
          activeFieldLabel={
            activeFieldKey === "notes" ? "Why this matters today" : "Title"
          }
          onTranscript={(fieldKey, spoken) => {
            if (fieldKey === "notes") {
              form.setNotes(applyFormVoiceTranscript(form.notes, spoken));
              return;
            }
            form.setTitle(applyFormVoiceTranscript(form.title, spoken));
          }}
          micTitle="Edit with voice"
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <label className={LABEL}>
            Duration (minutes)
            <input
              type="number"
              min={1}
              value={form.duration}
              onChange={(e) => form.setDuration(e.target.value)}
              placeholder="Flexible"
              className={FIELD}
            />
          </label>
          <label className={LABEL}>
            Priority
            <select
              value={form.priority}
              onChange={(e) =>
                form.setPriority(e.target.value as PlanItemPriority)
              }
              className={FIELD}
            >
              {PLAN_PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <PlanDayLifeAreaSelector
              taskText={form.title}
              value={form.lifeAreaId}
              onChange={form.setLifeAreaId}
            />
          </div>
          <label className={LABEL}>
            Scheduled time
            <input
              type="time"
              value={form.startTime}
              onChange={(e) => form.setStartTime(e.target.value)}
              className={FIELD}
            />
          </label>
        </div>

        <label className={LABEL}>
          Due date
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => form.setDueDate(e.target.value)}
            className={FIELD}
          />
        </label>

        <label className={LABEL}>
          Project
          <select
            value={form.projectId}
            onChange={(e) => form.setProjectId(e.target.value)}
            className={FIELD}
          >
            <option value="">None</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        {form.projectId && relatedProjectName ? (
          <div className="rounded-xl border border-[#c5e0e0] bg-[#f0f8f8] px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#1e4f4f]">
              Related project
            </p>
            <p className="mt-0.5 text-base font-semibold text-[#1f1c19]">
              {relatedProjectName}
            </p>
            {onOpenProject ? (
              <button
                type="button"
                onClick={() => onOpenProject(form.projectId)}
                className="mt-2 text-sm font-semibold text-[#1e4f4f] hover:underline"
              >
                Open Project →
              </button>
            ) : null}
          </div>
        ) : null}

        <label className={LABEL}>
          Why this matters today
          <textarea
            value={form.notes}
            onChange={(e) => form.setNotes(e.target.value)}
            onFocus={() => setActiveFieldKey("notes")}
            rows={3}
            placeholder={defaultWhyTodayPlaceholder()}
            className={FIELD}
          />
        </label>

        {remindAck ? (
          <p
            className="rounded-xl border border-[#c5e0e0] bg-[#f0f8f8] px-3 py-2 text-sm leading-relaxed text-[#1e4f4f]"
            role="status"
          >
            {remindAck}
          </p>
        ) : null}

        {savedFlash ? (
          <p
            className="text-center text-sm font-semibold text-[#1e4f4f]"
            role="status"
          >
            ✓ Changes saved
          </p>
        ) : null}
      </div>

      <div className="border-t border-[#e7dfd4] px-4 py-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="companion-btn-primary rounded-xl px-4 py-2 text-sm font-semibold"
          >
            Save Changes
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setActionsOpen((o) => !o)}
              className="rounded-xl border border-[#d4cdc3] px-4 py-2 text-sm font-semibold text-[#4b463f]"
              aria-expanded={actionsOpen}
              aria-haspopup="menu"
              data-testid="plan-item-actions-menu"
            >
              More…
            </button>
            {actionsOpen ? (
              <ul
                className="absolute bottom-full left-0 z-10 mb-1 min-w-[14rem] rounded-xl border border-[#e7dfd4] bg-white py-1 shadow-lg"
                role="menu"
                data-testid="plan-item-actions-list"
              >
                <li role="none">
                  <button
                    type="button"
                    role="menuitem"
                    className="block w-full px-3 py-2.5 text-left text-sm text-[#4b463f] hover:bg-[#faf7f2]"
                    onClick={() => {
                      setActionsOpen(false);
                      setDetailMode("move-area");
                    }}
                  >
                    Move to another day area
                  </button>
                </li>
                <li role="none">
                  <button
                    type="button"
                    role="menuitem"
                    className="block w-full px-3 py-2.5 text-left text-sm text-[#4b463f] hover:bg-[#faf7f2]"
                    onClick={() => {
                      setActionsOpen(false);
                      setDetailMode("mark-done");
                    }}
                  >
                    Mark complete
                  </button>
                </li>
                {onStartNow ? (
                  <li role="none">
                    <button
                      type="button"
                      role="menuitem"
                      className="block w-full px-3 py-2.5 text-left text-sm text-[#4b463f] hover:bg-[#faf7f2]"
                      onClick={() => {
                        setActionsOpen(false);
                        handleStartNow();
                      }}
                    >
                      Start now
                    </button>
                  </li>
                ) : null}
                <li role="none">
                  <button
                    type="button"
                    role="menuitem"
                    className="block w-full px-3 py-2.5 text-left text-sm text-[#4b463f] hover:bg-[#faf7f2]"
                    onClick={() => {
                      setActionsOpen(false);
                      setDetailMode("defer-day");
                    }}
                  >
                    Send to later
                  </button>
                </li>
                <li role="none">
                  <button
                    type="button"
                    role="menuitem"
                    className="block w-full px-3 py-2.5 text-left text-sm text-[#4b463f] hover:bg-[#faf7f2]"
                    data-testid="plan-item-park"
                    onClick={() => {
                      setActionsOpen(false);
                      const next = updatePlanItem(items, item.id, buildPatch());
                      apply(parkPlanItem(next, item.id));
                      onClose();
                    }}
                  >
                    Move to Parking Lot
                  </button>
                </li>
                <li role="none">
                  <button
                    type="button"
                    role="menuitem"
                    className="block w-full px-3 py-2.5 text-left text-sm text-[#4b463f] hover:bg-[#faf7f2]"
                    onClick={() => {
                      setActionsOpen(false);
                      setDetailMode("convert-rhythm");
                    }}
                    data-testid="plan-item-convert-rhythm"
                  >
                    Convert to a Rhythm
                  </button>
                </li>
                <li role="none">
                  <button
                    type="button"
                    role="menuitem"
                    className="block w-full px-3 py-2.5 text-left text-sm text-[#4b463f] hover:bg-[#faf7f2]"
                    onClick={() => {
                      setActionsOpen(false);
                      setRemindOpen(true);
                    }}
                  >
                    Remind me…
                  </button>
                </li>
                <li role="none">
                  <button
                    type="button"
                    role="menuitem"
                    className="block w-full px-3 py-2.5 text-left text-sm text-[#8b3a3a] hover:bg-[#faf7f2]"
                    onClick={() => {
                      setActionsOpen(false);
                      setDetailMode("delete-confirm");
                    }}
                  >
                    Remove from today
                  </button>
                </li>
              </ul>
            ) : null}
          </div>
        </div>
        {remindOpen ? (
          <ul
            className="mt-2 rounded-xl border border-[#e7dfd4] bg-white py-1 shadow-sm"
            role="menu"
          >
            {REMIND_PRESETS.map((preset) => (
              <li key={preset.id} role="none">
                <button
                  type="button"
                  role="menuitem"
                  className="block w-full px-3 py-2 text-left text-sm text-[#4b463f] hover:bg-[#faf7f2]"
                  onClick={() =>
                    handleRemindUntil(preset.resolveUntil().toISOString())
                  }
                >
                  {preset.label}
                </button>
              </li>
            ))}
            <li role="none">
              <button
                type="button"
                role="menuitem"
                className="block w-full px-3 py-2 text-left text-sm text-[#6b635a] hover:bg-[#faf7f2]"
                onClick={() => setRemindOpen(false)}
              >
                Cancel
              </button>
            </li>
          </ul>
        ) : null}
      </div>
    </div>
  );
}
