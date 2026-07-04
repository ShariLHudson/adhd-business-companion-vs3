"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  JOURNAL_BOOKBINDER_LEATHERS,
  JOURNAL_ORDER_NAME_SUGGESTIONS,
} from "@/lib/journalGazebo/bookCeremony";
import {
  JOURNAL_CEREMONY_DEDICATION_INVITE,
  JOURNAL_CEREMONY_DEDICATION_OPTIONAL,
  JOURNAL_CEREMONY_DEDICATION_TITLE,
  JOURNAL_CEREMONY_READY_LEDE,
  JOURNAL_CEREMONY_TODAY_INTRO,
  JOURNAL_CEREMONY_WELCOME_BODY,
  JOURNAL_CEREMONY_WELCOME_PACE,
  JOURNAL_CEREMONY_WELCOME_SIGN,
  JOURNAL_CEREMONY_WELCOME_STORY,
  JOURNAL_CEREMONY_WELCOME_TITLE,
} from "@/lib/journalGazebo/hospitality";
import {
  ensureDedicationEditorShell,
  focusEditableAtStart,
} from "@/lib/journalGazebo/writingSurface";
import type { JournalGazeboConfig, JournalLeatherColor } from "@/lib/journalGazebo/types";

type ContinueProps = {
  onContinue: () => void;
  disabled?: boolean;
  label?: string;
};

function ContinueButton({ onContinue, disabled, label = "Continue →" }: ContinueProps) {
  return (
    <button
      type="button"
      className="jg-book-page__continue"
      onClick={onContinue}
      disabled={disabled}
    >
      {label}
    </button>
  );
}

export function WelcomeMemoryPage() {
  return <FirstOpenWelcomePage />;
}

type ChooseLeatherProps = {
  leatherColor: JournalLeatherColor;
  onLeatherChange: (color: JournalLeatherColor) => void;
  onContinue: () => void;
  pageReady: boolean;
};

export function ChooseLeatherPage({
  leatherColor,
  onLeatherChange,
  onContinue,
  pageReady,
}: ChooseLeatherProps) {
  const index = Math.max(
    0,
    JOURNAL_BOOKBINDER_LEATHERS.findIndex((option) => option.id === leatherColor),
  );
  const current = JOURNAL_BOOKBINDER_LEATHERS[index] ?? JOURNAL_BOOKBINDER_LEATHERS[0]!;

  const browse = useCallback(
    (delta: number) => {
      const next =
        JOURNAL_BOOKBINDER_LEATHERS[
          (index + delta + JOURNAL_BOOKBINDER_LEATHERS.length) %
            JOURNAL_BOOKBINDER_LEATHERS.length
        ]!;
      onLeatherChange(next.id);
    },
    [index, onLeatherChange],
  );

  return (
    <article className="jg-book-page jg-book-page--leather">
      <h2 className="jg-book-page__gold-title">Choosing Your Journal</h2>
      <p className="jg-book-page__lede">Every treasured journal begins with a single choice.</p>
      <div className="jg-book-page__leather-stage">
        <button
          type="button"
          className="jg-book-page__leather-nav"
          onClick={() => browse(-1)}
          aria-label="Previous leather"
        >
          ‹
        </button>
        <div className="jg-book-page__oak">
          <div
            key={leatherColor}
            className="jg-book-page__leather-journal"
            data-leather={leatherColor}
          >
            <span className="jg-book-page__leather-spine" aria-hidden="true" />
            <span className="jg-book-page__leather-cover" aria-hidden="true" />
            <span className="jg-book-page__leather-edge" aria-hidden="true" />
          </div>
        </div>
        <button
          type="button"
          className="jg-book-page__leather-nav"
          onClick={() => browse(1)}
          aria-label="Next leather"
        >
          ›
        </button>
      </div>
      <p className="jg-book-page__leather-label">{current.label}</p>
      <ContinueButton onContinue={onContinue} disabled={!pageReady} />
    </article>
  );
}

export function LeatherMemoryPage({ leatherColor }: { leatherColor: JournalLeatherColor }) {
  const label =
    JOURNAL_BOOKBINDER_LEATHERS.find((option) => option.id === leatherColor)?.label ?? "";
  return (
    <article className="jg-book-page jg-book-page--memory jg-book-page--leather-memory">
      <p className="jg-book-page__memory-kicker">Your choice</p>
      <div className="jg-book-page__leather-journal jg-book-page__leather-journal--small" data-leather={leatherColor}>
        <span className="jg-book-page__leather-spine" aria-hidden="true" />
        <span className="jg-book-page__leather-cover" aria-hidden="true" />
      </div>
      <p className="jg-book-page__leather-label">{label}</p>
    </article>
  );
}

type OrderCardProps = {
  name: string;
  onNameChange: (name: string) => void;
  onContinue: () => void;
  pageReady: boolean;
};

