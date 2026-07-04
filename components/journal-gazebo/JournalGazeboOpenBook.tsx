"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { CREATION_CEREMONY_PAGE_COUNT, volumePageLabel } from "@/lib/journalGazebo/bookCeremony";
import { journalCoverImageUrl, journalCoverTitle } from "@/lib/journalGazebo/coverArt";
import { CINEMATIC } from "@/lib/journalGazebo/cinematicTiming";
import { JOURNAL_PAGE_PLACEHOLDER } from "@/lib/journalGazebo/hospitality";
import { buildJournalPageHeader } from "@/lib/journalGazebo/journalPageHeader";
import { FIRST_WRITING_PAGE_INDEX, getPageBody, resolvePageTypingStyle, savePageBody } from "@/lib/journalGazebo/journalPageStorage";
import {
  focusEditableAtStart,
  focusWritingAtPageStart,
  plainTextFromHtml,
  ruledPaperStyle,
  sanitizePageHtml,
  type TypingStyle,
} from "@/lib/journalGazebo/writingSurface";
import { playJournalPageTurnSound } from "@/lib/journalGazebo/ritualSounds";
import { pickJournalPageTip } from "@/lib/journalGazebo/writingPrompts";
import type { JournalGazeboConfig, JournalGazeboPhase } from "@/lib/journalGazebo/types";
import {
  ChooseLeatherPage,
  DedicationPage,
  FirstOpenWelcomePage,
  InsideCoverPage,
  LeatherMemoryPage,
  OrderCardMemoryPage,
  OrderCardNamePage,
  WelcomeMemoryPage,
} from "./JournalGazeboBookCeremonyPages";
import { JournalCoverEmboss } from "./JournalCoverEmboss";
import { JournalGazeboPageChrome } from "./JournalGazeboPageChrome";
import { JournalGazeboPageFolio } from "./JournalGazeboPageFolio";
import { JournalGazeboWritingSurface } from "./JournalGazeboWritingSurface";

export type OpenBookView = "closed" | "opening" | "open";

type Props = {
  phase: JournalGazeboPhase;
  config: JournalGazeboConfig;
  pageIndex: number;
  onPageIndexChange: (index: number) => void;
  memberFirstName: string;
  body: string;
  onBodyChange: (next: string) => void;
  paperRef: RefObject<HTMLDivElement | null>;
  showTime: boolean;
  tasselY: number;
  onTasselYChange: (y: number) => void;
  onOpenComplete?: () => void;
  onRequestOpen?: () => void;
  onRequestClose?: () => void;
  arrived?: boolean;
  creationCeremony?: boolean;
  onDraftPatch?: (patch: Partial<JournalGazeboConfig>) => void;
  dedicationHtml?: string;
  onDedicationChange?: (html: string) => void;
  onDedicationComplete?: () => void;
  pageTypingStyle?: TypingStyle;
  onPageTypingStyleChange?: (patch: Partial<TypingStyle>) => void;
};

function viewForPhase(phase: JournalGazeboPhase): OpenBookView {
  if (phase === "book-creation") return "open";
  if (phase === "journal-reveal") return "closed";
  if (phase === "journal-opening") return "opening";
  return "open";
}

function SingleForePageStack() {
  return (
    <span className="jg-open-book__fore-page-block jg-open-book__fore-page-block--single" aria-hidden="true">
      <span className="jg-open-book__fore-page-sheet jg-open-book__fore-page-sheet--6" />
      <span className="jg-open-book__fore-page-sheet jg-open-book__fore-page-sheet--5" />
      <span className="jg-open-book__fore-page-sheet jg-open-book__fore-page-sheet--4" />
      <span className="jg-open-book__fore-page-sheet jg-open-book__fore-page-sheet--3" />
      <span className="jg-open-book__fore-page-sheet jg-open-book__fore-page-sheet--2" />
      <span className="jg-open-book__fore-page-sheet jg-open-book__fore-page-sheet--1" />
    </span>
  );
}

