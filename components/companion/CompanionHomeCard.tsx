"use client";

import type { ArrivalIntelligence } from "@/lib/arrivalIntelligence";
import type { CompanionContinueOption } from "@/lib/companionLedContinue";
import { ShariPortrait } from "@/components/companion/ShariPortrait";
import { useCompanionPresence } from "@/lib/useCompanionPresence";

type CompanionHomeCardProps = {
  arrival: ArrivalIntelligence | null;
  onContinue: (option: CompanionContinueOption) => void;
};

function homeLineClass(tone: "primary" | "secondary"): string {
  return tone === "secondary"
    ? "companion-home-returning__line companion-home-returning__line--secondary"
    : "companion-home-returning__line companion-home-returning__line--primary";
}

function buildAccessibilityLabel(arrival: ArrivalIntelligence): string {
  return [arrival.openingMessage, arrival.inviteQuestion]
    .filter(Boolean)
    .join(" ");
}

/** Returning Active — contextual opening with soft continuation. */
function ReturningActiveHome({
  arrival,
  onContinue,
}: {
  arrival: ArrivalIntelligence;
  onContinue: (option: CompanionContinueOption) => void;
}) {
  const presence = useCompanionPresence({
    calmHome: true,
    homeState: arrival.homeState,
    presenceSurface: "chat-returning",
  });

  const lines = [
    { text: arrival.openingMessage, tone: "primary" as const },
    ...(arrival.inviteQuestion
      ? [{ text: arrival.inviteQuestion, tone: "secondary" as const }]
      : []),
  ].filter((line) => line.text);

  return (
    <section
      className="companion-home-card companion-home-returning mx-auto flex w-full max-w-md flex-col items-center px-5 pt-4 sm:pt-6"
      data-home-state="returning-active"
      aria-label={buildAccessibilityLabel(arrival)}
    >
      <div className="companion-home-returning__moment">
        <div className="companion-home-returning__portrait">
          <ShariPortrait presence={presence} size="companion" alt="" />
        </div>
        <div className="companion-home-returning__copy">
          {lines.map((line, index) => (
            <p key={`${line.text}-${index}`} className={homeLineClass(line.tone)}>
              {line.text}
            </p>
          ))}
        </div>
      </div>

      <div className="companion-home-continue-actions">
        {arrival.continue.mode === "single" && arrival.contextualButtonLabel ? (
          <button
            type="button"
            onClick={() => {
              if (arrival.continue.mode === "single") {
                onContinue(arrival.continue.option);
              }
            }}
            className="w-full rounded-2xl border border-[#c5e0e0] bg-[#f0f8f8]/90 px-6 py-3 text-base font-semibold text-[#1e4f4f] transition-colors hover:bg-[#e6f4f4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
          >
            {arrival.contextualButtonLabel}
          </button>
        ) : null}

        {arrival.showContinueList && arrival.continue.mode === "choose" ? (
          <ul className="w-full space-y-2 text-left">
            {arrival.continue.options.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  onClick={() => onContinue(option)}
                  className="flex w-full items-center gap-2 rounded-xl border border-[#d7e8e8] bg-[#f5fafa]/90 px-4 py-3 text-left text-base font-medium text-[#1e4f4f] transition-colors hover:bg-[#eaf4f4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
                >
                  <span aria-hidden="true">•</span>
                  {option.title}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

export function CompanionHomeCard({ arrival, onContinue }: CompanionHomeCardProps) {
  if (!arrival) {
    return (
      <section
        className="companion-home-card mx-auto flex w-full max-w-sm flex-col items-center px-5 pt-4 sm:pt-6"
        aria-label="Companion home"
      >
        <div className="h-28 w-full animate-pulse rounded-2xl bg-white/40 motion-reduce:animate-none" />
      </section>
    );
  }

  if (arrival.homeState === "RETURNING_ACTIVE") {
    return <ReturningActiveHome arrival={arrival} onContinue={onContinue} />;
  }

  return null;
}