export function OrderCardNamePage({ name, onNameChange, onContinue, pageReady }: OrderCardProps) {
  const [sending, setSending] = useState(false);

  function handleContinue() {
    if (!name.trim() || sending) return;
    setSending(true);
    window.setTimeout(() => {
      onContinue();
      setSending(false);
    }, 900);
  }

  return (
    <article className="jg-book-page jg-book-page--order">
      <h2 className="jg-book-page__gold-title">Every Journal Deserves a Name</h2>
      <p className="jg-book-page__lede">
        The title you choose will be hand embossed onto the leather cover before your journal is
        presented to you.
      </p>
      <div className={["jg-book-page__order-card", sending ? "jg-book-page__order-card--sent" : ""].join(" ")}>
        <span className="jg-book-page__order-flame jg-estate-flame" aria-hidden="true" />
        <p className="jg-book-page__order-label">Journal Title</p>
        <div
          className="jg-book-page__ink-line"
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-label="Journal title"
          data-placeholder="…"
          onInput={(e) => onNameChange((e.currentTarget.textContent ?? "").trimStart())}
          onBlur={(e) => onNameChange((e.currentTarget.textContent ?? "").trim())}
        >
          {name}
        </div>
        <div className="jg-book-page__suggestions" role="group" aria-label="Title suggestions">
          {JOURNAL_ORDER_NAME_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="jg-book-page__suggestion"
              onClick={() => onNameChange(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
      <ContinueButton onContinue={handleContinue} disabled={!pageReady || !name.trim() || sending} />
    </article>
  );
}

export function OrderCardMemoryPage({ name }: { name: string }) {
  return (
    <article className="jg-book-page jg-book-page--memory">
      <div className="jg-book-page__order-card jg-book-page__order-card--memory">
        <span className="jg-book-page__order-flame jg-estate-flame" aria-hidden="true" />
        <p className="jg-book-page__order-label">Journal Title</p>
        <p className="jg-book-page__order-name">{name}</p>
        <p className="jg-book-page__order-sent">With the Estate Bookbinder</p>
      </div>
    </article>
  );
}

function dedicationIsEmpty(html: string): boolean {
  const text = html.replace(/<[^>]*>/g, "").replace(/\u00a0/g, " ").trim();
  return !text;
}

function DedicationEditable({
  value,
  onChange,
  label,
  placeholder = "Write your message here…",
  interactive = true,
}: {
  value: string;
  onChange?: (html: string) => void;
  label: string;
  placeholder?: string;
  interactive?: boolean;
}) {
  const areaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!interactive) return;
    const el = areaRef.current;
    if (!el) return;
    if (value && el.innerHTML !== value) {
      el.innerHTML = value;
    }
  }, [interactive, value]);

  if (!interactive) {
    const empty = dedicationIsEmpty(value);
    return (
      <div
        className="jg-book-page__dedication-area jg-book-page__dedication-area--preview"
        aria-hidden="true"
      >
        {empty ? (
          <span className="jg-book-page__dedication-placeholder">{placeholder}</span>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: value }} />
        )}
      </div>
    );
  }

  return (
    <div
      ref={areaRef}
      className="jg-book-page__dedication-area"
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline
      aria-label={label}
      data-placeholder={placeholder}
      onMouseDown={(e) => {
        e.stopPropagation();
        const el = areaRef.current;
        if (el) ensureDedicationEditorShell(el);
      }}
      onClick={(e) => e.stopPropagation()}
      onFocus={() => {
        const el = areaRef.current;
        if (!el) return;
        ensureDedicationEditorShell(el);
      }}
      onInput={(e) => {
        const el = e.currentTarget;
        ensureDedicationEditorShell(el);
        onChange?.(el.innerHTML);
      }}
    />
  );
}

type DedicationProps = {
  ownerName: string;
  dedication: string;
  onDedicationChange: (text: string) => void;
  onSave: () => void;
  onSkip: () => void;
  pageReady: boolean;
};

export function DedicationPage({
  ownerName,
  dedication,
  onDedicationChange,
  onSave,
  onSkip,
  pageReady,
}: DedicationProps) {
  return (
    <article className="jg-book-page jg-book-page--dedication jg-book-page--journal-reveal">
      <h2 className="jg-book-page__gold-title">{JOURNAL_CEREMONY_DEDICATION_TITLE}</h2>
      <p className="jg-book-page__owner-name">{ownerName}</p>
      <span className="jg-book-page__gold-rule" aria-hidden="true" />
      <h3 className="jg-book-page__dedication-heading">A Letter to My Future Self</h3>
      <p className="jg-book-page__dedication-intro">
        You don&apos;t have to write this today. But someday you&apos;ll be grateful that you did.
      </p>
      <DedicationEditable
        value={dedication}
        onChange={onDedicationChange}
        label="Dedication to your future self"
      />
      <div className="jg-book-page__dedication-actions">
        <button type="button" className="jg-book-page__text-action" onClick={onSkip} disabled={!pageReady}>
          Skip for Now
        </button>
        <button type="button" className="jg-book-page__text-action jg-book-page__text-action--primary" onClick={onSave} disabled={!pageReady}>
          Save Dedication
        </button>
      </div>
    </article>
  );
}

