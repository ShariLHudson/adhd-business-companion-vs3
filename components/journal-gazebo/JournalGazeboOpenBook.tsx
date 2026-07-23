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
import {
  JOURNAL_PAGE_PLACEHOLDER,
} from "@/lib/journalGazebo/hospitality";
import { buildJournalPageHeader } from "@/lib/journalGazebo/journalPageHeader";
import {
  FIRST_WRITING_PAGE_INDEX,
  LAST_WRITING_PAGE_INDEX,
  getPageBody,
  resolvePageTypingStyle,
  savePageBody,
} from "@/lib/journalGazebo/journalPageStorage";
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
import { JournalGazeboSparkFlame } from "./JournalGazeboSparkFlame";
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
  intention,
  showPageWatermarks,
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
  intention?: JournalGazeboConfig["intention"];
  showPageWatermarks?: boolean;
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
      data-intention={intention ?? "journey"}
      data-page-images={showPageWatermarks === false ? "off" : "on"}
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
      {hideForeEdge ? null : (
        <JournalGazeboPageChrome
          pageIndex={pageIndex}
          intention={intention}
          showPageWatermarks={showPageWatermarks}
        />
      )}
      <div className="jg-open-book__page-inner">
        <span className="jg-open-book__paper-fiber" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}

/** Always-visible page turns — fixed at the bottom so members never hunt for them. */
function JournalPageTurnNav({
  onPrev,
  onNext,
  canPrev,
  canNext,
  prevLabel = "Back",
  nextLabel = "Next",
}: {
  onPrev?: () => void;
  onNext?: () => void;
  canPrev: boolean;
  canNext: boolean;
  prevLabel?: string;
  nextLabel?: string;
}) {
  return (
    <nav className="jg-page-turn-nav" aria-label="Journal pages">
      <button
        type="button"
        className="jg-page-turn-nav__btn jg-page-turn-nav__btn--prev"
        onClick={onPrev}
        disabled={!canPrev}
        aria-label={prevLabel}
        data-testid="jg-page-nav-back"
      >
        <span className="jg-page-turn-nav__arrow" aria-hidden="true">
          ‹
        </span>
        <span className="jg-page-turn-nav__label">{prevLabel}</span>
      </button>
      <button
        type="button"
        className="jg-page-turn-nav__btn jg-page-turn-nav__btn--next"
        onClick={onNext}
        disabled={!canNext}
        aria-label={nextLabel}
        data-testid="jg-page-nav-next"
      >
        <span className="jg-page-turn-nav__label">{nextLabel}</span>
        <span className="jg-page-turn-nav__arrow" aria-hidden="true">
          ›
        </span>
      </button>
    </nav>
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
    // Ceremony can linger briefly; writing pages should feel ready to turn sooner.
    const admire =
      pageIndex >= FIRST_WRITING_PAGE_INDEX
        ? Math.min(CINEMATIC.pageAdmireMs, 220)
        : CINEMATIC.pageAdmireMs;
    const timer = window.setTimeout(() => setPageReady(true), admire);
    return () => window.clearTimeout(timer);
  }, [pageIndex]);

  const canGoBack =
    !turning &&
    !creationCeremony &&
    (pageIndex > 0 || view === "open");
  const atLastWritingPage = isWritingPage && pageIndex >= LAST_WRITING_PAGE_INDEX;
  const canTurnForward =
    pageReady && !turning && isWritingPage && !atLastWritingPage;
  const canGoNext =
    !turning &&
    !creationCeremony &&
    (isCeremonyPage
      ? pageReady && pageIndex < FIRST_WRITING_PAGE_INDEX
      : pageReady && isWritingPage && (canTurnForward || atLastWritingPage));

  /** Persist live editor HTML before any remount/turn can wipe it. */
  const flushLiveEditor = useCallback(() => {
    if (pageIndex < FIRST_WRITING_PAGE_INDEX) return;
    const el = paperRef.current;
    if (!el) return;
    const live = sanitizePageHtml(el.innerHTML);
    savePageBody(config.id, pageIndex, live);
    onBodyChange(live);
  }, [config.id, onBodyChange, pageIndex, paperRef]);

  const turnForward = useCallback(() => {
    flushLiveEditor();
    if (atLastWritingPage) {
      // Experience clamps and shows JOURNAL_FULL_SPARK.
      onPageIndexChange(pageIndex + 1);
      return;
    }
    if (!canTurnForward) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    playJournalPageTurnSound(CINEMATIC.pageTurnMs);
    if (reduced) {
      onPageIndexChange(pageIndex + 1);
      return;
    }
    clearTurnTimers();
    setTurning("forward");
    scheduleTurn(() => onPageIndexChange(pageIndex + 1), CINEMATIC.pageTurnMs);
    scheduleTurn(() => setTurning(null), CINEMATIC.pageTurnMs + CINEMATIC.pageTurnPauseMs);
  }, [
    atLastWritingPage,
    canTurnForward,
    clearTurnTimers,
    flushLiveEditor,
    onPageIndexChange,
    pageIndex,
    scheduleTurn,
  ]);

  const turnCeremonyForward = useCallback(() => {
    if (!pageReady || turning) return;
    flushLiveEditor();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    playJournalPageTurnSound(CINEMATIC.pageTurnMs);
    if (reduced) {
      onPageIndexChange(pageIndex + 1);
      return;
    }
    // Right-to-left curl — same physical turn as writing pages
    clearTurnTimers();
    setTurning("forward");
    scheduleTurn(() => onPageIndexChange(pageIndex + 1), CINEMATIC.pageTurnMs);
    scheduleTurn(() => setTurning(null), CINEMATIC.pageTurnMs + CINEMATIC.pageTurnPauseMs);
  }, [
    clearTurnTimers,
    flushLiveEditor,
    onPageIndexChange,
    pageIndex,
    pageReady,
    scheduleTurn,
    turning,
  ]);

  const goBack = useCallback(() => {
    if (!canGoBack || turning) return;
    flushLiveEditor();
    if (pageIndex === 0 && view === "open") {
      playJournalPageTurnSound(Math.round(CINEMATIC.pageTurnMs * 0.55));
      onRequestClose?.();
      return;
    }
    // Instant back — no reverse curl (it remounted the editor and felt broken).
    playJournalPageTurnSound(Math.round(CINEMATIC.pageTurnMs * 0.55));
    clearTurnTimers();
    setTurning(null);
    onPageIndexChange(pageIndex - 1);
  }, [
    canGoBack,
    clearTurnTimers,
    flushLiveEditor,
    onPageIndexChange,
    onRequestClose,
    pageIndex,
    turning,
    view,
  ]);

  const handleWritingOverflow = useCallback(
    (overflowHtml: string) => {
      if (turning) return;
      if (atLastWritingPage) {
        onPageIndexChange(pageIndex + 1);
        return;
      }
      if (!canTurnForward) return;
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
    [
      atLastWritingPage,
      canTurnForward,
      config.id,
      onBodyChange,
      onPageIndexChange,
      pageIndex,
      paperRef,
      turnForward,
      turning,
    ],
  );

  function promptForWritingPage(forIndex: number): string | null {
    if (forIndex < FIRST_WRITING_PAGE_INDEX) return null;
    const html = forIndex === pageIndex ? body : getPageBody(config.id, forIndex);
    if (plainTextFromHtml(html).trim()) return null;
    return pickJournalPageTip(forIndex, new Date(), config.intention);
  }

  function renderWritingPage(forIndex: number, editable: boolean) {
    // Never mount a live editor during a page-turn curl — remounts can emit empty HTML.
    const liveEditable = editable && !turning && forIndex === pageIndex;
    const pageStyle =
      liveEditable && pageTypingStyle
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
        {liveEditable ? (
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
            html={
              forIndex === pageIndex && plainTextFromHtml(body).trim()
                ? body
                : getPageBody(config.id, forIndex)
            }
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
      // Only on page arrival — never when config/autosave identity changes.
      focusWritingAtPageStart(el, config, activePageStyle);
    }, 280);
    return () => window.clearTimeout(timer);
    // Pen/font/color/config updates must not yank the caret to the page start.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- page turn only
  }, [isWritingPage, pageIndex]);

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
          intention={config.intention}
          showPageWatermarks={config.showPageWatermarks}
          lined={isLined && writingPage}
          surfaceStyle={
            isLined && writingPage
              ? (ruledPaperStyle(
                  config,
                  forIndex === pageIndex ? activePageStyle : undefined,
                ) as CSSProperties)
              : undefined
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
        <JournalPageTurnNav
          canPrev={false}
          canNext={Boolean(onRequestOpen) && view === "closed"}
          onNext={onRequestOpen}
          prevLabel="Back"
          nextLabel="Open journal"
        />
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
              >
                {coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element -- preloaded estate plate
                  <img
                    src={coverImage}
                    alt=""
                    className="jg-closed-journal__cover-img"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    aria-hidden
                  />
                ) : null}
                <span className="jg-closed-journal__cover-inside" aria-hidden="true" />
                <span className="jg-closed-journal__cover-edge" aria-hidden="true" />
                <span className="jg-closed-journal__leather-thickness" aria-hidden="true" />
                {config.showSparkFlame !== false ? (
                  <span className="jg-closed-journal__cover-flame" aria-hidden="true">
                    <JournalGazeboSparkFlame size="sm" />
                  </span>
                ) : null}
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
        <JournalPageTurnNav
          onPrev={goBack}
          onNext={goNext}
          canPrev={canGoBack}
          canNext={canGoNext}
          prevLabel="Back"
          nextLabel={pageIndex === 0 ? "Begin writing" : "Next"}
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
          data-testid="jg-open-book-single"
          data-page-index={pageIndex}
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
                <div className="jg-page-under jg-page-under--single" aria-hidden="true">
                  {renderSinglePageLeaf(pageIndex + 1, false)}
                </div>
              ) : null}

              {turning === "forward" ? (
                <div
                  className="jg-page-curl jg-page-curl--single"
                  aria-hidden="true"
                >
                  <div className="jg-page-curl__sheet">
                    <div className="jg-page-curl__face">
                      {renderSinglePageLeaf(pageIndex, false)}
                    </div>
                    <div
                      className="jg-page-curl__back jg-book-paper"
                      data-paper={config.paperStyle}
                    />
                    <span className="jg-page-curl__spine-shade" />
                    <span className="jg-page-curl__bend" />
                    <span className="jg-page-curl__edge" />
                    <span className="jg-page-curl__fold" />
                    <span className="jg-page-curl__shine" />
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
      <JournalPageTurnNav
        onPrev={goBack}
        onNext={goNext}
        canPrev={canGoBack}
        canNext={canGoNext}
        prevLabel="Back"
        nextLabel="Next"
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
              intention={config.intention}
              showPageWatermarks={config.showPageWatermarks}
              lined={isLined && isWritingPage}
              surfaceStyle={ruledSurfaceStyle}
              memory={pageIndex > 0}
            >
              {renderLeftPage()}
            </PageShell>

            {turning === "forward" ? (
              <div className="jg-page-under" aria-hidden="true">
                <PageShell
                  side="right"
                  paperStyle={config.paperStyle}
                  pageIndex={pageIndex + 1}
                  intention={config.intention}
                  showPageWatermarks={config.showPageWatermarks}
                  lined={isLined && pageIndex + 1 >= FIRST_WRITING_PAGE_INDEX}
                  active
                >
                  {renderRightPage(pageIndex + 1)}
                </PageShell>
              </div>
            ) : null}

            {turning === "forward" ? (
              <div className="jg-page-curl" aria-hidden="true">
                <div className="jg-page-curl__sheet">
                  <div className="jg-page-curl__face">
                    <PageShell
                      side="right"
                      paperStyle={config.paperStyle}
                      pageIndex={pageIndex}
                      intention={config.intention}
                      showPageWatermarks={config.showPageWatermarks}
                      lined={isLined && isWritingPage}
                      surfaceStyle={ruledSurfaceStyle}
                      active
                    >
                      {renderRightPage(pageIndex)}
                    </PageShell>
                  </div>
                  <div
                    className="jg-page-curl__back jg-book-paper"
                    data-paper={config.paperStyle}
                  />
                  <span className="jg-page-curl__spine-shade" />
                  <span className="jg-page-curl__bend" />
                  <span className="jg-page-curl__edge" />
                  <span className="jg-page-curl__fold" />
                  <span className="jg-page-curl__shine" />
                </div>
              </div>
            ) : (
              <PageShell
                side="right"
                paperStyle={config.paperStyle}
                pageIndex={pageIndex}
                intention={config.intention}
                showPageWatermarks={config.showPageWatermarks}
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
