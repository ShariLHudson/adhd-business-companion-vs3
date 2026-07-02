"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildGrowthReportContent,
  downloadGrowthReportHtml,
  printGrowthReport,
} from "@/lib/growthReports";
import {
  buildStorybookPreview,
  defaultStorybookChapters,
  defaultStorybookStyle,
  includesFromChapters,
  resolveStorybookStyle,
  storybookReportTypeToExport,
  STORYBOOK_CHAPTERS,
  STORYBOOK_FUTURE_TYPES,
  STORYBOOK_STYLES,
  type StorybookChapterId,
  type StorybookStyleId,
} from "@/lib/storybookBuilder";
import "@/app/companion/storybook-builder.css";

type GrowthReportsPanelProps = {
  open: boolean;
  onClose: () => void;
  embedded?: boolean;
};

function ChapterIcon({ kind }: { kind: (typeof STORYBOOK_CHAPTERS)[number]["icon"] }) {
  const paths: Record<(typeof STORYBOOK_CHAPTERS)[number]["icon"], string> = {
    spark: "M12 2l1.6 5.2L19 9l-5.2 1.6L12 16l-1.6-5.4L5 9l5.4-1.8L12 2z",
    shield: "M12 3l7 3v6c0 4.2-2.8 7.8-7 9-4.2-1.2-7-4.8-7-9V6l7-3z",
    quill: "M4 18l10-10 2 2L6 20H4v-2zm11-9l2-2a2.8 2.8 0 10-4-4l-2 2 4 4z",
    portfolio: "M4 6h16v12H4V6zm2 2v8h12V8H6zm2 2h8v4H8v-4z",
    camera: "M8 7h2l1-2h4l1 2h2a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2zm4 3.5A3.5 3.5 0 1112 18a3.5 3.5 0 010-7.5z",
    voice: "M12 14a3 3 0 003-3V6a3 3 0 10-6 0v5a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2zm-5 7v3m-4 0h8",
    star: "M12 3.5l2.4 4.9 5.4.8-3.9 3.8.9 5.3L12 15.8 7.2 18.3l.9-5.3L4.2 9.2l5.4-.8L12 3.5z",
  };

  return (
    <svg
      className="storybook-builder__chapter-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[kind]} />
    </svg>
  );
}

function StorybookPreviewCard({
  preview,
}: {
  preview: ReturnType<typeof buildStorybookPreview>;
}) {
  return (
    <aside className="storybook-builder__preview" aria-label="Storybook preview">
      <div className="storybook-builder__book">
        <div className="storybook-builder__book-spine" aria-hidden="true" />
        <div className="storybook-builder__book-cover">
          <p className="storybook-builder__book-eyebrow">A keepsake by Spark</p>
          <h3 className="storybook-builder__book-title">{preview.coverTitle}</h3>
          <p className="storybook-builder__book-author">{preview.author}</p>
        </div>
      </div>

      <dl className="storybook-builder__preview-stats">
        <div className="storybook-builder__preview-stat">
          <dt>Estimated Pages</dt>
          <dd>{preview.estimatedPages}</dd>
        </div>
        <div className="storybook-builder__preview-stat">
          <dt>Chapters Selected</dt>
          <dd>{preview.chaptersSelected}</dd>
        </div>
        <div className="storybook-builder__preview-stat">
          <dt>Photos Included</dt>
          <dd>{preview.photosIncluded}</dd>
        </div>
        <div className="storybook-builder__preview-stat">
          <dt>Last Updated</dt>
          <dd>{preview.lastUpdatedLabel}</dd>
        </div>
      </dl>
    </aside>
  );
}

