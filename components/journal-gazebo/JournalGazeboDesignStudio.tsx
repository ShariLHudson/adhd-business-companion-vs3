"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CINEMATIC } from "@/lib/journalGazebo/cinematicTiming";
import type { DesignStudioBeat } from "@/lib/journalGazebo/designStudioTypes";
import {
  JOURNAL_DESIGN_FONT_OPTIONS,
  JOURNAL_DESIGN_INK_OPTIONS,
  JOURNAL_DESIGN_PAPER_OPTIONS,
  JOURNAL_DESIGN_PEN_OPTIONS,
  JOURNAL_LEATHER_OPTIONS,
  JOURNAL_PRINTED_COVER_DESIGNS,
} from "@/lib/journalGazebo/designStudioCatalog";
import {
  JOURNAL_DESIGN_CRAFTING_MESSAGE,
} from "@/lib/journalGazebo/hospitality";
import { resolveCoverTitleTone } from "@/lib/journalGazebo/coverTitleContrast";
import { defaultJournalConfig } from "@/lib/journalGazebo/store";
import type {
  JournalFontId,
  JournalGazeboConfig,
  JournalInkColor,
  JournalLeatherColor,
  JournalPaperStyle,
  JournalPenStyle,
} from "@/lib/journalGazebo/types";
import { JournalGazeboPenPreview } from "./JournalGazeboPenPreview";
import { JournalGazeboDesignNameCeremony } from "./JournalGazeboDesignNameCeremony";

type Props = {
  onComplete: (config: JournalGazeboConfig) => void;
  /** First step back — return to welcome before the journal exists. */
  onExit?: () => void;
};

type CoverChoice =
  | { kind: "leather"; leatherColor: JournalLeatherColor }
  | { kind: "printed"; designId: string };

