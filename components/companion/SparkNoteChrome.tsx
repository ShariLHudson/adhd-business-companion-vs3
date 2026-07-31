"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { resolveDailySparkCard } from "@/lib/sparkNote/sparkCardVisualDesignAndDailyGeneration";
import {
  dismissHomeTeaserToday,
  isHomeTeaserDismissedToday,
} from "@/lib/sparkNote/persistence";
import type { RegionCode } from "@/lib/companionLanguage";
import type { PersonalDate } from "@/lib/recognition/types";
import { SparkNoteAnchor } from "./SparkNoteAnchor";
import { TodaysSparkGiftRoom } from "./TodaysSparkGiftRoom";
import { SparkNoteExpanded } from "./SparkNoteExpanded";

type Props = {
  visible: boolean;
  /** Accepted for compatibility; the teaser is Estate-wide. */
  isWelcomeHome?: boolean;
  firstName?: string | null;
  birthday?: { month: number; day: number } | null;
  personalDates?: PersonalDate[];
  memberSinceIso?: string | null;
  region?: RegionCode;
  /** Accepted for compatibility; not used (teaser opens the gift room). */
  onOpenTodaysSpark?: () => void;
};

/**
 * Today's Spark flow:
 *   small Estate-wide teaser  →  gift room (daily-arrival)  →  full Spark Card.
 *
 * The full card is the exact pinned daily Spark (resolveDailySparkCard returns
 * the day's stored pick — no swap/regeneration) rendered by the existing
 * SparkNoteExpanded (correct image, complete content, durable Save This Spark).
 * Closing the card returns to the gift room. The small teaser stays visible
 * until the full card has opened successfully, then is dismissed for the day.
 */
export function SparkNoteChrome({
  visible,
  firstName,
  birthday,
  personalDates,
  memberSinceIso,
  region,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [giftRoomOpen, setGiftRoomOpen] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const [teaserDismissed, setTeaserDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTeaserDismissed(isHomeTeaserDismissedToday());
  }, []);

  // Dismiss the small teaser ONLY after the full Spark Card has opened.
  useEffect(() => {
    if (cardOpen) {
      dismissHomeTeaserToday();
      setTeaserDismissed(true);
    }
  }, [cardOpen]);

  // Anchor the teaser above the chat composer (published as --spark-teaser-bottom).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const GAP = 20;
    const CHAT_SELECTOR = '[data-companion-chat-layer="true"]';
    let raf = 0;
    let tries = 0;
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => measure())
        : null;

    function measure() {
      const chat = document.querySelector<HTMLElement>(CHAT_SELECTOR);
      let bottomPx = 24;
      if (chat) {
        const rect = chat.getBoundingClientRect();
        if (rect.height > 0) {
          bottomPx = Math.max(24, window.innerHeight - rect.top + GAP);
        }
      }
      document.documentElement.style.setProperty(
        "--spark-teaser-bottom",
        `${bottomPx}px`,
      );
    }

    function attach() {
      measure();
      const chat = document.querySelector(CHAT_SELECTOR);
      if (chat) {
        ro?.observe(chat);
      } else if (tries++ < 40) {
        raf = requestAnimationFrame(attach);
      }
    }

    attach();
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener("resize", measure);
      document.documentElement.style.removeProperty("--spark-teaser-bottom");
    };
  }, []);

  const { card } = useMemo(
    () =>
      resolveDailySparkCard({
        firstName,
        birthday,
        personalDates,
        memberSinceIso,
        region,
      }),
    [firstName, birthday, personalDates, memberSinceIso, region],
  );

  if (!mounted) return null;
  const showTeaser = visible && Boolean(card) && !teaserDismissed;

  return createPortal(
    <>
      {showTeaser ? (
        <SparkNoteAnchor card={card} onExpand={() => setGiftRoomOpen(true)} />
      ) : null}
      {giftRoomOpen ? (
        <TodaysSparkGiftRoom
          onClose={() => setGiftRoomOpen(false)}
          onGiftClick={() => setCardOpen(true)}
        />
      ) : null}
      {cardOpen && card ? (
        // Full pinned daily Spark Card (existing component): correct image +
        // complete content + durable Save. Close returns to the gift room.
        <SparkNoteExpanded
          card={card}
          onClose={() => setCardOpen(false)}
          onOpenCollection={() => setCardOpen(false)}
        />
      ) : null}
    </>,
    document.body,
  );
}
