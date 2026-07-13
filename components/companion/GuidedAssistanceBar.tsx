"use client";

import { useState } from "react";
import {
  acceptExpertInvite,
  clearExpertInvite,
  formatExpertJoinedBanner,
  getFieldHelpEntry,
  GUIDED_ASSISTANCE_MAY_AUTO_NAVIGATE,
  GUIDED_ASSISTANCE_MAY_AUTO_OPEN_CHAMBER,
  GUIDED_ASSISTANCE_MAY_AUTO_SAVE,
  helpActionToMode,
  writeExpertSessionPrompt,
  type FieldHelpAction,
  type ExpertInviteState,
} from "@/lib/profile/fieldHelpRegistry";
import {
  buildBusinessEstateFieldHelpContext,
  buildPeopleIHelpFieldHelpContext,
  formatGuidedFieldHelpPrompt,
  requestGuidedFieldHelp,
} from "@/lib/profile/guidedFieldHelp";
import type { BusinessEstateSectionId } from "@/lib/profile/businessEstateProfile";
import { getPeopleIHelpGuidedField } from "@/lib/profile/peopleIHelpGuidedFields";

type Props = {
  fieldPath: string;
  currentValue?: string;
  /** Called when I'm not sure should open an inline guided panel */
  onImNotSureContinue?: (opener: string) => void;
  /** Optional: Business Estate section for help context builder */
  estateSectionId?: BusinessEstateSectionId;
  estateFieldKey?: string;
  className?: string;
};

const ACTION_LABELS: Record<FieldHelpAction, string> = {
  explain_this: "Explain this",
  show_examples: "Show me examples",
  help_me_choose: "Help me choose",
  help_me_develop: "Help me develop this",
  research_with_shari: "Research with Shari",
  ask_an_expert: "Need Another Perspective?",
};

/**
 * Universal help actions for Business Estate + People I Help.
 * Never auto-saves, auto-navigates, or opens Chamber/Boardroom.
 */
