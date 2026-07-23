"use client";

import type {
  ContinueJourneyDestinationId,
  ContinueYourJourneyModel,
} from "@/lib/strategyChamber/types";

/** Destinations with a live companion open path today. */
const LIVE_JOURNEY_DESTINATIONS: ReadonlySet<ContinueJourneyDestinationId> =
  new Set([
    "talk_it_out",
    "chamber_member",
    "board",
    "create",
    "project",
    "calendar",
    "plan_my_day",
    "rhythm",
    "reminder",
    "journal",
    "evidence_vault",
    "business_estate",
  ]);

type Props = {
  model: ContinueYourJourneyModel;
  onSelect: (destinationId: ContinueJourneyDestinationId) => void;
  onSeeMore?: () => void;
  className?: string;
  /** Override which destinations are live; defaults to current companion wiring. */
  liveDestinations?: ReadonlySet<ContinueJourneyDestinationId>;
};

/**
 * Universal contextual next-step surface — one recommendation + ≤2 options.
 */
export function ContinueYourJourney({
  model,
  onSelect,
  onSeeMore,
  className = "",
  liveDestinations = LIVE_JOURNEY_DESTINATIONS,
}: Props) {
  if (!model.recommended && model.secondary.length === 0) return null;

  function renderAction(
    destinationId: ContinueJourneyDestinationId,
    actionLabel: string,
    testId: string,
  ) {
    const live = liveDestinations.has(destinationId);
    if (!live) {
      return (
        <p
          className="mt-2 text-sm text-[#6b635a]"
          data-testid={`${testId}-unavailable`}
        >
          This path is not fully connected yet — ask Shari when you are ready,
          and she can help you continue without losing this decision.
        </p>
      );
    }
    return (
      <button
        type="button"
        className="mt-3 rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-base font-semibold text-white hover:bg-[#163d3d]"
        onClick={() => onSelect(destinationId)}
        data-testid={testId}
      >
        {actionLabel}
      </button>
    );
  }

  return (
    <section
      className={`rounded-2xl border border-[#d4cdc3] bg-white/95 p-4 ${className}`}
      data-testid="continue-your-journey"
      aria-label="Continue your journey"
    >
      {model.recommended ? (
        <div data-testid="continue-your-journey-recommended">
          <p className="text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
            Recommended next step
          </p>
          <p className="mt-2 text-lg font-semibold text-[#1f1c19]">
            {model.recommended.title}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-[#4b463f]">
            {model.recommended.benefit}
          </p>
          {renderAction(
            model.recommended.destinationId,
            model.recommended.actionLabel,
            `continue-journey-${model.recommended.destinationId}`,
          )}
        </div>
      ) : null}

      {model.secondary.length > 0 ? (
        <ul
          className={
            model.recommended
              ? "mt-4 flex flex-col gap-2 border-t border-[#e7dfd4] pt-3"
              : "flex flex-col gap-2"
          }
          data-testid="continue-your-journey-secondary"
        >
          {model.secondary.map((opt) => {
            const live = liveDestinations.has(opt.destinationId);
            return (
              <li key={opt.destinationId}>
                {live ? (
                  <button
                    type="button"
                    className="w-full rounded-xl border border-[#e7dfd4] bg-[#faf8f5] px-3 py-2.5 text-left hover:border-[#1e4f4f]/40"
                    onClick={() => onSelect(opt.destinationId)}
                    data-testid={`continue-journey-secondary-${opt.destinationId}`}
                  >
                    <span className="block text-sm font-semibold text-[#1f1c19]">
                      {opt.title}
                    </span>
                    <span className="mt-0.5 block text-sm text-[#6b635a]">
                      {opt.benefit}
                    </span>
                  </button>
                ) : (
                  <div
                    className="w-full rounded-xl border border-dashed border-[#e7dfd4] bg-[#faf8f5] px-3 py-2.5 text-left opacity-80"
                    data-testid={`continue-journey-secondary-${opt.destinationId}-unavailable`}
                  >
                    <span className="block text-sm font-semibold text-[#1f1c19]">
                      {opt.title}
                    </span>
                    <span className="mt-0.5 block text-sm text-[#6b635a]">
                      {opt.benefit} Not fully connected yet — ask Shari when ready.
                    </span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}

      {model.showSeeMore && onSeeMore ? (
        <button
          type="button"
          className="mt-3 text-sm font-semibold text-[#1e4f4f] hover:underline"
          onClick={onSeeMore}
          data-testid="continue-your-journey-see-more"
        >
          See more ways to continue
        </button>
      ) : null}
    </section>
  );
}
