"use client";

import { useEffect, useState } from "react";
import { CreateDraftResumeList } from "@/components/companion/CreateDraftResumeList";
import { CreateEstateRoomShell } from "@/components/companion/CreateEstateRoomShell";
import {
  CREATE_ESTATE_EXPLANATION,
  CREATE_ESTATE_HOW_DO_I,
  CREATE_ESTATE_START_CHOICES,
  CREATE_ESTATE_WINDOW_TITLE,
  CREATE_VS_PROJECTS_CUE,
  type CreateEstateStartChoiceId,
} from "@/lib/createEstate/copy";
import { CREATE_LAUNCHER_TYPE_OPTIONS } from "@/lib/createLauncherTypes";
import { PLAN_MY_DAY_MORNING_COPY } from "@/lib/planMyDay/morningRoom";
import { useDismissibleWindow } from "@/lib/windowDismiss";

const CARD =
  "rounded-2xl border border-[#e7dfd4] bg-white/90 px-4 py-4 text-left transition-colors";
const CARD_SELECTED =
  "rounded-2xl border-2 border-[#1e4f4f] bg-white px-4 py-4 text-left shadow-sm";

type Props = {
  onBack: () => void;
  registerBack?: (fn: (() => boolean) | null) => void;
  /** Fresh intentional create — no stale resume. */
  onStartWithNeed: () => void;
  /** Browse → pick a type (or Strategy Library create). */
  onBrowseType: (typeLabel: string) => void;
  onOpenStrategyCreate: () => void;
  onOpenSavedDraft: (id: string) => void;
  onRenameDraft: (id: string, title: string) => void;
  onDuplicateDraft: (id: string) => void;
  onDeleteDraft: (id: string) => void;
};

function SharedHowDoI() {
  const [open, setOpen] = useState(false);
  return (
    <div className="plan-day-how-do-i" data-testid="create-estate-how-do-i">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="plan-day-how-do-i__toggle inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e4f4f] transition-colors hover:text-[#163c3c] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
        aria-expanded={open}
        data-testid="create-estate-how-do-i-toggle"
      >
        How Do I…
        <span aria-hidden="true" className="text-xs font-bold">
          {open ? "−" : "+"}
        </span>
      </button>
      {open ? (
        <p
          className="plan-day-how-do-i__body mt-2 max-w-xl whitespace-pre-line text-sm leading-relaxed text-[#4b463f]"
          data-testid="create-estate-how-do-i-body"
        >
          {CREATE_ESTATE_HOW_DO_I}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Welcome Home → My Work → Create
 * Estate entrance: orientation + three calm choices; Universal Create owns making.
 */
export function CreateEstateEntrancePanel({
  onBack,
  registerBack,
  onStartWithNeed,
  onBrowseType,
  onOpenStrategyCreate,
  onOpenSavedDraft,
  onRenameDraft,
  onDuplicateDraft,
  onDeleteDraft,
}: Props) {
  const [activeChoice, setActiveChoice] =
    useState<CreateEstateStartChoiceId | null>(null);

  useDismissibleWindow({
    open: true,
    onClose: onBack,
    closeOnEscape: true,
  });

  useEffect(() => {
    if (!registerBack) return;
    registerBack(() => {
      if (activeChoice) {
        setActiveChoice(null);
        return true;
      }
      return false;
    });
    return () => registerBack(null);
  }, [registerBack, activeChoice]);

  return (
    <CreateEstateRoomShell onOutsideDismiss={onBack}>
      <div
        className="plan-day-morning-note flex flex-col gap-3 pb-10"
        data-testid="create-estate-entrance"
        data-active-choice={activeChoice ?? "none"}
      >
        <button
          type="button"
          className="plan-day-morning-note__previous"
          onClick={onBack}
          data-testid="app-back-button"
          aria-label="Previous Screen"
        >
          <span aria-hidden="true">←</span>
          <span>{PLAN_MY_DAY_MORNING_COPY.previousScreen}</span>
        </button>

        <h1
          className="plan-day-morning-note__title mt-2"
          data-testid="create-estate-title"
        >
          {CREATE_ESTATE_WINDOW_TITLE}
        </h1>

        <p
          className="mt-1 max-w-xl text-base leading-relaxed text-[#4b463f]"
          data-testid="create-estate-explanation"
        >
          {CREATE_ESTATE_EXPLANATION}
        </p>
        <p
          className="max-w-xl text-sm leading-relaxed text-[#6b635a]"
          data-testid="create-vs-projects-cue"
        >
          {CREATE_VS_PROJECTS_CUE}
        </p>

        <SharedHowDoI />

        <div
          className="mt-2 grid gap-3"
          role="group"
          aria-label="How to begin Create"
          data-testid="create-estate-start-choices"
        >
          {CREATE_ESTATE_START_CHOICES.map((choice) => {
            const selected = activeChoice === choice.id;
            return (
              <button
                key={choice.id}
                type="button"
                className={selected ? CARD_SELECTED : CARD}
                data-testid={`create-estate-choice-${choice.id}`}
                aria-pressed={selected}
                onClick={() => {
                  if (choice.id === "start") {
                    onStartWithNeed();
                    return;
                  }
                  setActiveChoice(choice.id);
                }}
              >
                <span className="block text-lg font-semibold text-[#1f1c19]">
                  {choice.label}
                </span>
                <span className="mt-2 block text-base leading-relaxed text-[#4b463f]">
                  {choice.description}
                </span>
              </button>
            );
          })}
        </div>

        {activeChoice === "browse" ? (
          <div
            className="mt-4 flex flex-col gap-2"
            data-testid="create-estate-browse-types"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-[#6b635a]">
              Things you can create
            </p>
            <button
              type="button"
              className={CARD}
              data-testid="create-estate-browse-strategy"
              onClick={onOpenStrategyCreate}
            >
              <span className="block text-base font-semibold text-[#1f1c19]">
                Strategy
              </span>
              <span className="mt-1 block text-sm text-[#4b463f]">
                Opens Strategy Library create mode under Get Advice — not a
                second strategy engine.
              </span>
            </button>
            <ul className="flex flex-col gap-2">
              {CREATE_LAUNCHER_TYPE_OPTIONS.filter((t) => t !== "Custom").map(
                (label) => (
                  <li key={label}>
                    <button
                      type="button"
                      className="w-full rounded-xl border border-[#d4cdc3] bg-white px-4 py-3 text-left text-base font-semibold text-[#1f1c19] hover:border-[#1e4f4f]/40"
                      data-testid={`create-estate-type-${label}`}
                      onClick={() => onBrowseType(label)}
                    >
                      {label}
                    </button>
                  </li>
                ),
              )}
            </ul>
          </div>
        ) : null}

        {activeChoice === "continue" ? (
          <div className="mt-4" data-testid="create-estate-continue">
            <CreateDraftResumeList
              onOpen={onOpenSavedDraft}
              onRename={onRenameDraft}
              onDuplicate={onDuplicateDraft}
              onDelete={onDeleteDraft}
            />
            <p className="mt-3 text-sm text-[#6b635a]">
              If nothing appears here, you do not have a saved creation to
              resume yet — start fresh above.
            </p>
          </div>
        ) : null}
      </div>
    </CreateEstateRoomShell>
  );
}
