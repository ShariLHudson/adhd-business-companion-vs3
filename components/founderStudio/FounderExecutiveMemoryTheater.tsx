"use client";

import { useCallback, useMemo, useState } from "react";

import { composeMemoryReplaySession } from "@/lib/executiveMemoryTheater";
import { getMemoryTheaterCenterBootstrap } from "@/lib/founder/memoryTheaterCenter";
import type { MemoryTheaterSessionView } from "@/lib/executiveMemoryTheater/types";
import { FOUNDER_STUDIO_BASE } from "@/lib/founderStudio/founderConfig";

import { RoomHeader } from "./executive/RoomHeader";
import { MemoryReplayDetail } from "./memoryTheater/MemoryReplayDetail";
import { MemoryReplayOverview } from "./memoryTheater/MemoryReplayOverview";
import { MemoryTheaterEntry } from "./memoryTheater/MemoryTheaterEntry";

export function FounderExecutiveMemoryTheater() {
  const bootstrap = useMemo(() => getMemoryTheaterCenterBootstrap(), []);
  const [query, setQuery] = useState("");
  const [session, setSession] = useState<MemoryTheaterSessionView | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const runReplay = useCallback((phrase: string) => {
    const trimmed = phrase.trim();
    if (!trimmed) return;
    const result = composeMemoryReplaySession(trimmed);
    if (result) {
      setSession(result);
      setQuery(trimmed);
      setDetailOpen(false);
    }
  }, []);

  return (
    <div className="founder-memory-theater">
      <RoomHeader
        backHref={FOUNDER_STUDIO_BASE}
        backLabel="← Back to the Office"
        eyebrow="Executive Memory Theater"
        title="The Living History of Visual Spark Studios"
        question="What happened — and what did we learn?"
        purpose="Organizational memory transformed into executive wisdom. Replay decisions, launches, and journeys — not archives."
      />

      {session && detailOpen ? (
        <MemoryReplayDetail replay={session.replay} onBack={() => setDetailOpen(false)} />
      ) : session ? (
        <MemoryReplayOverview
          replay={session.replay}
          onOpenDetail={() => setDetailOpen(true)}
          onClose={() => {
            setSession(null);
            setDetailOpen(false);
          }}
        />
      ) : (
        <MemoryTheaterEntry
          query={query}
          onQueryChange={setQuery}
          onSubmit={() => runReplay(query)}
          entryPoints={bootstrap.entryPoints}
          neverAgainLibrary={bootstrap.neverAgainLibrary}
          doThisAgainLibrary={bootstrap.doThisAgainLibrary}
          onSelectEntry={(phrase) => runReplay(phrase)}
        />
      )}
    </div>
  );
}
