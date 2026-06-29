"use client";

import type { ArrivalIntelligence } from "@/lib/arrivalIntelligence";
import type { CompanionContinueOption } from "@/lib/companionLedContinue";
import { homeStateDataAttr } from "@/lib/arrivalIntelligence";

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
  return [
    arrival.greetingHeadline,
    arrival.openingMessage,
    arrival.greetingBody,
    arrival.inviteQuestion,
  ]
    .filter(Boolean)
    .join(" ");
}

function openingLines(arrival: ArrivalIntelligence) {
  const primary =
    arrival.greetingHeadline ||
    arrival.openingMessage ||
    arrival.welcomeLine ||
    "";
  const lines: { text: string; tone: "primary" | "secondary" }[] = [];
  if (primary) lines.push({ text: primary, tone: "primary" });
  if (arrival.greetingBody) {
    lines.push({ text: arrival.greetingBody, tone: "secondary" });
  }
  if (arrival.inviteQuestion) {
    lines.push({ text: arrival.inviteQuestion, tone: "secondary" });
  }
  return lines;
}

/** Calm home opening — greeting in the open window area, no portrait circle. */
function CalmHomeOpening({
  arrival,
  onContinue,
}: {
  arrival: ArrivalIntelligence;
  onContinue: (option: CompanionContinueOption) => void;
}) {
  const lines = openingLines(arrival);

  return (
    <section
      className="companion-home-card companion-home-returning"
      data-home-state={homeStateDataAttr(arrival.homeState)}
      aria-label={buildAccessibilityLabel(arrival)}
    >
      <div className="companion-home-returning__moment">
        <div className="companion-home-returning__copy">
          {lines.map((line, index) => (
            <p key={`${line.text}-${index}`} className={homeLineClass(line.tone)}>
              {line.text}
            </p>
          ))}
        </div>
      </div>

      {arrival.homeState === "RETURNING_ACTIVE" ? (
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
      ) : null}
    </section>
  );
}

export function CompanionHomeCard({ arrival, onContinue }: CompanionHomeCardProps) {
  if (!arrival) {
    return (
      <section
        className="companion-home-card companion-home-returning"
        aria-label="Companion home"
      >
        <div className="companion-home-returning__moment">
          <div className="h-16 w-3/5 animate-pulse rounded-xl bg-white/40 motion-reduce:animate-none" />
        </div>
      </section>
    );
  }

  return <CalmHomeOpening arrival={arrival} onContinue={onContinue} />;
}
