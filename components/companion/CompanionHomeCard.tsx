"use client";

import type { ArrivalIntelligence } from "@/lib/arrivalIntelligence";
import type { CompanionContinueOption } from "@/lib/companionLedContinue";
import { useCompanionPresence } from "@/lib/useCompanionPresence";
import { ShariPortrait } from "@/components/companion/ShariPortrait";

type CompanionHomeCardProps = {
  arrival: ArrivalIntelligence | null;
  onContinue: (option: CompanionContinueOption) => void;
};

function HomeOpeningLines({
  lead,
  question,
}: {
  lead: string | null;
  question: string | null;
}) {
  if (!lead && !question) return null;

  return (
    <p className="companion-home-opening-lines text-[1.125rem] leading-[1.7] text-[#2f261f] sm:text-[1.1875rem]">
      {lead ? <span className="font-medium">{lead}</span> : null}
      {lead && question ? " " : null}
      {question ? (
        <span className="font-normal text-[#4a4239]">{question}</span>
      ) : null}
    </p>
  );
}

function HomePresencePhoto({
  arrival,
  size = "standard",
}: {
  arrival: ArrivalIntelligence;
  size?: "intimate" | "standard";
}) {
  const presence = useCompanionPresence({
    calmHome: true,
    homeState: arrival.homeState,
  });

  return <ShariPortrait presence={presence} size={size} />;
}

/** State 1 — First Meeting: trust, one question, conversation already started. */
function FirstMeetingHome({ arrival }: { arrival: ArrivalIntelligence }) {
  const lead = arrival.welcomeLine;
  const question = arrival.inviteQuestion;

  return (
    <section
      className="companion-home-card companion-home-first-visit mx-auto flex w-full max-w-sm flex-col items-center px-5 pt-2 sm:pt-4"
      data-home-state="first-visit"
      aria-label="Companion home"
    >
      <div className="flex w-full flex-col items-center">
        <HomePresencePhoto arrival={arrival} size="intimate" />
        <div className="companion-home-opening -mt-5 w-full rounded-2xl border border-white/55 px-5 pb-5 pt-9 text-center shadow-[0_6px_28px_rgba(47,38,31,0.08)] backdrop-blur-md sm:px-6 sm:pb-5 sm:pt-10">
          <HomeOpeningLines lead={lead} question={question} />
        </div>
      </div>
    </section>
  );
}

/** State 2 — Returning Active: contextual opening, continuation, dynamic invite. */
function ReturningActiveHome({
  arrival,
  onContinue,
}: {
  arrival: ArrivalIntelligence;
  onContinue: (option: CompanionContinueOption) => void;
}) {
  return (
    <section
      className="companion-home-card companion-home-returning mx-auto flex w-full max-w-2xl flex-col items-center px-6 pt-6 sm:pt-8"
      data-home-state="returning-active"
      aria-label="Companion home"
    >
      <div className="w-full rounded-3xl border border-white/50 bg-white/72 px-6 py-6 shadow-[0_8px_32px_rgba(47,38,31,0.10)] backdrop-blur-md sm:px-8 sm:py-7">
        <div className="flex flex-col items-center gap-3 text-center">
          <HomePresencePhoto arrival={arrival} />

          <div className="max-w-md space-y-2">
            <p className="text-lg leading-relaxed text-[#2f261f]">
              {arrival.openingMessage}
            </p>
            {arrival.inviteQuestion ? (
              <p className="text-base leading-relaxed text-[#5c534a]">
                {arrival.inviteQuestion}
              </p>
            ) : null}
          </div>

          {arrival.continue.mode === "single" &&
          arrival.contextualButtonLabel ? (
            <button
              type="button"
              onClick={() => {
                if (arrival.continue.mode === "single") {
                  onContinue(arrival.continue.option);
                }
              }}
              className="mt-1 w-full max-w-xs rounded-2xl border border-[#c5e0e0] bg-[#f0f8f8] px-6 py-3 text-base font-semibold text-[#1e4f4f] transition-colors hover:bg-[#e6f4f4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
            >
              {arrival.contextualButtonLabel}
            </button>
          ) : null}

          {arrival.showContinueList && arrival.continue.mode === "choose" ? (
            <ul className="w-full max-w-sm space-y-2 text-left">
              {arrival.continue.options.map((option) => (
                <li key={option.id}>
                  <button
                    type="button"
                    onClick={() => onContinue(option)}
                    className="flex w-full items-center gap-2 rounded-xl border border-[#d7e8e8] bg-[#f5fafa] px-4 py-3 text-left text-base font-medium text-[#1e4f4f] transition-colors hover:bg-[#eaf4f4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
                  >
                    <span aria-hidden="true">•</span>
                    {option.title}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/** State 3 — Quiet Presence: simply here, no pressure, gentle invite. */
function QuietPresenceHome({ arrival }: { arrival: ArrivalIntelligence }) {
  return (
    <section
      className="companion-home-card companion-home-quiet mx-auto flex w-full max-w-sm flex-col items-center px-5 pt-2 sm:pt-4"
      data-home-state="quiet-presence"
      aria-label="Companion home"
    >
      <div className="flex w-full flex-col items-center">
        <HomePresencePhoto arrival={arrival} size="intimate" />
        <div className="companion-home-opening companion-home-opening-quiet -mt-5 w-full rounded-2xl border border-white/50 px-5 pb-5 pt-9 text-center shadow-[0_4px_22px_rgba(47,38,31,0.06)] backdrop-blur-md sm:px-6 sm:pb-5 sm:pt-10">
          <HomeOpeningLines
            lead={arrival.openingMessage}
            question={arrival.inviteQuestion}
          />
        </div>
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

  switch (arrival.homeState) {
    case "FIRST_VISIT":
      return <FirstMeetingHome arrival={arrival} />;
    case "RETURNING_ACTIVE":
      return <ReturningActiveHome arrival={arrival} onContinue={onContinue} />;
    case "QUIET_PRESENCE":
      return <QuietPresenceHome arrival={arrival} />;
  }
}
