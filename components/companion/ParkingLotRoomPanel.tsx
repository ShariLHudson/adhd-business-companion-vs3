"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ParkingLotRoomShell } from "@/components/companion/ParkingLotRoomShell";
import { PLAN_MY_DAY_MORNING_COPY } from "@/lib/planMyDay/morningRoom";
import {
  PARK_IT_CONFIRM,
  PARK_IT_DONE_LABEL,
  PARK_IT_EXPLANATION,
  PARK_IT_FIELD_LABEL,
  PARK_IT_FIELD_PLACEHOLDER,
  PARK_IT_HOW_DO_I_BODY,
  PARK_IT_NOTE_LABEL,
  PARK_IT_NOTE_PLACEHOLDER,
  PARK_IT_PRIMARY_CTA,
  PARK_IT_SECONDARY_EDIT,
  PARK_IT_SECONDARY_MOVE,
  PARK_IT_SECONDARY_REVIEW_DATE,
  PARK_IT_SUPPORT_LINE,
  PARK_IT_TITLE,
} from "@/lib/parkItCopy";
import {
  PARKING_LOT_EMPTY,
  PARKING_LOT_EXPLANATION,
  PARKING_LOT_HOW_DO_I_COPY,
  PARKING_LOT_NO_ATTENTION_NEEDED,
  PARKING_LOT_SUMMARY_TEMPLATE,
  PARKING_LOT_SUPPORT_LINE,
  PARKING_LOT_TITLE,
} from "@/lib/parkingLotCopy";
import {
  consumeParkingLotEntryMode,
  type ParkingLotEntryMode,
} from "@/lib/parkingLot/entryMode";
import {
  buildParkingLotSummary,
  filterParkedItems,
  groupParkedItems,
  loadParkingLotViewPrefs,
  paginateItems,
  saveParkingLotViewPrefs,
  type ParkingLotGroupId,
  type ParkingLotSort,
  type ParkingLotSourceFilter,
  type ParkingLotStatusFilter,
  type ParkingLotViewPrefs,
} from "@/lib/parkingLot/parkedItemViews";
import {
  PLAN_MY_DAY_UPDATED,
  addParkingLotItem,
  bringParkingLotItemToToday,
  deleteDeferredPlanItem,
  formatPlanItemCreated,
  parkingLotSourceLabel,
  readAllParkingLotItems,
  updateDeferredPlanItem,
  type PlanDayItem,
} from "@/lib/planMyDay";
import { getProjects, saveProjectItem } from "@/lib/companionStore";
import {
  createReminderFromContent,
  defaultReminderScheduledAt,
  sourceRefFromParkingLot,
} from "@/lib/rhythms";

/** Re-export for clarity tests — Parking Lot How Do I (review destination). */
export { PARKING_LOT_HOW_DO_I_COPY } from "@/lib/parkingLotCopy";

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

type LoadState = "loading" | "ready" | "error";

function readParkingLotSafely(): {
  items: PlanDayItem[];
  loadState: LoadState;
  loadError: string | null;
} {
  try {
    return {
      items: readAllParkingLotItems(),
      loadState: "ready",
      loadError: null,
    };
  } catch {
    return {
      items: [],
      loadState: "error",
      loadError: "I couldn’t load your Parking Lot just now.",
    };
  }
}

