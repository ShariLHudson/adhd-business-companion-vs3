"use client";

import { useState } from "react";
import {
  coachFocusOptions,
  coachFocusPrompt,
  coachNeedHasFocusStep,
  PROJECT_COACH_MORE_NEEDS,
  PROJECT_COACH_PRIMARY_NEEDS,
  type ProjectCoachNeed,
  type ProjectCoachSelection,
} from "@/lib/projectCoachChoices";
import { AppBackButton } from "@/components/companion/AppBackButton";

const btnClass =
  "rounded-xl border border-[#1e4f4f]/25 bg-white px-3 py-2 text-sm font-semibold text-[#1e4f4f] transition-colors hover:border-[#1e4f4f] hover:bg-white text-left";

export function ProjectCoachTopicPicker({
  onSelect,
  onDismiss,
}: {
  onSelect: (selection: ProjectCoachSelection) => void;
  onDismiss?: () => void;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [pendingNeed, setPendingNeed] = useState<ProjectCoachNeed | null>(null);

  function pickNeed(need: ProjectCoachNeed) {
    if (coachNeedHasFocusStep(need)) {
      setPendingNeed(need);
      return;
    }
    onSelect({ need });
  }

  function pickFocus(focus: ProjectCoachSelection["focus"]) {
    if (!pendingNeed || !focus) return;
    onSelect({ need: pendingNeed, focus });
    setPendingNeed(null);
  }

  function backToNeeds() {
    setPendingNeed(null);
  }

  if (pendingNeed) {
    const options = coachFocusOptions(pendingNeed);
    return (
      <div className="mt-3 rounded-2xl border border-[#1e4f4f]/20 bg-[#f0f5f5]/80 p-3">
        <p className="mb-2 text-sm font-medium text-[#1f1c19]">
          {coachFocusPrompt(pendingNeed)}
        </p>
        <ul className="flex flex-col gap-1.5">
          {options.map((opt) => (
            <li key={opt.id}>
              <button
                type="button"
                onClick={() => pickFocus(opt.id)}
                className={`${btnClass} w-full`}
              >
                • {opt.label}
              </button>
            </li>
          ))}
        </ul>
        <AppBackButton
          destination="What you need"
          onBack={backToNeeds}
          size="compact"
          className="mt-2"
        />
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-2xl border border-[#1e4f4f]/20 bg-[#f0f5f5]/80 p-3">
      <p className="mb-2 text-sm font-medium text-[#1f1c19]">
        What kind of help do you need right now?
      </p>
      <div className="flex flex-wrap gap-2">
        {PROJECT_COACH_PRIMARY_NEEDS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => pickNeed(t.id)}
            className={btnClass}
          >
            <span aria-hidden="true">{t.emoji} </span>
            {t.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setMoreOpen((o) => !o)}
          aria-expanded={moreOpen}
          className={btnClass}
        >
          <span aria-hidden="true">▼ </span>
          More
        </button>
      </div>
      {moreOpen ? (
        <div className="companion-fade-in mt-2 flex flex-wrap gap-2 border-t border-[#1e4f4f]/10 pt-2">
          {PROJECT_COACH_MORE_NEEDS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => pickNeed(t.id)}
              className={btnClass}
            >
              <span aria-hidden="true">{t.emoji} </span>
              {t.label}
            </button>
          ))}
        </div>
      ) : null}
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="mt-2 text-xs font-semibold text-[#9a8f82] hover:text-[#6b635a]"
        >
          Dismiss
        </button>
      ) : null}
    </div>
  );
}
