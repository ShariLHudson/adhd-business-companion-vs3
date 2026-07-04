"use client";

import type { CSSProperties, ReactNode } from "react";
import {
  journalCoverImageUrl,
  journalCoverTitle,
} from "@/lib/journalGazebo/coverArt";
import {
  JOURNAL_COVER_ESTATE_MARK_LINES,
} from "@/lib/journalGazebo/hospitality";
import {
  JOURNAL_LEATHER_PALETTES,
  leatherCoverGradient,
  leatherSpineGradient,
  leatherTextureId,
} from "@/lib/journalGazebo/leather";
import type {
  JournalBookmarkStyle,
  JournalGazeboConfig,
} from "@/lib/journalGazebo/types";

export type JournalHeroMoment = "closed" | "opening" | "open" | "closing";

type Props = {
  config: JournalGazeboConfig;
  moment: JournalHeroMoment;
  clickable?: boolean;
  cinematic?: boolean;
  ceremony?: boolean;
  heirloom?: boolean;
  onDesk?: boolean;
  showEstateBranding?: boolean;
  showCoverTitle?: boolean;
  showTitlePlaceholder?: boolean;
  embossAnimating?: boolean;
  namingCloseup?: boolean;
  bookmarkStyle?: JournalBookmarkStyle;
  coverTitleField?: ReactNode;
  onOpen?: () => void;
  onOpenComplete?: () => void;
  children?: ReactNode;
};

export function JournalGazeboHeroJournal({
  config,
  moment,
  clickable = false,
  cinematic = false,
  ceremony = false,
  heirloom = false,
  onDesk = false,
  showEstateBranding = false,
  showCoverTitle = true,
  showTitlePlaceholder = false,
  embossAnimating = false,
  namingCloseup = false,
  bookmarkStyle,
  coverTitleField = null,
  onOpen,
  onOpenComplete,
  children,
}: Props) {
  const coverImage = journalCoverImageUrl(config);
  const title = journalCoverTitle(config);
  const palette = JOURNAL_LEATHER_PALETTES[config.leatherColor];
  const isOpen = moment === "open";
  const isOpening = moment === "opening";
  const isClosing = moment === "closing";
  const showPages = isOpen || isOpening;
  const coverTitle = config.embossedTitle?.trim() || config.name.trim();
  const showSpine = ceremony || heirloom || !cinematic;

  const CoverTag = clickable ? "button" : "div";

  return (
    <div
      className={[
        "journal-hero",
        isOpen ? "journal-hero--open" : "",
        isOpening ? "journal-hero--opening" : "",
        isClosing ? "journal-hero--closing" : "",
        cinematic ? "journal-hero--cinematic" : "",
        ceremony ? "journal-hero--ceremony" : "",
        heirloom ? "journal-hero--heirloom" : "",
        onDesk ? "journal-hero--on-desk" : "",
        namingCloseup ? "journal-hero--naming-closeup" : "",
        embossAnimating ? "journal-hero--emboss-animating" : "",
        clickable ? "journal-hero--clickable" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-leather={config.leatherColor}
      data-leather-texture={leatherTextureId(config.leatherColor)}
      data-emboss={config.embossingStyle ?? "gold"}
      data-cover={config.coverMaterial ?? "leather"}
      style={
        {
          "--journal-leather-face": palette.face,
          "--journal-leather-highlight": palette.highlight,
          "--journal-leather-shadow": palette.shadow,
          "--journal-leather-edge": palette.edge,
        } as CSSProperties
      }
    >
      <span className="journal-hero__desk-shadow" aria-hidden="true" />

      <div className="journal-hero__book">
        {showSpine ? (
          <div
            className="journal-hero__spine journal-hero__spine--heirloom"
            style={{ background: leatherSpineGradient(config.leatherColor) }}
            aria-hidden="true"
          >
            <span className="journal-hero__spine-rib journal-hero__spine-rib--1" />
            <span className="journal-hero__spine-rib journal-hero__spine-rib--2" />
            <span className="journal-hero__spine-rib journal-hero__spine-rib--3" />
            <span className="journal-hero__spine-thread" />
            <span className="journal-hero__spine-hinge" />
          </div>
        ) : null}

        <div className="journal-hero__body">
          {!showPages ? (
            <span className="journal-hero__fore-edge" aria-hidden="true">
              <span className="journal-hero__fore-edge-stack" />
              <span className="journal-hero__fore-edge-gold" />
            </span>
          ) : null}

          <div
            className="journal-hero__pages"
            data-paper={config.paperStyle}
            aria-hidden={!showPages}
          >
            <div className="journal-hero__page-edge journal-hero__page-edge--gold" />
            <div className="journal-hero__page-stack" aria-hidden="true" />
            {showPages ? <div className="journal-hero__spread">{children}</div> : null}
          </div>

          <CoverTag
            type={clickable ? "button" : undefined}
            className="journal-hero__cover"
            style={{ background: leatherCoverGradient(config.leatherColor) }}
            onClick={clickable ? onOpen : undefined}
            disabled={clickable ? false : undefined}
            aria-label={
              clickable ? `Open ${config.name}` : `${config.name} cover`
            }
            aria-expanded={showPages}
            onTransitionEnd={(e) => {
              if (
                isOpening &&
                e.propertyName === "transform" &&
                e.target === e.currentTarget &&
                onOpenComplete
              ) {
                onOpenComplete();
              }
            }}
          >
            <span className="journal-hero__cover-bevel" aria-hidden="true" />
            {coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverImage}
                alt=""
                className="journal-hero__cover-image journal-hero__cover-image--printed"
                aria-hidden
              />
            ) : null}
            <div className="journal-hero__cover-texture" aria-hidden="true" />

            {showEstateBranding ? (
              <div className="journal-hero__cover-brand">
                <p className="journal-hero__estate-mark">
                  <span className="journal-hero__estate-line">
                    {JOURNAL_COVER_ESTATE_MARK_LINES[0]}
                  </span>
                  <span className="journal-hero__estate-line">
                    {JOURNAL_COVER_ESTATE_MARK_LINES[1]}
                  </span>
                </p>
                {config.showSparkFlame ? (
                  <span
                    className="journal-hero__flame journal-hero__flame--ceremony jg-estate-flame"
                    aria-hidden="true"
                  />
                ) : null}
                <span className="journal-hero__emboss-rule" aria-hidden="true" />
                {coverTitleField ? (
                  <div className="journal-hero__cover-title-slot">{coverTitleField}</div>
                ) : null}
                {showCoverTitle && coverTitle && !coverTitleField ? (
                  <>
                    <p className="journal-hero__emboss journal-hero__emboss--ceremony">
                      {coverTitle}
                    </p>
                    {embossAnimating ? (
                      <span className="journal-hero__emboss-sparkle" aria-hidden="true" />
                    ) : null}
                  </>
                ) : showTitlePlaceholder && !coverTitleField ? (
                  <span className="journal-hero__emboss-line" aria-hidden="true" />
                ) : null}
              </div>
            ) : (
              <>
                <p className="journal-hero__emboss">{title}</p>
                {config.showSparkFlame ? (
                  <span className="journal-hero__flame" aria-hidden="true" />
                ) : null}
              </>
            )}

            {bookmarkStyle ? (
              <span
                className={[
                  "journal-hero__bookmark-accent",
                  `journal-hero__bookmark-accent--${bookmarkStyle}`,
                ].join(" ")}
                aria-hidden="true"
              />
            ) : null}
            {clickable ? (
              <span className="journal-hero__open-hint">Open</span>
            ) : null}
          </CoverTag>
        </div>
      </div>
    </div>
  );
}
