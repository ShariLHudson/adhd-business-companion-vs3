"use client";

import { useState } from "react";
import {
  planItemMetaLabel,
  planItemStyle,
  type PlanDayItem,
} from "@/lib/planMyDay";
import type { LivingBoardPartition } from "@/lib/planMyDay/companionBrainClient/presentJudgment";
import { heldItemsLongTermLine } from "@/lib/planMyDay/companionBrainClient/boardStewardship";
import { useCategoryColorCoding } from "@/lib/useCategoryColorCoding";
import { isPlanItemLocked } from "@/lib/planMyDay/todaysPlanReorder";

/** Reorder / delete for one section's items — Living Board sections stay independent. */
export type LivingBoardItemActions = {
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDelete: (id: string) => void;
};

function ItemRow({
  item,
  onOpen,
  colorCoding,
  momentumLabel,
  whyToday,
  actions,
  canMoveUp,
  canMoveDown,
}: {
  item: PlanDayItem;
  onOpen: (id: string) => void;
  colorCoding: boolean;
  momentumLabel: string | null;
  whyToday?: string | null;
  actions?: LivingBoardItemActions;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}) {
  const style = planItemStyle(item, colorCoding);
  const isMomentum =
    momentumLabel &&
    item.title.toLowerCase().includes(momentumLabel.toLowerCase());
  const locked = isPlanItemLocked(item);
  const showReorder = Boolean(actions) && !locked;

  return (
    <li
      className="flex items-stretch gap-1.5 rounded-xl border bg-white px-1.5 py-1.5 transition-colors focus-within:border-[#1e4f4f]/35 hover:border-[#1e4f4f]/35"
      style={{
        borderColor: colorCoding ? `${style.color}44` : style.border,
        borderLeftWidth: 4,
        borderLeftColor: colorCoding ? style.color : style.border,
        backgroundColor: colorCoding ? `${style.tint}cc` : style.tint,
      }}
      data-testid={`plan-day-living-item-${item.id}`}
      data-locked={locked ? "true" : "false"}
    >
      {showReorder ? (
        <span className="flex shrink-0 flex-col justify-center gap-0.5">
          <button
            type="button"
            onClick={() => actions!.onMoveUp(item.id)}
            disabled={!canMoveUp}
            aria-label={`Move ${item.title} up`}
            data-testid={`plan-day-living-move-up-${item.id}`}
            className="flex h-8 w-8 items-center justify-center rounded-md text-sm text-[#6b635a] hover:bg-[#f5f0ea] disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
          >
            ▲
          </button>
          <button
            type="button"
            onClick={() => actions!.onMoveDown(item.id)}
            disabled={!canMoveDown}
            aria-label={`Move ${item.title} down`}
            data-testid={`plan-day-living-move-down-${item.id}`}
            className="flex h-8 w-8 items-center justify-center rounded-md text-sm text-[#6b635a] hover:bg-[#f5f0ea] disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
          >
            ▼
          </button>
        </span>
      ) : locked && actions ? (
        <span
          className="flex h-full w-8 shrink-0 items-center justify-center text-base text-[#6b635a]"
          aria-label="Locked in place"
          data-testid={`plan-day-living-lock-${item.id}`}
        >
          🔒
        </span>
      ) : null}

      <button
        type="button"
        onClick={() => onOpen(item.id)}
        className="flex min-w-0 flex-1 flex-col rounded-lg px-2 py-1 text-left"
        data-testid={`plan-day-living-open-${item.id}`}
      >
        <span className="flex w-full items-start gap-3">
          <span className="min-w-0 flex-1">
            <span className="text-lg text-[#1f1c19]">{item.title}</span>
            {isMomentum ? (
              <span className="ml-2 text-xs font-bold uppercase text-[#1e4f4f]">
                Momentum
              </span>
            ) : null}
            <span className="mt-0.5 block text-base text-[#6b635a]">
              {planItemMetaLabel(item, colorCoding)}
            </span>
          </span>
          <span className="shrink-0 text-base text-[#9a8f82]" aria-hidden>
            →
          </span>
        </span>
        {whyToday ? (
          <span className="mt-2 block text-sm leading-relaxed text-[#6b635a]">
            {whyToday}
          </span>
        ) : null}
      </button>

      {actions ? (
        <button
          type="button"
          onClick={() => actions.onDelete(item.id)}
          aria-label={`Delete ${item.title}`}
          data-testid={`plan-day-living-delete-${item.id}`}
          className="flex h-8 w-8 shrink-0 self-center items-center justify-center rounded-md text-base text-[#6b635a] hover:bg-[#f5f0ea] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
        >
          🗑
        </button>
      ) : null}
    </li>
  );
}

function Section({
  title,
  hint,
  items,
  onOpen,
  colorCoding,
  momentumLabel,
  delayClass,
  actions,
}: {
  title: string;
  hint?: string;
  items: PlanDayItem[];
  onOpen: (id: string) => void;
  colorCoding: boolean;
  momentumLabel: string | null;
  delayClass?: string;
  actions?: LivingBoardItemActions;
}) {
  if (!items.length) return null;
  return (
    <div className={`plan-day-living-enter ${delayClass ?? ""}`}>
      <p className="text-lg font-semibold text-[#1f1c19]">{title}</p>
      {hint ? (
        <p className="mt-1 text-sm text-[#6b635a]">{hint}</p>
      ) : null}
      <ul className="mt-3 flex flex-col gap-2">
        {items.map((item, index) => (
          <ItemRow
            key={item.id}
            item={item}
            onOpen={onOpen}
            colorCoding={colorCoding}
            momentumLabel={momentumLabel}
            whyToday={item.notes?.trim() || null}
            actions={actions}
            canMoveUp={index > 0}
            canMoveDown={index < items.length - 1}
          />
        ))}
      </ul>
    </div>
  );
}

