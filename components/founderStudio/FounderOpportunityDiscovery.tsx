"use client";

import { useCallback, useMemo, useState } from "react";

import { getOpportunityById } from "@/lib/opportunities";
import { getOpportunityCenterBootstrap } from "@/lib/founder/opportunityCenter";
import { FOUNDER_STUDIO_BASE } from "@/lib/founderStudio/founderConfig";

import { RoomHeader } from "./executive/RoomHeader";
import { OpportunityDetailView } from "./opportunities/OpportunityDetailView";
import { OpportunityOverview } from "./opportunities/OpportunityOverview";

export function FounderOpportunityDiscovery() {
  const overview = useMemo(() => getOpportunityCenterBootstrap(), []);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = selectedId ? getOpportunityById(selectedId) : undefined;

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedId(null);
  }, []);

  return (
    <div className="founder-opportunity">
      <RoomHeader
        backHref={FOUNDER_STUDIO_BASE}
        backLabel="← Back to the Office"
        eyebrow="Opportunity Discovery Center™"
        title="Turning Research into Business Opportunities"
        question="If this were my company, what would I build next?"
        purpose="Evidence-backed opportunities — not random ideas. One recommendation at a time."
      />

      {selected ? (
        <OpportunityDetailView opportunity={selected} onClose={handleClose} />
      ) : (
        <OpportunityOverview overview={overview} onSelect={handleSelect} />
      )}
    </div>
  );
}
