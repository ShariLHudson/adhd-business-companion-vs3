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

function ItemRow({
  item,
  onOpen,
  colorCoding,
  momentumLabel,
  whyToday,
}: {
  item: PlanDayItem;
  onOpen: (id: string) => void;
  colorCoding: boolean;
  momentumLabel: string | null;
  whyToday?: string | null;
}) {
  const style = planItemStyle(item, colorCoding);
  const isMomentum =
    momentumLabel &&
    item.title.toLowerCase().includes(momentumLabel.toLowerCase());

  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(item.id)}
        className="flex w-full flex-col rounded-xl border bg-white px-4 py-3 text-left transition-colors hover:border-[#1e4f4f]/35"
        style={{
          borderColor: colorCoding ? `${style.color}44` : style.border,
          borderLeftWidth: 4,
          borderLeftColor: colorCoding ? style.color : style.border,
          backgroundColor: colorCoding ? `${style.tint}cc` : style.tint,
        }}
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
}: {
  title: string;
  hint?: string;
  items: PlanDayItem[];
  onOpen: (id: string) => void;
  colorCoding: boolean;
  momentumLabel: string | null;
  delayClass?: string;
}) {
  if (!items.length) return null;
  return (
    <div className={`plan-day-living-enter ${delayClass ?? ""}`}>
      <p className="text-lg font-semibold text-[#1f1c19]">{title}</p>
      {hint ? (
        <p className="mt-1 text-sm text-[#6b635a]">{hint}</p>
      ) : null}
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
};

/**
 * Living Board — Today's Focus · Ready When You Are · Being Held.
 */
export function PlanDayLivingBoard({
  partition,
  onOpen,
  emptyMessage = "Your day is open — Shari is holding the rest.",
  holdingTransparencyLine = null,
}: Props) {
  const colorCoding = useCategoryColorCoding();
  const total =
    partition.focus.length + partition.ready.length + partition.holdingCount;

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

  return (
    <div className="flex flex-col gap-6" data-testid="plan-day-living-board">
      <Section
        title="Today's Focus"
        hint="1–3 things that fit today — not the whole backlog."
        items={partition.focus}
        onOpen={onOpen}
        colorCoding={colorCoding}
        momentumLabel={partition.momentumLabel}
      />
      <Section
        title="Ready When You Are"
        hint="Nearby when you want them — not required now."
        items={partition.ready}
        onOpen={onOpen}
        colorCoding={colorCoding}
        momentumLabel={partition.momentumLabel}
        delayClass="plan-day-living-enter--delayed"
      />
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
