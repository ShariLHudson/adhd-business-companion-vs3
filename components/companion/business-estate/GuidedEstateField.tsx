"use client";

import { useEffect, useMemo, useState } from "react";
import type { BusinessEstateSectionId } from "@/lib/profile/businessEstateProfile";
import {
  findBusinessStageChoice,
  getGuidedFieldDef,
} from "@/lib/profile/guidedFieldRegistry";
import {
  buildBusinessEstateFieldHelpContext,
  formatGuidedFieldHelpPrompt,
  requestGuidedFieldHelp,
} from "@/lib/profile/guidedFieldHelp";
import {
  acceptExpertInvite,
  clearExpertInvite,
  formatExpertJoinedBanner,
  getFieldHelpEntry,
  GUIDED_ASSISTANCE_MAY_AUTO_NAVIGATE,
  GUIDED_ASSISTANCE_MAY_AUTO_SAVE,
  writeExpertSessionPrompt,
  type ExpertInviteState,
} from "@/lib/profile/fieldHelpRegistry";
import {
  ANSWER_CONFIDENCE_OPTIONS,
  BUSINESS_STAGE_CHOICES,
  type AnswerConfidence,
  type GuidanceHelpMode,
  type GuidedFieldChoice,
  readSessionConfidence,
  writeSessionConfidence,
} from "@/lib/profile/guidedFieldTypes";

type Props = {
  sectionId: BusinessEstateSectionId;
  fieldKey: string;
  label: string;
  value: string;
  notesValue?: string;
  onChange: (value: string) => void;
  onNotesChange?: (value: string) => void;
  onFocus: () => void;
  fieldId: string;
  isActive: boolean;
  sectionValues: Record<string, string>;
};

type DisclosureKey = "why" | "shari" | "examples" | "choose" | "develop" | "draft";