function HowDoI({
  testId,
  body,
}: {
  testId: string;
  body: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="plan-day-how-do-i" data-testid={testId}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="plan-day-how-do-i__toggle inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e4f4f] transition-colors hover:text-[#163c3c] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
        aria-expanded={open}
        data-testid={`${testId}-toggle`}
      >
        How Do I?
        <span aria-hidden="true" className="text-xs font-bold">
          {open ? "−" : "+"}
        </span>
      </button>
      {open ? (
        <div
          className="plan-day-how-do-i__body mt-2 max-w-xl space-y-2 text-sm leading-relaxed text-[#4b463f]"
          data-testid={`${testId}-body`}
        >
          {body.split("\n\n").map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CompactParkedRow({
  item,
  onChanged,
}: {
  item: PlanDayItem;
  onChanged: () => void;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.title);
  const [reviewDraft, setReviewDraft] = useState(item.reviewDate ?? "");
  const [projectId, setProjectId] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const projects = getProjects();
  const sourceLabel = parkingLotSourceLabel(item.source);

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 3200);
  }

  if (editing) {
    return (
      <li className={CARD} data-testid={`parking-lot-item-${item.id}`}>
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = draft.trim();
            if (!trimmed) return;
            updateDeferredPlanItem(item.id, {
              title: trimmed,
              reviewDate: reviewDraft.trim() || undefined,
            });
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
          <label className="text-sm text-[#4b463f]">
            Review date (optional)
            <input
              type="date"
              className={FIELD}
              value={reviewDraft}
              onChange={(e) => setReviewDraft(e.target.value)}
              data-testid={`parking-lot-review-date-${item.id}`}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className={BTN_PRIMARY}>
              Save
            </button>
            <button
              type="button"
              className={BTN_SECONDARY}
              onClick={() => {
                setDraft(item.title);
                setReviewDraft(item.reviewDate ?? "");
                setEditing(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className={CARD} data-testid={`parking-lot-item-${item.id}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-[#1f1c19]">
            {item.title}
          </p>
          <p className="mt-0.5 text-sm text-[#6b635a]">
            Parked {formatPlanItemCreated(item)}
            {sourceLabel ? ` · ${sourceLabel}` : ""}
            {item.parkCategory ? ` · ${item.parkCategory}` : ""}
            {item.reviewDate ? ` · Review ${item.reviewDate}` : ""}
          </p>
        </div>
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
      </div>
      {notice ? (
        <p className="mt-2 text-sm italic text-[#1e4f4f]" role="status">
          {notice}
        </p>
      ) : null}
      <div className="mt-2">
        <button
          type="button"
          className={BTN_SECONDARY}
          data-testid={`parking-lot-more-${item.id}`}
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((v) => !v)}
        >
          {moreOpen ? "Less" : "More"}
        </button>
      </div>
      {moreOpen ? (
        <div className="mt-3 flex flex-wrap gap-2">
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
                updateDeferredPlanItem(item.id, {
                  parkStatus: "reminder-created",
                  reminderId: result.reminder?.id,
                });
                flash(
                  result.duplicate
                    ? "You already have a reminder like this."
                    : "Reminder set.",
                );
                onChanged();
              }
            }}
          >
            Create Reminder
          </button>
          {projects.length > 0 ? (
            <>
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
                  updateDeferredPlanItem(item.id, {
                    parkStatus: "added-to-project",
                    projectId,
                  });
                  onChanged();
                }}
              >
                Add to Project
              </button>
            </>
          ) : null}
          <button
            type="button"
            className={BTN_SECONDARY}
            data-testid={`parking-lot-edit-${item.id}`}
            onClick={() => {
              setDraft(item.title);
              setReviewDraft(item.reviewDate ?? "");
              setEditing(true);
            }}
          >
            Edit / Review Date
          </button>
          <button
            type="button"
            className={BTN_SECONDARY}
            data-testid={`parking-lot-resolve-${item.id}`}
            onClick={() => {
              updateDeferredPlanItem(item.id, { parkStatus: "resolved" });
              onChanged();
            }}
          >
            Mark Resolved
          </button>
          <button
            type="button"
            className={BTN_SECONDARY}
            data-testid={`parking-lot-archive-${item.id}`}
            onClick={() => {
              updateDeferredPlanItem(item.id, { parkStatus: "archived" });
              onChanged();
            }}
          >
            Archive
          </button>
          <button
            type="button"
            className={BTN_SECONDARY}
            data-testid={`parking-lot-delete-${item.id}`}
            onClick={() => {
              if (
                typeof window !== "undefined" &&
                !window.confirm("Delete this parked item permanently?")
              ) {
                return;
              }
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
              setMoreOpen(false);
            }}
          >
            Leave Parked
          </button>
        </div>
      ) : null}
    </li>
  );
}

function ParkItCapture({
  onDone,
  onViewLot,
}: {
  onDone: () => void;
  onViewLot: () => void;
}) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [lastId, setLastId] = useState<string | null>(null);
  const [reviewDate, setReviewDate] = useState("");
  const parkInFlightRef = useRef(false);

  function park() {
    if (parkInFlightRef.current) return;
    const trimmed = title.trim();
    if (!trimmed) return;
    parkInFlightRef.current = true;
    try {
      const created = addParkingLotItem({
        title: trimmed,
        notes,
        source: "park-it",
        reviewDate: reviewDate || undefined,
        preventDuplicate: true,
      });
      if (!created) return;
      setLastId(created.id);
      setTitle("");
      setNotes("");
      setConfirm(true);
    } finally {
      parkInFlightRef.current = false;
    }
  }

  if (confirm) {
    return (
      <section className="mt-6" data-testid="park-it-confirm">
        <p
          className="text-base italic text-[#1e4f4f]"
          role="status"
          data-testid="parking-lot-park-confirm"
        >
          {PARK_IT_CONFIRM}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className={BTN_PRIMARY}
            data-testid="park-it-done"
            onClick={onDone}
          >
            {PARK_IT_DONE_LABEL}
          </button>
          <button
            type="button"
            className={BTN_SECONDARY}
            data-testid="park-it-add-review"
            onClick={() => {
              if (!lastId || !reviewDate) {
                setConfirm(false);
                return;
              }
              updateDeferredPlanItem(lastId, { reviewDate });
              setConfirm(false);
            }}
          >
            {PARK_IT_SECONDARY_REVIEW_DATE}
          </button>
          <button
            type="button"
            className={BTN_SECONDARY}
            data-testid="park-it-view-lot"
            onClick={onViewLot}
          >
            {PARK_IT_SECONDARY_MOVE}
          </button>
          <button
            type="button"
            className={BTN_SECONDARY}
            data-testid="park-it-edit-again"
            onClick={() => setConfirm(false)}
          >
            {PARK_IT_SECONDARY_EDIT}
          </button>
        </div>
        <label className="mt-4 block text-sm font-semibold text-[#1f1c19]">
          Optional review date
          <input
            type="date"
            className={FIELD}
            value={reviewDate}
            onChange={(e) => setReviewDate(e.target.value)}
            data-testid="park-it-review-date"
          />
        </label>
      </section>
    );
  }

  return (
    <section className="mt-6" data-testid="park-it-capture">
      <h1 className="plan-day-morning-note__title" data-testid="park-it-title">
        {PARK_IT_TITLE}
      </h1>
      <p className="mt-2 max-w-xl text-base text-[#4b463f]">{PARK_IT_EXPLANATION}</p>
      <p className="mt-1 text-sm text-[#6b635a]">{PARK_IT_SUPPORT_LINE}</p>
      <HowDoI testId="park-it-how-do-i" body={PARK_IT_HOW_DO_I_BODY} />
      <form
        className="mt-4 flex flex-col gap-3 rounded-2xl border border-[#e7dfd4] bg-white/90 p-4"
        data-testid="parking-lot-add-form"
        onSubmit={(e) => {
          e.preventDefault();
          park();
        }}
      >
        <label className="block text-sm font-semibold text-[#1f1c19]">
          {PARK_IT_FIELD_LABEL}
          <input
            className={FIELD}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={PARK_IT_FIELD_PLACEHOLDER}
            data-testid="parking-lot-field-text"
          />
        </label>
        <label className="block text-sm font-semibold text-[#1f1c19]">
          {PARK_IT_NOTE_LABEL}
          <textarea
            className={FIELD}
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={PARK_IT_NOTE_PLACEHOLDER}
            data-testid="park-it-notes"
          />
        </label>
        <button
          type="submit"
          className={BTN_PRIMARY}
          data-testid="parking-lot-park-it"
        >
          {PARK_IT_PRIMARY_CTA}
        </button>
      </form>
    </section>
  );
}

export function ParkingLotRoomPanel({
  onBack,
  registerBack,
}: {
  onBack: () => void;
  registerBack?: (fn: (() => boolean) | null) => void;
}) {
  const initial = readParkingLotSafely();
  const [mode, setMode] = useState<ParkingLotEntryMode>("review");
  const [items, setItems] = useState<PlanDayItem[]>(initial.items);
  const [loadError, setLoadError] = useState<string | null>(initial.loadError);
  const [loadState, setLoadState] = useState<LoadState>(initial.loadState);
  const [prefs, setPrefs] = useState<ParkingLotViewPrefs>(() =>
    typeof window === "undefined"
      ? {
          statusFilter: "all-parked",
          sourceFilter: "all",
          sort: "newest",
          search: "",
          pageSize: 25,
          page: 0,
          expandedGroups: ["recently-parked", "review-soon", "needs-decision"],
        }
      : loadParkingLotViewPrefs(),
  );
  const [showQuickPark, setShowQuickPark] = useState(false);

  const loadItems = useCallback(() => {
    const next = readParkingLotSafely();
    setItems(next.items);
    setLoadError(next.loadError);
    setLoadState(next.loadState);
  }, []);

  useEffect(() => {
    setMode(consumeParkingLotEntryMode());
    loadItems();
    const onUpdate = () => loadItems();
    window.addEventListener(PLAN_MY_DAY_UPDATED, onUpdate);
    return () => window.removeEventListener(PLAN_MY_DAY_UPDATED, onUpdate);
  }, [loadItems]);

  useEffect(() => {
    saveParkingLotViewPrefs(prefs);
  }, [prefs]);

  useEffect(() => {
    if (!registerBack) return;
    registerBack(() => false);
    return () => registerBack(null);
  }, [registerBack]);

  useEffect(() => {
    if (loadState !== "loading") return;
    const failsafe = window.setTimeout(() => {
      setLoadState((current) => {
        if (current !== "loading") return current;
        setLoadError("I couldn’t load your Parking Lot just now.");
        return "error";
      });
    }, 2500);
    return () => window.clearTimeout(failsafe);
  }, [loadState]);

  const summary = useMemo(() => buildParkingLotSummary(items), [items]);
  const filtered = useMemo(
    () =>
      filterParkedItems(items, {
        statusFilter: prefs.statusFilter,
        sourceFilter: prefs.sourceFilter,
        search: prefs.search,
        sort: prefs.sort,
      }),
    [items, prefs],
  );
  const groups = useMemo(() => groupParkedItems(filtered), [filtered]);
  const flatForPage = useMemo(
    () => groups.flatMap((g) => g.items),
    [groups],
  );
  const page = useMemo(
    () => paginateItems(flatForPage, prefs.page, prefs.pageSize),
    [flatForPage, prefs.page, prefs.pageSize],
  );
  const pageIdSet = useMemo(
    () => new Set(page.pageItems.map((i) => i.id)),
    [page.pageItems],
  );

  function toggleGroup(id: ParkingLotGroupId) {
    setPrefs((prev) => {
      const open = prev.expandedGroups.includes(id);
      return {
        ...prev,
        expandedGroups: open
          ? prev.expandedGroups.filter((g) => g !== id)
          : [...prev.expandedGroups, id],
      };
    });
  }

  if (mode === "park-it") {
    return (
      <ParkingLotRoomShell onOutsideDismiss={onBack}>
        <div
          className="plan-day-morning-note flex flex-col gap-2 pb-10"
          data-testid="parking-lot-room-panel"
          data-parking-mode="park-it"
        >
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
          <ParkItCapture
            onDone={onBack}
            onViewLot={() => {
              loadItems();
              setMode("review");
            }}
          />
        </div>
      </ParkingLotRoomShell>
    );
  }

  return (
    <ParkingLotRoomShell onOutsideDismiss={onBack}>
      <div
        className="plan-day-morning-note flex flex-col gap-2 pb-10"
        data-testid="parking-lot-room-panel"
        data-parking-mode="review"
      >
        <HowDoI
          testId="parking-lot-how-do-i"
          body={PARKING_LOT_HOW_DO_I_COPY}
        />
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
          {PARKING_LOT_TITLE}
        </h1>
        <p className="mt-2 max-w-xl text-base text-[#4b463f]">
          {PARKING_LOT_EXPLANATION}
        </p>
        <p className="text-sm text-[#6b635a]">{PARKING_LOT_SUPPORT_LINE}</p>

        {loadState === "ready" && summary.totalParked > 0 ? (
          <p
            className="mt-4 text-base font-medium text-[#1f1c19]"
            data-testid="parking-lot-summary"
          >
            {PARKING_LOT_SUMMARY_TEMPLATE(
              summary.totalParked,
              summary.attentionToday,
            )}
          </p>
        ) : null}
        {loadState === "ready" &&
        summary.totalParked > 0 &&
        summary.attentionToday === 0 ? (
          <p className="text-sm text-[#6b635a]" data-testid="parking-lot-calm">
            {PARKING_LOT_NO_ATTENTION_NEEDED}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className={BTN_SECONDARY}
            data-testid="parking-lot-open-park-it"
            onClick={() => setMode("park-it")}
          >
            {PARK_IT_PRIMARY_CTA}
          </button>
          <button
            type="button"
            className={BTN_SECONDARY}
            data-testid="parking-lot-toggle-quick-park"
            onClick={() => setShowQuickPark((v) => !v)}
          >
            {showQuickPark ? "Hide quick park" : "Quick park"}
          </button>
        </div>

        {showQuickPark ? (
          <section className="mt-4" data-testid="parking-lot-add-section">
            <ParkItCapture
              onDone={() => {
                setShowQuickPark(false);
                loadItems();
              }}
              onViewLot={() => {
                setShowQuickPark(false);
                loadItems();
              }}
            />
          </section>
        ) : null}

        <section className="mt-6" data-testid="parking-lot-controls">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <input
              className={FIELD}
              value={prefs.search}
              onChange={(e) =>
                setPrefs((p) => ({ ...p, search: e.target.value, page: 0 }))
              }
              placeholder="Search title, notes, tags…"
              aria-label="Search parked items"
              data-testid="parking-lot-search"
            />
            <select
              className={FIELD}
              value={prefs.statusFilter}
              onChange={(e) =>
                setPrefs((p) => ({
                  ...p,
                  statusFilter: e.target.value as ParkingLotStatusFilter,
                  page: 0,
                }))
              }
              aria-label="Filter by status"
              data-testid="parking-lot-filter-status"
            >
              <option value="all-parked">All Parked</option>
              <option value="review-soon">Review Soon</option>
              <option value="needs-decision">Needs a Decision</option>
              <option value="moved-to-today">Moved to Today</option>
              <option value="reminder-created">Reminder Created</option>
              <option value="added-to-project">Added to Project</option>
              <option value="resolved">Resolved</option>
              <option value="archived">Archived</option>
            </select>
            <select
              className={FIELD}
              value={prefs.sourceFilter}
              onChange={(e) =>
                setPrefs((p) => ({
                  ...p,
                  sourceFilter: e.target.value as ParkingLotSourceFilter,
                  page: 0,
                }))
              }
              aria-label="Filter by source"
              data-testid="parking-lot-filter-source"
            >
              <option value="all">All sources</option>
              <option value="park-it">Park It</option>
              <option value="clear-my-mind">Clear My Mind</option>
              <option value="conversation">Conversation</option>
              <option value="project">Project</option>
              <option value="other">Other</option>
            </select>
            <select
              className={FIELD}
              value={prefs.sort}
              onChange={(e) =>
                setPrefs((p) => ({
                  ...p,
                  sort: e.target.value as ParkingLotSort,
                }))
              }
              aria-label="Sort"
              data-testid="parking-lot-sort"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="review-date">Review date</option>
              <option value="recently-updated">Recently updated</option>
              <option value="category">Category</option>
            </select>
          </div>
        </section>

        <section className="mt-8" data-testid="parking-lot-items-section">
          {loadState === "loading" ? (
            <p
              className="text-base text-[#6b635a]"
              data-testid="parking-lot-loading"
            >
              Loading Parking Lot…
            </p>
          ) : loadState === "error" ? (
            <div
              className="rounded-2xl border border-dashed border-[#d4cdc3] bg-white/70 px-4 py-6"
              data-testid="parking-lot-error"
            >
              <p className="text-base text-[#6b635a]">
                {loadError ?? "I couldn’t load your Parking Lot just now."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={BTN_PRIMARY}
                  onClick={() => {
                    setLoadState("loading");
                    loadItems();
                  }}
                  data-testid="parking-lot-retry"
                >
                  Try Again
                </button>
                <button
                  type="button"
                  className={BTN_SECONDARY}
                  onClick={onBack}
                  data-testid="parking-lot-error-return"
                >
                  Return to Welcome Home
                </button>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="rounded-2xl border border-dashed border-[#d4cdc3] bg-white/70 px-4 py-6"
              data-testid="parking-lot-empty"
            >
              <p className="text-base text-[#6b635a]">{PARKING_LOT_EMPTY}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={BTN_PRIMARY}
                  onClick={() => setMode("park-it")}
                  data-testid="parking-lot-empty-add"
                >
                  {PARK_IT_PRIMARY_CTA}
                </button>
                <button
                  type="button"
                  className={BTN_SECONDARY}
                  onClick={onBack}
                  data-testid="parking-lot-empty-return"
                >
                  Return to Welcome Home
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4" data-testid="parking-lot-groups">
              {groups.map((group) => {
                const expanded = prefs.expandedGroups.includes(group.id);
                const visibleItems = group.items.filter((i) =>
                  pageIdSet.has(i.id),
                );
                if (visibleItems.length === 0 && !expanded) {
                  /* still show collapsed header with count */
                }
                return (
                  <div
                    key={group.id}
                    className="rounded-2xl border border-[#e7dfd4] bg-white/60"
                    data-testid={`parking-lot-group-${group.id}`}
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between px-4 py-3 text-left"
                      aria-expanded={expanded}
                      onClick={() => toggleGroup(group.id)}
                      data-testid={`parking-lot-group-toggle-${group.id}`}
                    >
                      <span className="text-base font-semibold text-[#1f1c19]">
                        {group.label}
                      </span>
                      <span className="text-sm text-[#6b635a]">
                        {group.items.length}
                        {expanded ? " −" : " +"}
                      </span>
                    </button>
                    {expanded ? (
                      <ul className="flex flex-col gap-2 px-3 pb-3">
                        {group.items
                          .filter((i) => pageIdSet.has(i.id))
                          .map((item) => (
                            <CompactParkedRow
                              key={item.id}
                              item={item}
                              onChanged={loadItems}
                            />
                          ))}
                      </ul>
                    ) : null}
                  </div>
                );
              })}
              {page.totalPages > 1 ? (
                <div
                  className="flex flex-wrap items-center gap-2"
                  data-testid="parking-lot-pagination"
                >
                  <button
                    type="button"
                    className={BTN_SECONDARY}
                    disabled={page.page <= 0}
                    onClick={() =>
                      setPrefs((p) => ({ ...p, page: Math.max(0, p.page - 1) }))
                    }
                  >
                    Previous
                  </button>
                  <span className="text-sm text-[#6b635a]">
                    Page {page.page + 1} of {page.totalPages}
                  </span>
                  <button
                    type="button"
                    className={BTN_SECONDARY}
                    disabled={page.page >= page.totalPages - 1}
                    onClick={() =>
                      setPrefs((p) => ({
                        ...p,
                        page: Math.min(page.totalPages - 1, p.page + 1),
                      }))
                    }
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </ParkingLotRoomShell>
  );
}
