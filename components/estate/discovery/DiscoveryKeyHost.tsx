"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AppSection } from "@/lib/companionUi";
import {
  buildDiscoveryMemberContextFromEstateMemory,
  completeDiscoveryKeySession,
  evaluateDiscoveryKeySession,
  getDefaultDiscoveryHistoryStore,
  markDiscoveryKeyOpened,
  markDiscoveryKeyShown,
  recordDiscoveryIgnored,
} from "@/lib/estateDiscovery";
import {
  DISCOVERY_IGNORE_WINDOW_MS,
  shouldRecordSilentIgnore,
} from "@/lib/estateDiscovery/discoveryHistoryPolicy";
import type { DiscoveryHistoryStore } from "@/lib/estateDiscovery/types";
import type { DiscoveryKeySessionState } from "@/lib/estateDiscovery/discoveryKeySystem";
import type { DiscoveryMemberContext } from "@/lib/estateDiscovery/types";
import { DiscoveryKey } from "./DiscoveryKey";
import { DiscoveryNote } from "./DiscoveryNote";

type DiscoveryKeyHostProps = {
  roomId: string;
  memberId: string;
  memberContext: DiscoveryMemberContext;
  enabled?: boolean;
  /** Preview harness only — forces a canned session without touching saved history. */
  previewForcedSession?: DiscoveryKeySessionState | null;
  previewHistoryStore?: DiscoveryHistoryStore;
  onNavigateSection: (section: AppSection) => void;
  /** Spark speaks this in conversation when a Discovery primary button is tapped. */
  onCompanionResponse?: (message: string, discoveryId: string) => void;
};

export function DiscoveryKeyHost({
  roomId,
  memberId,
  memberContext,
  enabled = true,
  previewForcedSession = null,
  previewHistoryStore,
  onNavigateSection,
  onCompanionResponse,
}: DiscoveryKeyHostProps) {
  const [sessionState, setSessionState] = useState<DiscoveryKeySessionState | null>(
    null,
  );
  const [sessionConsumed, setSessionConsumed] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const shownDiscoveryRef = useRef<string | null>(null);
  const historyStore = useMemo(
    () => previewHistoryStore ?? getDefaultDiscoveryHistoryStore(),
    [previewHistoryStore],
  );

  const context = useMemo(
    () => buildDiscoveryMemberContextFromEstateMemory(memberContext),
    [memberContext],
  );

  useEffect(() => {
    setSessionConsumed(false);
    setNoteOpen(false);
    setUnlocking(false);
    shownDiscoveryRef.current = null;
  }, [roomId]);

  useEffect(() => {
    if (!enabled || sessionConsumed || noteOpen) {
      if (!enabled || sessionConsumed) {
        setSessionState(null);
      }
      return;
    }

    if (previewForcedSession) {
      setSessionState(previewForcedSession);
      return;
    }

    const next = evaluateDiscoveryKeySession({
      memberId,
      currentRoomId: roomId,
      memberContext: context,
      historyStore,
    });
    setSessionState(next);
  }, [
    enabled,
    sessionConsumed,
    noteOpen,
    memberId,
    roomId,
    context,
    historyStore,
    previewForcedSession,
  ]);

  useEffect(() => {
    if (!sessionState || !enabled) return;
    const { session } = sessionState;
    const { discoveryId } = session;
    if (shownDiscoveryRef.current === discoveryId) return;

    if (!previewForcedSession) {
      markDiscoveryKeyShown(memberId, session);
    }
    shownDiscoveryRef.current = discoveryId;
  }, [sessionState, enabled, memberId, previewForcedSession]);

  const finishSession = useCallback(
    (outcome: "completed" | "saved" | "ignored" | "destination_visited") => {
      if (!sessionState) return;

      completeDiscoveryKeySession({
        memberId,
        discoveryId: sessionState.session.discoveryId,
        outcome,
        context: {
          roomWhereShown: sessionState.session.placementRoomId,
          placementLocation: sessionState.session.placement.locationId,
          destinationRoute:
            sessionState.session.selection.destinationRoute ?? undefined,
        },
        historyStore,
      });

      setNoteOpen(false);
      setUnlocking(false);
      setSessionState(null);
      setSessionConsumed(true);
    },
    [memberId, sessionState, historyStore],
  );

  const recordSilentIgnoreIfDue = useCallback(() => {
    if (!sessionState || noteOpen) return;

    const entry = historyStore.get(memberId, sessionState.session.discoveryId);
    if (!shouldRecordSilentIgnore(entry)) return;

    recordDiscoveryIgnored(
      historyStore,
      memberId,
      sessionState.session.discoveryId,
      {
        roomWhereShown: sessionState.session.placementRoomId,
        placementLocation: sessionState.session.placement.locationId,
        destinationRoute:
          sessionState.session.selection.destinationRoute ?? undefined,
      },
    );

    setSessionState(null);
    setSessionConsumed(true);
  }, [historyStore, memberId, noteOpen, sessionState]);

  useEffect(() => {
    if (!sessionState || !enabled || noteOpen || sessionConsumed) return;

    const timer = window.setTimeout(
      recordSilentIgnoreIfDue,
      DISCOVERY_IGNORE_WINDOW_MS,
    );

    return () => {
      window.clearTimeout(timer);
      recordSilentIgnoreIfDue();
    };
  }, [
    enabled,
    noteOpen,
    recordSilentIgnoreIfDue,
    sessionConsumed,
    sessionState,
  ]);

  const handleKeyClick = useCallback(() => {
    if (!sessionState) return;

    setUnlocking(true);
    markDiscoveryKeyOpened(memberId, sessionState.session);

    window.setTimeout(() => {
      setNoteOpen(true);
      setUnlocking(false);
    }, 420);
  }, [memberId, sessionState]);

  const handlePrimaryAction = useCallback(() => {
    if (!sessionState) return;

    const companionLine = sessionState.session.selection.companionResponse?.trim();
    if (companionLine && onCompanionResponse) {
      onCompanionResponse(companionLine, sessionState.session.discoveryId);
    }

    const section = sessionState.session.selection.destinationSection;
    if (section) {
      onNavigateSection(section);
      finishSession("destination_visited");
      return;
    }

    finishSession("completed");
  }, [finishSession, onCompanionResponse, onNavigateSection, sessionState]);

  const handleSaveForLater = useCallback(() => {
    finishSession("saved");
  }, [finishSession]);

  const handleClose = useCallback(() => {
    finishSession("completed");
  }, [finishSession]);

  if (!enabled || !sessionState || sessionConsumed) {
    return noteOpen && sessionState ? (
      <DiscoveryNote
        data={sessionState.noteData}
        open={noteOpen}
        unlocking
        onPrimaryAction={handlePrimaryAction}
        onSaveForLater={handleSaveForLater}
        onClose={handleClose}
      />
    ) : null;
  }

  return (
    <>
      <div
        className="discovery-key-host fixed inset-0 z-[9] pointer-events-none"
        aria-hidden={noteOpen}
      >
        <div className="pointer-events-auto relative h-full w-full">
          <DiscoveryKey
            placement={sessionState.session.placement}
            onClick={handleKeyClick}
            unlocking={unlocking}
          />
        </div>
      </div>
      <DiscoveryNote
        data={sessionState.noteData}
        open={noteOpen}
        unlocking={noteOpen}
        onPrimaryAction={handlePrimaryAction}
        onSaveForLater={handleSaveForLater}
        onClose={handleClose}
      />
    </>
  );
}