export function GuidedAssistanceBar({
  fieldPath,
  currentValue = "",
  onImNotSureContinue,
  estateSectionId,
  estateFieldKey,
  className = "",
}: Props) {
  const entry = getFieldHelpEntry(fieldPath);
  const peopleMeta = fieldPath.startsWith("people-i-help.")
    ? getPeopleIHelpGuidedField(fieldPath.replace("people-i-help.", ""))
    : undefined;

  const [openWhy, setOpenWhy] = useState(false);
  const [openShari, setOpenShari] = useState(false);
  const [openExamples, setOpenExamples] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [expertOffer, setExpertOffer] = useState(false);
  const [expertBanner, setExpertBanner] = useState<ExpertInviteState | null>(
    null,
  );

  if (!entry) return null;

  function fire(action: FieldHelpAction) {
    if (action === "ask_an_expert") {
      setExpertOffer(true);
      setNotice("Would you like another perspective?");
      return;
    }

    const mode = helpActionToMode(action);
    if (estateSectionId && estateFieldKey) {
      const ctx = buildBusinessEstateFieldHelpContext({
        sectionId: estateSectionId,
        fieldKey: estateFieldKey,
        helpMode: mode,
        currentValue,
      });
      if (ctx) {
        requestGuidedFieldHelp(ctx);
        if (typeof window !== "undefined") {
          (
            window as unknown as { __lastGuidedFieldHelpPrompt?: string }
          ).__lastGuidedFieldHelpPrompt = formatGuidedFieldHelpPrompt(ctx);
        }
      }
    } else {
      const ctx = buildPeopleIHelpFieldHelpContext({
        fieldKey: fieldPath.replace("people-i-help.", ""),
        helpMode: mode,
        currentValue,
      });
      requestGuidedFieldHelp(ctx);
    }

    if (action === "show_examples") setOpenExamples(true);
    if (action === "explain_this") {
      setOpenWhy(true);
      setOpenShari(true);
    }
    setNotice(
      "Shari has this field context. Nothing is saved until you approve a draft. You stay right here.",
    );
  }

  function handleImNotSure() {
    const opener = entry!.imNotSureOpener;
    setNotice(opener);
    onImNotSureContinue?.(opener);
    fire(entry!.defaultHelpAction);
  }

  function acceptExpert() {
    const invite = acceptExpertInvite(fieldPath);
    if (!invite) {
      setNotice("No specialist is mapped for this field yet.");
      setExpertOffer(false);
      return;
    }
    setExpertBanner(invite);
    setExpertOffer(false);
    writeExpertSessionPrompt(invite, currentValue);
    setNotice(formatExpertJoinedBanner(invite));
    const mode = helpActionToMode("help_me_develop");
    if (estateSectionId && estateFieldKey) {
      const ctx = buildBusinessEstateFieldHelpContext({
        sectionId: estateSectionId,
        fieldKey: estateFieldKey,
        helpMode: mode,
        currentValue,
      });
      if (ctx) requestGuidedFieldHelp(ctx);
    } else {
      requestGuidedFieldHelp(
        buildPeopleIHelpFieldHelpContext({
          fieldKey: fieldPath.replace("people-i-help.", ""),
          helpMode: mode,
          currentValue,
        }),
      );
    }
  }

  return (
    <div
      className={`guided-assistance-bar ${className}`.trim()}
      data-testid={`guided-assistance-${fieldPath}`}
      data-auto-save={String(GUIDED_ASSISTANCE_MAY_AUTO_SAVE)}
      data-auto-navigate={String(GUIDED_ASSISTANCE_MAY_AUTO_NAVIGATE)}
      data-auto-chamber={String(GUIDED_ASSISTANCE_MAY_AUTO_OPEN_CHAMBER)}
    >
      {peopleMeta ? (
        <p className="guided-assistance-bar__definition">{peopleMeta.definition}</p>
      ) : null}

      <div className="guided-assistance-bar__toggles">
        {peopleMeta ? (
          <>
            <button
              type="button"
              className="guided-estate-field__link"
              aria-expanded={openWhy}
              onClick={() => setOpenWhy((v) => !v)}
            >
              Why this matters
            </button>
            <button
              type="button"
              className="guided-estate-field__link"
              aria-expanded={openShari}
              onClick={() => setOpenShari((v) => !v)}
            >
              How this helps Shari
            </button>
          </>
        ) : null}
      </div>

      {openWhy && peopleMeta ? (
        <p className="guided-estate-field__why">{peopleMeta.whyItMatters}</p>
      ) : null}
      {openShari && peopleMeta ? (
        <p className="guided-estate-field__why">{peopleMeta.howThisHelpsShari}</p>
      ) : null}

      {openExamples && peopleMeta?.examples?.length ? (
        <div className="guided-estate-field__example-panel">
          {peopleMeta.examples.map((ex) => (
            <article
              key={ex.example}
              className="guided-estate-field__example-card"
            >
              <p className="guided-estate-field__example-type">{ex.businessType}</p>
              <p className="guided-estate-field__example-text">{ex.example}</p>
              <p className="guided-estate-field__example-why">{ex.whyItWorks}</p>
            </article>
          ))}
        </div>
      ) : null}

      <div className="guided-estate-field__help-row">
        <button
          type="button"
          className="guided-estate-field__help-btn"
          onClick={handleImNotSure}
          data-testid={`im-not-sure-${fieldPath}`}
        >
          I&apos;m not sure
        </button>
        {entry.availableActions
          .filter(
            (action) =>
              action !== "research_with_shari" && action !== "ask_an_expert",
          )
          .map((action) => (
          <button
            key={action}
            type="button"
            className="guided-estate-field__help-btn"
            onClick={() => fire(action)}
            data-testid={`help-action-${action}-${fieldPath}`}
          >
            {ACTION_LABELS[action]}
          </button>
        ))}
      </div>

      {expertOffer ? (
        <div className="guided-assistance-bar__expert-offer" role="dialog">
          <p className="guided-estate-field__panel-lead">
            Would you like another perspective?
          </p>
          <div className="guided-estate-field__draft-actions">
            <button
              type="button"
              className="guided-estate-field__help-btn"
              onClick={() => setExpertOffer(false)}
            >
              Not now
            </button>
            <button
              type="button"
              className="business-estate-section-editor__save"
              onClick={acceptExpert}
              data-testid={`accept-expert-${fieldPath}`}
            >
              Yes, invite them
            </button>
          </div>
        </div>
      ) : null}

      {expertBanner ? (
        <p
          className="guided-assistance-bar__expert-banner"
          role="status"
          data-testid="expert-joined-banner"
        >
          {formatExpertJoinedBanner(expertBanner)}{" "}
          <button
            type="button"
            className="guided-estate-field__link"
            onClick={() => {
              clearExpertInvite();
              setExpertBanner(null);
              setNotice("Back with Shari — your answers are unchanged.");
            }}
          >
            Return to Shari
          </button>
        </p>
      ) : null}

      {notice ? (
        <p className="guided-estate-field__notice" role="status">
          {notice}
        </p>
      ) : null}
    </div>
  );
}
