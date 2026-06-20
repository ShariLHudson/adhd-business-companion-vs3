"use client";

import { useEffect, useState } from "react";
import { BackButton } from "@/components/companion/BackButton";
import { ModalSheet } from "@/components/companion/ModalSheet";
import { PlanDayAddForm } from "@/components/companion/PlanDayAddForm";
import { PlanDayItemDetail } from "@/components/companion/PlanDayItemDetail";
import {
  addQuickPlanItem,
  currentFocusItem,
  isPlanItemActive,
  loadTodayPlanItems,
  PLAN_MY_DAY_UPDATED,
  planItemMetaLabel,
  planItemStyle,
  type PlanDayItem,
  type QuickPlanItemInput,
} from "@/lib/planMyDay";
import { useCategoryColorCoding } from "@/lib/useCategoryColorCoding";

type Props = {
  open: boolean;
  onClose: () => void;
  onOpenFull: (itemId?: string) => void;
};

export function PlanMyDayQuickDrawer({ open, onClose, onOpenFull }: Props) {
  const [items, setItems] = useState<PlanDayItem[]>([]);
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const colorCoding = useCategoryColorCoding();

  useEffect(() => {
    if (open) {
      setItems(loadTodayPlanItems());
      setOpenItemId(null);
    }
  }, [open]);

  useEffect(() => {
    const sync = () => setItems(loadTodayPlanItems());
    window.addEventListener(PLAN_MY_DAY_UPDATED, sync);
    return () => window.removeEventListener(PLAN_MY_DAY_UPDATED, sync);
  }, []);

  const active = items.filter(isPlanItemActive);
  const focus = currentFocusItem(items);
  const openItem = openItemId
    ? items.find((i) => i.id === openItemId) ?? null
    : null;

  function handleAdd(input: QuickPlanItemInput) {
    setItems(addQuickPlanItem(input));
  }

  return (
    <ModalSheet open={open} onClose={onClose} title="Plan My Day">
      <div className="flex flex-col gap-4 px-5 pb-8">
        <p className="text-sm leading-relaxed text-[#6b635a]">
          Tap an item to see details — nothing disappears from a simple click.
        </p>

        {openItem ? (
          <>
            <BackButton
              onClick={() => setOpenItemId(null)}
              label="Back"
              size="compact"
            />
            <PlanDayItemDetail
              key={openItem.id}
              item={openItem}
              items={items}
              onItemsChange={setItems}
              onClose={() => setOpenItemId(null)}
              onOpenNextItem={(id) => setOpenItemId(id)}
              hideClose
              compact
            />
          </>
        ) : (
          <>
            {focus ? (
              <button
                type="button"
                onClick={() => setOpenItemId(focus.id)}
                className="rounded-xl border border-[#1e4f4f]/25 bg-[#f0f8f8] px-3 py-2.5 text-left hover:border-[#1e4f4f]/45"
              >
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#1e4f4f]">
                  Up next
                </p>
                <p className="mt-0.5 text-base font-semibold text-[#1f1c19]">
                  {focus.title}
                </p>
              </button>
            ) : null}

            <PlanDayAddForm onAdd={handleAdd} compact />

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
                Today ({active.length})
              </p>
              <ul className="mt-2 flex max-h-[min(50vh,320px)] flex-col gap-2 overflow-y-auto">
                {active.length === 0 ? (
                  <li className="rounded-xl border border-dashed border-[#d4cdc3] bg-white/80 px-3 py-4 text-sm text-[#6b635a]">
                    Nothing on the plan yet — add something above.
                  </li>
                ) : (
                  active.map((item) => {
                    const style = planItemStyle(item, colorCoding);
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => setOpenItemId(item.id)}
                          className="flex w-full items-start gap-3 rounded-xl border bg-white px-3 py-2.5 text-left transition-colors hover:border-[#1e4f4f]/35"
                          style={{
                            borderLeftWidth: 4,
                            borderLeftColor: colorCoding
                              ? style.color
                              : style.border,
                            borderColor: colorCoding
                              ? `${style.color}33`
                              : style.border,
                          }}
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block text-base text-[#1f1c19]">
                              {item.title}
                            </span>
                            <span className="text-xs text-[#6b635a]">
                              {planItemMetaLabel(item, colorCoding)}
                            </span>
                          </span>
                          <span className="shrink-0 text-xs text-[#9a8f82]" aria-hidden>
                            →
                          </span>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          </>
        )}

        <button
          type="button"
          onClick={() => {
            const itemId = openItemId ?? undefined;
            onClose();
            onOpenFull(itemId);
          }}
          className="w-full rounded-xl border border-[#1e4f4f]/35 bg-white px-4 py-3 text-base font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
        >
          Open Plan My Day →
        </button>
      </div>
    </ModalSheet>
  );
}
