"use client";

import { useCallback, useEffect, useState } from "react";
import { ParkingLotRoomShell } from "@/components/companion/ParkingLotRoomShell";
import { PLAN_MY_DAY_MORNING_COPY } from "@/lib/planMyDay/morningRoom";
import {
  PLAN_MY_DAY_UPDATED,
  addParkingLotItem,
  bringParkingLotItemToToday,
  deleteDeferredPlanItem,
  formatPlanItemCreated,
  parkingLotSourceLabel,
  readPlanningParkingLotItems,
  updateDeferredPlanItem,
  type PlanDayItem,
} from "@/lib/planMyDay";
import { getProjects, saveProjectItem } from "@/lib/companionStore";
import {
  createReminderFromContent,
  defaultReminderScheduledAt,
  sourceRefFromParkingLot,
} from "@/lib/rhythms";

export const PARKING_LOT_HOW_DO_I_COPY =
  "Place something here when you do not want to deal with it yet. You can decide what to do with it later.";

const FIELD =
  "mt-1 w-full rounded-lg border border-[#d4cdc3] bg-white px-3 py-2 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]";
const CARD =
  "rounded-2xl border border-[#e7dfd4] bg-white px-4 py-3 text-left";
const BTN_PRIMARY =
  "rounded-xl bg-[#1e4f4f] px-5 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-[#163a3a]";
const BTN_SECONDARY =
  "rounded-xl border border-[#d4cdc3] px-3 py-1.5 text-sm font-semibold text-[#4b463f] hover:bg-[#f5f0ea]";
const BTN_TEAL_SOFT =
  "rounded-xl border border-[#1e4f4f]/40 px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/10";

function ParkingLotHowDoI() {
  const [open, setOpen] = useState(false);
  return (
    <div className="plan-day-how-do-i" data-testid="parking-lot-how-do-i">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="plan-day-how-do-i__toggle inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e4f4f] transition-colors hover:text-[#163c3c] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
        aria-expanded={open}
        data-testid="parking-lot-how-do-i-toggle"
      >
        How Do I?
        <span aria-hidden="true" className="text-xs font-bold">
          {open ? "−" : "+"}
        </span>
      </button>
      {open ? (
        <p
          className="plan-day-how-do-i__body mt-2 max-w-xl text-sm leading-relaxed text-[#4b463f]"
          data-testid="parking-lot-how-do-i-body"
        >
          {PARKING_LOT_HOW_DO_I_COPY}
        </p>
      ) : null}
    </div>
  );
}

