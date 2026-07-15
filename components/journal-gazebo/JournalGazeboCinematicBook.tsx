"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { JOURNAL_LEATHER_OPTIONS } from "@/lib/journalGazebo/catalog";
import { CINEMATIC } from "@/lib/journalGazebo/cinematicTiming";
import type { JournalWorkshopBeat } from "@/lib/journalGazebo/cinematicTypes";
import {
  JOURNAL_CREATION_BEGIN_WRITING,
  JOURNAL_CREATION_DEDICATION_HEADING,
  JOURNAL_CREATION_TURN_PAGE,
  JOURNAL_FIRST_PAGE_PROMPT,
  JOURNAL_HANDCRAFT_MESSAGE,
  JOURNAL_WORKSHOP_COVER_SPARK,
  JOURNAL_WORKSHOP_CONTINUE,
  JOURNAL_WORKSHOP_DEDICATION_LATER,
  JOURNAL_WORKSHOP_DEDICATION_SPARK,
  JOURNAL_WORKSHOP_DEDICATION_YES,
  JOURNAL_WORKSHOP_PEN_SPARK,
  JOURNAL_WORKSHOP_PAPER_SPARK,
  JOURNAL_WORKSHOP_TITLE_SPARK,
} from "@/lib/journalGazebo/hospitality";
import {
  JOURNAL_WORKSHOP_PAPER_OPTIONS,
} from "@/lib/journalGazebo/workshopCatalog";
import {
  playEmbossSound,
  playJournalPageTurnSound,
  playLeatherCreakSound,
  playPenScratchSound,
} from "@/lib/journalGazebo/ritualSounds";
import { defaultJournalConfig } from "@/lib/journalGazebo/store";
import type {
  JournalBookmarkStyle,
  JournalGazeboConfig,
  JournalLeatherColor,
  JournalPenStyle,
} from "@/lib/journalGazebo/types";
import { JournalCoverEmbossInput } from "./JournalCoverEmbossInput";
import { JournalGazeboBookmarkPicker } from "./JournalGazeboBookmarkPicker";
import { JournalGazeboDeskPens } from "./JournalGazeboDeskPens";
import { JournalGazeboHeroJournal } from "./JournalGazeboHeroJournal";
import type { JournalHeroMoment } from "./JournalGazeboHeroJournal";
import { JournalGazeboFountainPen } from "./JournalGazeboFountainPen";
import { JournalGazeboLeatherCarousel } from "./JournalGazeboLeatherCarousel";
import { JournalGazeboPaperPicker } from "./JournalGazeboPaperPicker";

type Props = {
  onComplete: (config: JournalGazeboConfig, initialBody?: string) => void;
  dateLabel: string;
  timeLabel: string;
};

const CAROUSEL_BEATS: JournalWorkshopBeat[] = ["cover-intro", "cover-select"];
const CLOSED_HERO_BEATS: JournalWorkshopBeat[] = [
  "cover-chosen",
  "step-linger",
  "title-intro",
  "title-custom",
  "title-embossing",
  "title-linger",
];
const OPEN_HERO_BEATS: JournalWorkshopBeat[] = [
  "first-opening",
  "paper-intro",
  "paper-select",
  "paper-linger",
  "pen-intro",
  "pen-select",
  "pen-linger",
  "bookmark-intro",
  "bookmark-select",
  "bookmark-linger",
  "dedication-invite",
  "future-letter",
  "turn-to-writing",
  "writing",
];

function heroMomentForBeat(beat: JournalWorkshopBeat): JournalHeroMoment {
  if (beat === "first-opening") return "opening";
  if (OPEN_HERO_BEATS.includes(beat)) return "open";
  return "closed";
}