function ForePageBlock({ single = false }: { single?: boolean }) {
  if (single) {
    return <SingleForePageStack />;
  }

  return (
    <span className="jg-open-book__fore-page-block" aria-hidden="true">
      <span className="jg-open-book__fore-page-sheet jg-open-book__fore-page-sheet--4" />
      <span className="jg-open-book__fore-page-sheet jg-open-book__fore-page-sheet--3" />
      <span className="jg-open-book__fore-page-sheet jg-open-book__fore-page-sheet--2" />
      <span className="jg-open-book__fore-page-sheet jg-open-book__fore-page-sheet--1" />
    </span>
  );
}

function SingleBookChrome() {
  return (
    <>
      <span className="jg-open-book__leather-rim jg-open-book__leather-rim--top" aria-hidden="true" />
      <span className="jg-open-book__leather-rim jg-open-book__leather-rim--bottom" aria-hidden="true" />
      <span className="jg-open-book__single-cover" aria-hidden="true" />
      <span className="jg-open-book__single-spine" aria-hidden="true">
        <span className="jg-open-book__single-spine-fabric" />
        <span className="jg-open-book__single-spine-stitch" />
      </span>
      <ForePageBlock single />
    </>
  );
}

function PageShell({
  side,
  paperStyle,
  pageIndex,
  lined,
  children,
  surfaceStyle,
  memory = false,
  active = false,
  hideForeEdge = false,
}: {
  side: "left" | "right";
  paperStyle: string;
  pageIndex: number;
  lined?: boolean;
  children: ReactNode;
  surfaceStyle?: CSSProperties;
  memory?: boolean;
  active?: boolean;
  hideForeEdge?: boolean;
}) {
  return (
    <div
      className={[
        "jg-open-book__page",
        side === "left" ? "jg-open-book__page--left" : "jg-open-book__page--right",
        lined ? "jg-open-book__page--lined" : "",
        memory ? "jg-open-book__page--memory" : "",
        active ? "jg-open-book__page--active" : "",
        "jg-book-paper",
      ]
        .filter(Boolean)
        .join(" ")}
      data-paper={paperStyle}
      style={surfaceStyle}
    >
      {hideForeEdge ? null : <span className="jg-open-book__page-edge jg-open-book__page-edge--outer" aria-hidden="true" />}
      {hideForeEdge ? null : (
        <span className="jg-open-book__fore-edge" aria-hidden="true">
          <span className="jg-open-book__fore-edge-gilt" />
          <span className="jg-open-book__fore-edge-sheet" />
          <span className="jg-open-book__fore-edge-sheet" />
          <span className="jg-open-book__fore-edge-sheet" />
        </span>
      )}
      {hideForeEdge ? null : (
        <>
          <span className="jg-open-book__gilt-edge jg-open-book__gilt-edge--head" aria-hidden="true" />
          <span className="jg-open-book__gilt-edge jg-open-book__gilt-edge--tail" aria-hidden="true" />
        </>
      )}
      <span className="jg-open-book__page-lift" aria-hidden="true" />
      {hideForeEdge ? null : <JournalGazeboPageChrome pageIndex={pageIndex} />}
      <div className="jg-open-book__page-inner">
        <span className="jg-open-book__paper-fiber" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}

function EstateSideNav({
  side,
  onClick,
  disabled,
  label,
}: {
  side: "prev" | "next";
  onClick?: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      className={[
        "jg-design-studio__nav",
        `jg-design-studio__nav--${side}`,
        "jg-estate-side-nav",
        `jg-estate-side-nav--${side}`,
      ].join(" ")}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      <span className="jg-design-studio__nav-plate" aria-hidden="true" />
      <span className="jg-design-studio__nav-arrow" aria-hidden="true">
        {side === "prev" ? "‹" : "›"}
      </span>
    </button>
  );
}

/** Centered heirloom journal — ceremony spreads and writing. */
export function JournalGazeboOpenBook({
  phase,
  config,
  pageIndex,
  onPageIndexChange,
  memberFirstName,
  body,
  onBodyChange,
  paperRef,
  showTime,
  tasselY: _tasselY,
  onTasselYChange: _onTasselYChange,
  onOpenComplete,
  onRequestOpen,
  onRequestClose,
  arrived = true,
  creationCeremony = false,
  onDraftPatch,
  dedicationHtml = "",
  onDedicationChange,
  onDedicationComplete,
  pageTypingStyle,
  onPageTypingStyleChange,
}: Props) {
  const view = viewForPhase(phase);
  const coverImage = journalCoverImageUrl(config);
  const ownerName = memberFirstName.trim() || config.ownerName?.trim() || config.name.trim();
  const spreadRef = useRef<HTMLDivElement>(null);
  const [turning, setTurning] = useState<"forward" | "back" | null>(null);
  const [pageReady, setPageReady] = useState(false);
  const turnTimersRef = useRef<number[]>([]);
  const openCompletedRef = useRef(false);

  const pageHeader = useMemo(() => buildJournalPageHeader(new Date(), showTime), [showTime]);
  const isLined = config.paperStyle === "linen";
  const isWritingPage = pageIndex >= FIRST_WRITING_PAGE_INDEX;
  const isCeremonyPage = pageIndex < FIRST_WRITING_PAGE_INDEX;
  const activePageStyle = useMemo(
    () => pageTypingStyle ?? resolvePageTypingStyle(config.id, pageIndex, config),
    [pageTypingStyle, config, pageIndex],
  );
  const ruledSurfaceStyle = isLined && isWritingPage
    ? (ruledPaperStyle(config, activePageStyle) as CSSProperties)
    : undefined;

  const leftWritingBody =
    isWritingPage && pageIndex > FIRST_WRITING_PAGE_INDEX
      ? getPageBody(config.id, pageIndex - 1)
      : "";

  const clearTurnTimers = useCallback(() => {
    for (const id of turnTimersRef.current) {
      window.clearTimeout(id);
    }
    turnTimersRef.current = [];
  }, []);

  const scheduleTurn = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    turnTimersRef.current.push(id);
    return id;
  }, []);

  useEffect(() => () => clearTurnTimers(), [clearTurnTimers]);

  useEffect(() => {
    setPageReady(false);
    const timer = window.setTimeout(() => setPageReady(true), CINEMATIC.pageAdmireMs);
    return () => window.clearTimeout(timer);
  }, [pageIndex]);

  const canGoBack =
    !turning &&
    !creationCeremony &&
    (pageIndex > 0 || view === "open");
  const canTurnForward = pageReady && !turning && isWritingPage;
  const canGoNext =
    !turning &&
    !creationCeremony &&
    (isCeremonyPage
      ? pageReady && pageIndex < FIRST_WRITING_PAGE_INDEX
      : canTurnForward);

  const turnForward = useCallback(() => {
    if (!canTurnForward) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    playJournalPageTurnSound();
    if (reduced) {
      onPageIndexChange(pageIndex + 1);
      return;
    }
    clearTurnTimers();
    setTurning("forward");
    scheduleTurn(() => onPageIndexChange(pageIndex + 1), CINEMATIC.pageTurnMs);
    scheduleTurn(() => setTurning(null), CINEMATIC.pageTurnMs + CINEMATIC.pageTurnPauseMs);
  }, [canTurnForward, clearTurnTimers, onPageIndexChange, pageIndex, scheduleTurn]);

  const turnCeremonyForward = useCallback(() => {
    if (!pageReady || turning) return;
    playJournalPageTurnSound();
    onPageIndexChange(pageIndex + 1);
  }, [onPageIndexChange, pageIndex, pageReady, turning]);

  const goBack = useCallback(() => {
    if (!canGoBack) return;
    if (pageIndex === 0 && view === "open") {
      playJournalPageTurnSound();
      onRequestClose?.();
      return;
    }
    playJournalPageTurnSound();
    onPageIndexChange(pageIndex - 1);
  }, [canGoBack, onPageIndexChange, onRequestClose, pageIndex, view]);

  const handleWritingOverflow = useCallback(
    (overflowHtml: string) => {
      if (!canTurnForward || turning) return;
      const el = paperRef.current;
      if (!el) return;
      const kept = sanitizePageHtml(el.innerHTML);
      savePageBody(config.id, pageIndex, kept);
      const nextIndex = pageIndex + 1;
      const existing = getPageBody(config.id, nextIndex);
      savePageBody(config.id, nextIndex, `${overflowHtml}${existing}`);
      onBodyChange(kept);
      turnForward();
    },
    [canTurnForward, config.id, onBodyChange, pageIndex, paperRef, turnForward, turning],
  );

  function promptForWritingPage(forIndex: number): string | null {
    const html = forIndex === pageIndex ? body : getPageBody(config.id, forIndex);
    if (plainTextFromHtml(html).trim()) return null;
    if (forIndex <= FIRST_WRITING_PAGE_INDEX) return null;
    return pickJournalPageTip(forIndex);
  }

  function renderWritingPage(forIndex: number, editable: boolean) {
    const pageStyle =
      editable && pageTypingStyle
        ? pageTypingStyle
        : resolvePageTypingStyle(config.id, forIndex, config);
    const prompt = promptForWritingPage(forIndex);
    return (
      <article className="jg-open-book__writing">
        <header className="jg-open-book__writing-header">
          {pageHeader.lines.map((line, index) => (
            <p
              key={`${line}-${index}`}
              className={[
                "jg-open-book__writing-meta",
                index === 0 ? "jg-open-book__writing-meta--primary" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {line}
            </p>
          ))}
        </header>
        {prompt ? (
          <p className="jg-open-book__writing-prompt jg-open-book__writing-prompt--solo">
            {prompt}
          </p>
        ) : null}
        {editable ? (
          <JournalGazeboWritingSurface
            editorRef={paperRef}
            config={config}
            typingStyle={pageStyle}
            html={body}
            onHtmlChange={onBodyChange}
            onTypingStyleChange={onPageTypingStyleChange}
            journalId={config.id}
            pageIndex={forIndex}
            placeholder={JOURNAL_PAGE_PLACEHOLDER}
            className="jg-open-book__writing-input"
            aria-label={JOURNAL_PAGE_PLACEHOLDER}
            pageBound
            onPageOverflow={handleWritingOverflow}
            onMakeDefault={
              onDraftPatch && pageTypingStyle
                ? () =>
                    onDraftPatch({
                      fontId: pageTypingStyle.fontId,
                      inkColor: pageTypingStyle.inkColor,
                      penStyle: pageTypingStyle.penStyle,
                      nibSize: pageTypingStyle.nibSize,
                      writingFontSize: pageTypingStyle.writingFontSize,
                    })
                : undefined
            }
          />
        ) : (
          <JournalGazeboWritingSurface
            config={config}
            typingStyle={pageStyle}
            html={getPageBody(config.id, forIndex)}
            readOnly
            journalId={config.id}
            pageIndex={forIndex}
            className="jg-open-book__writing-input jg-open-book__writing-input--readonly"
          />
        )}
      </article>
    );
  }

  const goNext = useCallback(() => {
    if (!canGoNext) return;
    if (isCeremonyPage) {
      turnCeremonyForward();
      return;
    }
    turnForward();
  }, [canGoNext, isCeremonyPage, turnCeremonyForward, turnForward]);

  useEffect(() => {
    if (view !== "opening" || openCompletedRef.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ms = reduced ? 120 : CINEMATIC.journalCoverOpenMs;
    const timer = window.setTimeout(() => {
      if (openCompletedRef.current) return;
      openCompletedRef.current = true;
      onOpenComplete?.();
    }, ms);
    return () => window.clearTimeout(timer);
  }, [view, onOpenComplete]);

  useEffect(() => {
    if (!isWritingPage) return;
    const timer = window.setTimeout(() => {
      const el = paperRef.current;
      if (!el) return;
      focusWritingAtPageStart(el, config, activePageStyle);
    }, 280);
    return () => window.clearTimeout(timer);
  }, [activePageStyle, config, isWritingPage, pageIndex, paperRef]);

  useEffect(() => {
    if (pageIndex !== 0 || creationCeremony || !isCeremonyPage) return;
    const timer = window.setTimeout(() => {
      const area = spreadRef.current?.querySelector<HTMLElement>(
        ".jg-book-page__dedication-area[contenteditable]",
      );
      if (!area) return;
      focusEditableAtStart(area);
    }, 320);
    return () => window.clearTimeout(timer);
  }, [creationCeremony, isCeremonyPage, pageIndex]);

  function renderCreationLeftPage() {
    if (pageIndex === 0) return <InsideCoverPage />;
    if (pageIndex === 1) return <LeatherMemoryPage leatherColor={config.leatherColor} />;
    if (pageIndex === 2) return <OrderCardMemoryPage name={config.name} />;
    return null;
  }

  function renderLeftPage() {
    if (creationCeremony) return renderCreationLeftPage();

    if (pageIndex === 0) {
      return (
        <div className="jg-open-book__inside-cover-page">
          <div
            className="jg-open-book__inside-cover-art"
            style={coverImage ? { backgroundImage: `url(${coverImage})` } : undefined}
          />
          <span className="jg-open-book__inside-cover-texture" aria-hidden="true" />
        </div>
      );
    }

    if (isWritingPage && leftWritingBody) {
      const leftStyle = resolvePageTypingStyle(config.id, pageIndex - 1, config);
      return (
        <article className="jg-open-book__writing jg-open-book__writing--readonly">
          <JournalGazeboWritingSurface
            config={config}
            typingStyle={leftStyle}
            html={leftWritingBody}
            readOnly
            journalId={config.id}
            pageIndex={pageIndex - 1}
            className="jg-open-book__writing-input"
          />
        </article>
      );
    }

    if (pageIndex >= 1) return <WelcomeMemoryPage />;
    return null;
  }

  function renderRightPage(forIndex: number = pageIndex) {
    const writingPage = forIndex >= FIRST_WRITING_PAGE_INDEX;
    const ceremonyPage = forIndex < FIRST_WRITING_PAGE_INDEX;

    if (creationCeremony && forIndex < CREATION_CEREMONY_PAGE_COUNT) {
      if (forIndex === 0) {
        return (
          <ChooseLeatherPage
            leatherColor={config.leatherColor}
            onLeatherChange={(color) => onDraftPatch?.({ leatherColor: color })}
            onContinue={turnCeremonyForward}
            pageReady={pageReady}
          />
        );
      }
      if (forIndex === 1) {
        return (
          <OrderCardNamePage
            name={config.name}
            onNameChange={(name) =>
              onDraftPatch?.({ name, embossedTitle: name, ownerName: ownerName || name })
            }
            onContinue={turnCeremonyForward}
            pageReady={pageReady}
          />
        );
      }
      if (forIndex === 2) {
        return (
          <DedicationPage
            ownerName={ownerName}
            dedication={dedicationHtml}
            onDedicationChange={(html) => onDedicationChange?.(html)}
            onSave={() => onDedicationComplete?.()}
            onSkip={() => onDedicationComplete?.()}
            pageReady={pageReady}
          />
        );
      }
      return null;
    }

    if (ceremonyPage && forIndex === 0) {
      return <FirstOpenWelcomePage />;
    }

    if (writingPage && forIndex === pageIndex) {
      return renderWritingPage(forIndex, true);
    }

    if (writingPage) {
      return renderWritingPage(forIndex, false);
    }

    return null;
  }

  function renderSinglePage(forIndex: number = pageIndex) {
    if (forIndex === 0) {
      return <FirstOpenWelcomePage />;
    }

    if (forIndex >= FIRST_WRITING_PAGE_INDEX && forIndex === pageIndex) {
      return renderWritingPage(forIndex, true);
    }

    if (forIndex >= FIRST_WRITING_PAGE_INDEX) {
      return renderWritingPage(forIndex, false);
    }

    return null;
  }

  function renderSinglePageLeaf(forIndex: number, active = false) {
    const writingPage = forIndex >= FIRST_WRITING_PAGE_INDEX;
    return (
      <div
        className={[
          "jg-open-book__single-leaf",
          forIndex < FIRST_WRITING_PAGE_INDEX ? "jg-open-book__single-leaf--ceremony" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <PageShell
          side="right"
          paperStyle={config.paperStyle}
          pageIndex={forIndex}
          lined={isLined && writingPage}
          surfaceStyle={
            writingPage && forIndex === pageIndex ? ruledSurfaceStyle : undefined
          }
          active={active}
          memory={false}
          hideForeEdge={false}
        >
          {renderSinglePage(forIndex)}
        </PageShell>
        <JournalGazeboPageFolio pageIndex={forIndex} />
      </div>
    );
  }

  if (view === "closed" || view === "opening") {
    return (
      <>
        <EstateSideNav side="prev" disabled label="Previous" />
        {onRequestOpen ? (
          <EstateSideNav side="next" onClick={onRequestOpen} label="Open journal" />
        ) : (
          <EstateSideNav side="next" disabled label="Open journal" />
        )}
        <div
          className={[
            "jg-open-book",
            "jg-open-book--closed",
            view === "opening" ? "jg-open-book--focus jg-open-book--opening" : "jg-open-book--awaiting-open",
            arrived ? "jg-open-book--arrived" : "",
            view === "closed" ? "jg-open-book--floating" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
        {view === "opening" ? (
          <span className="jg-open-book__focus-veil" aria-hidden="true" />
        ) : null}
        <div
          className="jg-open-book__stage jg-open-book__stage--closed"
          style={{ "--jg-cover-open-ms": `${CINEMATIC.journalCoverOpenMs}ms` } as CSSProperties}
        >
          <div className="jg-closed-journal" data-leather={config.leatherColor}>
            <span className="jg-closed-journal__shadow" aria-hidden="true" />
            <span className="jg-closed-journal__spine" aria-hidden="true" />
            <span className="jg-closed-journal__page-block" aria-hidden="true">
              <span className="jg-closed-journal__page-sheet jg-closed-journal__page-sheet--4" />
              <span className="jg-closed-journal__page-sheet jg-closed-journal__page-sheet--3" />
              <span className="jg-closed-journal__page-sheet jg-closed-journal__page-sheet--2" />
              <span className="jg-closed-journal__page-sheet jg-closed-journal__page-sheet--1" />
            </span>
            <div className="jg-closed-journal__folio">
              <span className="jg-closed-journal__endpaper" aria-hidden="true" />
              {view === "opening" ? (
                <div className="jg-closed-journal__opening-leaf" aria-hidden="true">
                  <FirstOpenWelcomePage />
                </div>
              ) : null}
              <div
                className={[
                  "jg-closed-journal__cover",
                  coverImage ? "jg-closed-journal__cover--printed" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={
                  coverImage
                    ? {
                        backgroundImage: `url(${coverImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center center",
                        backgroundRepeat: "no-repeat",
                      }
                    : undefined
                }
              >
                <span className="jg-closed-journal__cover-inside" aria-hidden="true" />
                <span className="jg-closed-journal__cover-edge" aria-hidden="true" />
                <span className="jg-closed-journal__leather-thickness" aria-hidden="true" />
                <JournalCoverEmboss title={journalCoverTitle(config)} />
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
    );
  }

  if (!creationCeremony) {
    return (
      <>
        <EstateSideNav
          side="prev"
          onClick={goBack}
          disabled={!canGoBack}
          label="Previous page"
        />
        <EstateSideNav
          side="next"
          onClick={goNext}
          disabled={!canGoNext}
          label="Next page"
        />
        <div
          className={[
            "jg-open-book",
            "jg-open-book--open",
            "jg-open-book--single",
            arrived ? "jg-open-book--arrived" : "",
            turning === "forward" ? "jg-open-book--turning-forward" : "",
            turning === "back" ? "jg-open-book--turning-back" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{ "--jg-page-turn-ms": `${CINEMATIC.pageTurnMs}ms` } as CSSProperties}
        >
        <div className="jg-open-book__stage jg-open-book__stage--single">
          <div
            className="jg-open-book__volume jg-open-book__volume--single"
            data-leather={config.leatherColor}
            style={
              {
                "--jg-filled-pages": Math.max(0, pageIndex),
                "--jg-remaining-stack": Math.max(6, 22 - pageIndex),
              } as CSSProperties
            }
          >
            <SingleBookChrome />
            <div
              className={[
                "jg-open-book__spread",
                "jg-open-book__spread--single",
                turning ? `jg-open-book__spread--turning-${turning}` : "",
              ]
                .filter(Boolean)
                .join(" ")}
              ref={spreadRef}
            >
              {turning === "forward" ? (
                <div className="jg-open-book__under-next jg-open-book__under-next--single">
                  {renderSinglePageLeaf(pageIndex + 1, true)}
                </div>
              ) : null}

              {turning === "forward" ? (
                <div className="jg-flip-leaf jg-flip-leaf--single" aria-hidden="true">
                  <div className="jg-flip-leaf__sheet">
                    <div className="jg-flip-leaf__front">
                      {renderSinglePageLeaf(pageIndex, true)}
                    </div>
                    <div
                      className="jg-flip-leaf__back jg-book-paper"
                      data-paper={config.paperStyle}
                    />
                  </div>
                </div>
              ) : (
                renderSinglePageLeaf(pageIndex, true)
              )}
            </div>
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <EstateSideNav
        side="prev"
        onClick={goBack}
        disabled={!canGoBack}
        label="Previous page"
      />
      <EstateSideNav
        side="next"
        onClick={goNext}
        disabled={!canGoNext}
        label="Next page"
      />
      <div
        className={[
          "jg-open-book",
          "jg-open-book--open",
          "jg-open-book--creation",
          arrived ? "jg-open-book--arrived" : "",
          turning === "forward" ? "jg-open-book--turning-forward" : "",
          turning === "back" ? "jg-open-book--turning-back" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ "--jg-page-turn-ms": `${CINEMATIC.pageTurnMs}ms` } as CSSProperties}
      >
      <div className="jg-open-book__stage jg-open-book__stage--open">
        <div
          className="jg-open-book__volume"
          data-leather={config.leatherColor}
          style={{ "--jg-filled-pages": Math.max(0, pageIndex) } as CSSProperties}
        >
          <span className="jg-open-book__leather-rim jg-open-book__leather-rim--top" aria-hidden="true" />
          <span className="jg-open-book__leather-rim jg-open-book__leather-rim--bottom" aria-hidden="true" />
          <span className="jg-open-book__page-stack jg-open-book__page-stack--left" aria-hidden="true" />
          <span className="jg-open-book__page-stack jg-open-book__page-stack--right" aria-hidden="true" />
          <div className="jg-open-book__binding" aria-hidden="true">
            <span className="jg-open-book__binding-fabric" />
            <span className="jg-open-book__binding-stitch" />
            <span className="jg-open-book__binding-gap jg-open-book__binding-gap--upper" />
            <span className="jg-open-book__binding-gap jg-open-book__binding-gap--lower" />
          </div>
          <div
            className={[
              "jg-open-book__spread",
              turning ? `jg-open-book__spread--turning-${turning}` : "",
            ]
              .filter(Boolean)
              .join(" ")}
            ref={spreadRef}
          >
            <span className="jg-open-book__gutter-well" aria-hidden="true" />
            <PageShell
              side="left"
              paperStyle={config.paperStyle}
              pageIndex={pageIndex}
              lined={isLined && isWritingPage}
              surfaceStyle={ruledSurfaceStyle}
              memory={pageIndex > 0}
            >
              {renderLeftPage()}
            </PageShell>

            {turning === "forward" ? (
              <div className="jg-open-book__under-next">
                <PageShell
                  side="right"
                  paperStyle={config.paperStyle}
                  pageIndex={pageIndex + 1}
                  lined={isLined && pageIndex + 1 >= FIRST_WRITING_PAGE_INDEX}
                  active
                >
                  {renderRightPage(pageIndex + 1)}
                </PageShell>
              </div>
            ) : null}

            {turning === "forward" ? (
              <div className="jg-flip-leaf" aria-hidden="true">
                <div className="jg-flip-leaf__sheet">
                  <div className="jg-flip-leaf__front">
                    <PageShell
                      side="right"
                      paperStyle={config.paperStyle}
                      pageIndex={pageIndex}
                      lined={isLined && isWritingPage}
                      surfaceStyle={ruledSurfaceStyle}
                      active
                    >
                      {renderRightPage(pageIndex)}
                    </PageShell>
                  </div>
                  <div
                    className="jg-flip-leaf__back jg-book-paper"
                    data-paper={config.paperStyle}
                  />
                </div>
              </div>
            ) : (
              <PageShell
                side="right"
                paperStyle={config.paperStyle}
                pageIndex={pageIndex}
                lined={isLined && isWritingPage}
                surfaceStyle={ruledSurfaceStyle}
                active
              >
                {renderRightPage(pageIndex)}
              </PageShell>
            )}
          </div>
        </div>
      </div>
      {creationCeremony && isCeremonyPage ? (
        <p className="jg-open-book__page-counter jg-open-book__page-counter--spread">
          {volumePageLabel(pageIndex)}
        </p>
      ) : null}
    </div>
    </>
  );
}
