"use client";

import type {
  PlanAdjustmentPresentation,
  PlanSwapOption,
} from "@/lib/planMyDay/companionBrainClient/planAdjustment";
import { PLAN_ADJUSTMENT_REALITY_LINK } from "@/lib/planMyDay/companionBrainClient/planAdjustment";

type Props = {
  presentation: PlanAdjustmentPresentation;
  onSwap: (swapOutId: string, option: PlanSwapOption) => void;
  onHide: (itemId: string) => void;
  onAddExtra: (option: PlanSwapOption) => void;
  onOpenTodaysReality: () => void;
  onClose: () => void;
};

export function PlanDayPlanAdjustment({
  presentation,
  onSwap,
  onHide,
  onAddExtra,
  onOpenTodaysReality,
  onClose,
}: Props) {
  const hasOffers = presentation.offers.some((o) => o.alternatives.length > 0);
  const hasExtras = presentation.extras.length > 0;

  return (
    <div
      className="rounded-xl border border-[#e7dfd4] bg-[#faf7f2]/90 px-4 py-4"
      role="region"
      aria-label="Adjust today's plan"
      data-testid="plan-day-plan-adjustment"
    >
      <p className="text-base leading-relaxed text-[#4b463f]">
        {presentation.intro}
      </p>

      {hasOffers ? (
        <div className="mt-4 flex flex-col gap-4">
          {presentation.offers.map((offer) => (
            <div
              key={offer.currentItemId}
              className="rounded-lg border border-[#e7dfd4] bg-white px-3 py-3"
            >
              <p className="text-sm font-semibold text-[#6b635a]">
                Instead of:{" "}
                <span className="text-[#1f1c19]">{offer.currentTitle}</span>
              </p>
              {offer.alternatives.length > 0 ? (
                <ul className="mt-2 flex flex-col gap-2">
                  {offer.alternatives.map((alt) => (
                    <li key={alt.id}>
                      <button
                        type="button"
                        onClick={() => onSwap(offer.currentItemId, alt)}
                        className="flex w-full flex-col rounded-lg border border-[#e7dfd4] px-3 py-2 text-left hover:border-[#1e4f4f]/35 hover:bg-[#f0f8f8]/50"
                        data-testid="plan-swap-option"
                      >
                        <span className="text-base font-semibold text-[#1f1c19]">
                          {alt.title}
                        </span>
                        <span className="text-xs font-medium text-[#9a8f82]">
                          {alt.sourceLabel}
                        </span>
                        <span className="mt-0.5 text-sm text-[#6b635a]">
                          {alt.reason}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-[#6b635a]">
                  No swaps on the board right now — try an extra below.
                </p>
              )}
              <button
                type="button"
                onClick={() => onHide(offer.currentItemId)}
                className="mt-2 text-sm font-semibold text-[#9a8f82] hover:text-[#6b635a] hover:underline"
              >
                Hide for today
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {hasExtras ? (
        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
            Other possibilities
          </p>
          <ul className="mt-2 flex flex-col gap-2">
            {presentation.extras.map((alt) => (
              <li key={alt.id}>
                <button
                  type="button"
                  onClick={() => onAddExtra(alt)}
                  className="w-full rounded-lg border border-dashed border-[#c9bfb0] px-3 py-2 text-left hover:bg-white"
                >
                  <span className="text-base font-semibold text-[#1f1c19]">
                    + {alt.title}
                  </span>
                  <span className="ml-2 text-xs text-[#9a8f82]">
                    {alt.sourceLabel}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!hasOffers && !hasExtras ? (
        <p className="mt-3 text-sm text-[#6b635a]">
          Your board is open — add something from the form below, or pull from
          the parking lot in Flexible Planning.
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#e7dfd4] pt-4">
        <button
          type="button"
          onClick={onOpenTodaysReality}
          className="text-sm font-semibold text-[#1e4f4f] hover:underline"
          data-testid="plan-adjust-open-reality"
        >
          {PLAN_ADJUSTMENT_REALITY_LINK}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-semibold text-[#9a8f82] hover:underline"
        >
          Done for now
        </button>
      </div>
    </div>
  );
}
