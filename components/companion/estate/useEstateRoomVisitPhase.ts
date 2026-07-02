"use client";

import { useCallback, useEffect, useState } from "react";
import {
  isEstateArrivalActive,
  subscribeEstateArrivalComplete,
  subscribeEstateArrivalStart,
} from "@/lib/estate/estateArrivalSession";
import { prefersReducedMotion } from "@/lib/welcomeRoom/arrival";

/** Arrival Before Activity™ — visit phases for any estate room. */
export type EstateRoomVisitPhase =
  | "awaiting-arrival"
  | "invitation"
  | "conversation"
  | "activity";

export function useEstateRoomVisitPhase(
  roomId: string,
  opts?: { skipInvitation?: boolean },
) {
  const skipInvitation = opts?.skipInvitation ?? false;
  const [phase, setPhase] = useState<EstateRoomVisitPhase>(() => {
    if (skipInvitation) return "conversation";
    return isEstateArrivalActive() ? "awaiting-arrival" : "invitation";
  });

  useEffect(() => {
    if (skipInvitation) {
      setPhase("conversation");
      return;
    }

    if (prefersReducedMotion()) {
      setPhase("invitation");
      return;
    }

    const onStart = subscribeEstateArrivalStart((detail) => {
      if (detail.roomId === roomId) {
        setPhase("awaiting-arrival");
      }
    });

    const onComplete = subscribeEstateArrivalComplete((detail) => {
      if (detail.roomId === roomId) {
        setPhase("invitation");
      }
    });

    if (!isEstateArrivalActive()) {
      setPhase((current) =>
        current === "awaiting-arrival" ? "invitation" : current,
      );
    }

    return () => {
      onStart();
      onComplete();
    };
  }, [roomId, skipInvitation]);

  const openConversation = useCallback(() => {
    setPhase("conversation");
  }, []);

  const openActivity = useCallback(() => {
    setPhase("activity");
  }, []);

  return {
    phase,
    showInvitation: phase === "invitation",
    showConversation: phase === "conversation",
    showActivity: phase === "activity",
    openConversation,
    openActivity,
  };
}
