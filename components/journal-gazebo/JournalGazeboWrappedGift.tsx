"use client";

import type { CSSProperties } from "react";

import { journalCoverImageUrl, journalCoverTitle } from "@/lib/journalGazebo/coverArt";
import { JOURNAL_GIFT_WRAPPING_PAPER_URL } from "@/lib/journalGazebo/giftAssets";
import type { JournalGazeboConfig } from "@/lib/journalGazebo/types";
import { JournalCoverEmboss } from "./JournalCoverEmboss";

export type GiftUnwrapMoment =
  | "crafted"
  | "wrapping"
  | "wrapped"
  | "bow"
  | "ribbon-pull"
  | "ribbon"
  | "unwrap"
  | "reveal"
  | "admire"
  | "complete";

type Props = {
  config: JournalGazeboConfig;
  moment: GiftUnwrapMoment;
};

const wrapPaperStyle = {
  backgroundImage: `url(${JOURNAL_GIFT_WRAPPING_PAPER_URL})`,
} as const;

/** Portrait journal gift — CSS wrap only; journal hidden until unwrap reveal. */
export function JournalGazeboWrappedGift({ config, moment }: Props) {
  const title = journalCoverTitle(config);
  const coverImage = journalCoverImageUrl(config);

  const journalRevealed =
    moment === "reveal" || moment === "admire" || moment === "complete";

  const showWrap =
    moment === "wrapping" ||
    moment === "wrapped" ||
    moment === "bow" ||
    moment === "ribbon-pull" ||
    moment === "ribbon" ||
    moment === "unwrap" ||
    moment === "reveal";

  const unwrapping =
    moment === "bow" ||
    moment === "ribbon-pull" ||
    moment === "ribbon" ||
    moment === "unwrap" ||
    journalRevealed;

  return (
    <div
      className={[
        "jg-cinematic-gift",
        "jg-cinematic-gift--journal-shape",
        `jg-cinematic-gift--${moment}`,
        journalRevealed ? "jg-cinematic-gift--journal-visible" : "",
        unwrapping ? "jg-cinematic-gift--unwrap" : "",
        moment === "bow" ? "jg-cinematic-gift--bow-loose" : "",
        moment === "ribbon-pull" ? "jg-cinematic-gift--ribbon-pull" : "",
        moment === "ribbon" || moment === "unwrap" || journalRevealed
          ? "jg-cinematic-gift--ribbon-loose"
          : "",
        moment === "admire" || moment === "complete"
          ? "jg-cinematic-gift--journal-grow"
          : "",
        moment === "crafted" || moment === "wrapping"
          ? "jg-cinematic-gift--crafted"
          : "",
        moment === "wrapping" ? "jg-cinematic-gift--wrapping-on" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          "--jg-gift-wrap-paper": `url(${JOURNAL_GIFT_WRAPPING_PAPER_URL})`,
        } as CSSProperties
      }
      aria-hidden={moment === "complete"}
      data-leather={config.leatherColor}
    >
      <span className="jg-cinematic-gift__desk-shadow" aria-hidden="true" />

      <div className="jg-cinematic-gift__journal">
        <span className="jg-cinematic-gift__journal-shadow" aria-hidden="true" />
        <span className="jg-cinematic-gift__journal-spine" aria-hidden="true" />
        {journalRevealed ? (
          <span className="jg-cinematic-gift__journal-page-edge" aria-hidden="true">
            <span className="jg-cinematic-gift__journal-page-sheet jg-cinematic-gift__journal-page-sheet--4" />
            <span className="jg-cinematic-gift__journal-page-sheet jg-cinematic-gift__journal-page-sheet--3" />
            <span className="jg-cinematic-gift__journal-page-sheet jg-cinematic-gift__journal-page-sheet--2" />
            <span className="jg-cinematic-gift__journal-page-sheet jg-cinematic-gift__journal-page-sheet--1" />
          </span>
        ) : null}
        <span
          className={[
            "jg-cinematic-gift__journal-cover",
            coverImage ? "jg-cinematic-gift__journal-cover--printed" : "",
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
          {!coverImage ? <span className="jg-cinematic-gift__leather-texture" /> : null}
          <JournalCoverEmboss title={title} />
          {config.showSparkFlame ? (
            <span className="jg-cinematic-gift__cover-flame jg-estate-flame" aria-hidden="true" />
          ) : null}
          {config.bookmarkColor ? (
            <span
              className="jg-cinematic-gift__bookmark"
              data-bookmark={config.bookmarkColor}
            />
          ) : null}
        </span>
      </div>

      {showWrap ? (
        <div className="jg-cinematic-gift__wrap">
          <span
            className="jg-cinematic-gift__paper jg-cinematic-gift__paper--front"
            style={wrapPaperStyle}
          >
            <span className="jg-cinematic-gift__paper-sheen" aria-hidden="true" />
          </span>
          <span className="jg-cinematic-gift__ribbon jg-cinematic-gift__ribbon--h" />
          <span className="jg-cinematic-gift__ribbon jg-cinematic-gift__ribbon--v" />
          <span className="jg-cinematic-gift__bow" aria-hidden="true">
            <span className="jg-cinematic-gift__bow-loop jg-cinematic-gift__bow-loop--tl" />
            <span className="jg-cinematic-gift__bow-loop jg-cinematic-gift__bow-loop--tr" />
            <span className="jg-cinematic-gift__bow-loop jg-cinematic-gift__bow-loop--bl" />
            <span className="jg-cinematic-gift__bow-loop jg-cinematic-gift__bow-loop--br" />
            <span className="jg-cinematic-gift__bow-knot" />
            <span className="jg-cinematic-gift__bow-tail jg-cinematic-gift__bow-tail--left" />
            <span className="jg-cinematic-gift__bow-tail jg-cinematic-gift__bow-tail--right" />
          </span>
        </div>
      ) : null}
    </div>
  );
}
