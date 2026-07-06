"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  archiveStrategySession,
  duplicateStrategySession,
  getStrategyCenterBootstrap,
} from "@/lib/founder/strategyCenter/services";
import type {
  StrategySession,
  StrategySessionMeta,
  StrategyToolId,
} from "@/lib/founder/strategyCenter/types";
import { FOUNDER_STUDIO_BASE } from "@/lib/founderStudio/founderConfig";

import { RoomHeader } from "./executive/RoomHeader";
import { BoardOfDirectors } from "./strategy/BoardOfDirectors";
import { DecisionSummaryPanel } from "./strategy/DecisionSummaryPanel";
import { EstateThinkingRow } from "./strategy/EstateThinkingRow";
import { ExecutivePerspectivesRow } from "./strategy/ExecutivePerspectivesRow";
import { ExecutiveQuestionZone } from "./strategy/ExecutiveQuestionZone";
import { MeetingNotebook } from "./strategy/MeetingNotebook";
import { SessionActions } from "./strategy/SessionActions";
import { StrategyToolbar } from "./strategy/StrategyToolbar";
import { VisualThinkingCanvas } from "./strategy/VisualThinkingCanvas";

const CURRENT_SESSION_KEY = "founder-strategy-current";
const SAVED_SESSIONS_KEY = "founder-strategy-saved";
const SAVED_SESSION_LIBRARY_KEY = "founder-strategy-library";

function readStoredSession(): StrategySession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CURRENT_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StrategySession;
  } catch {
    return null;
  }
}

function readSessionLibrary(): Record<string, StrategySession> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SAVED_SESSION_LIBRARY_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, StrategySession>;
  } catch {
    return {};
  }
}

function writeSessionLibrary(library: Record<string, StrategySession>) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SAVED_SESSION_LIBRARY_KEY, JSON.stringify(library));
  }
}

function readSavedSessions(fallback: StrategySessionMeta[]): StrategySessionMeta[] {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(SAVED_SESSIONS_KEY);
    if (!raw) return fallback;
    return JSON.parse(raw) as StrategySessionMeta[];
  } catch {
    return fallback;
  }
}

export function FounderExecutiveStrategy() {
  const bootstrap = useMemo(() => getStrategyCenterBootstrap(), []);
  const [session, setSession] = useState<StrategySession>(bootstrap.defaultSession);
  const [savedSessions, setSavedSessions] = useState<StrategySessionMeta[]>(
    bootstrap.savedSessions,
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStoredSession();
    if (stored) setSession(stored);
    setSavedSessions(readSavedSessions(bootstrap.savedSessions));
    setHydrated(true);
  }, [bootstrap.savedSessions]);

  const persistSession = useCallback((next: StrategySession) => {
    const stamped = { ...next, updatedAt: new Date().toISOString() };
    setSession(stamped);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(stamped));
    }
    return stamped;
  }, []);

  const flashStatus = (message: string) => {
    setStatusMessage(message);
    window.setTimeout(() => setStatusMessage(null), 3200);
  };

  const handleSaveSession = () => {
    const stamped = persistSession(session);
    const meta: StrategySessionMeta = {
      id: stamped.id,
      title: stamped.title,
      updatedAt: stamped.updatedAt,
      archived: stamped.archived,
    };
    const nextSaved = [
      meta,
      ...savedSessions.filter((item) => item.id !== meta.id),
    ].slice(0, 12);
    setSavedSessions(nextSaved);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SAVED_SESSIONS_KEY, JSON.stringify(nextSaved));
      const library = readSessionLibrary();
      library[stamped.id] = stamped;
      writeSessionLibrary(library);
    }
    flashStatus("Strategy session saved on this device.");
  };

  const handleDuplicate = () => {
    const copy = duplicateStrategySession(session);
    persistSession(copy);
    flashStatus("Session duplicated — continue thinking in the copy.");
  };

  const handleArchive = () => {
    const archived = archiveStrategySession(session);
    persistSession(archived);
    const meta: StrategySessionMeta = {
      id: archived.id,
      title: archived.title,
      updatedAt: archived.updatedAt,
      archived: true,
    };
    const nextSaved = [
      meta,
      ...savedSessions.filter((item) => item.id !== meta.id),
    ];
    setSavedSessions(nextSaved);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SAVED_SESSIONS_KEY, JSON.stringify(nextSaved));
      const library = readSessionLibrary();
      library[archived.id] = archived;
      writeSessionLibrary(library);
    }
    flashStatus("Session archived locally.");
  };

  const handleResume = (id: string) => {
    if (id === session.id) {
      flashStatus("You are already in this session.");
      return;
    }
    const library = readSessionLibrary();
    const saved = library[id];
    if (!saved) {
      flashStatus("Resume placeholder — save this session first to restore it.");
      return;
    }
    persistSession(saved);
    flashStatus(`Resumed "${saved.title}".`);
  };

  const handleSaveDecision = () => {
    persistSession(session);
    flashStatus("Decision summary saved.");
  };

  if (!hydrated) {
    return (
      <div className="founder-strategy founder-strategy--loading" aria-busy="true">
        <RoomHeader
          backHref={FOUNDER_STUDIO_BASE}
          backLabel="← Back to the Office"
          eyebrow="Executive Strategy Center™"
          title="Executive Strategy Center"
          question="What deserves your clearest thinking?"
          purpose="A strategy room for decisions, ideas, and long-view leadership — not execution."
        />
      </div>
    );
  }

  return (
    <div className="founder-strategy">
      <RoomHeader
        backHref={FOUNDER_STUDIO_BASE}
        backLabel="← Back to the Office"
        eyebrow="Executive Strategy Center™"
        title="Executive Strategy Center"
        question="What deserves your clearest thinking?"
        purpose="A strategy room for decisions, ideas, and long-view leadership — not execution."
      />

      <StrategyToolbar
        tools={bootstrap.tools}
        activeToolId={session.activeToolId}
        onSelectTool={(id: StrategyToolId) =>
          persistSession({ ...session, activeToolId: id })
        }
      />

      <EstateThinkingRow places={bootstrap.estatePlaces} />

      <ExecutiveQuestionZone
        question={session.executiveQuestion}
        onChange={(executiveQuestion) => persistSession({ ...session, executiveQuestion })}
      />

      <div className="founder-strategy__workspace">
        <VisualThinkingCanvas
          cards={session.ideaCards}
          onCardsChange={(ideaCards) => persistSession({ ...session, ideaCards })}
        />
        <DecisionSummaryPanel
          decision={session.decision}
          onChange={(decision) => persistSession({ ...session, decision })}
          onSave={handleSaveDecision}
          onArchive={handleArchive}
        />
      </div>

      <ExecutivePerspectivesRow perspectives={bootstrap.perspectives} />

      <BoardOfDirectors members={bootstrap.boardMembers} />

      <div className="founder-strategy__lower">
        <MeetingNotebook
          notes={session.notes}
          onChange={(notes) => persistSession({ ...session, notes })}
        />
        <SessionActions
          savedSessions={savedSessions}
          sessionTitle={session.title}
          onTitleChange={(title) => persistSession({ ...session, title })}
          onSave={handleSaveSession}
          onResume={handleResume}
          onDuplicate={handleDuplicate}
          onArchive={handleArchive}
          statusMessage={statusMessage}
        />
      </div>
    </div>
  );
}
