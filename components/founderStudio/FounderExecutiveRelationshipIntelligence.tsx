"use client";

import { useCallback, useMemo, useState } from "react";

import { composeDiscoverySession, composeDiscoveryDetail } from "@/lib/executiveRelationshipIntelligence";
import { getRelationshipIntelligenceCenterBootstrap } from "@/lib/founder/relationshipIntelligenceCenter";
import { relationshipIntelligenceSampleRepository } from "@/lib/executiveRelationshipIntelligence/repositories/sample";
import type { RelationshipIntelligenceSessionView } from "@/lib/executiveRelationshipIntelligence/types";
import { FOUNDER_STUDIO_BASE } from "@/lib/founderStudio/founderConfig";

import { RoomHeader } from "./executive/RoomHeader";
import { DiscoveryDetailPanel } from "./relationshipIntelligence/DiscoveryDetailPanel";
import { DiscoveryEntryZone } from "./relationshipIntelligence/DiscoveryEntryZone";
import { DiscoveryOverview } from "./relationshipIntelligence/DiscoveryOverview";

export function FounderExecutiveRelationshipIntelligence() {
  const bootstrap = useMemo(() => getRelationshipIntelligenceCenterBootstrap(), []);
  const [query, setQuery] = useState("");
  const [session, setSession] = useState<RelationshipIntelligenceSessionView | null>(null);
  const [selectedDiscoveryId, setSelectedDiscoveryId] = useState<string | null>(null);

  const runDiscovery = useCallback((phrase: string) => {
    const result = composeDiscoverySession(phrase);
    if (result) {
      setSession(result);
      setQuery(phrase);
      setSelectedDiscoveryId(null);
    }
  }, []);

  const detailView = useMemo(
    () => (selectedDiscoveryId ? composeDiscoveryDetail(selectedDiscoveryId) : null),
    [selectedDiscoveryId],
  );

  const alertCount = relationshipIntelligenceSampleRepository.alerts().length;

  return (
    <div className="founder-relationship-intel">
      <RoomHeader
        backHref={FOUNDER_STUDIO_BASE}
        backLabel="← Back to the Office"
        eyebrow="Executive Relationship Intelligence™"
        title="The Discovery Engine That Creates New Knowledge"
        question="What might we be missing?"
        purpose="Founder discovers hidden patterns and relationships — creating knowledge, not just finding information."
      />

      {detailView ? (
        <DiscoveryDetailPanel view={detailView} onBack={() => setSelectedDiscoveryId(null)} />
      ) : session ? (
        <DiscoveryOverview
          session={session}
          onSelectDiscovery={setSelectedDiscoveryId}
          onClose={() => {
            setSession(null);
            setSelectedDiscoveryId(null);
          }}
        />
      ) : (
        <DiscoveryEntryZone
          query={query}
          onQueryChange={setQuery}
          onSubmit={() => runDiscovery(query || "What might we be missing?")}
          onDiscoverAll={() => runDiscovery("")}
          discoveryCount={bootstrap.discoveryCount}
          alertCount={alertCount}
        />
      )}
    </div>
  );
}
