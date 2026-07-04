"use client";

import {
  JOURNAL_DESIGN_FONT_OPTIONS,
  JOURNAL_DESIGN_INK_OPTIONS,
  JOURNAL_DESIGN_PEN_OPTIONS,
} from "@/lib/journalGazebo/designStudioCatalog";
import type { TypingStyle } from "@/lib/journalGazebo/writingSurface";
import { WRITING_FONT_SIZES } from "@/lib/journalGazebo/writingSurface";
import type { JournalFontId, JournalInkColor, JournalPenStyle } from "@/lib/journalGazebo/types";
import { JournalGazeboPenPreview } from "./JournalGazeboPenPreview";

type Props = {
  style: TypingStyle;
  onClose: () => void;
  onUpdate: (patch: Partial<TypingStyle>) => void;
};

const QUICK_FONT_SIZES = [16, 18, 20, 22] as const;

function fontSizeSliderPercent(size: number): number {
  const idx = WRITING_FONT_SIZES.indexOf(size as (typeof WRITING_FONT_SIZES)[number]);
  if (idx < 0) return 50;
  if (WRITING_FONT_SIZES.length <= 1) return 0;
  return (idx / (WRITING_FONT_SIZES.length - 1)) * 100;
}

/** Change handwriting or writing instrument for this page only. */
export function JournalGazeboWritingPreferences({ style, onClose, onUpdate }: Props) {
  return (
    <>
      <button
        type="button"
        className="jg-writing-prefs__backdrop"
        aria-label="Close writing preferences"
        onClick={onClose}
      />
      <div className="jg-writing-prefs" role="dialog" aria-label="Writing preferences">
        <div className="jg-writing-prefs__header">
          <div>
            <p className="jg-writing-prefs__title">Writing &amp; pen</p>
            <p className="jg-writing-prefs__hint">Customize this page.</p>
          </div>
          <button type="button" className="jg-writing-prefs__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <p className="jg-writing-prefs__section-label">Script</p>
        <div className="jg-writing-prefs__choices jg-writing-prefs__choices--font">
          {JOURNAL_DESIGN_FONT_OPTIONS.map((font) => (
            <button
              key={font.id}
              type="button"
              className={[
                "jg-writing-prefs__choice",
                "jg-writing-prefs__choice--font",
                style.fontId === font.id ? "jg-writing-prefs__choice--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{ fontFamily: font.family }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onUpdate({ fontId: font.id as JournalFontId })}
            >
              <span className="jg-writing-prefs__font-sample" aria-hidden="true">
                Aa
              </span>
              <span className="jg-writing-prefs__font-name">{font.label}</span>
            </button>
          ))}
        </div>

        <p className="jg-writing-prefs__section-label">Letter size</p>
        <div className="jg-writing-prefs__size-row" role="group" aria-label="Letter size">
          {QUICK_FONT_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              className={[
                "jg-writing-prefs__size-chip",
                style.writingFontSize === size ? "jg-writing-prefs__size-chip--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onUpdate({ writingFontSize: size })}
            >
              {size}
            </button>
          ))}
        </div>
        <div className="jg-writing-prefs__size-slider" aria-hidden="true">
          <span>Small</span>
          <span className="jg-writing-prefs__size-track">
            <span
              className="jg-writing-prefs__size-thumb"
              style={{ left: `${fontSizeSliderPercent(style.writingFontSize)}%` }}
            />
          </span>
          <span>Large</span>
        </div>

        <p className="jg-writing-prefs__section-label">Writing instrument</p>
        <div className="jg-writing-prefs__choices jg-writing-prefs__choices--pen">
          {JOURNAL_DESIGN_PEN_OPTIONS.map((pen) => (
            <button
              key={pen.id}
              type="button"
              className={[
                "jg-writing-prefs__choice",
                "jg-writing-prefs__choice--pen",
                style.penStyle === pen.id ? "jg-writing-prefs__choice--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-label={pen.label}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onUpdate({ penStyle: pen.id as JournalPenStyle })}
            >
              <JournalGazeboPenPreview pen={pen.id} imageUrl={pen.previewImageUrl} />
            </button>
          ))}
        </div>

        <p className="jg-writing-prefs__section-label">Ink</p>
        <div className="jg-writing-prefs__choices jg-writing-prefs__choices--ink">
          {JOURNAL_DESIGN_INK_OPTIONS.map((ink) => (
            <button
              key={ink.id}
              type="button"
              className={[
                "jg-writing-prefs__choice",
                "jg-writing-prefs__choice--ink",
                style.inkColor === ink.id ? "jg-writing-prefs__choice--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              data-ink={ink.id}
              aria-label={ink.label}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onUpdate({ inkColor: ink.id as JournalInkColor })}
            >
              <span
                className="jg-writing-prefs__ink-swatch"
                style={{ background: ink.css }}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>

        <div className="jg-writing-prefs__footer">
          <button type="button" className="jg-writing-prefs__done" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </>
  );
}
