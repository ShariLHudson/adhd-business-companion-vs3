"use client";

import type { CSSProperties, ReactNode } from "react";

import { journalCoverImageUrl, journalCoverTitle } from "@/lib/journalGazebo/coverArt";
import {
  JOURNAL_GIFT_WRAPPED_PACKAGE_URL,
  JOURNAL_GIFT_WRAPPING_PAPER_URL,
} from "@/lib/journalGazebo/giftAssets";
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
  | "opening"
  | "complete";

type Props = {
  config: JournalGazeboConfig;
  moment: GiftUnwrapMoment;
  /** 0–1 ribbon pull progress — moves the physical ribbon tail. */
  ribbonPull?: number;
  /** Optional interactive overlay (ribbon drag handle, click target). */
  interaction?: ReactNode;
  className?: string;
  onJournalActivate?: () => void;
};

const wrapPaperStyle = {
  backgroundImage: `url(${JOURNAL_GIFT_WRAPPING_PAPER_URL})`,
} as const;

/**
 * Physical portrait journal gift — layered objects only.
 * Journal under wrap under ribbon under soft package photo.
 * Moments change material pose — they never mount/unmount the gift.
 */
export function JournalGazeboWrappedGift({
  config,
  moment,
  ribbonPull = 0,
  interaction,
  className = "",
  onJournalActivate,
}: Props) {
  const title = journalCoverTitle(config);
  const coverImage = journalCoverImageUrl(config);
  const pull = Math.max(0, Math.min(1, ribbonPull));

  const journalRevealed =
    moment === "reveal" ||
    moment === "admire" ||
    moment === "opening" ||
    moment === "complete";

  const wrapSettledAway =
    moment === "admire" || moment === "opening" || moment === "complete";

  const interactive =
    moment === "wrapped" ||
    moment === "ribbon-pull" ||
    moment === "admire" ||
    moment === "opening";

  return (
    <div
      className={[
        "jg-cinematic-gift",
        "jg-cinematic-gift--journal-shape",
        "jg-cinematic-gift--physical",
        "jg-cinematic-gift--layered",
        `jg-cinematic-gift--${moment}`,
        journalRevealed ? "jg-cinematic-gift--journal-visible" : "",
        moment === "unwrap" || moment === "reveal" || journalRevealed
          ? "jg-cinematic-gift--unwrap"
          : "",
        moment === "bow" ? "jg-cinematic-gift--bow-loose" : "",
        moment === "ribbon-pull" ? "jg-cinematic-gift--ribbon-pull" : "",
        moment === "ribbon" ||
        moment === "unwrap" ||
        moment === "reveal" ||
        journalRevealed
          ? "jg-cinematic-gift--ribbon-loose"
          : "",
        wrapSettledAway ? "jg-cinematic-gift--wrap-away" : "",
        moment === "admire" || moment === "opening" || moment === "complete"
          ? "jg-cinematic-gift--journal-grow"
          : "",
        moment === "opening" ? "jg-cinematic-gift--opening" : "",
        moment === "crafted" || moment === "wrapping"
          ? "jg-cinematic-gift--crafted"
          : "",
        moment === "wrapping" ? "jg-cinematic-gift--wrapping-on" : "",
        interactive ? "jg-cinematic-gift--interactive" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          "--jg-gift-wrap-paper": `url(${JOURNAL_GIFT_WRAPPING_PAPER_URL})`,
          "--jg-ribbon-pull": String(pull),
        } as CSSProperties
      }
      data-leather={config.leatherColor}
      data-gift-moment={moment}
      data-testid="journal-physical-gift"
    >
      <span className="jg-cinematic-gift__desk-shadow" aria-hidden="true" />

      {/* Layer 1 — journal always present under the wrap */}
      <div
        className="jg-cinematic-gift__journal"
        data-testid="journal-reveal-cover"
        data-leather={config.leatherColor}
      >
        <span className="jg-cinematic-gift__journal-shadow" aria-hidden="true" />
        <span className="jg-cinematic-gift__journal-spine" aria-hidden="true" />
        <span className="jg-cinematic-gift__journal-page-edge" aria-hidden="true">
          <span className="jg-cinematic-gift__journal-page-sheet jg-cinematic-gift__journal-page-sheet--4" />
          <span className="jg-cinematic-gift__journal-page-sheet jg-cinematic-gift__journal-page-sheet--3" />
          <span className="jg-cinematic-gift__journal-page-sheet jg-cinematic-gift__journal-page-sheet--2" />
          <span className="jg-cinematic-gift__journal-page-sheet jg-cinematic-gift__journal-page-sheet--1" />
        </span>
        <div
          className={[
            "jg-cinematic-gift__journal-cover",
            coverImage ? "jg-cinematic-gift__journal-cover--printed" : "",
            moment === "admire" ? "jg-cinematic-gift__journal-cover--clickable" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          role={moment === "admire" ? "button" : undefined}
          tabIndex={moment === "admire" ? 0 : undefined}
          aria-label={moment === "admire" ? `Open ${title}` : undefined}
          data-testid={moment === "admire" ? "journal-reveal-open-journal" : undefined}
          onClick={() => {
            if (moment === "admire") onJournalActivate?.();
          }}
          onKeyDown={(e) => {
            if (moment !== "admire") return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onJournalActivate?.();
            }
          }}
        >
          {coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- preloaded estate plate
            <img
              src={coverImage}
              alt=""
              className="jg-cinematic-gift__journal-cover-img"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              aria-hidden
            />
          ) : (
            <span className="jg-cinematic-gift__leather-texture" />
          )}
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
        </div>
      </div>

      {/* Layer 2 — wrapping paper + flaps (always mounted; pose via CSS) */}
      <div className="jg-cinematic-gift__wrap" aria-hidden="true">
        <span
          className="jg-cinematic-gift__paper jg-cinematic-gift__paper--front"
          style={wrapPaperStyle}
        >
          <span className="jg-cinematic-gift__paper-sheen" />
        </span>
        <span
          className="jg-cinematic-gift__flap jg-cinematic-gift__flap--top"
          style={wrapPaperStyle}
        />
        <span
          className="jg-cinematic-gift__flap jg-cinematic-gift__flap--right"
          style={wrapPaperStyle}
        />
        <span
          className="jg-cinematic-gift__flap jg-cinematic-gift__flap--left"
          style={wrapPaperStyle}
        />
        <span
          className="jg-cinematic-gift__flap jg-cinematic-gift__flap--bottom"
          style={wrapPaperStyle}
        />

        {/* Layer 3 — ribbon + bow */}
        <span className="jg-cinematic-gift__ribbon jg-cinematic-gift__ribbon--h" />
        <span className="jg-cinematic-gift__ribbon jg-cinematic-gift__ribbon--v" />
        <span className="jg-cinematic-gift__ribbon-tail jg-cinematic-gift__ribbon-tail--right" />

        <span className="jg-cinematic-gift__bow">
          <span className="jg-cinematic-gift__bow-loop jg-cinematic-gift__bow-loop--tl" />
          <span className="jg-cinematic-gift__bow-loop jg-cinematic-gift__bow-loop--tr" />
          <span className="jg-cinematic-gift__bow-loop jg-cinematic-gift__bow-loop--bl" />
          <span className="jg-cinematic-gift__bow-loop jg-cinematic-gift__bow-loop--br" />
          <span className="jg-cinematic-gift__bow-knot" />
          <span className="jg-cinematic-gift__bow-tail jg-cinematic-gift__bow-tail--left" />
          <span className="jg-cinematic-gift__bow-tail jg-cinematic-gift__bow-tail--right" />
          <span className="jg-cinematic-gift__wax-seal">
            <span className="jg-cinematic-gift__wax-flame jg-estate-flame" />
          </span>
        </span>

        <span className="jg-cinematic-gift__gift-tag">
          <span className="jg-cinematic-gift__gift-tag-flame jg-estate-flame" />
          <span className="jg-cinematic-gift__gift-tag-label">For You</span>
        </span>
      </div>

      {/* Layer 4 — soft package photo overlay (fades; never a hard cut) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={JOURNAL_GIFT_WRAPPED_PACKAGE_URL}
        alt=""
        className={[
          "jg-cinematic-gift__package-photo",
          moment === "ribbon-pull" ? "jg-cinematic-gift__package-photo--unwrapping" : "",
          moment === "bow" || moment === "ribbon"
            ? "jg-cinematic-gift__package-photo--peeling"
            : "",
          moment === "unwrap" ||
          moment === "reveal" ||
          journalRevealed
            ? "jg-cinematic-gift__package-photo--gone"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
        draggable={false}
      />

      {interaction}
    </div>
  );
}
