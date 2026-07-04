"use client";

import type { RefObject } from "react";
import { JOURNAL_FIRST_PAGE_PROMPT, JOURNAL_PAGE_PLACEHOLDER } from "@/lib/journalGazebo/hospitality";
import type { JournalGazeboConfig } from "@/lib/journalGazebo/types";
import { resolvePageTypingStyle } from "@/lib/journalGazebo/journalPageStorage";
import type { TypingStyle } from "@/lib/journalGazebo/writingSurface";
import { JournalGazeboWritingSurface } from "./JournalGazeboWritingSurface";

type Props = {
  config: JournalGazeboConfig;
  body: string;
  onBodyChange: (next: string) => void;
  paperRef: RefObject<HTMLDivElement | null>;
  dateLabel: string;
  timeLabel: string;
  showTime: boolean;
  pageIndex?: number;
  typingStyle?: TypingStyle;
  onTypingStyleChange?: (patch: Partial<TypingStyle>) => void;
};

/** Today's page inside the open journal — quiet, unhurried. */
export function JournalGazeboWritingPage({
  config,
  body,
  onBodyChange,
  paperRef,
  dateLabel,
  timeLabel,
  showTime,
  pageIndex = 2,
  typingStyle,
  onTypingStyleChange,
}: Props) {
  const pageStyle =
    typingStyle ?? resolvePageTypingStyle(config.id, pageIndex, config);

  return (
    <article className="journal-gazebo__inner-page" data-paper={config.paperStyle}>
      <header className="journal-gazebo__inner-page-header">
        <p className="journal-gazebo__inner-page-date">{dateLabel}</p>
        {showTime ? (
          <p className="journal-gazebo__inner-page-time">{timeLabel}</p>
        ) : null}
        <h1 className="journal-gazebo__inner-page-title">{config.name}</h1>
        <p className="journal-gazebo__inner-page-thought">{JOURNAL_FIRST_PAGE_PROMPT}</p>
      </header>

      <JournalGazeboWritingSurface
        editorRef={paperRef}
        config={config}
        typingStyle={pageStyle}
        html={body}
        onHtmlChange={onBodyChange}
        journalId={config.id}
        pageIndex={pageIndex}
        placeholder={JOURNAL_PAGE_PLACEHOLDER}
        onTypingStyleChange={onTypingStyleChange}
        className="journal-gazebo__inner-page-input"
        aria-label={JOURNAL_FIRST_PAGE_PROMPT}
      />
      <span className="journal-gazebo__page-flame" aria-hidden="true" />
    </article>
  );
}
