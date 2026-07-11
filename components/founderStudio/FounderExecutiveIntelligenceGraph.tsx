"use client";

import { useCallback, useMemo, useState } from "react";

import { composeGraphQuerySession, composeNodeExecutiveView } from "@/lib/executiveIntelligenceGraph";
import { getIntelligenceGraphCenterBootstrap } from "@/lib/founder/intelligenceGraphCenter";
import type { ExecutiveGraphSessionView } from "@/lib/executiveIntelligenceGraph/types";
import { FOUNDER_STUDIO_BASE } from "@/lib/founderStudio/founderConfig";

import { RoomHeader } from "./executive/RoomHeader";
import { GraphEntryZone } from "./intelligenceGraph/GraphEntryZone";
import { GraphExploreView } from "./intelligenceGraph/GraphExploreView";
import { GraphNodeDetail } from "./intelligenceGraph/GraphNodeDetail";

export function FounderExecutiveIntelligenceGraph() {
  const bootstrap = useMemo(() => getIntelligenceGraphCenterBootstrap(), []);
  const [query, setQuery] = useState("");
  const [session, setSession] = useState<ExecutiveGraphSessionView | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const runSearch = useCallback((phrase: string) => {
    const trimmed = phrase.trim();
    if (!trimmed) return;
    const result = composeGraphQuerySession(trimmed);
    if (result) {
      setSession(result);
      setQuery(trimmed);
      setSelectedNodeId(null);
    }
  }, []);

  const openNode = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
  }, []);

  const nodeView = useMemo(
    () => (selectedNodeId ? composeNodeExecutiveView(selectedNodeId) : null),
    [selectedNodeId],
  );

  return (
    <div className="founder-graph">
      <RoomHeader
        backHref={FOUNDER_STUDIO_BASE}
        backLabel="← Back to the Office"
        eyebrow="Executive Intelligence Graph"
        title="The Living Brain of Visual Spark Studios"
        question="How is everything connected?"
        purpose="Relationships — not folders. Every product, decision, and idea linked into executive intelligence."
      />

      {nodeView ? (
        <GraphNodeDetail
          detail={nodeView.detail}
          onBack={() => setSelectedNodeId(null)}
        />
      ) : session ? (
        <GraphExploreView
          session={session}
          onSelectNode={openNode}
          onClose={() => {
            setSession(null);
            setSelectedNodeId(null);
          }}
        />
      ) : (
        <GraphEntryZone
          query={query}
          onQueryChange={setQuery}
          onSubmit={() => runSearch(query)}
          suggestedSearches={bootstrap.suggestedSearches}
          ecosystemAreas={bootstrap.ecosystemAreas}
          featuredNodeId={bootstrap.featuredNodeId}
          onSelectSearch={(phrase) => runSearch(phrase)}
          onSelectNode={openNode}
        />
      )}
    </div>
  );
}
