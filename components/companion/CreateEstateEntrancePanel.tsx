"use client";

import { useEffect, useState } from "react";
import { CreateCatalogPicker } from "@/components/companion/CreateCatalogPicker";
import { CreateDraftResumeList } from "@/components/companion/CreateDraftResumeList";
import { CreateEstateRoomShell } from "@/components/companion/CreateEstateRoomShell";
import {
  CREATE_ESTATE_CONTINUE_HEADING,
  CREATE_ESTATE_EXPLANATION,
  CREATE_ESTATE_HOW_DO_I,
  CREATE_ESTATE_PICKER_HEADING,
  CREATE_ESTATE_WINDOW_TITLE,
  CREATE_VS_PROJECTS_CUE,
} from "@/lib/createEstate/copy";
import type { CreateCatalogItem } from "@/lib/createCatalog";
import { PLAN_MY_DAY_MORNING_COPY } from "@/lib/planMyDay/morningRoom";
import { useDismissibleWindow } from "@/lib/windowDismiss";

const CARD =
  "rounded-2xl border border-[#e7dfd4] bg-white/90 px-4 py-4 text-left transition-colors";

type Props = {
  onBack: () => void;
  registerBack?: (fn: (() => boolean) | null) => void;
  /** Select a catalog creation type — opens its workflow immediately. */
  onSelectCreationType: (item: CreateCatalogItem) => void;
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
 * Categorized picker + Continue a Saved Creation (149–151).
 */
export function CreateEstateEntrancePanel({
  onBack,
  registerBack,
  onSelectCreationType,
  onOpenStrategyCreate,
  onOpenSavedDraft,
  onRenameDraft,
  onDuplicateDraft,
  onDeleteDraft,
}: Props) {
  useDismissibleWindow({
    open: true,
    onClose: onBack,
    closeOnEscape: true,
  });

  useEffect(() => {
    if (!registerBack) return;
    registerBack(() => false);
    return () => registerBack(null);
  }, [registerBack]);

  return (
    <CreateEstateRoomShell onOutsideDismiss={onBack}>
      <div
        className="plan-day-morning-note flex flex-col gap-3 pb-10"
        data-testid="create-estate-entrance"
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

        <section
          className="mt-3 flex flex-col gap-3"
          data-testid="create-estate-picker"
          aria-labelledby="create-estate-picker-heading"
        >
          <h2
            id="create-estate-picker-heading"
            className="text-lg font-semibold text-[#1f1c19]"
          >
            {CREATE_ESTATE_PICKER_HEADING}
          </h2>
          <CreateCatalogPicker onSelect={onSelectCreationType} />
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
              Opens Strategy Library create mode under Get Advice — not a second
              strategy engine.
            </span>
          </button>
        </section>

        <section
          className="mt-6"
          data-testid="create-estate-continue"
          aria-labelledby="create-estate-continue-heading"
        >
          <h2
            id="create-estate-continue-heading"
            className="text-lg font-semibold text-[#1f1c19]"
          >
            {CREATE_ESTATE_CONTINUE_HEADING}
          </h2>
          <div className="mt-3">
            <CreateDraftResumeList
              onOpen={onOpenSavedDraft}
              onRename={onRenameDraft}
              onDuplicate={onDuplicateDraft}
              onDelete={onDeleteDraft}
            />
          </div>
          <p className="mt-3 text-sm text-[#6b635a]">
            If nothing appears here, you do not have a saved creation to resume
            yet — choose a type above.
          </p>
        </section>
      </div>
    </CreateEstateRoomShell>
  );
}