function splitList(value: string): string[] {
  return value
    .split(/[,;\n]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function joinList(parts: string[]): string {
  return parts.join(", ");
}

function choiceMatchesValue(choice: GuidedFieldChoice, value: string): boolean {
  const v = value.trim().toLowerCase();
  if (!v) return false;
  return (
    v === choice.id.toLowerCase() ||
    v === choice.label.toLowerCase() ||
    v.includes(choice.label.toLowerCase())
  );
}

function stageHelpRecommendation(answers: {
  paying: string;
  launched: string;
  consistent: string;
  direction: string;
}): GuidedFieldChoice {
  if (answers.direction === "reinventing") {
    return BUSINESS_STAGE_CHOICES.find((c) => c.id === "reinventing")!;
  }
  if (answers.direction === "scaling") {
    return BUSINESS_STAGE_CHOICES.find((c) => c.id === "scaling")!;
  }
  if (answers.direction === "paused") {
    return BUSINESS_STAGE_CHOICES.find((c) => c.id === "paused")!;
  }
  if (answers.paying === "no" && answers.launched === "no") {
    return answers.consistent === "building"
      ? BUSINESS_STAGE_CHOICES.find((c) => c.id === "preparing_to_launch")!
      : BUSINESS_STAGE_CHOICES.find((c) => c.id === "idea")!;
  }
  if (answers.paying === "early" || answers.launched === "recently") {
    return BUSINESS_STAGE_CHOICES.find((c) => c.id === "newly_launched")!;
  }
  if (answers.consistent === "yes") {
    return BUSINESS_STAGE_CHOICES.find((c) => c.id === "established")!;
  }
  return BUSINESS_STAGE_CHOICES.find((c) => c.id === "growing")!;
}

export function GuidedEstateField({
  sectionId,
  fieldKey,
  label,
  value,
  notesValue = "",
  onChange,
  onNotesChange,
  onFocus,
  fieldId,
  isActive,
  sectionValues: _sectionValues,
}: Props) {
  const guidance = getGuidedFieldDef(sectionId, fieldKey);
  const fieldPath = `${sectionId}.${fieldKey}`;

  const [open, setOpen] = useState<Partial<Record<DisclosureKey, boolean>>>({});
  const [draftText, setDraftText] = useState("");
  const [helpNotice, setHelpNotice] = useState<string | null>(null);
  const [developAnswers, setDevelopAnswers] = useState<Record<string, string>>(
    {},
  );
  const [chooseAnswers, setChooseAnswers] = useState({
    paying: "",
    launched: "",
    consistent: "",
    direction: "",
  });
  const [customValue, setCustomValue] = useState("");
  const [confidence, setConfidence] = useState<AnswerConfidence | "">("");
  const [expertOffer, setExpertOffer] = useState(false);
  const [expertBanner, setExpertBanner] = useState<ExpertInviteState | null>(
    null,
  );
  const [stageConfirm, setStageConfirm] = useState<{
    matched: GuidedFieldChoice;
    raw: string;
  } | null>(null);

  const helpEntry = getFieldHelpEntry(fieldPath);

  useEffect(() => {
    setConfidence(readSessionConfidence(fieldPath) ?? "");
  }, [fieldPath]);

  // Best-effort stage match for unmatched free text — confirm before converting.
  useEffect(() => {
    if (fieldKey !== "businessStage" || !value.trim()) {
      setStageConfirm(null);
      return;
    }
    const exact = BUSINESS_STAGE_CHOICES.find(
      (c) =>
        c.label.toLowerCase() === value.trim().toLowerCase() ||
        c.id === value.trim().toLowerCase(),
    );
    if (exact) {
      setStageConfirm(null);
      return;
    }
    const matched = findBusinessStageChoice(value);
    if (matched) {
      setStageConfirm({ matched, raw: value });
    } else {
      setStageConfirm(null);
    }
  }, [fieldKey, value]);

  const selectedChips = useMemo(() => splitList(value), [value]);

  if (!guidance) return null;

  function toggle(key: DisclosureKey) {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function fireHelp(mode: GuidanceHelpMode) {
    const request = buildBusinessEstateFieldHelpContext({
      sectionId,
      fieldKey,
      helpMode: mode,
      currentValue: value,
      confidence: confidence || undefined,
    });
    if (!request) return;
    requestGuidedFieldHelp(request);
    setHelpNotice(
      mode === "research_with_shari" || mode === "help_me_develop"
        ? "Shari has this field, your approved Business Estate context, and People I Help when available. Nothing is saved until you approve a draft."
        : "Shari has this field context. Nothing is saved until you approve a draft.",
    );
    if (typeof window !== "undefined") {
      (
        window as unknown as { __lastGuidedFieldHelpPrompt?: string }
      ).__lastGuidedFieldHelpPrompt = formatGuidedFieldHelpPrompt(request);
    }
  }

  function selectSingle(choice: GuidedFieldChoice) {
    if (choice.id === "im_not_sure") {
      const opener =
        helpEntry?.imNotSureOpener ??
        "That's okay. Let's figure it out together.";
      onChange(choice.label);
      onFocus();
      setStageConfirm(null);
      setHelpNotice(opener);
      setOpen((prev) => ({ ...prev, choose: true, develop: false }));
      fireHelp("help_me_choose");
      return;
    }
    onChange(choice.label);
    onFocus();
    setStageConfirm(null);
    setOpen((prev) => ({ ...prev, choose: false, draft: false }));
    setHelpNotice(null);
  }

  function toggleChip(choice: GuidedFieldChoice) {
    const exists = selectedChips.some(
      (p) =>
        p.toLowerCase() === choice.label.toLowerCase() ||
        p.toLowerCase() === choice.id.toLowerCase(),
    );
    const next = exists
      ? selectedChips.filter(
          (p) =>
            p.toLowerCase() !== choice.label.toLowerCase() &&
            p.toLowerCase() !== choice.id.toLowerCase(),
        )
      : [...selectedChips, choice.label];
    onChange(joinList(next));
    onFocus();
  }

  function addCustomChip() {
    const next = customValue.trim();
    if (!next) return;
    if (
      selectedChips.some((p) => p.toLowerCase() === next.toLowerCase())
    ) {
      setCustomValue("");
      return;
    }
    onChange(joinList([...selectedChips, next]));
    setCustomValue("");
    onFocus();
  }

  function removeChip(label: string) {
    onChange(
      joinList(
        selectedChips.filter((p) => p.toLowerCase() !== label.toLowerCase()),
      ),
    );
    onFocus();
  }

  function applyDraft() {
    if (!draftText.trim()) return;
    onChange(draftText.trim());
    setDraftText("");
    setOpen((prev) => ({ ...prev, draft: false, develop: false, choose: false }));
    setHelpNotice(
      "Draft applied to this field. Save Changes to keep it in My Business Estate.",
    );
    onFocus();
  }

  function buildDevelopDraft(): string {
    const qs = guidance.guidedQuestions ?? [];
    const lines = qs
      .map((q) => {
        const a = developAnswers[q]?.trim();
        return a ? `${q} ${a}` : "";
      })
      .filter(Boolean);
    return lines.join(" ");
  }

  function onConfidenceChange(next: AnswerConfidence | "") {
    setConfidence(next);
    writeSessionConfidence(fieldPath, next);
  }

  return (
    <div
      className={`guided-estate-field${isActive ? " guided-estate-field--active" : ""}`}
      data-testid={`guided-field-${sectionId}-${fieldKey}`}
      data-disclosures-default="collapsed"
    >
      <div className="guided-estate-field__header">
        <label className="guided-estate-field__question" htmlFor={fieldId}>
          {guidance.question || label}
        </label>
        <p className="guided-estate-field__definition">{guidance.definition}</p>
        {guidance.distinctionNote ? (
          <p className="guided-estate-field__distinction">
            {guidance.distinctionNote}
          </p>
        ) : null}
      </div>

      <div className="guided-estate-field__toggles">
        <button
          type="button"
          className="guided-estate-field__link"
          aria-expanded={Boolean(open.why)}
          onClick={() => toggle("why")}
        >
          Why this matters
        </button>
        <button
          type="button"
          className="guided-estate-field__link"
          aria-expanded={Boolean(open.shari)}
          onClick={() => toggle("shari")}
          data-testid={`guided-how-helps-${fieldKey}`}
        >
          How this helps Shari
        </button>
        {guidance.enableShowExamples ? (
          <button
            type="button"
            className="guided-estate-field__link"
            aria-expanded={Boolean(open.examples)}
            onClick={() => {
              toggle("examples");
              fireHelp("show_examples");
            }}
            data-testid={`guided-examples-${fieldKey}`}
          >
            Show me examples
          </button>
        ) : null}
        {guidance.enableExplainThis ? (
          <button
            type="button"
            className="guided-estate-field__link"
            onClick={() => {
              setOpen((prev) => ({ ...prev, why: true, shari: true }));
              fireHelp("explain_this");
            }}
          >
            Explain this
          </button>
        ) : null}
      </div>

      {open.why ? (
        <p className="guided-estate-field__why" data-testid={`guided-why-${fieldKey}`}>
          {guidance.whyItMatters}
        </p>
      ) : null}
      {open.shari ? (
        <p
          className="guided-estate-field__why"
          data-testid={`guided-helps-shari-${fieldKey}`}
        >
          {guidance.howThisHelpsShari}
        </p>
      ) : null}

      {open.examples && guidance.examples?.length ? (
        <div
          className="guided-estate-field__example-panel"
          data-testid={`guided-example-panel-${fieldKey}`}
        >
          {guidance.examples.map((ex) => (
            <article key={ex.id} className="guided-estate-field__example-card">
              <p className="guided-estate-field__example-type">{ex.businessType}</p>
              <p className="guided-estate-field__example-text">{ex.example}</p>
              <p className="guided-estate-field__example-why">{ex.whyItWorks}</p>
            </article>
          ))}
        </div>
      ) : null}

      {stageConfirm ? (
        <div
          className="guided-estate-field__panel"
          data-testid="stage-confirm-match"
        >
          <p className="guided-estate-field__panel-lead">
            Your saved answer is “{stageConfirm.raw}”. Closest guided option may
            be “{stageConfirm.matched.label}”. Confirm to use it, or keep your
            wording.
          </p>
          <div className="guided-estate-field__draft-actions">
            <button
              type="button"
              className="guided-estate-field__help-btn"
              onClick={() => setStageConfirm(null)}
            >
              Keep my wording
            </button>
            <button
              type="button"
              className="business-estate-section-editor__save"
              onClick={() => selectSingle(stageConfirm.matched)}
            >
              Use “{stageConfirm.matched.label}”
            </button>
          </div>
        </div>
      ) : null}

      {guidance.inputType === "single_select" && guidance.choices ? (
        <div
          className="guided-estate-field__choices"
          role="radiogroup"
          aria-label={guidance.question}
        >
          {guidance.choices.map((choice) => {
            const selected = choiceMatchesValue(choice, value);
            return (
              <button
                key={choice.id}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`guided-estate-field__choice${
                  selected ? " guided-estate-field__choice--selected" : ""
                }`}
                onClick={() => selectSingle(choice)}
                data-testid={`guided-choice-${choice.id}`}
              >
                <span className="guided-estate-field__choice-label">
                  {choice.label}
                </span>
                <span className="guided-estate-field__choice-desc">
                  {choice.description}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      {guidance.inputType === "chips_plus_custom" && guidance.choices ? (
        <>
          <div className="guided-estate-field__chips" role="group">
            {guidance.choices.map((choice) => {
              const selected = selectedChips.some(
                (p) =>
                  p.toLowerCase() === choice.label.toLowerCase() ||
                  p.toLowerCase() === choice.id.toLowerCase(),
              );
              return (
                <button
                  key={choice.id}
                  type="button"
                  className={`guided-estate-field__chip${
                    selected ? " guided-estate-field__chip--selected" : ""
                  }`}
                  aria-pressed={selected}
                  onClick={() => toggleChip(choice)}
                >
                  {choice.label}
                </button>
              );
            })}
          </div>
          {selectedChips.length > 0 ? (
            <ul className="guided-estate-field__selected-list">
              {selectedChips.map((chip) => (
                <li key={chip}>
                  <span>{chip}</span>
                  <button
                    type="button"
                    className="guided-estate-field__link"
                    onClick={() => removeChip(chip)}
                    aria-label={`Remove ${chip}`}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="guided-estate-field__custom-row">
            <input
              type="text"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              onFocus={onFocus}
              placeholder="Add a custom value"
              className="business-estate-section-editor__input"
              aria-label="Add a custom value"
            />
            <button
              type="button"
              className="guided-estate-field__help-btn"
              onClick={addCustomChip}
            >
              Add
            </button>
          </div>
          {onNotesChange ? (
            <label className="guided-estate-field__notes">
              <span>Why these values matter (optional)</span>
              <textarea
                value={notesValue}
                onChange={(e) => onNotesChange(e.target.value)}
                onFocus={onFocus}
                className="business-estate-section-editor__textarea"
                rows={2}
                placeholder="Optional — why a value matters to you."
              />
            </label>
          ) : null}
          <label className="guided-estate-field__notes">
            <span>Saved answer (edit freely)</span>
            <textarea
              id={fieldId}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={onFocus}
              className="business-estate-section-editor__textarea"
              rows={2}
            />
          </label>
        </>
      ) : null}

      {guidance.inputType === "multi_select" && guidance.choices ? (
        <div
          className="guided-estate-field__choices"
          role="group"
          aria-label={guidance.question}
        >
          <p className="guided-estate-field__panel-lead">
            You can select more than one.
          </p>
          {guidance.choices.map((choice) => {
            const selected = selectedChips.some(
              (p) =>
                p.toLowerCase() === choice.label.toLowerCase() ||
                p.toLowerCase() === choice.id.toLowerCase(),
            );
            return (
              <button
                key={choice.id}
                type="button"
                className={`guided-estate-field__choice${
                  selected ? " guided-estate-field__choice--selected" : ""
                }`}
                aria-pressed={selected}
                onClick={() => toggleChip(choice)}
                data-testid={`guided-multi-${choice.id}`}
              >
                <span className="guided-estate-field__choice-label">
                  {choice.label}
                </span>
                <span className="guided-estate-field__choice-desc">
                  {choice.description}
                </span>
              </button>
            );
          })}
          <label className="guided-estate-field__notes">
            <span>Saved selections (edit freely)</span>
            <textarea
              id={fieldId}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={onFocus}
              className="business-estate-section-editor__textarea"
              rows={2}
            />
          </label>
        </div>
      ) : null}

      {guidance.inputType === "textarea" ? (
        <textarea
          id={fieldId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          className="business-estate-section-editor__textarea"
          placeholder="Write in your own words…"
          rows={4}
        />
      ) : null}

      {/* Unmatched free-text stage still visible when not a known option */}
      {guidance.inputType === "single_select" &&
      value.trim() &&
      !BUSINESS_STAGE_CHOICES.some((c) => choiceMatchesValue(c, value)) ? (
        <p className="guided-estate-field__notice" role="status">
          Current saved answer: “{value}” — preserved until you choose a guided
          option or edit after saving.
        </p>
      ) : null}

      <label className="guided-estate-field__confidence">
        <span>How confident do you feel about this answer? (optional)</span>
        <select
          value={confidence}
          onChange={(e) =>
            onConfidenceChange(e.target.value as AnswerConfidence | "")
          }
          onFocus={onFocus}
          data-testid={`guided-confidence-${fieldKey}`}
        >
          <option value="">Prefer not to say</option>
          {ANSWER_CONFIDENCE_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <div className="guided-estate-field__help-row">
        {guidance.allowImNotSure ? (
          <button
            type="button"
            className="guided-estate-field__help-btn"
            onClick={() => {
              const opener =
                helpEntry?.imNotSureOpener ??
                "That's okay. Let's figure it out together.";
              setHelpNotice(opener);
              if (!value.trim()) {
                onChange("I'm not sure");
              }
              if (guidance.enableHelpMeChoose || fieldKey === "businessStage") {
                setOpen((prev) => ({ ...prev, choose: true, develop: false }));
                fireHelp("help_me_choose");
              } else if (guidance.enableHelpMeDevelop) {
                setOpen((prev) => ({ ...prev, develop: true, choose: false }));
                fireHelp("help_me_develop");
              } else {
                fireHelp("explain_this");
                setOpen((prev) => ({ ...prev, why: true, shari: true }));
              }
              onFocus();
            }}
            data-testid={`guided-im-not-sure-${fieldKey}`}
          >
            I&apos;m not sure
          </button>
        ) : null}
        <details className="guided-estate-field__help-menu">
          <summary className="guided-estate-field__help-btn">Help</summary>
          <div className="guided-estate-field__help-menu-body">
            <button
              type="button"
              className="guided-estate-field__help-btn"
              onClick={() => {
                setOpen((prev) => ({ ...prev, why: true, shari: true }));
                fireHelp("explain_this");
              }}
            >
              Explain this
            </button>
            <button
              type="button"
              className="guided-estate-field__help-btn"
              onClick={() => {
                setOpen((prev) => ({ ...prev, examples: true }));
                fireHelp("show_examples");
              }}
            >
              Show an example
            </button>
            {guidance.enableHelpMeChoose ? (
              <button
                type="button"
                className="guided-estate-field__help-btn"
                onClick={() => {
                  toggle("choose");
                  fireHelp("help_me_choose");
                }}
              >
                Help me choose
              </button>
            ) : null}
            {guidance.enableHelpMeDevelop ? (
              <button
                type="button"
                className="guided-estate-field__help-btn"
                onClick={() => {
                  toggle("develop");
                  fireHelp("help_me_develop");
                }}
              >
                Help me develop this
              </button>
            ) : null}
            {helpEntry?.availableActions.includes("ask_an_expert") ? null : null}
            <p className="guided-estate-field__help-menu-note">
              For another perspective, use Need Another Perspective? at the top
              of this area (Chamber or Board). For research, use Research This
              With Shari.
            </p>
          </div>
        </details>
      </div>

      {expertOffer ? (
        <div className="guided-assistance-bar__expert-offer">
          <p className="guided-estate-field__panel-lead">
            Would you like another perspective? You stay in this conversation —
            nothing opens elsewhere automatically.
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
              onClick={() => {
                const invite = acceptExpertInvite(fieldPath);
                setExpertOffer(false);
                if (!invite) {
                  setHelpNotice("No specialist is mapped for this field yet.");
                  return;
                }
                setExpertBanner(invite);
                writeExpertSessionPrompt(invite, value);
                setHelpNotice(formatExpertJoinedBanner(invite));
                fireHelp("help_me_develop");
              }}
              data-testid={`accept-expert-${fieldKey}`}
            >
              Yes, invite them
            </button>
          </div>
          <span className="sr-only">
            autoSave={String(GUIDED_ASSISTANCE_MAY_AUTO_SAVE)} autoNav=
            {String(GUIDED_ASSISTANCE_MAY_AUTO_NAVIGATE)}
          </span>
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
              setHelpNotice("Back with Shari — your field is unchanged.");
            }}
          >
            Return to Shari
          </button>
        </p>
      ) : null}

      {open.choose && fieldKey === "businessStage" ? (
        <div className="guided-estate-field__panel" data-testid="stage-help-choose">
          <p className="guided-estate-field__panel-lead">
            Up to four simple questions — then you choose. Nothing saves until
            you confirm and Save Changes.
          </p>
          <label className="guided-estate-field__mini">
            Are you currently serving paying customers?
            <select
              value={chooseAnswers.paying}
              onChange={(e) =>
                setChooseAnswers((a) => ({ ...a, paying: e.target.value }))
              }
            >
              <option value="">Choose…</option>
              <option value="no">Not yet</option>
              <option value="early">A few / early</option>
              <option value="yes">Yes, ongoing</option>
            </select>
          </label>
          <label className="guided-estate-field__mini">
            Have you officially launched?
            <select
              value={chooseAnswers.launched}
              onChange={(e) =>
                setChooseAnswers((a) => ({ ...a, launched: e.target.value }))
              }
            >
              <option value="">Choose…</option>
              <option value="no">Not yet</option>
              <option value="recently">Recently</option>
              <option value="yes">Yes</option>
            </select>
          </label>
          <label className="guided-estate-field__mini">
            Is the business operating consistently?
            <select
              value={chooseAnswers.consistent}
              onChange={(e) =>
                setChooseAnswers((a) => ({ ...a, consistent: e.target.value }))
              }
            >
              <option value="">Choose…</option>
              <option value="building">Still building</option>
              <option value="sometimes">Sometimes</option>
              <option value="yes">Yes, consistently</option>
            </select>
          </label>
          <label className="guided-estate-field__mini">
            Are you changing direction or expanding capacity?
            <select
              value={chooseAnswers.direction}
              onChange={(e) =>
                setChooseAnswers((a) => ({ ...a, direction: e.target.value }))
              }
            >
              <option value="">Choose…</option>
              <option value="neither">Neither right now</option>
              <option value="reinventing">Changing direction</option>
              <option value="scaling">Expanding capacity</option>
              <option value="paused">Stepping back for now</option>
            </select>
          </label>
          <button
            type="button"
            className="guided-estate-field__help-btn"
            disabled={
              !chooseAnswers.paying ||
              !chooseAnswers.launched ||
              !chooseAnswers.consistent ||
              !chooseAnswers.direction
            }
            onClick={() => {
              const rec = stageHelpRecommendation(chooseAnswers);
              setDraftText(rec.label);
              setOpen((prev) => ({ ...prev, draft: true }));
              setHelpNotice(
                `Closest fit may be “${rec.label}”: ${rec.description} You decide.`,
              );
            }}
          >
            Suggest closest stage
          </button>
        </div>
      ) : null}

      {open.choose && fieldKey === "coreValues" ? (
        <div className="guided-estate-field__panel">
          <p className="guided-estate-field__panel-lead">
            Answer what you can. Suggestions stay drafts until you apply them.
          </p>
          {(guidance.guidedQuestions ?? []).map((q) => (
            <label key={q} className="guided-estate-field__mini">
              {q}
              <input
                type="text"
                value={developAnswers[q] ?? ""}
                onChange={(e) =>
                  setDevelopAnswers((prev) => ({
                    ...prev,
                    [q]: e.target.value,
                  }))
                }
              />
            </label>
          ))}
          <button
            type="button"
            className="guided-estate-field__help-btn"
            onClick={() => {
              fireHelp("help_me_choose");
              const draft = buildDevelopDraft();
              if (draft) {
                setDraftText(draft);
                setOpen((prev) => ({ ...prev, draft: true }));
              }
            }}
          >
            Ask Shari to help identify values
          </button>
        </div>
      ) : null}

      {open.develop && guidance.guidedQuestions?.length ? (
        <div className="guided-estate-field__panel">
          <p className="guided-estate-field__panel-lead">
            Answer one question at a time if that feels easier. Build a draft
            when ready — it stays unsaved until you apply it and Save Changes.
          </p>
          {guidance.guidedQuestions.map((q) => (
            <label key={q} className="guided-estate-field__mini">
              {q}
              <input
                type="text"
                value={developAnswers[q] ?? ""}
                onChange={(e) =>
                  setDevelopAnswers((prev) => ({
                    ...prev,
                    [q]: e.target.value,
                  }))
                }
              />
            </label>
          ))}
          <button
            type="button"
            className="guided-estate-field__help-btn"
            onClick={() => {
              const draft = buildDevelopDraft();
              if (!draft) return;
              setDraftText(draft);
              setOpen((prev) => ({ ...prev, draft: true }));
            }}
          >
            Build draft from my answers
          </button>
        </div>
      ) : null}

      {open.draft ? (
        <div
          className="guided-estate-field__panel guided-estate-field__panel--draft"
          data-testid={`guided-draft-${fieldKey}`}
        >
          <p className="guided-estate-field__panel-lead">
            Draft (not saved yet). Apply to the field, then use Save Changes when
            you&apos;re ready. Discard leaves your original answer alone.
          </p>
          <textarea
            className="business-estate-section-editor__textarea"
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            rows={4}
          />
          <div className="guided-estate-field__draft-actions">
            <button
              type="button"
              className="guided-estate-field__help-btn"
              onClick={() => {
                setOpen((prev) => ({ ...prev, draft: false }));
                setDraftText("");
              }}
            >
              Discard draft
            </button>
            <button
              type="button"
              className="business-estate-section-editor__save"
              onClick={applyDraft}
              data-testid={`guided-apply-draft-${fieldKey}`}
            >
              Use this draft
            </button>
          </div>
        </div>
      ) : null}

      {helpNotice ? (
        <p className="guided-estate-field__notice" role="status">
          {helpNotice}
        </p>
      ) : null}
    </div>
  );
}
