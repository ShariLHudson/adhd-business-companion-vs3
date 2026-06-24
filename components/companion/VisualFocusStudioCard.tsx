"use client";

import type { VisualFocusStudioCard } from "@/lib/visualFocus/studioCards";

export function VisualFocusStudioCardView({
  card,
  onCreate,
}: {
  card: VisualFocusStudioCard;
  onCreate: () => void;
}) {
  const { accent } = card;

  return (
    <article
      className={`flex h-full flex-col overflow-hidden rounded-3xl border border-[#e7dfd4] border-t-4 bg-white shadow-sm ${accent.borderTop}`}
      data-testid={`visual-focus-studio-card-${card.mode}`}
    >
      <div className={`flex flex-1 flex-col px-5 pb-5 pt-5 ${accent.headerBg}`}>
        <div className="flex items-start gap-3">
          <span
            className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl ${accent.iconRing}`}
            aria-hidden
          >
            {card.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-[#1f1c19]">{card.title}</h3>
            {card.subtitle ? (
              <p className="mt-0.5 text-sm font-medium text-[#6b635a]">
                {card.subtitle}
              </p>
            ) : null}
            <p className="mt-2">
              <span className="inline-block rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-[#1e4f4f] ring-1 ring-[#e7dfd4]">
                Best for: {card.bestFor}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3 text-sm leading-relaxed">
          <p className="text-[#1f1c19]">
            <span className="font-semibold">What is this?</span> {card.whatItIs}
          </p>
          <p className="text-[#6b635a]">
            <span className="font-semibold text-[#1f1c19]">When to use it:</span>{" "}
            {card.whenToUse}
          </p>
          <div>
            <p className="font-semibold text-[#1f1c19]">You&apos;ll receive:</p>
            <ul className="mt-1.5 list-inside list-disc text-[#6b635a]">
              {card.youWillReceive.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {card.boundaryNote ? (
          <p className="mt-3 text-xs leading-relaxed text-[#9a8f82]">
            {card.boundaryNote}
          </p>
        ) : null}

        <button
          type="button"
          onClick={onCreate}
          className={`mt-4 w-full rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold sm:w-auto ${accent.actionBorder} ${accent.actionFg} ${accent.actionHover}`}
        >
          {card.actionLabel}
        </button>
      </div>
    </article>
  );
}