function StorybookBuilderBody({
  embedded,
  onClose,
}: {
  embedded?: boolean;
  onClose: () => void;
}) {
  const [selectedChapters, setSelectedChapters] = useState<StorybookChapterId[]>(
    defaultStorybookChapters,
  );
  const [selectedStyle, setSelectedStyle] = useState<StorybookStyleId>(
    defaultStorybookStyle(),
  );
  const [status, setStatus] = useState<string | null>(null);

  const preview = useMemo(
    () =>
      buildStorybookPreview({
        chapterIds: selectedChapters,
        styleId: selectedStyle,
      }),
    [selectedChapters, selectedStyle],
  );

  const toggleChapter = useCallback((id: StorybookChapterId) => {
    setSelectedChapters((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
    setStatus(null);
  }, []);

  function buildContent() {
    const style = resolveStorybookStyle(selectedStyle);
    const includes = includesFromChapters(selectedChapters);
    return buildGrowthReportContent({
      reportType: storybookReportTypeToExport(style.reportType),
      reportStyle: style.reportStyle,
      includes: Object.entries(includes)
        .filter(([, enabled]) => enabled)
        .map(([key]) => key),
    });
  }

  function handleBuild() {
    if (!selectedChapters.length) return;
    printGrowthReport(buildContent());
    setStatus("Your storybook is opening — save as PDF whenever you feel ready.");
  }

  function handleDownloadPdf() {
    if (!selectedChapters.length) return;
    printGrowthReport(buildContent());
    setStatus("Use Save as PDF in the print dialog to keep a copy.");
  }

  function handlePreparePrint() {
    if (!selectedChapters.length) return;
    printGrowthReport(buildContent());
    setStatus("Print preview opened — choose your paper and take your time.");
  }

  function handleShareDigitally() {
    setStatus("Digital sharing is coming soon — your chapters are safely gathered here.");
  }

  function handleExportArchive() {
    if (!selectedChapters.length) return;
    downloadGrowthReportHtml(buildContent());
    setStatus("Archive saved — a complete copy of your story, kept close.");
  }

  return (
    <>
      <header className="storybook-builder__header">
        <div>
          {embedded ? (
            <h1 id="storybook-builder-title" className="storybook-builder__title">
              Create Your Storybook
            </h1>
          ) : (
            <h2 id="storybook-builder-title" className="storybook-builder__title">
              Create Your Storybook
            </h2>
          )}
          <p className="storybook-builder__subtitle">
            Choose the chapters of your journey you&apos;d like to include. Spark will craft
            them into a beautiful keepsake of your story.
          </p>
        </div>
        {!embedded ? (
          <button
            type="button"
            onClick={onClose}
            className="storybook-builder__close"
            aria-label="Close storybook builder"
          >
            Close
          </button>
        ) : null}
      </header>

      <div className="storybook-builder__layout">
        <div className="storybook-builder__main">
          <section className="storybook-builder__section" aria-labelledby="storybook-chapters">
            <h3 id="storybook-chapters" className="storybook-builder__section-title">
              Story Chapters
            </h3>
            <div className="storybook-builder__chapter-grid">
              {STORYBOOK_CHAPTERS.map((chapter) => {
                const selected = selectedChapters.includes(chapter.id);
                return (
                  <button
                    key={chapter.id}
                    type="button"
                    className={`storybook-builder__chapter-card${selected ? " storybook-builder__chapter-card--selected" : ""}`}
                    aria-pressed={selected}
                    onClick={() => toggleChapter(chapter.id)}
                  >
                    <span className="storybook-builder__chapter-mark" aria-hidden="true">
                      {selected ? (
                        <svg viewBox="0 0 20 20" className="storybook-builder__chapter-check">
                          <path
                            d="M5 10.5l3 3 7-7"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <ChapterIcon kind={chapter.icon} />
                      )}
                    </span>
                    <span className="storybook-builder__chapter-copy">
                      <span className="storybook-builder__chapter-title">{chapter.title}</span>
                      <span className="storybook-builder__chapter-desc">
                        {chapter.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="storybook-builder__section" aria-labelledby="storybook-styles">
            <h3 id="storybook-styles" className="storybook-builder__section-title">
              Storybook Style
            </h3>
            <div className="storybook-builder__style-grid">
              {STORYBOOK_STYLES.map((style) => {
                const selected = selectedStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    className={`storybook-builder__style-card${selected ? " storybook-builder__style-card--selected" : ""}`}
                    aria-pressed={selected}
                    onClick={() => {
                      setSelectedStyle(style.id);
                      setStatus(null);
                    }}
                  >
                    <span className="storybook-builder__style-glyph" aria-hidden="true">
                      {style.glyph}
                    </span>
                    <span className="storybook-builder__style-copy">
                      <span className="storybook-builder__style-title">{style.title}</span>
                      <span className="storybook-builder__style-desc">{style.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {status ? (
            <p className="storybook-builder__status" role="status">
              {status}
            </p>
          ) : null}

          <div className="storybook-builder__actions">
            <button
              type="button"
              className="storybook-builder__build"
              disabled={!selectedChapters.length}
              onClick={handleBuild}
            >
              <span className="storybook-builder__build-glyph" aria-hidden="true">
                📖
              </span>
              Build My Storybook
            </button>

            <div className="storybook-builder__secondary">
              <button type="button" onClick={handleDownloadPdf}>
                Download PDF
              </button>
              <button type="button" onClick={handlePreparePrint}>
                Prepare for Printing
              </button>
              <button type="button" onClick={handleShareDigitally}>
                Share Digitally
              </button>
              <button type="button" onClick={handleExportArchive}>
                Export Archive
              </button>
            </div>
          </div>

          <section
            className="storybook-builder__future"
            aria-label="More keepsakes coming"
          >
            <p className="storybook-builder__future-lead">
              More keepsakes to bind your story, when you&apos;re ready
            </p>
            <ul className="storybook-builder__future-list">
              {STORYBOOK_FUTURE_TYPES.map((label) => (
                <li key={label} className="storybook-builder__future-pill">
                  {label}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <StorybookPreviewCard preview={preview} />
      </div>
    </>
  );
}

export function GrowthReportsPanel({ open, onClose, embedded }: GrowthReportsPanelProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  if (embedded) {
    return (
      <div className="storybook-builder storybook-builder--embedded">
        <StorybookBuilderBody embedded onClose={onClose} />
      </div>
    );
  }

  return (
    <div
      className="storybook-builder__overlay"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="storybook-builder-title"
        className="storybook-builder storybook-builder--modal"
        onClick={(e) => e.stopPropagation()}
      >
        <StorybookBuilderBody onClose={onClose} />
      </div>
    </div>
  );
}

export function GrowthReportsButton({
  onClick,
  className = "",
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        className ||
        "rounded-full border border-[#e7d9c8] bg-white px-4 py-2 text-sm font-semibold text-[#2f261f] shadow-sm hover:bg-[#faf7f2]"
      }
    >
      Create Your Storybook
    </button>
  );
}