function LeatherSwatch({
  option,
  selected,
  onSelect,
}: {
  option: (typeof JOURNAL_LEATHER_OPTIONS)[number];
  selected: boolean;
  onSelect: (color: JournalLeatherColor) => void;
}) {
  return (
    <button
      type="button"
      className={[
        "jg-design-swatch",
        "jg-design-swatch--leather",
        "jg-design-swatch--uniform",
        selected ? "jg-design-swatch--selected" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-leather={option.id}
      onClick={() => onSelect(option.id)}
    >
      <span className="jg-design-swatch__face" aria-hidden="true" />
      <span className="jg-design-swatch__label">{option.label}</span>
      <span className="jg-design-swatch__sub">{option.textureLabel}</span>
    </button>
  );
}

function PrintedCoverSwatch({
  design,
  selected,
  onSelect,
}: {
  design: (typeof JOURNAL_PRINTED_COVER_DESIGNS)[number];
  selected: boolean;
  onSelect: (designId: string) => void;
}) {
  return (
    <button
      type="button"
      className={[
        "jg-design-swatch",
        "jg-design-swatch--printed",
        "jg-design-swatch--uniform",
        design.previewClass,
        selected ? "jg-design-swatch--selected" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => onSelect(design.id)}
    >
      <span
        className="jg-design-swatch__face jg-design-swatch__face--printed"
        style={
          design.previewImageUrl
            ? { backgroundImage: `url(${design.previewImageUrl})` }
            : undefined
        }
        aria-hidden="true"
      />
      <span className="jg-design-swatch__label">{design.label}</span>
      <span className="jg-design-swatch__sub">{design.description}</span>
    </button>
  );
}

export function JournalGazeboDesignStudio({ onComplete, onExit }: Props) {
  const [beat, setBeat] = useState<DesignStudioBeat>("cover-select");
  const [beatHistory, setBeatHistory] = useState<DesignStudioBeat[]>([]);
  const [draft, setDraft] = useState(() => defaultJournalConfig({ name: "" }));
  const [coverChoice, setCoverChoice] = useState<CoverChoice | null>(null);
  const draftRef = useRef(draft);
  const onCompleteRef = useRef(onComplete);

  draftRef.current = draft;
  onCompleteRef.current = onComplete;

  const patch = useCallback((partial: Partial<JournalGazeboConfig>) => {
    setDraft((current) => ({ ...current, ...partial }));
  }, []);

  const canGoForward = (() => {
    switch (beat) {
      case "cover-select":
        return coverChoice != null;
      case "name":
        return Boolean(draft.name.trim());
      case "paper":
      case "font":
      case "pen":
      case "ink":
        return true;
      default:
        return false;
    }
  })();

  const canGoBack = beat !== "crafting" && beat !== "complete";

  function advanceTo(next: DesignStudioBeat) {
    setBeatHistory((history) => [...history, beat]);
    setBeat(next);
  }

  function goBack() {
    if (beat === "crafting" || beat === "complete") return;
    if (beatHistory.length === 0) {
      onExit?.();
      return;
    }
    const previous = beatHistory[beatHistory.length - 1]!;
    setBeatHistory((history) => history.slice(0, -1));
    setBeat(previous);
  }

  function goForward() {
    if (!canGoForward) return;

    switch (beat) {
      case "cover-select":
        advanceTo("name");
        return;
      case "name":
        patch({ embossedTitle: draft.name.trim() });
        advanceTo("paper");
        return;
      case "paper":
        advanceTo("font");
        return;
      case "font":
        advanceTo("pen");
        return;
      case "pen":
        advanceTo("ink");
        return;
      case "ink":
        advanceTo("crafting");
        return;
      default:
        return;
    }
  }

  function selectLeather(color: JournalLeatherColor) {
    setCoverChoice({ kind: "leather", leatherColor: color });
    patch({
      leatherColor: color,
      coverImageKind: "none",
      coverMaterial: "leather",
    });
  }

  function selectPrinted(designId: string) {
    const design = JOURNAL_PRINTED_COVER_DESIGNS.find((d) => d.id === designId);
    if (!design) return;
    setCoverChoice({ kind: "printed", designId });
    patch({
      coverImageKind: design.coverImageKind,
      coverEstatePlaceId: design.coverEstatePlaceId,
      coverMaterial: "linen",
    });
  }

  function selectPaper(paper: JournalPaperStyle) {
    patch({ paperStyle: paper });
  }

  function selectFont(fontId: JournalFontId) {
    patch({ fontId });
  }

  function selectPen(pen: JournalPenStyle) {
    patch({ penStyle: pen });
  }

  function selectInk(ink: JournalInkColor) {
    patch({ inkColor: ink });
  }

  useEffect(() => {
    if (beat !== "crafting") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => {
      const current = draftRef.current;
      const final: JournalGazeboConfig = {
        ...current,
        name: current.name.trim() || "My Journal",
        embossedTitle: current.name.trim() || "My Journal",
        showSparkFlame: true,
        writingMode: "silent",
      };
      setBeat("complete");
      onCompleteRef.current(final);
    }, reduced ? 200 : CINEMATIC.handcraftPauseMs + 400);
    return () => window.clearTimeout(timer);
  }, [beat]);

  const prompt = (() => {
    switch (beat) {
      case "crafting":
        return null;
      default:
        return null;
    }
  })();

  const titleTone = resolveCoverTitleTone(draft, coverChoice);
  const leatherColor =
    coverChoice?.kind === "leather" ? coverChoice.leatherColor : undefined;
  const activePaper = useMemo(
    () =>
      JOURNAL_DESIGN_PAPER_OPTIONS.find((paper) => paper.id === draft.paperStyle) ??
      JOURNAL_DESIGN_PAPER_OPTIONS[0]!,
    [draft.paperStyle],
  );

  const designStepNav = (
    <>
      <button
        type="button"
        className="jg-design-studio__nav jg-design-studio__nav--prev"
        onClick={goBack}
        disabled={!canGoBack}
        aria-label={beatHistory.length === 0 ? "Back to welcome" : "Previous step"}
      >
        <span className="jg-design-studio__nav-plate" aria-hidden="true" />
        <span className="jg-design-studio__nav-arrow" aria-hidden="true">
          ‹
        </span>
      </button>
      <button
        type="button"
        className="jg-design-studio__nav jg-design-studio__nav--next"
        onClick={goForward}
        disabled={!canGoForward}
        aria-label="Next step"
      >
        <span className="jg-design-studio__nav-plate" aria-hidden="true" />
        <span className="jg-design-studio__nav-arrow" aria-hidden="true">
          ›
        </span>
      </button>
    </>
  );

  return (
    <div
      className={["jg-design-studio", `jg-design-studio--${beat}`].join(" ")}
      data-design-beat={beat}
    >
      {prompt ? (
        <div
          className="jg-design-studio__prompt jg-estate-plaque jg-design-studio__prompt--plaque"
          role="status"
        >
          {prompt}
        </div>
      ) : null}

      {beat === "crafting" ? (
        <div className="jg-handcraft-ceremony jg-handcraft-ceremony--message-only" role="status">
          <div className="jg-handcraft-ceremony__frost" aria-hidden="true" />
          <p className="jg-design-studio__crafting-script">
            {JOURNAL_DESIGN_CRAFTING_MESSAGE.split("\n").map((line, index, lines) => (
              <span key={line}>
                {line}
                {index < lines.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
        </div>
      ) : (
        <div className="jg-design-studio__workspace">
          <div className="jg-design-studio__step">
            {beat === "cover-select" ? (
              <div className="jg-design-studio__panel jg-design-studio__panel--cover">
                <div className="jg-design-studio__grid jg-design-studio__grid--covers">
                  {JOURNAL_LEATHER_OPTIONS.map((option) => (
                    <LeatherSwatch
                      key={option.id}
                      option={option}
                      selected={
                        coverChoice?.kind === "leather" &&
                        coverChoice.leatherColor === option.id
                      }
                      onSelect={selectLeather}
                    />
                  ))}
                  {JOURNAL_PRINTED_COVER_DESIGNS.map((design) => (
                    <PrintedCoverSwatch
                      key={design.id}
                      design={design}
                      selected={
                        coverChoice?.kind === "printed" &&
                        coverChoice.designId === design.id
                      }
                      onSelect={selectPrinted}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {beat === "name" ? (
              <div className="jg-design-studio__panel jg-design-studio__panel--name">
                <JournalGazeboDesignNameCeremony
                  value={draft.name}
                  onChange={(name) => patch({ name })}
                  titleTone={titleTone}
                  leatherColor={leatherColor}
                  nav={designStepNav}
                />
              </div>
            ) : null}

            {beat === "paper" ? (
              <div className="jg-design-paper-experience">
                <div
                  key={draft.paperStyle}
                  className={[
                    "jg-design-paper-preview",
                    activePaper.textureClass,
                  ].join(" ")}
                >
                  <div className="jg-design-paper-preview__page">
                    <span className="jg-design-paper-preview__binding" aria-hidden="true" />
                    <div className="jg-design-paper-preview__folio">
                      <span className="jg-design-paper-preview__sheet" aria-hidden="true" />
                      <span className="jg-design-paper-preview__edge" aria-hidden="true" />
                    </div>
                  </div>
                  <p className="jg-design-paper-preview__label">{activePaper.label}</p>
                  <p className="jg-design-paper-preview__desc">{activePaper.description}</p>
                </div>

                <div
                  className="jg-design-choice-experience__choices jg-design-choice-experience__choices--paper"
                  role="group"
                  aria-label="Paper choices"
                >
                  {JOURNAL_DESIGN_PAPER_OPTIONS.map((paper) => (
                    <button
                      key={paper.id}
                      type="button"
                      className={[
                        "jg-estate-plaque",
                        "jg-design-choice-plaque",
                        "jg-design-choice-plaque--paper",
                        draft.paperStyle === paper.id ? "jg-design-choice-plaque--active" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => selectPaper(paper.id)}
                    >
                      <span
                        className={[
                          "jg-design-paper-plaque__swatch",
                          paper.textureClass,
                        ].join(" ")}
                        aria-hidden="true"
                      />
                      <span className="jg-design-choice-plaque__label">{paper.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {beat === "font" ? (
              <div className="jg-design-choice-experience jg-design-choice-experience--font">
                <div
                  className="jg-design-choice-experience__choices jg-design-choice-experience__choices--font"
                  role="group"
                  aria-label="Font choices"
                >
                  {JOURNAL_DESIGN_FONT_OPTIONS.map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      className={[
                        "jg-estate-plaque",
                        "jg-design-choice-plaque",
                        draft.fontId === font.id ? "jg-design-choice-plaque--active" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      style={{ fontFamily: font.family }}
                      onClick={() => selectFont(font.id)}
                    >
                      {font.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {beat === "pen" ? (
              <div className="jg-design-choice-experience jg-design-choice-experience--pen">
                <div
                  className="jg-design-choice-experience__choices jg-design-choice-experience__choices--pen"
                  role="group"
                  aria-label="Pen choices"
                >
                  {JOURNAL_DESIGN_PEN_OPTIONS.map((pen) => (
                    <button
                      key={pen.id}
                      type="button"
                      className={[
                        "jg-estate-plaque",
                        "jg-design-choice-plaque",
                        "jg-design-choice-plaque--pen",
                        draft.penStyle === pen.id ? "jg-design-choice-plaque--active" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => selectPen(pen.id)}
                    >
                      <span className="jg-design-choice-plaque__pen-thumb" aria-hidden="true">
                        <JournalGazeboPenPreview pen={pen.id} imageUrl={pen.previewImageUrl} />
                      </span>
                      <span className="jg-design-choice-plaque__label">{pen.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {beat === "ink" ? (
              <div className="jg-design-choice-experience jg-design-choice-experience--ink">
                <div
                  className="jg-design-choice-experience__choices jg-design-choice-experience__choices--ink"
                  role="group"
                  aria-label="Ink choices"
                >
                  {JOURNAL_DESIGN_INK_OPTIONS.map((ink) => (
                    <button
                      key={ink.id}
                      type="button"
                      className={[
                        "jg-estate-plaque",
                        "jg-design-choice-plaque",
                        "jg-design-choice-plaque--ink",
                        draft.inkColor === ink.id ? "jg-design-choice-plaque--active" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      data-ink={ink.id}
                      onClick={() => selectInk(ink.id)}
                    >
                      <span
                        className="jg-design-choice-plaque__ink-dot"
                        style={{ background: ink.css }}
                        aria-hidden="true"
                      />
                      <span className="jg-design-choice-plaque__label">{ink.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {beat !== "name" ? (
            <div className="jg-design-studio__nav-row">{designStepNav}</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