export function JournalGazeboCinematicBook({
  onComplete,
  dateLabel,
  timeLabel,
}: Props) {
  const [beat, setBeat] = useState<JournalWorkshopBeat>("workshop-arrive");
  const [arrived, setArrived] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);
  const [paperIndex, setPaperIndex] = useState(0);
  const [bookmarkIndex, setBookmarkIndex] = useState(0);
  const [draft, setDraft] = useState(() =>
    defaultJournalConfig({ name: "", embossedTitle: "", showSparkFlame: true }),
  );
  const [dedicationDraft, setDedicationDraft] = useState("");
  const [body, setBody] = useState("");
  const [turning, setTurning] = useState(false);
  const dedicationRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);

  const patch = useCallback((partial: Partial<JournalGazeboConfig>) => {
    setDraft((current) => ({ ...current, ...partial }));
  }, []);

  const reducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const linger = useCallback(
    (next: JournalWorkshopBeat, ms: number = CINEMATIC.stepLingerMs) => {
      window.setTimeout(() => setBeat(next), reducedMotion() ? 80 : ms);
    },
    [],
  );

  const sparkLine = useMemo(() => {
    if (
      beat === "cover-chosen" ||
      beat === "title-linger" ||
      beat === "paper-linger" ||
      beat === "pen-linger" ||
      beat === "bookmark-linger"
    ) {
      return null;
    }
    if (CAROUSEL_BEATS.includes(beat)) return JOURNAL_WORKSHOP_COVER_SPARK;
    if (
      beat === "title-intro" ||
      beat === "title-custom" ||
      beat === "title-embossing"
    ) {
      return JOURNAL_WORKSHOP_TITLE_SPARK;
    }
    if (beat === "pen-intro" || beat === "pen-select") {
      return JOURNAL_WORKSHOP_PEN_SPARK;
    }
    if (beat === "paper-intro" || beat === "paper-select") {
      return JOURNAL_WORKSHOP_PAPER_SPARK;
    }
    if (beat === "dedication-invite") return JOURNAL_WORKSHOP_DEDICATION_SPARK;
    return null;
  }, [beat]);

  useEffect(() => {
    const reduced = reducedMotion();
    const revealTimer = window.setTimeout(() => {
      setArrived(true);
      if (!reduced) playLeatherCreakSound();
    }, reduced ? 80 : 120);

    const glideTimer = window.setTimeout(
      () => setBeat("cover-intro"),
      reduced ? 200 : CINEMATIC.workshopGlideMs,
    );

    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(glideTimer);
    };
  }, []);

  useEffect(() => {
    if (beat === "cover-intro") {
      linger("cover-select", CINEMATIC.coverSelectPauseMs);
    }
  }, [beat, linger]);

  useEffect(() => {
    if (beat === "title-intro") {
      linger("title-custom", CINEMATIC.stepLingerMs);
    }
  }, [beat, linger]);

  useEffect(() => {
    if (beat === "paper-intro") {
      linger("paper-select", CINEMATIC.stepLingerMs);
    }
  }, [beat, linger]);

  useEffect(() => {
    if (beat === "pen-intro") {
      linger("pen-select", CINEMATIC.stepLingerMs);
    }
  }, [beat, linger]);

  useEffect(() => {
    if (beat === "bookmark-intro") {
      linger("bookmark-select", CINEMATIC.stepLingerMs);
    }
  }, [beat, linger]);

  useEffect(() => {
    if (beat !== "first-opening") return;
    const reduced = reducedMotion();
    if (!reduced) playLeatherCreakSound();
    const timer = window.setTimeout(
      () => setBeat("paper-intro"),
      reduced ? 120 : CINEMATIC.journalCoverOpenMs,
    );
    return () => window.clearTimeout(timer);
  }, [beat]);

  useEffect(() => {
    if (beat === "future-letter") {
      window.setTimeout(() => dedicationRef.current?.focus(), 900);
    }
    if (beat === "writing") {
      window.setTimeout(() => paperRef.current?.focus(), 900);
    }
  }, [beat]);

  useEffect(() => {
    const leather = JOURNAL_LEATHER_OPTIONS[colorIndex]?.id;
    if (leather && CAROUSEL_BEATS.includes(beat)) {
      patch({ leatherColor: leather });
    }
  }, [beat, colorIndex, patch]);

  function selectCover(color: JournalLeatherColor) {
    if (beat !== "cover-select") return;
    patch({ leatherColor: color });
    setBeat("cover-chosen");
    if (!reducedMotion()) playLeatherCreakSound();
  }

  function continueFromCoverChosen() {
    if (beat !== "cover-chosen") return;
    setBeat("title-intro");
  }

  function continueFromTitleLinger() {
    if (beat !== "title-linger") return;
    if (!reducedMotion()) playLeatherCreakSound();
    setBeat("first-opening");
  }

  function continueFromPaperLinger() {
    if (beat !== "paper-linger") return;
    setBeat("pen-intro");
  }

  function continueFromPenLinger() {
    if (beat !== "pen-linger") return;
    setBeat("bookmark-intro");
  }

  function continueFromBookmarkLinger() {
    if (beat !== "bookmark-linger") return;
    setBeat("dedication-invite");
  }

  function selectTitle(title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    patch({ name: trimmed, embossedTitle: trimmed });
    setBeat("title-embossing");
    if (!reducedMotion()) playEmbossSound();
    window.setTimeout(() => {
      setBeat("title-linger");
      if (!reducedMotion()) playLeatherCreakSound();
    }, reducedMotion() ? 120 : CINEMATIC.titleEmbossMs);
  }

  function choosePaper() {
    const option = JOURNAL_WORKSHOP_PAPER_OPTIONS[paperIndex]!;
    patch({ paperStyle: option.paperStyle });
    setBeat("paper-linger");
    if (!reducedMotion()) playJournalPageTurnSound(900);
  }

  function selectPen(pen: JournalPenStyle) {
    if (beat !== "pen-select") return;
    patch({ penStyle: pen });
    setBeat("pen-linger");
    if (!reducedMotion()) playLeatherCreakSound();
  }

  function selectBookmark(style: JournalBookmarkStyle) {
    if (beat !== "bookmark-select") return;
    patch({
      bookmarkStyle: style,
      bookmarkColor: style === "ribbon" ? "burgundy" : undefined,
    });
    setBeat("bookmark-linger");
    if (!reducedMotion()) playLeatherCreakSound();
  }

  function beginFutureLetter() {
    setBeat("future-letter");
  }

  function skipDedication() {
    turnToWriting();
  }

  function turnToWriting() {
    const reduced = reducedMotion();
    if (!reduced) playJournalPageTurnSound(CINEMATIC.pageTurnMs);
    setTurning(true);
    setBeat("turn-to-writing");
    const turnMs = reduced ? 80 : CINEMATIC.pageTurnMs;
    const pauseMs = reduced ? 0 : CINEMATIC.pageTurnPauseMs;
    window.setTimeout(() => {
      setTurning(false);
      setBeat("writing");
    }, turnMs + pauseMs);
  }

  function saveDedicationAndTurn() {
    patch({ dedication: dedicationDraft.trim() });
    turnToWriting();
  }

  function finish() {
    const final: JournalGazeboConfig = {
      ...draft,
      name: draft.name.trim() || "My Journey",
      embossedTitle: draft.embossedTitle.trim() || draft.name.trim() || "My Journey",
      dedication: draft.dedication?.trim() || dedicationDraft.trim() || undefined,
      writingMode: "silent",
    };
    onComplete(final, body.trim() || undefined);
  }

  const showCarousel = CAROUSEL_BEATS.includes(beat);
  const showClosedHero = CLOSED_HERO_BEATS.includes(beat);
  const showOpenHero = OPEN_HERO_BEATS.includes(beat);
  const namingCloseup =
    beat === "title-intro" ||
    beat === "title-custom" ||
    beat === "title-embossing" ||
    beat === "title-linger" ||
    beat === "cover-chosen";
  const showBranding =
    beat !== "workshop-arrive" &&
    !CAROUSEL_BEATS.includes(beat);
  const showCoverTitle =
    beat === "title-embossing" ||
    beat === "title-linger" ||
    Boolean(draft.embossedTitle?.trim());
  const showTitlePlaceholder =
    beat === "cover-chosen" || beat === "title-intro";
  const showWriting = beat === "writing" && !turning;

  return (
    <div
      className={[
        "jg-workshop",
        "jg-cinematic-book",
        arrived ? "jg-cinematic-book--arrived" : "",
        turning ? "jg-cinematic-book--turning" : "",
        showOpenHero ? "jg-ceremony--open" : "jg-ceremony--closed",
        namingCloseup ? "jg-workshop--naming-closeup" : "",
        beat === "cover-chosen" ? "jg-workshop--journal-chosen" : "",
        `jg-workshop--${beat}`,
      ]
        .filter(Boolean)
        .join(" ")}
      data-workshop-beat={beat}
    >
      <span className="jg-workshop__desk-surface" aria-hidden="true" />

      {beat === "workshop-arrive" && !arrived ? (
        <p className="jg-workshop__handcraft" role="status">
          {JOURNAL_HANDCRAFT_MESSAGE}
        </p>
      ) : null}

      {sparkLine ? (
        <p className="jg-workshop__spark" role="status">
          {sparkLine}
        </p>
      ) : null}

      {beat === "cover-chosen" ||
      beat === "title-linger" ||
      beat === "paper-linger" ||
      beat === "pen-linger" ||
      beat === "bookmark-linger" ? (
        <button
          type="button"
          className="jg-workshop__continue"
          onClick={() => {
            if (beat === "cover-chosen") continueFromCoverChosen();
            else if (beat === "title-linger") continueFromTitleLinger();
            else if (beat === "paper-linger") continueFromPaperLinger();
            else if (beat === "pen-linger") continueFromPenLinger();
            else continueFromBookmarkLinger();
          }}
        >
          {JOURNAL_WORKSHOP_CONTINUE}
        </button>
      ) : null}

      {beat === "title-custom" || beat === "title-embossing" ? (
        <JournalGazeboFountainPen
          decorative
          resting
          glowing={beat === "title-embossing" || Boolean(draft.name.trim())}
          className="jg-workshop__desk-pen"
        />
      ) : null}

      {beat === "pen-select" ? (
        <JournalGazeboDeskPens selected={draft.penStyle} onSelect={selectPen} />
      ) : null}

      {beat === "bookmark-select" ? (
        <JournalGazeboBookmarkPicker
          bookmarkIndex={bookmarkIndex}
          onIndexChange={setBookmarkIndex}
          onChoose={selectBookmark}
        />
      ) : null}

      {beat === "dedication-invite" ? (
        <div className="jg-workshop__dedication-choices">
          <button
            type="button"
            className="jg-workshop__choice"
            onClick={beginFutureLetter}
          >
            {JOURNAL_WORKSHOP_DEDICATION_YES}
          </button>
          <button
            type="button"
            className="jg-workshop__choice jg-workshop__choice--quiet"
            onClick={skipDedication}
          >
            {JOURNAL_WORKSHOP_DEDICATION_LATER}
          </button>
        </div>
      ) : null}

      <div className="jg-workshop__stage">
        {showCarousel ? (
          <JournalGazeboLeatherCarousel
            config={draft}
            colorIndex={colorIndex}
            onColorIndexChange={setColorIndex}
            onChoose={selectCover}
          />
        ) : null}

        {showClosedHero || showOpenHero ? (
          <JournalGazeboHeroJournal
            config={{
              ...draft,
              embossedTitle: draft.embossedTitle || "",
              showSparkFlame: true,
            }}
            moment={heroMomentForBeat(beat)}
            cinematic
            ceremony
            heirloom
            onDesk
            namingCloseup={namingCloseup}
            showEstateBranding={showBranding}
            showCoverTitle={showCoverTitle && beat !== "title-custom"}
            showTitlePlaceholder={showTitlePlaceholder}
            embossAnimating={beat === "title-embossing"}
            bookmarkStyle={draft.bookmarkStyle}
            coverTitleField={
              beat === "title-custom" ? (
                <JournalCoverEmbossInput
                  id="jg-workshop-cover-title"
                  label="Journal title on cover"
                  value={draft.name}
                  onChange={(name) => patch({ name })}
                  onSubmit={() => selectTitle(draft.name)}
                  autoFocus
                  active
                />
              ) : null
            }
          >
            {beat === "paper-select" ? (
              <JournalGazeboPaperPicker
                paperIndex={paperIndex}
                onIndexChange={setPaperIndex}
                onChoose={choosePaper}
              />
            ) : null}

            {beat === "future-letter" ? (
              <div className="jg-workshop__inside jg-cinematic-book__spread-pages--paper">
                <h2 className="jg-cinematic-book__dedication-heading">
                  {JOURNAL_CREATION_DEDICATION_HEADING}
                </h2>
                <div
                  ref={dedicationRef}
                  role="textbox"
                  contentEditable
                  suppressContentEditableWarning
                  spellCheck={false}
                  className="jg-cinematic-book__ink-block"
                  data-placeholder="Write to your future self…"
                  onInput={(e) => {
                    setDedicationDraft(
                      (e.currentTarget as HTMLDivElement).textContent ?? "",
                    );
                    playPenScratchSound();
                  }}
                />
                <button
                  type="button"
                  className="jg-workshop__choice"
                  onClick={saveDedicationAndTurn}
                >
                  {JOURNAL_CREATION_TURN_PAGE}
                </button>
              </div>
            ) : null}

            {showWriting ? (
              <article className="jg-cinematic-book__page jg-cinematic-book__page--writing jg-cinematic-book__spread-pages--paper">
                <header className="jg-cinematic-book__writing-header">
                  <p className="jg-cinematic-book__date">{dateLabel}</p>
                  <p className="jg-cinematic-book__time">{timeLabel}</p>
                  <h1 className="jg-cinematic-book__journal-title">{draft.name}</h1>
                  <p className="jg-cinematic-book__prompt">{JOURNAL_FIRST_PAGE_PROMPT}</p>
                </header>
                <div
                  ref={paperRef}
                  role="textbox"
                  contentEditable
                  suppressContentEditableWarning
                  spellCheck={false}
                  className="jg-cinematic-book__ink-block jg-cinematic-book__ink-block--large"
                  onInput={(e) => {
                    setBody((e.currentTarget as HTMLDivElement).textContent ?? "");
                    playPenScratchSound();
                  }}
                />
                <button
                  type="button"
                  className="jg-workshop__choice"
                  onClick={finish}
                >
                  {JOURNAL_CREATION_BEGIN_WRITING}
                </button>
              </article>
            ) : null}

            {beat === "turn-to-writing" ? (
              <div className="jg-cinematic-book__page-turn" aria-hidden="true">
                <span className="jg-cinematic-book__page-turn-shadow" />
              </div>
            ) : null}
          </JournalGazeboHeroJournal>
        ) : null}
      </div>
    </div>
  );
}
