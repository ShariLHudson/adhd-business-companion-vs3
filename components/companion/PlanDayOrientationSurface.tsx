"use client";

import { useEffect, useState } from "react";
import type { PlanDayOrientationPresentation } from "@/lib/planMyDay/companionBrainClient/presentJudgment";
import { PlanDayMorningPresence } from "@/components/companion/PlanDayMorningPresence";

type Props = {
  presentation: PlanDayOrientationPresentation;
  onConfirm: () => void;
  onDecline: () => void;
  onOpenAdaptMyDay?: () => void;
};

type RevealStep = "arrival" | "presence" | "invitation" | "preview" | "confirm";

const REVEAL_MS: Record<RevealStep, number> = {
  arrival: 0,
  presence: 500,
  invitation: 1800,
  preview: 2400,
  confirm: 3000,
};

/**
 * Gateway Surface™ — Shari present, one observation, invitation, preview, one primary action.
 */
export function PlanDayOrientationSurface({
  presentation,
  onConfirm,
  onDecline,
  onOpenAdaptMyDay,
}: Props) {
  const [revealStep, setRevealStep] = useState<RevealStep>("arrival");

  useEffect(() => {
    const steps: RevealStep[] = [
      "arrival",
      "presence",
      "invitation",
      "preview",
      "confirm",
    ];
    const timers = steps.map((step) =>
      window.setTimeout(() => setRevealStep(step), REVEAL_MS[step]),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const reached = (step: RevealStep) =>
    Object.keys(REVEAL_MS).indexOf(step) <=
    Object.keys(REVEAL_MS).indexOf(revealStep);

  const showPreview =
    presentation.proposalPreview.length > 0 && !presentation.minimalSurface;

  return (
    <section
      className="plan-day-orientation companion-fade-in mx-auto w-full max-w-xl"
      data-testid="plan-day-orientation"
      data-day-mode={presentation.dayMode}
      data-minimal={presentation.minimalSurface ? "true" : "false"}
      aria-label="Morning orientation"
    >
      {reached("presence") ? (
        <div className="plan-day-reveal plan-day-reveal--presence plan-day-morning-presence-enter">
          <PlanDayMorningPresence presence={presentation.morningPresence} />
        </div>
      ) : (
        <div className="plan-day-arrival-pause min-h-[12rem]" aria-hidden />
      )}

      {reached("invitation") ? (
        <p
          className="plan-day-reveal plan-day-invitation mt-10 text-lg font-semibold leading-snug text-[#1f1c19] lg:text-xl"
          data-testid="plan-day-invitation"
        >
          {presentation.invitation}
        </p>
      ) : null}

      {showPreview && reached("preview") ? (
        <div
          className="plan-day-reveal plan-day-gateway-preview mt-5"
          data-testid="plan-day-proposal-preview"
        >
          <ol className="space-y-2 text-base leading-relaxed text-[#3d3630]">
            {presentation.proposalPreview.map((label, index) => (
              <li key={`${index}-${label}`} className="flex gap-2">
                <span
                  className="shrink-0 font-semibold tabular-nums text-[#1e4f4f]"
                  aria-hidden
                >
                  {index + 1}.
                </span>
                <span>{label}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {presentation.confirmPrompt &&
      reached("preview") &&
      showPreview ? (
        <p
          className="plan-day-reveal mt-5 text-base font-medium text-[#6b635a]"
          data-testid="plan-day-confirm-prompt"
        >
          {presentation.confirmPrompt}
        </p>
      ) : null}

      {reached("confirm") ? (
        <div
          className="plan-day-reveal plan-day-confirm mt-8"
          data-testid="plan-day-confirm-actions"
        >
          <button
            type="button"
            onClick={onConfirm}
            className="w-full rounded-xl bg-[#1e4f4f] px-6 py-3.5 text-base font-semibold text-white hover:bg-[#163a3a] sm:w-auto"
            data-testid="plan-day-confirm-primary"
            aria-label="Yes — This feels right"
          >
            {presentation.primaryConfirmLabel}
          </button>

          {!presentation.minimalSurface ? (
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              {onOpenAdaptMyDay ? (
                <button
                  type="button"
                  onClick={onOpenAdaptMyDay}
                  className="font-semibold text-[#1e4f4f] hover:underline"
                  data-testid="plan-day-confirm-adjust"
                  aria-label="Let's adjust it together — update Today's Reality"
                  title="Today's energy, capacity, or circumstances changed"
                >
                  {presentation.adjustTogetherLabel}
                </button>
              ) : null}
              <button
                type="button"
                onClick={onDecline}
                className="font-semibold text-[#9a8f82] hover:text-[#6b635a]"
                data-testid="plan-day-confirm-decline"
              >
                {presentation.deferLabel}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