export function InsideCoverPage() {
  return (
    <div className="jg-open-book__inside-cover-page jg-open-book__inside-cover-page--endpaper">
      <span className="jg-open-book__inside-cover-texture" aria-hidden="true" />
    </div>
  );
}

/** First opening — who the journal belongs to, then an optional message lower on the page. */
export function FirstOpenDedicationPage({
  ownerName,
  dedication = "",
  onDedicationChange,
  interactive = true,
}: {
  ownerName: string;
  dedication?: string;
  onDedicationChange?: (html: string) => void;
  interactive?: boolean;
}) {
  return (
    <article
      className="jg-book-page jg-book-page--dedication jg-book-page--first-write jg-book-page--single"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="jg-book-page__belongs-block">
        <p className="jg-book-page__belongs-label">{JOURNAL_CEREMONY_DEDICATION_TITLE}</p>
        <p className="jg-book-page__owner-name">{ownerName}</p>
      </div>
      <div className="jg-book-page__message-section">
        <p className="jg-book-page__dedication-invite">{JOURNAL_CEREMONY_DEDICATION_INVITE}</p>
        <DedicationEditable
          value={dedication}
          onChange={(html) => onDedicationChange?.(html)}
          label="Optional message to your future self"
          interactive={interactive}
        />
        <p className="jg-book-page__dedication-optional">{JOURNAL_CEREMONY_DEDICATION_OPTIONAL}</p>
      </div>
    </article>
  );
}

function splitIntoSentences(text: string): string[] {
  return (
    text
      .match(/[^.!?]+[.!?]+|[^.!?]+$/g)
      ?.map((part) => part.trim())
      .filter(Boolean) ?? []
  );
}

function welcomeLetterSentences(): string[] {
  return [
    "Dear friend,",
    `${JOURNAL_CEREMONY_WELCOME_TITLE}.`,
    ...splitIntoSentences(JOURNAL_CEREMONY_WELCOME_BODY),
    ...JOURNAL_CEREMONY_WELCOME_STORY.flatMap((paragraph) => splitIntoSentences(paragraph)),
    ...splitIntoSentences(JOURNAL_CEREMONY_WELCOME_PACE),
    JOURNAL_CEREMONY_WELCOME_SIGN,
  ];
}

/** Shari&apos;s welcome letter — page two of first opening. */
export function FirstOpenWelcomePage() {
  const sentences = welcomeLetterSentences();
  return (
    <article className="jg-book-page jg-book-page--letter jg-book-page--single">
      {sentences.map((sentence, index) => (
        <p key={index} className="jg-book-page__letter-line">
          {sentence}
        </p>
      ))}
    </article>
  );
}

type FirstOpenTodayProps = {
  config: JournalGazeboConfig;
  headerLines: readonly string[];
};

/** Page 3 — journal name and a light handoff before today's date page. */
export function FirstOpenReadyPage({ config }: { config: JournalGazeboConfig }) {
  return (
    <article className="jg-book-page jg-book-page--ready jg-book-page--single" data-paper={config.paperStyle}>
      <h2 className="jg-book-page__journal-title">{config.name}</h2>
      <p className="jg-book-page__lede jg-book-page__lede--ready">{JOURNAL_CEREMONY_READY_LEDE}</p>
    </article>
  );
}

/** Page 4 — today's date, time, and season — then into writing. */
export function FirstOpenDatePage({ config, headerLines }: FirstOpenTodayProps) {
  return (
    <article className="jg-book-page jg-book-page--today jg-book-page--single" data-paper={config.paperStyle}>
      {headerLines.map((line, index) => (
        <p
          key={`${line}-${index}`}
          className={[
            "jg-book-page__meta",
            index === 0 ? "jg-book-page__meta--primary" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {line}
        </p>
      ))}
      <h2 className="jg-book-page__journal-title">{config.name}</h2>
      <p
        className="jg-book-page__preview-line"
        data-font={config.fontId}
        data-ink={config.inkColor}
        data-pen={config.penStyle}
      >
        {JOURNAL_CEREMONY_TODAY_INTRO}
      </p>
    </article>
  );
}

/** @deprecated Use FirstOpenReadyPage + FirstOpenDatePage */
export function FirstOpenTodayPage(props: FirstOpenTodayProps) {
  return <FirstOpenDatePage {...props} />;
}

export type BookCreationDraft = Pick<
  JournalGazeboConfig,
  "leatherColor" | "name" | "embossedTitle" | "ownerName"
> & {
  dedicationHtml?: string;
};