function ParkedItemRow({
  item,
  onChanged,
}: {
  item: PlanDayItem;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.title);
  const [projectId, setProjectId] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const projects = getProjects();
  const sourceLabel = parkingLotSourceLabel(item.source);

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 3200);
  }

  return (
    <li className={CARD} data-testid={`parking-lot-item-${item.id}`}>
      {editing ? (
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = draft.trim();
            if (!trimmed) return;
            updateDeferredPlanItem(item.id, { title: trimmed });
            setEditing(false);
            onChanged();
          }}
        >
          <input
            className={FIELD}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            aria-label="Edit parked item"
            data-testid={`parking-lot-edit-input-${item.id}`}
            autoFocus
          />
          <div className="flex flex-wrap gap-2">
            <button type="submit" className={BTN_PRIMARY}>
              Save
            </button>
            <button
              type="button"
              className={BTN_SECONDARY}
              onClick={() => {
                setDraft(item.title);
                setEditing(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <p className="text-lg font-semibold text-[#1f1c19]">{item.title}</p>
          <p className="mt-1 text-sm text-[#6b635a]">
            Parked {formatPlanItemCreated(item)}
            {sourceLabel ? ` · ${sourceLabel}` : ""}
          </p>
          {notice ? (
            <p className="mt-2 text-sm italic text-[#1e4f4f]" role="status">
              {notice}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className={BTN_TEAL_SOFT}
              data-testid={`parking-lot-move-today-${item.id}`}
              onClick={() => {
                bringParkingLotItemToToday(item.id);
                onChanged();
              }}
            >
              Move to Today
            </button>
            <button
              type="button"
              className={BTN_TEAL_SOFT}
              data-testid={`parking-lot-make-reminder-${item.id}`}
              onClick={() => {
                const result = createReminderFromContent({
                  title: item.title,
                  message: item.notes || item.title,
                  scheduledAt: defaultReminderScheduledAt(),
                  source: "parking_lot",
                  sourceRef: sourceRefFromParkingLot(item.id, item.title),
                });
                if (result.ok) {
                  flash(
                    result.duplicate
                      ? "You already have a reminder like this. Item stays parked."
                      : "Reminder set. Item stays parked until you choose otherwise.",
                  );
                }
              }}
            >
              Make Reminder
            </button>
            {projects.length === 0 ? (
              <button
                type="button"
                className={`${BTN_SECONDARY} cursor-not-allowed opacity-60`}
                disabled
                title="Create a project first — this does not open Create."
                data-testid={`parking-lot-move-project-${item.id}`}
              >
                Move to Project (no projects yet)
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="rounded-xl border border-[#d4cdc3] bg-white px-2 py-1.5 text-sm text-[#1f1c19]"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  aria-label="Choose project"
                  data-testid={`parking-lot-project-select-${item.id}`}
                >
                  <option value="">Choose project…</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className={BTN_TEAL_SOFT}
                  disabled={!projectId}
                  data-testid={`parking-lot-move-project-${item.id}`}
                  onClick={() => {
                    if (!projectId) return;
                    saveProjectItem({
                      projectId,
                      kind: "task",
                      title: item.title,
                    });
                    deleteDeferredPlanItem(item.id);
                    onChanged();
                  }}
                >
                  Move to Project
                </button>
              </div>
            )}
            <button
              type="button"
              className={BTN_SECONDARY}
              data-testid={`parking-lot-edit-${item.id}`}
              onClick={() => {
                setDraft(item.title);
                setEditing(true);
              }}
            >
              Edit
            </button>
            <button
              type="button"
              className={BTN_SECONDARY}
              data-testid={`parking-lot-delete-${item.id}`}
              onClick={() => {
                deleteDeferredPlanItem(item.id);
                onChanged();
              }}
            >
              Delete
            </button>
            <button
              type="button"
              className={BTN_SECONDARY}
              data-testid={`parking-lot-leave-${item.id}`}
              onClick={() => {
                /* Leave Parked — intentional no-op */
              }}
            >
              Leave Parked
            </button>
          </div>
        </>
      )}
    </li>
  );
}

export function ParkingLotRoomPanel({
  onBack,
  registerBack,
}: {
  onBack: () => void;
  registerBack?: (fn: (() => boolean) | null) => void;
}) {
  const [tick, setTick] = useState(0);
  const [text, setText] = useState("");
  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(PLAN_MY_DAY_UPDATED, onUpdate);
    return () => window.removeEventListener(PLAN_MY_DAY_UPDATED, onUpdate);
  }, [refresh]);

  useEffect(() => {
    if (!registerBack) return;
    registerBack(() => {
      onBack();
      return true;
    });
    return () => registerBack(null);
  }, [registerBack, onBack]);

  void tick;
  const items = readPlanningParkingLotItems();

  function parkIt() {
    const trimmed = text.trim();
    if (!trimmed) return;
    addParkingLotItem({ title: trimmed, source: "manual" });
    setText("");
    refresh();
  }

  function focusAdd() {
    document
      .querySelector<HTMLInputElement>('[data-testid="parking-lot-field-text"]')
      ?.focus();
  }

  return (
    <ParkingLotRoomShell onOutsideDismiss={onBack}>
      <div
        className="plan-day-morning-note flex flex-col gap-2 pb-10"
        data-testid="parking-lot-room-panel"
      >
        <ParkingLotHowDoI />
        <div className="mt-3">
          <button
            type="button"
            className="plan-day-morning-note__previous"
            onClick={onBack}
            data-testid="app-back-button"
            aria-label="Previous Screen"
          >
            <span aria-hidden="true">←</span>
            <span>{PLAN_MY_DAY_MORNING_COPY.previousScreen}</span>
          </button>
        </div>
        <h1
          className="plan-day-morning-note__title mt-4"
          data-testid="parking-lot-title"
        >
          Parking Lot
        </h1>

        <section className="mt-6" data-testid="parking-lot-add-section">
          <h2 className="mb-3 text-lg font-semibold text-[#1f1c19]">
            Add Something
          </h2>
          <form
            className="flex flex-col gap-3 rounded-2xl border border-[#e7dfd4] bg-white/90 p-4"
            data-testid="parking-lot-add-form"
            onSubmit={(e) => {
              e.preventDefault();
              parkIt();
            }}
          >
            <label className="block text-sm font-semibold text-[#1f1c19]">
              What would you like to park?
              <input
                className={FIELD}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="An idea, a task, something to revisit…"
                data-testid="parking-lot-field-text"
              />
            </label>
            <button
              type="submit"
              className={BTN_PRIMARY}
              data-testid="parking-lot-park-it"
            >
              Park It
            </button>
          </form>
        </section>

        <section className="mt-8" data-testid="parking-lot-items-section">
          <h2 className="mb-3 text-lg font-semibold text-[#1f1c19]">
            Parked Items
          </h2>
          {items.length === 0 ? (
            <div
              className="rounded-2xl border border-dashed border-[#d4cdc3] bg-white/70 px-4 py-6"
              data-testid="parking-lot-empty"
            >
              <p className="text-base text-[#6b635a]">
                Nothing is parked right now.
              </p>
              <button
                type="button"
                className={`${BTN_PRIMARY} mt-4`}
                onClick={focusAdd}
                data-testid="parking-lot-empty-add"
              >
                Add Something
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <ParkedItemRow
                  key={item.id}
                  item={item}
                  onChanged={refresh}
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </ParkingLotRoomShell>
  );
}
