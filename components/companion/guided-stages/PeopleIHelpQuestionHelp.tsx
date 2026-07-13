"use client";

import { useState } from "react";
import {
  getFieldHelpEntry,
  helpActionToMode,
  type FieldHelpAction,
} from "@/lib/profile/fieldHelpRegistry";
import {
  buildPeopleIHelpFieldHelpContext,
  requestGuidedFieldHelp,
} from "@/lib/profile/guidedFieldHelp";
import { getPeopleIHelpGuidedField } from "@/lib/profile/peopleIHelpGuidedFields";
import { peopleIHelpFieldSupportsResearch } from "@/lib/profile/peopleIHelpResearchSupport";

type Props = {
  fieldKey: string;
  currentValue: string;
};

const HELP_ACTIONS: { action: FieldHelpAction; label: string }[] = [
  { action: "explain_this", label: "Explain this" },
  { action: "show_examples", label: "Show me examples" },
  { action: "help_me_develop", label: "Help me develop this" },
];

/**
 * Collapsed optional help for People I Help single-question flow.
 * Research appears only when the field genuinely benefits from it.
 */
export function PeopleIHelpQuestionHelp({ fieldKey, currentValue }: Props) {
  const fieldPath = `people-i-help.${fieldKey}`;
  const entry = getFieldHelpEntry(fieldPath);
  const meta = getPeopleIHelpGuidedField(fieldKey);
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(false);
  const [showExplain, setShowExplain] = useState(false);

  if (!entry) return null;

  const showResearch = peopleIHelpFieldSupportsResearch(fieldKey);

  function fire(action: FieldHelpAction) {
    const mode = helpActionToMode(action);
    requestGuidedFieldHelp(
      buildPeopleIHelpFieldHelpContext({
        fieldKey,
        helpMode: mode,
        currentValue,
      }),
    );
    if (action === "show_examples") setShowExamples(true);
    if (action === "explain_this") setShowExplain(true);
    if (action === "research_with_shari") {
      setNotice(
        "Shari has this question and your draft. Open chat when you are ready — your answer stays here.",
      );
      return;
    }
    setNotice(
      "Shari has this field context. Nothing is saved until you approve a draft. You stay right here.",
    );
  }

  function handleImNotSure() {
    setNotice(entry!.imNotSureOpener);
    fire(entry!.defaultHelpAction);
  }

  return (
    <div
      className="pih-question-help"
      data-testid={`pih-question-help-${fieldKey}`}
    >
      <button
        type="button"
        className="pih-question-help__toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        data-testid="pih-need-help-toggle"
      >
        <span>Need help answering?</span>
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>

      {open ? (
        <div
          className="pih-question-help__body"
          data-testid="pih-need-help-body"
        >
          <div className="pih-question-help__actions" role="group" aria-label="Help options">
            <button
              type="button"
              className="pih-question-help__action"
              onClick={handleImNotSure}
              data-testid={`im-not-sure-${fieldPath}`}
            >
              I&apos;m not sure
            </button>
            {HELP_ACTIONS.filter(({ action }) =>
              entry.availableActions.includes(action),
            ).map(({ action, label }) => (
              <button
                key={action}
                type="button"
                className="pih-question-help__action"
                onClick={() => fire(action)}
                data-testid={`help-action-${action}-${fieldPath}`}
              >
                {label}
              </button>
            ))}
            {showResearch ? (
              <button
                type="button"
                className="pih-question-help__action"
                onClick={() => fire("research_with_shari")}
                data-testid={`help-action-research_with_shari-${fieldPath}`}
              >
                Research this with Shari
              </button>
            ) : null}
          </div>

          {showExplain && meta ? (
            <div className="pih-question-help__detail">
              <p>{meta.whyItMatters}</p>
              <p>{meta.howThisHelpsShari}</p>
            </div>
          ) : null}

          {showExamples && meta?.examples?.length ? (
            <div className="pih-question-help__examples">
              {meta.examples.map((ex) => (
                <article key={ex.example} className="pih-question-help__example">
                  <p className="pih-question-help__example-type">
                    {ex.businessType}
                  </p>
                  <p className="pih-question-help__example-text">{ex.example}</p>
                  <p className="pih-question-help__example-why">{ex.whyItWorks}</p>
                </article>
              ))}
            </div>
          ) : null}

          {notice ? (
            <p className="pih-question-help__notice" role="status">
              {notice}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