function HoldingSection({
  items,
  transparencyLine,
  onOpen,
  colorCoding,
  momentumLabel,
}: {
  items: PlanDayItem[];
  transparencyLine: string | null;
  onOpen: (id: string) => void;
  colorCoding: boolean;
  momentumLabel: string | null;
}) {
  const [open, setOpen] = useState(false);
  const count = items.length;
  if (count <= 0) return null;

  return (
    <div
      className="plan-day-living-enter plan-day-living-enter--delayed rounded-xl border border-dashed border-[#e7dfd4] bg-[#faf7f2]/60 px-4 py-3"
      data-testid="plan-day-holding"
    >
      {transparencyLine ? (
        <p
          className="text-sm leading-relaxed text-[#6b635a]"
          data-testid="plan-day-holding-transparency"
        >
          {transparencyLine}
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between text-left ${transparencyLine ? "mt-3" : ""}`}
        aria-expanded={open}
        data-testid="plan-day-holding-toggle"
      >
        <span className="text-base font-semibold text-[#6b635a]">
          Being Held
        </span>
        <span className="text-sm font-medium text-[#9a8f82]">
          {count} item{count === 1 ? "" : "s"}
        </span>
      </button>
      {open ? (
        <div className="mt-3">
          <p className="text-sm leading-relaxed text-[#6b635a]">
            Carried for you — not deleted, not abandoned. Open any item when
            you&apos;re ready.
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                onOpen={onOpen}
                colorCoding={colorCoding}
                momentumLabel={momentumLabel}
                whyToday={item.notes?.trim() || null}
              />
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-3 text-sm font-semibold text-[#1e4f4f] hover:underline"
          >
            Hide held items
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-2 text-sm font-semibold text-[#1e4f4f] hover:underline"
          data-testid="plan-day-holding-explore"
        >
          See what I&apos;m holding
        </button>
      )}
    </div>
  );
}

type Props = {
  partition: LivingBoardPartition;
  onOpen: (id: string) => void;
  emptyMessage?: string;
  holdingTransparencyLine?: string | null;
  /** Completions for the local calendar day — titles only */
  completedToday?: { id: string; title: string }[];
  /** Reorder within a section (own the persisted sortOrder for that section's items). */
  onMoveItem?: (
    sectionItems: PlanDayItem[],
    id: string,
    direction: "up" | "down",
  ) => void;
  /** Remove an item — host opens the calm "Remove from today?" confirm. */
  onDeleteItem?: (id: string) => void;
};

/**
 * Living Board — Today's Focus · In Progress · Considering Today · Completed Today.
 */
export function PlanDayLivingBoard({
  partition,
  onOpen,
  emptyMessage = "Nothing has been added yet. You can add something whenever it would help.",
  holdingTransparencyLine = null,
  completedToday = [],
  onMoveItem,
  onDeleteItem,
}: Props) {
  const colorCoding = useCategoryColorCoding();
  const todaysFocus = partition.focus.filter((i) => i.column !== "doing");
  const inProgress = partition.focus.filter((i) => i.column === "doing");
  const total =
    partition.focus.length +
    partition.ready.length +
    partition.holdingCount +
    completedToday.length;

  if (total === 0) {
    return (
      <p
        className="plan-day-living-enter text-base text-[#6b635a]"
        data-testid="plan-day-living-empty"
      >
        {emptyMessage}
      </p>
    );
  }

  function actionsFor(sectionItems: PlanDayItem[]): LivingBoardItemActions | undefined {
    if (!onMoveItem && !onDeleteItem) return undefined;
    return {
      onMoveUp: (id) => onMoveItem?.(sectionItems, id, "up"),
      onMoveDown: (id) => onMoveItem?.(sectionItems, id, "down"),
      onDelete: (id) => onDeleteItem?.(id),
    };
  }

  return (
    <div className="flex flex-col gap-6" data-testid="plan-day-living-board">
      <Section
        title="Today's Focus"
        hint="What matters most today."
        items={todaysFocus}
        onOpen={onOpen}
        colorCoding={colorCoding}
        momentumLabel={partition.momentumLabel}
        actions={actionsFor(todaysFocus)}
      />
      <Section
        title="In Progress"
        hint="What you are working on now."
        items={inProgress}
        onOpen={onOpen}
        colorCoding={colorCoding}
        momentumLabel={partition.momentumLabel}
        delayClass="plan-day-living-enter--delayed"
        actions={actionsFor(inProgress)}
      />
      <Section
        title="Considering Today"
        hint="Ideas still on your radar."
        items={partition.ready}
        onOpen={onOpen}
        colorCoding={colorCoding}
        momentumLabel={partition.momentumLabel}
        delayClass="plan-day-living-enter--delayed"
        actions={actionsFor(partition.ready)}
      />
      {completedToday.length > 0 ? (
        <div
          className="plan-day-living-enter plan-day-living-enter--delayed"
          data-testid="plan-day-completed-today"
        >
          <p className="text-lg font-semibold text-[#1f1c19]">Completed Today</p>
          <p className="mt-1 text-sm text-[#6b635a]">
            Quiet progress — still yours.
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {completedToday.map((row) => (
              <li
                key={row.id}
                className="rounded-xl border border-[#e7dfd4] bg-[#faf7f2]/70 px-4 py-3 text-base text-[#4b463f]"
              >
                {row.title}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <HoldingSection
        items={partition.holding}
        transparencyLine={
          holdingTransparencyLine ??
          heldItemsLongTermLine(partition.holdingCount)
        }
        onOpen={onOpen}
        colorCoding={colorCoding}
        momentumLabel={partition.momentumLabel}
      />
    </div>
  );
}
