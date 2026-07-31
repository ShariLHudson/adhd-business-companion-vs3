"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { resolveDailySparkCard } from "@/lib/sparkNote/sparkCardVisualDesignAndDailyGeneration";
import type { RegionCode } from "@/lib/companionLanguage";
import type { PersonalDate } from "@/lib/recognition/types";
import { SparkNoteAnchor } from "./SparkNoteAnchor";
import { TodaysSparkGiftRoom } from "./TodaysSparkGiftRoom";

type Props = {
  visible: boolean;
  /** Accepted for compatibility; not used this slice (teaser is Estate-wide). */
  isWelcomeHome?: boolean;
  firstName?: string | null;
  birthday?: { month: number; day: number } | null;
  personalDates?: PersonalDate[];
  memberSinceIso?: string | null;
  region?: RegionCode;
  /** Accepted for compatibility; intentionally NOT invoked this slice. */
  onOpenTodaysSpark?: () => void;
};

/**
 * Today's Spark teaser — size/placement correction slice.
 *
 * Renders ONE small (~88px) bottom-right teaser across Estate screens. For this
 * slice it is deliberately never dismissed (so size/placement can be retested)
 * and clicking is a no-op test log — it does NOT route to the old Spark Card,
 * Personal Library, or the gift room. Routing/dismissal return in a later slice.
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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Anchor the teaser above the chat composer (bottom-center layer), not the
  // raw viewport bottom, so it never overlaps the chat input / mic / Send.
  // Publishes --spark-teaser-bottom = (distance from viewport bottom to the
  // composer's top) + gap, and re-measures when the composer resizes.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const GAP = 20; // ~16-24px clear gap above the composer
    const CHAT_SELECTOR = '[data-companion-chat-layer="true"]';
    let raf = 0;
    let tries = 0;
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => measure())
        : null;

    function measure() {
      const chat = document.querySelector<HTMLElement>(CHAT_SELECTOR);
      // Fallback: a small safe gap from the viewport bottom.
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
      measure(); // always set the variable immediately (measured or fallback)
      const chat = document.querySelector(CHAT_SELECTOR);
      if (chat) {
        ro?.observe(chat);
      } else if (tries++ < 40) {
        raf = requestAnimationFrame(attach); // wait for the composer to mount
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

  // Estate-wide; the teaser is NOT dismissed in this slice (still testing).
  if (!mounted) return null;
  const showTeaser = visible && Boolean(card);

  return createPortal(
    <>
      {showTeaser ? (
        <SparkNoteAnchor card={card} onExpand={() => setGiftRoomOpen(true)} />
      ) : null}
      {giftRoomOpen ? (
        // Clicking the teaser opens the approved gift room (daily-arrival) —
        // NOT the old Spark Card and NOT the dashboard Personal Library room.
        // The gift click is a no-op test event this slice (full card deferred).
        <TodaysSparkGiftRoom onClose={() => setGiftRoomOpen(false)} />
      ) : null}
    </>,
    document.body,
  );
}
